# RAZORPAY AUTO-CAPTURE - PRODUCTION DEPLOYMENT GUIDE

## ✅ WHAT WAS FIXED

The payment flow has been completely rewritten to follow Razorpay best practices:

### Before (Broken):
1. Customer fills form
2. **Razorpay checkout opens with just amount** ❌
3. Payment authorized but NOT captured ❌
4. Auto-refunded after 5 days ❌

### After (Fixed):
1. Customer fills form
2. **Server creates Razorpay order with payment_capture=1** ✅
3. **Razorpay checkout opens with order_id** ✅
4. **Payment automatically captured** ✅
5. **Money in your account immediately** ✅

---

## 📦 FILES CREATED/MODIFIED

### 1. **Supabase Edge Function** (NEW)
`supabase/functions/create-razorpay-order/index.ts`
- Creates Razorpay orders with `payment_capture: 1`
- Handles errors properly
- Production-ready logging

### 2. **Database Migration** (NEW)
`supabase/migrations/20260103_add_razorpay_order_id.sql`
- Adds `razorpay_order_id` column
- Creates index for performance

### 3. **Frontend Payment Flow** (MODIFIED)
`src/pages/PremiumRegistration.tsx`
- Calls Edge Function to create order
- Stores order_id in database
- Uses order_id in Razorpay checkout
- Better error handling

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Run Database Migration

**In Supabase Dashboard → SQL Editor**, run this:

```sql
-- Add razorpay_order_id column to premium_registrations table
ALTER TABLE premium_registrations 
ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(100);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_premium_registrations_order_id 
ON premium_registrations(razorpay_order_id);

-- Add comment
COMMENT ON COLUMN premium_registrations.razorpay_order_id IS 'Razorpay order ID for payment tracking (created before payment)';
```

**Verify it worked**:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'premium_registrations' 
AND column_name = 'razorpay_order_id';
```

Should return 1 row.

---

### Step 2: Deploy Edge Function

**Set Razorpay secrets** (if not already set):

```bash
# Replace with your actual keys
npx supabase secrets set RAZORPAY_KEY_ID=rzp_live_R8gZv2A5epuJef
npx supabase secrets set RAZORPAY_KEY_SECRET=your_secret_key_here
```

**Deploy the function**:

```bash
npx supabase functions deploy create-razorpay-order
```

**Verify deployment**:

```bash
npx supabase functions list
```

Should show `create-razorpay-order` in the list.

---

### Step 3: Test Edge Function

**In Supabase Dashboard → Edge Functions**:

1. Click on `create-razorpay-order`
2. Click "Invoke"
3. Use this test payload:

```json
{
  "amount": 47100,
  "currency": "INR",
  "receipt": "test_receipt_123",
  "notes": {
    "test": "true"
  }
}
```

4. Should return:
```json
{
  "success": true,
  "order": {
    "id": "order_xxxxx",
    "amount": 47100,
    "currency": "INR",
    ...
  }
}
```

**If it fails**: Check logs in Supabase Dashboard → Edge Functions → Logs

---

### Step 4: Deploy Frontend Changes

```bash
git add .
git commit -m "feat: Implement proper Razorpay order creation with auto-capture"
git push
```

Wait 2-3 minutes for Netlify to deploy.

---

### Step 5: Verify CSP (Already Done)

The `netlify.toml` already has `https://lumberjack.razorpay.com` added to CSP.

---

## 🧪 TESTING

### Test Payment Flow

1. Go to: `https://www.pedalpulse.in/challenges/republic-day-challenges-2026/premium-registration`
2. Fill in form with test data
3. **Open Developer Console (F12)** before clicking "Proceed to Payment"
4. Click "Proceed to Payment"

**In Console, you should see**:
```
Creating Razorpay order for registration: xxxx-xxxx-xxxx
Razorpay order created successfully: order_xxxxx
```

5. Complete payment (use test card if in test mode)

**In Razorpay Dashboard → Payments**:
- Payment status should be **"captured"** (not just "authorized")
- Should show order_id

**In Supabase → premium_registrations table**:
- Check the record
- `razorpay_order_id` column should have value like `order_xxxxx`
- `payment_status` should be 'completed'

---

## 📊 VERIFICATION CHECKLIST

After deployment, verify:

- [ ] Database migration ran successfully (column exists)
- [ ] Edge Function deployed (shows in Supabase dashboard)
- [ ] Secrets are set (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
- [ ] Frontend deployed to Netlify (latest commit)
- [ ] Test payment creates order (check console logs)
- [ ] Payment is auto-captured (Razorpay dashboard shows "captured")
- [ ] order_id saved in database

---

## 🔍 TROUBLESHOOTING

### Error: "Edge Function not found"

**Cause**: Function not deployed
**Fix**: Run `npx supabase functions deploy create-razorpay-order`

### Error: "Failed to create order"

**Cause**: Razorpay secrets not set or incorrect
**Fix**: 
1. Verify secrets: `npx supabase secrets list`
2. Reset if needed: `npx supabase secrets set RAZORPAY_KEY_ID=your_key`

### Error: "Column razorpay_order_id does not exist"

**Cause**: Migration not run
**Fix**: Run the SQL migration in Supabase SQL Editor

### Payment still showing as "authorized" only

**Possible causes**:
1. Old orders (created before this fix) - they'll still refund
2. Edge Function returned error - check console logs
3. payment_capture not set to 1 - check Edge Function code

**Fix**: 
- Check browser console for errors
- Check Supabase logs for Edge Function errors
- Verify Edge Function has `payment_capture: 1`

### CSP blocking lumberjack.razorpay.com

**Should already be fixed**, but verify netlify.toml line 26 has:
```
connect-src ... https://lumberjack.razorpay.com ...
```

---

## 📈 MONITORING

### Monitor Order Creation

**In Supabase → Edge Functions → Logs**, look for:
```
Creating Razorpay order: Amount=47100, Receipt=receipt_xxx
Order created successfully: order_xxxxx
```

### Monitor Payments

**In Razorpay Dashboard → Payments**:
- All new payments should show as "captured"
- Should have associated order_id
- No more auto-refunds!

### Database Queries

**Check order_ids are being saved**:
```sql
SELECT id, email, razorpay_order_id, razorpay_payment_id, payment_status, created_at
FROM premium_registrations
WHERE created_at > NOW() - INTERVAL '1 day'
ORDER BY created_at DESC
LIMIT 10;
```

**All rows should have `razorpay_order_id` populated for new payments.**

---

## 🎯 SUCCESS INDICATORS

You'll know it's working when:

1. ✅ Console shows "Order created successfully: order_xxxxx"
2. ✅ Razorpay dashboard shows payment as "captured" (not just "authorized")
3. ✅ Database has `razorpay_order_id` filled
4. ✅ No payments refunding after 5 days
5. ✅ Money appears in Razorpay balance immediately

---

## 🚨 IMPORTANT NOTES

### For Old Payments (Before This Fix)

Payments made BEFORE deploying this fix will still refund if they're in "authorized" state. 

**To manually capture them**:
1. Razorpay Dashboard → Payments
2. Find payment in "authorized" state
3. Click "Capture Payment" button
4. Enter amount and confirm

**Or let them refund** - customer can re-register with the new system.

### Test vs Live Mode

This fix works in BOTH test and live mode. Make sure you're using the correct keys:
- Test: `rzp_test_xxxxx`
- Live: `rzp_live_xxxxx`

### Rate Limits

Razorpay API has rate limits:
- **Test mode**: 100 requests/minute
- **Live mode**: 600 requests/minute

With hundreds of orders daily, you're well within limits.

---

## 📞 SUPPORT

If issues persist:

1. **Check Logs**:
   - Browser console (F12)
   - Supabase Edge Function logs
   - Razorpay Dashboard → Event logs

2. **Verify Each Step**:
   - Migration ran ✓
   - Function deployed ✓
   - Secrets set ✓
   - Code deployed ✓

3. **Contact Razorpay Support**:
   - If payments still not capturing after this fix
   - They can check account-level settings

---

## ✅ DEPLOYMENT COMPLETE

Once all steps are done:
- ✅ Database updated
- ✅ Edge Function deployed
- ✅ Frontend deployed
- ✅ Tested successfully

**Your payment auto-capture is now PRODUCTION-READY!** 🎉

All new payments will be automatically captured. No more refunds!
