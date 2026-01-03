# RAZORPAY AUTO-CAPTURE FIX

## Problem
Payments are being **authorized** but not **captured** in Razorpay, leading to automatic refunds.

## Root Cause
You're NOT creating Razorpay orders before payment. The code is missing:
1. Server-side order creation
2. `order_id` in payment options

Without proper order creation, Razorpay doesn't know how to capture the payment.

---

## Solution: Enable Payment Capture

You have **TWO options**:

### Option 1: Enable Auto-Capture in Razorpay Dashboard (EASIEST) ⭐

This is the quickest fix - no code changes needed!

#### Steps:
1. Go to **Razorpay Dashboard** → **Settings** → **Payment Capture Settings**
2. Find **"Auto Capture Payments"**
3. Set to: **"Capture payments automatically"**
4. Click **Save**

**Result**: All future payments will be automatically captured when authorized.

---

### Option 2: Create Razorpay Orders Properly (RECOMMENDED) 🏆

This is the correct way to handle Razorpay payments.

#### Why This is Better:
- More control over payment flow
- Better security
- Proper order tracking
- Prevents duplicate payments
- Industry best practice

#### Implementation:

You need to create a Supabase Edge Function to generate Razorpay orders.

**File**: `supabase/functions/create-razorpay-order/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')!
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, currency, receipt, notes } = await req.json()

    // Validate inputs
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount')
    }

    // Create Razorpay order with CAPTURE enabled
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
        payment_capture: 1  // ⭐ AUTO-CAPTURE ENABLED!
      }),
    })

    const order = await response.json()

    if (!response.ok) {
      throw new Error(order.error?.description || 'Failed to create order')
    }

    return new Response(
      JSON.stringify({ success: true, order }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error: any) {
    console.error('Order creation error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
```

**Deploy the Edge Function**:

```bash
# Set secrets
npx supabase secrets set RAZORPAY_KEY_ID=your_live_key_id
npx supabase secrets set RAZORPAY_KEY_SECRET=your_live_key_secret

# Deploy function
npx supabase functions deploy create-razorpay-order
```

**Update PremiumRegistration.tsx** (around line 349):

```tsx
// BEFORE creating Razorpay options, create order first
try {
    // Step 1: Create Razorpay Order via Edge Function
    const { data: orderData, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
            amount: totalAmount * 100, // in paise
            currency: 'INR',
            receipt: `receipt_${registration.id}`,
            notes: {
                registration_id: registration.id,
                category: formData.category,
                email: formData.email
            }
        }
    });

    if (orderError || !orderData?.success) {
        throw new Error(orderData?.error || 'Failed to create payment order');
    }

    const razorpayOrder = orderData.order;
    console.log('Order created:', razorpayOrder.id);

    // Step 2: NOW create Razorpay options with order_id
    const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        order_id: razorpayOrder.id, // ⭐ THIS IS CRITICAL!
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'PedalPulse',
        description: `Republic Day Challenge 2026 - ${formData.category.replace('-', ' ').replace('km', ' Km')}`,
        image: '/Logo/Logo.png',
        prefill: {
            name: formData.name,
            email: formData.email,
            contact: `${formData.countryCode}${formData.phone}`,
        },
        notes: razorpayOrder.notes,
        theme: {
            color: '#F97316',
        },
        handler: async function (response: any) {
            // Payment successful handler
            // ... rest of your existing handler code
        },
        modal: {
            ondismiss: function () {
                // ... existing code
            }
        }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();

} catch (error: any) {
    console.error('Payment error:', error);
    setStep('form');
    setIsLoading(false);
    toast({
        title: 'Payment Failed',
        description: error.message || 'Could not initiate payment. Please try again.',
        variant: 'destructive',
    });
}
```

---

## Comparison

| Aspect | Option 1 (Dashboard) | Option 2 (Code) |
|--------|---------------------|-----------------|
| **Ease** | ✅ Very Easy (2 minutes) | ⚠️ Moderate (30 minutes) |
| **Code Changes** | ✅ None | ⚠️ Significant |
| **Security** | ✅ Good | ✅ Excellent |
| **Control** | ⚠️ Limited | ✅ Full control |
| **Best Practice** | ⚠️ Okay | ✅ Recommended |
| **Order Tracking** | ❌ No | ✅ Yes |

---

## My Recommendation

### For Quick Fix (Now):
**Use Option 1** - Enable auto-capture in dashboard. This will immediately fix the refund issue.

### For Long-term (Next Sprint):
**Implement Option 2** - Proper order creation is the right way to handle Razorpay payments.

---

## Additional Settings to Check

### In Razorpay Dashboard:

1. **Payment Capture**:
   - Settings → Payment Capture → Auto Capture: **ON**

2. **Payment Auto-Refund**:
   - Settings → Auto Refund: **OFF** for payments
   - Or set auto-refund period to longer (15 days instead of 5)

3. **Webhook Configuration**:
   - Settings → Webhooks → Configure
   - Add: `https://www.pedalpulse.in/api/razorpay-webhook` (if you implement webhooks later)
   - Events: `payment.authorized`, `payment.captured`, `payment.failed`

---

## Testing

After enabling auto-capture (Option 1):

1. Make a test payment
2. Check Razorpay Dashboard → Payments
3. Payment should show as **"Captured"** automatically
4. Should NOT refund after 5 days

---

## Why Payments Were Refunding

**What was happening**:
1. Customer pays → Razorpay **authorizes** payment (holds money)
2. No capture happens because:
   - No order_id provided
   - Auto-capture disabled
3. After 5 days → Razorpay automatically **refunds** uncaptured payments

**What should happen**:
1. Customer pays → Razorpay **authorizes** payment
2. Razorpay immediately **captures** payment (with auto-capture ON)
3. Money successfully transferred to your account
4. No refund!

---

## Quick Action Required

**RIGHT NOW** (2 minutes):
1. Go to Razorpay Dashboard
2. Settings → Payment Capture
3. Enable "Auto Capture Payments"
4. Save

**This will fix the issue immediately for all new payments!** ✅

---

## Questions?

If auto-capture is already enabled but still refunding, check:
- Transaction status (should be "authorized" → "captured")
- Any minimum amount restrictions
- Account verification status (unverified accounts have limits)
- Contact Razorpay support to verify account settings

Let me know if you need help implementing Option 2 (proper order creation)!
