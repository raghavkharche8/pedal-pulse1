# EMAIL CONFIRMATION SETUP GUIDE

## ✅ WHAT WAS CREATED

A complete automated email system that sends beautiful HTML confirmation emails to users after registration (both free and paid).

### Email Content Includes:
- ✅ Thank you message
- ✅ Challenge name and category
- ✅ Payment ID & Order ID (for paid)
- ✅ Challenge dates (26 Jan - 1 Feb 2026)
- ✅ Activity tracking instructions
- ✅ Shipping address (for paid)
- ✅ Phone number (for paid)
- ✅ Address correction warning with WhatsApp link
- ✅ Submission process notice (25th Jan)
- ✅ Support contact information

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Get SMTP Credentials from Hostinger

1. **Login to Hostinger**
2. Go to **Email** → **Email Accounts**
3. Find `no-reply@pedalpulse.in`
4. Note down these details:
   - **SMTP Host**: `smtp.hostinger.com` (usually)
   - **SMTP Port**: `465` (SSL) or `587` (TLS)
   - **Username**: `no-reply@pedalpulse.in`
   - **Password**: Your email password

**If you need to find exact settings**:
- Hostinger → Emails → Email Accounts → Select email → Configuration → Manual Setup

---

### Step 2: Set Supabase Secrets

```bash
# Set SMTP credentials
npx supabase secrets set SMTP_HOST=smtp.hostinger.com
npx supabase secrets set SMTP_PORT=465
npx supabase secrets set SMTP_USER=no-reply@pedalpulse.in
npx supabase secrets set SMTP_PASS=your_email_password_here
```

**Verify secrets are set**:
```bash
npx supabase secrets list
```

Should show:
```
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
```

---

### Step 3: Deploy Email Function

```bash
npx supabase functions deploy send-registration-email
```

**Verify deployment**:
```bash
npx supabase functions list
```

Should show both functions:
- `create-razorpay-order`
- `send-registration-email`

---

### Step 4: Test Email Function

**In Supabase Dashboard** → Edge Functions → `send-registration-email` → Invoke

**Test Payload (Free Registration)**:
```json
{
  "to": "your-test-email@gmail.com",
  "name": "Test User",
  "challengeName": "Republic Day Virtual Challenge 2026",
  "registrationType": "free",
  "category": "5-Km Run"
}
```

**Test Payload (Premium Registration)**:
```json
{
  "to": "your-test-email@gmail.com",
  "name": "Test User",
  "challengeName": "Republic Day Virtual Challenge 2026",
  "registrationType": "premium",
  "category": "10-Km Run",
  "paymentId": "pay_test123",
  "orderId": "order_test456",
  "address": {
    "addressLine1": "123 Main Street",
    "addressLine2": "Apartment 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  },
  "phone": "9238737970",
  "phoneCountryCode": "+91"
}
```

**Expected Result**: Email should arrive in your inbox within 1-2 minutes.

---

### Step 5: Update Frontend to Send Emails

#### For **Free Registration** (FreeRegistration.tsx):

Find the success block (around line 145) and add email sending:

```tsx
if (error) {
    throw error;
}

// ⭐ NEW: Send confirmation email
try {
    await supabase.functions.invoke('send-registration-email', {
        body: {
            to: formData.email,
            name: formData.name,
            challengeName: 'Republic Day Virtual Challenge 2026',
            registrationType: 'free',
            category: formData.category
        }
    });
    console.log('Confirmation email sent');
} catch (emailError) {
    console.error('Failed to send email:', emailError);
    // Don't fail registration if email fails
}

setIsSuccess(true);
```

#### For **Premium Registration** (PremiumRegistration.tsx):

Find the success handler (around line 418) and add email sending:

```tsx
// Increment coupon usage if applied
if (couponApplied?.isValid) {
    await supabase.rpc('increment_coupon_usage', {
        coupon_code_input: formData.couponCode.toUpperCase(),
    });
}

// ⭐ NEW: Send confirmation email
try {
    await supabase.functions.invoke('send-registration-email', {
        body: {
            to: formData.email,
            name: formData.name,
            challengeName: 'Republic Day Virtual Challenge 2026',
            registrationType: 'premium',
            category: formData.category,
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            address: {
                addressLine1: formData.addressLine1,
                addressLine2: formData.addressLine2,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode
            },
            phone: formData.phone,
            phoneCountryCode: formData.countryCode
        }
    });
    console.log('Confirmation email sent');
} catch (emailError) {
    console.error('Failed to send email:', emailError);
    // Don't fail registration if email fails
}

setStep('success');
setIsLoading(false);
```

---

### Step 6: Deploy Frontend Changes

```bash
git add .
git commit -m "feat: Add automated registration confirmation emails"
git push
```

Wait 2-3 minutes for Netlify deployment.

---

## 🧪 TESTING

### Test Free Registration:
1. Go to free registration page
2. Register with your email
3. Check your inbox for confirmation email

### Test Premium Registration:
1. Go to premium registration page
2. Complete payment (use test mode if needed)
3. Check your inbox for confirmation email with payment details

---

## 📊 EMAIL SAMPLES

### Free Registration Email Includes:
- ✅ Welcome message
- ✅ Challenge confirmation
- ✅ Event dates (26 Jan - 1 Feb)
- ✅ Activity tracking instructions
- ✅ Submission process info
- ✅ Support contacts

### Premium Registration Email Includes:
- ✅ Everything from Free +
- ✅ Payment ID
- ✅ Order ID
- ✅ Shipping address
- ✅ Phone number
- ✅ Address correction warning (before 25th Jan)
- ✅ WhatsApp contact link

---

## 🔍 TROUBLESHOOTING

### Email Not Sending

**Check 1: SMTP Credentials**
```bash
npx supabase secrets list
```
All 4 SMTP secrets should be present.

**Check 2: Edge Function Logs**
Supabase Dashboard → Edge Functions → send-registration-email → Logs

Common errors:
- "Authentication failed" → Wrong SMTP password
- "Connection refused" → Wrong SMTP host/port
- "Sender not allowed" → Email not properly configured on Hostinger

**Check 3: Hostinger Email Settings**
- Ensure `no-reply@pedalpulse.in` is created and active
- Check if SMTP is enabled for this email
- Verify password is correct

### Email Goes to Spam

**Solutions**:
1. Add SPF record to DNS:
   ```
   v=spf1 include:_spf.hosting.hostinger.com ~all
   ```

2. Add DKIM record (from Hostinger email settings)

3. Test email deliverability at mail-tester.com

### Email Sending Slow

**This is normal**:
- SMTP sending can take 5-30 seconds
- Users still see success page immediately
- Email arrives shortly after

---

## 📈 MONITORING

### Check Email Sending

**In Supabase Edge Function Logs**, look for:
```
Email sent successfully to: user@example.com
```

### Check for Errors

Look for:
```
=== Email Send Error ===
Error message: ...
```

Common issues and fixes listed in troubleshooting section.

---

## 🎨 CUSTOMIZING EMAILS

To modify email content, edit:
`supabase/functions/send-registration-email/index.ts`

The `generateEmailHTML()` function contains the template.

After changes:
```bash
npx supabase functions deploy send-registration-email
```

---

## 🚨 IMPORTANT NOTES

### For Production with 100s of Emails Daily:

1. **SMTP Limits**:
   - Hostinger typically allows 100-500 emails/hour
   - Check your Hostinger plan limits
   - If exceeded, consider upgrading or using dedicated email service

2. **Rate Limiting**:
   - Current setup has no rate limiting
   - Add rate limiting if abuse occurs

3. **Email Deliverability**:
   - Set up SPF, DKIM, DMARC records
   - Monitor spam rates
   - Use mail-tester.com to check score

4. **Backup**:
   - Consider adding a secondary email sender (SendGrid, AWS SES)
   - Implement retry logic if needed

---

## ✅ SUCCESS CHECKLIST

Before going live:
- [ ] SMTP secrets set in Supabase
- [ ] Email function deployed
- [ ] Test email sent successfully (free)
- [ ] Test email sent successfully (premium)
- [ ] Frontend code updated
- [ ] Frontend deployed
- [ ] SPF record added to DNS
- [ ] Tested on production
- [ ] Email arrives in inbox (not spam)
- [ ] All details display correctly
- [ ] WhatsApp link works
- [ ] Support email link works

---

## 📞 SUPPORT

If emails still not working:

1. **Check Hostinger Support**: They can verify SMTP settings
2. **Check Supabase Logs**: Shows exact error
3. **Test SMTP manually**: Use mail testing tools

---

**Your automated email system is ready! Deploy and test!** 📧🎉
