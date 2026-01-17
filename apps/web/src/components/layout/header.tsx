import { Link, useLocation } from "wouter";
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
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { Heart, Menu, X, MoveRight, PanelLeftOpen, Search, Sparkles, Globe, Shield, Zap, MessageSquare } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { QuantizeLogo } from "@/components/quantize-logo";
import { ProductHuntBadge } from "@/components/product-hunt-badge";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onToggleSidebar?: () => void;
  showSidebarToggle?: boolean;
}

export function Header({ onToggleSidebar, showSidebarToggle }: HeaderProps = {}) {
  // Memoize navigation items to prevent re-renders
  const navigationItems = useMemo(() => [
    {
      title: "Product",
      description: "Discover AI-powered search capabilities.",
      items: [
        {
          title: "Search Engine",
          href: "/home",
          description: "AI-powered semantic search",
          icon: Search
        },
        {
          title: "Pricing",
          href: "/pricing",
          description: "Plans for every team",
          icon: Zap
        },
      ],
    },
    {
      title: "Company",
      description: "Learn more about our mission.",
      items: [
        {
          title: "About",
          href: "/about",
          description: "Our story and vision",
          icon: Globe
        },
        {
          title: "Contact Us",
          href: "/contact",
          description: "Get in touch with us",
          icon: MessageSquare
        },
      ],
    },
  ], []);

  const { user, isAuthenticated, logout } = useAuth();
  const { currentUser, signOut: firebaseSignOut } = useFirebaseAuth();
  const { navigateWithLoading } = useNavigation();
  const [location, setLocation] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  const isResultsPage = location === '/results';

  const isWelcomeTransitionPage = location === '/welcome-transition';

  const handleFirebaseLogout = async () => {
    try {
      await firebaseSignOut();
      logout();
      setLocation('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 10);
  });

  // Don't render header on welcome transition page
  if (isWelcomeTransitionPage) {
    return null;
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b bg-black/50 backdrop-blur-md border-white/10 py-3"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="flex items-center justify-between">

          {/* Logo Section */}
          <div className="flex items-center gap-4">
            {showSidebarToggle && (
              <Button
                size="icon"
                variant="ghost"
                onClick={onToggleSidebar}
                className="md:hidden text-white/70 hover:text-white hover:bg-white/10"
              >
                <PanelLeftOpen className="h-5 w-5" />
              </Button>
            )}

            <Link href={isResultsPage ? "/home" : "/"} className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <QuantizeLogo size={32} className="relative z-10" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white group-hover:text-white/90 transition-colors">
                Quantize
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {!isResultsPage && (
            <div className="hidden lg:flex items-center justify-center flex-1 px-8">
              <NavigationMenu>
                <NavigationMenuList className="gap-2">
                  <NavigationMenuItem>
                    <Link href="/">
                      <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5 text-sm font-medium h-9 px-4 rounded-full transition-all">
                        Home
                      </Button>
                    </Link>
                  </NavigationMenuItem>

                  {navigationItems.map((item) => (
                    <NavigationMenuItem key={item.title}>
                      <NavigationMenuTrigger className="bg-transparent text-white/70 hover:text-white hover:bg-white/5 text-sm font-medium h-10 px-5 rounded-full transition-all data-[state=open]:bg-white/10 data-[state=open]:text-white">
                        {item.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="min-w-[400px] p-4">
                          <div className="grid gap-3">
                            {item.items.map((subItem) => (
                              <NavigationMenuLink key={subItem.title} asChild>
                                <Link
                                  href={subItem.href}
                                  className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/10 transition-colors group select-none"
                                  onClick={(e) => {
                                    if (subItem.href.includes('#')) {
                                      const [path, hash] = subItem.href.split('#');
                                      if (location === path || (path === '/' && location === '/home') || (path === '/home' && location === '/')) {
                                        e.preventDefault();
                                        const element = document.getElementById(hash);
                                        if (element) {
                                          element.scrollIntoView({ behavior: 'smooth' });
                                          window.history.pushState(null, '', subItem.href);
                                        }
                                      }
                                    }
                                  }}
                                >
                                  <div className="mt-1 p-2 rounded-lg bg-white/5 group-hover:bg-blue-500/20 text-white/70 group-hover:text-blue-400 transition-colors">
                                    <subItem.icon className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-white mb-1 group-hover:text-blue-400 transition-colors">
                                      {subItem.title}
                                    </div>
                                    <p className="text-xs text-white/50 leading-relaxed">
                                      {subItem.description}
                                    </p>
                                  </div>
                                </Link>
                              </NavigationMenuLink>
                            ))}
                          </div>
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Product Hunt Badge */}
            <div className="hidden lg:block">
              <ProductHuntBadge className="scale-75" />
            </div>
            
            {currentUser || (isAuthenticated && user) ? (
              <>
                <span className="hidden md:block text-sm text-white/60 mr-2">
                  {currentUser?.displayName?.split(' ')[0] || 'User'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                  onClick={() => setLocation('/favorites')}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Favorites
                </Button>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleFirebaseLogout}
                  className="bg-white text-black hover:bg-white/90 rounded-full px-5 font-medium transition-transform hover:scale-105 active:scale-95"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-[0_0_15px_-3px_rgba(255,255,255,0.2)]"
                  onClick={() => navigateWithLoading('/auth')}
                >
                  Sign in
                </Button>

              </>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white/70 hover:text-white hover:bg-white/10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-black/95 backdrop-blur-xl border-b border-white/10 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-6">
              <div className="space-y-4">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block text-lg font-medium text-white hover:text-blue-400 transition-colors">
                  Home
                </Link>
                {navigationItems.map((item) => (
                  <div key={item.title} className="space-y-3">
                    <div className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                      {item.title}
                    </div>
                    <div className="space-y-2 pl-4 border-l border-white/10">
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.title}
                          href={subItem.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 text-white/70 hover:text-white py-1 transition-colors"
                        >
                          <subItem.icon className="w-4 h-4" />
                          {subItem.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-white/10 space-y-3">
                {currentUser || (isAuthenticated && user) ? (
                  <>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-white/10 text-white hover:bg-white/5"
                      onClick={() => {
                        setLocation('/favorites');
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Favorites
                    </Button>
                    <Button
                      className="w-full bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-red-500/20"
                      onClick={() => {
                        handleFirebaseLogout();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="w-full border-white/10 text-white hover:bg-white/5 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-[0_0_15px_-3px_rgba(255,255,255,0.2)]"
                      onClick={() => {
                        navigateWithLoading('/auth');
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Sign in
                    </Button>

                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}