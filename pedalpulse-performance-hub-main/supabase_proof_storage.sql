-- 1. Create the 'proof-submissions' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('proof-submissions', 'proof-submissions', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create simplified policy to allow authenticated users to upload to proof-submissions
-- Policy for INSERT (Upload)
CREATE POLICY "Authenticated users can upload proofs"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'proof-submissions' 
    AND auth.role() = 'authenticated'
);

-- Policy for SELECT (View)
CREATE POLICY "Anyone can view proofs"
ON storage.objects FOR SELECT
USING (bucket_id = 'proof-submissions');

-- Policy for UPDATE (not strictly needed based on requirements, but good for retries)
CREATE POLICY "Users can update their own proofs"
ON storage.objects FOR UPDATE
USING (bucket_id = 'proof-submissions' AND auth.uid() = owner);

-- Policy for DELETE (optional)
CREATE POLICY "Users can delete their own proofs"
ON storage.objects FOR DELETE
USING (bucket_id = 'proof-submissions' AND auth.uid() = owner);
