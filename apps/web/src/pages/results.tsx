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
import { Component as RaycastBackground } from "@/components/ui/raycast-animated-background";

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
  enhancedAbout?: string;

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

  
  // WEB SEARCH STATE
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  
  // PROMPT ENHANCEMENT STATE
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  
  // SUPPLIERS SECTION STATE
  const [showSuppliersSection, setShowSuppliersSection] = useState(true);
  const [showSuppliersPopup, setShowSuppliersPopup] = useState(false);
  const [supplierEmail, setSupplierEmail] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [isSubmittingSuppliers, setIsSubmittingSuppliers] = useState(false);
  

  
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
    const locations = params.get('locations');
    const webSearch = params.get('websearch') === 'true';
    
    console.log('URL params - websearch:', params.get('websearch'), 'parsed as:', webSearch);
    
    setSearchQuery(query);
    setWebSearchEnabled(webSearch);
    
    // Restore selected types from URL
    if (types) {
      const typesArray = types.split(',').filter(t => t.trim());
      const newSelectedTypes = new Set(typesArray);
      setSelectedTypes(newSelectedTypes);
      console.log('Restored types from URL:', typesArray, 'Set size:', newSelectedTypes.size);
    } else {
      setSelectedTypes(new Set());
    }
    
    // Store locations for search (we'll add location state management later if needed)
    const selectedLocations = locations ? locations.split(',').filter(l => l.trim()) : [];
    console.log('Restored locations from URL:', selectedLocations);
    console.log('Web search from URL:', webSearch);
    
    if (query) {
      // Create new conversation for initial search
      const conversationId = createNewConversation(query);
      setCurrentConversationId(conversationId);
      setShowNewConversation(false);
      
      // Small delay to ensure selectedTypes is set before search
      setTimeout(() => {
        performInitialSearch(query, conversationId, webSearch);
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

  const performInitialSearch = async (query: string, conversationId?: string, webSearchEnabled: boolean = false) => {
    setIsInitialLoading(true);
    setContentItems([]);

    // Check for cached results from search transition
    const cachedResults = sessionStorage.getItem('searchResults');
    let data;
    
    if (cachedResults) {
      // Use cached results and clear them
      data = JSON.parse(cachedResults);
      sessionStorage.removeItem('searchResults');
    } else {
      // Add loading item only if no cached results
      setContentItems([{
        id: `loading-${Date.now()}`,
        type: 'loading',
        data: { query }
      }]);

      // Get current selectedTypes and locations from URL if not set in state yet
      const params = new URLSearchParams(window.location.search);
      const types = params.get('types');
      const locations = params.get('locations');
      const currentSelectedTypes = types ? types.split(',').filter(t => t.trim()) : Array.from(selectedTypes);
      const currentSelectedLocations = locations ? locations.split(',').filter(l => l.trim()) : [];
      
      console.log('Performing search with types:', currentSelectedTypes, 'and locations:', currentSelectedLocations);

      try {
        const response = await apiRequest("POST", "/api/search", {
          query,
          context: {},
          selectedModel,
          selectedTypes: currentSelectedTypes,
          selectedLocations: currentSelectedLocations,
          webSearchEnabled: webSearchEnabled
        });
        
        data = await response.json();
      } catch (error) {
        console.error('Search failed:', error);
        // Fallback to mock data
        const filteredResults = mockSearchResults.filter(result => 
          result.name.toLowerCase().includes(query.toLowerCase()) ||
          result.description.toLowerCase().includes(query.toLowerCase()) ||
          result.category.toLowerCase().includes(query.toLowerCase())
        );
        
        data = {
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
          aiPowered: false
        };
      }
    }

    try {
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
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleSuggestionClick = async (question: string, useWebSearch?: boolean) => {
    try {
      // Use the passed parameter if provided, otherwise use current state
      const shouldUseWebSearch = useWebSearch !== undefined ? useWebSearch : webSearchEnabled;
      
      const response = await apiRequest("POST", "/api/search", {
        query: question,
        context: {},
        selectedModel,
        selectedTypes: Array.from(selectedTypes),
        selectedLocations: [], // Use empty array for follow-up questions
        webSearchEnabled: shouldUseWebSearch
      });
      
      const data = await response.json();
      
      const newCompanies = data.companies || [];
      // Accumulate cards - add new companies to existing ones, avoiding duplicates
      const existingNames = new Set(allCompanies.map(c => c.name));
      const uniqueNewCompanies = newCompanies.filter((company: Company) => !existingNames.has(company.name));
      const updatedAllCompanies = [...allCompanies, ...uniqueNewCompanies];
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

      // Add new result to content items
      setContentItems(prev => [...prev, {
        id: `result-${Date.now()}`,
        type: 'result',
        data: result
      }]);

    } catch (error) {
      console.error('Search failed:', error);
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

      setContentItems(prev => [...prev, {
        id: `result-${Date.now()}`,
        type: 'result',
        data: fallbackResult
      }]);
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
        selectedTypes: Array.from(selectedTypes),
        selectedLocations: [], // Use empty array for new searches
        webSearchEnabled: webSearchEnabled // Use current web search state
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

  };



  const showFavoritesNotification = (itemName: string) => {
    setFavoritesNotification({ show: true, itemName });
  };

  const hideFavoritesNotification = () => {
    setFavoritesNotification({ show: false, itemName: '' });
  };

  const handleSuppliersYes = () => {
    setShowSuppliersPopup(true);
  };

  const handleSuppliersNo = () => {
    setShowSuppliersSection(false);
  };

  const handleSuppliersSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierEmail.trim() || !supplierPhone.trim()) return;
    
    setIsSubmittingSuppliers(true);
    
    try {
      // Here you would typically send the data to your API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Success!",
        description: "We'll connect you with relevant Companies soon.",
      });
      
      setShowSuppliersPopup(false);
      setShowSuppliersSection(false);
      setSupplierEmail('');
      setSupplierPhone('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingSuppliers(false);
    }
  };

  const handleSuppliersCancel = () => {
    setShowSuppliersPopup(false);
    setSupplierEmail('');
    setSupplierPhone('');
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
    <div className="min-h-screen pb-32 relative">
      {/* Raycast Animation Background */}
      <div className="fixed inset-0 w-full h-full z-0">
        <RaycastBackground />
      </div>
      {/* Fixed Sidebar */}
      {showSidebar && (
        <ConversationSidebar 
          onNewConversation={handleNewConversation}
          onSelectConversation={handleSelectConversation}
          isMinimized={sidebarMinimized}
          relatedQuestions={contentItems.length > 0 && contentItems[0]?.type === 'result' ? contentItems[0].data.suggestions || [] : []}
          onQuestionClick={handleSuggestionClick}
          aiResponse={contentItems.length > 0 && contentItems[0]?.type === 'result' ? contentItems[0].data.aiResponse : ''}
          citations={contentItems.length > 0 && contentItems[0]?.type === 'result' ? contentItems[0].data.citations || [] : []}
          currentQuery={contentItems.length > 0 && contentItems[0]?.type === 'result' ? contentItems[0].data.query : ''}
          conversationHistory={contentItems.slice(1).filter(item => item.type === 'result').map(item => ({
            question: item.data.query,
            answer: item.data.aiResponse,
            citations: item.data.citations || [],
            relatedQuestions: item.data.suggestions || []
          }))}
        />
      )}



      {/* Main Content */}
      <div className={`px-2 sm:px-4 md:px-6 lg:px-8 transition-all duration-300 ${showSidebar ? (sidebarMinimized ? 'ml-12' : 'ml-80') : 'ml-0'}`}>
        <NotificationProvider showFavoritesNotification={showFavoritesNotification}>
        <div className="space-y-4">
          {contentItems.map((item) => (
            <div key={item.id}>



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


            </div>
          ))}

          {/* No Results - Show welcome message when no content */}
          {contentItems.length === 0 && !isInitialLoading && !showNewConversation && (
            <NewConversationState firstName={firstName} />
          )}
          

        </div>
        
        {/* Suppliers Section */}
        {showSuppliersSection && allCompanies.length > 0 && (
          <div className="bg-black/20 backdrop-blur-xl p-4 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-2">Would you like Companies to reach out to you?</h3>
            <p className="text-white/70 text-sm mb-4">Get personalized quotes and offers directly from verified Companies</p>
            <div className="flex space-x-4">
              <button 
                onClick={handleSuppliersYes}
                className="px-6 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-all"
              >
                Yes, I'm interested
              </button>
              <button 
                onClick={handleSuppliersNo}
                className="px-6 py-2 bg-white/10 border border-white/20 text-white font-medium rounded-lg hover:bg-white/20 transition-all"
              >
                No, thanks
              </button>
            </div>
          </div>
        )}
        

        

        

        

        
        {/* Cards - Show below all content */}
        {allCompanies.length > 0 && (() => {
          // Show appropriate cards based on selected types
          const params = new URLSearchParams(window.location.search);
          const urlTypes = params.get('types');
          const currentTypes = urlTypes ? new Set(urlTypes.split(',').filter(t => t.trim())) : selectedTypes;
          
          if (currentTypes.has('product') && currentTypes.size === 1) {
            return <ProductCards products={allCompanies} />;
          } else if (currentTypes.has('company') && currentTypes.size === 1) {
            return <CompanyCards companies={allCompanies} webSearchEnabled={webSearchEnabled} searchQuery={contentItems.length > 0 && contentItems[0]?.type === 'result' ? contentItems[0].data.query : ''} />;
          } else if (currentTypes.has('freelancer') && currentTypes.size === 1) {
            return <FreelancerCards freelancers={allCompanies} />;
          } else {
            // Show exactly 5 company cards + remaining as product cards when no specific type is selected
            const companies = allCompanies.slice(0, 5);
            const products = allCompanies.slice(5, 10).map(companyItem => ({
              name: companyItem.name,
              description: companyItem.description,
              pricing: companyItem.pricing,
              website: companyItem.website
            }));
            return (
              <div className="mt-6">
                <CompanyCards companies={companies} webSearchEnabled={webSearchEnabled} searchQuery={contentItems.length > 0 && contentItems[0]?.type === 'result' ? contentItems[0].data.query : ''} />
                {products.length > 0 && <ProductToolCards products={products} />}
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

      {/* Suppliers Popup */}
      {showSuppliersPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-2">
              {contentItems.length > 0 && contentItems[0]?.type === 'result' ? contentItems[0].data.query : 'Connect with Suppliers'}
            </h3>
            <p className="text-white/70 text-sm mb-4">Enter your contact details to receive personalized quotes</p>
            
            <form onSubmit={handleSuppliersSubmit} className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm mb-2">Email Address</label>
                <input
                  type="email"
                  value={supplierEmail}
                  onChange={(e) => setSupplierEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white placeholder:text-white/50 text-sm rounded-lg focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all"
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <label className="block text-white/80 text-sm mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={supplierPhone}
                  onChange={(e) => setSupplierPhone(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white placeholder:text-white/50 text-sm rounded-lg focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              
              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingSuppliers || !supplierEmail.trim() || !supplierPhone.trim()}
                  className="flex-1 px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmittingSuppliers ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Submit'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleSuppliersCancel}
                  disabled={isSubmittingSuppliers}
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 text-white font-medium rounded-lg hover:bg-white/20 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
} 