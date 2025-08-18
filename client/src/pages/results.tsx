/* File Overview
  Path: client/src/pages/results.tsx
  Purpose: A top-level page component rendered based on the current route.

  Reading tip for newcomers:
  - Scan the exports at the bottom to see what the rest of the app imports from here
  - Follow the data flow via function parameters and return values
*/

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Star, Package, Building, UserCheck, Lightbulb as Solution, Sparkles, Clock, ArrowRight, Lightbulb, Copy, Edit, Wrench, Building2, User, Brain, ChevronDown, LogOut, Mic, MicOff, PanelLeftClose, PanelLeftOpen, DollarSign, Target, Loader2, Undo } from "lucide-react";
import { QuantizeLogo } from "@/components/quantize-logo";
import { UserLogo } from "@/components/user-logo";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyCards } from "@/components/company-cards";
import { FreelancerCards } from "@/components/freelancer-cards";
import { ProductCards } from "@/components/product-cards";
import { ProductToolCards } from "@/components/product-tool-cards";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { useFavorites } from "@/contexts/favorites-context";
import { useConversations } from "@/contexts/conversation-context";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { ConversationSidebar } from "@/components/conversation-sidebar";
import { NewConversationState } from "@/components/new-conversation-state";
import { FavoritesNotification } from "@/components/favorites-notification";
import { NotificationProvider } from "@/contexts/notification-context";
import { enhancePrompt } from "@/lib/promptEnhancer";
import { useToast } from "@/hooks/use-toast";

// Mock search results - in real app this would come from API
const mockSearchResults = [
  {
    id: 1,
    name: "OpenAI GPT-4",
    description: "Advanced AI language model for enterprise applications. GPT-4 is OpenAI's most advanced system, producing safer and more useful responses.",
    category: "AI/ML",
    pricing: "$0.03 per 1K tokens",
    rating: 4.8,
    reviews: 1247,
    growth: "+45%",
    engagement: 92,
    logo: "🤖",
    color: "bg-blue-500",
    url: "https://openai.com"
  },
  {
    id: 2,
    name: "Anthropic Claude Pro",
    description: "Constitutional AI assistant for business use. Claude helps with writing, analysis, math, coding, and more.",
    category: "AI/ML",
    pricing: "$20/month",
    rating: 4.7,
    reviews: 892,
    growth: "+38%",
    engagement: 88,
    logo: "🧠",
    color: "bg-purple-500",
    url: "https://anthropic.com"
  },
  {
    id: 3,
    name: "Midjourney AI",
    description: "Create stunning visuals with AI-powered art generation. Transform your ideas into beautiful images with advanced AI technology.",
    category: "Creative",
    pricing: "$10/month",
    rating: 4.9,
    reviews: 2156,
    growth: "+67%",
    engagement: 95,
    logo: "🎨",
    color: "bg-pink-500",
    url: "https://midjourney.com"
  }
];

// Mock similar products data
const mockSimilarProducts = [
  {
    id: 101,
    name: "Jasper AI",
    category: "AI/ML",
    pricing: "$39/month",
    rating: 4.6,
    logo: "✍️",
    color: "bg-purple-500",
    url: "https://jasper.ai"
  },
  {
    id: 102,
    name: "Copy.ai",
    category: "AI/ML",
    pricing: "$36/month",
    rating: 4.5,
    logo: "📝",
    color: "bg-blue-600",
    url: "https://copy.ai"
  }
];

interface Company {
  name: string;
  description: string;
  features: string[];
  pricing: string;
  website: string;
  category: string;
}

interface SearchResult {
  query: string;
  aiResponse?: string;
  suggestions?: string[];
  companies?: Company[];
  citations?: Array<{id: number, title: string, url: string}>;
  traditionalResults?: any[];
  aiPowered?: boolean;
  timestamp: number;
}

interface ContentItem {
  id: string;
  type: 'result' | 'suggestions' | 'selected-question' | 'loading';
  data: any;
}

export default function ResultsPage() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { currentUser, signOut } = useFirebaseAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [placeholder, setPlaceholder] = useState("");
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [selectedModel, setSelectedModel] = useState("GPT-4o Mini");
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const { pinnedCards } = useFavorites();
  const { createNewConversation, addMessageToConversation, loadConversation, currentConversation } = useConversations();
  const { isListening, transcript, startListening, stopListening, resetTranscript } = useVoiceInput();
  const [showSidebar, setShowSidebar] = useState(true);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [favoritesNotification, setFavoritesNotification] = useState({ show: false, itemName: '' });
  const [selectedBudgets, setSelectedBudgets] = useState<Set<string>>(new Set());
  const [showBudgetSelection, setShowBudgetSelection] = useState(false);
  const [showUseCaseSelection, setShowUseCaseSelection] = useState(false);
  const [useCaseInput, setUseCaseInput] = useState('');
  const [isLoadingBudgetResults, setIsLoadingBudgetResults] = useState(false);
  
  // PROMPT ENHANCEMENT STATE
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  
  // Toast notifications
  const { toast } = useToast();
  
  // Update search query when voice transcript changes
  useEffect(() => {
    if (transcript) {
      setSearchQuery(transcript);
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

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

  const budgetOptions = [
    "Free",
    "<$10",
    "<$50",
    "<$100",
    "<$250",
    "<$500",
    "<$1000",
    "<$2500",
    "<$5000",
    "Enterprise"
  ];

  /**
   * PROMPT ENHANCEMENT HANDLER
   */
  const handlePromptEnhancement = async () => {
    if (!searchQuery.trim() || isEnhancing) return;
    
    setIsEnhancing(true);
    
    try {
      const originalQuery = searchQuery;
      const enhancedQuery = await enhancePrompt(searchQuery, {
        role: currentUser?.displayName,
        industry: user?.industry,
        companySize: user?.company?.size
      });
      
      setQueryHistory(prev => [...prev, originalQuery]);
      setCurrentHistoryIndex(queryHistory.length);
      setSearchQuery(enhancedQuery);
      
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
      setSearchQuery(previousQuery);
      setCurrentHistoryIndex(prev => prev - 1);
      toast({
        title: "Prompt reverted",
        description: "Restored to original query.",
      });
    }
  };



  // Function to check if query contains budget/cost information
  const hasBudgetInQuery = (query: string) => {
    const budgetKeywords = /\$|budget|cost|price|pricing|cheap|expensive|free|paid|subscription|monthly|yearly|annual/i;
    return budgetKeywords.test(query);
  };

  // Function to check if query is generalized (no specific domain/niche)
  const isGeneralizedQuery = (query: string) => {
    const specificKeywords = /\b(for|in|healthcare|finance|education|ecommerce|retail|marketing|sales|hr|legal|real estate|construction|manufacturing|logistics|travel|hospitality|gaming|entertainment|social media|crm|erp|accounting|project management|customer service|inventory|supply chain|analytics|reporting|dashboard|automation|workflow|integration|api|mobile app|web app|saas|platform|enterprise|startup|small business|freelancer|agency|consultant)\b/i;
    return !specificKeywords.test(query);
  };

  // Typewriter effect for placeholder
  const placeholderPhrases = [
    "Ask a follow-up or a new question...",
    "Look for the right product",
    "What are you looking for?",
    "Connect with the right startup",
    "Hire the perfect freelancer"
  ];

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

  // Type filter toggle function
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

  // Get search query from URL params and perform initial search
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';
    const types = params.get('types');
    
    setSearchQuery(query);
    
    // Restore selected types from URL
    if (types) {
      const typesArray = types.split(',').filter(t => t.trim());
      const newSelectedTypes = new Set(typesArray);
      setSelectedTypes(newSelectedTypes);
      console.log('Restored types from URL:', typesArray, 'Set size:', newSelectedTypes.size);
    } else {
      setSelectedTypes(new Set());
    }
    
    if (query) {
      // Create new conversation for initial search
      const conversationId = createNewConversation(query);
      setCurrentConversationId(conversationId);
      setShowNewConversation(false);
      
      // Small delay to ensure selectedTypes is set before search
      setTimeout(() => {
        performInitialSearch(query, conversationId);
      }, 100);
    }
  }, [location]);

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

  const performInitialSearch = async (query: string, conversationId?: string) => {
    setIsInitialLoading(true);
    setContentItems([]);

    // Add loading item
    setContentItems([{
      id: `loading-${Date.now()}`,
      type: 'loading',
      data: { query }
    }]);

    // Get current selectedTypes from URL if not set in state yet
    const params = new URLSearchParams(window.location.search);
    const types = params.get('types');
    const currentSelectedTypes = types ? types.split(',').filter(t => t.trim()) : Array.from(selectedTypes);
    
    console.log('Performing search with types:', currentSelectedTypes);

    try {
      const response = await apiRequest("POST", "/api/search", {
        query,
        context: {},
        selectedModel,
        selectedTypes: currentSelectedTypes
      });
      
      const data = await response.json();
      
      const newCompanies = data.companies || [];
      // For initial search, show all companies
      const updatedAllCompanies = newCompanies;
      setAllCompanies(updatedAllCompanies);

      const result: SearchResult = {
        query,
        aiResponse: data.aiResponse,
        suggestions: data.suggestions || [],
        companies: updatedAllCompanies,
        citations: data.citations || [],
        traditionalResults: data.traditionalResults || data.results || [],
        aiPowered: data.aiPowered,
        timestamp: Date.now()
      };

      // Check if budget and use case selection should be shown
      const shouldShowBudgetSelection = !hasBudgetInQuery(query);
      const shouldShowUseCaseSelection = !hasBudgetInQuery(query) && isGeneralizedQuery(query);
      setShowBudgetSelection(shouldShowBudgetSelection);
      setShowUseCaseSelection(shouldShowUseCaseSelection);
      
      // If budget selection is shown, clear companies initially to force budget selection
      if (shouldShowBudgetSelection) {
        setAllCompanies([]);
      }

      // Replace loading with result only (suggestions are now inside the result box)
      setContentItems([
        {
          id: `result-${Date.now()}`,
          type: 'result',
          data: result
        }
      ]);
      
      // Add to conversation history
      if (conversationId || currentConversationId) {
        const msgId = conversationId || currentConversationId;
        if (msgId) {
          addMessageToConversation(msgId, {
            id: `msg-${Date.now()}`,
            type: 'response',
            content: data.aiResponse,
            timestamp: Date.now(),
            aiResponse: data.aiResponse,
            suggestions: data.suggestions,
            companies: updatedAllCompanies
          });
        }
      }
    } catch (error) {
      console.error('Search failed:', error);
      // Fallback to mock data
      const filteredResults = mockSearchResults.filter(result => 
        result.name.toLowerCase().includes(query.toLowerCase()) ||
        result.description.toLowerCase().includes(query.toLowerCase()) ||
        result.category.toLowerCase().includes(query.toLowerCase())
      );
      
      const fallbackResult: SearchResult = {
        query,
        aiResponse: "AI search is currently unavailable. Showing traditional search results.",
        suggestions: [
          `Best alternatives for ${query}`,
          `Free tools for ${query}`,
          `Enterprise solutions for ${query}`,
          `Open source ${query} tools`,
          `Getting started with ${query}`
        ],
        companies: [],
        citations: [],
        traditionalResults: filteredResults,
        aiPowered: false,
        timestamp: Date.now()
      };

      setContentItems([
        {
          id: `result-${Date.now()}`,
          type: 'result',
          data: fallbackResult
        }
      ]);
      
      // Add to conversation history
      if (conversationId || currentConversationId) {
        const msgId = conversationId || currentConversationId;
        if (msgId) {
          addMessageToConversation(msgId, {
            id: `msg-${Date.now()}`,
            type: 'response',
            content: fallbackResult.aiResponse,
            timestamp: Date.now(),
            aiResponse: fallbackResult.aiResponse,
            suggestions: fallbackResult.suggestions,
            companies: []
          });
        }
      }
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleSuggestionClick = async (question: string) => {
    // Replace current suggestions with selected question
    setContentItems(prev => {
      const newItems = [...prev];
      const lastIndex = newItems.length - 1;
      if (newItems[lastIndex]?.type === 'suggestions') {
        newItems[lastIndex] = {
          id: `selected-${Date.now()}`,
          type: 'selected-question',
          data: { question }
        };
      }
      return newItems;
    });

    // Add loading
    setContentItems(prev => [...prev, {
      id: `loading-${Date.now()}`,
      type: 'loading',
      data: { query: question }
    }]);

    try {
      const response = await apiRequest("POST", "/api/search", {
        query: question,
        context: {},
        selectedModel,
        selectedTypes: Array.from(selectedTypes)
      });
      
      const data = await response.json();
      
      const newCompanies = data.companies || [];
      // For subsequent searches, show pinned cards + new results
      const pinnedCompanies = pinnedCards.filter(pin => 
        !newCompanies.some((newCompany: Company) => newCompany.name === pin.name)
      );
      const updatedAllCompanies = [...pinnedCompanies, ...newCompanies];
      setAllCompanies(updatedAllCompanies);

      const result: SearchResult = {
        query: question,
        aiResponse: data.aiResponse,
        suggestions: data.suggestions || [],
        companies: updatedAllCompanies,
        citations: data.citations || [],
        traditionalResults: data.traditionalResults || data.results || [],
        aiPowered: data.aiPowered,
        timestamp: Date.now()
      };

      // Replace loading with result only
      setContentItems(prev => {
        const newItems = [...prev];
        const lastIndex = newItems.length - 1;
        if (newItems[lastIndex]?.type === 'loading') {
          newItems[lastIndex] = {
            id: `result-${Date.now()}`,
            type: 'result',
            data: result
          };
        }
        return newItems;
      });

      // Scroll to new result
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);

    } catch (error) {
      console.error('Search failed:', error);
      // Handle error with fallback
      const fallbackResult: SearchResult = {
        query: question,
        aiResponse: "AI search is currently unavailable. Please try again.",
        suggestions: [],
        companies: [],
        citations: [],
        traditionalResults: [],
        aiPowered: false,
        timestamp: Date.now()
      };

      setContentItems(prev => {
        const newItems = [...prev];
        const lastIndex = newItems.length - 1;
        if (newItems[lastIndex]?.type === 'loading') {
          newItems[lastIndex] = {
            id: `result-${Date.now()}`,
            type: 'result',
            data: fallbackResult
          };
        }
        newItems.push({
          id: `suggestions-${Date.now()}`,
          type: 'suggestions',
          data: { questions: fallbackResult.suggestions || [] }
        });
        return newItems;
      });
    }
  };

  const handleNewSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery;
    setSearchQuery("");

    // Create new conversation for new search
    const conversationId = createNewConversation(query);
    setCurrentConversationId(conversationId);
    setShowNewConversation(false);

    // Replace current suggestions with selected question (if exists)
    setContentItems(prev => {
      const newItems = [...prev];
      const lastIndex = newItems.length - 1;
      if (newItems[lastIndex]?.type === 'suggestions') {
        newItems[lastIndex] = {
          id: `selected-${Date.now()}`,
          type: 'selected-question',
          data: { question: query }
        };
      }
      return newItems;
    });

    // Add loading
    setContentItems(prev => [...prev, {
      id: `loading-${Date.now()}`,
      type: 'loading',
      data: { query }
    }]);
    
    // Add query to conversation
    addMessageToConversation(conversationId, {
      id: `msg-${Date.now()}`,
      type: 'query',
      content: query,
      timestamp: Date.now()
    });

    try {
      const response = await apiRequest("POST", "/api/search", {
        query,
        context: {},
        selectedModel,
        selectedTypes: Array.from(selectedTypes)
      });
      
      const data = await response.json();
      
      const newCompanies = data.companies || [];
      // For new searches, show pinned cards + new results
      const pinnedCompanies = pinnedCards.filter(pin => 
        !newCompanies.some((newCompany: Company) => newCompany.name === pin.name)
      );
      const updatedAllCompanies = [...pinnedCompanies, ...newCompanies];
      setAllCompanies(updatedAllCompanies);

      const result: SearchResult = {
        query,
        aiResponse: data.aiResponse,
        suggestions: data.suggestions || [],
        companies: updatedAllCompanies,
        citations: data.citations || [],
        traditionalResults: data.traditionalResults || data.results || [],
        aiPowered: data.aiPowered,
        timestamp: Date.now()
      };

      // Replace loading with result only
      setContentItems(prev => {
        const newItems = [...prev];
        const lastIndex = newItems.length - 1;
        if (newItems[lastIndex]?.type === 'loading') {
          newItems[lastIndex] = {
            id: `result-${Date.now()}`,
            type: 'result',
            data: result
          };
        }
        return newItems;
      });
      
      // Add response to conversation
      if (currentConversationId) {
        addMessageToConversation(currentConversationId, {
          id: `msg-${Date.now()}`,
          type: 'response',
          content: data.aiResponse,
          timestamp: Date.now(),
          aiResponse: data.aiResponse,
          suggestions: data.suggestions,
          companies: updatedAllCompanies
        });
      }

    } catch (error) {
      console.error('Search failed:', error);
      // Handle error with fallback
      const fallbackResult: SearchResult = {
        query,
        aiResponse: "AI search is currently unavailable. Please try again.",
        suggestions: [],
        companies: [],
        citations: [],
        traditionalResults: [],
        aiPowered: false,
        timestamp: Date.now()
      };

      setContentItems(prev => {
        const newItems = [...prev];
        const lastIndex = newItems.length - 1;
        if (newItems[lastIndex]?.type === 'loading') {
          newItems[lastIndex] = {
            id: `result-${Date.now()}`,
            type: 'result',
            data: fallbackResult
          };
        }
        newItems.push({
          id: `suggestions-${Date.now()}`,
          type: 'suggestions',
          data: { questions: fallbackResult.suggestions || [] }
        });
        return newItems;
      });
      
      // Add error response to conversation
      if (currentConversationId) {
        addMessageToConversation(currentConversationId, {
          id: `msg-${Date.now()}`,
          type: 'response',
          content: fallbackResult.aiResponse,
          timestamp: Date.now(),
          aiResponse: fallbackResult.aiResponse,
          suggestions: [],
          companies: []
        });
      }
    }
  };

  // Loading screen with skeleton
  if (isInitialLoading) {
    return (
      <div className="min-h-screen pb-32">
        <div className="px-8 py-4">
          <div className="space-y-6">
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="flex items-start space-x-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="w-32 h-6" />
                  <Skeleton className="w-full h-4" />
                  <Skeleton className="w-full h-4" />
                  <Skeleton className="w-3/4 h-4" />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="w-full h-24 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }



  // Get user's first name
  const firstName = currentUser?.displayName?.split(' ')[0] || 
                   currentUser?.email?.split('@')[0] || 
                   user?.name?.split(' ')[0] || 
                   'User';

  const handleLogout = async () => {
    try {
      await signOut();
      logout();
      setLocation('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleNewConversation = () => {
    setShowNewConversation(true);
    setContentItems([]);
    setAllCompanies([]);
    setCurrentConversationId(null);
    setSelectedBudgets(new Set());
    setShowBudgetSelection(false);
    setShowUseCaseSelection(false);
    setUseCaseInput('');
    setIsLoadingBudgetResults(false);
  };

  const updateResultsWithFilters = async () => {
    if (selectedBudgets.size === 0) {
      // Get original companies from the last result if no budget selected
      const lastResult = contentItems.find(item => item.type === 'result');
      if (lastResult && lastResult.data.companies) {
        setAllCompanies(lastResult.data.companies);
      } else {
        setAllCompanies([]);
      }
      setIsLoadingBudgetResults(false);
      return;
    }
    
    setIsLoadingBudgetResults(true);
    
    const lastResult = contentItems.find(item => item.type === 'result');
    if (!lastResult) {
      setIsLoadingBudgetResults(false);
      return;
    }
    
    let query = lastResult.data.query;
    const context: any = { budgets: Array.from(selectedBudgets) };
    
    // Add use case if provided
    if (useCaseInput.trim()) {
      query = `${useCaseInput.trim()} ${query}`;
      context.useCase = useCaseInput.trim();
    }
    
    // Add budget
    const budgetList = Array.from(selectedBudgets).join(', ');
    query += ` budget ${budgetList}`;
    
    try {
      const response = await apiRequest("POST", "/api/search", {
        query,
        context,
        selectedModel,
        selectedTypes: Array.from(selectedTypes)
      });
      
      const data = await response.json();
      const newCompanies = data.companies || [];
      const pinnedCompanies = pinnedCards.filter(pin => 
        !newCompanies.some((newCompany: Company) => newCompany.name === pin.name)
      );
      const updatedAllCompanies = [...pinnedCompanies, ...newCompanies];
      setAllCompanies(updatedAllCompanies);
      
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoadingBudgetResults(false);
    }
  };

  const handleBudgetSelect = async (budget: string) => {
    const newSelectedBudgets = new Set(selectedBudgets);
    if (newSelectedBudgets.has(budget)) {
      newSelectedBudgets.delete(budget);
    } else {
      newSelectedBudgets.add(budget);
    }
    setSelectedBudgets(newSelectedBudgets);
    
    // Update results after state change
    setTimeout(() => updateResultsWithFilters(), 0);
  };

  const handleUseCaseChange = (value: string) => {
    setUseCaseInput(value);
    // Update results if budget is already selected
    if (selectedBudgets.size > 0) {
      setTimeout(() => updateResultsWithFilters(), 300); // Debounce
    }
  };

  const showFavoritesNotification = (itemName: string) => {
    setFavoritesNotification({ show: true, itemName });
  };

  const hideFavoritesNotification = () => {
    setFavoritesNotification({ show: false, itemName: '' });
  };

  const handleSelectConversation = (conversationId: string) => {
    loadConversation(conversationId);
    setCurrentConversationId(conversationId);
    
    // Load conversation messages into content items
    const conversation = currentConversation;
    if (conversation) {
      const items = conversation.messages.map((msg, index) => {
        if (msg.type === 'response') {
          return {
            id: `result-${msg.id}`,
            type: 'result' as const,
            data: {
              query: conversation.messages[index - 1]?.content || conversation.query,
              aiResponse: msg.aiResponse,
              suggestions: msg.suggestions || [],
              companies: msg.companies || [],
              traditionalResults: [],
              aiPowered: true,
              timestamp: msg.timestamp
            }
          };
        }
        return null;
      }).filter(Boolean);
      
      setContentItems(items as any[]);
    }
  };

  return (
    <div className="min-h-screen pb-32">
      {/* Fixed Sidebar */}
      {showSidebar && (
        <ConversationSidebar 
          onNewConversation={handleNewConversation}
          onSelectConversation={handleSelectConversation}
          isMinimized={sidebarMinimized}
        />
      )}

      {/* Main Content */}
      <div className={`px-8 py-1 transition-all duration-300 ${showSidebar ? (sidebarMinimized ? 'ml-12' : 'ml-80') : 'ml-0'}`}>
        <NotificationProvider showFavoritesNotification={showFavoritesNotification}>
        <div className="space-y-4">
          {contentItems.map((item) => (
            <div key={item.id}>
              {/* Result Box */}
              {item.type === 'result' && (
                <div className="bg-black/40 backdrop-blur-xl p-6 border border-white/10 shadow-2xl relative group" style={{
                  minHeight: 'auto',
                  height: 'auto'
                }}>
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <QuantizeLogo size={24} />
                      <h3 className="text-lg font-semibold text-white">Quantize</h3>
                    </div>
                    <div className="flex-1 h-full">
                      <div className="flex items-center space-x-2 mb-2">
                        {item.data.aiPowered && (
                          <div className="flex items-center space-x-1 px-2 py-1 bg-green-500/20 rounded-full">
                            <Sparkles className="w-3 h-3 text-green-400" />
                            <span className="text-xs text-green-400 font-medium">AI Powered</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-white/60 mb-3 font-medium">Q: "{item.data.query}"</p>
                      <div className="prose prose-invert max-w-none">
                        <div className="text-white/90 leading-relaxed mb-6">
                          {(() => {
                            const response = item.data.aiResponse || '';
                            const citations = item.data.citations || [];
                            const parts = response.split(/(\[\d+\])/);
                            
                            return parts.map((part, index) => {
                              // Check if this part is a citation like [1], [2], etc.
                              const citationMatch = part.match(/^\[(\d+)\]$/);
                              if (citationMatch) {
                                const citationNum = parseInt(citationMatch[1]);
                                // Find the corresponding citation
                                const citation = citations.find(c => c.id === citationNum);
                                if (citation) {
                                  return (
                                    <a 
                                      key={index}
                                      href={citation.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        window.open(citation.url, '_blank', 'noopener,noreferrer');
                                      }}
                                      className="text-blue-400 hover:text-blue-300 underline font-medium cursor-pointer"
                                      title={citation.title}
                                      style={{ color: '#60a5fa' }}
                                    >
                                      [{citationNum}]
                                    </a>
                                  );
                                }
                                return (
                                  <span key={index} className="text-blue-400" style={{ color: '#60a5fa' }}>
                                    [{citationNum}]
                                  </span>
                                );
                              }
                              return <span key={index}>{part}</span>;
                            });
                          })()
                        }</div>
                        
                        {/* Related Questions inside the same box */}
                        {item.data.suggestions && item.data.suggestions.length > 0 && (
                          <div className="border-t border-white/10 pt-4">
                            <h4 className="text-white/80 text-sm font-medium mb-3">Related Questions:</h4>
                            <div className="space-y-2">
                              {item.data.suggestions.map((question, qIndex) => (
                                <button
                                  key={qIndex}
                                  onClick={() => handleSuggestionClick(question)}
                                  className="w-full text-left p-2 rounded hover:bg-white/5 transition-all group flex items-center justify-between"
                                >
                                  <span className="text-white/70 text-sm group-hover:text-white transition-colors">
                                    {question}
                                  </span>
                                  <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Copy Button for Answer */}
                      <button
                        onClick={() => navigator.clipboard.writeText(item.data.aiResponse?.replace(/\[\d+\]/g, '') || '')}
                        className="absolute bottom-4 right-4 p-2 bg-white/10 hover:bg-white/20 border border-white/20 transition-all opacity-0 group-hover:opacity-100"
                        title="Copy answer"
                      >
                        <Copy className="w-4 h-4 text-white/70" />
                      </button>
                    </div>
                  </div>





                  {/* Traditional Results */}
                  {item.data.traditionalResults && item.data.traditionalResults.length > 0 && (
                    <div className="mt-6 space-y-4">
                      <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
                        <Package className="w-5 h-5" />
                        <span>Related Tools & Startups</span>
                      </h4>
                      <div className="grid gap-4">
                        {item.data.traditionalResults.slice(0, 3).map((tool) => (
                          <div key={tool.id} className="bg-white/5 backdrop-blur-sm p-4 border border-white/10 hover:border-white/20 transition-all">
                            <div className="flex items-start space-x-3">
                              <div className={`w-10 h-10 ${tool.color} rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0`}>
                                {tool.logo}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="text-white font-medium mb-1">{tool.name}</h5>
                                <p className="text-white/70 text-sm mb-2 line-clamp-2">{tool.description}</p>
                                <div className="flex items-center space-x-4 text-xs text-white/60">
                                  <span>{tool.pricing}</span>
                                  <div className="flex items-center space-x-1">
                                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                    <span>{tool.rating}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Selected Question */}
              {item.type === 'selected-question' && (
                <div className="bg-black/20 backdrop-blur-xl p-4 border border-white/10 relative group">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-white/80 font-medium">
                      {item.data.question}
                    </span>
                  </div>
                  
                  {/* Copy button for Selected Question */}
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => navigator.clipboard.writeText(item.data.question)}
                      className="p-1.5 bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
                      title="Copy question"
                    >
                      <Copy className="w-3 h-3 text-white/70" />
                    </button>
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {item.type === 'suggestions' && item.data.questions.length > 0 && (
                <div className="space-y-0">
                  <div className="grid grid-cols-1">
                    {item.data.questions.map((question, index) => (
                      <div key={index} className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-lg relative group border-t-0 first:border-t">
                        <button
                          onClick={() => handleSuggestionClick(question)}
                          className="text-left p-4 w-full hover:border-white/20 transition-all"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                              {question}
                            </span>
                            <ArrowRight className="w-4 h-4 text-white/40 ml-auto group-hover:text-white transition-colors" />
                          </div>
                        </button>
                        
                        {/* Copy button for Questions */}
                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(question);
                            }}
                            className="p-1.5 bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
                            title="Copy question"
                          >
                            <Copy className="w-3 h-3 text-white/70" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  

                </div>
              )}

              {/* Loading Spinner */}
              {item.type === 'loading' && (
                <div className="bg-black/40 backdrop-blur-xl p-6 border border-white/10 shadow-2xl animate-pulse">
                  <div className="flex items-start space-x-4">
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <QuantizeLogo size={24} />
                      <h3 className="text-lg font-semibold text-white">Quantize Searching...</h3>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex items-center space-x-1 px-2 py-1 bg-blue-500/20 rounded-full">
                          <Sparkles className="w-3 h-3 text-blue-400" />
                          <span className="text-xs text-blue-400 font-medium">AI Processing</span>
                        </div>
                      </div>
                      <p className="text-sm text-white/60 mb-3">Q: "{item.data.query}"</p>
                      <p className="text-sm text-white/60 mb-3">Searching the web and finding the best AI solutions for your query...</p>
                      <div className="space-y-2">
                        <div className="h-4 bg-white/10 rounded animate-pulse"></div>
                        <div className="h-4 bg-white/10 rounded animate-pulse w-3/4"></div>
                        <div className="h-4 bg-white/10 rounded animate-pulse w-1/2"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* No Results - Show welcome message when no content */}
          {contentItems.length === 0 && !isInitialLoading && !showNewConversation && (
            <NewConversationState firstName={firstName} />
          )}
          

        </div>
        
        {/* Use Case Selection - Show only for generalized queries */}
        {showUseCaseSelection && (
          <div className="bg-black/20 backdrop-blur-xl p-4 border border-white/10">
            <div className="flex items-center space-x-2 mb-3">
              <Target className="w-4 h-4 text-white/60" />
              <h3 className="text-white/80 text-sm font-medium">Specify domain/niche/use case (optional):</h3>
            </div>
            <input
              type="text"
              placeholder="e.g., healthcare, e-commerce, customer service, marketing..."
              value={useCaseInput}
              onChange={(e) => handleUseCaseChange(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white placeholder:text-white/50 text-sm rounded-lg focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all"
            />
          </div>
        )}
        
        {/* Budget Selection - Show only if no budget in query */}
        {showBudgetSelection && (
          <div className={`bg-black/20 backdrop-blur-xl p-4 border border-white/10 ${showUseCaseSelection ? 'border-t-0' : ''}`}>
            <div className="flex items-center space-x-2 mb-3">
              <DollarSign className="w-4 h-4 text-white/60" />
              <h3 className="text-white/80 text-sm font-medium">Select your budget range:</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {budgetOptions.map((budget) => (
                <button
                  key={budget}
                  onClick={() => handleBudgetSelect(budget)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                    selectedBudgets.has(budget)
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 border-yellow-400/60 text-black shadow-lg shadow-yellow-400/30'
                      : 'bg-white/5 border border-white/20 text-white/80 hover:bg-white/10 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {budget}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Loading Circle for Budget Results */}
        {isLoadingBudgetResults && (
          <div className="bg-black/20 backdrop-blur-xl p-6 border border-white/10 border-t-0 flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/20 border-t-white/80"></div>
              <span className="text-white/70 text-sm">Finding tools within your budget...</span>
            </div>
          </div>
        )}
        
        {/* Cards - Show below all content */}
        {allCompanies.length > 0 && (selectedBudgets.size > 0 || !showBudgetSelection) && (() => {
          // Show appropriate cards based on selected types
          const params = new URLSearchParams(window.location.search);
          const urlTypes = params.get('types');
          const currentTypes = urlTypes ? new Set(urlTypes.split(',').filter(t => t.trim())) : selectedTypes;
          
          if (currentTypes.has('product') && currentTypes.size === 1) {
            return <ProductCards products={allCompanies} />;
          } else if (currentTypes.has('company') && currentTypes.size === 1) {
            return <CompanyCards companies={allCompanies} />;
          } else if (currentTypes.has('freelancer') && currentTypes.size === 1) {
            return <FreelancerCards freelancers={allCompanies} />;
          } else {
            // Show company cards + product tool cards when no specific type is selected
            const companies = allCompanies.slice(0, 5);
            const products = allCompanies.slice(5, 15).map(companyItem => ({
              name: companyItem.name,
              description: companyItem.description,
              pricing: companyItem.pricing,
              website: companyItem.website
            }));
            return (
              <div className="mt-6">
                <CompanyCards companies={companies} />
                <ProductToolCards products={products} />
              </div>
            );
          }
        })()}
        </NotificationProvider>
      </div>
      
      {/* Favorites Notification */}
      <FavoritesNotification 
        show={favoritesNotification.show}
        itemName={favoritesNotification.itemName}
        onClose={hideFavoritesNotification}
      />

      {/* Fixed Search Bar at Bottom */}
      <div className={`fixed bottom-0 right-0 bg-background/95 backdrop-blur-md border-t border-white/20 p-4 z-50 transition-all duration-300 ${showSidebar ? (sidebarMinimized ? 'left-12' : 'left-80') : 'left-0'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-[28px] border border-white/15 bg-white/5 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.45)] overflow-visible" style={{height: '85px'}}>
            {/* Enhancement feedback */}
            {isEnhancing && (
              <div className="absolute bottom-full left-0 right-0 mb-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg backdrop-blur-sm">
                <div className="flex items-center gap-2 text-blue-300 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enhancing your search prompt...</span>
                </div>
              </div>
            )}
            {/* Search input area - increased for better centering */}
            <div className="relative px-4 flex items-center" style={{height: '45px'}}>
              {/* Enhancement, Voice and Search buttons */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                {/* Undo button */}
                {queryHistory.length > 0 && currentHistoryIndex >= 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          aria-label="Undo prompt enhancement"
                          onClick={handleUndo}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 border border-white/20 text-white/70 hover:bg-white/10 hover:text-white transition"
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
                        disabled={!searchQuery.trim() || isEnhancing}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 border border-white/20 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                
                <button
                  aria-label={isListening ? "Stop listening" : "Start voice input"}
                  onClick={isListening ? stopListening : startListening}
                  className={`flex h-7 w-7 items-center justify-center rounded-full border transition ${
                    isListening 
                      ? 'bg-red-500/20 border-red-400/40 text-red-400' 
                      : 'bg-white/5 border-white/20 text-white/90 hover:bg-white/10'
                  }`}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
                <button
                  aria-label="Search"
                  onClick={() => handleNewSearch({ preventDefault: () => {} } as React.FormEvent)}
                  disabled={!searchQuery.trim() || isEnhancing}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 border border-white/20 text-white/90 hover:bg-white/10 transition disabled:opacity-50"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>

              {/* Input */}
              <Input
                type="text"
                placeholder={placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
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
                    handleNewSearch(e);
                  }
                }}
                disabled={isEnhancing}
                className="h-10 w-full border-0 bg-transparent shadow-none text-lg placeholder:text-white/70 text-white focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none pr-28 flex items-center disabled:opacity-70"
              />
            </div>

            {/* Bottom row - Icons */}
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
                        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={() => setShowModelDropdown(false)} />
                        <div className="absolute bottom-8 left-0 z-50 bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg shadow-2xl min-w-[200px] max-h-24 overflow-y-auto">
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
                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 border-yellow-400/60 text-black shadow-lg shadow-yellow-400/30'
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
                              ? 'bg-gradient-to-r from-gray-300 to-gray-500 border-gray-400/60 text-black shadow-lg shadow-gray-400/30'
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
                              ? 'bg-gradient-to-r from-gray-300 to-gray-500 border-gray-400/60 text-black shadow-lg shadow-gray-400/30'
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
        </div>
      </div>

      {/* Sidebar Toggle Button - Top Left */}
      <button
        onClick={() => {
          if (showSidebar && !sidebarMinimized) {
            setSidebarMinimized(true);
          } else if (showSidebar && sidebarMinimized) {
            setShowSidebar(false);
            setSidebarMinimized(false);
          } else {
            setShowSidebar(true);
            setSidebarMinimized(false);
          }
        }}
        className={`fixed top-20 z-50 bg-black/40 backdrop-blur-xl border border-white/10 text-white p-2 rounded-lg hover:bg-white/10 transition-all duration-300 ${showSidebar ? (sidebarMinimized ? 'left-16' : 'left-4') : 'left-4'}`}
        title={showSidebar ? (sidebarMinimized ? "Hide sidebar" : "Minimize sidebar") : "Show sidebar"}
      >
        {showSidebar ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
      </button>


    </div>
  );
} 