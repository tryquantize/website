/* File Overview
  Path: client/src/components/layout/header.tsx
  Purpose: Layout UI components (shared page structure like header and footer).

  Reading tip for newcomers:
  - Scan the exports at the bottom to see what the rest of the app imports from here
  - Follow the data flow via function parameters and return values
*/

import { Link, useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/lib/auth";
import { useNavigation } from "@/hooks/use-navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { Moon, Sun, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { QuantizeLogo } from "@/components/quantize-logo";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const { currentUser, signOut: firebaseSignOut } = useFirebaseAuth();
  const { navigateWithLoading } = useNavigation();
  
  const handleFirebaseLogout = async () => {
    await firebaseSignOut();
    setLocation('/');
  };
  const [location, setLocation] = useLocation();
  const isResultsPage = location === '/results';
  const isWaitlistPage = location === '/waitlist';
  const isWelcomeTransitionPage = location === '/welcome-transition';
  const [searchQuery, setSearchQuery] = useState('');

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const headerClassName = cn(
    "sticky top-0 z-50",
    isWaitlistPage || isWelcomeTransitionPage
      ? "bg-transparent backdrop-blur-0 border-b-0"
      : "bg-background/70 backdrop-blur-md border-b border-white/20",
  );

  // Don't render header on welcome transition page or waitlist page
  if (isWelcomeTransitionPage || isWaitlistPage) {
    return null;
  }

  return (
    <header className={headerClassName}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isResultsPage ? (
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 flex-shrink-0" data-testid="logo-link">
              <QuantizeLogo size={24} />
      <h1 className="text-base font-bold bg-gradient-to-r from-purple-400 via-violet-500 to-indigo-600 bg-clip-text text-transparent whitespace-nowrap">
        Quantize
      </h1>
            </Link>

            <div className="flex items-center space-x-4 ml-auto">
              <span className="text-white/80">Welcome, {currentUser?.displayName?.split(' ')[0] || currentUser?.email?.split('@')[0] || 'User'}</span>
              <Button 
                size="sm" 
                variant="outline"
                className="bg-white text-black border-white hover:bg-white/90 hover:text-black whitespace-nowrap"
                onClick={async () => {
                  try {
                    await firebaseSignOut();
                    logout();
                    setLocation('/');
                  } catch (error) {
                    console.error('Logout failed:', error);
                  }
                }}
              >
                Logout
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="w-8 h-8 px-0 flex-shrink-0"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3" data-testid="logo-link">
              <QuantizeLogo size={32} />
      <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-violet-500 to-indigo-600 bg-clip-text text-transparent">
        Quantize
      </h1>
            </Link>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="w-9 px-0"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>

              {currentUser ? (
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {currentUser.displayName?.charAt(0).toUpperCase() || currentUser.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium">
                    {currentUser.displayName || currentUser.email}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleFirebaseLogout}
                    className="bg-white text-black border-white hover:bg-white/90 hover:text-black"
                  >
                    Logout
                  </Button>
                </div>
              ) : isAuthenticated && user ? (
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium">
                    {user.name || user.email}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => { logout(); setLocation('/'); }}>
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-4 ml-auto">
                  <Button 
                    size="sm" 
                    className="bg-white text-black border border-white hover:bg-white/90 hover:text-black"
                    onClick={() => navigateWithLoading('/auth')}
                  >
                    Get Started
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-[#4B0082] via-[#8A2BE2] to-[#9370DB] text-white font-semibold hover:from-[#8A2BE2] hover:via-[#9370DB] hover:to-[#8A2BE2] transform hover:scale-105 transition-all duration-200 border-0 px-4 py-2"
                    onClick={() => navigateWithLoading('/waitlist')}
                  >
                    Join the Waitlist
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}