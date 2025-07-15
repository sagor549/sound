import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { PlatformConnections } from "@/components/PlatformConnections";
import { MetricsDashboard } from "@/components/MetricsDashboard";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <PlatformConnections />
        <MetricsDashboard />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
