/* File Overview
  Path: client/src/components/search-interface.tsx
  Purpose: Reusable React component used across pages.

  Reading tip for newcomers:
  - Scan the exports at the bottom to see what the rest of the app imports from here
  - Follow the data flow via function parameters and return values
*/

// React hooks for state management and lifecycle
import { useState, useEffect } from "react";

// Routing for navigation
import { useLocation } from "@/hooks/use-location";

// UI components
import { Button } from "@/components/ui/button";                    // Reusable button component
import { Input } from "@/components/ui/input";                      // Form input component
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Tooltip components
import { AnimatedButton } from "@/components/ui/animated-button";    // Enhanced animated button
import { AnimatedSearchBar } from "@/components/ui/animated-search-bar"; // Enhanced search bar
import { LoadingSpinner } from "@/components/ui/loading-spinner";    // Premium loading animations

// Icons from Lucide React
import { Search, Lightbulb, Sparkles, Wrench, Building2, Package, User, Clock, TrendingUp, Brain, ChevronDown, Loader2, Undo } from "lucide-react";

// Data fetching and API
import { useMutation } from "@tanstack/react-query";               // React Query for API calls
import { apiRequest } from "@/lib/queryClient";                    // API request utility

// Authentication
import { useAuth } from "@/lib/auth";                              // User authentication state

// Prompt Enhancement
import { enhancePrompt } from "@/lib/promptEnhancer";               // Prompt enhancement utility
import { useToast } from "@/hooks/use-toast";                       // Toast notifications

/**
 * SEARCH INTERFACE PROPS
 * 
 * Optional callback function to handle search results
 * Allows parent components to receive and process search data
 */
interface SearchInterfaceProps {
  onSearchResults?: (results: any) => void;                        // Callback for search results
}

/**
 * SEARCH SUGGESTIONS DATABASE
 * 
 * Comprehensive list of AI-related search suggestions
 * In production, this would come from an API endpoint
 * Organized by categories and use cases for better user experience
 * 
 * Categories include:
 * - Content creation and marketing
 * - Business automation
 * - Customer service
 * - Data analysis and insights
 * - Development tools
 * - Industry-specific solutions
 */
const searchSuggestions = [
  "AI-powered lead generation for B2B sales",
  "AI content creation tools for social media",
  "Customer service automation",
  "Automated video editing for short-form content",
  "AI email assistant for busy professionals",
  "Voice-based AI receptionist for local businesses",
  "Predictive analytics for e-commerce growth",
  "AI copywriting tool for ad agencies",
  "Customer support chatbot for e-commerce stores",
  "AI-driven sales forecasting for retail",
  "Automated podcast editing software",
  "AI resume screening tool for HR teams",
  "Machine learning fraud detection for fintech",
  "Voice cloning software for content creators",
  "AI-powered SEO optimization tool",
  "Automated data entry assistant for accountants",
  "Predictive inventory management system",
  "AI transcription and meeting notes generator",
  "Automated social media scheduling tool",
  "AI-based health diagnostics platform",
  "Natural language query analytics tool",
  "AI video upscaling tool for filmmakers",
  "Automated influencer discovery platform",
  "AI brand logo generator for startups",
  "Speech-to-text API for call centers",
  "AI music composition tool for YouTubers",
  "Automated real estate listing optimizer",
  "AI-powered grammar and style checker",
  "Predictive churn analysis tool for SaaS companies",
  "AI-powered survey analysis platform",
  "Automated invoice processing system",
  "AI-generated blog writing assistant",
  "Chatbot for appointment booking for salons",
  "AI customer sentiment analysis tool",
  "Automated video subtitle generator",
  "AI call summarization tool for sales teams",
  "Intelligent email spam filter",
  "AI ad creative generator for Facebook ads",
  "Automated job description writer",
  "AI-powered market research platform",
  "Predictive lead scoring tool for CRM",
  "AI content repurposing tool for podcasts",
  "Automated UX feedback analyzer",
  "AI code completion assistant for developers",
  "Intelligent resume builder",
  "AI-powered language translation service",
  "Automated video testimonial generator",
  "AI lead enrichment tool for B2B",
  "Predictive demand forecasting for manufacturing",
  "AI-powered social listening tool",
  "Automated academic research summarizer",
  "AI-based plagiarism detection for writers",
  "Intelligent ad targeting platform",
  "AI-powered pricing optimization for hotels",
  "Automated event scheduling assistant",
  "AI meeting scheduling bot for enterprises",
  "AI-driven contract review tool for lawyers"
];

/**
 * SEARCH INTERFACE COMPONENT
 * 
 * Main search component for the homepage with advanced features:
 * 
 * KEY FEATURES:
 * 1. Typewriter Effect: Animated placeholder text that cycles through different phrases
 * 2. Live Search Suggestions: Real-time filtering of suggestions as user types
 * 3. Keyboard Navigation: Arrow keys and Enter support for suggestions
 * 4. Type Filters: Toggle buttons for different content types (tools, companies, etc.)
 * 5. Search Animations: Smooth transitions and loading states
 * 6. Glassmorphism Design: Modern semi-transparent styling with backdrop blur
 * 
 * ANIMATION STATES:
 * - Default: Centered hero layout with large search bar
 * - Transitioning: Fade out animation when search begins
 * - Searching: Full-screen loading animation with cosmic rings
 * 
 * TYPEWRITER EFFECT:
 * - Cycles through 5 different placeholder phrases
 * - Each phrase types out letter by letter, pauses, then deletes
 * - Creates engaging, dynamic user experience
 */
export function SearchInterface({ onSearchResults }: SearchInterfaceProps) {
  // SEARCH STATE
  const [query, setQuery] = useState("");                          // Current search query
  
  // HERO TEXT ANIMATION STATE
  const [flickerWord, setFlickerWord] = useState("Startup");        // Word that flickers in hero text
  
  // USER AND NAVIGATION
  const { user } = useAuth();                                      // Current user for personalization
  const [, setLocation] = useLocation();                          // Navigation function
  
  // TYPE FILTER STATE
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set()); // Selected content types
  
  // SUGGESTIONS STATE
  const [showSuggestions, setShowSuggestions] = useState(false);   // Whether to show suggestion dropdown
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]); // Filtered suggestions
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1); // Keyboard navigation index
  
  // ANIMATION STATES
  const [isSearching, setIsSearching] = useState(false);           // Full-screen search animation
  const [isTransitioning, setIsTransitioning] = useState(false);   // Fade out transition
  
  // TYPEWRITER EFFECT STATE
  const [placeholder, setPlaceholder] = useState("");              // Current placeholder text
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0); // Index of current phrase
  
  // MODEL SELECTION STATE
  const [selectedModel, setSelectedModel] = useState("GPT-4o Mini");
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  
  // PROMPT ENHANCEMENT STATE
  const [isEnhancing, setIsEnhancing] = useState(false);           // Enhancement loading state
  const [queryHistory, setQueryHistory] = useState<string[]>([]);  // Query history for undo
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1); // Current position in history
  
  // Toast notifications
  const { toast } = useToast();

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
   * Transforms basic user input into detailed, comprehensive search prompt
   */
  const handlePromptEnhancement = async () => {
    if (!query.trim() || isEnhancing) return;
    
    setIsEnhancing(true);
    
    try {
      const originalQuery = query;
      const enhancedQuery = await enhancePrompt(query, {
        userRole: undefined,
        industry: undefined,
        companySize: undefined
      });
      
      // Update query history for undo functionality
      setQueryHistory(prev => [...prev, originalQuery]);
      setCurrentHistoryIndex(queryHistory.length);
      
      // Update query with enhanced version
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
   * Reverts enhanced prompts back to original
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

  /**
   * HERO TEXT FLICKER WORDS
   * Words that cycle in the main hero text "Find the right [WORD]"
   * Creates dynamic, engaging headline that shows different use cases
   */
  const flickerWords = ["Startup", "Solution", "Product", "Service", "Company"];
  
  /**
   * TYPEWRITER PLACEHOLDER PHRASES
   * Array of phrases that cycle in the search bar placeholder
   * Each phrase represents a different use case or search intent
   * Designed to guide users and show the breadth of available content
   */
  const placeholderPhrases = [
    "Ask anything...",                                            // General search prompt
    "Look for the right product",                                // Product-focused search
    "What are you looking for?",                                 // Open-ended question
    "Connect with the right startup",                            // Startup connection
    "Hire the perfect freelancer"                                // Freelancer hiring
  ];

  /**
   * HERO TEXT FLICKER ANIMATION
   * 
   * Cycles through different words in the hero text every 4 seconds
   * Creates dynamic headline that showcases different use cases
   * Slower timing (4s) allows users to read and process each word
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setFlickerWord(prev => {
        // Find current word index and move to next
        const currentIndex = flickerWords.indexOf(prev);
        const nextIndex = (currentIndex + 1) % flickerWords.length;
        return flickerWords[nextIndex];
      });
    }, 4000);                                                     // 4 second intervals

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  /**
   * TYPEWRITER EFFECT FOR SEARCH PLACEHOLDER
   * 
   * Creates animated placeholder text that:
   * 1. Types out each phrase letter by letter (100ms per character)
   * 2. Pauses for 2 seconds when complete
   * 3. Deletes the phrase letter by letter (50ms per character)
   * 4. Moves to next phrase after 500ms pause
   * 5. Cycles through all phrases infinitely
   * 
   * This creates an engaging, dynamic search experience that guides users
   * and demonstrates the variety of searches possible
   */
  useEffect(() => {
    let timeout: NodeJS.Timeout;                                  // Timeout for animation timing
    let currentText = "";                                         // Current displayed text
    let isDeleting = false;                                       // Whether we're deleting or typing
    let charIndex = 0;                                            // Current character position
    
    /**
     * TYPEWRITER ANIMATION FUNCTION
     * Recursive function that handles the typing/deleting animation
     */
    const typeWriter = () => {
      const currentPhrase = placeholderPhrases[currentPhraseIndex];
      
      // TYPING PHASE: Add characters one by one
      if (!isDeleting && charIndex < currentPhrase.length) {
        currentText += currentPhrase.charAt(charIndex);           // Add next character
        setPlaceholder(currentText);                              // Update display
        charIndex++;                                              // Move to next character
        timeout = setTimeout(typeWriter, 100);                    // 100ms between characters
        
      // DELETING PHASE: Remove characters one by one
      } else if (isDeleting && charIndex > 0) {
        currentText = currentPhrase.substring(0, charIndex - 1);  // Remove last character
        setPlaceholder(currentText);                              // Update display
        charIndex--;                                              // Move back one character
        timeout = setTimeout(typeWriter, 50);                     // 50ms between deletions (faster)
        
      // PAUSE PHASE: Finished typing, pause before deleting
      } else if (!isDeleting && charIndex === currentPhrase.length) {
        timeout = setTimeout(() => {
          isDeleting = true;                                      // Switch to deleting mode
          typeWriter();                                           // Continue animation
        }, 2000);                                                 // 2 second pause
        
      // NEXT PHRASE: Finished deleting, move to next phrase
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;                                       // Switch back to typing mode
        setCurrentPhraseIndex((prev) => (prev + 1) % placeholderPhrases.length); // Next phrase
        timeout = setTimeout(typeWriter, 500);                    // 500ms pause before next phrase
      }
    };
    
    // Start the typewriter animation
    typeWriter();
    
    // Cleanup timeout on component unmount or phrase change
    return () => clearTimeout(timeout);
  }, [currentPhraseIndex]);                                       // Re-run when phrase index changes

  /**
   * LIVE SEARCH SUGGESTIONS FILTERING
   * 
   * Filters the suggestions array based on user input in real-time
   * Provides instant feedback and helps users discover relevant searches
   * 
   * FEATURES:
   * - Case-insensitive matching
   * - Limits to 8 suggestions for clean UI
   * - Resets keyboard navigation when suggestions change
   * - Hides dropdown when no query or no matches
   */
  useEffect(() => {
    if (query.trim().length > 0) {
      // Filter suggestions that contain the query (case-insensitive)
      const filtered = searchSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8);                                              // Limit to 8 suggestions
      
      setFilteredSuggestions(filtered);                          // Update filtered list
      setShowSuggestions(filtered.length > 0);                   // Show dropdown if matches found
      setSelectedSuggestionIndex(-1);                            // Reset keyboard selection
    } else {
      // No query - hide suggestions
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  }, [query]);                                                   // Re-run when query changes

  /**
   * SEARCH API MUTATION
   * 
   * Handles the actual search API call using React Query
   * Provides loading states, error handling, and success callbacks
   * 
   * FEATURES:
   * - Sends search query and user ID to backend
   * - Calls parent callback with results
   * - Clears search input on success
   * - Automatic error handling via React Query
   */
  const searchMutation = useMutation({
    // API call function
    mutationFn: async (searchQuery: string) => {
      const response = await apiRequest("POST", "/api/search", {
        query: searchQuery,                                       // User's search query
        userId: user?.id,                                         // User ID for personalization
        selectedModel,                                            // Selected LLM model
        selectedTypes: Array.from(selectedTypes)                 // Selected filter types
      });
      return response.json();                                   // Parse JSON response
    },
    // Success handler
    onSuccess: (data) => {
      if (onSearchResults) {
        onSearchResults(data);                                    // Pass results to parent
      }
      setQuery("");                                              // Clear search input
    }
    // Error handling is automatic via React Query
  });

  /**
   * SEARCH EXECUTION HANDLER
   * 
   * Orchestrates the search process with authentication check:
   * 1. Validates query is not empty
   * 2. Checks if user is logged in
   * 3. If not logged in, shows transition and redirects to auth page
   * 4. If logged in, proceeds with search animation and results
   */
  const handleSearch = () => {
    if (!query.trim()) return;                                    // Don't search empty queries
    
    // Check if user is logged in
    if (!user) {
      // Store query for after login (only on client side)
      if (typeof window !== "undefined") {
        localStorage.setItem('pending-search-query', query.trim());
      }
      setLocation('/auth');
      return;
    }
    
    // Navigate directly to results page
    const typesParam = selectedTypes.size > 0 ? `&types=${Array.from(selectedTypes).join(',')}` : '';
    setLocation(`/results?q=${encodeURIComponent(query)}${typesParam}`);
  };

  /**
   * KEYBOARD NAVIGATION HANDLER
   * 
   * Provides full keyboard support with authentication check:
   * - Enter: Execute search (selected suggestion or current query)
   * - Arrow Down: Move to next suggestion
   * - Arrow Up: Move to previous suggestion
   * - Escape: Close suggestions dropdown
   * - Ctrl/Cmd + E: Enhance prompt
   * - Ctrl/Cmd + Z: Undo enhancement
   * 
   * Redirects to auth page if user not logged in
   */
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
    // ENTER KEY: Execute search
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();                                         // Prevent form submission
      
      // Check if user is logged in
      if (!user) {
        const queryToStore = selectedSuggestionIndex >= 0 && filteredSuggestions[selectedSuggestionIndex] 
          ? filteredSuggestions[selectedSuggestionIndex] 
          : query.trim();
        if (queryToStore) {
          if (typeof window !== "undefined") {
            localStorage.setItem('pending-search-query', queryToStore);
          }
          setLocation('/auth');
        }
        return;
      }
      
      // If a suggestion is selected, use it
      if (selectedSuggestionIndex >= 0 && filteredSuggestions[selectedSuggestionIndex]) {
        const selectedQuery = filteredSuggestions[selectedSuggestionIndex];
        const typesParam = selectedTypes.size > 0 ? `&types=${Array.from(selectedTypes).join(',')}` : '';
        setLocation(`/results?q=${encodeURIComponent(selectedQuery)}${typesParam}`);
      } else {
        // No suggestion selected, use current query
        handleSearch();
      }
      setShowSuggestions(false);                                  // Hide suggestions
      
    // ARROW DOWN: Move to next suggestion
    } else if (e.key === "ArrowDown") {
      e.preventDefault();                                         // Prevent cursor movement
      setSelectedSuggestionIndex(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev  // Don't go past last item
      );
      
    // ARROW UP: Move to previous suggestion
    } else if (e.key === "ArrowUp") {
      e.preventDefault();                                         // Prevent cursor movement
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1); // -1 means no selection
      
    // ESCAPE: Close suggestions
    } else if (e.key === "Escape") {
      setShowSuggestions(false);                                  // Hide dropdown
      setSelectedSuggestionIndex(-1);                            // Clear selection
    }
  };

  /**
   * SUGGESTION CLICK HANDLER
   * 
   * Handles mouse clicks on suggestion items:
   * 1. Updates search bar with suggestion
   * 2. Hides suggestions dropdown
   * User must then click search or press Enter to proceed
   */
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);                                         // Update query display
    setShowSuggestions(false);                                    // Hide suggestions
    // Note: User must now click search or press Enter to proceed
  };

  /**
   * SUGGESTION TILE CLICK HANDLER
   * 
   * Handles clicks on the quick suggestion tiles below the search bar
   * Updates the query in search bar for user to modify or search
   */
  const handleSuggestionTileClick = (suggestion: string) => {
    setQuery(suggestion);                                         // Update query in search bar
    setShowSuggestions(false);                                    // Hide any open suggestions
    // Note: User must now click search or press Enter to proceed
  };

  const quickSuggestions = [
    "AI-powered lead generation for B2B sales",
    "Automated video editing for short-form content  $5000",
    "AI email assistant for busy professionals",
    "Voice-based AI receptionist for local businesses",
    "Predictive analytics for e-commerce growth under $3000",
    // keep a couple of earlier ideas
    "Content creation tools for marketing",
    "Customer service automation",
  ];

  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(quickSuggestions.length);
  
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
    "AI-powered grammar and style checker under $500",
    "Predictive churn analysis tool for SaaS companies under $4000",
    "AI-powered survey analysis platform above $5000",
    "Automated invoice processing system under $3000",
    "AI-generated blog writing assistant under $1200",
    "Chatbot for appointment booking for salons under $1000",
    "AI customer sentiment analysis tool above $3500",
    "Automated video subtitle generator under $800",
    "AI call summarization tool for sales teams under $1500",
    "Intelligent email spam filter above $2000",
    "AI ad creative generator for Facebook ads under $900",
    "Automated job description writer under $700",
    "AI-powered market research platform above $6000",
    "Predictive lead scoring tool for CRM under $2500",
    "AI content repurposing tool for podcasts under $1200",
    "Automated UX feedback analyzer above $4500",
    "AI code completion assistant for developers under $2000",
    "Intelligent resume builder under $500",
    "AI-powered language translation service under $3000",
    "Automated video testimonial generator under $1500",
    "AI lead enrichment tool for B2B under $1800",
    "Predictive demand forecasting for manufacturing above $8000",
    "AI-powered social listening tool under $2500",
    "Automated academic research summarizer under $1000",
    "AI-based plagiarism detection for writers under $700",
    "Intelligent ad targeting platform above $5000",
    "AI-powered pricing optimization for hotels under $3000",
    "Automated event scheduling assistant under $1200",
    "AI meeting scheduling bot for enterprises above $3500",
    "AI-driven contract review tool for lawyers under $4000",
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

  useEffect(() => {
    const interval = setInterval(() => {
      setSuggestionIndex((i) => (i + 1) % quickSuggestions.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [quickSuggestions.length]);

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

  /**
   * TYPE FILTER TOGGLE FUNCTION
   * 
   * Manages the selection state of content type filters
   * Uses Set data structure for efficient add/remove operations
   * Allows multiple types to be selected simultaneously
   */
  function toggleType(id: string) {
    setSelectedTypes((prev) => {
      const next = new Set(prev);                                 // Create new Set to avoid mutation
      if (next.has(id)) {
        next.delete(id);                                          // Remove if already selected
      } else {
        next.add(id);                                             // Add if not selected
      }
      return next;                                                // Return new Set
    });
  }

  return (
    <div className={`transition-all duration-1500 ease-out ${
      isSearching 
        ? 'max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[70vh]'
        : 'max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[70vh]'
    }`}>
      {/* Centered hero */}
      <div className={`text-center transition-all duration-1000 ease-out ${
        isTransitioning ? 'opacity-0 scale-90 -translate-y-12 pointer-events-none' : 'mb-0 opacity-100 scale-100 translate-y-0'
      }`}>
        <h1 className="text-7xl lg:text-8xl font-bold mb-6 leading-tight" style={{ fontFamily: 'Instrument Serif, serif' }}>
          <span className="text-white">
            Ask, Discover.
          </span>
          <br />
          <span className="inline-flex items-baseline ml-16">
            <span className="text-white">Find the right&nbsp;</span>
            <span className="flicker-text text-white inline-block w-[9ch] text-left align-baseline">
              {flickerWord}
            </span>
          </span>
        </h1>
        <p className="text-3xl italic text-white mb-6 max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: 'Instrument Serif, serif' }}>
          Where your questions meet the world's smartest solutions.
        </p>
      </div>

      {/* Glassmorphism Search Bar */}
      <div className={`transition-all duration-1500 ease-out ${
        isSearching 
          ? 'opacity-0 scale-90 pointer-events-none'
          : 'w-full max-w-4xl mx-auto mb-8 px-2 transform translate-y-0 opacity-100 scale-100'
      }`}>
        <div className={`relative rounded-[28px] border border-white/15 bg-white/5 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.45)] overflow-visible transition-all duration-1500 ease-out ${
          isSearching ? 'transform scale-95' : 'transform scale-100'
        }`} style={{height: '85px'}}>
          {/* Search input area - increased for better centering */}
          <div className="relative px-4 flex items-center" style={{height: '45px'}}>
            {/* Undo button (only show if there's history) */}
            {queryHistory.length > 0 && currentHistoryIndex >= 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      aria-label="Undo prompt enhancement"
                      onClick={handleUndo}
                      className="absolute right-20 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-white/5 border border-white/20 text-white/70 hover:bg-white/10 hover:text-white transition"
                    >
                      <Undo className="h-3 w-3" />
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
                    className="absolute right-12 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-white/5 border border-white/20 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isEnhancing ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3" />
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
            
            {/* Search button */}
            <button
              aria-label="Search"
              onClick={handleSearch}
              disabled={!query.trim() || searchMutation.isPending || isEnhancing}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white/5 border border-white/20 text-white/90 hover:bg-white/10 transition disabled:opacity-50"
              data-testid="search-button"
            >
              {searchMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </button>

            {/* Input */}
            <Input
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => query.trim().length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              disabled={isEnhancing}
              className="h-10 w-full border-0 bg-transparent shadow-none text-lg placeholder:text-white/70 text-white focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none pr-20 flex items-center disabled:opacity-70"
              data-testid="search-input"
            />
          </div>

          {/* Bottom row - Icons - reduced by 20% */}
          <div className="relative border-t border-white/10 px-4 py-2" style={{height: '40px'}}>
            <div className="flex items-center justify-between">
              {/* Left - Brain icon with dropdown and selected model */}
              <div className="relative flex items-center space-x-2">
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowModelDropdown(!showModelDropdown);
                    }}
                    className={`flex h-6 w-6 items-center justify-center hover:text-white/80 transition-colors rounded-full border border-white/20 bg-white/5 ${
                      selectedModel && selectedModel !== "GPT-4o Mini" ? 'text-yellow-400' : 'text-white'
                    }`}
                  >
                    <Brain className="h-3 w-3" />
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
                
                <span className="text-xs text-white/70">{selectedModel || "GPT-4o Mini"}</span>
              </div>

              {/* Right - Filter buttons */}
              <div className="flex items-center gap-2.5">
                <TooltipProvider>
                  {/* Company */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className={
                          `h-6 w-6 rounded-full border backdrop-blur-md flex items-center justify-center transition hover:bg-white/10 ` +
                          (selectedTypes.has('company')
                            ? 'bg-yellow-500/10 border-yellow-400/40 text-yellow-300'
                            : 'bg-white/5 border-white/20 text-white/90')
                        }
                        aria-label="Company"
                        onClick={() => toggleType('company')}
                      >
                        <Building2 className="h-3 w-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Company</TooltipContent>
                  </Tooltip>
                  {/* Freelancer */}
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
                  {/* Product */}
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
            {filteredSuggestions.length === 0 && query.trim().length > 0 && (
              <div className="px-4 py-3 text-white/60 text-sm">
                No suggestions found for "{query}"
              </div>
            )}
          </div>
        )}
        
        {/* Enhancement feedback */}
        {isEnhancing && (
          <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg backdrop-blur-sm">
            <div className="flex items-center gap-2 text-blue-300 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Enhancing your search prompt...</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Suggestions */}
      <div className={`flex flex-wrap justify-center gap-2 mt-2 transition-all duration-1000 ease-out ${
        isTransitioning ? 'opacity-0 scale-90 -translate-y-12 pointer-events-none' : 'opacity-100 scale-100 translate-y-0'
      }`}>
        {visibleSuggestions.map((suggestion, index) => (
          <AnimatedButton
            key={index}
            variant="ghost"
            size="sm"
            onClick={() => handleSuggestionTileClick(suggestion)}
            className="text-xs rounded-md px-3 py-1 border-white/30 bg-white/5 hover:border-white/60 hover:bg-white/10 backdrop-blur-sm"
            data-testid={`suggestion-${index}`}
            icon={<Sparkles className="w-3 h-3" />}
          >
            {suggestion}
          </AnimatedButton>
        ))}
        {hasMoreSuggestions && (
          <AnimatedButton
            variant="gradient"
            size="sm"
            onClick={handleShowMore}
            className="text-xs rounded-md px-3 py-1"
          >
            See more
          </AnimatedButton>
        )}
        {visibleCount > quickSuggestions.length && (
          <AnimatedButton
            variant="secondary"
            size="sm"
            onClick={handleShowLess}
            className="text-xs rounded-md px-3 py-1"
          >
            See less
          </AnimatedButton>
        )}
      </div>
      
      {/* Loading State - Centered on page */}
      {isSearching && (
        <div className="fixed inset-0 flex flex-col items-center justify-center z-30 animate-fade-in">
          <div className="relative mb-8">
            <LoadingSpinner variant="orbit" size="lg" />
          </div>
          <div className="text-center">
            <p className="text-white text-2xl font-semibold mb-3">Searching for "{query}"...</p>
            <p className="text-white/70 text-lg mb-6">Finding the best AI solutions for you</p>
            <div className="flex items-center justify-center space-x-2">
              <LoadingSpinner variant="dots" size="sm" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}