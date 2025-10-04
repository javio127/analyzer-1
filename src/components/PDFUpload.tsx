'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface UploadedFile {
  file: File;
  id: string;
  status: 'uploading' | 'success' | 'error';
  vectorStoreId?: string;
  error?: string;
}

interface PDFUploadProps {
  onUploadSuccess?: (vectorStoreId: string) => void;
}

export function PDFUpload({ onUploadSuccess }: PDFUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length === 0) {
      toast.error('Please upload only PDF files');
      return;
    }

    toast.info(`Uploading ${pdfFiles.length} PDF file(s)...`);

    const newFiles: UploadedFile[] = pdfFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'uploading'
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    uploadFiles(newFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true
  });

  const uploadFiles = async (files: UploadedFile[]) => {
    setIsUploading(true);
    
    for (const fileData of files) {
      try {
        const formData = new FormData();
        formData.append('file', fileData.file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Upload failed');
        }

        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileData.id 
              ? { ...f, status: 'success', vectorStoreId: result.vectorStoreId }
              : f
          )
        );

        // Notify parent component of successful upload
        if (onUploadSuccess) {
          onUploadSuccess(result.vectorStoreId);
        }

        toast.success(`PDF "${fileData.file.name}" uploaded successfully!`);
      } catch (error) {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileData.id 
              ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
              : f
          )
        );
        toast.error(`Failed to upload "${fileData.file.name}": ${error instanceof Error ? error.message : 'Upload failed'}`);
      }
    }
    
    setIsUploading(false);
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload PDF Documents
          </CardTitle>
          <CardDescription>
            Upload PDF files to create a vector store and start chatting with your documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            {isDragActive ? (
              <p className="text-lg font-medium text-blue-600">Drop the PDF files here...</p>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">Drag & drop PDF files here</p>
                <p className="text-gray-500 mb-4">or click to browse files</p>
                <Button variant="outline">Choose Files</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {isUploading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Processing files...</span>
                <span>{uploadedFiles.filter(f => f.status === 'uploading').length} remaining</span>
              </div>
              <Progress value={uploadedFiles.filter(f => f.status !== 'uploading').length / uploadedFiles.length * 100} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Uploaded Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedFiles.map((fileData) => (
                <div
                  key={fileData.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(fileData.status)}`}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(fileData.status)}
                    <div>
                      <p className="font-medium">{fileData.file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(fileData.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {fileData.status === 'error' && fileData.error && (
                        <p className="text-sm text-red-600">{fileData.error}</p>
                      )}
                      {fileData.status === 'success' && (
                        <p className="text-sm text-green-600">Vector store created successfully</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(fileData.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {uploadedFiles.some(f => f.status === 'success') && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            PDF files uploaded successfully! You can now start chatting with your documents.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
