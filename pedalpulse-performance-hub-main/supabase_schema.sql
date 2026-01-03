-- 1. Update registrations table
ALTER TABLE registrations 
ADD COLUMN user_id UUID REFERENCES auth.users(id),
ADD COLUMN proof_submission_date TIMESTAMPTZ,
ADD COLUMN proof_image_url TEXT,
ADD COLUMN activity_date DATE,
ADD COLUMN activity_time TEXT,
ADD COLUMN activity_distance NUMERIC,
ADD COLUMN activity_notes TEXT,
ADD COLUMN verification_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
ADD COLUMN verification_notes TEXT,
ADD COLUMN certificate_url TEXT,
ADD COLUMN medal_tracking_number TEXT,
ADD COLUMN medal_courier TEXT,
ADD COLUMN medal_dispatch_date TIMESTAMPTZ,
ADD COLUMN medal_delivery_status TEXT DEFAULT 'not_shipped', -- 'not_shipped', 'shipped', 'delivered', 'returned'
ADD COLUMN status TEXT DEFAULT 'registered'; -- 'registered', 'completed', 'disqualified'

-- 2. Enable RLS
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies

-- Policy: Users can view their own registrations
CREATE POLICY "Users can view own registrations"
ON registrations FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own registration (during checkout, or anon if not logged in - handle anon separately)
-- For now, allow inserts for authenticated users. For anon, we might need a different policy or use a function.
-- Assuming we link user_id *after* or *during* insert if logged in.
CREATE POLICY "Users can insert own registrations"
ON registrations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own proof submission (restrict columns if needed, but for simplicity allow update)
CREATE POLICY "Users can update own registrations"
ON registrations FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Service role (admin) has full access (Implicit in Supabase, but good to know)
-- No explicit policy needed for service_role as it bypasses RLS.

-- 4. Create bucket for proof uploads (if not exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('proofs', 'proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for storage
CREATE POLICY "Users can upload proofs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'proofs' AND auth.uid() = owner);

CREATE POLICY "Users can view own proofs"
ON storage.objects FOR SELECT
USING (bucket_id = 'proofs' AND auth.uid() = owner);
