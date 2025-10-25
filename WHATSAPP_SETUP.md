# WhatsApp Chatbot Integration for K2 Chicken

This document provides instructions for setting up and using the WhatsApp chatbot integration for the K2 Chicken application.

## Features

- **Order Placement**: Customers can place orders through WhatsApp
- **Menu Browsing**: View menu categories and items
- **Order Tracking**: Track order status in real-time
- **Admin Management**: Manage WhatsApp orders through the admin dashboard
- **Status Updates**: Automatic status notifications to customers

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Database
POSTGRES_USER=your_postgres_user
POSTGRES_HOST=localhost
POSTGRES_DB=chicken_vicken
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_PORT=5432

# WhatsApp Business API (for production)
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token

# Optional: For development/testing
NODE_ENV=development
```

### 2. Database Setup

The database schema will be automatically created when you run the application. The following tables will be created:

- `whatsapp_sessions` - User conversation sessions
- `whatsapp_orders` - WhatsApp orders
- `whatsapp_order_items` - Order items
- `whatsapp_message_logs` - Message logs

### 3. WhatsApp Business API Setup

#### For Production:

1. **Create a Facebook Developer Account**
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create a new app and select "Business" type

2. **Set up WhatsApp Business API**
   - Add WhatsApp product to your app
   - Create a WhatsApp Business Account
   - Add a phone number for API use

3. **Configure Webhook**
   - Set webhook URL: `https://yourdomain.com/api/whatsapp/webhook`
   - Set verify token: Use the same value as `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
   - Subscribe to `messages` field

4. **Get Required Credentials**
   - Access Token: From your app dashboard
   - Phone Number ID: From WhatsApp API setup
   - Webhook Verify Token: Set your own secure token

#### For Development/Testing:

The application includes a mock WhatsApp API that works without real WhatsApp credentials. Simply set `NODE_ENV=development` or don't set the WhatsApp environment variables.

## Usage

### 1. Testing the Chatbot

Visit `/whatsapp-test` to test the chatbot functionality:

- Start a conversation with "hi" or "hello"
- Try commands like "menu", "order", "track", "info"
- Test the full ordering flow

### 2. Admin Management

Access the admin dashboard at `/admin` and navigate to the "WhatsApp Orders" tab to:

- View all WhatsApp orders
- Update order status
- Track order progress
- View order details

### 3. Order Flow

1. **Customer initiates chat** with "hi" or "hello"
2. **Browse menu** by selecting "View Our Full Menu"
3. **Add items to cart** by selecting items and quantities
4. **Choose delivery or pickup**
5. **Provide delivery address** (if delivery)
6. **Select payment method**
7. **Review and confirm order**
8. **Receive order confirmation**

### 4. Status Updates

The system automatically sends status updates to customers:

- **Order Received**: When order is confirmed
- **Preparing**: When kitchen starts preparation
- **Ready for Pickup**: When order is ready (pickup)
- **Out for Delivery**: When order is dispatched (delivery)
- **Delivered**: When order is completed

## API Endpoints

### Webhook Endpoint
- **GET/POST** `/api/whatsapp/webhook` - WhatsApp webhook for receiving messages

### Order Management
- **GET** `/api/whatsapp/orders` - Get all WhatsApp orders
- **POST** `/api/whatsapp/orders` - Create new order
- **GET** `/api/whatsapp/orders/[id]` - Get specific order
- **PUT** `/api/whatsapp/orders/[id]` - Update order
- **DELETE** `/api/whatsapp/orders/[id]` - Delete order

### Status Updates
- **POST** `/api/whatsapp/orders/[id]/status` - Update order status and notify customer

### Testing
- **POST** `/api/whatsapp/test` - Test chatbot functionality

## Deployment

### 1. Database Migration

Ensure your database is set up and the schema is initialized:

```bash
npm run dev
# The database schema will be created automatically
```

### 2. Environment Configuration

Set up your production environment variables:

```env
NODE_ENV=production
WHATSAPP_ACCESS_TOKEN=your_production_token
WHATSAPP_PHONE_NUMBER_ID=your_production_phone_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_secure_webhook_token
```

### 3. Webhook Configuration

1. Deploy your application to a public HTTPS URL
2. Configure the webhook in your WhatsApp Business API dashboard:
   - URL: `https://yourdomain.com/api/whatsapp/webhook`
   - Verify Token: Your `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
   - Subscribe to: `messages`

### 4. Testing Production

1. Send a test message to your WhatsApp Business number
2. Check the webhook logs for incoming messages
3. Verify order creation in the admin dashboard

## Troubleshooting

### Common Issues

1. **Webhook not receiving messages**
   - Check that your webhook URL is HTTPS
   - Verify the webhook verify token matches
   - Check server logs for errors

2. **Database connection issues**
   - Verify PostgreSQL is running
   - Check database credentials
   - Ensure database exists

3. **WhatsApp API errors**
   - Verify access token is valid
   - Check phone number ID is correct
   - Ensure webhook is properly configured

### Debug Mode

Set `NODE_ENV=development` to enable debug logging and mock WhatsApp API.

## Security Considerations

1. **Webhook Security**: Use a strong, unique webhook verify token
2. **Database Security**: Use strong passwords and restrict database access
3. **API Keys**: Store WhatsApp credentials securely
4. **Rate Limiting**: Implement rate limiting for webhook endpoints
5. **Input Validation**: Validate all incoming webhook data

## Support

For issues or questions:

1. Check the application logs
2. Verify environment variables
3. Test with the `/whatsapp-test` page
4. Check the admin dashboard for order status

## Future Enhancements

- Payment gateway integration
- Multi-language support
- Advanced analytics
- Customer preference storage
- Automated order scheduling
- Integration with delivery services
