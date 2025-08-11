import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { LoadingProvider, useLoading } from "@/contexts/loading-context";
import { LoadingTransition } from "@/components/loading-transition";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Admin from "@/pages/admin";
import Register from "@/pages/auth/register";
import ListPage from "@/pages/list-new";
import ResultsPage from "@/pages/results";
import WaitlistPage from "@/pages/waitlist";

function Router() {
  const { isLoading, fromPage, toPage } = useLoading();
  const [location] = useLocation();
  
  return (
    <>
      <LoadingTransition isLoading={isLoading} fromPage={fromPage} toPage={toPage} />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-12 md:pt-24">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/admin" component={Admin} />
            <Route path="/auth" component={Register} />
            <Route path="/auth/register" component={Register} />
            <Route path="/waitlist" component={WaitlistPage} />
            <Route path="/list" component={ListPage} />
            <Route path="/results" component={ResultsPage} />
            <Route component={NotFound} />
          </Switch>
        </main>
        <Footer showJoinUs={location === '/'} />
      </div>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="ai-discovery-theme">
        <LoadingProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LoadingProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
