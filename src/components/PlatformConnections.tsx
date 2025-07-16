import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/authStore";

const platforms = [
  {
    name: "Spotify",
    icon: "🎵",
    color: "spotify",
    connected: false,
    clientId: null,
    apiKey: null
  },
  {
    name: "Apple Music",
    icon: "🍎",
    color: "apple-music",
    connected: false,
    clientId: null,
    apiKey: null
  },
  {
    name: "YouTube",
    icon: "📺",
    color: "youtube",
    connected: false,
    clientId: null,
    apiKey: null
  },
  {
    name: "TikTok",
    icon: "🎬",
    color: "tiktok",
    connected: false,
    clientId: null,
    apiKey: null
  },
  {
    name: "SoundCloud",
    icon: "☁️",
    color: "soundcloud",
    connected: false,
    clientId: null,
    apiKey: null
  },
  {
    name: "Instagram",
    icon: "📷",
    color: "instagram",
    connected: false,
    clientId: null,
    apiKey: null
  }
];

export const PlatformConnections = () => {
  const { isSpotifyConnected, connectSpotify, disconnectSpotify, syncSpotifyData, user } = useAuthStore();
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);

  const handleConnect = async (platformName: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to connect platforms",
        variant: "destructive"
      });
      return;
    }

    try {
      switch (platformName) {
        case 'Spotify':
          connectSpotify();
          break;
        case 'Apple Music':
          toast({
            title: "Coming Soon",
            description: "Apple Music integration is coming soon!",
          });
          break;
        case 'YouTube':
          toast({
            title: "Coming Soon",
            description: "YouTube integration is coming soon!",
          });
          break;
        case 'TikTok':
          toast({
            title: "Coming Soon",
            description: "TikTok integration is coming soon!",
          });
          break;
        case 'SoundCloud':
          toast({
            title: "Coming Soon",
            description: "SoundCloud integration is coming soon!",
          });
          break;
        case 'Instagram':
          toast({
            title: "Coming Soon",
            description: "Instagram integration is coming soon!",
          });
          break;
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: `Failed to connect to ${platformName}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async (platformName: string) => {
    try {
      switch (platformName) {
        case 'Spotify':
          await disconnectSpotify();
          toast({
            title: "Platform Disconnected",
            description: "Spotify has been disconnected",
          });
          break;
      }
    } catch (error) {
      toast({
        title: "Disconnection Failed",
        description: `Failed to disconnect ${platformName}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const getConnectionStatus = (platformName: string) => {
    switch (platformName) {
      case 'Spotify':
        return isSpotifyConnected;
      default:
        return false;
    }
  };

  const handleSyncData = async () => {
    if (!isSpotifyConnected) return;
    
    setSyncing(true);
    try {
      await syncSpotifyData();
      toast({
        title: "Data Synced",
        description: "Your Spotify data has been synced successfully",
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Connect Your Platforms</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Link all your music and social platforms to get comprehensive insights 
            in one unified dashboard. We support all major streaming services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((platform) => {
            const isConnected = getConnectionStatus(platform.name);
            
            return (
              <Card key={platform.name} className="p-6 group hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{platform.icon}</div>
                    <div>
                      <h3 className="font-semibold">{platform.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {isConnected ? "Ready to sync data" : "Not connected"}
                      </p>
                    </div>
                  </div>
                  
                  {isConnected ? (
                    <div className="flex items-center gap-2 text-growth">
                      <CheckCircle className="w-5 h-5" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Connected</span>
                        {platform.name === 'Spotify' && (
                          <div className="flex gap-1 mt-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={handleSyncData}
                              disabled={syncing}
                              className="text-xs h-6 px-2"
                            >
                              {syncing ? 'Syncing...' : 'Sync Data'}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDisconnect(platform.name)}
                              className="text-xs h-6 px-2 text-destructive hover:text-destructive"
                            >
                              Disconnect
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <Button 
                      variant="platform" 
                      size="sm"
                      onClick={() => handleConnect(platform.name)}
                    >
                      <Plus className="w-4 h-4" />
                      Connect
                    </Button>
                  )}
                </div>

                {isConnected && (
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-${platform.color}`}
                      style={{ width: '75%' }}
                    ></div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {isSpotifyConnected && (
          <div className="text-center mt-8 p-4 bg-secondary/20 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              🎉 Spotify is connected! Your analytics data is being synced automatically.
            </p>
            <p className="text-xs text-muted-foreground">
              Data syncs every hour, or you can manually sync using the button above.
            </p>
          </div>
        )}

        <div className="text-center mt-8">
          <Button variant="hero" size="lg" asChild>
            <a href="/analytics">View Analytics Dashboard</a>
          </Button>
        </div>
      </div>
    </section>
  );
};