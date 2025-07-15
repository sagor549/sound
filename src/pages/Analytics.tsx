import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/Header";
import { 
  Play, 
  DollarSign, 
  Heart, 
  Share2, 
  TrendingUp, 
  TrendingDown,
  MapPin,
  Calendar,
  Music,
  Users,
  Download,
  Eye
} from "lucide-react";

export const Analytics = () => {
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedPlatform, setSelectedPlatform] = useState("all");

  const platforms = [
    { value: "all", label: "All Platforms" },
    { value: "spotify", label: "Spotify" },
    { value: "apple-music", label: "Apple Music" },
    { value: "soundcloud", label: "SoundCloud" },
    { value: "youtube-music", label: "YouTube Music" }
  ];

  // This will be populated from API data
  const overviewMetrics = [
    {
      title: "Total Streams",
      value: "0",
      change: "+0%",
      trend: "up",
      icon: Play,
      color: "primary"
    },
    {
      title: "Total Revenue",
      value: "$0.00",
      change: "+0%",
      trend: "up",
      icon: DollarSign,
      color: "revenue"
    },
    {
      title: "Total Followers",
      value: "0",
      change: "+0%",
      trend: "up",
      icon: Heart,
      color: "growth"
    },
    {
      title: "Playlist Adds",
      value: "0",
      change: "+0%",
      trend: "up",
      icon: Share2,
      color: "spotify"
    }
  ];

  const songAnalytics = [
    // Will be populated from API
  ];

  const monthlyEarnings = [
    // Will be populated from API
  ];

  const geoData = [
    // Will be populated from API
  ];

  const platformBreakdown = [
    // Will be populated from API
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights across all your connected platforms
          </p>
        </div>

        {/* Time Range and Platform Selectors */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex gap-2">
            {["7d", "30d", "90d", "1y", "all"].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range === "7d" && "7 Days"}
                {range === "30d" && "30 Days"}
                {range === "90d" && "90 Days"}
                {range === "1y" && "1 Year"}
                {range === "all" && "All Time"}
              </Button>
            ))}
          </div>
          
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              {platforms.map((platform) => (
                <SelectItem key={platform.value} value={platform.value}>
                  {platform.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="songs">Songs</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="audience">Audience</TabsTrigger>
            <TabsTrigger value="platforms">Platforms</TabsTrigger>
            <TabsTrigger value="growth">Growth</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {overviewMetrics.map((metric) => {
                const Icon = metric.icon;
                const TrendIcon = metric.trend === "up" ? TrendingUp : TrendingDown;
                const trendColor = metric.trend === "up" ? "text-growth" : "text-decline";
                
                return (
                  <Card key={metric.title} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 bg-${metric.color}/20 rounded-lg flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 text-${metric.color}`} />
                      </div>
                      <div className={`flex items-center gap-1 ${trendColor}`}>
                        <TrendIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">{metric.change}</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{metric.value}</h3>
                    <p className="text-sm text-muted-foreground">{metric.title}</p>
                  </Card>
                );
              })}
            </div>

            {/* Quick Insights */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Quick Insights</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <span>Connect platforms to see analytics</span>
                  <Badge variant="outline">Setup Required</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <span>Most popular listening time</span>
                  <Badge variant="outline">No Data</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <span>Top performing track</span>
                  <Badge variant="outline">No Data</Badge>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="songs" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Song Performance</h3>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-3 bg-secondary/20 rounded-lg text-sm font-medium">
                  <div>Song Title</div>
                  <div>Total Streams</div>
                  <div>Playlist Adds</div>
                  <div>Revenue</div>
                </div>
                
                <div className="text-center py-12 text-muted-foreground">
                  <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Connect your streaming platforms to see song analytics</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Monthly Earnings</h3>
                <div className="text-center py-12 text-muted-foreground">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Connect platforms to track revenue</p>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Platform Breakdown</h3>
                <div className="text-center py-12 text-muted-foreground">
                  <Share2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Revenue by platform will appear here</p>
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Revenue per Song</h3>
              <div className="text-center py-12 text-muted-foreground">
                <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Individual song earnings will be displayed here</p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="audience" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Geographic Distribution</h3>
                <div className="text-center py-12 text-muted-foreground">
                  <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Listener locations will appear here</p>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Demographics</h3>
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Age and gender breakdown available after connecting platforms</p>
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Top Cities</h3>
              <div className="text-center py-12 text-muted-foreground">
                <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Your most active listener cities will be shown here</p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="platforms" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Platform Performance</h3>
              <div className="text-center py-12 text-muted-foreground">
                <Share2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Comparative performance across platforms will be displayed here</p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="growth" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Follower Growth</h3>
                <div className="text-center py-12 text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Follower growth trends will be shown here</p>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Stream Growth</h3>
                <div className="text-center py-12 text-muted-foreground">
                  <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Streaming trends over time will appear here</p>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};