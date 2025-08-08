import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Search, Lightbulb, User } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";

interface SearchInterfaceProps {
  onSearchResults?: (results: any) => void;
}

export function SearchInterface({ onSearchResults }: SearchInterfaceProps) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your AI tools discovery assistant. Describe what you're looking for and I'll help you find the perfect AI solutions for your business. Try being specific about your industry, use case, or requirements."
    }
  ]);
  
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
      // Add user message
      const userMessage = {
        id: Date.now().toString(),
        role: "user" as const,
        content: query
      };

      // Add assistant response
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant" as const,
        content: `Great! I found ${data.count} AI tools matching your needs. Here are the top recommendations:`,
        searchResults: data.results
      };

      setMessages(prev => [...prev, userMessage, assistantMessage]);
      
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
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Discover the Perfect AI Tools
          <br />
          for Your Business
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Find exactly what you need with our intelligent search. Describe your requirements in natural language and get personalized recommendations.
        </p>
      </div>

      {/* Chat Interface */}
      <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden mb-8">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-medium">AI Search Assistant</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Online</span>
          </div>
        </div>

        {/* Messages */}
        <div className="p-6 space-y-6 min-h-[400px] max-h-[600px] overflow-y-auto" data-testid="chat-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex space-x-4 ${
                message.role === "user" ? "justify-end" : ""
              }`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              
              <div className={`flex-1 ${message.role === "user" ? "max-w-lg" : ""}`}>
                <div
                  className={`rounded-xl p-4 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-muted"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Search Results Display */}
                  {message.searchResults && message.searchResults.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {message.searchResults.slice(0, 3).map((tool: any) => (
                        <div key={tool.id} className="bg-background rounded-lg p-3 border border-border">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-foreground">{tool.name}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {tool.oneLiner || tool.description?.substring(0, 100) + "..."}
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                {tool.pricingModel && (
                                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                                    {tool.pricingModel}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {message.searchResults.length > 3 && (
                        <p className="text-sm text-muted-foreground">
                          And {message.searchResults.length - 3} more tools found...
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {message.role === "assistant" ? "AI Assistant" : "You"} • Just now
                </p>
              </div>

              {message.role === "user" && (
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
          
          {searchMutation.isPending && (
            <div className="flex space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <div className="bg-muted rounded-xl p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    <span className="text-sm text-muted-foreground ml-2">Searching for AI tools...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <Textarea
                placeholder="Tell me what you're looking for... e.g., 'I need an AI tool to help with customer service chatbots for my e-commerce site'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[60px] resize-none"
                data-testid="search-input"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={!query.trim() || searchMutation.isPending}
              className="self-end h-[60px] px-6"
              data-testid="search-button"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Lightbulb className="w-3 h-3" />
              <span>Try: "AI writing assistant for marketing content"</span>
            </div>
            <span>Press Enter to send</span>
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
            className="text-sm"
            data-testid={`suggestion-${index}`}
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
}
