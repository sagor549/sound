import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, Play, Heart, Share2, Download, Music, CheckCircle } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAuthStore } from "@/stores/authStore";

export const MetricsDashboard = () => {
  const { isSpotifyConnected, user } = useAuthStore();
  // This will be connected to real analytics data
  const { getTotalMetrics, loading, songAnalytics } = useAnalytics([], '30d');

  const metrics = getTotalMetrics();
  const hasData = songAnalytics.length > 0;

  return (
    <section className="py-16 px-4 bg-secondary/20">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Your Performance Overview</h2>
          <p className="text-muted-foreground">
            {isSpotifyConnected 
              ? "Real-time insights from your connected streaming services"
              : "Connect your platforms to see real-time insights from all your streaming services"
            }
          </p>
        </div>

        {isSpotifyConnected && hasData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Play className="w-5 h-5 text-primary" />
                </div>
                <div className="flex items-center gap-1 text-growth">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">+12%</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-1">{metrics.totalStreams.toLocaleString()}</h3>
              <p className="text-sm text-muted-foreground">Total Streams</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-revenue/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-revenue" />
                </div>
                <div className="flex items-center gap-1 text-growth">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">+8%</span>
                </div>
              </div>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-growth/20 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-growth" />
                </div>
                <div className="flex items-center gap-1 text-growth">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">+15%</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-1">{metrics.totalFollowers.toLocaleString()}</h3>
              <p className="text-sm text-muted-foreground">Total Followers</p>
            </Card>
              <h3 className="text-2xl font-bold mb-1">${metrics.totalRevenue.toFixed(2)}</h3>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-spotify/20 rounded-lg flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-spotify" />
                </div>
                <div className="flex items-center gap-1 text-growth">
                  <TrendingUp className="w-4 w-4" />
                  <span className="text-sm font-medium">+22%</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-1">{metrics.totalPlaylistAdds.toLocaleString()}</h3>
              <p className="text-sm text-muted-foreground">Playlist Adds</p>
            </Card>
          </div>
        ) : null}
              <p className="text-sm text-muted-foreground">Total Revenue</p>
        {/* Quick Insights */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Quick Insights</h3>
          <div className="space-y-3">
            {isSpotifyConnected ? (
              <>
                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-growth" />
                    <span>Spotify Connected</span>
                  </div>
                  <span className="text-sm text-growth font-medium">Active</span>
                </div>
                {hasData ? (
                  <>
                    <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <span>Most popular listening time</span>
                      <span className="text-sm font-medium">Evening (6-9 PM)</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <span>Top performing track</span>
                      <span className="text-sm font-medium">{songAnalytics[0]?.title || 'Loading...'}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <span>Syncing your data...</span>
                    <span className="text-sm text-muted-foreground">Please wait</span>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <span>Connect platforms to see analytics</span>
                  <span className="text-sm text-muted-foreground">Setup Required</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <span>Most popular listening time</span>
                  <span className="text-sm text-muted-foreground">No Data</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <span>Top performing track</span>
                  <span className="text-sm text-muted-foreground">No Data</span>
                </div>
              </>
            )}
          </div>
        </Card>
            </Card>
        {!isSpotifyConnected && (
          <div className="text-center mt-8">
            <Card className="p-8">
              <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Connect Your Platforms</h3>
              <p className="text-muted-foreground mb-6">
                Connect your streaming platforms to start seeing detailed analytics and insights about your music performance.
              </p>
              <Button variant="hero" asChild>
                <a href="#platforms">Connect Spotify</a>
              </Button>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
};