'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import DocumentList from '@/components/DocumentList';

export default function Home() {
  const [uploadTrigger, setUploadTrigger] = useState(0);

  const handleUploadSuccess = () => {
    // Trigger document list refresh
    setUploadTrigger((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Research Paper Helper
          </h1>
          <p className="text-gray-600">
            Upload research papers and extract text for analysis
          </p>
          <p className="text-sm text-blue-600 mt-1">Week 2: PDF Processing & Text Extraction</p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Upload Section */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Upload PDF
            </h2>
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          </section>

          {/* Document List */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <DocumentList refreshTrigger={uploadTrigger} />
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>Built with Next.js + FastAPI • Week 2 Implementation</p>
        </footer>
      </div>
    </main>
  );
}