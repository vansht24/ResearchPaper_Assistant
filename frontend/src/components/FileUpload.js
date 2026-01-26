'use client';

import { useState } from 'react';
import { uploadPDF } from '../lib/api';


export default function FileUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setMessage('');
      setResult(null);
    } else {
      setMessage('❌ Please select a valid PDF file');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setMessage('');
    setResult(null);

    try {
      const data = await uploadPDF(file);
      setMessage(`✅ ${data.message}`);
      setResult(data);
      setFile(null);

      const fileInput = document.getElementById('file-input');
      if (fileInput) fileInput.value = '';

      if (onUploadSuccess) {
        onUploadSuccess(data);
      }
    } catch (error) {
      setMessage(`❌ Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          id="file-input"
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="flex-1 px-3 py-2 border border-gray-300 rounded"
        />
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {uploading ? 'Processing...' : 'Upload PDF'}
        </button>
      </div>

      {file && (
        <div className="text-sm text-gray-700 bg-gray-100 p-3 rounded">
          📄 {file.name} ({(file.size / 1024).toFixed(2)} KB)
        </div>
      )}

      {message && (
        <p
          className={`text-sm font-medium ${
            message.startsWith('✅') ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {message}
        </p>
      )}

      {result && (
        <div className="bg-blue-50 border border-blue-200 rounded p-4 space-y-2">
          <h4 className="font-semibold text-blue-900">Processing Complete:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Total characters: {result.total_characters.toLocaleString()}</li>
            <li>✓ Number of chunks: {result.num_chunks}</li>
          </ul>
          {result.preview && (
            <details className="mt-3">
              <summary className="cursor-pointer text-blue-700 font-medium">
                View Text Preview
              </summary>
              <p className="mt-2 text-xs text-gray-700 bg-white p-3 rounded border">
                {result.preview}...
              </p>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
