import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface UserProfile {
  id: string
  email: string
  full_name?: string
  artist_name?: string
  avatar_url?: string
  spotify_id?: string
  spotify_connected: boolean
  google_connected: boolean
  created_at: string
  updated_at: string
}

export interface SpotifyConnection {
  id: string
  user_id: string
  spotify_user_id: string
  access_token: string
  refresh_token: string
  expires_at: string
  scope: string
  created_at: string
  updated_at: string
}

export interface SpotifyAnalytics {
  id: string
  user_id: string
  spotify_user_id: string
  data_type: 'top_tracks' | 'top_artists' | 'playlists' | 'recently_played' | 'audio_features'
  time_range?: 'short_term' | 'medium_term' | 'long_term'
  data: any
  synced_at: string
  created_at: string
}

// Auth helper functions
export const auth = {
  // Sign up with email and password
  signUp: async (email: string, password: string, userData?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData?.full_name,
          artist_name: userData?.artist_name,
          spotify_connected: false,
          google_connected: false
        }
      }
    })
    
    // Create user profile
    if (data.user && !error) {
      await supabase.from('user_profiles').insert({
        id: data.user.id,
        email: data.user.email,
        full_name: userData?.full_name,
        artist_name: userData?.artist_name,
        spotify_connected: false,
        google_connected: false
      })
    }
    
    return { data, error }
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${import.meta.env.VITE_APP_URL}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    })
    return { data, error }
  },

  // Sign in with Spotify
  signInWithSpotify: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'spotify',
      options: {
        redirectTo: `${import.meta.env.VITE_APP_URL}/auth/callback`,
        scopes: 'user-read-email user-read-private user-top-read user-read-playback-state user-read-currently-playing playlist-read-private playlist-read-collaborative user-library-read user-read-recently-played streaming user-follow-read'
      }
    })
    return { data, error }
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Get session
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  }
}

// Database operations
export const db = {
  // User profiles
  getUserProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  updateUserProfile: async (userId: string, updates: Partial<UserProfile>) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },

  // Spotify connections
  upsertSpotifyConnection: async (connection: Partial<SpotifyConnection>) => {
    const { data, error } = await supabase
      .from('spotify_connections')
      .upsert(connection, { onConflict: 'user_id' })
      .select()
      .single()
    return { data, error }
  },

  getSpotifyConnection: async (userId: string) => {
    const { data, error } = await supabase
      .from('spotify_connections')
      .select('*')
      .eq('user_id', userId)
      .single()
    return { data, error }
  },

  // Spotify analytics
  saveSpotifyAnalytics: async (analytics: Partial<SpotifyAnalytics>) => {
    const { data, error } = await supabase
      .from('spotify_analytics')
      .insert(analytics)
      .select()
      .single()
    return { data, error }
  },

  getSpotifyAnalytics: async (userId: string, dataType?: string, timeRange?: string) => {
    let query = supabase
      .from('spotify_analytics')
      .select('*')
      .eq('user_id', userId)
      .order('synced_at', { ascending: false })

    if (dataType) {
      query = query.eq('data_type', dataType)
    }

    if (timeRange) {
      query = query.eq('time_range', timeRange)
    }

    const { data, error } = await query
    return { data, error }
  }
}