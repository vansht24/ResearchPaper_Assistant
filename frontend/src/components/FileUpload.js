'use client';
import { useState, useRef } from 'react';
import { uploadPDF } from '../lib/api';

const UploadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

function fmt(b) {
  return b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB';
}

export default function FileUpload({ onSuccess }) {
  const [file, setFile] = useState(null);
  const [drag, setDrag] = useState(false);
  const [status, setStatus] = useState('idle'); 
  const [result, setResult] = useState(null);
  const [errMsg, setErrMsg] = useState('');
  const ref = useRef(null);

  const pick = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') { 
        setErrMsg('Only PDF files are accepted.'); 
        setStatus('error'); 
        return; 
    }
    setFile(f); setStatus('idle'); setResult(null); setErrMsg('');
  };

  const upload = async () => {
    if (!file) return;
    setStatus('uploading');
    try {
      const data = await uploadPDF(file);
      setResult(data); 
      setFile(null); 
      setStatus('success');
      if (ref.current) ref.current.value = '';
      onSuccess?.();
    } catch (e) { 
        setErrMsg(e.message); 
        setStatus('error'); 
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Drop zone */}
      <div
        onClick={() => ref.current?.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0]); }}
        style={{
          border: `2px dashed ${drag ? 'var(--accent)' : file ? 'var(--green)' : 'var(--border-md)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '32px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          background: drag ? 'var(--accent-glow)' : file ? 'var(--green-dim)' : 'var(--bg-base)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => {
            if (!file && !drag) e.currentTarget.style.borderColor = 'var(--text-muted)';
        }}
        onMouseLeave={e => {
            if (!file && !drag) e.currentTarget.style.borderColor = 'var(--border-md)';
        }}
      >
        <input ref={ref} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => pick(e.target.files?.[0])} />
        
        <div style={{ 
            color: file ? 'var(--green)' : drag ? 'var(--accent)' : 'var(--text-muted)', 
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'center'
        }}>
          <div style={{
              padding: '12px',
              borderRadius: '50%',
              background: file ? '#FFFFFF' : drag ? '#FFFFFF' : 'var(--bg-hover)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: (file || drag) ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s ease',
          }}>
            <UploadIcon />
          </div>
        </div>

        {file ? (
          <>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{file.name}</p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, fontWeight: 500 }}>{fmt(file.size)} · Ready to upload</p>
          </>
        ) : (
          <>
            <p style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>
              <span style={{ color: 'var(--accent)' }}>Click to upload</span> or drag and drop
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>PDF documents up to 50MB</p>
          </>
        )}
      </div>

      {/* Upload button */}
      <button
        onClick={upload}
        disabled={!file || status === 'uploading'}
        style={{
          width: '100%', padding: '12px 0', borderRadius: 'var(--radius-sm)',
          background: file && status !== 'uploading' ? 'var(--accent)' : 'var(--bg-base)',
          color: file && status !== 'uploading' ? '#ffffff' : 'var(--text-muted)',
          border: file && status !== 'uploading' ? 'none' : '1px solid var(--border-md)',
          cursor: file && status !== 'uploading' ? 'pointer' : 'not-allowed',
          fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-sans)',
          transition: 'all 0.2s ease', letterSpacing: '0.01em',
          boxShadow: file && status !== 'uploading' ? 'var(--shadow-md)' : 'none',
        }}
      >
        {status === 'uploading' ? 'Indexing document…' : 'Upload & Index'}
      </button>

      {/* Error Message */}
      {status === 'error' && (
        <div style={{ 
            padding: '12px 16px', borderRadius: 'var(--radius-sm)', 
            background: 'var(--red-dim)', border: '1px solid rgba(239, 68, 68, 0.3)', 
            fontSize: 13, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {errMsg}
        </div>
      )}

      {/* Success Result */}
      {status === 'success' && result && (
        <div style={{ 
            padding: '16px', borderRadius: 'var(--radius-sm)', 
            background: 'var(--bg-elevated)', border: '1px solid var(--green)',
            boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--green)', fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
            <div style={{ background: 'var(--green-dim)', padding: '4px', borderRadius: '50%' }}>
                <CheckIcon /> 
            </div>
            Indexed successfully
          </div>
          
          <div style={{ background: 'var(--bg-base)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            {[
                ['Filename', result.filename],
                ['Size', fmt(result.size)],
                ['Chunks created', result.num_chunks],
                ['Total chars', result.total_characters?.toLocaleString()],
            ].filter(([,v]) => v != null).map(([k, v], i, arr) => (
                <div key={k} style={{ 
                    display: 'flex', justifyContent: 'space-between', 
                    fontSize: 12, color: 'var(--text-secondary)', 
                    padding: '6px 0', 
                    borderBottom: i === arr.length - 1 ? 'none' : '1px solid var(--border)',
                    fontWeight: 500
                }}>
                  <span>{k}</span>
                  <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{v}</span>
                </div>
            ))}
          </div>
        </div>
      )} 
    </div>
  );
}