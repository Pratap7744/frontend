import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000";

const DocumentManager = () => {
    const [documents, setDocuments] = useState([]);
    const [file, setFile] = useState(null);
    const [category, setCategory] = useState("");
    const [companyTo, setCompanyTo] = useState("");
    const [companyFrom, setCompanyFrom] = useState("");
    const [fileName, setFileName] = useState("");
    const [fileText, setFileText] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        try {
            const response = await axios.get(`${API_URL}/documents`);
            setDocuments(response.data.documents || []);
        } catch (error) {
            console.error("Error fetching documents:", error);
            setError("Failed to load documents");
        }
    };

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
        if (selectedFile) {
            setFileName(selectedFile.name);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        
        if (!file) {
            setError("Please select a file");
            return;
        }

        if (!category) {
            setError("Category is required");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Create FormData object
            const formData = new FormData();
            formData.append("file", file);
            formData.append("category", category);
            
            // These fields are optional in your backend
            if (companyTo) formData.append("company_to", companyTo);
            if (companyFrom) formData.append("company_from", companyFrom);
            if (fileName) formData.append("file_name", fileName);
            if (fileText) formData.append("file_text", fileText);
            
            console.log('formData ',formData)
            // Upload the file
            const response = await axios.post(`${API_URL}/upload`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            
            console.log("Upload response:", response.data);
            alert("File uploaded successfully!");
            
            // Reset form
            setFile(null);
            setCategory("");
            setCompanyTo("");
            setCompanyFrom("");
            setFileName("");
            setFileText("");
            document.getElementById("file-input").value = "";
            
            // Reload documents
            loadDocuments();
        } catch (error) {
            console.error("Upload failed:", error);
            if (error.response) {
                setError(`Server error: ${error.response.data.error || "Unknown error"}`);
            } else if (error.request) {
                setError("No response from server. Check if your backend is running.");
            } else {
                setError(`Error: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-xl font-bold mb-4">Document Manager</h2>

            <div className="bg-white p-6 rounded shadow-md mb-6">
                <h3 className="text-lg font-semibold mb-4">Upload New Document</h3>
                
                <form onSubmit={handleUpload}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">File *</label>
                        <input 
                            id="file-input"
                            type="file" 
                            onChange={handleFileChange}
                            className="border p-2 w-full rounded" 
                            accept=".pdf,.doc,.docx,.txt"
                        />
                        {file && (
                            <p className="mt-1 text-sm text-gray-500">
                                Selected: {file.name} ({Math.round(file.size/1024)} KB)
                            </p>
                        )}
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Category *</label>
                        <input 
                            type="text" 
                            value={category} 
                            onChange={(e) => setCategory(e.target.value)}
                            className="border p-2 w-full rounded" 
                            placeholder="Enter category"
                            required
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-gray-700 mb-2">Company From</label>
                            <input 
                                type="text" 
                                value={companyFrom} 
                                onChange={(e) => setCompanyFrom(e.target.value)}
                                className="border p-2 w-full rounded" 
                                placeholder="Company sending document"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-gray-700 mb-2">Company To</label>
                            <input 
                                type="text" 
                                value={companyTo} 
                                onChange={(e) => setCompanyTo(e.target.value)}
                                className="border p-2 w-full rounded" 
                                placeholder="Company receiving document"
                            />
                        </div>
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">File Name</label>
                        <input 
                            type="text" 
                            value={fileName} 
                            onChange={(e) => setFileName(e.target.value)}
                            className="border p-2 w-full rounded" 
                            placeholder="Custom file name (optional)"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            Leave blank to use original filename
                        </p>
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">File Text (Optional)</label>
                        <textarea 
                            value={fileText} 
                            onChange={(e) => setFileText(e.target.value)}
                            className="border p-2 w-full rounded h-24" 
                            placeholder="Enter text content (optional - will be extracted automatically from PDF)"
                        />
                    </div>
                    
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}
                    
                    <button 
                        type="submit" 
                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        disabled={loading}
                    >
                        {loading ? "Uploading..." : "Upload Document"}
                    </button>
                </form>
            </div>

            <div className="bg-white p-6 rounded shadow-md">
                <h3 className="text-lg font-semibold mb-4">Documents ({documents.length})</h3>
                
                {documents.length === 0 ? (
                    <p className="text-gray-500">No documents found</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {documents.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">{doc.file_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{doc.category}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{doc.company_from}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{doc.company_to}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${doc.is_elastic_migrated ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {doc.is_elastic_migrated ? 'Migrated' : 'Pending'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentManager;