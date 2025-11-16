# Vercel Deployment Guide

## Database Setup for Vercel

Vercel doesn't support local databases. You need to use a cloud PostgreSQL database.

### Option 1: Neon (Recommended - Free Tier Available)

1. **Sign up at [Neon](https://neon.tech)**
   - Go to https://neon.tech
   - Sign up with GitHub
   - Create a new project

2. **Get your connection string**
   - After creating a project, you'll see a connection string like:
     ```
     postgres://user:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
     ```

3. **Add to Vercel Environment Variables**
   - Go to your Vercel project → Settings → Environment Variables
   - Add: `DATABASE_URL` = your Neon connection string
   - Select all environments (Production, Preview, Development)

### Option 2: Supabase (Free Tier Available)

1. **Sign up at [Supabase](https://supabase.com)**
   - Go to https://supabase.com
   - Create a new project

2. **Get your connection string**
   - Go to Project Settings → Database
   - Copy the "Connection string" (URI format)

3. **Add to Vercel Environment Variables**
   - Add: `DATABASE_URL` = your Supabase connection string

### Option 3: Railway (Free Trial)

1. **Sign up at [Railway](https://railway.app)**
   - Create a new PostgreSQL database
   - Copy the connection string from the database settings

2. **Add to Vercel Environment Variables**
   - Add: `DATABASE_URL` = your Railway connection string

## Required Environment Variables in Vercel

Add all these in Vercel Dashboard → Project Settings → Environment Variables:

### Database (Choose one method)

**Method 1: Connection String (Recommended)**
```
DATABASE_URL=postgres://user:password@host:port/database?sslmode=require
```

**Method 2: Individual Config (if not using DATABASE_URL)**
```
POSTGRES_USER=your_user
POSTGRES_HOST=your_host
POSTGRES_DB=your_database
POSTGRES_PASSWORD=your_password
POSTGRES_PORT=5432
```

### Authentication
```
JWT_SECRET=your_secure_jwt_secret_key_minimum_32_characters
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password
```

### UPI Payment
```
NEXT_PUBLIC_UPI_ID=your_upi_id@paytm
```

## Initialize Database

After deploying, you need to initialize your database schema. **The easiest way is using the API endpoint:**

### Option 1: Use the API Endpoint (Easiest) ✅

1. **Add a security token** (optional but recommended):
   - In Vercel → Environment Variables
   - Add: `DB_INIT_TOKEN` = `your-secret-token-here`

2. **Call the initialization endpoint:**
   ```bash
   # With token (recommended):
   curl -H "x-init-token: your-secret-token-here" https://your-app.vercel.app/api/admin/init-db
   
   # Or visit in browser (if no token set):
   https://your-app.vercel.app/api/admin/init-db
   ```

3. **You should see:**
   ```json
   {
     "success": true,
     "message": "Database initialized successfully! All tables created and sample data inserted."
   }
   ```

4. **⚠️ IMPORTANT**: After initialization, either:
   - Delete the `/app/api/admin/init-db/route.ts` file, OR
   - Keep the `DB_INIT_TOKEN` secret and never share it

### Option 2: Use Vercel CLI
   ```bash
   vercel env pull .env.local
   # Then run locally:
   node scripts/setup-database.js
   ```

### Option 3: Connect directly to your cloud database
   - Use a database client (like pgAdmin, DBeaver, or TablePlus)
   - Connect using your connection string
   - Run the SQL from `scripts/setup-database.js` manually

## Troubleshooting

### Error: `ECONNREFUSED 127.0.0.1:5432`
- **Cause**: Database connection is pointing to localhost
- **Fix**: Make sure `DATABASE_URL` is set in Vercel environment variables

### Error: `SSL connection required`
- **Cause**: Cloud databases require SSL
- **Fix**: Make sure your connection string includes `?sslmode=require` or the code handles SSL

### Database not initialized
- **Cause**: Tables don't exist
- **Fix**: Run the setup script as described above

## Quick Setup Checklist

- [ ] Create cloud PostgreSQL database (Neon/Supabase/Railway)
- [ ] Copy connection string
- [ ] Add `DATABASE_URL` to Vercel environment variables
- [ ] Add other required environment variables to Vercel
- [ ] Deploy to Vercel
- [ ] Initialize database schema
- [ ] Test the application

