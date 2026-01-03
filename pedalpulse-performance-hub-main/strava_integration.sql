-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Create Strava Connections Table
CREATE TABLE IF NOT EXISTS strava_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  strava_athlete_id BIGINT UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMP NOT NULL,
  athlete_data JSONB, 
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_strava_user_id ON strava_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_strava_athlete_id ON strava_connections(strava_athlete_id);

-- 2. Update Registrations Table (Safe to re-run)
DO $$
BEGIN
    ALTER TABLE registrations ADD COLUMN verification_method TEXT DEFAULT 'manual' CHECK (verification_method IN ('manual', 'strava_auto'));
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE registrations ADD COLUMN strava_activity_id BIGINT;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE registrations ADD COLUMN strava_activity_data JSONB;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE registrations ADD COLUMN auto_verified_at TIMESTAMP WITH TIME ZONE;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;


-- 3. Create Activity Sync Log Table
CREATE TABLE IF NOT EXISTS strava_activity_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  registration_id BIGINT REFERENCES registrations(id), -- FIXED: BIGINT to match registrations.id
  strava_activity_id BIGINT,
  sync_type TEXT, 
  status TEXT, 
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE strava_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE strava_activity_sync_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own strava connection" ON strava_connections;
DROP POLICY IF EXISTS "Users can delete own strava connection" ON strava_connections;
DROP POLICY IF EXISTS "Users can insert own strava connection" ON strava_connections;
DROP POLICY IF EXISTS "Users can update own strava connection" ON strava_connections;
DROP POLICY IF EXISTS "Users can view own sync logs" ON strava_activity_sync_log;

-- Re-create Policies
CREATE POLICY "Users can view own strava connection" ON strava_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own strava connection" ON strava_connections FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own strava connection" ON strava_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own strava connection" ON strava_connections FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sync logs" ON strava_activity_sync_log FOR SELECT USING (auth.uid() = user_id);
