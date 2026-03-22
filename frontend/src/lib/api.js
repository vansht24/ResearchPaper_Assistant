const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function uploadPDF(file) {
  const fd = new FormData();
  fd.append('file', file);
  const r = await fetch(`${API}/api/documents/upload/pdf`, { method: 'POST', body: fd });
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.detail || 'Upload failed'); }
  return r.json();
}

export async function listDocuments() {
  const r = await fetch(`${API}/api/documents/list`);
  if (!r.ok) throw new Error('Failed to list documents');
  return r.json();
}

export async function deleteDocument(filename) {
  const r = await fetch(`${API}/api/documents/${encodeURIComponent(filename)}`, { method: 'DELETE' });
  if (!r.ok) throw new Error('Delete failed');
  return r.json();
}

export async function queryDocuments(query, top_k = 3) {
  const r = await fetch(`${API}/api/query/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, top_k }),
  });
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.detail || 'Query failed'); }
  return r.json();
}