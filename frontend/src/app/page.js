'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import DocumentList from '@/components/DocumentList';
import ChatInterface from '@/components/ChatInterface';

export default function Home() {
  const [uploadTrigger, setUploadTrigger] = useState(0);

  const handleUploadSuccess = () => {
    setUploadTrigger((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🔬 Research Paper Assistant
          </h1>
          <p className="text-gray-600">
            RAG-powered Q&A system for research papers
          </p>
          <p className="text-sm text-green-600 mt-1 font-medium">
            ✅ Week 3: RAG + Ollama Integration Complete
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Upload & Documents */}
          <div className="space-y-6">
            {/* Upload */}
            <section className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                📤 Upload PDF
              </h2>
              <FileUpload onUploadSuccess={handleUploadSuccess} />
            </section>

            {/* Documents */}
            <section className="bg-white rounded-lg shadow-md p-6">
              <DocumentList refreshTrigger={uploadTrigger} />
            </section>
          </div>

          {/* Right Column: Chat */}
          <div>
            <section className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                💬 Ask Questions
              </h2>
              <ChatInterface />
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>Built with Next.js + FastAPI + Ollama + ChromaDB</p>
        </footer>
      </div>
    </main>
  );
}