import axios from "axios";

const API_URL = "http://localhost:5000";

export const uploadDocument = async (file, category) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);

    return await axios.post(`${API_URL}/upload`, formData);
};

export const fetchDocuments = async () => {
    return await axios.get(`${API_URL}/documents`);
};

export const deleteDocument = async (documentId) => {
    return await axios.delete(`${API_URL}/documents/${documentId}`);
};

export const markDocumentMigrated = async (documentId) => {
    return await axios.post(`${API_URL}/documents/${documentId}/mark-migrated`);
};

export const fetchQuotationsByDocument = async (groupId) => {
    return await axios.get(`${API_URL}/quotations/group/${groupId}`);
};
