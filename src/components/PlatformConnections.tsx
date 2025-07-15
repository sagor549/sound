import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

const usePlatformConnections = () => {
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  
  const connectPlatform = async (platformName: string) => {
    // This will handle OAuth flow for each platform
    try {
      switch (platformName) {
        case 'Spotify':
          // Spotify OAuth integration
          break;
        case 'Apple Music':
          // Apple Music API integration
          break;
        case 'YouTube':
          // YouTube Data API integration
          break;
        case 'TikTok':
          // TikTok API integration
          break;
        case 'SoundCloud':
          // SoundCloud API integration
          break;
        case 'Instagram':
          // Instagram Basic Display API integration
          break;
      }
      
      setConnectedPlatforms(prev => [...prev, platformName]);
    } catch (error) {
      console.error(`Failed to connect ${platformName}:`, error);
    }
  };

  const disconnectPlatform = (platformName: string) => {
    setConnectedPlatforms(prev => prev.filter(p => p !== platformName));
  };

  return {
    connectedPlatforms,
    connectPlatform,
    disconnectPlatform
  };
};

export const PlatformConnections = () => {
  const { connectedPlatforms, connectPlatform } = usePlatformConnections();
  const { toast } = useToast();

  const handleConnect = async (platformName: string) => {
    try {
      await connectPlatform(platformName);
      toast({
        title: "Platform Connected",
        description: `Successfully connected to ${platformName}`,
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: `Failed to connect to ${platformName}. Please try again.`,
        variant: "destructive",
      });
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
            const isConnected = connectedPlatforms.includes(platform.name);
            
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
                      <span className="text-sm font-medium">Connected</span>
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

        <div className="text-center mt-8">
          <Button variant="hero" size="lg" asChild>
            <a href="/analytics">View Analytics Dashboard</a>
          </Button>
        </div>
      </div>
    </section>
  );
};