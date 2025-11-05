# Google Maps API Setup Guide

This guide will help you set up Google Maps API for the delivery distance calculation feature.

## Why Google Maps API?

The Google Maps API provides:

- **Accurate road distance** (not straight-line distance)
- **Real-time address geocoding** (converting addresses to coordinates)
- **Interactive map picker** for customers to select delivery location
- **Estimated delivery time** calculations

## Step-by-Step Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click **"New Project"**
4. Enter project name (e.g., "K2 Chicken Delivery")
5. Click **"Create"**

### 2. Enable Required APIs

1. In your project, go to **"APIs & Services"** → **"Library"**
2. Search and enable these APIs:
   - **Geocoding API** - Converts addresses to coordinates
   - **Distance Matrix API** - Calculates road distance between locations
   - **Maps JavaScript API** - For the interactive map picker

### 3. Create API Key

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"API Key"**
3. Copy the generated API key
4. (Optional but recommended) Click **"Restrict Key"**:
   - Under **"Application restrictions"**, select **"HTTP referrers"**
   - Add your website URLs:
     - `http://localhost:3000/*`
     - `https://yourdomain.com/*`
   - Under **"API restrictions"**, select **"Restrict key"**
   - Choose only the 3 APIs mentioned above

### 4. Add API Key to Project

1. Open `.env.local` file in your project root
2. Add your API key:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```
3. Save the file

### 5. Restart Development Server

After adding the API key, restart your Next.js development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Free Tier Limits

Google Maps API offers a free tier:

- **$200 credit per month** (equivalent to ~28,000 map loads)
- For most small businesses, this is sufficient
- Check [Google Maps Pricing](https://cloud.google.com/maps-platform/pricing) for details

## Troubleshooting

### "API Key Required" Error

- Make sure `.env.local` file exists in project root
- Verify `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set correctly
- Restart the development server after adding the key
- Check that the API key is not restricted incorrectly

### "This API project is not authorized" Error

- Make sure all 3 APIs are enabled in Google Cloud Console
- Check API key restrictions allow your domain

### Map Not Loading

- Check browser console for errors
- Verify API key has Maps JavaScript API enabled
- Check that API key restrictions allow your domain

## Fallback Mode

If Google Maps API key is not set, the system will:

- Use OpenStreetMap (Nominatim) for geocoding (free but less accurate)
- Use Haversine formula for distance (straight-line, not road distance)
- Map picker will show an error message

While this works, Google Maps provides much better accuracy for delivery calculations.

## Security Notes

- **Never commit** `.env.local` to git (it's already in `.gitignore`)
- Use **API key restrictions** in Google Cloud Console
- For production, consider using server-side API key (`GOOGLE_MAPS_API_KEY`) instead of public key
- Monitor API usage in Google Cloud Console

## Need Help?

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Google Cloud Console](https://console.cloud.google.com/)
- Check project logs for specific error messages
