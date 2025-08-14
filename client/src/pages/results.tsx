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
import { Search, Star, Package, Building, UserCheck, Lightbulb as Solution, Sparkles, Clock, ArrowRight, Lightbulb, Copy, Edit, Wrench, Building2, User, Brain, ChevronDown, LogOut } from "lucide-react";
import { QuantizeLogo } from "@/components/quantize-logo";
import { UserLogo } from "@/components/user-logo";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyCards } from "@/components/company-cards";
import { FreelancerCards } from "@/components/freelancer-cards";
import { ProductCards } from "@/components/product-cards";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";

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
      // Small delay to ensure selectedTypes is set before search
      setTimeout(() => {
        performInitialSearch(query);
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

  const performInitialSearch = async (query: string) => {
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
      const uniqueNewCompanies = newCompanies.filter((newCompany: Company) => 
        !allCompanies.some(existingCompany => existingCompany.name === newCompany.name)
      );
      const updatedAllCompanies = [...allCompanies, ...uniqueNewCompanies];
      setAllCompanies(updatedAllCompanies);

      const result: SearchResult = {
        query,
        aiResponse: data.aiResponse,
        suggestions: data.suggestions || [],
        companies: updatedAllCompanies,
        traditionalResults: data.traditionalResults || data.results || [],
        aiPowered: data.aiPowered,
        timestamp: Date.now()
      };

      // Replace loading with result and suggestions
      setContentItems([
        {
          id: `result-${Date.now()}`,
          type: 'result',
          data: result
        },
        {
          id: `suggestions-${Date.now()}`,
          type: 'suggestions',
          data: { questions: result.suggestions || [] }
        }
      ]);
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
        traditionalResults: filteredResults,
        aiPowered: false,
        timestamp: Date.now()
      };

      setContentItems([
        {
          id: `result-${Date.now()}`,
          type: 'result',
          data: fallbackResult
        },
        {
          id: `suggestions-${Date.now()}`,
          type: 'suggestions',
          data: { questions: fallbackResult.suggestions || [] }
        }
      ]);
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
      const uniqueNewCompanies = newCompanies.filter((newCompany: Company) => 
        !allCompanies.some(existingCompany => existingCompany.name === newCompany.name)
      );
      const updatedAllCompanies = [...allCompanies, ...uniqueNewCompanies];
      setAllCompanies(updatedAllCompanies);

      const result: SearchResult = {
        query: question,
        aiResponse: data.aiResponse,
        suggestions: data.suggestions || [],
        companies: updatedAllCompanies,
        traditionalResults: data.traditionalResults || data.results || [],
        aiPowered: data.aiPowered,
        timestamp: Date.now()
      };

      // Replace loading with result and add new suggestions
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
        newItems.push({
          id: `suggestions-${Date.now()}`,
          type: 'suggestions',
          data: { questions: result.suggestions || [] }
        });
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

    try {
      const response = await apiRequest("POST", "/api/search", {
        query,
        context: {},
        selectedModel,
        selectedTypes: Array.from(selectedTypes)
      });
      
      const data = await response.json();
      
      const newCompanies = data.companies || [];
      const uniqueNewCompanies = newCompanies.filter((newCompany: Company) => 
        !allCompanies.some(existingCompany => existingCompany.name === newCompany.name)
      );
      const updatedAllCompanies = [...allCompanies, ...uniqueNewCompanies];
      setAllCompanies(updatedAllCompanies);

      const result: SearchResult = {
        query,
        aiResponse: data.aiResponse,
        suggestions: data.suggestions || [],
        companies: updatedAllCompanies,
        traditionalResults: data.traditionalResults || data.results || [],
        aiPowered: data.aiPowered,
        timestamp: Date.now()
      };

      // Replace loading with result and add new suggestions
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
        newItems.push({
          id: `suggestions-${Date.now()}`,
          type: 'suggestions',
          data: { questions: result.suggestions || [] }
        });
        return newItems;
      });

    } catch (error) {
      console.error('Search failed:', error);
      // Handle error with fallback
      const fallbackResult: SearchResult = {
        query,
        aiResponse: "AI search is currently unavailable. Please try again.",
        suggestions: [],
        companies: [],
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

  return (
    <div className="min-h-screen pb-32">

      {/* Main Content */}
      <div className="px-8 py-1">
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
                      <div className="prose prose-invert max-w-none" style={{
                        maxHeight: `${Math.min(item.data.aiResponse.split('\n').length, 5) * 1.5}rem`,
                        height: 'auto',
                        overflowY: item.data.aiResponse.split('\n').length > 5 ? 'auto' : 'visible'
                      }}>
                        <div className="text-white/90 leading-relaxed whitespace-pre-wrap">
                          {item.data.aiResponse}
                        </div>
                      </div>
                      
                      {/* Copy Button for Answer */}
                      <button
                        onClick={() => navigator.clipboard.writeText(item.data.aiResponse)}
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
                  
                  {/* Cards - Show only for the last suggestions */}
                  {contentItems.indexOf(item) === contentItems.length - 1 && (() => {
                    // Find the most recent result with companies data
                    const lastResultWithCompanies = [...contentItems].reverse().find(contentItem => 
                      contentItem.type === 'result' && contentItem.data.companies && contentItem.data.companies.length > 0
                    );
                    
                    if (!lastResultWithCompanies) return null;
                    
                    // Show appropriate cards based on selected types
                    // Get types from URL as fallback
                    const params = new URLSearchParams(window.location.search);
                    const urlTypes = params.get('types');
                    const currentTypes = urlTypes ? new Set(urlTypes.split(',').filter(t => t.trim())) : selectedTypes;
                    
                    console.log('Card selection - URL types:', urlTypes, 'Current types:', Array.from(currentTypes));
                    
                    if (currentTypes.has('product') && currentTypes.size === 1) {
                      console.log('Showing ProductCards for products');
                      return <ProductCards products={lastResultWithCompanies.data.companies} />;
                    } else if (currentTypes.has('company') && currentTypes.size === 1) {
                      console.log('Showing CompanyCards for companies');
                      return <CompanyCards companies={lastResultWithCompanies.data.companies} />;
                    } else if (currentTypes.has('freelancer') && currentTypes.size === 1) {
                      console.log('Showing FreelancerCards for freelancers');
                      return <FreelancerCards freelancers={lastResultWithCompanies.data.companies} />;
                    } else {
                      console.log('Showing default CompanyCards');
                      // Show company cards by default or when multiple are selected
                      return <CompanyCards companies={lastResultWithCompanies.data.companies} />;
                    }
                  })()}
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
                      <p className="text-sm text-white/60 mb-3">Finding the best AI solutions for your query...</p>
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

          {/* No Results */}
          {contentItems.length === 0 && !isInitialLoading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-white/60" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
              <p className="text-white/70 mb-6">Try adjusting your search terms</p>
              <Button
                onClick={() => setLocation('/')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Back to Search
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Search Bar at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-white/20 p-4 z-50">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-[28px] border border-white/15 bg-white/5 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.45)] overflow-visible" style={{height: '85px'}}>
            {/* Search input area - increased for better centering */}
            <div className="relative px-4 flex items-center" style={{height: '45px'}}>
              {/* Search button */}
              <button
                aria-label="Search"
                onClick={() => handleNewSearch({ preventDefault: () => {} } as React.FormEvent)}
                disabled={!searchQuery.trim()}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white/5 border border-white/20 text-white/90 hover:bg-white/10 transition disabled:opacity-50"
              >
                <Search className="h-4 w-4" />
              </button>

              {/* Input */}
              <Input
                type="text"
                placeholder={placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleNewSearch(e);
                  }
                }}
                className="h-10 w-full border-0 bg-transparent shadow-none text-lg placeholder:text-white/70 text-white focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none pr-14 flex items-center"
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
        </div>
      </div>

      {/* 4 Toggle Buttons - Right Edge */}
      <div className="fixed right-0 top-1/2 transform -translate-y-1/2 z-50 flex flex-col space-y-2">
        {/* Products Button */}
        <button
          onClick={() => setActiveSection(activeSection === 'products' ? null : 'products')}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-l-full shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all fire-glow"
        >
          <Package className="w-5 h-5" />
        </button>
        
        {/* Companies Button */}
        <button
          onClick={() => setActiveSection(activeSection === 'companies' ? null : 'companies')}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 rounded-l-full shadow-lg hover:from-green-600 hover:to-green-700 transition-all fire-glow"
        >
          <Building className="w-5 h-5" />
        </button>
        
        {/* Freelancers Button */}
        <button
          onClick={() => setActiveSection(activeSection === 'freelancers' ? null : 'freelancers')}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-3 rounded-l-full shadow-lg hover:from-purple-600 hover:to-purple-700 transition-all fire-glow"
        >
          <UserCheck className="w-5 h-5" />
        </button>
        
        {/* Solutions Button */}
        <button
          onClick={() => setActiveSection(activeSection === 'solutions' ? null : 'solutions')}
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-3 rounded-l-full shadow-lg hover:from-yellow-600 hover:to-yellow-700 transition-all fire-glow"
        >
          <Solution className="w-5 h-5" />
        </button>
      </div>

      {/* Expandable Sections */}
      {activeSection && (
        <div className="fixed right-0 top-0 h-full w-80 bg-background/95 backdrop-blur-md border-l border-purple-500/30 transform transition-transform duration-300 z-40">
          <div className="p-6 pt-20 h-full overflow-y-auto">
            {activeSection === 'products' && (
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Package className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Similar Products</h3>
                </div>
                <div className="space-y-3">
                  {mockSimilarProducts.slice(0, 5).map((product) => (
                    <div key={product.id} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/20 transition-all">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 ${product.color} rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0`}>
                          {product.logo}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white truncate">
                            <a href={product.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                              {product.name}
                            </a>
                          </h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs text-white/80">{product.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeSection === 'companies' && (
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Building className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">Similar Companies</h3>
                </div>
                <div className="space-y-3">
                  {[{name: "TechCorp AI", rating: 4.6}, {name: "InnovateLab", rating: 4.8}].map((company, index) => (
                    <div key={index} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/20 transition-all">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0">
                          🏢
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-white">{company.name}</h4>
                          <div className="flex items-center space-x-1 mt-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs text-white/80">{company.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeSection === 'freelancers' && (
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <UserCheck className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">Similar Freelancers</h3>
                </div>
                <div className="space-y-3">
                  {[{name: "Alex Chen", skill: "AI Developer"}, {name: "Sarah Kim", skill: "ML Engineer"}].map((freelancer, index) => (
                    <div key={index} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/20 transition-all">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0">
                          👤
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-white">{freelancer.name}</h4>
                          <p className="text-xs text-white/60">{freelancer.skill}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeSection === 'solutions' && (
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Solution className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-lg font-semibold text-white">Similar Solutions</h3>
                </div>
                <div className="space-y-3">
                  {[{name: "AI Automation Suite", type: "Enterprise"}, {name: "Smart Analytics Platform", type: "SaaS"}].map((solution, index) => (
                    <div key={index} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/20 transition-all">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0">
                          💡
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-white">{solution.name}</h4>
                          <p className="text-xs text-white/60">{solution.type}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 