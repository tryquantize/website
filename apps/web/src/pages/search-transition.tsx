import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Component as AnimatedBackground } from "@/components/ui/raycast-animated-black-background";
import ResearchLogs from "@/components/ResearchLogs";
import { useResearchLogs } from "@/hooks/useResearchLogs";

export default function SearchTransition() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [apiComplete, setApiComplete] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  
  const { logs, isStreaming, isComplete } = useResearchLogs({ query, selectedTypes });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchQuery = params.get('q') || '';
    const types = params.get('types');
    const locations = params.get('locations');
    const currentSelectedTypes = types ? types.split(',').filter(t => t.trim()) : [];
    const currentSelectedLocations = locations ? locations.split(',').filter(l => l.trim()) : [];
    
    setQuery(searchQuery);
    setSelectedTypes(currentSelectedTypes);
    setSelectedLocations(currentSelectedLocations);

    if (searchQuery) {
      // Start the search API call
      apiRequest("POST", "/api/search", {
        query: searchQuery,
        context: {},
        selectedModel: "GPT-4o Mini",
        selectedTypes: currentSelectedTypes,
        selectedLocations: currentSelectedLocations
      }).then(async (response) => {
        const data = await response.json();
        setSearchResults(data);
        setApiComplete(true);
      }).catch(() => {
        setApiComplete(true);
      });
    }
  }, []);

  useEffect(() => {
    if (isComplete && apiComplete && searchResults) {
      // Store search results in sessionStorage to pass to results page
      sessionStorage.setItem('searchResults', JSON.stringify(searchResults));
      setTimeout(() => {
        setLocation(`/results${window.location.search}`);
      }, 1000);
    }
  }, [isComplete, apiComplete, searchResults, setLocation]);

  return (
    <div className="min-h-screen relative flex items-center justify-center p-8">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <AnimatedBackground />
      </div>
      <div className="max-w-4xl w-full">
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