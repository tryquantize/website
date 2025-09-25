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
import { lazy, Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Lazy load page components
const NotFound = lazy(() => import("@/pages/not-found"));
const Home = lazy(() => import("@/pages/home"));
const ProductsPage = lazy(() => import("@/pages/Products"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Admin = lazy(() => import("@/pages/admin"));
const Register = lazy(() => import("@/pages/auth/register"));
const ListPage = lazy(() => import("@/pages/list-new"));
const ResultsPage = lazy(() => import("@/pages/results"));
const WaitlistPage = lazy(() => import("@/pages/waitlist"));
const WaitlistAdminPage = lazy(() => import("@/pages/waitlist-admin"));
const OnboardingPage = lazy(() => import("@/pages/onboarding"));
const LoggedInHome = lazy(() => import("@/pages/loggedinhome"));
const WelcomeTransition = lazy(() => import("@/pages/welcome-transition"));
const SearchTransition = lazy(() => import("@/pages/search-transition"));
const FavoritesPage = lazy(() => import("@/pages/favorites"));

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
            <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><LoadingSpinner /></div>}>
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
                <Route component={NotFound} />
              </Switch>
            </Suspense>
          </main>
          {location !== '/results' && location !== '/loggedinhome' && location !== '/welcome-transition' && location !== '/search-transition' && <Footer showJoinUs={location === '/'} />}
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
