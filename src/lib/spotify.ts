import { supabase, db } from './supabase'

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET
const SPOTIFY_REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI

export interface SpotifyUser {
  id: string
  display_name: string
  email: string
  images: Array<{ url: string }>
  followers: { total: number }
  country: string
}

export interface SpotifyTrack {
  id: string
  name: string
  artists: Array<{ name: string; id: string }>
  album: {
    name: string
    images: Array<{ url: string }>
    release_date: string
  }
  popularity: number
  duration_ms: number
  external_urls: { spotify: string }
}

export interface SpotifyPlaylist {
  id: string
  name: string
  description: string
  images: Array<{ url: string }>
  tracks: { total: number }
  public: boolean
  owner: { display_name: string }
}

export interface SpotifyArtist {
  id: string
  name: string
  genres: string[]
  popularity: number
  followers: { total: number }
  images: Array<{ url: string }>
}

export interface SpotifyAudioFeatures {
  id: string
  danceability: number
  energy: number
  key: number
  loudness: number
  mode: number
  speechiness: number
  acousticness: number
  instrumentalness: number
  liveness: number
  valence: number
  tempo: number
  duration_ms: number
  time_signature: number
}

export interface SpotifyAnalyticsData {
  topTracks: {
    short_term: SpotifyTrack[]
    medium_term: SpotifyTrack[]
    long_term: SpotifyTrack[]
  }
  topArtists: {
    short_term: SpotifyArtist[]
    medium_term: SpotifyArtist[]
    long_term: SpotifyArtist[]
  }
  playlists: SpotifyPlaylist[]
  recentlyPlayed: any[]
  audioFeatures: SpotifyAudioFeatures[]
  currentlyPlaying: any
  userProfile: SpotifyUser
}

export class SpotifyAPI {
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private userId: string | null = null

  constructor() {
    this.loadTokensFromStorage()
  }

  private loadTokensFromStorage() {
    this.accessToken = localStorage.getItem('spotify_access_token')
    this.refreshToken = localStorage.getItem('spotify_refresh_token')
    this.userId = localStorage.getItem('spotify_user_id')
  }

  private saveTokensToStorage(accessToken: string, refreshToken?: string, userId?: string) {
    this.accessToken = accessToken
    localStorage.setItem('spotify_access_token', accessToken)
    
    if (refreshToken) {
      this.refreshToken = refreshToken
      localStorage.setItem('spotify_refresh_token', refreshToken)
    }

    if (userId) {
      this.userId = userId
      localStorage.setItem('spotify_user_id', userId)
    }
  }

  // Initialize from Supabase session
  async initializeFromSession() {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user) {
      const { data: connection } = await db.getSpotifyConnection(session.user.id)
      
      if (connection) {
        const expiresAt = new Date(connection.expires_at)
        const now = new Date()
        
        if (expiresAt > now) {
          // Token is still valid
          this.accessToken = connection.access_token
          this.refreshToken = connection.refresh_token
          this.userId = connection.spotify_user_id
          this.saveTokensToStorage(this.accessToken, this.refreshToken, this.userId)
          return true
        } else if (connection.refresh_token) {
          // Token expired, try to refresh
          this.refreshToken = connection.refresh_token
          return await this.refreshAccessToken()
        }
      }
    }
    
    return false
  }

  // Check if tokens are stored and valid
  async checkStoredTokens() {
    if (this.accessToken && this.refreshToken && this.userId) {
      // Try to make a simple API call to verify token validity
      try {
        await this.getUserProfile()
        return true
      } catch (error) {
        // Token might be expired, try to refresh
        if (this.refreshToken) {
          return await this.refreshAccessToken()
        }
      }
    }
    return false
  }

  // Enhanced initialization that checks stored tokens first
  async initialize() {
    // First check if we have valid stored tokens
    const hasValidTokens = await this.checkStoredTokens()
    if (hasValidTokens) {
      return true
    }
    
    // If no valid stored tokens, try to initialize from session
    return await this.initializeFromSession()
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code: string): Promise<boolean> {
    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: SPOTIFY_REDIRECT_URI
        })
      })

      const data = await response.json()
      
      if (data.access_token) {
        // Get user profile to get Spotify user ID
        const userProfile = await this.getUserProfile(data.access_token)
        
        this.saveTokensToStorage(data.access_token, data.refresh_token, userProfile.id)
        
        // Store tokens in Supabase
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString()
          
          await db.upsertSpotifyConnection({
            user_id: user.id,
            spotify_user_id: userProfile.id,
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_at: expiresAt,
            scope: data.scope || ''
          })

          await db.updateUserProfile(user.id, {
            spotify_connected: true,
            spotify_id: userProfile.id
          })
        }
        
        return true
      }
      return false
    } catch (error) {
      console.error('Error exchanging code for token:', error)
      return false
    }
  }

  // Refresh access token
  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken
        })
      })

      const data = await response.json()
      
      if (data.access_token) {
        this.saveTokensToStorage(data.access_token)
        
        // Update in Supabase
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString()
          
          await db.upsertSpotifyConnection({
            user_id: user.id,
            access_token: data.access_token,
            expires_at: expiresAt
          })
        }
        
        return true
      }
      return false
    } catch (error) {
      console.error('Error refreshing token:', error)
      return false
    }
  }

  // Make authenticated API request with rate limiting
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.accessToken) {
      throw new Error('No access token available')
    }

    const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get('Retry-After') || '1')
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000))
      return this.makeRequest(endpoint, options)
    }

    if (response.status === 401) {
      // Token expired, try to refresh
      const refreshed = await this.refreshAccessToken()
      if (refreshed) {
        // Retry the request with new token
        return this.makeRequest(endpoint, options)
      } else {
        throw new Error('Unable to refresh access token')
      }
    }

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`)
    }

    return response.json()
  }

  // Get user profile (can be called with token for initial setup)
  async getUserProfile(token?: string): Promise<SpotifyUser> {
    if (token) {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      return response.json()
    }
    return this.makeRequest('/me')
  }

  // Get user's top tracks
  async getTopTracks(timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term', limit: number = 50): Promise<SpotifyTrack[]> {
    const data = await this.makeRequest(`/me/top/tracks?time_range=${timeRange}&limit=${limit}`)
    return data.items
  }

  // Get user's top artists
  async getTopArtists(timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term', limit: number = 50): Promise<SpotifyArtist[]> {
    const data = await this.makeRequest(`/me/top/artists?time_range=${timeRange}&limit=${limit}`)
    return data.items
  }

  // Get user's playlists
  async getUserPlaylists(limit: number = 50): Promise<SpotifyPlaylist[]> {
    const data = await this.makeRequest(`/me/playlists?limit=${limit}`)
    return data.items
  }

  // Get currently playing track
  async getCurrentlyPlaying(): Promise<any> {
    try {
      return await this.makeRequest('/me/player/currently-playing')
    } catch (error) {
      return null
    }
  }

  // Get recently played tracks
  async getRecentlyPlayed(limit: number = 50): Promise<any> {
    const data = await this.makeRequest(`/me/player/recently-played?limit=${limit}`)
    return data.items
  }

  // Get user's saved tracks
  async getSavedTracks(limit: number = 50, offset: number = 0): Promise<SpotifyTrack[]> {
    const data = await this.makeRequest(`/me/tracks?limit=${limit}&offset=${offset}`)
    return data.items.map((item: any) => item.track)
  }

  // Get audio features for tracks
  async getAudioFeatures(trackIds: string[]): Promise<SpotifyAudioFeatures[]> {
    const ids = trackIds.join(',')
    const data = await this.makeRequest(`/audio-features?ids=${ids}`)
    return data.audio_features.filter(Boolean)
  }

  // Get followed artists
  async getFollowedArtists(limit: number = 50): Promise<SpotifyArtist[]> {
    const data = await this.makeRequest(`/me/following?type=artist&limit=${limit}`)
    return data.artists.items
  }

  // Comprehensive analytics sync
  async syncAllAnalytics(): Promise<SpotifyAnalyticsData> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const analytics: SpotifyAnalyticsData = {
      topTracks: {
        short_term: [],
        medium_term: [],
        long_term: []
      },
      topArtists: {
        short_term: [],
        medium_term: [],
        long_term: []
      },
      playlists: [],
      recentlyPlayed: [],
      audioFeatures: [],
      currentlyPlaying: null,
      userProfile: await this.getUserProfile()
    }

    // Get top tracks for all time ranges
    for (const timeRange of ['short_term', 'medium_term', 'long_term'] as const) {
      analytics.topTracks[timeRange] = await this.getTopTracks(timeRange)
      analytics.topArtists[timeRange] = await this.getTopArtists(timeRange)
      
      // Save to database
      await db.saveSpotifyAnalytics({
        user_id: user.id,
        spotify_user_id: this.userId!,
        data_type: 'top_tracks',
        time_range: timeRange,
        data: analytics.topTracks[timeRange],
        synced_at: new Date().toISOString()
      })

      await db.saveSpotifyAnalytics({
        user_id: user.id,
        spotify_user_id: this.userId!,
        data_type: 'top_artists',
        time_range: timeRange,
        data: analytics.topArtists[timeRange],
        synced_at: new Date().toISOString()
      })
    }

    // Get other data
    analytics.playlists = await this.getUserPlaylists()
    analytics.recentlyPlayed = await this.getRecentlyPlayed()
    analytics.currentlyPlaying = await this.getCurrentlyPlaying()

    // Get audio features for top tracks
    const allTopTrackIds = [
      ...analytics.topTracks.short_term,
      ...analytics.topTracks.medium_term,
      ...analytics.topTracks.long_term
    ].map(track => track.id)

    const uniqueTrackIds = [...new Set(allTopTrackIds)]
    if (uniqueTrackIds.length > 0) {
      analytics.audioFeatures = await this.getAudioFeatures(uniqueTrackIds)
    }

    // Save additional analytics
    await db.saveSpotifyAnalytics({
      user_id: user.id,
      spotify_user_id: this.userId!,
      data_type: 'playlists',
      data: analytics.playlists,
      synced_at: new Date().toISOString()
    })

    await db.saveSpotifyAnalytics({
      user_id: user.id,
      spotify_user_id: this.userId!,
      data_type: 'recently_played',
      data: analytics.recentlyPlayed,
      synced_at: new Date().toISOString()
    })

    await db.saveSpotifyAnalytics({
      user_id: user.id,
      spotify_user_id: this.userId!,
      data_type: 'audio_features',
      data: analytics.audioFeatures,
      synced_at: new Date().toISOString()
    })

    return analytics
  }

  // Get analytics from database
  async getStoredAnalytics(dataType?: string, timeRange?: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await db.getSpotifyAnalytics(user.id, dataType, timeRange)
    return { data, error }
  }

  // Check if user is connected
  isConnected(): boolean {
    return !!this.accessToken
  }

  // Disconnect (clear tokens)
  async disconnect() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      await db.updateUserProfile(user.id, {
        spotify_connected: false,
        spotify_id: null
      })
    }

    this.accessToken = null
    this.refreshToken = null
    this.userId = null
    localStorage.removeItem('spotify_access_token')
    localStorage.removeItem('spotify_refresh_token')
    localStorage.removeItem('spotify_user_id')
  }
}

export const spotifyAPI = new SpotifyAPI()