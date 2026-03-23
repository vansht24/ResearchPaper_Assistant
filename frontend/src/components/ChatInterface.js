'use client';
import { useState, useRef, useEffect } from 'react';
import { queryDocuments } from '../lib/api';

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
    style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const SUGGESTIONS = [
  'What are the main findings?',
  'Summarise the methodology',
  'What datasets were used?',
  'List the key conclusions',
];

function similarity(distance) {
  return Math.max(0, Math.min(1, 1 - distance / 2));
}

function SourceCard({ source }) {
  const sim = similarity(source.distance);
  const pct = Math.round(sim * 100);
  const barColor = pct > 70 ? 'var(--green)' : pct > 40 ? 'var(--accent)' : 'var(--text-muted)';

  return (
    <div style={{
      marginTop: 10, padding: '12px 14px',
      background: 'var(--bg-base)', borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
          {source.filename} · chunk {source.chunk_index}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 48, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 2, transition: 'width 0.5s ease' }} />
          </div>
          <span style={{ fontSize: 11, color: barColor, fontFamily: 'var(--font-mono)', minWidth: 32, fontWeight: 500 }}>{pct}%</span>
        </div>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.6, borderLeft: '3px solid var(--border-md)', paddingLeft: 12 }}>
        {source.text}
      </p>
    </div>
  );
}

function Message({ msg }) {
  const [open, setOpen] = useState(false);
  const isUser = msg.role === 'user';
  const isErr = msg.role === 'error';

  return (
    <div style={{ display: 'flex', gap: 16, flexDirection: isUser ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
      {/* Avatar */}
      <div style={{
        width: 32, height: 32, borderRadius: '8px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isUser ? 'var(--accent)' : 'var(--bg-elevated)',
        border: isUser ? 'none' : '1px solid var(--border-md)',
        fontSize: 11, fontWeight: 700,
        color: isUser ? '#ffffff' : 'var(--text-primary)',
        fontFamily: 'var(--font-mono)',
        boxShadow: isUser ? 'var(--shadow-sm)' : 'none',
      }}>
        {isUser ? 'ME' : 'AI'}
      </div>

      {/* Content */}
      <div style={{ maxWidth: '75%' }}>
        <div style={{
          padding: '14px 18px',
          borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
          background: isUser ? 'var(--accent)' : isErr ? 'var(--red-dim)' : 'var(--bg-elevated)',
          border: isUser ? 'none' : `1px solid ${isErr ? 'rgba(239, 68, 68, 0.2)' : 'var(--border)'}`,
          color: isUser ? '#ffffff' : isErr ? 'var(--red)' : 'var(--text-primary)',
          fontSize: 14.5,
          lineHeight: 1.7,
          boxShadow: isUser ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        }}>
          <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>

          {/* Sources toggle */}
          {msg.sources?.length > 0 && (
            <div>
              <button
                onClick={() => setOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, marginTop: 14, paddingTop: 12,
                  borderTop: '1px solid var(--border)', background: 'none',
                  cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 12,
                  fontFamily: 'var(--font-sans)', fontWeight: 600,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
                {msg.sources.length} source{msg.sources.length !== 1 ? 's' : ''} retrieved
                <ChevronIcon open={open} />
              </button>
              {open && msg.sources.map((s, i) => <SourceCard key={i} source={s} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div style={{
        width: 32, height: 32, borderRadius: '8px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-elevated)', border: '1px solid var(--border-md)',
        fontSize: 11, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontWeight: 700,
      }}>AI</div>
      <div style={{
        padding: '16px 20px', borderRadius: '4px 16px 16px 16px',
        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
        display: 'flex', gap: 6, alignItems: 'center', boxShadow: 'var(--shadow-sm)',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)',
            animation: 'typing-dot 1.4s infinite ease-in-out',
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
        <style>{`@keyframes typing-dot{0%,80%,100%{opacity:.3;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}`}</style>
      </div>
    </div>
  );
}

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const send = async (q) => {
    const text = (q || query).trim();
    if (!text || loading) return;
    setMessages(m => [...m, { role: 'user', text }]);
    setQuery('');
    setLoading(true);
    try {
      const res = await queryDocuments(text);
      setMessages(m => [...m, { role: 'assistant', text: res.answer, sources: res.sources || [] }]);
    } catch (e) {
      setMessages(m => [...m, { role: 'error', text: `Error: ${e.message}` }]);
    } finally { setLoading(false); }
  };

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {messages.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 20, userSelect: 'none' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '16px',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 700, fontSize: 22, color: 'var(--text-primary)', marginBottom: 8 }}>
                Ask your documents anything
              </p>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 360, lineHeight: 1.6, margin: '0 auto' }}>
                Upload research papers, then query them with natural language. Answers are grounded in your sources.
              </p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', maxWidth: 500, marginTop: 12 }}>
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  style={{
                    fontSize: 13, padding: '8px 16px', borderRadius: 99,
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    color: 'var(--text-secondary)', cursor: 'pointer',
                    fontFamily: 'var(--font-sans)', transition: 'all 0.2s', fontWeight: 500,
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        {loading && <TypingBubble />}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{
        padding: '20px 32px 24px',
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border)',
        boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.02)',
      }}>
        <div style={{
          display: 'flex', gap: 12, alignItems: 'flex-end',
          background: 'var(--bg-base)', border: '1px solid var(--border-md)',
          borderRadius: 'var(--radius-md)', padding: '12px 16px',
          boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)', transition: 'border-color 0.2s',
        }}
          onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--accent)'}
          onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border-md)'}
        >
          <textarea
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKey}
            placeholder="Ask about your documents…"
            rows={1}
            disabled={loading}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none', resize: 'none',
              fontSize: 14.5, color: 'var(--text-primary)', fontFamily: 'var(--font-sans)',
              lineHeight: 1.6, maxHeight: 150, overflowY: 'auto',
              caretColor: 'var(--accent)', padding: '4px 0',
            }}
          />
          <button
            onClick={() => send()}
            disabled={loading || !query.trim()}
            style={{
              width: 36, height: 36, borderRadius: '8px', flexShrink: 0,
              background: query.trim() && !loading ? 'var(--accent)' : 'var(--bg-hover)',
              border: 'none', cursor: query.trim() && !loading ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: query.trim() && !loading ? '#ffffff' : 'var(--text-muted)',
              transition: 'all 0.2s',
              boxShadow: query.trim() && !loading ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <SendIcon />
          </button>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12, textAlign: 'center', letterSpacing: '0.02em', fontWeight: 500 }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}