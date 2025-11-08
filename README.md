# 🐔 Chicken Vicken - E-commerce Website

A comprehensive e-commerce website for "Chicken Vicken" featuring dynamic product management, shopping cart functionality, recipe cookbook, and admin panel.

## ✨ Features

### 🛒 E-commerce Functionality

- **Product Catalog**: Real-time product fetching from PostgreSQL database
- **Shopping Cart**: Add/remove items, adjust quantities, persistent cart state
- **Order Management**: Complete order form with customer details and delivery address
- **Order Confirmation**: Detailed order summary with estimated delivery time

### 👨‍🍳 Recipe Cookbook

- **Recipe Database**: Store and display chicken recipes with ingredients and instructions
- **Cooking Details**: Prep time, cook time, servings, and step-by-step instructions
- **Recipe Management**: Admin can add, edit, and delete recipes

### 🔧 Admin Panel

- **Product Management**: Add, edit, delete products and update prices remotely
- **Recipe Management**: Manage the recipe cookbook
- **Order Management**: View and update order status (pending, preparing, ready, delivered)

### 🎨 Design & Branding

- **Chicken Vicken Branding**: Catchy tagline "Finger Lickin' Good!" throughout
- **Vibrant Design**: Chicken-themed colors (red, yellow, orange accents)
- **Responsive Layout**: Optimized for both desktop and mobile ordering
- **Modern UI**: Clean, appetizing design with smooth animations

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, PostgreSQL
- **Database**: PostgreSQL with connection pooling
- **Styling**: Tailwind CSS with custom chicken-themed colors
- **State Management**: React Context for cart management
- **Form Handling**: React Hook Form with Zod validation

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd K2chicken
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up PostgreSQL database**

   - Install PostgreSQL on your system
   - Create a database named `chicken_vicken`
   - Update the database connection details in your environment variables

4. **Environment Variables**
   Create a `.env.local` file with the following variables:

   ```env
   # Database
   POSTGRES_USER=postgres
   POSTGRES_HOST=localhost
   POSTGRES_DB=chicken_vicken
   POSTGRES_PASSWORD=your_password
   POSTGRES_PORT=5432

   # Google Maps API (for accurate delivery distance calculation)
   # Get your API key from: https://console.cloud.google.com/google/maps-apis
   # Required APIs: Geocoding API, Distance Matrix API, Maps JavaScript API
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   # Optional: Server-side API key (more secure)
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key

   # Admin Authentication (SECURE - Required for production)
   # Generate password hash using: node scripts/setup-admin-credentials.js
   ADMIN_USERNAME=your_admin_username
   ADMIN_PASSWORD_HASH=your_bcrypt_hashed_password
   JWT_SECRET=your_secure_jwt_secret_key_minimum_32_characters

   # UPI Payment (for QR code payments on delivery orders)
   # Format: phone@paytm, phone@ybl, or your UPI ID
   NEXT_PUBLIC_UPI_ID=8484978622@paytm
   ```

5. **Set up Admin Credentials (IMPORTANT)**

   For secure admin access, you must set up admin credentials:
   
   ```bash
   node scripts/setup-admin-credentials.js
   ```
   
   This will prompt you for a username and password, then generate a secure password hash.
   Add the output to your `.env.local` file as shown above.
   
   ⚠️ **Security Note**: Never commit `.env.local` to version control. Keep your admin credentials secure.

6. **Initialize the database**

   Run the comprehensive setup script that creates all tables and adds demo data:
   
   ```bash
   node scripts/setup-database.js
   ```
   
   This script will:
   - Create all database tables (products, orders, recipes, promotions, users, etc.)
   - Add stock and weight options support
   - Create demo promotions (so they show on the homepage)
   - Add default delivery time slots
   - Set up default settings
   
   ⚠️ **Important**: If promotions and photos don't show after cloning, make sure you run this script!

## 🔧 Troubleshooting

### Promotions Not Showing
If promotions don't appear on the homepage after cloning:
1. Make sure you've run `node scripts/setup-database.js`
2. Check that the `promotions` table exists in your database
3. Verify that promotions are active and within their date range
4. Check browser console for any API errors

### Product Images Not Loading
If product images don't display:
1. Ensure image files exist in `public/images/` directory
2. Check that image paths in the database match actual file names
3. Update product images from the admin panel if needed
4. Verify the `public/images/` folder is committed to git

### Database Connection Issues
If you get database connection errors:
1. Verify PostgreSQL is running: `pg_isready` or check service status
2. Confirm database credentials in `.env.local` are correct
3. Ensure the database `chicken_vicken` exists
4. Check PostgreSQL is listening on the correct port (default: 5432)

7. **Start the development server**

   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to `http://localhost:3000`

## 🗄️ Database Schema

### Products Table

- `id`: Primary key
- `name`: Product name
- `description`: Product description
- `price`: Product price
- `image_url`: Product image URL
- `category`: Product category (main, appetizer, side, beverage)
- `is_available`: Availability status
- `created_at`, `updated_at`: Timestamps

### Orders Table

- `id`: Primary key
- `customer_name`: Customer's full name
- `customer_phone`: Customer's phone number
- `delivery_address`: Delivery address
- `total_amount`: Order total
- `status`: Order status (pending, preparing, ready, delivered)
- `estimated_delivery`: Estimated delivery time
- `created_at`: Order creation timestamp

### Order Items Table

- `id`: Primary key
- `order_id`: Foreign key to orders table
- `product_id`: Foreign key to products table
- `quantity`: Item quantity
- `price`: Item price at time of order
- `created_at`: Creation timestamp

### Recipes Table

- `id`: Primary key
- `title`: Recipe title
- `description`: Recipe description
- `ingredients`: Array of ingredients
- `instructions`: Array of cooking instructions
- `image_url`: Recipe image URL
- `prep_time`: Preparation time in minutes
- `cook_time`: Cooking time in minutes
- `servings`: Number of servings
- `created_at`: Creation timestamp

## 🛠️ API Endpoints

### Products

- `GET /api/products` - Fetch all products
- `POST /api/products` - Create new product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Orders

- `GET /api/orders` - Fetch all orders
- `POST /api/orders` - Create new order
- `GET /api/orders/[id]` - Fetch specific order
- `PUT /api/orders/[id]` - Update order status

### Recipes

- `GET /api/recipes` - Fetch all recipes
- `POST /api/recipes` - Create new recipe
- `GET /api/recipes/[id]` - Fetch specific recipe
- `PUT /api/recipes/[id]` - Update recipe
- `DELETE /api/recipes/[id]` - Delete recipe

## 📱 Pages & Routes

- `/` - Homepage with hero, product catalog, recipes, and features
- `/cart` - Shopping cart page
- `/checkout` - Order form and checkout
- `/order-confirmation/[id]` - Order confirmation page
- `/recipes` - Recipe cookbook page
- `/recipes/[id]` - Individual recipe page
- `/admin` - Admin dashboard
- `/menu` - Product catalog page

## 🎨 Customization

### Colors

The website uses a custom color palette defined in `tailwind.config.js`:

- `chicken-red`: #DC2626
- `chicken-yellow`: #F59E0B
- `chicken-orange`: #EA580C
- `chicken-gold`: #FCD34D

### Branding

- Company name: "Chicken Vicken"
- Tagline: "Finger Lickin' Good!"
- Logo: 🐔 emoji with gradient background

## 🚀 Deployment

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Start the production server**

   ```bash
   npm start
   ```

3. **Database setup**
   - Ensure PostgreSQL is running
   - Run the database initialization script
   - Update environment variables for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🐔 About Chicken Vicken

Chicken Vicken is your neighborhood's favorite chicken shop, serving the most finger-lickin' good chicken in town! We pride ourselves on using only the freshest ingredients and our secret family recipes to bring you the best chicken experience possible.

**"Finger Lickin' Good!"** 🍗
