# RAZORPAY PAYMENT FIX - DEPLOYMENT CHECKLIST

## ✅ What I Fixed

### 1. Updated `netlify.toml` (Line 26)
**Added**: `https://lumberjack.razorpay.com` to Content Security Policy

**Before**:
```
connect-src ... https://api.razorpay.com https://www.facebook.com;
```

**After**:
```
connect-src ... https://api.razorpay.com https://lumberjack.razorpay.com https://www.facebook.com;
```

This allows Razorpay's analytics/tracking service to work.

---

## 🚀 NEXT STEPS - YOU MUST DO THESE

### Step 1: Deploy to Netlify

```bash
git add netlify.toml
git commit -m "fix: Add Razorpay lumberjack domain to CSP for payment processing"
git push
```

**Wait 2-3 minutes** for Netlify to build and deploy.

---

### Step 2: Verify Razorpay Dashboard Settings

#### 2a. Whitelist Domains
1. Go to: **Razorpay Dashboard** → **Settings** → **Website/App Settings** → **Website Checkout**
2. Add ALL these domains (if not already added):
   - `https://pedalpulse.in`
   - `https://pedalpulse.in/`
   - `https://www.pedalpulse.in`
   - `https://www.pedalpulse.in/`

#### 2b. Verify API Key Status
1. Go to: **Razorpay Dashboard** → **Settings** → **API Keys**
2. Check your LIVE key: `rzp_live_R8gZv2A5epuJef`
3. Ensure it shows **"Active"** (not "Inactive" or "Expired")
4. If inactive, regenerate a new key and update Netlify env vars

---

### Step 3: Verify Netlify Environment Variables

1. Go to: **Netlify Dashboard** → **Your Site** → **Site Settings** → **Environment Variables**
2. Confirm these exist **EXACTLY** (case-sensitive):

| Variable Name | Value | Notes |
|---------------|-------|-------|
| `VITE_RAZORPAY_KEY_ID` | `rzp_live_R8gZv2A5epuJef` | LIVE key (starts with rzp_live_) |
| `VITE_SUPABASE_URL` | Your Supabase URL | Should end with .supabase.co |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | Long string starting with eyJ... |

**If you change ANY env var**: You MUST trigger a new deploy (push an empty commit or use Netlify's "Trigger deploy" button).

---

### Step 4: Test Payment

1. **Clear browser cache**: Ctrl+Shift+Delete → Clear cached images and files
2. Go to: `https://www.pedalpulse.in/challenges/republic-day-challenges-2026/premium-registration`
3. Fill in the form
4. Click "Proceed to Payment"
5. **Open Developer Console** (F12) before proceeding
6. Try payment

---

### Step 5: Verify CSP Fix Worked

**In Browser Console (F12), you should NOT see**:
- ❌ `Connecting to 'https://lumberjack.razorpay.com' violates CSP`
- ❌ `Failed to load resource: 401 Unauthorized`

**You SHOULD see**:
- ✅ Razorpay checkout opens without errors
- ✅ Payment processes successfully

**Quick Test** (run in console):
```javascript
fetch('https://lumberjack.razorpay.com/v1/track?test=1')
  .then(() => console.log('✅ CSP FIX WORKED!'))
  .catch(e => console.log('❌ CSP still blocking'));
```

---

## 🔍 TROUBLESHOOTING

### If Payment Still Fails:

#### Issue 1: Still seeing CSP errors
**Cause**: Netlify hasn't deployed yet or cache not cleared
**Fix**: 
- Wait for deploy to finish
- Hard refresh: Ctrl+Shift+R
- Try incognito mode

#### Issue 2: Still seeing 401 Unauthorized
**Possible causes**:
1. **Domain not whitelisted in Razorpay** → Add all 4 domain variations (Step 2a)
2. **Wrong API key on Netlify** → Double-check env var (Step 3)
3. **Live key is inactive** → Regenerate key in Razorpay dashboard

**Test with TEST key** to isolate:
- In Netlify env vars, temporarily change to `rzp_test_xxxxx`
- If test works but live doesn't → It's a LIVE key/domain issue

#### Issue 3: Payment works, but verification fails
**Cause**: Database RPC function issue
**Fix**: Run the database migration:
```sql
-- In Supabase SQL Editor
-- Run the complete setup from: supabase/migrations/COMPLETE_FRESH_SETUP.sql
```

---

## 📊 SUCCESS INDICATORS

### Payment Working = All of These:
- ✅ Razorpay checkout modal opens
- ✅ No CSP errors in console
- ✅ No 401 errors in Network tab
- ✅ Payment completes successfully
- ✅ Redirected to success page
- ✅ Entry appears in Supabase `premium_registrations` table
- ✅ Payment shows in Razorpay Dashboard

---

## 🆘 IF STILL NOT WORKING

Run these diagnostics and send me the output:

```javascript
// In console on www.pedalpulse.in
console.log('=== DIAGNOSTICS ===');
console.log('1. Razorpay Key:', import.meta.env.VITE_RAZORPAY_KEY_ID);
console.log('2. Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('3. Razorpay Loaded?', typeof window.Razorpay !== 'undefined');

// Test CSP
fetch('https://lumberjack.razorpay.com/v1/track?test=1')
  .then(() => console.log('4. CSP: ✅ ALLOWED'))
  .catch(() => console.log('4. CSP: ❌ BLOCKED'));

// Test Razorpay API
fetch('https://api.razorpay.com')
  .then(() => console.log('5. Razorpay API: ✅ REACHABLE'))
  .catch(() => console.log('5. Razorpay API: ❌ UNREACHABLE'));
```

**Also check**:
- Screenshot of Netlify deploy log (any errors?)
- Screenshot of Razorpay Dashboard → Settings → Website Checkout (domains list)
- Screenshot of browser Network tab (filter: razorpay) during payment attempt

---

## 🎯 EXPECTED TIMELINE

- **Deploy**: 2-3 minutes
- **Propagation**: Instant (Netlify's CDN is fast)
- **Testing**: Immediately after deploy completes

**You should be able to test payment within 5 minutes of pushing!**

---

## ✅ FINAL CHECKLIST

Before testing, confirm:
- [ ] Pushed netlify.toml change to GitHub
- [ ] Netlify deploy completed successfully (check Netlify dashboard)
- [ ] All 4 domains whitelisted in Razorpay
- [ ] Live API key is ACTIVE in Razorpay
- [ ] Env vars set correctly on Netlify (exact case)
- [ ] Browser cache cleared
- [ ] Developer Console open (F12) to check for errors

**Now test payment!** 🚀
