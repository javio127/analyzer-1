import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing OpenAI API key...');
    
    // Test basic API access
    const models = await openai.models.list();
    console.log('✅ API key is valid, found', models.data.length, 'models');
    
    return NextResponse.json({
      success: true,
      message: 'API key is valid',
      modelCount: models.data.length,
      firstModel: models.data[0]?.id
    });

  } catch (error) {
    console.error('❌ API key test failed:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'API key test failed', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
