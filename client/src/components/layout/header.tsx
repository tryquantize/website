// React and routing imports
import { Link, useLocation } from "wouter";                    // Client-side routing
import { useState, useEffect } from "react";                   // React hooks for state management

// UI component imports
import { Button } from "@/components/ui/button";               // Reusable button component
import { Input } from "@/components/ui/input";                 // Form input component
import { Avatar, AvatarFallback } from "@/components/ui/avatar"; // User avatar components
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Dropdown components

// Icon imports from Lucide React
import { Moon, Sun, Search } from "lucide-react";              // Theme toggle and search icons

// Custom hooks and utilities
import { useTheme } from "@/components/theme-provider";        // Theme management hook
import { useAuth } from "@/lib/auth";                          // Authentication state hook
import { useNavigation } from "@/hooks/use-navigation";        // Navigation with loading transitions

/**
 * HEADER COMPONENT
 * 
 * Dual-layout header component that adapts based on current page:
 * 1. Default Layout: Logo + theme toggle + auth buttons (for home page)
 * 2. Results Layout: Logo + large search bar + filters + theme toggle (for results page)
 * 
 * Features:
 * - Responsive design with cosmic theme colors
 * - Sticky positioning for persistent navigation
 * - Authentication state management
 * - Theme switching (light/dark mode)
 * - Search functionality with filters (results page only)
 * - Loading transitions for navigation
 */
export function Header() {
  // Theme management - controls light/dark mode
  const { theme, setTheme } = useTheme();
  
  // Authentication state - user info and login status
  const { user, isAuthenticated, logout } = useAuth();
  
  // Navigation with loading transitions
  const { navigateWithLoading } = useNavigation();
  
  // Current route detection
  const [location] = useLocation();
  const isResultsPage = location === '/results';              // Determines which layout to show
  
  // Search query state (only used on results page)
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * SEARCH QUERY SYNCHRONIZATION
   * 
   * On results page, synchronize the search input with URL parameters
   * This ensures the search bar shows the current query when navigating
   * back to results page or refreshing the page
   */
  useEffect(() => {
    if (isResultsPage) {
      // Extract search query from URL parameters
      const params = new URLSearchParams(window.location.search);
      const query = params.get('q') || '';                    // Get 'q' parameter or empty string
      setSearchQuery(query);                                  // Update local state
    }
  }, [isResultsPage, location]);                             // Re-run when page or location changes

  /**
   * THEME TOGGLE FUNCTION
   * 
   * Switches between light and dark modes
   * Updates the global theme state which triggers CSS changes
   */
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");           // Toggle between themes
  };

  return (
    /**
     * HEADER CONTAINER
     * 
     * Styling breakdown:
     * - sticky top-0: Stays at top when scrolling
     * - z-50: High z-index to stay above other content
     * - bg-background/70: Semi-transparent background for glassmorphism
     * - backdrop-blur-md: Blur effect for content behind header
     * - border-b border-purple-500/30: Subtle cosmic purple bottom border
     */
    <header className="sticky top-0 z-50 bg-background/70 backdrop-blur-md border-b border-purple-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isResultsPage ? (
          /**
           * RESULTS PAGE LAYOUT
           * 
           * Specialized layout for search results page:
           * - Logo on far left
           * - Large search bar in center (1.5x normal size)
           * - Filters and controls on far right
           * - Optimized for search-focused workflow
           */
          <div className="flex items-center justify-between h-16">
            {/* 
             * LOGO SECTION - EXTREME LEFT
             * Compact logo design for results page to maximize search bar space
             */
            <Link href="/" className="flex items-center space-x-2 flex-shrink-0" data-testid="logo-link">
              {/* 
               * ANIMATED COSMIC LOGO RINGS
               * Two concentric spinning rings representing cosmic motion
               * - Outer ring: Purple to blue gradient, normal rotation
               * - Inner ring: Cyan to purple gradient, reverse rotation
               * Creates mesmerizing cosmic effect
               */}
              <div className="relative w-7 h-7">
                {/* Outer spinning ring - cosmic energy */}
                <div className="absolute inset-0 border-2 border-transparent border-t-purple-500 border-r-blue-500 rounded-full animate-spin" />
                {/* Inner spinning ring - nebula core (reverse rotation) */}
                <div className="absolute inset-1 border-2 border-transparent border-b-cyan-500 border-l-purple-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
              </div>
              {/* 
               * BRAND TEXT
               * Cosmic gradient text with space-themed colors
               * Compact size for results page layout
               */}
              <h1 className="text-base font-bold bg-gradient-to-r from-purple-400 via-blue-500 to-cyan-600 bg-clip-text text-transparent whitespace-nowrap">
                AI Discovery
              </h1>
            </Link>

            {/* 
             * LARGE SEARCH BAR - CENTER SECTION
             * 1.5x larger than normal for prominent search functionality
             * Takes up maximum available space between logo and controls
             */}
            <div className="flex-1 max-w-4xl mx-8">
              <div className="relative">
                {/* Search icon positioned inside input field */}
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                {/* 
                 * MAIN SEARCH INPUT
                 * Large, prominent search field with cosmic styling:
                 * - pl-14: Left padding for search icon
                 * - py-4: Large vertical padding for 1.5x size
                 * - text-lg: Larger text for better visibility
                 * - bg-background/50: Semi-transparent cosmic background
                 * - border-purple-400/40: Subtle cosmic purple border
                 */}
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search AI tools..."
                  className="pl-14 pr-6 py-4 text-lg w-full bg-background/50 border-purple-400/40 text-white placeholder-gray-400"
                />
              </div>
            </div>

            {/* 
             * FILTERS AND CONTROLS - EXTREME RIGHT
             * Compact control panel for search refinement and user actions
             * Fixed width to prevent layout shifts
             */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              {/* 
               * CATEGORY FILTER DROPDOWN
               * Allows users to filter search results by category
               * Cosmic styling matches the overall space theme
               */}
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

              {/* 
               * PRICING FILTER DROPDOWN
               * Allows users to filter by pricing model (free/paid)
               * Narrower width than category filter to save space
               */}
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

              {/* 
               * JOIN WAITLIST CTA BUTTON
               * Primary call-to-action with cosmic gradient
               * Maintains visibility even on results page for conversion
               */}
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-600 text-white font-semibold hover:from-purple-600 hover:via-blue-600 hover:to-cyan-700 whitespace-nowrap"
                onClick={() => navigateWithLoading('/waitlist')}
              >
                Join Waitlist
              </Button>

              {/* 
               * THEME TOGGLE BUTTON
               * Animated sun/moon icon that switches based on current theme
               * Smooth rotation and scale transitions for polished UX
               */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="w-8 h-8 px-0 flex-shrink-0"
              >
                {/* Sun icon - visible in light mode, hidden in dark mode */}
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                {/* Moon icon - hidden in light mode, visible in dark mode */}
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </div>
          </div>
        ) : (
          /**
           * DEFAULT HEADER LAYOUT
           * 
           * Standard layout for all pages except results:
           * - Larger logo on left
           * - Authentication controls on right
           * - Clean, minimal design focused on branding
           */
          <div className="flex justify-between items-center h-16">
            {/* 
             * MAIN LOGO SECTION
             * Larger, more prominent logo for non-search pages
             */
            <Link href="/" className="flex items-center space-x-3" data-testid="logo-link">
              {/* 
               * LARGE ANIMATED COSMIC LOGO
               * Bigger version of the spinning rings for main pages
               * More space allows for larger, more impressive animation
               */}
              <div className="relative w-10 h-10">
                {/* Outer cosmic ring - larger for main logo */}
                <div className="absolute inset-0 border-2 border-transparent border-t-purple-500 border-r-blue-500 rounded-full animate-spin" />
                {/* Inner nebula ring - counter-rotating for hypnotic effect */}
                <div className="absolute inset-1 border-2 border-transparent border-b-cyan-500 border-l-purple-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
              </div>
              {/* 
               * MAIN BRAND TEXT
               * Larger text size for primary branding
               * Full cosmic gradient for maximum visual impact
               */}
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-blue-500 to-cyan-600 bg-clip-text text-transparent">
                AI Discovery
              </h1>
            </Link>

            {/* 
             * RIGHT SIDE ACTIONS
             * Authentication and theme controls
             * Adapts based on user login status
             */}
            <div className="flex items-center space-x-4">
              {/* 
               * THEME TOGGLE (DEFAULT LAYOUT)
               * Same functionality as results page but with different sizing
               */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="w-9 px-0"
              >
                {/* Animated sun/moon icons with smooth transitions */}
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>

              {/* 
               * CONDITIONAL AUTHENTICATION UI
               * Shows different content based on user login status
               */}
              {isAuthenticated && user ? (
                /* 
                 * AUTHENTICATED USER UI
                 * Shows user avatar, name, and logout option
                 */
                <div className="flex items-center space-x-2">
                  {/* User avatar with initials fallback */}
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {/* Show first letter of name or email as avatar */}
                      {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {/* User name/email - hidden on small screens */}
                  <span className="hidden sm:block text-sm font-medium">
                    {user.name || user.email}
                  </span>
                  {/* Logout button */}
                  <Button variant="ghost" size="sm" onClick={logout}>
                    Logout
                  </Button>
                </div>
              ) : (
                /* 
                 * UNAUTHENTICATED USER UI
                 * Shows login and signup call-to-action buttons
                 */
                <div className="flex items-center space-x-4 ml-auto">
                  {/* 
                   * GET STARTED BUTTON
                   * Secondary CTA with subtle cosmic styling
                   * Leads to authentication page
                   */}
                  <Button 
                    size="sm" 
                    className="bg-purple-500/20 border border-purple-400/40 text-white hover:bg-purple-500/30 hover:border-purple-400/60"
                    onClick={() => navigateWithLoading('/auth')}
                  >
                    Get Started
                  </Button>
                  {/* 
                   * PRIMARY CTA BUTTON
                   * Main call-to-action with full cosmic gradient
                   * Includes hover animations for engagement
                   */}
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

        {/* 
         * MOBILE NAVIGATION
         * Currently removed for simplicity
         * Could be added here for responsive mobile menu
         */}
      </div>
    </header>
  );
}
