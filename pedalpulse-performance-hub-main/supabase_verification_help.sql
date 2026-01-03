
-- Disable email confirmation requirement (Run this in Supabase SQL Editor if you want to skip email verification for development)
-- ALTER TABLE auth.users ALTER COLUMN is_sso_user SET DEFAULT false; 
-- Note: You typically change this setting in the Supabase Dashboard UI under Authentication -> Providers -> Email -> Confirm email

-- To manually verify a user for testing purposes via SQL:
-- UPDATE auth.users SET email_confirmed_at = now() WHERE email = 'your_test_email@example.com';
