# Strava Integration Setup Guide

## 🚀 Setup Steps

### Step 1: Run SQL Migration
Go to **Supabase Dashboard > SQL Editor** and run the `strava_integration.sql` script.

### Step 2: Deploy Edge Function
```bash
npx supabase login
npx supabase functions deploy strava-auth --no-verify-jwt
```

### Step 3: Set Secrets (CRITICAL)
Set your Strava credentials securely in Supabase Edge Function Secrets:
```bash
npx supabase secrets set STRAVA_CLIENT_ID=your_client_id STRAVA_CLIENT_SECRET=your_client_secret
```

> ⚠️ **NEVER commit actual secrets to this file or any source code!**

### Step 4: Frontend Environment
Add to your `.env` file:
```
VITE_STRAVA_CLIENT_ID=your_client_id
```

Then restart your dev server:
```bash
npm run dev
```

### Step 5: Verify Integration
1. Go to Dashboard → Click "Connect with Strava"
2. Authorize the app on Strava
3. You should be redirected back and see your Strava profile connected

## Features Implemented
- ✅ **Phase 1 (Auth)**: Connect/Disconnect Strava, Secure Token Exchange
- ✅ **Phase 2 (Fetch)**: Activity fetching and challenge matching
- ✅ **Phase 4 (UI)**: Registration Form with verification method selection
