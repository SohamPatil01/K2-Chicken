export interface ChatbotResponse {
  response: string;
  buttons?: Array<{ type: string; reply: { id: string; title: string } }>;
  list_sections?: any[];
}

export class WhatsAppChatbot {
  private messageHistory: Map<string, any[]> = new Map();

  constructor() {
    // Initialize chatbot
  }

  async handleMessage(user_id: string, message: string): Promise<ChatbotResponse> {
    const normalizedMessage = message.toLowerCase().trim();
    
    // Log incoming message
    await this.logMessage(user_id, 'incoming', message);

    // Simple response logic
    if (normalizedMessage === 'hi' || normalizedMessage === 'hello' || normalizedMessage === 'hey') {
      return {
        response: "Hello! Welcome to K2 Chicken. How can I help you today?",
        buttons: [
          { type: "reply", reply: { id: "view_menu", title: "View Menu" } },
          { type: "reply", reply: { id: "place_order", title: "Place Order" } },
          { type: "reply", reply: { id: "track_order", title: "Track Order" } }
        ]
      };
    }

    if (normalizedMessage === 'view_menu' || normalizedMessage.includes('menu')) {
      return {
        response: "Here's our menu! Visit our website to see all available products and place an order.",
        buttons: [
          { type: "reply", reply: { id: "place_order", title: "Place Order" } },
          { type: "reply", reply: { id: "hi", title: "Back to Main Menu" } }
        ]
      };
    }

    if (normalizedMessage === 'place_order' || normalizedMessage.includes('order')) {
      return {
        response: "To place an order, please visit our website. You can browse our products and add them to your cart!",
        buttons: [
          { type: "reply", reply: { id: "view_menu", title: "View Menu" } },
          { type: "reply", reply: { id: "hi", title: "Back to Main Menu" } }
        ]
      };
    }

    if (normalizedMessage === 'track_order' || normalizedMessage.includes('track')) {
      return {
        response: "To track your order, please visit our website and check your order history.",
        buttons: [
          { type: "reply", reply: { id: "view_menu", title: "View Menu" } },
          { type: "reply", reply: { id: "hi", title: "Back to Main Menu" } }
        ]
      };
    }

    // Default response
    return {
      response: "I'm here to help! You can view our menu, place an order, or track your order. What would you like to do?",
      buttons: [
        { type: "reply", reply: { id: "view_menu", title: "View Menu" } },
        { type: "reply", reply: { id: "place_order", title: "Place Order" } },
        { type: "reply", reply: { id: "hi", title: "Start Over" } }
      ]
    };
  }

  async logMessage(user_id: string, direction: 'incoming' | 'outgoing', message: string): Promise<void> {
    if (!this.messageHistory.has(user_id)) {
      this.messageHistory.set(user_id, []);
    }
    
    const history = this.messageHistory.get(user_id);
    history?.push({
      direction,
      message,
      timestamp: new Date().toISOString()
    });

    // Keep only last 50 messages per user
    if (history && history.length > 50) {
      history.shift();
    }
  }

  getMessageHistory(user_id: string): any[] {
    return this.messageHistory.get(user_id) || [];
  }
}

