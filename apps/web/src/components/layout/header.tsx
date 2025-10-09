/* File Overview
  Path: client/src/components/layout/header.tsx
  Purpose: Layout UI components (shared page structure like header and footer).

  Reading tip for newcomers:
  - Scan the exports at the bottom to see what the rest of the app imports from here
  - Follow the data flow via function parameters and return values
*/

import { Link, useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useAuth } from "@/lib/auth";
import { useNavigation } from "@/hooks/use-navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { Search, Heart, Menu, X, MoveRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { QuantizeLogo } from "@/components/quantize-logo";

import { motion, useScroll, useMotionValueEvent } from "framer-motion";

export function Header() {
  const navigationItems = [
    {
      title: "Home",
      href: "/",
      description: "",
    },
    {
      title: "Product",
      description: "Discover AI-powered search capabilities and features.",
      items: [
        {
          title: "Search",
          href: "/home",
        },
        {
          title: "Pricing",
          href: "/pricing",
        },
      ],
    },
    {
      title: "Company",
      description: "Learn more about Quantize and our mission.",
      items: [
        {
          title: "About us",
          href: "/about",
        },
        {
          title: "Contact us",
          href: "/contact",
        },
      ],
    },
  ];

  const { user, isAuthenticated, logout } = useAuth();
  const { currentUser, signOut: firebaseSignOut } = useFirebaseAuth();
  const { navigateWithLoading } = useNavigation();
  
  const handleFirebaseLogout = async () => {
    try {
      await firebaseSignOut();
      logout(); // Clear Zustand auth state
      setLocation('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
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



  // Don't render header on welcome transition page
  if (isWelcomeTransitionPage) {
    return null;
  }

  return (
    <>
      <motion.header
        className={`${isWaitlistPage ? 'fixed' : 'sticky'} top-0 z-50 border-b w-full`}
        variants={navVariants}
        animate={isScrolled ? 'scrolled' : 'top'}
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        {isResultsPage ? (
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-18">
            <motion.div
              className="flex items-center space-x-2 flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Link href="/home" className="flex items-center space-x-2" data-testid="logo-link">
                <QuantizeLogo size={24} />
                <h1 className="text-base font-bold bg-gradient-to-r from-purple-400 via-violet-500 to-indigo-600 bg-clip-text text-transparent whitespace-nowrap">
                  Quantize
                </h1>
              </Link>
            </motion.div>

            <div className="flex items-center space-x-4 ml-auto">
              <span className="text-white/80">Welcome, {currentUser?.displayName?.split(' ')[0] || currentUser?.email?.split('@')[0] || 'User'}</span>
              {currentUser && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setLocation('/favorites')}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Favorites
                </Button>
              )}
              <Button 
                size="sm" 
                onClick={async () => {
                  try {
                    await firebaseSignOut();
                    logout();
                    setLocation('/');
                  } catch (error) {
                    console.error('Logout failed:', error);
                  }
                }}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Logout
              </Button>


            </div>
          </div>
        ) : (
          <div className="container relative mx-auto min-h-16 sm:min-h-20 flex items-center justify-between">
            {/* Desktop Navigation */}
            <div className="justify-start items-center gap-4 lg:flex hidden flex-row">
              <NavigationMenu className="flex justify-start items-start">
                <NavigationMenuList className="flex justify-start gap-4 flex-row">
                  {navigationItems.map((item) => (
                    <NavigationMenuItem key={item.title}>
                      {item.href ? (
                        <>
                          <NavigationMenuLink asChild>
                            <Link href={item.href}>
                              <Button variant="ghost" className="text-white/70 hover:text-white">
                                {item.title}
                              </Button>
                            </Link>
                          </NavigationMenuLink>
                        </>
                      ) : (
                        <>
                          <NavigationMenuTrigger className="font-medium text-sm text-white/70 hover:text-white bg-transparent">
                            {item.title}
                          </NavigationMenuTrigger>
                          <NavigationMenuContent className="!w-[450px] p-4 bg-black/90 backdrop-blur-md border border-white/10">
                            <div className="flex flex-col lg:grid grid-cols-2 gap-4">
                              <div className="flex flex-col h-full justify-between">
                                <div className="flex flex-col">
                                  <p className="text-base text-white">{item.title}</p>
                                  <p className="text-white/60 text-sm">
                                    {item.description}
                                  </p>
                                </div>
                                <Button size="sm" className="mt-10 bg-white text-black hover:bg-gray-100" onClick={() => setLocation('/waitlist')}>
                                  Join the Waitlist
                                </Button>
                              </div>
                              <div className="flex flex-col text-sm h-full justify-end">
                                {item.items?.map((subItem) => (
                                  <NavigationMenuLink
                                    asChild
                                    key={subItem.title}
                                  >
                                    <Link
                                      href={subItem.href}
                                      className="flex flex-row justify-between items-center hover:bg-white/10 py-2 px-4 rounded text-white/70 hover:text-white"
                                    >
                                      <span>{subItem.title}</span>
                                      <MoveRight className="w-4 h-4 text-white/40" />
                                    </Link>
                                  </NavigationMenuLink>
                                ))}
                              </div>
                            </div>
                          </NavigationMenuContent>
                        </>
                      )}
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
            
            {/* Logo - Center on desktop, left on mobile */}
            <div className="flex lg:justify-center lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2">
              <Link href="/home" className="flex items-center space-x-2" data-testid="logo-link">
                <QuantizeLogo size={20} className="sm:w-6 sm:h-6" />
                <h1 className="font-semibold text-base sm:text-lg bg-gradient-to-r from-purple-400 via-violet-500 to-indigo-600 bg-clip-text text-transparent">
                  Quantize
                </h1>
              </Link>
            </div>
            
            {/* Desktop Auth Buttons */}
            <div className="hidden lg:flex justify-end gap-4">
              {currentUser || (isAuthenticated && user) ? (
                <>
                  <Button 
                    variant="outline" 
                    className="border-white/20 text-white/70 hover:text-white hover:bg-white/10"
                    onClick={() => setLocation('/favorites')}
                  >
                    Favorites
                  </Button>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleFirebaseLogout}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    className="border-white/20 text-white/70 hover:text-white hover:bg-white/10"
                    onClick={() => navigateWithLoading('/auth')}
                  >
                    Sign in
                  </Button>
                  <Button 
                    className="bg-white text-black hover:bg-gray-100"
                    onClick={() => navigateWithLoading('/waitlist')}
                  >
                    Join the Waitlist
                  </Button>
                </>
              )}
            </div>
            
            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Button variant="ghost" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-1.5 sm:p-2">
                {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </Button>
              
              {/* Mobile Dropdown Menu */}
              {isMobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-md border-t border-white/10 shadow-lg z-50">
                  <div className="container mx-auto py-4 space-y-1 px-4">
                    {navigationItems.map((item) => (
                      <div key={item.title}>
                        {item.href ? (
                          <Link
                            href={item.href}
                            className="block px-4 py-3 text-white hover:bg-white/10 transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {item.title}
                          </Link>
                        ) : (
                          <>
                            <div className="px-4 py-2 text-white/60 text-sm font-medium">{item.title}</div>
                            {item.items?.map((subItem) => (
                              <Link
                                key={subItem.title}
                                href={subItem.href}
                                className="block px-6 py-2 text-white/80 hover:bg-white/10 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {subItem.title}
                              </Link>
                            ))}
                          </>
                        )}
                      </div>
                    ))}
                    
                    <div className="border-t border-white/10 mt-4 pt-4 space-y-1">
                      {currentUser || (isAuthenticated && user) ? (
                        <>
                          <button 
                            className="block w-full text-left px-4 py-3 text-white hover:bg-white/10 transition-colors"
                            onClick={() => {
                              setLocation('/favorites');
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            Favorites
                          </button>
                          <button 
                            className="block w-full text-left px-4 py-3 text-white hover:bg-white/10 transition-colors"
                            onClick={() => {
                              handleFirebaseLogout();
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            Logout
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            className="block w-full text-left px-4 py-3 text-white hover:bg-white/10 transition-colors"
                            onClick={() => {
                              navigateWithLoading('/auth');
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            Sign in
                          </button>
                          <button 
                            className="block w-full text-left px-4 py-3 bg-white text-black hover:bg-gray-100 transition-colors rounded"
                            onClick={() => {
                              navigateWithLoading('/waitlist');
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            Join the Waitlist
                          </button>
                        </>
                      )}
                    </div>
                  </div>
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