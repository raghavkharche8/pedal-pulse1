# 🔐 Level 2 & 3 Security Deployment Guide

## ✅ What's Been Implemented

**Level 1**: Frontend validation (basic)
**Level 2**: Cryptographic signature verification 
**Level 3**: Server-side payment status check with Razorpay API

---

## 📋 Deployment Steps

### Step 1: Deploy the Edge Function

Run these commands in your terminal:

```bash
# Login to Supabase (if not already logged in)
npx supabase login

# Link to your project
npx supabase link --project-ref itzikaokqwcusrirhtgd

# Set the Razorpay secret (IMPORTANT - keeps your secret secure)
npx supabase secrets set RAZORPAY_KEY_SECRET=YJ1Fw7rfDOyg8FUvnSekz2iW

# Deploy the verify-payment function
npx supabase functions deploy verify-payment

# Test the function (optional)
npx supabase functions serve verify-payment
```

### Step 2: Restart Your Dev Server

```bash
npm run dev
```

---

## 🔐 How It Works

### When a user completes payment:

1. **Frontend**: User clicks "Pay" → Razorpay checkout opens
2. **Razorpay**: User pays successfully → Returns payment_id, order_id, signature
3. **Your Edge Function** (verify-payment):
   - **Level 2**: Verifies the signature using HMAC-SHA256
   - **Level 3**: Calls Razorpay API to confirm payment is "captured"
   - **Level 3**: Verifies amount matches expected amount
   - **Only if ALL checks pass**: Updates database to mark payment complete
4. **Frontend**: Shows success page

### Security Benefits:

✅ **Impossible to fake**: Signature requires your secret key (only on server)
✅ **Double verification**: Checks with Razorpay servers directly
✅ **Amount protection**: Ensures user paid the correct amount
✅ **Status validation**: Confirms payment was actually captured
✅ **Zero client trust**: All verification happens server-side

---

## 🧪 Testing

After deployment, test with a real payment:

1. Go to `/challenge/republic-day-challenges-2026/premium-registration`
2. Fill in the form
3. Use a test card: `4111 1111 1111 1111` (for test mode)
4. Complete payment
5. Check Supabase logs to see the verification steps

---

## ⚠️ IMPORTANT NOTES

- The `RAZORPAY_KEY_SECRET` is stored securely in Supabase Edge Function secrets
- It NEVER appears in your frontend code or `.env` file
- The Edge Function runs on Supabase's servers with your Service Role key
- Only successful, verified payments update the database

---

## 🆘 Troubleshooting

**Error: "Function not found"**
- Make sure you deployed: `npx supabase functions deploy verify-payment`

**Error: "Payment verification failed"**
- Check the Edge Function logs: `npx supabase functions log verify-payment`
- Verify the secret is set: `npx supabase secrets list`

**Local testing:**
- Run locally: `npx supabase functions serve verify-payment`
- Update Supabase URL in frontend to `http://localhost:54321`
