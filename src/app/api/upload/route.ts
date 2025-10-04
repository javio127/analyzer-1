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
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    console.log('✅ File validation passed:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Step 1: Upload file to OpenAI
    console.log('🔄 Uploading file to OpenAI...');
    const uploadedFile = await openai.files.create({
      file: file,
      purpose: 'assistants',
    });
    console.log('✅ File uploaded to OpenAI:', uploadedFile.id);

    // Step 2: Create a new vector store
    console.log('🔄 Creating vector store...');
    const vectorStore = await openai.vectorStores.create({
      name: `PDF Store - ${file.name}`,
    });
    console.log('✅ Vector store created:', vectorStore.id);

    // Step 3: Add file to vector store
    console.log('🔄 Adding file to vector store...');
    const vectorStoreFile = await openai.vectorStores.files.create(vectorStore.id, {
      file_id: uploadedFile.id,
    });
    console.log('✅ File added to vector store:', vectorStoreFile.id);

    console.log('🎉 Upload completed successfully!');

    return NextResponse.json({
      success: true,
      vectorStoreId: vectorStore.id,
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