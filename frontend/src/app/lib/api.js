const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Upload PDF
export async function uploadPDF(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/api/documents/upload/pdf`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Upload failed');
  }

  return response.json();
}

// List documents
export async function listDocuments() {
  const response = await fetch(`${API_URL}/api/documents/list`);

  if (!response.ok) {
    throw new Error('Failed to fetch documents');
  }

  return response.json();
}

// Delete document
export async function deleteDocument(filename) {
  const response = await fetch(`${API_URL}/api/documents/${filename}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete document');
  }

  return response.json();
}

// Query documents (RAG)
export async function queryDocuments(query, topK = 3) {
  const response = await fetch(`${API_URL}/api/query/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, top_k: topK }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Query failed');
  }

  return response.json();
}

// Health check
export async function checkHealth() {
  const response = await fetch(`${API_URL}/api/query/health`);
  return response.json();
}