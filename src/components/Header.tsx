import { Button } from "@/components/ui/button";
import { Music, User, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const Header = () => {
  const { user, userProfile, signOut, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

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
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userProfile?.avatar_url} alt={userProfile?.full_name || user.email} />
                    <AvatarFallback>
                      {userProfile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">
                    {userProfile?.full_name || 'User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                  {userProfile?.artist_name && (
                    <p className="text-xs leading-none text-muted-foreground">
                      Artist: {userProfile.artist_name}
                    </p>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => setShowAuthModal(true)} disabled={loading}>
              Sign In
            </Button>
          )}
        </div>
      </div>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </header>;
};