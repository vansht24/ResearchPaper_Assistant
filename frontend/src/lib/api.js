const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Upload a PDF file to the backend
 */
export async function uploadPDF(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/documents/upload/pdf`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(error.detail || 'Upload failed');
  }

  return await response.json();
}


/**
 * List all uploaded documents
 */
export async function listDocuments() {
  const response = await fetch(`${API_BASE_URL}/api/documents/list`);

  if (!response.ok) {
    throw new Error('Failed to fetch documents');
  }

  return await response.json();
}


/**
 * Delete a document
 */
export async function deleteDocument(filename) {
  const response = await fetch(`${API_BASE_URL}/api/documents/${filename}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete document');
  }

  return await response.json();
}


/**
 * Query documents (RAG search)
 */
export async function queryDocuments(query) {
  const response = await fetch(`${API_BASE_URL}/api/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error('Failed to query documents');
  }

  return await response.json();
}
