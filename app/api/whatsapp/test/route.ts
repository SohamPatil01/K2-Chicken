import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppChatbot } from '@/lib/whatsapp/chatbot';

// Test endpoint for WhatsApp chatbot
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, message } = body;

    if (!user_id || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing user_id or message' },
        { status: 400 }
      );
    }

    // Initialize chatbot
    const chatbot = new WhatsAppChatbot();
    
    // Process message
    const response = await chatbot.handleMessage(user_id, message);
    
    return NextResponse.json({
      success: true,
      response
    });
  } catch (error) {
    console.error('Error processing test message:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process message',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
