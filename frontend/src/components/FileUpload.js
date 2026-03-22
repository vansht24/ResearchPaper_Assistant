'use client';
import { useState, useRef } from 'react';
import { uploadPDF } from '../lib/api';

const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

function fmt(b) {
  return b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB';
}

export default function FileUpload({ onSuccess }) {
  const [file, setFile] = useState(null);
  const [drag, setDrag] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | uploading | success | error
  const [result, setResult] = useState(null);
  const [errMsg, setErrMsg] = useState('');
  const ref = useRef(null);

  const pick = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') { setErrMsg('Only PDF files are accepted.'); setStatus('error'); return; }
    setFile(f); setStatus('idle'); setResult(null); setErrMsg('');
  };

  const upload = async () => {
    if (!file) return;
    setStatus('uploading');
    try {
      const data = await uploadPDF(file);
      setResult(data); setFile(null); setStatus('success');
      if (ref.current) ref.current.value = '';
      onSuccess?.();
    } catch (e) { setErrMsg(e.message); setStatus('error'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Drop zone */}
      <div
        onClick={() => ref.current?.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0]); }}
        style={{
          border: `1.5px dashed ${drag ? 'var(--accent)' : file ? 'var(--green)' : 'var(--border-md)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '28px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          background: drag ? 'var(--accent-glow)' : file ? 'var(--green-dim)' : 'var(--bg-elevated)',
          transition: 'all 0.18s ease',
        }}
      >
        <input ref={ref} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => pick(e.target.files?.[0])} />
        <div style={{ color: file ? 'var(--green)' : drag ? 'var(--accent)' : 'var(--text-muted)', marginBottom: 8 }}>
          <UploadIcon />
        </div>
        {file ? (
          <>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{file.name}</p>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 3 }}>{fmt(file.size)} · Ready to upload</p>
          </>
        ) : (
          <>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--accent)', fontWeight: 500 }}>Browse</span> or drag &amp; drop a PDF
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>Research papers, articles, theses</p>
          </>
        )}
      </div>

      {/* Upload button */}
      <button
        onClick={upload}
        disabled={!file || status === 'uploading'}
        style={{
          width: '100%', padding: '10px 0', borderRadius: 'var(--radius-sm)',
          background: file && status !== 'uploading' ? 'var(--accent)' : 'var(--bg-hover)',
          color: file && status !== 'uploading' ? '#1a1208' : 'var(--text-muted)',
          border: 'none', cursor: file && status !== 'uploading' ? 'pointer' : 'not-allowed',
          fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-sans)',
          transition: 'all 0.18s ease', letterSpacing: '0.02em',
        }}
      >
        {status === 'uploading' ? 'Indexing document…' : 'Upload & Index'}
      </button>

      {/* Error */}
      {status === 'error' && (
        <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--red-dim)', border: '1px solid rgba(224,92,92,0.2)', fontSize: 12, color: 'var(--red)' }}>
          {errMsg}
        </div>
      )}

      {/* Success result */}
      {status === 'success' && result && (
        <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--green-dim)', border: '1px solid rgba(76,175,125,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--green)', fontSize: 12, fontWeight: 500, marginBottom: 8 }}>
            <CheckIcon /> Indexed successfully
          </div>
          {[
            ['File', result.filename],
            ['Size', fmt(result.size)],
            ['Chunks', result.num_chunks],
            ['Characters', result.total_characters?.toLocaleString()],
          ].filter(([,v]) => v != null).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)', padding: '2px 0' }}>
              <span>{k}</span><span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{v}</span>
            </div>
          ))}

      {message && (
        <p
          className={`text-sm font-medium ${
            message.startsWith('✅') ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {message}
        </p>
      )}

     {result && (
        <div className="bg-blue-50 border border-blue-200 rounded p-4 space-y-2">
          <h4 className="font-semibold text-blue-900">Upload Complete:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Filename: {result.filename}</li>
            <li>✓ Size: {(result.size / 1024).toFixed(2)} KB</li>
          </ul>

        </div>
      )} 
    </div>
  );
}