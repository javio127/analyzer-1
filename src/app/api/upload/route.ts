import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    console.log('📁 Starting PDF upload process...');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.log('❌ No file provided');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      console.log('❌ Invalid file type:', file.type);
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    console.log('✅ File validation passed:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Convert File to Buffer
    console.log('🔄 Converting file to buffer...');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log('✅ Buffer created, size:', buffer.length);

    // Upload file to OpenAI
    console.log('🔄 Uploading file to OpenAI...');
    console.log('📊 Buffer details:', { size: buffer.length, type: typeof buffer });
    console.log('📊 Purpose:', 'user_data');
    
    let uploadedFile;
    try {
      // Add timeout to prevent hanging
      const uploadPromise = openai.files.create({
        file: buffer,
        purpose: 'user_data',
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Upload timeout after 30 seconds')), 30000)
      );
      
      console.log('⏳ Starting upload with timeout...');
      uploadedFile = await Promise.race([uploadPromise, timeoutPromise]);
      console.log('✅ File uploaded to OpenAI:', uploadedFile.id);
    } catch (uploadError) {
      console.error('❌ File upload failed:', uploadError);
      console.error('❌ Error details:', {
        message: uploadError.message,
        name: uploadError.name,
        stack: uploadError.stack
      });
      throw uploadError;
    }

    // Add file to existing vector store
    const vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID || 'vs_your_vector_store_id_here';
    
    if (vectorStoreId === 'vs_your_vector_store_id_here') {
      console.log('⚠️ No vector store ID configured, skipping vector store addition');
      return NextResponse.json({
        success: true,
        vectorStoreId: null,
        fileId: uploadedFile.id,
        fileName: file.name,
        message: 'File uploaded but no vector store configured'
      });
    }

    console.log('🔄 Adding file to vector store:', vectorStoreId);
    try {
      await openai.beta.vectorStores.files.create(vectorStoreId, {
        file_id: uploadedFile.id,
      });
      console.log('✅ File added to vector store successfully');
    } catch (vectorStoreError) {
      console.error('❌ Failed to add file to vector store:', vectorStoreError);
      // Don't throw error - file was uploaded successfully
    }
    
    console.log('🎉 File upload completed successfully!');
    console.log('📊 Using vector store:', vectorStoreId);

    return NextResponse.json({
      success: true,
      vectorStoreId: vectorStoreId,
      fileId: uploadedFile.id,
      fileName: file.name,
    });

  } catch (error) {
    console.error('💥 Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF file' },
      { status: 500 }
    );
  }
}
