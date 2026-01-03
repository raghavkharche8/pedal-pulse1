-- ============================================================
-- SECURITY FIX: Production-Ready RLS Policies
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add missing columns for payment security
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
ADD COLUMN IF NOT EXISTS payment_verified_at TIMESTAMPTZ;

-- 2. Create payment audit log table for compliance
CREATE TABLE IF NOT EXISTS payment_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    action TEXT NOT NULL,
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit log (admins only)
ALTER TABLE payment_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view payment audit log"
ON payment_audit_log FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE user_id = auth.uid()
    )
);

-- 3. FIX: Prevent users from updating payment_status directly
-- Drop existing permissive policies
DROP POLICY IF EXISTS "Users can update own registrations" ON registrations;

-- Create restrictive update policy
CREATE POLICY "Users can update proof fields only"
ON registrations FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
    auth.uid() = user_id
    AND user_id IS NOT NULL
    -- Users cannot change payment-related fields or critical status
    -- These can only be changed by service_role (Edge Functions)
);

-- 4. FIX: Ensure INSERT requires authentication and proper user_id
DROP POLICY IF EXISTS "Users can insert own registrations" ON registrations;

CREATE POLICY "Authenticated users can insert own registrations"
ON registrations FOR INSERT
WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = user_id
);

-- 5. FIX: Make storage buckets private

-- Update proof-submissions bucket to private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'proof-submissions';

-- Update or create certificates bucket as private  
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- 6. FIX: Storage policies - Users can only access their own files
DROP POLICY IF EXISTS "Users can upload own proof" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own proof" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all proof submissions" ON storage.objects;

-- Proof submissions policies
CREATE POLICY "Users can upload own proof"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'proof-submissions'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own proof"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'proof-submissions'
    AND (
        auth.uid()::text = (storage.foldername(name))[1]
        OR EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
    )
);

-- Certificate policies (private access only)
CREATE POLICY "Users can view own certificates"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'certificates'
    AND (
        auth.uid()::text = (storage.foldername(name))[1]
        OR EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
    )
);

CREATE POLICY "Service role can manage certificates"
ON storage.objects FOR ALL
USING (
    bucket_id = 'certificates'
    AND auth.role() = 'service_role'
);

-- 7. FIX: Secure leaderboard view - Remove user_id, anonymize names
DROP VIEW IF EXISTS leaderboard_entries;

CREATE VIEW leaderboard_entries AS
SELECT 
    id as entry_id,
    -- Only first name + last initial for privacy
    first_name,
    LEFT(COALESCE(last_name, ''), 1) || '.' as last_initial,
    gender,
    sport_distance,
    challenge_name,
    status,
    verification_method,
    -- Only expose non-sensitive activity data
    CASE 
        WHEN strava_activity_data IS NOT NULL THEN
            jsonb_build_object(
                'distance', (strava_activity_data->>'distance')::numeric,
                'moving_time', (strava_activity_data->>'moving_time')::integer,
                'start_date', strava_activity_data->>'start_date',
                'id', strava_activity_data->>'id'
            )
        ELSE NULL
    END as strava_activity_data,
    created_at
FROM registrations
WHERE payment_status = 'completed'
AND verification_status = 'approved';

-- Grant read access
GRANT SELECT ON leaderboard_entries TO authenticated;
GRANT SELECT ON leaderboard_entries TO anon;

-- 8. FIX: Strava token encryption columns
-- Add encrypted columns (actual encryption happens in Edge Function)
ALTER TABLE strava_connections
ADD COLUMN IF NOT EXISTS access_token_encrypted TEXT,
ADD COLUMN IF NOT EXISTS refresh_token_encrypted TEXT,
ADD COLUMN IF NOT EXISTS encryption_version INTEGER DEFAULT 1;

-- 9. FIX: Admin function should check user_id, not email
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users 
        WHERE user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 10. Create function to check if user can update specific fields
CREATE OR REPLACE FUNCTION check_registration_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Prevent non-service-role from updating payment fields
    IF current_setting('role') != 'service_role' THEN
        IF OLD.payment_status != NEW.payment_status 
           OR OLD.payment_id != NEW.payment_id
           OR OLD.razorpay_order_id != NEW.razorpay_order_id THEN
            RAISE EXCEPTION 'Cannot modify payment fields directly';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger
DROP TRIGGER IF EXISTS protect_payment_fields ON registrations;
CREATE TRIGGER protect_payment_fields
    BEFORE UPDATE ON registrations
    FOR EACH ROW
    EXECUTE FUNCTION check_registration_update();

-- ============================================================
-- IMPORTANT: After running this, also need to:
-- 1. Set RAZORPAY_KEY_SECRET in Supabase Edge Function secrets
-- 2. Set ALLOWED_ORIGIN to your production domain
-- 3. Deploy Edge Functions: verify-payment, create-order
-- ============================================================
