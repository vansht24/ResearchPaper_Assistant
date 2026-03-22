'use client';
import { useState, useEffect } from 'react';
import { listDocuments, deleteDocument } from '../lib/api';

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

const DocIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
  </svg>
);

function fmt(b) { return b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB'; }
function fmtDate(ts) { return new Date(ts * 1000).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }); }

export default function DocumentList({ refresh }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    try { const d = await listDocuments(); setDocs(d.documents || []); }
    catch { setDocs([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [refresh]);

  const del = async (name) => {
    if (!confirm(`Remove "${name}" and all its indexed embeddings?`)) return;
    setDeleting(name);
    try { await deleteDocument(name); await load(); }
    catch { alert('Delete failed.'); }
    finally { setDeleting(null); }
  };

  if (loading) return (
    <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>Loading library…</div>
  );

  if (docs.length === 0) return (
    <div style={{ padding: '32px 16px', textAlign: 'center' }}>
      <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.3 }}>📚</div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No documents yet</p>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, opacity: 0.6 }}>Upload a PDF to build your library</p>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {docs.length} document{docs.length !== 1 ? 's' : ''}
        </span>
        <button onClick={load} style={{ fontSize: 11, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.8 }}>
          Refresh
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {docs.map(doc => (
          <div
            key={doc.filename}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-md)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ color: 'var(--accent)', opacity: 0.7, flexShrink: 0 }}><DocIcon /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.filename}</p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                {fmt(doc.size)} · {fmtDate(doc.uploaded_at)}
              </p>
            </div>
            <button
              onClick={() => del(doc.filename)}
              disabled={deleting === doc.filename}
              style={{
                background: 'none', border: 'none', cursor: deleting === doc.filename ? 'not-allowed' : 'pointer',
                color: 'var(--text-muted)', opacity: deleting === doc.filename ? 0.4 : 0.6,
                padding: 4, borderRadius: 4, transition: 'opacity 0.15s, color 0.15s',
                flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.opacity = '1'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.opacity = '0.6'; }}
            >
              <TrashIcon />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}