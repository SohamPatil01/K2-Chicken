# 🚀 Quick Setup Guide for Vercel

Follow these steps to get your app live on Vercel:

## Step 1: Create a Cloud Database (5 minutes)

### Option A: Neon (Recommended - Free Forever Tier)

1. Go to https://neon.tech
2. Click "Sign Up" → Sign in with GitHub
3. Click "Create a project"
4. Name it "k2-chicken" (or any name)
5. **Copy the connection string** - it looks like:
   ```
   postgres://user:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
   ```

### Option B: Supabase (Free Tier)

1. Go to https://supabase.com
2. Click "Start your project" → Sign in with GitHub
3. Click "New Project"
4. Fill in project details
5. Go to **Settings → Database**
6. **Copy the "Connection string"** (URI format)

### Option C: Railway (Free Trial)

1. Go to https://railway.app
2. Sign in with GitHub
3. Click "New Project" → "Provision PostgreSQL"
4. Click on the PostgreSQL service
5. Go to **Variables** tab
6. **Copy the `DATABASE_URL`** value

## Step 2: Add Environment Variables to Vercel (2 minutes)

1. Go to https://vercel.com/dashboard
2. Click on your project (or create one if you haven't)
3. Go to **Settings → Environment Variables**
4. Click **Add New**
5. Add these variables one by one:

   ```
   Name: DATABASE_URL
   Value: [paste your connection string from Step 1]
   Environment: Production, Preview, Development (select all)
   ```

   ```
   Name: JWT_SECRET
   Value: [generate a random string, at least 32 characters]
   Example: my-super-secret-jwt-key-12345678901234567890
   Environment: Production, Preview, Development
   ```

   ```
   Name: ADMIN_USERNAME
   Value: admin
   Environment: Production, Preview, Development
   ```

   ```
   Name: ADMIN_PASSWORD
   Value: [choose a secure password]
   Environment: Production, Preview, Development
   ```

   ```
   Name: NEXT_PUBLIC_UPI_ID
   Value: your-upi-id@paytm
   Environment: Production, Preview, Development
   ```

   ```
   Name: DB_INIT_TOKEN
   Value: [generate a random secret token]
   Example:     
   Environment: Production, Preview, Development
   ```

6. Click **Save** for each variable

## Step 3: Deploy to Vercel (Automatic)

If you've connected your GitHub repo to Vercel, it will automatically deploy when you push. Otherwise:

1. In Vercel dashboard, click **Add New Project**
2. Import your GitHub repository: `SohamPatil01/K2-Chicken`
3. Vercel will auto-detect Next.js
4. Click **Deploy**

## Step 4: Initialize Database (1 minute)

After deployment completes:

1. **Get your app URL** from Vercel dashboard (e.g., `https://k2-chicken.vercel.app`)

2. **Call the initialization endpoint:**

   **Option A: Using curl (Terminal)**

   ```bash
   curl "https://your-app.vercel.app/api/admin/init-db?token=your-db-init-token"
   ```

   **Option B: Using Browser**

   - Visit with token:
     ```
     https://your-app.vercel.app/api/admin/init-db?token=your-db-init-token
     ```
   - If you didn't set `DB_INIT_TOKEN`, use the default:
     ```
     https://your-app.vercel.app/api/admin/init-db?token=change-this-token
     ```
   - You should see a success message

3. **Verify it worked:**
   - Visit your app: `https://your-app.vercel.app`
   - You should see products and the homepage loading

## Step 5: Secure Your App (Important!)

After initialization:

1. **Option A: Delete the init endpoint** (Recommended)

   - Delete `/app/api/admin/init-db/route.ts` from your repo
   - Commit and push

2. **Option B: Keep it but protect it**
   - Keep `DB_INIT_TOKEN` secret
   - Never share it publicly

## ✅ You're Done!

Your app should now be live and working! Visit your Vercel URL to see it.

## Troubleshooting

### "ECONNREFUSED" Error

- ✅ Make sure `DATABASE_URL` is set in Vercel
- ✅ Check that your connection string is correct
- ✅ Ensure your database allows connections from Vercel IPs

### "Database not initialized"

- ✅ Call `/api/admin/init-db` endpoint
- ✅ Check Vercel function logs for errors

### "Unauthorized" when calling init-db

- ✅ Make sure `DB_INIT_TOKEN` matches in your request header
- ✅ Or remove the token check temporarily

## Need Help?

Check the full guide: `VERCEL_DEPLOYMENT.md`
