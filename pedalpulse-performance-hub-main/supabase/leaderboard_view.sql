-- Secure View for Public Leaderboard
-- This view allows anyone (including public/anon) to see leaderboard data without exposing sensitive info.
-- Run this in your Supabase SQL Editor.

CREATE OR REPLACE VIEW leaderboard_entries AS
SELECT 
    id,
    user_id,
    first_name,
    last_name,
    gender,
    sport_distance,
    challenge_name,
    status,
    verification_method,
    strava_activity_data,
    created_at
FROM registrations
WHERE payment_status = 'completed';

-- Grant access to authenticated users AND public (anon)
GRANT SELECT ON leaderboard_entries TO authenticated;
GRANT SELECT ON leaderboard_entries TO service_role;
GRANT SELECT ON leaderboard_entries TO anon; -- Added for public access
