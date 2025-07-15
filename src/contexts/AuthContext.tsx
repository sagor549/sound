import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, auth, db } from '@/lib/supabase'
import { spotifyAPI } from '@/lib/spotify'

interface AuthContextType {
  user: User | null
  session: Session | null
  userProfile: any | null
  loading: boolean
  signUp: (email: string, password: string, userData?: any) => Promise<{ data: any; error: any }>
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>
  signInWithGoogle: () => Promise<{ data: any; error: any }>
  signInWithSpotify: () => Promise<{ data: any; error: any }>
  signOut: () => Promise<{ error: any }>
  isSpotifyConnected: boolean
  connectSpotify: () => void
  disconnectSpotify: () => void
  syncSpotifyData: () => Promise<void>
  refreshUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userProfile, setUserProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false)

  const refreshUserProfile = async () => {
    if (!user) return
    
    const { data: profile } = await db.getUserProfile(user.id)
    setUserProfile(profile)
    setIsSpotifyConnected(profile?.spotify_connected || false)
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { session } = await auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await refreshUserProfile()
        // Initialize Spotify API if connected
        await spotifyAPI.initializeFromSession()
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Create or update user profile for OAuth users
          if (event === 'SIGNED_IN') {
            const provider = session.user.app_metadata?.provider
            
            // Check if profile exists
            const { data: existingProfile } = await db.getUserProfile(session.user.id)
            
            if (!existingProfile) {
              // Create new profile for OAuth users
              await db.updateUserProfile(session.user.id, {
                id: session.user.id,
                email: session.user.email!,
                full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
                avatar_url: session.user.user_metadata?.avatar_url,
                spotify_connected: provider === 'spotify',
                google_connected: provider === 'google',
                spotify_id: provider === 'spotify' ? session.user.user_metadata?.provider_id : null
              })
            } else if (provider === 'spotify' && !existingProfile.spotify_connected) {
              // Update existing profile with Spotify connection
              await db.updateUserProfile(session.user.id, {
                spotify_connected: true,
                spotify_id: session.user.user_metadata?.provider_id
              })
            } else if (provider === 'google' && !existingProfile.google_connected) {
              // Update existing profile with Google connection
              await db.updateUserProfile(session.user.id, {
                google_connected: true
              })
            }
          }
          
          await refreshUserProfile()
          await spotifyAPI.initializeFromSession()
        } else {
          setUserProfile(null)
          setIsSpotifyConnected(false)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [user])

  const connectSpotify = () => {
    const scopes = [
      'user-read-email',
      'user-read-private',
      'user-top-read',
      'user-read-playback-state',
      'user-read-currently-playing',
      'playlist-read-private',
      'playlist-read-collaborative',
      'user-library-read',
      'user-read-recently-played',
      'streaming',
      'user-follow-read'
    ].join(' ')

    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
      response_type: 'code',
      redirect_uri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
      scope: scopes,
      state: Math.random().toString(36).substring(7)
    })

    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`
  }

  const disconnectSpotify = async () => {
    await spotifyAPI.disconnect()
    setIsSpotifyConnected(false)
    await refreshUserProfile()
  }

  const syncSpotifyData = async () => {
    if (!isSpotifyConnected) {
      throw new Error('Spotify not connected')
    }
    
    try {
      await spotifyAPI.syncAllAnalytics()
    } catch (error) {
      console.error('Error syncing Spotify data:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    session,
    userProfile,
    loading,
    signUp: auth.signUp,
    signIn: auth.signIn,
    signInWithGoogle: auth.signInWithGoogle,
    signInWithSpotify: auth.signInWithSpotify,
    signOut: auth.signOut,
    isSpotifyConnected,
    connectSpotify,
    disconnectSpotify,
    syncSpotifyData,
    refreshUserProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}