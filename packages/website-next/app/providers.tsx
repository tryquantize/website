"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { BackgroundParticles } from "@/components/background-particles";
import { LoadingProvider } from "@/contexts/loading-context";
import { FirebaseAuthProvider } from "@/contexts/firebase-auth-context";
import { FavoritesProvider } from "@/contexts/favorites-context";
import { ConversationProvider } from "@/contexts/conversation-context";
import { queryClient } from "@/lib/queryClient";

export function Providers({ children }: { children: React.ReactNode }) {
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
                  {children}
                </TooltipProvider>
              </LoadingProvider>
            </ConversationProvider>
          </FavoritesProvider>
        </FirebaseAuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
