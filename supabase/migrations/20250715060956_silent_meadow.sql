/*
  # Create Spotify analytics storage

  1. New Tables
    - `spotify_analytics`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `spotify_user_id` (text, Spotify user ID)
      - `data_type` (text, type of data: top_tracks, top_artists, playlists, etc.)
      - `time_range` (text, optional: short_term, medium_term, long_term)
      - `data` (jsonb, the actual analytics data)
      - `synced_at` (timestamp, when data was synced)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `spotify_analytics` table
    - Add policy for users to manage their own analytics data

  3. Indexes
    - Add indexes for efficient querying
*/

CREATE TABLE IF NOT EXISTS spotify_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  spotify_user_id text NOT NULL,
  data_type text NOT NULL CHECK (data_type IN ('top_tracks', 'top_artists', 'playlists', 'recently_played', 'audio_features', 'currently_playing', 'user_profile')),
  time_range text CHECK (time_range IN ('short_term', 'medium_term', 'long_term')),
  data jsonb NOT NULL,
  synced_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE spotify_analytics ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their own analytics data
CREATE POLICY "Users can read own spotify analytics"
  ON spotify_analytics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own spotify analytics"
  ON spotify_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own spotify analytics"
  ON spotify_analytics
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own spotify analytics"
  ON spotify_analytics
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_spotify_analytics_user_id ON spotify_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_spotify_analytics_data_type ON spotify_analytics(data_type);
CREATE INDEX IF NOT EXISTS idx_spotify_analytics_time_range ON spotify_analytics(time_range);
CREATE INDEX IF NOT EXISTS idx_spotify_analytics_synced_at ON spotify_analytics(synced_at DESC);
CREATE INDEX IF NOT EXISTS idx_spotify_analytics_user_data_type ON spotify_analytics(user_id, data_type);
CREATE INDEX IF NOT EXISTS idx_spotify_analytics_user_data_time ON spotify_analytics(user_id, data_type, time_range);

-- Function to clean up old analytics data (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_analytics()
RETURNS void AS $$
BEGIN
  DELETE FROM spotify_analytics 
  WHERE synced_at < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: Create a scheduled job to run cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-analytics', '0 2 * * *', 'SELECT cleanup_old_analytics();');