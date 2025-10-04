import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, vectorStoreId, previousResponseId } = await request.json();

    console.log('💬 Chat request:', { 
      message: message.substring(0, 50) + '...', 
      vectorStoreId, 
      hasPreviousResponse: !!previousResponseId 
    });

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!vectorStoreId) {
      return NextResponse.json({ error: 'Vector store ID is required' }, { status: 400 });
    }

    // Create streaming response with file_search tool
    const stream = await openai.responses.create({
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
      ...(previousResponseId && { previous_response_id: previousResponseId }),
      store: true,
      stream: true,
    });

    // Process streaming events and send real-time updates
    const encoder = new TextEncoder();
    
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          let responseContent = '';
          let citations: Array<{ file_id: string; filename: string }> = [];
          let responseId = '';
          let usage = null;

          for await (const event of stream) {
            console.log('📡 Streaming event:', event.type);
            
            switch (event.type) {
              case 'response.created':
                responseId = event.response_id;
                break;
                
              case 'response.output_text.delta':
                responseContent += event.delta;
                // Send real-time text updates
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'delta',
                  content: event.delta
                })}\n\n`));
                break;
                
              case 'response.output_text_annotation.added':
                if (event.annotation.type === 'file_citation') {
                  citations.push({
                    file_id: event.annotation.file_id,
                    filename: event.annotation.filename,
                  });
                }
                break;
                
              case 'response.file_search_call.in_progress':
                console.log('🔍 File search started...');
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'status',
                  message: 'Searching through your PDF...'
                })}\n\n`));
                break;
                
              case 'response.file_search_call.searching':
                console.log('🔍 Searching through files...');
                break;
                
              case 'response.file_search_call.completed':
                console.log('✅ File search completed');
                break;
                
              case 'response.completed':
                usage = event.usage;
                // Send final response with citations
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'complete',
                  response: responseContent,
                  citations: citations,
                  responseId: responseId,
                  usage: usage
                })}\n\n`));
                break;
                
              case 'error':
                console.error('❌ Streaming error:', event.error);
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'error',
                  error: event.error
                })}\n\n`));
                break;
            }
          }

          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('💥 Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}