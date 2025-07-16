import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, Session } from '@supabase/supabase-js'
import { supabase, auth, db } from '@/lib/supabase'
import { spotifyAPI } from '@/lib/spotify'

interface UserProfile {
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

interface AuthState {
  user: User | null
  session: Session | null
  userProfile: UserProfile | null
  loading: boolean
  isSpotifyConnected: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setUserProfile: (profile: UserProfile | null) => void
  setLoading: (loading: boolean) => void
  setSpotifyConnected: (connected: boolean) => void
  
  // Auth methods
  signUp: (email: string, password: string, userData?: any) => Promise<{ data: any; error: any }>
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>
  signInWithGoogle: () => Promise<{ data: any; error: any }>
  signInWithSpotify: () => Promise<{ data: any; error: any }>
  signOut: () => Promise<{ error: any }>
  
  // Profile methods
  refreshUserProfile: () => Promise<void>
  connectSpotify: () => void
  disconnectSpotify: () => Promise<void>
  syncSpotifyData: () => Promise<void>
  
  // Initialize
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      userProfile: null,
      loading: true,
      isSpotifyConnected: false,

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setUserProfile: (userProfile) => {
        set({ 
          userProfile,
          isSpotifyConnected: userProfile?.spotify_connected || false
        })
      },
      setLoading: (loading) => set({ loading }),
      setSpotifyConnected: (isSpotifyConnected) => set({ isSpotifyConnected }),

      signUp: async (email: string, password: string, userData?: any) => {
        const { data, error } = await auth.signUp(email, password, userData)
        return { data, error }
      },

      signIn: async (email: string, password: string) => {
        const { data, error } = await auth.signIn(email, password)
        if (data.user && !error) {
          set({ user: data.user, session: data.session })
          await get().refreshUserProfile()
        }
        return { data, error }
      },

      signInWithGoogle: async () => {
        const { data, error } = await auth.signInWithGoogle()
        return { data, error }
      },

      signInWithSpotify: async () => {
        const { data, error } = await auth.signInWithSpotify()
        return { data, error }
      },

      signOut: async () => {
        const { error } = await auth.signOut()
        if (!error) {
          set({
            user: null,
            session: null,
            userProfile: null,
            isSpotifyConnected: false
          })
        }
        return { error }
      },

      refreshUserProfile: async () => {
        const { user } = get()
        if (!user) return
        
        try {
          const { data: profile } = await db.getUserProfile(user.id)
          if (profile) {
            set({ 
              userProfile: profile,
              isSpotifyConnected: profile.spotify_connected || false
            })
            
            // Initialize Spotify API if connected
            if (profile.spotify_connected) {
              await spotifyAPI.initializeFromSession()
            }
          }
        } catch (error) {
          console.error('Error refreshing user profile:', error)
        }
      },

      connectSpotify: () => {
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
      },

      disconnectSpotify: async () => {
        await spotifyAPI.disconnect()
        set({ isSpotifyConnected: false })
        await get().refreshUserProfile()
      },

      syncSpotifyData: async () => {
        const { isSpotifyConnected } = get()
        if (!isSpotifyConnected) {
          throw new Error('Spotify not connected')
        }
        
        try {
          await spotifyAPI.syncAllAnalytics()
        } catch (error) {
          console.error('Error syncing Spotify data:', error)
          throw error
        }
      },

      initialize: async () => {
        set({ loading: true })
        
        try {
          // Get initial session
          const { session } = await auth.getSession()
          
          if (session?.user) {
            set({ 
              user: session.user, 
              session: session 
            })
            await get().refreshUserProfile()
          }
          
          // Listen for auth changes
          supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.email)
            
            set({ 
              session: session,
              user: session?.user ?? null 
            })
            
            if (session?.user) {
              // Handle OAuth sign-ins
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
              
              await get().refreshUserProfile()
            } else {
              set({ 
                userProfile: null,
                isSpotifyConnected: false 
              })
            }
          })
          
        } catch (error) {
          console.error('Error initializing auth:', error)
        } finally {
          set({ loading: false })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        userProfile: state.userProfile,
        isSpotifyConnected: state.isSpotifyConnected
      })
    }
  )
)