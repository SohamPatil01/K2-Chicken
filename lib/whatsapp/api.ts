export interface WhatsAppMessage {
  to: string;
  text?: string;
  buttons?: any[];
  list_sections?: any[];
  template_name?: string;
  template_components?: any[];
}

export class WhatsAppAPI {
  private accessToken: string;
  private phoneNumberId: string;
  private baseUrl: string;

  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    this.baseUrl = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`;
  }

  async sendMessage(recipient_id: string, message_text: string, buttons?: any[], list_sections?: any[]): Promise<any> {
    const payload: any = {
      messaging_product: "whatsapp",
      to: recipient_id.replace("whatsapp:", ""),
      type: "text",
      text: { body: message_text }
    };

    // Handle interactive messages
    if (buttons && buttons.length > 0) {
      payload.type = "interactive";
      payload.interactive = {
        type: "button",
        body: { text: message_text },
        action: {
          buttons: buttons.map(btn => ({
            type: "reply",
            reply: btn.reply
          }))
        }
      };
    } else if (list_sections && list_sections.length > 0) {
      payload.type = "interactive";
      payload.interactive = {
        type: "list",
        body: { text: message_text },
        action: {
          button: "Select an Option",
          sections: list_sections
        }
      };
    }

    return this.sendRequest(payload);
  }

  async sendTemplateMessage(recipient_id: string, template_name: string, components: any[]): Promise<any> {
    const payload = {
      messaging_product: "whatsapp",
      to: recipient_id.replace("whatsapp:", ""),
      type: "template",
      template: {
        name: template_name,
        language: { code: "en_US" },
        components
      }
    };

    return this.sendRequest(payload);
  }

  private async sendRequest(payload: any): Promise<any> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`WhatsApp API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('WhatsApp API response:', result);
      return result;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }

  // Mock implementation for development/testing
  async sendMessageMock(recipient_id: string, message_text: string, buttons?: any[], list_sections?: any[]): Promise<any> {
    console.log('Mock WhatsApp API - Sending message:', {
      to: recipient_id,
      text: message_text,
      buttons,
      list_sections
    });
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      status: "success",
      message_id: `mock_msg_${Date.now()}`,
      recipient_id,
      message_text
    };
  }

  async sendTemplateMessageMock(recipient_id: string, template_name: string, components: any[]): Promise<any> {
    console.log('Mock WhatsApp API - Sending template:', {
      to: recipient_id,
      template_name,
      components
    });
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      status: "success",
      message_id: `mock_template_${Date.now()}`,
      recipient_id,
      template_name
    };
  }
}
