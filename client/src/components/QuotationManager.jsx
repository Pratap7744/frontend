import React, { useState, useEffect } from "react";
import { fetchQuotationsByDocument } from "../api";

const QuotationManager = ({ documentId }) => {
    const [quotations, setQuotations] = useState([]);

    useEffect(() => {
        if (documentId) {
            loadQuotations();
        }
    }, [documentId]);

    const loadQuotations = async () => {
        try {
            const response = await fetchQuotationsByDocument(documentId);
            setQuotations(response.data.quotations);
        } catch (error) {
            console.error("Error fetching quotations:", error);
        }
    };

    return (
        <div>
            <h2>Quotations for Document {documentId}</h2>
            <ul>
                {quotations.map((quote) => (
                    <li key={quote.id}>{quote.text}</li>
                ))}
            </ul>
        </div>
    );
};

export default QuotationManager;
