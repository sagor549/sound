/*
  # Create Spotify connections table

  1. New Tables
    - `spotify_connections`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `spotify_user_id` (text, Spotify user ID)
      - `access_token` (text, encrypted)
      - `refresh_token` (text, encrypted)
      - `expires_at` (timestamp)
      - `scope` (text, granted permissions)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `spotify_connections` table
    - Add policy for users to manage their own connections
*/

CREATE TABLE IF NOT EXISTS spotify_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  spotify_user_id text NOT NULL,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  expires_at timestamptz NOT NULL,
  scope text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE spotify_connections ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their own Spotify connections
CREATE POLICY "Users can read own spotify connections"
  ON spotify_connections
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own spotify connections"
  ON spotify_connections
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own spotify connections"
  ON spotify_connections
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own spotify connections"
  ON spotify_connections
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_spotify_connections_user_id ON spotify_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_spotify_connections_spotify_user_id ON spotify_connections(spotify_user_id);