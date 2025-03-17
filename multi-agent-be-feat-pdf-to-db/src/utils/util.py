import pdfplumber
import pandas as pd
from werkzeug.utils import secure_filename
import os
from database.models import Document, Quotation
from database import db
import uuid
from langchain_groq import ChatGroq
from pydantic import BaseModel, Field
import time
from flask import current_app


def extract_pdf_content(pdf_file):
    """Extract all text content from PDF including tables"""
    full_text = []
    
    with pdfplumber.open(pdf_file) as pdf:
        for page in pdf.pages:
            text = page.extract_text() or ""
            if text:
                full_text.append(text)
            
            tables = page.extract_tables()
            for table in tables:
                df = pd.DataFrame(table[1:], columns=table[0])
                table_text = df.to_string(index=False)
                full_text.append(table_text)
    
    return '\n\n'.join(full_text)

def extract_text_tables(pdf_file):
    with pdfplumber.open(pdf_file) as pdf:
        full_content = []
        for page in pdf.pages:
            text = page.extract_text() or ""
            if text:
                full_content.append({"type": "text", "content": text})
            
            tables = page.extract_tables()
            for table in tables:
                df = pd.DataFrame(table[1:], columns=table[0])
                full_content.append({"type": "table", "content": df})
        
        return full_content

def chunk_text(text, chunk_size=4000):
    """Split text into chunks of specified size"""
    chunks = []
    current_chunk = ""
    current_size = 0
    
    for line in text.split('\n'):
        line_size = len(line)
        if current_size + line_size > chunk_size:
            chunks.append(current_chunk)
            current_chunk = line
            current_size = line_size
        else:
            current_chunk += '\n' + line if current_chunk else line
            current_size += line_size
    
    if current_chunk:
        chunks.append(current_chunk)
    
    return chunks

class CompanyNames(BaseModel):
    """Schema for company name extraction"""
    company_name_from: str = Field(description="Name of the company that has sent the document")
    company_name_to: str = Field(description="Name of the company that has received the document")

def setup_extraction_chain():
    """Setup the extraction chain with the LLM"""
    
    llm = ChatGroq(
        model_name="mixtral-8x7b-32768",
        temperature=0,
        max_tokens=1000,
        groq_api_key=current_app.config['GROQ_API_KEY_V1']
    )
    
    # Use the new structured output approach
    chain = llm.with_structured_output(CompanyNames)
    return chain


def extract_company_names(text):
    """Extract company names using the extraction chain with chunking"""
    try:
        chain = setup_extraction_chain()
        chunks = chunk_text(text)
        
        all_results = []
        for chunk in chunks:
            try:
                time.sleep(1)  # Rate limiting
                # Use invoke instead of run
                output = chain.invoke(chunk)
                if output:
                    all_results.append(output)
                    
                    # If we found company names, we can stop processing chunks
                    if output.company_name_from and output.company_name_to:
                        break
                        
            except Exception as chunk_error:
                print(f"Error processing chunk: {str(chunk_error)}")
                continue
        
        # Process results
        if all_results:
            for result in all_results:
                if isinstance(result, CompanyNames):
                    company_from = result.company_name_from
                    company_to = result.company_name_to
                    if company_from and company_to:
                        return company_from, company_to
        
        return "Unknown Company", "Unknown Company"
        
    except Exception as e:
        print("Error extracting company names: {str(e)}")
        return "Unknown Company", "Unknown Company"

def save_document(file, category):
    os.makedirs('uploads', exist_ok=True)
    filename = secure_filename(file.filename)
    file_path = os.path.join('uploads', filename)
    file.save(file_path)
    
    try:
        # Extract text and company names
        file_text = extract_pdf_content(file_path)
        company_from, company_to = extract_company_names(file_text)
        
        # Save to documents table
        document = Document(
            category=category,
            company_to=company_to,
            company_from=company_from,
            file_name=filename,
            file_text=file_text
        )
        db.session.add(document)
        
        # Save to quotations table
        content_sections = extract_text_tables(file_path)
        group_id = uuid.uuid4()
        
        for sequence_number, section in enumerate(content_sections):
            quotation = Quotation(
                group_id=group_id,
                sequence_number=sequence_number,
                category=category,
                company_to=company_to,
                company_from=company_from,
                file_name=filename,
                file_text=section['content'] if isinstance(section['content'], str) 
                         else section['content'].to_string(),
                content_type=section['type']
            )
            db.session.add(quotation)
        
        db.session.commit()
        return document
        
    finally:
        os.remove(file_path) 