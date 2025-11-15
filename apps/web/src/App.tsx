import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { LoadingProvider } from "@/contexts/loading-context";
import { LoadingTransition } from "@/components/loading-transition";
import { FirebaseAuthProvider, useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { FavoritesProvider } from "@/contexts/favorites-context";
import { ConversationProvider } from "@/contexts/conversation-context";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AnimatedLayout } from "@/components/layout/animated-layout";
import { Analytics } from "@vercel/analytics/react";
import { useEffect } from "react";

import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ProductsPage from "@/pages/Products";
import Dashboard from "@/pages/dashboard";
import Admin from "@/pages/admin";
import Register from "@/pages/auth/register";
import ResultsPage from "@/pages/results";

import OnboardingPage from "@/pages/onboarding";
import LoggedInHome from "@/pages/loggedinhome";
import WelcomeTransition from "@/pages/welcome-transition";
import SearchTransition from "@/pages/search-transition";
import FavoritesPage from "@/pages/favorites";
import LandingPage from "@/pages/landingpage";
import GlowingSearchDemoPage from "@/pages/glowing-search-demo";
import AboutPage from "@/pages/about";
import ContactPage from "@/pages/contact";
import { PricingPage } from "@/pages/pricing";
import AddCompanyPage from "@/pages/add-company";

function Router() {
  const [location] = useLocation();
  
  // Scroll to top on route change
  useEffect(() => {
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);
  
  return (
    <>
      <LoadingTransition />
      <AnimatedLayout>
        <div className="relative z-10 h-screen flex flex-col">
          {location !== '/dashboard' && location !== '/results' && <Header />}
          <main className={`flex-1 overflow-y-auto ${location !== '/dashboard' && location !== '/results' ? 'pt-12 md:pt-24' : ''}`}>
            <div className="min-h-full flex flex-col">
              <div className="flex-1">
                <Switch>
                  <Route path="/" component={LandingPage} />
                  <Route path="/home">
                    {() => {
                      const { currentUser } = useFirebaseAuth();
                      return currentUser ? <LoggedInHome /> : <Home />;
                    }}
                  </Route>
                  <Route path="/loggedinhome" component={LoggedInHome} />
                  <Route path="/welcome-transition" component={WelcomeTransition} />
                  <Route path="/products" component={ProductsPage} />
                  <Route path="/dashboard" component={Dashboard} />
                  <Route path="/admin" component={Admin} />
                  <Route path="/auth" component={Register} />
                  <Route path="/auth/register" component={Register} />

                  <Route path="/onboarding" component={OnboardingPage} />
                  <Route path="/search-transition" component={SearchTransition} />
                  <Route path="/results" component={ResultsPage} />
                  <Route path="/favorites" component={FavoritesPage} />
                  <Route path="/glowing-search-demo" component={GlowingSearchDemoPage} />
                  <Route path="/about" component={AboutPage} />
                  <Route path="/contact" component={ContactPage} />
                  <Route path="/pricing" component={PricingPage} />
                  <Route path="/add-company" component={AddCompanyPage} />
                  <Route component={NotFound} />
                </Switch>
              </div>
              {location !== '/results' && location !== '/loggedinhome' && location !== '/welcome-transition' && location !== '/search-transition' && location !== '/glowing-search-demo' && location !== '/home' && location !== '/dashboard' && <Footer />}
            </div>
          </main>
        </div>
      </AnimatedLayout>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="ai-discovery-theme">
        <FirebaseAuthProvider>
          <FavoritesProvider>
            <ConversationProvider>
              <LoadingProvider>
                <TooltipProvider>
                  <Toaster />

                  <Router />
                  <Analytics />
                </TooltipProvider>
              </LoadingProvider>
            </ConversationProvider>
          </FavoritesProvider>
        </FirebaseAuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
