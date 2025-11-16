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

    console.log(`Processing message for user ${user_id}: ${message}`);

    // Initialize chatbot
    const chatbot = new WhatsAppChatbot();
    
    // Process message with timeout
    const response = await Promise.race([
      chatbot.handleMessage(user_id, message),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      )
    ]) as any;
    
    console.log(`Chatbot response for user ${user_id}:`, response);
    
    return NextResponse.json({
      success: true,
      response
    });
  } catch (error) {
    console.error('Error processing test message:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    } else {
      console.error('Unknown error:', JSON.stringify(error));
    }
    
    return NextResponse.json(
      { error: "Failed to process message. Try again later." },
      { status: 500 }
    );
  }
}
