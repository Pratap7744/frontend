from src.routes import main_bp
from flask import Flask, request, jsonify, Blueprint
from src.utils.util import save_document
from database.models import Document, Quotation
from src import db
import uuid
import os
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from werkzeug.exceptions import NotFound

main = Blueprint('main', __name__)

@main_bp.route('/')
def hello():
    return "Hello, World, Welcome to Resume app. How are ?"


@main_bp.route('/upload', methods=['POST'])
def upload_file():
    if request.is_json:  # Check if JSON request
        data = request.get_json()
        document = Document(
            category=data.get('category'),
            company_to=data.get('company_to'),
            company_from=data.get('company_from'),
            file_name=data.get('file_name'),
            file_text=data.get('file_text'),
            is_elastic_migrated=data.get('is_elastic_migrated', False)
        )
        db.session.add(document)
        db.session.commit()
        return jsonify({'message': 'File uploaded successfully (JSON Mode)', 'document': document.to_dict()}), 201
    
    # Handle normal file upload (form-data)
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    category = request.form.get('category')
    
    if not category:
        return jsonify({'error': 'Missing category'}), 400
    
    # Save the document
    document = save_document(file, category)
    return jsonify({'message': 'File uploaded successfully', 'document': document.to_dict()}), 201

@main_bp.route('/documents', methods=['GET'])
def get_documents():
    try:
        documents = Document.query.all()
        return jsonify({
            'documents': [doc.to_dict() for doc in documents]
        })
    except SQLAlchemyError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500

@main_bp.route('/documents/<uuid:document_id>', methods=['GET'])
def get_document(document_id):
    try:
        document = Document.query.get_or_404(document_id)
        return jsonify(document.to_dict())
    except NotFound:
        return jsonify({'error': 'Document not found'}), 404
    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500

@main_bp.route('/documents/<uuid:document_id>', methods=['DELETE'])
def delete_document(document_id):
    try:
        document = Document.query.get_or_404(document_id)
        db.session.delete(document)
        db.session.commit()
        return jsonify({'message': 'Document deleted successfully'})
    except NotFound:
        return jsonify({'error': 'Document not found'}), 404
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500

@main_bp.route('/quotations', methods=['GET'])
def get_quotations():
    try:
        quotations = Quotation.query.all()
        return jsonify({
            'quotations': [quote.to_dict() for quote in quotations]
        })
    except SQLAlchemyError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500

@main_bp.route('/quotations/group/<uuid:group_id>', methods=['GET'])
def get_quotations_by_group(group_id):
    """Get all quotations from a specific document (group)"""
    try:
        quotations = Quotation.query.filter_by(group_id=group_id)\
                                .order_by(Quotation.sequence_number)\
                                .all()
        if not quotations:
            return jsonify({'error': 'No quotations found for this group'}), 404
        return jsonify({
            'quotations': [quote.to_dict() for quote in quotations]
        })
    except SQLAlchemyError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500

@main_bp.route('/quotations/<uuid:quotation_id>', methods=['GET'])
def get_quotation(quotation_id):
    try:
        quotation = Quotation.query.get_or_404(quotation_id)
        return jsonify(quotation.to_dict())
    except NotFound:
        return jsonify({'error': 'Quotation not found'}), 404
    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500

@main_bp.route('/documents/<uuid:document_id>/mark-migrated', methods=['POST'])
def mark_document_migrated(document_id):
    try:
        document = Document.query.get_or_404(document_id)
        document.is_elastic_migrated = True
        db.session.commit()
        return jsonify({'message': 'Document marked as migrated'})
    except NotFound:
        return jsonify({'error': 'Document not found'}), 404
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500

@main_bp.route('/quotations/<uuid:quotation_id>/mark-migrated', methods=['POST'])
def mark_quotation_migrated(quotation_id):
    try:
        quotation = Quotation.query.get_or_404(quotation_id)
        quotation.is_astra_migrated = True
        db.session.commit()
        return jsonify({'message': 'Quotation marked as migrated'})
    except NotFound:
        return jsonify({'error': 'Quotation not found'}), 404
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500 