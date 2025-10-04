import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, vectorStoreId, previousResponseId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!vectorStoreId) {
      return NextResponse.json(
        { error: 'Vector store ID is required' },
        { status: 400 }
      );
    }

    // Create a response using the Responses API with file_search tool
    const response = await openai.responses.create({
      model: 'gpt-4o-mini',
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: message,
            },
          ],
        },
      ],
      tools: [
        {
          type: 'file_search',
          vector_store_ids: [vectorStoreId],
        },
      ],
      // Enable conversation state if previous response ID is provided
      ...(previousResponseId && { previous_response_id: previousResponseId }),
      store: true, // Enable storage for conversation state
    });

    // Extract the response content
    const responseContent = response.output_text || 'Sorry, I could not generate a response.';

    return NextResponse.json({ 
      response: responseContent,
      responseId: response.id, // Return response ID for conversation chaining
      usage: response.usage 
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
