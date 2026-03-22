'use client';
import { useState, useRef, useEffect } from 'react';
import { queryDocuments } from '../lib/api';

const SendIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
    style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const SUGGESTIONS = [
  'What are the main findings?',
  'Summarise the methodology',
  'What datasets were used?',
  'List the key conclusions',
  'What are the limitations?',
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
      marginTop: 8, padding: '10px 12px',
      background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
          {source.filename} · chunk {source.chunk_index}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 40, height: 3, background: 'var(--border-md)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 2, transition: 'width 0.5s ease' }} />
          </div>
          <span style={{ fontSize: 10, color: barColor, fontFamily: 'var(--font-mono)', minWidth: 28 }}>{pct}%</span>
        </div>
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.6, borderLeft: '2px solid var(--border-md)', paddingLeft: 8 }}>
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
    <div style={{ display: 'flex', gap: 12, flexDirection: isUser ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
      {/* Avatar */}
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isUser ? 'var(--accent)' : 'var(--bg-elevated)',
        border: isUser ? 'none' : '1px solid var(--border-md)',
        fontSize: 10, fontWeight: 500, letterSpacing: '0.03em',
        color: isUser ? '#1a1208' : 'var(--text-secondary)',
        fontFamily: 'var(--font-mono)',
      }}>
        {isUser ? 'YOU' : 'AI'}
      </div>

      {/* Content */}
      <div style={{ maxWidth: '74%' }}>
        {/* Bubble */}
        <div style={{
          padding: '12px 16px',
          borderRadius: isUser ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
          background: isUser ? 'var(--accent)' : isErr ? 'var(--red-dim)' : 'var(--bg-elevated)',
          border: isUser ? 'none' : `1px solid ${isErr ? 'rgba(224,92,92,0.2)' : 'var(--border)'}`,
          color: isUser ? '#1a1208' : isErr ? 'var(--red)' : 'var(--text-primary)',
          fontSize: 13.5,
          lineHeight: 1.75,
          fontFamily: isUser ? 'var(--font-sans)' : 'var(--font-sans)',
        }}>
          <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>

          {/* Sources toggle */}
          {msg.sources?.length > 0 && (
            <div>
              <button
                onClick={() => setOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5, marginTop: 12, paddingTop: 10,
                  borderTop: '1px solid var(--border)', background: 'none', border: 'none',
                  borderTop: '1px solid var(--border-md)', paddingTop: 10, marginTop: 12,
                  cursor: 'pointer', color: 'var(--text-muted)', fontSize: 11,
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-elevated)', border: '1px solid var(--border-md)',
        fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontWeight: 500,
      }}>AI</div>
      <div style={{
        padding: '14px 18px', borderRadius: '4px 14px 14px 14px',
        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
        display: 'flex', gap: 5, alignItems: 'center',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 5, height: 5, borderRadius: '50%', background: 'var(--text-muted)',
            animation: 'typing-dot 1.4s infinite ease-in-out',
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
        <style>{`@keyframes typing-dot{0%,80%,100%{opacity:.2;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}`}</style>
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
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {messages.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, userSelect: 'none' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--bg-elevated)', border: '1px solid var(--border-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--text-primary)', marginBottom: 6 }}>
                Ask your documents anything
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 320, lineHeight: 1.6 }}>
                Upload research papers, then query them with natural language. Answers are grounded in your sources.
              </p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 480, marginTop: 8 }}>
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  style={{
                    fontSize: 12, padding: '6px 14px', borderRadius: 99,
                    background: 'var(--bg-elevated)', border: '1px solid var(--border-md)',
                    color: 'var(--text-secondary)', cursor: 'pointer',
                    fontFamily: 'var(--font-sans)', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-md)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
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
        padding: '16px 24px 20px',
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border)',
      }}>
        <div style={{
          display: 'flex', gap: 10, alignItems: 'flex-end',
          background: 'var(--bg-elevated)', border: '1px solid var(--border-md)',
          borderRadius: 'var(--radius-md)', padding: '10px 14px',
          transition: 'border-color 0.15s',
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
              fontSize: 13.5, color: 'var(--text-primary)', fontFamily: 'var(--font-sans)',
              lineHeight: 1.6, maxHeight: 120, overflowY: 'auto',
              caretColor: 'var(--accent)',
            }}
          />
          <button
            onClick={() => send()}
            disabled={loading || !query.trim()}
            style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: query.trim() && !loading ? 'var(--accent)' : 'var(--bg-hover)',
              border: 'none', cursor: query.trim() && !loading ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: query.trim() && !loading ? '#1a1208' : 'var(--text-muted)',
              transition: 'all 0.18s',
            }}
          >
            <SendIcon />
          </button>
        </div>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center', letterSpacing: '0.02em' }}>
          Enter to send · Shift+Enter for new line · Retrieves top {3} chunks
        </p>
      </div>
    </div>
  );
}