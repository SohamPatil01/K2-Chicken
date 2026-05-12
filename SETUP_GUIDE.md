# 🚀 Quick Setup Guide

## Why Promotions and Photos Don't Show After Cloning

**The Issue:**
- Promotions are stored in the **database**, not in the code
- When you clone the repository, the database is empty
- Product images need to be properly linked in the database

## ✅ Solution: Run the Setup Script

After cloning the repository, you **MUST** run the database setup script:

```bash
node scripts/setup-database.js
```

This script will:
1. ✅ Create all database tables (products, orders, recipes, **promotions**, users, etc.)
2. ✅ Add **demo promotions** (so they show on the homepage)
3. ✅ Add sample products with correct image paths
4. ✅ Set up weight options for products
5. ✅ Create delivery time slots
6. ✅ Initialize all settings

## 📋 Complete Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/SohamPatil01/K2-Chicken.git
   cd K2-Chicken
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create `.env.local` file:
   ```env
   POSTGRES_USER=postgres
   POSTGRES_HOST=localhost
   POSTGRES_DB=chicken_vicken
   POSTGRES_PASSWORD=your_password
   POSTGRES_PORT=5432
   JWT_SECRET=your_secure_jwt_secret_key_minimum_32_characters
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   NEXT_PUBLIC_UPI_ID=8484978622@paytm
   ```

4. **Create PostgreSQL database**
   ```bash
   createdb chicken_vicken
   # Or using psql:
   psql -U postgres -c "CREATE DATABASE chicken_vicken;"
   ```

5. **Run the setup script** ⭐ **THIS IS CRITICAL!**
   ```bash
   node scripts/setup-database.js
   ```

6. **Start the server**
   ```bash
   npm run dev
   ```

7. **Visit the website**
   Open `http://localhost:3000` - promotions should now be visible!

## 🔍 Verifying Setup

### Check if Promotions Table Exists
```bash
psql -U postgres -d chicken_vicken -c "SELECT COUNT(*) FROM promotions;"
```

### Check if Promotions Have Data
```bash
psql -U postgres -d chicken_vicken -c "SELECT title, promo_code, is_active FROM promotions;"
```

### Check Product Images
```bash
psql -U postgres -d chicken_vicken -c "SELECT name, image_url FROM products LIMIT 5;"
```

## 🐛 Common Issues

### Issue: "Promotions tab not showing"
**Solution:** Run `node scripts/setup-database.js` - this creates the promotions table and adds demo data.

### Issue: "Product images not loading"
**Solution:** 
1. Check that images exist in `public/images/` folder
2. Run the setup script to ensure products have correct image paths
3. Update images from admin panel if needed

### Issue: "Database connection error"
**Solution:**
1. Ensure PostgreSQL is running
2. Check `.env.local` has correct credentials
3. Verify database `chicken_vicken` exists

## 📝 Notes

- The setup script is **idempotent** - you can run it multiple times safely
- It won't overwrite existing data
- Demo promotions are added only if the table is empty
- Product images use paths like `/images/Chicken-Curry-Cut.jpg` (must exist in `public/images/`)

## 🎯 After Setup

Once the setup script completes:
- ✅ Promotions will appear on the homepage
- ✅ Products will have images
- ✅ All features will be functional
- ✅ You can start using the admin panel to manage content

---

**Remember:** Always run `node scripts/setup-database.js` after cloning the repository on a new device!

---

## Google Business Profile Review Sync

To sync real Google reviews from your shop into the website, you need to complete a one-time OAuth setup.

### Prerequisites

1. A Google account that has access to the K2 Chicken Google Business Profile.
2. A Google Cloud project with the **My Business Business Information API** enabled.

### Step 1 — Create OAuth credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**.
2. Click **Create Credentials** → **OAuth client ID** → choose **Web application**.
3. Under **Authorized redirect URIs**, add `https://developers.google.com/oauthplayground`.
4. Copy the **Client ID** and **Client Secret**.

### Step 2 — Get the refresh token

1. Visit [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/).
2. Click the ⚙️ gear icon → check **Use your own OAuth credentials** → paste your Client ID and Secret.
3. In the scopes box on the left, enter:
   ```
   https://www.googleapis.com/auth/business.manage
   ```
4. Click **Authorize APIs** and sign in with the Google account that has access to your Business Profile.
5. Click **Exchange authorization code for tokens**.
6. Copy the **Refresh token**.

### Step 3 — Find your Account ID and Location ID

Run the following `curl` to list your accounts (replace `ACCESS_TOKEN` with the short-lived token from the Playground):

```bash
curl -H "Authorization: Bearer ACCESS_TOKEN" \
  "https://mybusiness.googleapis.com/v4/accounts"
```

Then list locations for your account:

```bash
curl -H "Authorization: Bearer ACCESS_TOKEN" \
  "https://mybusiness.googleapis.com/v4/accounts/YOUR_ACCOUNT_ID/locations"
```

Copy the `name` field — it looks like `accounts/123456789/locations/987654321`.

### Step 4 — Add env vars

Add the following to your `.env.local` (and to Vercel → Project Settings → Environment Variables):

```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token
GBP_ACCOUNT_ID=accounts/123456789
GBP_LOCATION_ID=locations/987654321
```

### Step 5 — Sync

Go to **Admin → Reviews** and click **Sync Now**. Reviews will be imported and displayed on the homepage and product pages.


