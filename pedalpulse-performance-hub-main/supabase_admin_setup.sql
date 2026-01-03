-- 1. Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Link to supabase auth user
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin', -- 'admin', 'super_admin'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  full_name TEXT
);

-- 2. Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 3. Policies for admin_users
-- Only admins can view admin_users table (to check permissions)
CREATE POLICY "Admins can view admin_users"
ON admin_users FOR SELECT
USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- 4. Initial Admin Setup (Instructions)
-- You must manually insert your user into this table via SQL Editor after signing up
-- INSERT INTO admin_users (user_id, email, role, full_name) 
-- VALUES ('<your-auth-user-id>', 'raghav@pedalpulse.com', 'super_admin', 'Raghav Kharche');


-- 5. Helper Function to check if user is admin (Optional but useful for RLS)
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 6. Grant Access to Registrations Table for Admins
-- We need a policy that allows admins to view ALL registrations
CREATE POLICY "Admins can view all registrations"
ON registrations FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can update all registrations"
ON registrations FOR UPDATE
USING (is_admin());

-- 7. Grant Access to Storage for Admins
CREATE POLICY "Admins can view all proof submissions"
ON storage.objects FOR SELECT
USING (bucket_id = 'proof-submissions' AND is_admin());
