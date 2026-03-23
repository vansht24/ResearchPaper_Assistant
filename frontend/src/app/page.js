'use client';
import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import DocumentList from '@/components/DocumentList';
import ChatInterface from '@/components/ChatInterface';

const Logo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
  </svg>
);

const PipelineStep = ({ num, label, desc }) => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '8px 0' }}>
    <div style={{
      width: 24, height: 24, borderRadius: '6px', flexShrink: 0,
      background: 'var(--accent-dim)', border: '1px solid rgba(249, 115, 22, 0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 600, color: 'var(--accent)',
      fontFamily: 'var(--font-mono)',
    }}>{num}</div>
    <div>
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</p>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>{desc}</p>
    </div>
  </div>
);

export default function Home() {
  const [refresh, setRefresh] = useState(0);
  const [sidePanel, setSidePanel] = useState('upload'); 

  return (
    <>
      <style>{`
        .side-tab {
          flex: 1;
          padding: 12px 0;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          font-size: 13px;
          font-weight: 600;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: all 0.2s ease;
          color: var(--text-muted);
        }
        .side-tab.active {
          color: var(--accent);
          border-bottom-color: var(--accent);
        }
        .side-tab:hover:not(.active) {
          color: var(--text-primary);
        }
        .stat-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 99px;
          background: var(--bg-base);
          border: 1px solid var(--border-md);
          font-size: 11px;
          font-family: var(--font-mono);
          color: var(--text-secondary);
          letter-spacing: 0.02em;
        }
        .divider {
          height: 1px;
          background: var(--border);
          margin: 24px 0;
        }
        .section-label {
          font-size: 11px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 16px;
          font-weight: 700;
        }
      `}</style>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
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
          boxShadow: 'var(--shadow-md)',
          zIndex: 10,
        }}>

          {/* Brand header */}
          <div style={{ padding: '24px 24px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <Logo />
              <div>
                <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                  Scholara
                </h1>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, fontWeight: 500 }}>
                  Research Assistant
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
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Panel body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
            {sidePanel === 'upload' && (
              <>
                <p className="section-label">Add document</p>
                <FileUpload onSuccess={() => { setRefresh(n => n + 1); setSidePanel('library'); }} />

                <div className="divider" />

                <p className="section-label">RAG pipeline</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <PipelineStep num="1" label="Extract" desc="PyPDF2 pulls raw text" />
                  <PipelineStep num="2" label="Chunk" desc="500-char segments" />
                  <PipelineStep num="3" label="Embed" desc="all-MiniLM-L6-v2 vectors" />
                  <PipelineStep num="4" label="Retrieve" desc="Cosine similarity matching" />
                  <PipelineStep num="5" label="Generate" desc="Mistral via Ollama" />
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
            padding: '16px 24px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface)'
          }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              v1.0.0
            </span>
            <span className="stat-pill">
              <svg width="8" height="8" viewBox="0 0 10 10">
                <circle cx="5" cy="5" r="4" fill="var(--green)" />
              </svg>
              Online
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
            padding: '16px 32px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface)',
            flexShrink: 0,
            boxShadow: 'var(--shadow-sm)',
            zIndex: 5,
          }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                Research Q&amp;A
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                Answers grounded in your uploaded documents
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{
                padding: '6px 14px', borderRadius: 99, background: 'var(--bg-base)', border: '1px solid var(--border-md)',
                fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                mistral
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