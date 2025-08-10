import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Search, Lightbulb, Sparkles } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";

interface SearchInterfaceProps {
  onSearchResults?: (results: any) => void;
}

export function SearchInterface({ onSearchResults }: SearchInterfaceProps) {
  const [query, setQuery] = useState("");
  const { user } = useAuth();

  const searchMutation = useMutation({
    mutationFn: async (searchQuery: string) => {
      const response = await apiRequest("POST", "/api/search", {
        query: searchQuery,
        userId: user?.id
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (onSearchResults) {
        onSearchResults(data);
      }
      setQuery("");
    }
  });

  const handleSearch = () => {
    if (!query.trim()) return;
    searchMutation.mutate(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const quickSuggestions = [
    "Content creation tools for marketing",
    "Customer support automation",
    "Data analysis and visualization",
    "Marketing automation platforms"
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Perplexity-style centered hero */}
      <div className="text-center mb-16 pt-16">
        <div className="w-16 h-16 mx-auto mb-8 bg-primary/10 rounded-2xl flex items-center justify-center">
          <Bot className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent leading-tight">
          Where AI meets
          <br />
          your ambition
        </h1>
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
          Discover AI tools that transform your business. Ask anything about AI solutions.
        </p>
      </div>

      {/* Perplexity-style Search Input */}
      <div className="max-w-3xl mx-auto mb-12">
        <div className="relative">
          <div className="flex items-center bg-card border border-border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden">
            <div className="flex-1">
              <Textarea
                placeholder="Ask anything..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="border-0 bg-transparent resize-none focus:ring-0 text-lg p-6 min-h-[80px] placeholder:text-muted-foreground/60"
                data-testid="search-input"
              />
            </div>
            <div className="flex items-center space-x-2 pr-4">
              <Button
                onClick={handleSearch}
                disabled={!query.trim() || searchMutation.isPending}
                size="sm"
                className="rounded-xl px-4 py-2"
                data-testid="search-button"
              >
                {searchMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          
          {/* Input hint */}
          <div className="flex items-center justify-center mt-4 text-sm text-muted-foreground">
            <span>Try: "AI content creation tools for social media" or "Customer service automation"</span>
          </div>
        </div>
      </div>

      {/* Quick Suggestions */}
      <div className="flex flex-wrap justify-center gap-3">
        {quickSuggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => setQuery(suggestion)}
            className="text-sm rounded-full px-4 py-2 border-border/50 hover:border-border hover:bg-accent/50 transition-all duration-200"
            data-testid={`suggestion-${index}`}
          >
            <Sparkles className="w-3 h-3 mr-2" />
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
}