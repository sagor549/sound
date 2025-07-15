import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, Play, Heart, Share2, Download, Music } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";

export const MetricsDashboard = () => {
  // This will be connected to real analytics data
  const { getTotalMetrics, loading } = useAnalytics([], '30d');

  return (
    <section className="py-16 px-4 bg-secondary/20">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Your Performance Overview</h2>
          <p className="text-muted-foreground">
            Connect your platforms to see real-time insights from all your streaming services
          </p>
        </div>

        {/* Placeholder for when no platforms are connected */}
        <Card className="p-8 text-center">
          <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
          <p className="text-muted-foreground mb-6">
            Connect your streaming platforms to start seeing detailed analytics and insights about your music performance.
          </p>
          <Button variant="hero">
            Connect Your Platforms
          </Button>
        </Card>
      </div>
    </section>
  );
};