-- Add missing columns to registrations table if they don't exist
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS verification_notes TEXT,
ADD COLUMN IF NOT EXISTS certificate_url TEXT;

-- Refresh schema cache (optional, sometimes helpful)
NOTIFY pgrst, 'reload schema';
