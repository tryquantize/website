import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Search, Sparkles, Building2, Package, User, Brain, Loader2, Undo, Globe } from "lucide-react";
import { LocationSelector } from "@/components/location-selector";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { enhancePrompt } from "@/lib/promptEnhancer";
import { useToast } from "@/hooks/use-toast";
import { createSearchSession } from "@/lib/search-session";

interface SearchInterfaceProps {
  onSearchResults?: (results: any) => void;
}



export function SearchInterface({ onSearchResults }: SearchInterfaceProps) {
  const [query, setQuery] = useState("");
  const [flickerWord, setFlickerWord] = useState("Startup");
  const [showMobileSuggestions, setShowMobileSuggestions] = useState(false);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [placeholder, setPlaceholder] = useState("");
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [selectedModel, setSelectedModel] = useState("GPT-4o Mini");
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const { toast } = useToast();

  const llmModels = [
    "Claude 3.5 Haiku",
    "GPT-4o Mini",
    "Gemini 2.5 Flash",
    "Qwen2.5 Coder 32B Instruct",
    "Meta Llama 3.2 3B Instruct",
    "Qwen2.5 72B Instruct",
    "Meta Llama 3.1 405B Instruct",
    "Mistral Nemo",
    "Google Gemma 2 9B",
    "Mistral 7B Instruct"
  ];

  const handlePromptEnhancement = async () => {
    if (!query.trim() || isEnhancing) return;

    setIsEnhancing(true);

    try {
      const originalQuery = query;
      const enhancedQuery = await enhancePrompt(query, {
        role: user?.jobTitle,
        industry: user?.industry,
        companySize: user?.company?.size
      });

      setQueryHistory(prev => [...prev, originalQuery]);
      setCurrentHistoryIndex(queryHistory.length);
      setQuery(enhancedQuery);

      toast({
        title: "Prompt enhanced!",
        description: "Your search query has been made more detailed and specific.",
      });

    } catch (error) {
      console.error('Prompt enhancement failed:', error);
      toast({
        title: "Enhancement failed",
        description: "Please try again or refine your query manually.",
        variant: "destructive"
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleUndo = () => {
    if (currentHistoryIndex < 0 || queryHistory.length === 0) return;

    const previousQuery = queryHistory[currentHistoryIndex];
    if (previousQuery) {
      setQuery(previousQuery);
      setCurrentHistoryIndex(prev => prev - 1);
      toast({
        title: "Prompt reverted",
        description: "Restored to original query.",
      });
    }
  };

  const flickerWords = ["Startup", "Solution", "Product", "Service", "Company"];

  const placeholderPhrases = [
    "Ask anything...",
    "Look for the right product",
    "What are you looking for?",
    "Connect with the right startup",
    "Hire the perfect freelancer",
    "Partner with the right company"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setFlickerWord(prev => {
        const currentIndex = flickerWords.indexOf(prev);
        const nextIndex = (currentIndex + 1) % flickerWords.length;
        return flickerWords[nextIndex];
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let currentText = "";
    let isDeleting = false;
    let charIndex = 0;

    const typeWriter = () => {
      const currentPhrase = placeholderPhrases[currentPhraseIndex];

      if (!isDeleting && charIndex < currentPhrase.length) {
        currentText += currentPhrase.charAt(charIndex);
        setPlaceholder(currentText);
        charIndex++;
        timeout = setTimeout(typeWriter, 100);
      } else if (isDeleting && charIndex > 0) {
        currentText = currentPhrase.substring(0, charIndex - 1);
        setPlaceholder(currentText);
        charIndex--;
        timeout = setTimeout(typeWriter, 50);
      } else if (!isDeleting && charIndex === currentPhrase.length) {
        timeout = setTimeout(() => {
          isDeleting = true;
          typeWriter();
        }, 2000);
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        setCurrentPhraseIndex((prev) => (prev + 1) % placeholderPhrases.length);
        timeout = setTimeout(typeWriter, 500);
      }
    };

    typeWriter();
    return () => clearTimeout(timeout);
  }, [currentPhraseIndex]);



  const searchMutation = useMutation({
    mutationFn: async (searchQuery: string) => {
      const response = await apiRequest("POST", "/api/search", {
        query: searchQuery,
        userId: user?.id,
        selectedModel,
        selectedTypes: Array.from(selectedTypes),
        selectedLocations,
        webSearchEnabled
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

    if (!user) {
      localStorage.setItem('pending-search-query', query.trim());
      setLocation('/auth');
      return;
    }

    // Create secure search session and get random ID
    const searchId = createSearchSession({
      query: query.trim(),
      types: Array.from(selectedTypes),
      locations: selectedLocations,
      webSearch: webSearchEnabled,
      model: selectedModel
    });

    // Navigate to search page with opaque ID (no query in URL)
    setLocation(`/search/${searchId}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const isMetaKey = e.metaKey || e.ctrlKey;

    if (isMetaKey && e.key === 'e') {
      e.preventDefault();
      handlePromptEnhancement();
      return;
    }

    if (isMetaKey && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      handleUndo();
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      if (!user) {
        if (query.trim()) {
          localStorage.setItem('pending-search-query', query.trim());
          setLocation('/auth');
        }
        return;
      }

      handleSearch();
    }
  };



  const handleSuggestionTileClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  const quickSuggestions = [
    "AI Voice agents for fintech",
    "AI Interviewer for recruitment",
    "Content creation tools for marketing",
    "Customer service automation",
    "AI-powered lead generation for B2B sales",
    "Voice-based AI receptionist for local businesses",
    "Automated video editing for short-form content",
  ];


  const [visibleCount, setVisibleCount] = useState(quickSuggestions.length);

  const extraSuggestions = [
    "AI agent builder",
    "Autonomous workflow automation",
    "Generative video studio",
    "Voice AI assistant",
    "AI-powered search engine",
    "Code generation copilot",
    "AI data analysis",
    "Personalized learning tutor",
    "AI document summarizer",
    "AI-driven CRM assistant",
    "Real-time speech translator",
    "Agentic research assistant",
    "Smart knowledge retrieval",
    "Multimodal creative generator",
    "AI email responder",
    "Voice-to-action agent",
    "Context-aware chat system",
    "AI sales outreach",
    "AI-powered design tool",
    "Autonomous scheduling agent",
    "AI business intelligence",
    "Code review assistant",
    "Reasoning engine platform",
    "AI data labeling",
    "Conversational analytics agent",
    "AI-driven marketing suite",
    "Autonomous lead qualifier",
    "AI website generator",
    "AI workflow orchestrator",
    "Agent-powered HR assistant",
    "AI productivity dashboard",
    "Real-time transcription agent",
    "AI-powered customer support",
    "Synthetic data generator",
    "AI-driven legal assistant",
    "Contextual recommendation engine",
    "Autonomous sales agent",
    "AI creative ideation tool",
    "Generative content engine",
    "Intelligent document parser",
    "LLM fine-tuning studio",
    "Voice-based CRM agent",
    "AI-powered operations hub",
    "Adaptive tutoring system",
    "Agentic data researcher",
    "Smart content optimizer",
    "AI recruitment assistant",
    "Knowledge graph generator",
    "AI business strategist",
    "Intelligent note summarizer",
    "Generative audio studio",
  ];

  const allSuggestions = [...quickSuggestions, ...extraSuggestions];
  const visibleSuggestions = allSuggestions.slice(0, visibleCount);
  const hasMoreSuggestions = visibleCount < allSuggestions.length;

  const handleShowMore = () => {
    setVisibleCount(prev => Math.min(prev + 5, allSuggestions.length));
  };

  const handleShowLess = () => {
    setVisibleCount(quickSuggestions.length);
  };



  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowModelDropdown(false);
    };

    if (showModelDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showModelDropdown]);

  // Handle scroll for mobile suggestions
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowMobileSuggestions(scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function toggleType(id: string) {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center px-4">
      <div className={`transition-all duration-1500 ease-out max-w-5xl w-full flex flex-col items-center justify-center ${isSearching ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}>
        {/* Centered hero - Mobile optimized */}
        <div className={`text-center transition-all duration-1000 ease-out px-4 sm:px-6 ${'mb-0 opacity-100 scale-100 translate-y-0'
          }`}>
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight text-center" style={{ fontFamily: 'Instrument Serif, serif' }}>
            <span className="text-white block">
              Ask, Discover.
            </span>
            <span className="text-white block mt-1 sm:mt-2">
              Find the right&nbsp;
              <span className="flicker-text text-white inline-block w-[5ch] xs:w-[6ch] sm:w-[7ch] md:w-[8ch] text-left align-baseline">
                {flickerWord}
              </span>
            </span>
          </h1>
          <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl italic text-white mb-3 sm:mb-4 md:mb-6 max-w-2xl mx-auto leading-relaxed text-center px-2" style={{ fontFamily: 'Instrument Serif, serif' }}>
            Where your questions meet the world's smartest solutions.
          </p>
        </div>

        {/* Glassmorphism Search Bar - Mobile optimized */}
        <div className={`transition-all duration-1500 ease-out ${isSearching
          ? 'opacity-0 scale-90 pointer-events-none'
          : 'w-full max-w-4xl mx-auto mb-4 sm:mb-6 md:mb-8 px-3 sm:px-4 transform translate-y-0 opacity-100 scale-100'
          }`}>
          <div className={`relative rounded-[16px] sm:rounded-[20px] md:rounded-[24px] lg:rounded-[28px] border border-white/15 bg-white/5 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.45)] overflow-visible transition-all duration-1500 ease-out h-[88px] xs:h-[94px] sm:h-[90px] md:h-[100px] lg:h-[110px] ${isSearching ? 'transform scale-95' : 'transform scale-100'
            }`}>
            {/* Search input area - mobile optimized */}
            <div className="relative px-3 xs:px-4 sm:px-6 flex items-center h-[53px] xs:h-[55px] sm:h-[55px] md:h-[60px]">

              {queryHistory.length > 0 && currentHistoryIndex >= 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        aria-label="Undo prompt enhancement"
                        onClick={handleUndo}
                        className="absolute right-[80px] xs:right-[88px] sm:right-24 top-1/2 -translate-y-1/2 flex h-7 w-7 xs:h-8 xs:w-8 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white/5 border border-white/20 text-white/70 hover:bg-white/10 hover:text-white transition touch-manipulation"
                      >
                        <Undo className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-3.5 sm:w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Undo enhancement (Ctrl+Z)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}


              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      aria-label="Enhance search prompt"
                      onClick={handlePromptEnhancement}
                      disabled={!query.trim() || isEnhancing || searchMutation.isPending}
                      className="absolute right-[44px] xs:right-[48px] sm:right-16 top-1/2 -translate-y-1/2 flex h-7 w-7 xs:h-8 xs:w-8 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white/5 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                    >
                      {isEnhancing ? (
                        <Loader2 className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-3.5 sm:w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-3.5 sm:w-3.5" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Enhance your prompt (Ctrl+E)</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Make your search more detailed and specific
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>


              <button
                aria-label="Search"
                onClick={handleSearch}
                disabled={!query.trim() || searchMutation.isPending || isEnhancing}
                className="absolute right-2 xs:right-3 sm:right-4 top-1/2 -translate-y-1/2 flex h-8 w-8 xs:h-9 xs:w-9 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/5 border border-white/20 text-white/90 hover:bg-white/10 transition disabled:opacity-50 touch-manipulation"
                data-testid="search-button"
              >
                {searchMutation.isPending ? (
                  <div className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="h-4 w-4 xs:h-4.5 xs:w-4.5 sm:h-4 sm:w-4" />
                )}
              </button>


              <Input
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isEnhancing}
                className="h-10 xs:h-11 sm:h-12 md:h-14 w-full border-0 bg-transparent shadow-none text-sm xs:text-base sm:text-lg md:text-xl placeholder:text-white/70 text-white focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none pr-16 xs:pr-20 sm:pr-24 md:pr-28 flex items-center disabled:opacity-70"
                data-testid="search-input"
              />
            </div>


            <div className="relative border-t border-white/10 px-3 xs:px-4 sm:px-6 py-1 h-[33px] xs:h-[35px] sm:h-[34px] md:h-[36px]">
              <div className="flex items-center justify-between">

                <div className="relative flex items-center space-x-1.5 sm:space-x-2">
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowModelDropdown(!showModelDropdown);
                      }}
                      className={`flex h-6 w-6 xs:h-7 xs:w-7 sm:h-7 sm:w-7 items-center justify-center hover:text-white/80 transition-colors aspect-square touch-manipulation ${selectedModel && selectedModel !== "Claude 3.5 Haiku" ? 'text-yellow-400' : 'text-white'
                        }`}
                    >
                      <Brain className="h-5 w-5 xs:h-5.5 xs:w-5.5 sm:h-5.5 sm:w-5.5" />
                    </button>

                    {showModelDropdown && (
                      <>
                        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[10000]" onClick={() => setShowModelDropdown(false)} />
                        <div className="absolute bottom-8 left-0 z-[10001] bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg shadow-2xl min-w-[180px] xs:min-w-[200px] max-h-32 xs:max-h-36 overflow-y-auto">
                          {llmModels.map((model) => (
                            <button
                              key={model}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedModel(model);
                                setShowModelDropdown(false);
                              }}
                              className={`w-full px-2.5 xs:px-3 py-2 xs:py-2.5 text-left text-xs xs:text-sm hover:bg-white/10 transition-colors first:rounded-t-lg last:rounded-b-lg touch-manipulation ${selectedModel === model ? 'bg-blue-600/20 text-blue-300' : 'text-white/80'
                                }`}
                            >
                              {model}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <span className="text-xs text-white/70 hidden xs:inline sm:inline truncate max-w-[80px] xs:max-w-[100px] sm:max-w-[120px]">{selectedModel || "GPT-4o Mini"}</span>


                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                          className={`flex h-6 w-6 xs:h-7 xs:w-7 sm:h-7 sm:w-7 items-center justify-center transition-all duration-200 aspect-square touch-manipulation ${webSearchEnabled
                            ? 'text-emerald-400 hover:text-emerald-300'
                            : 'text-white/40 hover:text-white/70'
                            }`}
                        >
                          <Globe className="h-4 w-4 xs:h-4.5 xs:w-4.5 sm:h-4.5 sm:w-4.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Web Search {webSearchEnabled ? 'ON' : 'OFF'}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <LocationSelector
                    selectedLocations={selectedLocations}
                    onLocationChange={setSelectedLocations}
                  />

                  {selectedLocations.length > 0 && (
                    <div className="flex flex-wrap gap-1 ml-2">
                      {selectedLocations.map((location) => (
                        <div key={location} className="flex items-center bg-white/10 backdrop-blur-sm text-white font-bold px-1 py-0 rounded text-xs border border-white/20 h-[18px]">
                          <span className="truncate max-w-[60px]">{location.split(',')[0]}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const newLocations = selectedLocations.filter(l => l !== location);
                              setSelectedLocations(newLocations);
                            }}
                            className="ml-1 hover:text-red-300 transition-colors text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>


                <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2.5">
                  <TooltipProvider>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className={`h-6 w-6 xs:h-7 xs:w-7 sm:h-7 sm:w-7 flex items-center justify-center transition-all duration-200 aspect-square touch-manipulation ${selectedTypes.has('company')
                            ? 'text-amber-400 hover:text-amber-300'
                            : 'text-white/40 hover:text-white/70'
                            }`}
                          aria-label="Company"
                          onClick={() => toggleType('company')}
                        >
                          <Building2 className="h-5 w-5 xs:h-5.5 xs:w-5.5 sm:h-5.5 sm:w-5.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Company {selectedTypes.has('company') ? '(Active)' : '(Off)'}</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className={`h-6 w-6 xs:h-7 xs:w-7 sm:h-7 sm:w-7 flex items-center justify-center transition-all duration-200 aspect-square touch-manipulation ${selectedTypes.has('freelancer')
                            ? 'text-amber-400 hover:text-amber-300'
                            : 'text-white/40 hover:text-white/70'
                            }`}
                          aria-label="Freelancer"
                          onClick={() => toggleType('freelancer')}
                        >
                          <User className="h-5 w-5 xs:h-5.5 xs:w-5.5 sm:h-5.5 sm:w-5.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Freelancer {selectedTypes.has('freelancer') ? '(Active)' : '(Off)'}</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className={`h-6 w-6 xs:h-7 xs:w-7 sm:h-7 sm:w-7 flex items-center justify-center transition-all duration-200 aspect-square touch-manipulation ${selectedTypes.has('product')
                            ? 'text-amber-400 hover:text-amber-300'
                            : 'text-white/40 hover:text-white/70'
                            }`}
                          aria-label="Product"
                          onClick={() => toggleType('product')}
                        >
                          <Package className="h-5 w-5 xs:h-5.5 xs:w-5.5 sm:h-5.5 sm:w-5.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Product {selectedTypes.has('product') ? '(Active)' : '(Off)'}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </div>




          {isEnhancing && (
            <div className="absolute top-full left-0 right-0 mt-2 mx-2 xs:mx-0 p-2.5 xs:p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg backdrop-blur-sm">
              <div className="flex items-center gap-2 text-blue-300 text-xs xs:text-sm">
                <Loader2 className="w-3.5 h-3.5 xs:w-4 xs:h-4 animate-spin" />
                <span>Enhancing your search prompt...</span>
              </div>
            </div>
          )}
        </div>


        <div className={`${showMobileSuggestions ? 'flex md:flex' : 'hidden md:flex'} flex-wrap justify-center gap-1.5 xs:gap-2 mt-3 xs:mt-4 px-3 xs:px-4 transition-all duration-1000 ease-out ${'opacity-100 scale-100 translate-y-0'
          }`}>
          {visibleSuggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={() => handleSuggestionTileClick(suggestion)}
              className="text-xs xs:text-sm rounded-lg px-2.5 xs:px-3 py-2 border-white/30 bg-white/5 hover:border-white/60 hover:bg-white/10 backdrop-blur-sm min-h-[32px] xs:min-h-[36px] text-white touch-manipulation"
              data-testid={`suggestion-${index}`}
            >
              <Sparkles className="w-2.5 h-2.5 xs:w-3 xs:h-3 mr-1.5 xs:mr-2" />
              <span className="truncate max-w-[120px] xs:max-w-none">{suggestion}</span>
            </Button>
          ))}

        </div>


        {isSearching && (
          <div className="fixed inset-0 flex flex-col items-center justify-center z-30 animate-fade-in px-4">
            <div className="relative mb-6 xs:mb-8">
              <LoadingSpinner variant="orbit" size="lg" />
            </div>
            <div className="text-center max-w-sm xs:max-w-md">
              <p className="text-white text-lg xs:text-xl sm:text-2xl font-semibold mb-2 xs:mb-3 leading-tight">Searching for "{query}"...</p>
              <p className="text-white/70 text-sm xs:text-base sm:text-lg mb-4 xs:mb-6">Finding the best AI solutions for you</p>
              <div className="flex items-center justify-center space-x-2">
                <LoadingSpinner variant="dots" size="sm" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}