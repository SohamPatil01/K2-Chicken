import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppChatbot } from '@/lib/whatsapp/chatbot';
import { WhatsAppAPI } from '@/lib/whatsapp/api';

// Initialize chatbot and API
const chatbot = new WhatsAppChatbot();
const whatsappAPI = new WhatsAppAPI();

// Webhook verification endpoint
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Verify the webhook
  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    console.log('Webhook verified successfully');
    return new NextResponse(challenge, { status: 200 });
  } else {
    console.log('Webhook verification failed');
    return new NextResponse('Verification token mismatch', { status: 403 });
  }
}

// Handle incoming messages from WhatsApp
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('Received WhatsApp webhook:', JSON.stringify(data, null, 2));

    // Verify the webhook is from WhatsApp
    if (data.object === 'whatsapp_business_account') {
      for (const entry of data.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages') {
            const messages = change.value.messages;
            const statuses = change.value.statuses;

            // Handle incoming messages
            if (messages && messages.length > 0) {
              for (const message of messages) {
                await handleIncomingMessage(message);
              }
            }

            // Handle message status updates (optional)
            if (statuses && statuses.length > 0) {
              for (const status of statuses) {
                console.log('Message status update:', status);
              }
            }
          }
        }
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Error processing WhatsApp webhook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

async function handleIncomingMessage(message: any) {
  try {
    const user_id = `whatsapp:${message.from}`;
    let message_text = '';

    // Extract message text based on message type
    if (message.type === 'text') {
      message_text = message.text.body;
    } else if (message.type === 'interactive') {
      // Handle button replies or list selections
      if (message.interactive.button_reply) {
        message_text = message.interactive.button_reply.id;
      } else if (message.interactive.list_reply) {
        message_text = message.interactive.list_reply.id;
      }
    } else if (message.type === 'button') {
      message_text = message.button.payload;
    }

    if (message_text) {
      console.log(`Processing message from ${user_id}: ${message_text}`);
      
      // Process message with chatbot
      const response = await chatbot.handleMessage(user_id, message_text);
      
      // Send response back to user
      if (response.response) {
        await sendResponse(user_id, response);
      }
    }
  } catch (error) {
    console.error('Error handling incoming message:', error);
  }
}

async function sendResponse(user_id: string, response: { response: string; buttons?: any[]; list_sections?: any[] }) {
  try {
    // Use mock API for development, real API for production
    const useMock = process.env.NODE_ENV === 'development' || !process.env.WHATSAPP_ACCESS_TOKEN;
    
    if (useMock) {
      await whatsappAPI.sendMessageMock(
        user_id,
        response.response,
        response.buttons,
        response.list_sections
      );
    } else {
      await whatsappAPI.sendMessage(
        user_id,
        response.response,
        response.buttons,
        response.list_sections
      );
    }

    // Log outgoing message
    await chatbot.logMessage(user_id, 'outgoing', response.response);
    
    console.log(`Response sent to ${user_id}: ${response.response}`);
  } catch (error) {
    console.error('Error sending response:', error);
  }
}
