# RAZORPAY PAYMENT FIX - CSP & 401 Error

## Problem Identified
Your console shows:
1. **CSP blocking**: `lumberjack.razorpay.com` is blocked
2. **401 Unauthorized**: Razorpay API authentication failing

## Solution

### Fix 1: Update CSP Policy in netlify.toml (CRITICAL)

Open `netlify.toml` and find line 26 (the Content-Security-Policy line).

**CURRENT (Line 26)**:
```
connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.strava.com https://api.postalpincode.in https://api.razorpay.com https://www.facebook.com;
```

**CHANGE TO**:
```
connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.strava.com https://api.postalpincode.in https://api.razorpay.com https://lumberjack.razorpay.com https://www.facebook.com;
```

**What changed**: Added `https://lumberjack.razorpay.com` after `https://api.razorpay.com`

### Fix 2: Verify Razorpay Dashboard Settings

1. Go to Razorpay Dashboard → Settings → API Keys
2. Ensure you're using the **LIVE** key (starts with `rzp_live_`)
3. Check if your key is **ACTIVE** (not expired/deactivated)

### Fix 3: Verify Razorpay Domain Whitelist

In Razorpay Dashboard → Settings → Website Checkout Settings:
Add ALL these domains:
- `https://pedalpulse.in`
- `https://pedalpulse.in/`
- `https://www.pedalpulse.in`
- `https://www.pedalpulse.in/`

### Fix 4: Check Netlify Environment Variables

Ensure these are set exactly (case-sensitive):
- `VITE_RAZORPAY_KEY_ID` = `rzp_live_R8gZv2A5epuJef` (your live key)
- `VITE_SUPABASE_URL` = Your Supabase URL
- `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key

### Deploy

After making the netlify.toml change:

```bash
git add netlify.toml
git commit -m "fix: Add Razorpay lumberjack domain to CSP"
git push
```

Wait 2-3 minutes for Netlify to redeploy, then test payment again.

---

## Why This Fixes It

**CSP Issue**: Razorpay's `lumberjack.razorpay.com` is their analytics/tracking service. Without it in the CSP, the browser blocks these requests, causing payment to fail.

**401 Error**: This happens when:
1. Domain not whitelisted in Razorpay
2. Wrong API key
3. CSP blocking the requests (which we're fixing)

---

## Testing After Fix

1. Clear browser cache (Ctrl+Shift+Del)
2. Go to www.pedalpulse.in
3. Try payment again
4. Open console (F12) - you should NOT see:
   - CSP violations
   - 401 errors
5. Payment should work!

---

## If Still Fails After CSP Fix

The 401 error suggests authentication issue. Double-check:

1. **In Razorpay Dashboard**:
   - Settings → API Keys
   - Is the key ACTIVE?
   - Copy the exact key (don't type it manually)

2. **In Netlify Dashboard**:
   - Site Settings → Environment Variables
   - Is `VITE_RAZORPAY_KEY_ID` set to the LIVE key?
   - Delete and re-add the variable (sometimes helps)
   - Trigger a new deploy

3. **Test Mode**:
   Temporarily switch to TEST key to isolate the issue:
   - Use `rzp_test_xxxxx` instead of `rzp_live_xxxxx`
   - If test works but live doesn't → Live key issue
   - If both fail → Code/domain issue

---

## Quick Verification

After deploying, run this in console on www.pedalpulse.in:

```javascript
// Should return your key
console.log('Key:', import.meta.env.VITE_RAZORPAY_KEY_ID);

// Test CSP - should NOT show errors
fetch('https://lumberjack.razorpay.com/v1/track?test=1')
  .then(() => console.log('✅ CSP allows lumberjack'))
  .catch(e => console.log('❌ CSP still blocking:', e));
```

If you see `✅ CSP allows lumberjack`, the fix worked!
