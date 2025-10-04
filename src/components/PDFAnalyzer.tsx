'use client';

import { useState } from 'react';
import { PDFUpload } from './PDFUpload';
import { PDFChat } from './PDFChat';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, MessageSquare } from 'lucide-react';

export function PDFAnalyzer() {
  const [vectorStoreId, setVectorStoreId] = useState<string | undefined>();
  const [newPDFUploaded, setNewPDFUploaded] = useState<boolean>(false);

  const handleUploadSuccess = (newVectorStoreId: string) => {
    setVectorStoreId(newVectorStoreId);
    setNewPDFUploaded(true); // Trigger conversation reset
    setTimeout(() => setNewPDFUploaded(false), 100); // Reset flag
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            PDF Analyzer & Chatbot
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Upload PDF documents and chat with them using AI. Our system creates vector stores dynamically and uses the Responses API with file_search tool.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Step 1: Upload PDF
                </CardTitle>
                <CardDescription>
                  Upload your PDF documents to create a vector store
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PDFUpload onUploadSuccess={handleUploadSuccess} />
              </CardContent>
            </Card>
          </div>

          {/* Chat Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Step 2: Chat with PDF
                </CardTitle>
                <CardDescription>
                  Ask questions about your uploaded documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PDFChat vectorStoreId={vectorStoreId} onNewPDF={newPDFUploaded} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">1. Upload PDF</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Drag and drop or select PDF files to upload
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="h-6 w-6 text-green-600">⚡</div>
                  </div>
                  <h3 className="font-semibold mb-2">2. Vector Store</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Automatically creates vector store via OpenAI API
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">3. Chat</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Ask questions using Responses API with file_search
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
