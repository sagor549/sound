import { Button } from "@/components/ui/button";
import { Music, User, Settings, LogOut } from "lucide-react";
export const Header = () => {
  return <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Music className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">SoundCrate</h1>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground" asChild>
            <a href="/">Dashboard</a>
          </Button>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground" asChild>
            <a href="/analytics">Analytics</a>
          </Button>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            Releases
          </Button>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            Revenue
          </Button>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="w-4 h-4" />
          </Button>
          <Button variant="outline" className="hidden sm:flex">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>;
};