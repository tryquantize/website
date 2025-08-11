import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/lib/auth";
import { useNavigation } from "@/hooks/use-navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Moon, Sun, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const { navigateWithLoading } = useNavigation();
  const [location] = useLocation();
  const isResultsPage = location === '/results';
  const isWaitlistPage = location === '/waitlist';
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isResultsPage) {
      const params = new URLSearchParams(window.location.search);
      const query = params.get('q') || '';
      setSearchQuery(query);
    }
  }, [isResultsPage, location]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const headerClassName = cn(
    "sticky top-0 z-50",
    isWaitlistPage
      ? "bg-transparent backdrop-blur-0 border-b-0"
      : "bg-background/70 backdrop-blur-md border-b border-purple-500/30",
  );

  return (
    <header className={headerClassName}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isResultsPage ? (
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 flex-shrink-0" data-testid="logo-link">
              <div className="relative w-7 h-7">
                <div className="absolute inset-0 border-2 border-transparent border-t-purple-500 border-r-blue-500 rounded-full animate-spin" />
                <div className="absolute inset-1 border-2 border-transparent border-b-cyan-500 border-l-purple-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
              </div>
              <h1 className="text-base font-bold bg-gradient-to-r from-purple-400 via-blue-500 to-cyan-600 bg-clip-text text-transparent whitespace-nowrap">
                AI Discovery
              </h1>
            </Link>

            <div className="flex-1 max-w-4xl mx-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search AI tools..."
                  className="pl-14 pr-6 py-4 text-lg w-full bg-background/50 border-purple-400/40 text-white placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              <Select defaultValue="all">
                <SelectTrigger className="w-40 bg-background/50 border-purple-400/40 text-white text-sm">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="all">
                <SelectTrigger className="w-32 bg-background/50 border-purple-400/40 text-white text-sm">
                  <SelectValue placeholder="All Pricing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pricing</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                size="sm" 
                className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-600 text-white font-semibold hover:from-purple-600 hover:via-blue-600 hover:to-cyan-700 whitespace-nowrap"
                onClick={() => navigateWithLoading('/waitlist')}
              >
                Join Waitlist
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
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 border-2 border-transparent border-t-purple-500 border-r-blue-500 rounded-full animate-spin" />
                <div className="absolute inset-1 border-2 border-transparent border-b-cyan-500 border-l-purple-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-blue-500 to-cyan-600 bg-clip-text text-transparent">
                AI Discovery
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

              {isAuthenticated && user ? (
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium">
                    {user.name || user.email}
                  </span>
                  <Button variant="ghost" size="sm" onClick={logout}>
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-4 ml-auto">
                  <Button 
                    size="sm" 
                    className="bg-purple-500/20 border border-purple-400/40 text-white hover:bg-purple-500/30 hover:border-purple-400/60"
                    onClick={() => navigateWithLoading('/auth')}
                  >
                    Get Started
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-600 text-white font-semibold shadow-xl hover:from-purple-600 hover:via-blue-600 hover:to-cyan-700 transform hover:scale-105 transition-all duration-200 border-0 px-4 py-2"
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