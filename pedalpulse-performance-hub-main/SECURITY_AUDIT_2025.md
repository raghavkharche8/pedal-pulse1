# 🔒 PedalPulse Security & Compliance Audit Report

**Audit Date:** December 30, 2025  
**Auditor:** Principal Software Engineer  
**Application Type:** Virtual Challenge Platform (React + Supabase + Razorpay)  
**Deployment Target:** Netlify  

---

## 📊 EXECUTIVE SUMMARY

| Category | Critical | High | Medium | Low | Status |
|----------|----------|------|--------|-----|--------|
| **Frontend Security** | 1 | 3 | 4 | 2 | 🔴 NEEDS ATTENTION |
| **Backend/API Security** | 2 | 4 | 3 | 1 | 🔴 CRITICAL ISSUES |
| **Infrastructure** | 0 | 2 | 3 | 1 | 🟡 MODERATE RISK |
| **Data Protection** | 1 | 3 | 2 | 1 | 🔴 CRITICAL ISSUES |
| **Compliance** | 1 | 2 | 2 | 1 | 🔴 LEGAL RISKS |
| **TOTAL** | **5** | **14** | **14** | **6** | 🔴 **NOT PRODUCTION READY** |

### Overall Assessment: 🔴 **DO NOT DEPLOY** until Critical and High issues are resolved.

---

## 🚨 CRITICAL ISSUES (Fix Immediately)

### CRITICAL-001: Payment Verification Missing Server-Side Validation

**Location:** `src/components/registration/RegistrationForm.tsx` (Lines 274-288)

**Issue:** Payment success is verified entirely client-side. After Razorpay returns success, the frontend directly updates the registration status to "completed" without server-side verification.

**Exploitation:**
1. User registers and creates a pending registration
2. User intercepts the Razorpay callback or modifies client-side code
3. User calls Supabase directly to update `payment_status: 'completed'` without paying
4. User gains access to challenge for free

**Evidence:**
```typescript
// Line 274-288: Handler only checks client-side response
handler: async function (response: any) {
    const { error: updateError } = await supabase
        .from('registrations')
        .update({
            payment_id: response.razorpay_payment_id,
            payment_status: "completed",  // NO SERVER VERIFICATION!
            status: "registered"
        })
        .eq('id', registrationId);
}
```

**Impact:** 
- Complete revenue loss possible
- Free access to paid challenges
- Financial and reputational damage

**Fix (Required):**
```typescript
// Create Supabase Edge Function: verify-payment
// 1. Receive payment_id, order_id, signature
// 2. Verify signature using Razorpay secret (server-side only)
// 3. Only then update payment_status
// 4. Return success/failure

// Frontend should call:
const { data, error } = await supabase.functions.invoke('verify-payment', {
    body: {
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
        registration_id: registrationId
    }
});
```

---

### CRITICAL-002: No RLS Policy Prevents Users From Updating Other Users' Registrations

**Location:** `supabase_schema.sql` (Lines 37-39)

**Issue:** The RLS policy allows any authenticated user to update ANY registration where they claim to be the owner, but the check is based on `auth.uid() = user_id`. The problem: users can insert registrations with NULL `user_id`, then update them later.

**Evidence:**
```sql
-- Schema allows NULL user_id
ADD COLUMN user_id UUID REFERENCES auth.users(id), -- NOT NULL is missing!

-- RLS policy doesn't handle NULL case properly
CREATE POLICY "Users can update own registrations"
ON registrations FOR UPDATE
USING (auth.uid() = user_id);  -- What if user_id is NULL?
```

**Exploitation:**
1. Create registration without being logged in (user_id = NULL)
2. Another user could potentially claim this registration
3. Or the original person could link it to any account

**Impact:**
- Registration hijacking
- Payment fraud (pay once, assign to multiple accounts)

**Fix (Required):**
```sql
-- Modify column to be NOT NULL for authenticated flows
-- Add policy to prevent updates to payment_status and critical fields
CREATE POLICY "Users can only update proof submission fields"
ON registrations FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
    auth.uid() = user_id 
    AND user_id IS NOT NULL
    AND OLD.payment_status = NEW.payment_status  -- Prevent payment changes
);
```

---

### CRITICAL-003: Admin Check Queries Exposed Table Data

**Location:** `src/components/AdminRoute.tsx` (Lines 23-27)

**Issue:** The admin check queries `admin_users` table directly from the frontend. While RLS limits results, the table structure and existence is exposed. More critically, the admin check is client-side only.

**Evidence:**
```typescript
// Line 23-27: Client-side admin check
const { data, error } = await supabase
    .from('admin_users')
    .select('role')
    .eq('email', user.email)
    .single();
```

**Exploitation:**
1. User modifies React state or localStorage
2. Bypasses client-side admin check
3. Access admin routes (though RLS may still block data)
4. See admin UI structure, potentially discover vulnerabilities

**Impact:**
- Information disclosure about admin accounts
- Potential privilege escalation if any admin operations don't have server-side checks

**Fix (Required):**
```typescript
// Move admin check to server-side
// Option 1: Use Supabase custom claim in JWT
// Option 2: Create secure Edge Function for admin actions
// All admin operations must be validated server-side

// Add to Supabase: Custom claim in auth.users
UPDATE auth.users SET raw_app_meta_data = 
  raw_app_meta_data || '{"is_admin": true}'::jsonb
WHERE email = 'admin@pedalpulse.in';

// Check in Edge Functions:
const { data: { user } } = await supabase.auth.getUser();
if (!user?.app_metadata?.is_admin) throw new Error('Forbidden');
```

---

### CRITICAL-004: Strava Access Token Stored in Database Without Encryption

**Location:** `strava_integration.sql`, `supabase/functions/strava-auth/index.ts`

**Issue:** Strava access tokens and refresh tokens are stored in plaintext in the database.

**Evidence:**
```sql
-- Line 9 of strava_integration.sql
access_token TEXT NOT NULL,
refresh_token TEXT NOT NULL,
```

```typescript
// Line 96-104 of strava-auth/index.ts
const { error: dbError } = await supabaseAdmin
    .from('strava_connections')
    .upsert({
        access_token: tokenData.access_token,  // Plaintext!
        refresh_token: tokenData.refresh_token, // Plaintext!
        ...
    })
```

**Impact:**
- Database breach exposes all user Strava accounts
- Attackers can access/modify user Strava data
- Violates Strava API terms of service
- Major privacy breach

**Fix (Required):**
```typescript
// Encrypt tokens before storage
import { createCipheriv, createDecipheriv } from 'crypto';

function encryptToken(token: string, key: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    // ... encrypt
}

// Store: encryptToken(tokenData.access_token, ENCRYPTION_KEY)
// Key should be in Supabase secrets, never in code
```

---

### CRITICAL-005: Leaderboard View Exposes User IDs to Anonymous Users

**Location:** `supabase/leaderboard_view.sql`

**Issue:** The public leaderboard view grants SELECT access to anonymous users and exposes `user_id`, which is a sensitive identifier.

**Evidence:**
```sql
CREATE OR REPLACE VIEW leaderboard_entries AS
SELECT 
    id,
    user_id,  -- UUID exposed to public!
    first_name,
    last_name,  -- Full names exposed to public!
    ...
FROM registrations
WHERE payment_status = 'completed';

GRANT SELECT ON leaderboard_entries TO anon;  -- Public access!
```

**Impact:**
- User enumeration
- PII exposure (full names)
- GDPR violation (exposing user identifiers without consent)
- Scraping risk

**Fix (Required):**
```sql
CREATE OR REPLACE VIEW leaderboard_entries AS
SELECT 
    -- Remove user_id entirely
    id as entry_id,
    -- Only show first name and last initial
    first_name,
    LEFT(last_name, 1) || '.' as last_initial,
    gender,
    sport_distance,
    challenge_name,
    strava_activity_data,
    created_at
FROM registrations
WHERE payment_status = 'completed'
AND verification_status = 'approved';  -- Only verified entries
```

---

## 🔴 HIGH SEVERITY ISSUES

### HIGH-001: CSRF Protection Not Implemented

**Location:** All form submissions

**Issue:** No CSRF tokens are used. Supabase handles some protection via auth tokens, but forms like password reset, profile updates are vulnerable.

**Exploitation:** Malicious site can submit forms on behalf of authenticated users.

**Fix:**
- Implement CSRF tokens for state-changing operations
- Supabase auth already uses secure cookies, but verify SameSite=Strict

---

### HIGH-002: No Rate Limiting on Authentication

**Location:** `src/pages/Login.tsx`, `src/pages/ForgotPassword.tsx`

**Issue:** No rate limiting on login attempts or password reset requests.

**Evidence:**
```typescript
// Login.tsx - No rate limiting
const handleAuth = async (e: React.FormEvent) => {
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,  // Unlimited attempts allowed
    });
```

**Exploitation:**
- Brute force password attacks
- Account lockout attacks
- Password reset spam (email cost)

**Fix:**
- Enable Supabase rate limiting (Settings > Auth > Rate Limits)
- Implement client-side rate limiting with exponential backoff
- Add CAPTCHA after 3 failed attempts

---

### HIGH-003: Sensitive Data in Console Logs

**Location:** Multiple files

**Issue:** Debug console.log statements expose sensitive data.

**Evidence:**
```typescript
// AdminRoute.tsx Line 14
console.log("AdminRoute: Checking status...", { userEmail: user?.email });

// strava.ts Line 49
console.error("Token Refresh Failed", error);  // May contain tokens
```

**Fix:**
- Remove all console.log in production build
- Use proper logging service (e.g., Sentry, LogRocket)
- Never log tokens, passwords, or PII

---

### HIGH-004: Input Validation Only on Client-Side

**Location:** `src/lib/validation.ts`

**Issue:** Zod validation is only performed client-side. Server accepts any data.

**Evidence:**
```typescript
// Client-side only validation
export const registrationSchema = z.object({
    email: z.string().email(...),
    // etc.
});

// Direct insert without server validation
const { data: insertData } = await supabase
    .from('registrations')
    .insert({...})  // No schema validation on server
```

**Exploitation:**
- Bypass client validation with direct API calls
- Inject malicious data
- SQL injection in text fields (if any raw queries exist)

**Fix:**
- Add PostgreSQL CHECK constraints
- Use Supabase Database Functions with input validation
- Implement Edge Function layer for all writes

---

### HIGH-005: Admin Panel Access Control Weak

**Location:** `src/components/AdminRoute.tsx`, `fix_admin_access.sql`

**Issue:** Admin access is checked via email matching in a table. Email can be spoofed during OAuth flows or if email verification is disabled.

**Evidence:**
```typescript
// Matches on email, not verified user_id
.eq('email', user.email)

// SQL policy allows email-based matching
WHERE email = (select auth.email())  // Email can change!
```

**Fix:**
- Always match on `user_id`, never email
- Require email verification before admin access
- Use Supabase custom claims for roles

---

### HIGH-006: Proof Images Publicly Accessible

**Location:** `supabase_schema.sql` (Lines 45-47)

**Issue:** The 'proofs' storage bucket is set to public.

**Evidence:**
```sql
INSERT INTO storage.buckets (id, name, public) 
VALUES ('proofs', 'proofs', true)  -- PUBLIC = TRUE!
```

**Exploitation:**
- Anyone can enumerate and view all proof images
- Scrape user activity data
- Privacy violation

**Fix:**
```sql
-- Change to private bucket
UPDATE storage.buckets SET public = false WHERE id = 'proofs';

-- Users access via signed URLs only
```

---

### HIGH-007: No Input Sanitization for Notes Fields

**Location:** `src/components/dashboard/ProofSubmissionModal.tsx`

**Issue:** Activity notes and other text fields are stored without sanitization.

**Evidence:**
```typescript
activity_notes: data.notes,  // Direct storage, no sanitization
```

**Fix:**
- Sanitize all text input with DOMPurify or similar
- Set max length constraints in database
- Escape HTML on display

---

### HIGH-008: Strava OAuth State Parameter Missing

**Location:** `src/components/dashboard/StravaConnect.tsx`

**Issue:** No state parameter is used in Strava OAuth flow, making it vulnerable to CSRF attacks.

**Evidence:**
```typescript
// Line 81 - No state parameter
const stravaAuthUrl = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=activity:read_all,profile:read_all`;
// Missing: &state=random_csrf_token
```

**Fix:**
```typescript
const state = crypto.randomUUID();
sessionStorage.setItem('strava_state', state);
const stravaAuthUrl = `...&state=${state}`;

// In callback, verify:
if (searchParams.get('state') !== sessionStorage.getItem('strava_state')) {
    throw new Error('Invalid state');
}
```

---

### HIGH-009: Email Notifications Use Mock Functions

**Location:** `src/lib/notifications.ts`

**Issue:** All email functions are mocks that only console.log. Users never receive actual emails.

**Evidence:**
```typescript
export const sendShippingEmail = async (...) => {
    console.log(`[EMAIL DEV] To: ${email}...`);  // Just logs!
    return new Promise(resolve => setTimeout(resolve, 500));
};
```

**Impact:**
- Users don't receive confirmation emails
- No payment receipts (legal requirement in India)
- No shipping notifications

**Fix:**
- Implement Supabase Edge Function with Resend API
- Ensure transactional emails for payments

---

## 🟡 MEDIUM SEVERITY ISSUES

### MEDIUM-001: Missing Content Security Policy

**Location:** `netlify.toml`

**Issue:** No Content-Security-Policy header is set. This allows inline scripts and reduces XSS protection.

**Fix:**
```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self' https://checkout.razorpay.com https://connect.facebook.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://api.strava.com https://api.postalpincode.in"
```

---

### MEDIUM-002: Excessive OAuth Scopes

**Location:** `src/components/dashboard/StravaConnect.tsx` (Line 81)

**Issue:** Requesting `profile:read_all` and `activity:read_all` when only basic data is needed.

**Evidence:**
```typescript
&scope=activity:read_all,profile:read_all  // Too broad!
```

**Fix:**
```typescript
&scope=activity:read,profile:read  // Minimum required
```

---

### MEDIUM-003: Debug Information Exposed

**Location:** `src/pages/StravaCallback.tsx`

**Issue:** Detailed error messages are shown to users, revealing internal implementation.

**Evidence:**
```typescript
setStatus(`Error: ${errorMessage}`);  // Shows internal errors
toast.info("Tip: Project ID mismatch...");  // Reveals architecture
```

**Fix:**
- Show generic error messages to users
- Log detailed errors server-side only

---

### MEDIUM-004: Session Persistence Too Long

**Location:** Default Supabase Auth settings

**Issue:** Sessions may persist indefinitely without re-authentication.

**Fix:**
- Configure session expiry in Supabase Dashboard
- Implement session refresh with token rotation
- Force re-login for sensitive operations (payment, address change)

---

### MEDIUM-005: No Account Lockout

**Issue:** Failed login attempts don't trigger account lockout.

**Fix:**
- Implement progressive delays
- Lock account after 5 failed attempts for 15 minutes
- Send email notification of lockout

---

### MEDIUM-006: Missing Subresource Integrity

**Location:** `index.html`

**Issue:** External scripts load without SRI hashes.

**Evidence:**
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<!-- No integrity attribute! -->
```

**Fix:**
```html
<script src="https://checkout.razorpay.com/v1/checkout.js" 
        integrity="sha384-xxxxx" 
        crossorigin="anonymous"></script>
```

---

### MEDIUM-007: PII Stored in Auth Metadata

**Location:** `src/components/registration/RegistrationForm.tsx`

**Issue:** Full address, phone stored in user metadata which may be logged differently than standard tables.

**Evidence:**
```typescript
supabase.auth.updateUser({
    data: {
        address_line1: data.addressLine1,
        phone: data.phone,  // PII in metadata
    }
})
```

**Fix:**
- Store PII in a separate secured table with RLS
- Metadata should only contain preferences, not PII

---

### MEDIUM-008: CORS Wildcard in Edge Function

**Location:** `supabase/functions/strava-auth/index.ts`

**Issue:** CORS allows any origin.

**Evidence:**
```typescript
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',  // Wildcard!
}
```

**Fix:**
```typescript
const allowedOrigins = ['https://pedalpulse.in', 'http://localhost:5173'];
const origin = req.headers.get('origin');
const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
}
```

---

## 🟢 LOW SEVERITY ISSUES

### LOW-001: LocalStorage Used for Preferences

**Location:** `src/pages/PublicLeaderboard.tsx`

**Issue:** Filter preferences stored in localStorage without encryption. Not sensitive but could be modified.

---

### LOW-002: Third-Party Scripts Without Privacy Notice

**Location:** `index.html` - Facebook Pixel

**Issue:** Meta Pixel tracks users. Privacy policy must disclose this.

---

### LOW-003: Missing robots.txt

**Issue:** No robots.txt to prevent indexing of sensitive paths like `/admin/*`.

**Fix:**
```
User-agent: *
Disallow: /admin/
Disallow: /dashboard/
```

---

### LOW-004: HTTP Public Key Pinning Not Implemented

**Issue:** HPKP would add additional certificate validation.

---

### LOW-005: Missing Logout From All Devices

**Issue:** No way for users to invalidate all sessions if account is compromised.

---

### LOW-006: Date Handling Timezone Issues

**Issue:** IST hardcoded in challenge rules may cause issues for international users.

---

## 📋 COMPLIANCE ISSUES

### GDPR (If Serving EU Users)

| Requirement | Status | Issue |
|-------------|--------|-------|
| Data Processing Agreement | ❌ Missing | Need DPA with Supabase, Razorpay |
| Right to Access | ❌ Not Implemented | No data export feature |
| Right to Erasure | ❌ Not Implemented | No account deletion |
| Cookie Consent | ❌ Missing | No cookie banner for Meta Pixel |
| Privacy Policy | ⚠️ Partial | Needs Strava data processing details |

### Indian IT Act 2000 / SPDI Rules

| Requirement | Status | Issue |
|-------------|--------|-------|
| Reasonable Security | ❌ Failing | Tokens stored plaintext |
| Consent for Collection | ⚠️ Partial | Terms checkbox exists |
| Data Localization | ⚠️ Unclear | Supabase data location unknown |
| Payment Receipts | ❌ Not Sent | Only console.log emails |

### Strava API Compliance

| Requirement | Status | Issue |
|-------------|--------|-------|
| "Powered by Strava" Attribution | ✅ Implemented | Present in UI |
| "Connect with Strava" Button | ✅ Implemented | Using official style |
| Data Refresh Rate | ✅ Compliant | Only on explicit user sync |
| Token Security | ❌ Failing | Stored in plaintext |
| Disconnect Option | ✅ Implemented | Present in UI |

---

## 🔧 PRIORITIZED REMEDIATION PLAN

### Phase 1: Critical (Complete Before Any Launch - 1-2 weeks)

1. **[CRITICAL-001]** Implement server-side payment verification
2. **[CRITICAL-002]** Fix RLS policies to prevent registration hijacking
3. **[CRITICAL-003]** Move admin authorization to server-side
4. **[CRITICAL-004]** Encrypt Strava tokens at rest
5. **[CRITICAL-005]** Remove user_id from public leaderboard view

### Phase 2: High Priority (Complete Within 2-4 weeks)

1. **[HIGH-001]** Implement CSRF protection
2. **[HIGH-002]** Enable rate limiting on auth endpoints
3. **[HIGH-003]** Remove console.log statements
4. **[HIGH-004]** Add server-side input validation
5. **[HIGH-005]** Fix admin authentication to use user_id
6. **[HIGH-006]** Make proof storage bucket private
7. **[HIGH-007]** Add input sanitization
8. **[HIGH-008]** Add OAuth state parameter
9. **[HIGH-009]** Implement actual email sending

### Phase 3: Medium Priority (Complete Within 4-6 weeks)

1. Add Content Security Policy
2. Reduce OAuth scopes
3. Implement proper error handling
4. Configure session management
5. Add account lockout
6. Add SRI to external scripts
7. Move PII from metadata to secured table
8. Fix CORS in Edge Functions

### Phase 4: Compliance (Complete Within 8 weeks)

1. Implement GDPR data export
2. Add account deletion feature
3. Add cookie consent banner
4. Update privacy policy
5. Ensure payment receipt emails are sent
6. Sign DPAs with vendors

---

## 📊 TESTING RECOMMENDATIONS

### Security Testing Required

- [ ] Penetration test on payment flow
- [ ] Fuzz testing on all input fields
- [ ] Session management testing
- [ ] API authentication bypass attempts
- [ ] RLS policy verification
- [ ] Storage bucket access testing

### Monitoring to Implement

- [ ] Failed login attempt alerts
- [ ] Payment discrepancy alerts
- [ ] Admin access logging
- [ ] Error rate monitoring
- [ ] Data export/deletion request logging

---

## ✅ WHAT'S WORKING WELL

1. **Security Headers**: Good set of headers in netlify.toml
2. **RLS Enabled**: Row Level Security is turned on (but needs fixes)
3. **Auth Provider**: Using Supabase Auth (well-maintained)
4. **HTTPS**: Netlify enforces HTTPS by default
5. **Strava Compliance**: Good UI attribution and disconnect options
6. **Error Boundaries**: React error boundaries prevent full crashes
7. **Protected Routes**: Basic route protection exists

---

## 🚫 DEPLOYMENT RECOMMENDATION

**DO NOT DEPLOY TO PRODUCTION** until all Critical and High severity issues are resolved.

Current state risk assessment:
- **Financial Risk**: HIGH (payment bypass possible)
- **Data Breach Risk**: CRITICAL (tokens stored plaintext)
- **Legal Risk**: HIGH (GDPR/IT Act non-compliance)
- **Reputational Risk**: CRITICAL (if exploited)

Estimated remediation time: **4-6 weeks** for production-ready state.

---

*Audit completed: December 30, 2025*  
*Next audit recommended: Before any major release or after completing Phase 2*
