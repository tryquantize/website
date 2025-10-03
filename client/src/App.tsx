/* File Overview
  Path: client/src/App.tsx
  Purpose: Top-level React component that wires up app-wide providers (Query Client, Theme,
  Loading context, Tooltip) and defines the SPA routes using Wouter. Also renders shared
  layout elements like the Header and Footer.

  Reading tip for newcomers:
  - Start at <App /> and then follow <Router /> to see how routes map to page components
  - The Header and Footer render across all pages; the <main> area is where each route appears
*/

import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { BackgroundParticles } from "@/components/background-particles";
import { LoadingProvider, useLoading } from "@/contexts/loading-context";
import { LoadingTransition } from "@/components/loading-transition";
import { FirebaseAuthProvider, useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { FavoritesProvider } from "@/contexts/favorites-context";
import { ConversationProvider } from "@/contexts/conversation-context";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AnimatedLayout } from "@/components/layout/animated-layout";
import { Analytics } from "@vercel/analytics/react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ProductsPage from "@/pages/Products";
import Dashboard from "@/pages/dashboard";
import Admin from "@/pages/admin";
import Register from "@/pages/auth/register";
import ListPage from "@/pages/list-new";
import ResultsPage from "@/pages/results";
import WaitlistPage from "@/pages/waitlist";
import WaitlistAdminPage from "@/pages/waitlist-admin";
import OnboardingPage from "@/pages/onboarding";
import LoggedInHome from "@/pages/loggedinhome";
import WelcomeTransition from "@/pages/welcome-transition";
import SearchTransition from "@/pages/search-transition";
import FavoritesPage from "@/pages/favorites";
import SpiralDemoPage from "@/pages/spiral-demo";

function Router() {
  const { isLoading, fromPage, toPage } = useLoading();
  const [location] = useLocation();
  
  return (
    <>
      <LoadingTransition />
      <AnimatedLayout>
        <div className="relative z-10 min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 pt-12 md:pt-24">
            <Switch>
              <Route path="/">
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
              <Route path="/waitlist" component={WaitlistPage} />
              <Route path="/waitlist-admin" component={WaitlistAdminPage} />
              <Route path="/onboarding" component={OnboardingPage} />
              <Route path="/list" component={ListPage} />
              <Route path="/search-transition" component={SearchTransition} />
              <Route path="/results" component={ResultsPage} />
              <Route path="/favorites" component={FavoritesPage} />
              <Route path="/spiral-demo" component={SpiralDemoPage} />
              <Route component={NotFound} />
            </Switch>
          </main>
          {location !== '/results' && location !== '/loggedinhome' && location !== '/welcome-transition' && location !== '/search-transition' && location !== '/spiral-demo' && <Footer showJoinUs={location === '/'} />}
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
                  <BackgroundParticles />
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
