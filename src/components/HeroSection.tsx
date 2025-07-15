import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrendingUp, DollarSign, Users, Music } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

export const HeroSection = () => {
  return (
    <section className="relative py-20 px-4 overflow-hidden" style={{
      backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.9)), url(${heroBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-revenue rounded-full blur-3xl animate-pulse-glow delay-1000"></div>
      </div>

      <div className="container mx-auto text-center relative z-10">
        <div className="animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Your Music Career,
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Amplified by Data
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The all-in-one platform for independent artists to track performance, 
            optimize releases, understand fans, and maximize revenue across all platforms.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button variant="hero" size="lg" className="text-lg px-8 py-6">
              Start Free Trial
            </Button>
            <Button variant="platform" size="lg" className="text-lg px-8 py-6">
              View Demo
            </Button>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-in">
          <Card className="p-6 text-center group hover:scale-105">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/30 transition-colors">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Unified Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Track performance across Spotify, Apple Music, YouTube, and more
            </p>
          </Card>

          <Card className="p-6 text-center group hover:scale-105">
            <div className="w-12 h-12 bg-revenue/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-revenue/30 transition-colors">
              <DollarSign className="w-6 h-6 text-revenue" />
            </div>
            <h3 className="font-semibold mb-2">Revenue Intelligence</h3>
            <p className="text-sm text-muted-foreground">
              Understand earnings and optimize monetization strategies
            </p>
          </Card>

          <Card className="p-6 text-center group hover:scale-105">
            <div className="w-12 h-12 bg-growth/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-growth/30 transition-colors">
              <Users className="w-6 h-6 text-growth" />
            </div>
            <h3 className="font-semibold mb-2">Fan Insights</h3>
            <p className="text-sm text-muted-foreground">
              Discover your superfans and engage with your audience
            </p>
          </Card>

          <Card className="p-6 text-center group hover:scale-105">
            <div className="w-12 h-12 bg-spotify/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-spotify/30 transition-colors">
              <Music className="w-6 h-6 text-spotify" />
            </div>
            <h3 className="font-semibold mb-2">Release Strategy</h3>
            <p className="text-sm text-muted-foreground">
              Plan and optimize your releases for maximum impact
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};