import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing Responses API...');
    
    // Test basic Responses API without file search
    const response = await openai.responses.create({
      model: 'gpt-4o-mini',
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: 'Hello, this is a test of the Responses API. Please respond with "API working!"',
            },
          ],
        },
      ],
      store: true,
    });

    console.log('✅ Responses API test successful:', response.output_text);

    return NextResponse.json({
      success: true,
      response: response.output_text,
      responseId: response.id,
    });

  } catch (error) {
    console.error('❌ Responses API test failed:', error);
    return NextResponse.json(
      { error: 'Responses API test failed', details: error.message },
      { status: 500 }
    );
  }
}
