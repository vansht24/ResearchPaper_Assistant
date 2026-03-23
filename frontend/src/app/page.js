'use client';
import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import DocumentList from '@/components/DocumentList';
import ChatInterface from '@/components/ChatInterface';

export default function Home() {
  const [refresh, setRefresh] = useState(0);
  return (
    <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', height:'100vh', background:'var(--bg-base)' }}>
      <aside style={{ borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ padding:'20px 18px', borderBottom:'1px solid var(--border)' }}>
          <h1 style={{ fontFamily:'var(--font-serif)', fontSize:20, color:'var(--text-primary)' }}>Scholara</h1>
          <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>Research Paper Assistant</p>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'20px 18px', display:'flex', flexDirection:'column', gap:24 }}>
          <section>
            <p style={{ fontSize:11, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:12 }}>Upload</p>
            <FileUpload onSuccess={() => setRefresh(n => n+1)} />
          </section>
          <section>
            <p style={{ fontSize:11, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:12 }}>Library</p>
            <DocumentList refresh={refresh} />
          </section>
        </div>
      </aside>
      <main style={{ overflow:'hidden', display:'flex', flexDirection:'column' }}>
        <ChatInterface />
      </main>
    </div>
  );
}