/**
 * API client for backend communication
 * Week 2: PDF upload and document management
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Upload a PDF file to the backend
 */
export async function uploadPDF(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/api/upload/pdf`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Upload failed');
  }

  return response.json();
}

/**
 * Get list of all uploaded documents
 */
export async function listDocuments() {
  const response = await fetch(`${API_URL}/api/documents/list`);

  if (!response.ok) {
    throw new Error('Failed to fetch documents');
  }

  return response.json();
}

/**
 * Delete a document
 */
export async function deleteDocument(filename) {
  const response = await fetch(`${API_URL}/api/documents/${filename}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete document');
  }

  return response.json();
}

/**
 * Get processed data for a specific PDF
 */
export async function getProcessedData(filename) {
  const response = await fetch(`${API_URL}/api/upload/processed/${filename}`);

  if (!response.ok) {
    throw new Error('Failed to fetch processed data');
  }

  return response.json();
}
