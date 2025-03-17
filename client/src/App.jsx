import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Form fields
  const [category, setCategory] = useState(''); 
  const [companyTo, setCompanyTo] = useState('');
  const [companyFrom, setCompanyFrom] = useState('');
  const [file, setFile] = useState(null);
  
  // Fetch all documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);
  
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/documents');
      setDocuments(response.data.documents || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch documents: ' + (err.response?.data?.error || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };
  
  const handleFileUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // File upload mode
      if (!file || !category) {
        throw new Error('Please select a file and provide a category');
      }
      
      // Log form values before submission for debugging
      console.log('Submitting with:', {
        file: file.name, 
        fileSize: file.size, 
        fileType: file.type, 
        category,
        companyFrom,
        companyTo
      });
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      formData.append('company_from', companyFrom);
      formData.append('company_to', companyTo);
      
      // For debugging: log the FormData entries
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      
      const response = await axios.post('/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Server response:', response.data);
      setSuccess('File uploaded successfully!');
      resetForm();
      fetchDocuments();
    } catch (err) {
      console.error('Upload error:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(`Upload failed: ${errorMessage}`);
      
      // More detailed error logging
      if (err.response) {
        console.error('Server error response:', err.response.data);
        console.error('Status code:', err.response.status);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setFile(null);
    setCategory('');
    setCompanyTo('');
    setCompanyFrom('');
    // Reset file input
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';
  };
  
  const deleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }
    
    try {
      setLoading(true);
      await axios.delete(`/documents/${docId}`);
      setSuccess('Document deleted successfully!');
      fetchDocuments();
    } catch (err) {
      setError('Failed to delete document: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  const markAsMigrated = async (docId) => {
    try {
      setLoading(true);
      await axios.post(`/documents/${docId}/mark-migrated`);
      setSuccess('Document marked as migrated!');
      fetchDocuments();
    } catch (err) {
      setError('Failed to mark document as migrated: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-2xl font-bold mb-6">Document Management System</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Upload Document</h2>
        </div>
        
        <form onSubmit={handleFileUpload}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Category *</label>
              <input
                type="text"
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value.trim())}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Company From</label>
              <input
                type="text"
                name="company_from"
                value={companyFrom}
                onChange={(e) => setCompanyFrom(e.target.value.trim())}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Company To</label>
              <input
                type="text"
                name="company_to"
                value={companyTo}
                onChange={(e) => setCompanyTo(e.target.value.trim())}
                className="w-full px-3 py-2 border rounded"
              />

            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Upload File *</label>
              <input
                id="fileInput"
                type="file"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Upload Document'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Documents</h2>
        
        {loading && documents.length === 0 ? (
          <p>Loading documents...</p>
        ) : documents.length === 0 ? (
          <p>No documents found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-left">File Name</th>
                  <th className="py-2 px-4 border-b text-left">Category</th>
                  <th className="py-2 px-4 border-b text-left">Company From</th>
                  <th className="py-2 px-4 border-b text-left">Company To</th>
                  <th className="py-2 px-4 border-b text-left">Migrated</th>
                  <th className="py-2 px-4 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td className="py-2 px-4 border-b">{doc.file_name}</td>
                    <td className="py-2 px-4 border-b">{doc.category}</td>
                    <td className="py-2 px-4 border-b">{doc.company_from || '-'}</td>
                    <td className="py-2 px-4 border-b">{doc.company_to || '-'}</td>
                    <td className="py-2 px-4 border-b">
                      {doc.is_elastic_migrated ? 'Yes' : 'No'}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => deleteDocument(doc.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm"
                        >
                          Delete
                        </button>
                        {!doc.is_elastic_migrated && (
                          <button
                            onClick={() => markAsMigrated(doc.id)}
                            className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 text-sm"
                          >
                            Mark Migrated
                          </button>
                        )}
                      </div>
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
}

export default App;