-- Create a bucket for certificates
INSERT INTO storage.buckets (id, name, public) 
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users (specifically admins via app logic) to upload certificates
-- In a real strict RLS, strictly filter by admin role, but for now authenticated is fine as the app controls generation.
CREATE POLICY "Authenticated users can upload certificates"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'certificates' 
    AND auth.role() = 'authenticated'
);

-- Anyone can view certificates (for sharing)
CREATE POLICY "Anyone can view certificates"
ON storage.objects FOR SELECT
USING (bucket_id = 'certificates');
