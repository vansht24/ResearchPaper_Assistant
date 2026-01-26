'use client';

import { useState, useEffect } from 'react';
import { listDocuments, deleteDocument } from '../lib/api';


export default function DocumentList({ refreshTrigger }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDocuments = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await listDocuments();
      setDocuments(data.documents || []);
    } catch (err) {
      setError('Failed to load documents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [refreshTrigger]);

  const handleDelete = async (filename) => {
    if (!confirm(`Delete "${filename}"?`)) return;

    try {
      await deleteDocument(filename);
      await fetchDocuments();
    } catch (err) {
      alert('Failed to delete document');
      console.error(err);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatSize = (bytes) => {
    return (bytes / 1024).toFixed(2) + ' KB';
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading documents...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No documents uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">
          Uploaded Documents ({documents.length})
        </h3>
        <button
          onClick={fetchDocuments}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          🔄 Refresh
        </button>
      </div>

      {documents.map((doc, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-800">📄 {doc.filename}</p>
              {doc.processed && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  ✓ Processed
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {formatSize(doc.size)} • Uploaded {formatDate(doc.uploaded_at)}
              {doc.num_chunks && ` • ${doc.num_chunks} chunks`}
            </p>
          </div>

          <button
            onClick={() => handleDelete(doc.filename)}
            className="ml-4 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
