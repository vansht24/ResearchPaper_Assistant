export async function uploadPDF(file) {
  const formData = new FormData();
  formData.append('file', file);

  // Update this URL to match your FastAPI backend router!
  const response = await fetch('http://localhost:8000/api/documents/', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to upload document');
  }

  return response.json();
}

export async function listDocuments() {
  const response = await fetch('http://localhost:8000/api/documents/');
  
  if (!response.ok) {
    throw new Error('Failed to fetch documents');
  }
  
  return response.json();
}

export async function deleteDocument(filename) {
  const response = await fetch(`http://localhost:8000/api/documents/${filename}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete document');
  }
  
  return response.json();
}
export async function queryDocuments(queryText) {
  // Update this URL if your FastAPI query route is mounted differently
  const response = await fetch('http://localhost:8000/api/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // Sends the question as a JSON object: { "query": "What are the main findings?" }
    body: JSON.stringify({ query: queryText }), 
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to get an answer from the documents');
  }

  return response.json();
}