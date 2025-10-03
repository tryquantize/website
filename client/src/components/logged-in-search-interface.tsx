import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Brain, Sparkles, Building2, User, Package, Clock, Mic, MicOff, Loader2, Undo } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { enhancePrompt } from "@/lib/promptEnhancer";
import { useToast } from "@/hooks/use-toast";

interface LoggedInSearchInterfaceProps {
  onSearchResults?: (results: any) => void;
}

const searchSuggestions = [
  "AI-powered lead generation for B2B sales",
  "AI content creation tools for social media",
  "Customer service automation",
  "Automated video editing for short-form content",
  "AI email assistant for busy professionals",
  "Voice-based AI receptionist for local businesses",
  "Predictive analytics for e-commerce growth",
  "AI copywriting tool for ad agencies",
];

export function LoggedInSearchInterface({ onSearchResults }: LoggedInSearchInterfaceProps) {
  const [query, setQuery] = useState(() => {
    // Auto-fill with pending search query if exists
    const pendingQuery = localStorage.getItem('pending-search-query');
    if (pendingQuery) {
      localStorage.removeItem('pending-search-query'); // Clear after using
      return pendingQuery;
    }
    return "";
  });
  
  // Voice input temporarily disabled
  const { user } = useAuth();
  const { currentUser } = useFirebaseAuth();
  const [, setLocation] = useLocation();
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [placeholder, setPlaceholder] = useState("");
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [selectedModel, setSelectedModel] = useState("GPT-4o Mini");
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showScrollSuggestions, setShowScrollSuggestions] = useState(false);
  
  // PROMPT ENHANCEMENT STATE
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  
  // Toast notifications
  const { toast } = useToast();
  
  // Temporary disable voice input
  const isListening = false;
  const transcript = '';
  const startListening = () => {};
  const stopListening = () => {};
  const resetTranscript = () => {};

  // Get user's first name
  const firstName = currentUser?.displayName?.split(' ')[0] || 
                   currentUser?.email?.split('@')[0] || 
                   user?.name?.split(' ')[0] || 
                   'User';

  // Dynamic greeting based on time and occasions
  const getGreeting = () => {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const day = now.getDate();
    const hour = now.getHours();

    // Special occasions
    if (month === 12 && day === 25) {
      return `Merry Christmas ${firstName}`;
    }
    if (month === 1 && day === 1) {
      return `Happy New Year ${firstName}`;
    }
    if (month === 12 && day === 31) {
      return `Happy New Year's Eve ${firstName}`;
    }
    if (month === 10 && day === 31) {
      return `Happy Halloween ${firstName}`;
    }
    if (month === 2 && day === 14) {
      return `Happy Valentine's Day ${firstName}`;
    }
    if (month === 7 && day === 4) {
      return `Happy 4th of July ${firstName}`;
    }

    // Time-based greetings
    if (hour >= 5 && hour < 12) {
      return `Good morning ${firstName}`;
    } else if (hour >= 12 && hour < 17) {
      return `Good afternoon ${firstName}`;
    } else if (hour >= 17 && hour < 22) {
      return `Good evening ${firstName}`;
    } else {
      return `Good night ${firstName}`;
    }
  };

  const greeting = getGreeting();

  const llmModels = [
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

  /**
   * PROMPT ENHANCEMENT HANDLER
   */
  const handlePromptEnhancement = async () => {
    if (!query.trim() || isEnhancing) return;
    
    setIsEnhancing(true);
    
    try {
      const originalQuery = query;
      const enhancedQuery = await enhancePrompt(query, {
        role: currentUser?.displayName,
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

  /**
   * UNDO ENHANCEMENT HANDLER
   */
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

  const placeholderPhrases = [
    "Ask anything...",
    "Look for the right product",
    "What are you looking for?",
    "Connect with the right startup",
    "Hire the perfect freelancer"
  ];

  // Typewriter effect
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

  // Filter suggestions
  useEffect(() => {
    if (query.trim().length > 0) {
      const filtered = searchSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8);
      
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedSuggestionIndex(-1);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  }, [query]);

  const searchMutation = useMutation({
    mutationFn: async (searchQuery: string) => {
      const response = await apiRequest("POST", "/api/search", {
        query: searchQuery,
        userId: user?.id,
        selectedModel,
        selectedTypes: Array.from(selectedTypes)
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
    
    setShowSuggestions(false);
    const typesParam = selectedTypes.size > 0 ? `&types=${Array.from(selectedTypes).join(',')}` : '';
    setLocation(`/search-transition?q=${encodeURIComponent(query)}${typesParam}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const isMetaKey = e.metaKey || e.ctrlKey;
    
    // Cmd/Ctrl + E: Enhance prompt
    if (isMetaKey && e.key === 'e') {
      e.preventDefault();
      handlePromptEnhancement();
      return;
    }
    
    // Cmd/Ctrl + Z: Undo enhancement
    if (isMetaKey && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      handleUndo();
      return;
    }
    
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      
      if (selectedSuggestionIndex >= 0 && filteredSuggestions[selectedSuggestionIndex]) {
        const selectedQuery = filteredSuggestions[selectedSuggestionIndex];
        const typesParam = selectedTypes.size > 0 ? `&types=${Array.from(selectedTypes).join(',')}` : '';
        setLocation(`/search-transition?q=${encodeURIComponent(selectedQuery)}${typesParam}`);
      } else {
        handleSearch();
      }
      setShowSuggestions(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    const typesParam = selectedTypes.size > 0 ? `&types=${Array.from(selectedTypes).join(',')}` : '';
    setLocation(`/search-transition?q=${encodeURIComponent(suggestion)}${typesParam}`);
    setShowSuggestions(false);
  };

  const handleSuggestionTileClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
  };

  const quickSuggestions = [
    "AI-powered lead generation for B2B sales",
    "Automated video editing for short-form content",
    "AI email assistant for busy professionals",
    "Voice-based AI receptionist for local businesses",
    "Predictive analytics for e-commerce growth",
    "Content creation tools for marketing",
    "Customer service automation",
  ];

  const extraSuggestions = [
    "AI copywriting tool for ad agencies under $2000",
    "Customer support chatbot for e-commerce stores under $1500",
    "AI-driven sales forecasting for retail above $5000",
    "Automated podcast editing software under $3000",
    "AI resume screening tool for HR teams under $4000",
    "Machine learning fraud detection for fintech above $7000",
    "Voice cloning software for content creators under $2500",
    "AI-powered SEO optimization tool under $1000",
    "Automated data entry assistant for accountants under $2000",
    "Predictive inventory management system above $6000",
    "AI transcription and meeting notes generator under $1500",
    "Automated social media scheduling tool under $800",
    "AI-based health diagnostics platform above $9000",
    "Natural language query analytics tool under $5000",
    "AI video upscaling tool for filmmakers under $2500",
    "Automated influencer discovery platform above $4500",
    "AI brand logo generator for startups under $500",
    "Speech-to-text API for call centers under $2000",
    "AI music composition tool for YouTubers under $1500",
    "Automated real estate listing optimizer under $1000",
  ];
  
  const allSuggestions = [...quickSuggestions, ...extraSuggestions];
  const [visibleCount, setVisibleCount] = useState(quickSuggestions.length);
  const visibleSuggestions = allSuggestions.slice(0, visibleCount);
  const hasMoreSuggestions = visibleCount < allSuggestions.length;
  
  const handleShowMore = () => {
    setVisibleCount(prev => Math.min(prev + 5, allSuggestions.length));
  };
  
  const handleShowLess = () => {
    setVisibleCount(quickSuggestions.length);
  };

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

  // Handle scroll for suggestions
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowScrollSuggestions(scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-2 sm:px-4">
      {/* Welcome Message - Centered */}
      <div className={`text-center transition-all duration-1000 ease-out mb-6 ${
        isTransitioning ? 'opacity-0 scale-90 -translate-y-12 pointer-events-none' : 'opacity-100 scale-100 translate-y-0'
      }`}>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight" style={{ fontFamily: 'Instrument Serif, serif' }}>
          <span className="text-white">{greeting}</span>
        </h1>
      </div>

      {/* Search Bar - Centered */}
      <div className={`transition-all duration-1500 ease-out w-full max-w-4xl mx-auto ${
        isSearching 
          ? 'opacity-0 scale-90 pointer-events-none'
          : 'transform translate-y-0 opacity-100 scale-100'
      }`}>
        <div className={`relative rounded-[16px] sm:rounded-[20px] md:rounded-[28px] border border-white/15 bg-white/5 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.45)] overflow-visible transition-all duration-1500 ease-out h-[65px] sm:h-[75px] md:h-[85px] ${
          isSearching ? 'transform scale-95' : 'transform scale-100'
        }`}>
          <div className="relative px-2 sm:px-4 flex items-center h-[35px] sm:h-[40px] md:h-[45px]">
            <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 flex items-center space-x-1 sm:space-x-2">
              {/* Undo button */}
              {queryHistory.length > 0 && currentHistoryIndex >= 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        aria-label="Undo prompt enhancement"
                        onClick={handleUndo}
                        className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-white/5 border border-white/20 text-white/70 hover:bg-white/10 hover:text-white transition"
                      >
                        <Undo className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Undo enhancement (Ctrl+Z)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {/* Prompt enhancer button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      aria-label="Enhance search prompt"
                      onClick={handlePromptEnhancement}
                      disabled={!query.trim() || isEnhancing || searchMutation.isPending}
                      className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-white/5 border border-white/20 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isEnhancing ? (
                        <Loader2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 animate-spin" />
                      ) : (
                        <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
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
                aria-label={isListening ? "Stop listening" : "Start voice input"}
                onClick={isListening ? stopListening : startListening}
                className={`flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border transition ${
                  isListening 
                    ? 'bg-red-500/20 border-red-400/40 text-red-400' 
                    : 'bg-white/5 border-white/20 text-white/90 hover:bg-white/10'
                }`}
              >
                {isListening ? <MicOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Mic className="h-3 w-3 sm:h-4 sm:w-4" />}
              </button>
              <button
                aria-label="Search"
                onClick={handleSearch}
                disabled={!query.trim() || searchMutation.isPending || isEnhancing}
                className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-white/5 border border-white/20 text-white/90 hover:bg-white/10 transition disabled:opacity-50"
              >
                {searchMutation.isPending ? (
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
              </button>
            </div>

            <Input
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => query.trim().length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              disabled={isEnhancing}
              className="h-8 sm:h-9 md:h-10 w-full border-0 bg-transparent shadow-none text-xs sm:text-sm md:text-base lg:text-lg placeholder:text-white/70 text-white focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none pr-20 sm:pr-24 md:pr-28 flex items-center disabled:opacity-70"
            />
          </div>

          <div className="relative border-t border-white/10 px-2 sm:px-4 py-1 sm:py-2 h-[30px] sm:h-[35px] md:h-[40px]">
            <div className="flex items-center justify-between">
              <div className="relative flex items-center space-x-2">
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowModelDropdown(!showModelDropdown);
                    }}
                    className={`flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center hover:text-white/80 transition-colors rounded-full border border-white/20 bg-white/5 ${
                      selectedModel && selectedModel !== "GPT-4o Mini" ? 'text-yellow-400' : 'text-white'
                    }`}
                  >
                    <Brain className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </button>
                  
                  {showModelDropdown && (
                    <>
                      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[10000]" onClick={() => setShowModelDropdown(false)} />
                      <div className="absolute top-8 left-0 z-[10001] bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg shadow-2xl min-w-[200px] max-h-24 overflow-y-auto">
                        {llmModels.map((model) => (
                          <button
                            key={model}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedModel(model);
                              setShowModelDropdown(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-xs hover:bg-white/10 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                              selectedModel === model ? 'bg-blue-600/20 text-blue-300' : 'text-white/80'
                            }`}
                          >
                            {model}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                
                <span className="text-xs text-white/70 hidden md:inline">{selectedModel || "GPT-4o Mini"}</span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2.5">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className={
                          `h-5 w-5 sm:h-6 sm:w-6 rounded-full border backdrop-blur-md flex items-center justify-center transition hover:bg-white/10 ` +
                          (selectedTypes.has('company')
                            ? 'bg-yellow-500/10 border-yellow-400/40 text-yellow-300'
                            : 'bg-white/5 border-white/20 text-white/90')
                        }
                        aria-label="Company"
                        onClick={() => toggleType('company')}
                      >
                        <Building2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Company</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className={
                          `h-6 w-6 rounded-full border backdrop-blur-md flex items-center justify-center transition hover:bg-white/10 ` +
                          (selectedTypes.has('freelancer')
                            ? 'bg-yellow-500/10 border-yellow-400/40 text-yellow-300'
                            : 'bg-white/5 border-white/20 text-white/90')
                        }
                        aria-label="Freelancer"
                        onClick={() => toggleType('freelancer')}
                      >
                        <User className="h-3 w-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Freelancer</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className={
                          `h-6 w-6 rounded-full border backdrop-blur-md flex items-center justify-center transition hover:bg-white/10 ` +
                          (selectedTypes.has('product')
                            ? 'bg-yellow-500/10 border-yellow-400/40 text-yellow-300'
                            : 'bg-white/5 border-white/20 text-white/90')
                        }
                        aria-label="Product"
                        onClick={() => toggleType('product')}
                      >
                        <Package className="h-3 w-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Product</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhancement feedback */}
        {isEnhancing && (
          <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg backdrop-blur-sm">
            <div className="flex items-center gap-2 text-blue-300 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Enhancing your search prompt...</span>
            </div>
          </div>
        )}

        {/* Search Suggestions Dropdown */}
        {showSuggestions && (
          <div className="absolute z-50 w-full max-w-4xl mt-2 bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center space-x-3 ${
                  index === selectedSuggestionIndex ? 'bg-white/10' : ''
                }`}
              >
                <Clock className="w-4 h-4 text-white/60" />
                <span className="text-white">{suggestion}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Suggestions - Hidden initially on mobile, shown on scroll */}
      <div className={`${showScrollSuggestions ? 'flex' : 'hidden md:flex'} flex-wrap justify-center gap-2 mt-4 transition-all duration-1000 ease-out ${
        isTransitioning ? 'opacity-0 scale-90 -translate-y-12 pointer-events-none' : 'opacity-100 scale-100 translate-y-0'
      }`}>
        {visibleSuggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => handleSuggestionTileClick(suggestion)}
            className="text-xs rounded-md px-3 py-1 border-white/30 bg-white/5 hover:border-white/60 hover:bg-white/10 backdrop-blur-sm transition-all"
          >
            <Sparkles className="w-3 h-3 mr-2" />
            {suggestion}
          </Button>
        ))}
        {hasMoreSuggestions && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleShowMore}
            className="text-xs rounded-md px-3 py-1 border-yellow-400/40 bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20 hover:border-yellow-400/60"
          >
            See more
          </Button>
        )}
        {visibleCount > quickSuggestions.length && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleShowLess}
            className="text-xs rounded-md px-3 py-1 border-white/30 bg-white/5 text-white hover:bg-white/10 hover:border-white/60"
          >
            See less
          </Button>
        )}
      </div>
      
      {/* Loading State */}
      {isSearching && (
        <div className="fixed inset-0 flex flex-col items-center justify-center z-30 animate-fade-in">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-white/20 border-t-white/60 border-r-white/40 rounded-full animate-spin mb-8" style={{animationDuration: '1s'}}></div>
            <div className="absolute inset-0 w-24 h-24 border-4 border-transparent border-b-white/50 border-l-white/30 rounded-full animate-spin mb-8" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          <div className="text-center">
            <p className="text-white text-2xl font-semibold mb-3">Searching for "{query}"...</p>
            <p className="text-white/70 text-lg mb-6">Finding the best AI solutions for you</p>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '200ms'}}></div>
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '400ms'}}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}