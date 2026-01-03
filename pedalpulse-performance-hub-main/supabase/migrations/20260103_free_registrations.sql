-- Create table for free registrations
CREATE TABLE IF NOT EXISTS free_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    category TEXT NOT NULL,
    city TEXT NOT NULL,
    referral_source TEXT DEFAULT 'not_specified',
    challenge_name TEXT NOT NULL DEFAULT 'republic-day-2026',
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_free_registrations_email ON free_registrations(email);
CREATE INDEX IF NOT EXISTS idx_free_registrations_phone ON free_registrations(phone);
CREATE INDEX IF NOT EXISTS idx_free_registrations_challenge ON free_registrations(challenge_name);
CREATE INDEX IF NOT EXISTS idx_free_registrations_category ON free_registrations(category);

-- Enable RLS
ALTER TABLE free_registrations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for public registration without auth)
CREATE POLICY "Allow public insert on free_registrations"
ON free_registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only allow authenticated users (admins) to read all registrations
CREATE POLICY "Allow authenticated users to read free_registrations"
ON free_registrations
FOR SELECT
TO authenticated
USING (true);

-- Allow admins to update and delete
CREATE POLICY "Allow authenticated users to update free_registrations"
ON free_registrations
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete free_registrations"
ON free_registrations
FOR DELETE
TO authenticated
USING (true);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_free_registrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_free_registrations_updated_at
    BEFORE UPDATE ON free_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_free_registrations_updated_at();
