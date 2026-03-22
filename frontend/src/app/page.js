'use client';
import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import DocumentList from '@/components/DocumentList';
import ChatInterface from '@/components/ChatInterface';

const Logo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

const PipelineStep = ({ num, label, desc }) => (
  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
    <div style={{
      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
      background: 'var(--accent-dim)', border: '1px solid rgba(200,169,110,0.3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 10, fontWeight: 500, color: 'var(--accent)',
      fontFamily: 'var(--font-mono)',
    }}>{num}</div>
    <div>
      <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</p>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.5 }}>{desc}</p>
    </div>
  </div>
);

export default function Home() {
  const [refresh, setRefresh] = useState(0);
  const [sidePanel, setSidePanel] = useState('upload'); // 'upload' | 'library'

  return (
    <>
      <style>{`
        .side-tab {
          flex: 1;
          padding: 10px 0;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          font-size: 12px;
          font-weight: 500;
          font-family: var(--font-sans);
          letter-spacing: 0.04em;
          text-transform: uppercase;
          cursor: pointer;
          transition: color 0.15s, border-color 0.15s;
          color: var(--text-muted);
        }
        .side-tab.active {
          color: var(--accent);
          border-bottom-color: var(--accent);
        }
        .side-tab:hover:not(.active) {
          color: var(--text-secondary);
        }
        .stat-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 8px;
          border-radius: 99px;
          background: var(--accent-dim);
          border: 1px solid rgba(200,169,110,0.2);
          font-size: 10px;
          font-family: var(--font-mono);
          color: var(--accent);
          letter-spacing: 0.04em;
        }
        .divider {
          height: 1px;
          background: var(--border);
          margin: 20px 0;
        }
        .section-label {
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 14px;
          font-weight: 500;
        }
      `}</style>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        gridTemplateRows: '100vh',
        height: '100vh',
        background: 'var(--bg-base)',
        overflow: 'hidden',
      }}>

        {/* ── Sidebar ── */}
        <aside style={{
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid var(--border)',
          background: 'var(--bg-surface)',
          overflow: 'hidden',
        }}>

          {/* Brand header */}
          <div style={{
            padding: '20px 20px 0',
            borderBottom: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Logo />
              <div>
                <h1 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 18,
                  color: 'var(--text-primary)',
                  lineHeight: 1.2,
                }}>Scholara</h1>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.04em', marginTop: 1 }}>
                  RESEARCH ASSISTANT
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0 }}>
              {['upload', 'library'].map(tab => (
                <button
                  key={tab}
                  className={`side-tab${sidePanel === tab ? ' active' : ''}`}
                  onClick={() => setSidePanel(tab)}
                >
                  {tab === 'upload' ? 'Upload' : 'Library'}
                </button>
              ))}
            </div>
          </div>

          {/* Panel body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

            {sidePanel === 'upload' && (
              <>
                <p className="section-label">Add document</p>
                <FileUpload onSuccess={() => { setRefresh(n => n + 1); setSidePanel('library'); }} />

                <div className="divider" />

                <p className="section-label">RAG pipeline</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <PipelineStep num="1" label="Extract" desc="PyPDF2 pulls raw text page-by-page" />
                  <PipelineStep num="2" label="Chunk" desc={`${500}-char segments, ${50}-char overlap`} />
                  <PipelineStep num="3" label="Embed" desc="all-MiniLM-L6-v2 → 384-dim vectors" />
                  <PipelineStep num="4" label="Store" desc="ChromaDB persists embeddings to disk" />
                  <PipelineStep num="5" label="Retrieve" desc="Cosine similarity → top-k chunks" />
                  <PipelineStep num="6" label="Generate" desc="Mistral via Ollama produces the answer" />
                </div>

                <div className="divider" />

                <p className="section-label">Stack</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {['Next.js 16', 'FastAPI', 'ChromaDB', 'Ollama', 'Mistral', 'sentence-transformers'].map(t => (
                    <span key={t} style={{
                      fontSize: 10, padding: '3px 8px', borderRadius: 4,
                      background: 'var(--bg-elevated)', border: '1px solid var(--border-md)',
                      color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)',
                    }}>{t}</span>
                  ))}
                </div>
              </>
            )}

            {sidePanel === 'library' && (
              <>
                <p className="section-label">Indexed documents</p>
                <DocumentList refresh={refresh} />
              </>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              RAG · v1.0
            </span>
            <span className="stat-pill">
              <svg width="8" height="8" viewBox="0 0 10 10">
                <circle cx="5" cy="5" r="4" fill="var(--green)" />
              </svg>
              ONLINE
            </span>
          </div>
        </aside>

        {/* ── Chat main ── */}
        <main style={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: 'var(--bg-base)',
          position: 'relative',
        }}>

          {/* Chat top bar */}
          <div style={{
            padding: '14px 28px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface)',
            flexShrink: 0,
          }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                Research Q&amp;A
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                Answers grounded in your uploaded documents
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{
                padding: '5px 12px',
                borderRadius: 99,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-md)',
                fontSize: 11,
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
                </svg>
                mistral
              </div>
              <div style={{
                padding: '5px 12px',
                borderRadius: 99,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-md)',
                fontSize: 11,
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
              }}>
                top-3
              </div>
            </div>
          </div>

          {/* Chat interface fills rest */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <ChatInterface />
          </div>
        </main>
      </div>
    </>
  );
}