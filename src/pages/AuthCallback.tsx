import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { spotifyAPI } from '@/lib/spotify'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

export const AuthCallback = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { refreshUserProfile } = useAuthStore()
  const { toast } = useToast()

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const error = searchParams.get('error')
      const state = searchParams.get('state')

      if (error) {
        toast({
          title: "Authentication Error",
          description: error === 'access_denied' ? 'Access was denied' : 'Authentication failed',
          variant: "destructive"
        })
        navigate('/')
        return
      }

      if (code) {
        try {
          // Handle Spotify OAuth callback
          const success = await spotifyAPI.exchangeCodeForToken(code)
          
          if (success) {
            await refreshUserProfile()
            
            toast({
              title: "Spotify Connected!",
              description: "Your Spotify account has been successfully connected"
            })
            
            // Sync initial data
            try {
              await spotifyAPI.syncAllAnalytics()
              toast({
                title: "Data Synced",
                description: "Your Spotify data has been synced successfully"
              })
            } catch (syncError) {
              console.error('Error syncing data:', syncError)
              toast({
                title: "Sync Warning",
                description: "Connected successfully, but initial data sync failed. You can try again later.",
                variant: "destructive"
              })
            }
          } else {
            toast({
              title: "Connection Failed",
              description: "Failed to connect your Spotify account",
              variant: "destructive"
            })
          }
        } catch (error) {
          console.error('Callback error:', error)
          toast({
            title: "Connection Error",
            description: "An error occurred while connecting your account",
            variant: "destructive"
          })
        }
      }

      navigate('/analytics')
    }

    handleCallback()
  }, [searchParams, navigate, refreshUserProfile, toast])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Connecting your account...</h2>
        <p className="text-muted-foreground">Please wait while we set up your connection</p>
      </div>
    </div>
  )
}