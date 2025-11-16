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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Error details:', errorMessage);
    if (errorStack) {
      console.error('Error stack:', errorStack);
    }
    
    // Return a user-friendly error response
    return NextResponse.json({
      success: true,
      response: {
        response: "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.",
        buttons: [
          { type: "reply", reply: { id: "hi", title: "Start Over" } },
          { type: "reply", reply: { id: "view_menu", title: "View Menu" } },
          { type: "reply", reply: { id: "talk_human", title: "Talk to Human" } }
        ]
      }
    });
  }
}
