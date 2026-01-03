-- 1. Fix the data: Link admin_users to auth.users by email
-- This ensures that if you manually inserted via email, the user_id is now populated.
UPDATE admin_users
SET user_id = auth.users.id
FROM auth.users
WHERE admin_users.email = auth.users.email
AND admin_users.user_id IS NULL;

-- 2. Drop existing restrictive policy
DROP POLICY IF EXISTS "Admins can view admin_users" ON admin_users;

-- 3. Create a more permissive policy for reading permissions
-- Allow a user to read the admin_users table IF:
-- a) Their user_id matches the row's user_id
-- b) OR the row's email matches their current session email (useful if user_id is somehow missing but email is correct)
CREATE POLICY "Users can check their own admin status"
ON admin_users FOR SELECT
USING (
  user_id = auth.uid() 
  OR 
  email = (select auth.email())
);

-- 4. Just in case, grant usage
GRANT SELECT ON admin_users TO authenticated;
