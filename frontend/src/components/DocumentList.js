'use client';
import { useState, useEffect } from 'react';
import { listDocuments, deleteDocument } from '../lib/api';

function formatSize(b) {
  return b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB';
}
function formatDate(ts) {
  return new Date(ts * 1000).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function DocumentList({ refresh }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const d = await listDocuments();
      setDocs(d.documents || []);
    } catch (e) {
      setDocs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(function() { load(); }, [refresh]);

  const handleDelete = async (name) => {
    if (!confirm('Remove "' + name + '" and all its indexed data?')) return;
    setDeleting(name);
    try { await deleteDocument(name); await load(); }
    catch (e) { alert('Delete failed.'); }
    finally { setDeleting(null); }
  };

  if (loading) return (
    <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 12, color: 'var(--ink-4)' }}>
      Loading…
    </div>
  );

  if (docs.length === 0) return (
    <div style={{ padding: '28px 16px', textAlign: 'center' }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        background: 'var(--surface)', margin: '0 auto 10px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink-4)" strokeWidth="1.5" strokeLinecap="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
      </div>
      <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-3)' }}>No documents yet</p>
      <p style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 3 }}>Upload a PDF to get started</p>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 11, color: 'var(--ink-4)', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 500 }}>
          {docs.length} document{docs.length !== 1 ? 's' : ''}
        </span>
        <button onClick={load} style={{
          fontSize: 11, color: 'var(--sage)', background: 'none',
          border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)',
        }}>
          Refresh
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {docs.map(function(doc) {
          return (
            <div key={doc.filename} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 'var(--r-sm)',
              background: 'var(--white)', border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'box-shadow 0.15s, border-color 0.15s',
            }}
              onMouseEnter={function(e) { e.currentTarget.style.borderColor = 'var(--border-md)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={function(e) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: 'var(--sage-light)', border: '1px solid var(--sage-mid)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--sage)" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: 12, fontWeight: 500, color: 'var(--ink)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{doc.filename}</p>
                <p style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 1, fontFamily: 'var(--font-mono)' }}>
                  {formatSize(doc.size)} · {formatDate(doc.uploaded_at)}
                </p>
              </div>

              <button
                onClick={function() { handleDelete(doc.filename); }}
                disabled={deleting === doc.filename}
                style={{
                  background: 'none', border: 'none',
                  cursor: deleting === doc.filename ? 'not-allowed' : 'pointer',
                  color: 'var(--ink-4)', padding: '4px',
                  borderRadius: 4, opacity: deleting === doc.filename ? 0.4 : 1,
                  transition: 'color 0.15s',
                  flexShrink: 0,
                }}
                onMouseEnter={function(e) { e.currentTarget.style.color = 'var(--terracotta)'; }}
                onMouseLeave={function(e) { e.currentTarget.style.color = 'var(--ink-4)'; }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}