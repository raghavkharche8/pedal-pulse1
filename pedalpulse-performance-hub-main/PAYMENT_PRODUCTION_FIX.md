# PAYMENT FAILURE TROUBLESHOOTING - PRODUCTION DOMAIN

## Issue
Payment failing on production domain (www.pedalpulse.in) with error:
```
Oops! Something went wrong.
Payment Failed
```

## Root Causes & Solutions

### 1. **MISSING RAZORPAY ORDER_ID** (Most Likely)

**Problem**: The current code doesn't create a Razorpay order before opening checkout.

**What's Happening**:
- Line 350-414 in PremiumRegistration.tsx creates Razorpay options
- **BUT**: There's NO `order_id` in the options
- Razorpay REQUIRES an order_id created via their API

**Solution**: You need to create a backend function to generate Razorpay orders.

#### Option A: Quick Fix - Use Razorpay Orders API via Supabase Edge Function

Create this file: `supabase/functions/create-razorpay-order/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')!
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, currency, receipt, notes } = await req.json()

    // Create Razorpay order
    const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount, // in paise
        currency: currency || 'INR',
        receipt: receipt || `receipt_${Date.now()}`,
        notes: notes || {},
      }),
    })

    const order = await response.json()

    if (!response.ok) {
      throw new Error(order.error?.description || 'Failed to create order')
    }

    return new Response(
      JSON.stringify({ success: true, order }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
```

**Deploy**:
```bash
npx supabase secrets set RAZORPAY_KEY_ID=your_key_id
npx supabase secrets set RAZORPAY_KEY_SECRET=your_key_secret
npx supabase functions deploy create-razorpay-order
```

**Update PremiumRegistration.tsx** (around line 349):

```tsx
// BEFORE creating Razorpay options, create order first:

// Create Razorpay order via Edge Function
const { data: orderData, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
    body: {
        amount: totalAmount * 100, // in paise
        currency: 'INR',
        receipt: `receipt_${registration.id}`,
        notes: {
            registration_id: registration.id,
            category: formData.category,
        }
    }
});

if (orderError || !orderData?.success) {
    throw new Error(orderData?.error || 'Failed to create payment order');
}

const razorpayOrder = orderData.order;

// NOW create Razorpay options with order_id
const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    order_id: razorpayOrder.id, // ⭐ THIS WAS MISSING!
    name: 'PedalPulse',
    description: `Republic Day Challenge 2026 - ${formData.category.replace('-', ' ').replace('km', ' Km')}`,
    // ... rest of options
```

---

### 2. **Environment Variables Not Set on Netlify**

**Check**: Are your environment variables set on Netlify?

Go to:
1. Netlify Dashboard → Your Site → Site Settings → Environment Variables
2. Ensure these are set:
   - `VITE_RAZORPAY_KEY_ID` = `rzp_live_xxxxx` (or `rzp_test_xxxxx`)
   - `VITE_SUPABASE_URL` = Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key

**Important**: After adding/changing env vars, you MUST redeploy:
```bash
# Trigger new deploy
git commit --allow-empty -m "Redeploy with env vars"
git push
```

---

### 3. **Razorpay Domain Verification Issue**

You mentioned you added:
- `https://www.pedalpulse.in/`
- `https://www.pedalpulse.in` (without trailing slash)

**Also add these**:
- `https://pedalpulse.in` (without www)
- `https://pedalpulse.in/` (without www, with slash)

Razorpay is strict about domain matching.

---

### 4. **Mixed Content / HTTPS Issues**

**Check**:
- Is your site fully on HTTPS? (www.pedalpulse.in should redirect to HTTPS)
- Are there any mixed content warnings in browser console?

**Fix**: In Netlify settings → Domain Management:
- Enable "Force HTTPS"
- Enable "HSTS"

---

### 5. **CORS Issues from Supabase RPC**

If the payment works on localhost but fails on production, it might be CORS.

**Check**: Browser console (F12) for errors like:
```
Access-Control-Allow-Origin error
CORS policy blocked
```

**Fix**: The Supabase Edge Function above handles CORS properly.

---

### 6. **Database RPC Function Issues**

The RPC function `verify_and_update_payment` might not exist or have errors.

**Verify**: Run this SQL in Supabase SQL Editor:

```sql
SELECT * FROM pg_proc 
WHERE proname = 'verify_and_update_payment';
```

If it returns 0 rows, run the migration:
```bash
# From your project root
cat supabase/migrations/COMPLETE_FRESH_SETUP.sql | psql YOUR_SUPABASE_DB_URL
```

Or manually run the SQL from `COMPLETE_FRESH_SETUP.sql` in Supabase SQL Editor.

---

## Debugging Steps (In Order):

### Step 1: Check Browser Console
1. Open www.pedalpulse.in
2. Press F12 → Console tab
3. Try to make payment
4. Look for errors. Common ones:
   - `order_id is required`
   - `CORS error`
   - `Network error`
   - `RPC function not found`

### Step 2: Check Network Tab
1. F12 → Network tab
2. Try payment
3. Look for failed requests (red)
4. Click on them to see response

### Step 3: Test with Test Key
Temporarily use Razorpay TEST key:
1. In Netlify env vars, change to `rzp_test_xxxxx`
2. Redeploy
3. Try payment
4. If it works with test but not live → Domain verification issue

### Step 4: Check Razorpay Dashboard
1. Go to Razorpay Dashboard → Payments
2. Try to make payment
3. Check if anything appears (even as failed)
4. If nothing appears → Order not being created

---

## Quick Diagnosis Commands

Run these in browser console (F12) on the payment page:

```javascript
// 1. Check if Razorpay loaded
console.log('Razorpay loaded?', typeof window.Razorpay !== 'undefined');

// 2. Check env vars available
console.log('Razorpay Key:', import.meta.env.VITE_RAZORPAY_KEY_ID);
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);

// 3. Check if RPC function exists
const { data, error } = await supabase.rpc('verify_and_update_payment', { 
    params: { reg_id: 'test', order_id: 'test', payment_id: 'test', signature: 'test' } 
});
console.log('RPC test:', data, error);
```

---

## Most Likely Fix (90% sure):

The issue is **missing order_id**. Implement the Edge Function solution above, and your payments will work.

**Why**: Razorpay requires server-side order creation for security. You can't just pass amount directly - you must:
1. Create order on backend (Edge Function)
2. Get order_id
3. Pass order_id to Razorpay checkout

---

## Contact Support If Still Failing

Email me the following:
1. Screenshot of browser console errors
2. Screenshot of Network tab (failed requests)
3. Razorpay Dashboard screenshot (if any payments show)
4. Netlify environment variables screenshot (hide sensitive parts)

This will help diagnose the exact issue!
