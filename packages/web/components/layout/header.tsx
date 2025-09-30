import Link from "next/link";
/* File Overview
  Path: client/src/components/layout/header.tsx
  Purpose: Layout UI components (shared page structure like header and footer).

  Reading tip for newcomers:
  - Scan the exports at the bottom to see what the rest of the app imports from here
  - Follow the data flow via function parameters and return values
*/

import { useLocation, useRoute } from "@/hooks/use-location";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/lib/auth";
import { useNavigation } from "@/hooks/use-navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { Moon, Sun, Search, Heart, Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { QuantizeLogo } from "@/components/shared/branding";
import { AnimatedButton } from "@/components/ui/animated-button";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";

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
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  // Handle navbar background change on scroll
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const navVariants = {
    top: {
      backgroundColor: isWaitlistPage || isWelcomeTransitionPage ? 'rgba(0, 0, 0, 0)' : 'rgba(0, 0, 0, 0.3)',
      backdropFilter: isWaitlistPage || isWelcomeTransitionPage ? 'blur(0px)' : 'blur(10px)',
      borderColor: 'rgba(255, 255, 255, 0)'
    },
    scrolled: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(20px)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
    }
  };

  const linkVariants = {
    rest: { scale: 1, opacity: 0.7 },
    hover: { 
      scale: 1.05, 
      opacity: 1,
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.95 }
  };

  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
    },
    open: {
      opacity: 1,
      height: 'auto',
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
    }
  };

  // Don't render header on welcome transition page or waitlist page
  if (isWelcomeTransitionPage || isWaitlistPage) {
    return null;
  }

  return (
    <>
      <motion.header
        className="sticky top-0 z-50 border-b"
        variants={navVariants}
        animate={isScrolled ? 'scrolled' : 'top'}
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isResultsPage ? (
          <div className="flex items-center justify-between h-16">
            <motion.div
              className="flex items-center space-x-2 flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Link href="/" className="flex items-center space-x-2" data-testid="logo-link">
                <QuantizeLogo size={24} />
                <h1 className="text-base font-bold bg-gradient-to-r from-purple-400 via-violet-500 to-indigo-600 bg-clip-text text-transparent whitespace-nowrap">
                  Quantize
                </h1>
              </Link>
            </motion.div>

            <div className="flex items-center space-x-4 ml-auto">
              <span className="text-white/80">Welcome, {currentUser?.displayName?.split(' ')[0] || currentUser?.email?.split('@')[0] || 'User'}</span>
              {currentUser && (
                <AnimatedButton 
                  size="sm" 
                  variant="secondary"
                  onClick={() => setLocation('/favorites')}
                  icon={<Heart className="w-4 h-4" />}
                >
                  Favorites
                </AnimatedButton>
              )}
              <AnimatedButton 
                size="sm" 
                variant="primary"
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
              </AnimatedButton>

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
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Link href="/" className="flex items-center space-x-3" data-testid="logo-link">
                <QuantizeLogo size={32} />
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-violet-500 to-indigo-600 bg-clip-text text-transparent">
                  Quantize
                </h1>
              </Link>
            </motion.div>

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
                  <AnimatedButton 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => setLocation('/favorites')}
                    icon={<Heart className="w-4 h-4" />}
                  >
                    Favorites
                  </AnimatedButton>
                  <AnimatedButton 
                    variant="primary" 
                    size="sm" 
                    onClick={handleFirebaseLogout}
                  >
                    Logout
                  </AnimatedButton>
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
                  <AnimatedButton 
                    size="sm" 
                    variant="secondary"
                    onClick={() => navigateWithLoading('/auth')}
                  >
                    Get Started
                  </AnimatedButton>
                  <AnimatedButton 
                    size="sm" 
                    variant="gradient"
                    onClick={() => navigateWithLoading('/waitlist')}
                  >
                    Join the Waitlist
                  </AnimatedButton>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.header>
    </>
  );
}