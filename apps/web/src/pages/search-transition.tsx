import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Component as AnimatedBackground } from "@/components/ui/raycast-animated-black-background";
import ResearchLogs from "@/components/ResearchLogs";
import { useResearchLogs } from "@/hooks/useResearchLogs";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { consumeSearchSession, storeSearchResults } from "@/lib/search-session";

export default function SearchTransition() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/search/:id");
  const { currentUser, loading: authLoading } = useFirebaseAuth();

  const [searchId, setSearchId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [apiComplete, setApiComplete] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const { logs, isStreaming, isComplete } = useResearchLogs({ query, selectedTypes, webSearchEnabled });

  // Initialize from secure session
  useEffect(() => {
    if (authLoading) return;

    // Check authentication
    if (!currentUser) {
      const id = params?.id;
      if (id) {
        sessionStorage.setItem('redirect-after-auth', `/search/${id}`);
      }
      setLocation('/auth');
      return;
    }

    // Get session ID from URL
    const id = params?.id;
    if (!id) {
      setSessionError("No search session specified");
      return;
    }

    setSearchId(id);

    // Consume the session (one-time use)
    const session = consumeSearchSession(id);
    if (!session) {
      setSessionError("Invalid or expired search session");
      return;
    }

    // Set up search parameters from secure session
    setQuery(session.query);
    setSelectedTypes(session.types);
    setWebSearchEnabled(session.webSearch);

    // Make API call
    apiRequest("POST", "/api/search", {
      query: session.query,
      context: {},
      selectedModel: session.model,
      selectedTypes: session.types,
      selectedLocations: session.locations,
      webSearchEnabled: session.webSearch,
      userId: currentUser.uid
    }).then(async (response) => {
      const data = await response.json();
      setSearchResults(data);
      // Store results securely
      storeSearchResults(id, data);
      setApiComplete(true);
    }).catch(() => {
      setApiComplete(true);
    });

  }, [authLoading, currentUser, params?.id, setLocation]);

  // Navigate to results when complete
  useEffect(() => {
    if (isComplete && apiComplete && searchResults && searchId) {
      setTimeout(() => {
        setLocation(`/results/${searchId}`);
      }, 1000);
    }
  }, [isComplete, apiComplete, searchResults, searchId, setLocation]);

  // Loading auth
  if (authLoading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-8">
        <div className="fixed inset-0 z-0">
          <AnimatedBackground />
        </div>
        <div className="text-center z-10">
          <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-4" />
          <p className="text-white/80">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Session error
  if (sessionError) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-8">
        <div className="fixed inset-0 z-0">
          <AnimatedBackground />
        </div>
        <div className="max-w-md w-full text-center z-10">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <ShieldAlert className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Invalid Access</h1>
            <p className="text-white/70 mb-6">
              {sessionError}. Please start a new search from the home page.
            </p>
            <Button
              onClick={() => setLocation('/home')}
              className="bg-white text-black hover:bg-white/90 font-medium"
            >
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Still loading session
  if (!query) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-8">
        <div className="fixed inset-0 z-0">
          <AnimatedBackground />
        </div>
        <div className="text-center z-10">
          <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-4" />
          <p className="text-white/80">Initializing search...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-8">
      <div className="fixed inset-0 z-0">
        <AnimatedBackground />
      </div>
      <div className="max-w-4xl w-full z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Deep Research in Progress</h1>
          <p className="text-lg text-white/80">
            Finding the best AI solutions for: <span className="text-white">"{query}"</span>
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <ResearchLogs logs={logs} isStreaming={isStreaming} />
        </div>

        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-2">
            {isStreaming ? (
              <>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-white/80 text-sm">Researching...</span>
              </>
            ) : isComplete ? (
              <>
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-white/80 text-sm">Research complete, preparing results...</span>
              </>
            ) : (
              <span className="text-white/60 text-sm">Initializing research...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}