import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Brain, Sparkles, Building2, User, Package, Mic, MicOff, Loader2, Undo } from "lucide-react";
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
      return `Good evening ${firstName}`;
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
      handleSearch();
    }
  };



  const handleSuggestionTileClick = (suggestion: string) => {
    setQuery(suggestion);
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
    <div className="min-h-screen flex flex-col items-center justify-center px-3 xs:px-4 sm:px-6">
      {/* Welcome Message - Mobile optimized */}
      <div className={`text-center transition-all duration-1000 ease-out mb-4 xs:mb-6 ${
        isTransitioning ? 'opacity-0 scale-90 -translate-y-12 pointer-events-none' : 'opacity-100 scale-100 translate-y-0'
      }`}>
        <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight px-2" style={{ fontFamily: 'Instrument Serif, serif' }}>
          <span className="text-white">{greeting}, what are you looking for today?</span>
        </h1>
      </div>

      {/* Glassmorphism Search Bar - Mobile optimized */}
      <div className={`transition-all duration-1500 ease-out w-full max-w-4xl mx-auto mb-4 xs:mb-6 sm:mb-8 px-3 xs:px-4 ${
        isSearching 
          ? 'opacity-0 scale-90 pointer-events-none'
          : 'transform translate-y-0 opacity-100 scale-100'
      }`}>
        <div className={`relative rounded-[16px] xs:rounded-[20px] sm:rounded-[24px] md:rounded-[28px] border border-white/15 bg-white/5 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.45)] overflow-visible transition-all duration-1500 ease-out h-[80px] xs:h-[85px] sm:h-[90px] md:h-[100px] lg:h-[110px] ${
          isSearching ? 'transform scale-95' : 'transform scale-100'
        }`}>
          {/* Search input area - mobile optimized */}
          <div className="relative px-3 xs:px-4 sm:px-6 flex items-center h-[48px] xs:h-[50px] sm:h-[55px] md:h-[60px]">
            {/* Undo button (only show if there's history) - Mobile optimized */}
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
            
            {/* Prompt enhancer button - Mobile optimized */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    aria-label="Enhance search prompt"
                    onClick={handlePromptEnhancement}
                    disabled={!query.trim() || isEnhancing || searchMutation.isPending}
                    className="absolute right-[44px] xs:right-[48px] sm:right-16 top-1/2 -translate-y-1/2 flex h-7 w-7 xs:h-8 xs:w-8 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white/5 border border-white/20 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
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
            
            {/* Search button - Mobile optimized */}
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

            {/* Input - Mobile optimized */}
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

          {/* Bottom row - Icons - mobile optimized */}
          <div className="relative border-t border-white/10 px-3 xs:px-4 sm:px-6 py-1 h-[30px] xs:h-[32px] sm:h-[34px] md:h-[36px]">
            <div className="flex items-center justify-between">
              {/* Left - Brain icon with dropdown and selected model - Mobile optimized */}
              <div className="relative flex items-center space-x-1.5 sm:space-x-2">
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowModelDropdown(!showModelDropdown);
                    }}
                    className={`flex h-6 w-6 xs:h-7 xs:w-7 sm:h-7 sm:w-7 items-center justify-center hover:text-white/80 transition-colors rounded-full border border-white/20 bg-white/5 aspect-square touch-manipulation ${
                      selectedModel && selectedModel !== "GPT-4o Mini" ? 'text-yellow-400' : 'text-white'
                    }`}
                  >
                    <Brain className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-3.5 sm:w-3.5" />
                  </button>
                  
                  {showModelDropdown && (
                    <>
                      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[10000]" onClick={() => setShowModelDropdown(false)} />
                      <div className="absolute top-8 left-0 z-[10001] bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg shadow-2xl min-w-[180px] xs:min-w-[200px] max-h-32 xs:max-h-36 overflow-y-auto">
                        {llmModels.map((model) => (
                          <button
                            key={model}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedModel(model);
                              setShowModelDropdown(false);
                            }}
                            className={`w-full px-2.5 xs:px-3 py-2 xs:py-2.5 text-left text-xs xs:text-sm hover:bg-white/10 transition-colors first:rounded-t-lg last:rounded-b-lg touch-manipulation ${
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
                
                <span className="text-xs text-white/70 hidden xs:inline sm:inline truncate max-w-[80px] xs:max-w-[100px] sm:max-w-[120px]">{selectedModel || "GPT-4o Mini"}</span>
              </div>

              {/* Right - Filter buttons - Mobile optimized */}
              <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2.5">
                <TooltipProvider>
                  {/* Company */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className={
                          `h-6 w-6 xs:h-7 xs:w-7 sm:h-7 sm:w-7 rounded-full border backdrop-blur-md flex items-center justify-center transition hover:bg-white/10 aspect-square touch-manipulation ` +
                          (selectedTypes.has('company')
                            ? 'bg-yellow-500/10 border-yellow-400/40 text-yellow-300'
                            : 'bg-white/5 border-white/20 text-white/90')
                        }
                        aria-label="Company"
                        onClick={() => toggleType('company')}
                      >
                        <Building2 className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-3.5 sm:w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Company</TooltipContent>
                  </Tooltip>
                  {/* Freelancer */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className={
                          `h-6 w-6 xs:h-7 xs:w-7 sm:h-7 sm:w-7 rounded-full border backdrop-blur-md flex items-center justify-center transition hover:bg-white/10 aspect-square touch-manipulation ` +
                          (selectedTypes.has('freelancer')
                            ? 'bg-yellow-500/10 border-yellow-400/40 text-yellow-300'
                            : 'bg-white/5 border-white/20 text-white/90')
                        }
                        aria-label="Freelancer"
                        onClick={() => toggleType('freelancer')}
                      >
                        <User className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-3.5 sm:w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Freelancer</TooltipContent>
                  </Tooltip>
                  {/* Product */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className={
                          `h-6 w-6 xs:h-7 xs:w-7 sm:h-7 sm:w-7 rounded-full border backdrop-blur-md flex items-center justify-center transition hover:bg-white/10 aspect-square touch-manipulation ` +
                          (selectedTypes.has('product')
                            ? 'bg-yellow-500/10 border-yellow-400/40 text-yellow-300'
                            : 'bg-white/5 border-white/20 text-white/90')
                        }
                        aria-label="Product"
                        onClick={() => toggleType('product')}
                      >
                        <Package className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-3.5 sm:w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Product</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhancement feedback - Mobile optimized */}
        {isEnhancing && (
          <div className="absolute top-full left-0 right-0 mt-2 mx-2 xs:mx-0 p-2.5 xs:p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg backdrop-blur-sm">
            <div className="flex items-center gap-2 text-blue-300 text-xs xs:text-sm">
              <Loader2 className="w-3.5 h-3.5 xs:w-4 xs:h-4 animate-spin" />
              <span>Enhancing your search prompt...</span>
            </div>
          </div>
        )}


      </div>

      {/* Quick Suggestions - Mobile optimized */}
      <div className={`${showScrollSuggestions ? 'flex' : 'hidden md:flex'} flex-wrap justify-center gap-1.5 xs:gap-2 mt-3 xs:mt-4 px-3 xs:px-4 transition-all duration-1000 ease-out ${
        isTransitioning ? 'opacity-0 scale-90 -translate-y-12 pointer-events-none' : 'opacity-100 scale-100 translate-y-0'
      }`}>
        {visibleSuggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            onClick={() => handleSuggestionTileClick(suggestion)}
            className="text-xs xs:text-sm rounded-lg px-2.5 xs:px-3 py-2 border-white/30 bg-white/5 hover:border-white/60 hover:bg-white/10 backdrop-blur-sm min-h-[32px] xs:min-h-[36px] text-white touch-manipulation"
          >
            <Sparkles className="w-2.5 h-2.5 xs:w-3 xs:h-3 mr-1.5 xs:mr-2" />
            <span className="truncate max-w-[120px] xs:max-w-none">{suggestion}</span>
          </Button>
        ))}
        {hasMoreSuggestions && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShowMore}
            className="text-xs xs:text-sm rounded-lg px-2.5 xs:px-3 py-2 min-h-[32px] xs:min-h-[36px] text-black bg-white hover:bg-gray-100 border border-white touch-manipulation"
          >
            See more
          </Button>
        )}
        {visibleCount > quickSuggestions.length && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShowLess}
            className="text-xs xs:text-sm rounded-lg px-2.5 xs:px-3 py-2 min-h-[32px] xs:min-h-[36px] text-black bg-white hover:bg-gray-100 border border-white touch-manipulation"
          >
            See less
          </Button>
        )}
      </div>
      
      {/* Loading State - Mobile optimized */}
      {isSearching && (
        <div className="fixed inset-0 flex flex-col items-center justify-center z-30 animate-fade-in px-4">
          <div className="relative mb-6 xs:mb-8">
            <div className="w-20 h-20 xs:w-24 xs:h-24 border-4 border-white/20 border-t-white/60 border-r-white/40 rounded-full animate-spin" style={{animationDuration: '1s'}}></div>
            <div className="absolute inset-0 w-20 h-20 xs:w-24 xs:h-24 border-4 border-transparent border-b-white/50 border-l-white/30 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          <div className="text-center max-w-sm xs:max-w-md">
            <p className="text-white text-lg xs:text-xl sm:text-2xl font-semibold mb-2 xs:mb-3 leading-tight">Searching for "{query}"...</p>
            <p className="text-white/70 text-sm xs:text-base sm:text-lg mb-4 xs:mb-6">Finding the best AI solutions for you</p>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2.5 h-2.5 xs:w-3 xs:h-3 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
              <div className="w-2.5 h-2.5 xs:w-3 xs:h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '200ms'}}></div>
              <div className="w-2.5 h-2.5 xs:w-3 xs:h-3 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '400ms'}}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}