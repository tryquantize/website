import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, ExternalLink, ArrowLeft, Send, Heart, Building2, GitCompare, X, Loader2, MapPin, Users, Calendar, TrendingUp, DollarSign, Target, Briefcase, Award, ChevronDown, ChevronUp, Handshake, Eye, MousePointer, RotateCcw } from "lucide-react";
import { useFavorites } from "@/contexts/favorites-context";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { useNotification } from "@/contexts/notification-context";
import { PartnerPopup } from "@/components/partner-popup";
import { PartnerSuccessNotification } from "@/components/partner-success-notification";

import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import "@/styles/company-card.css";

// Utility function to format company name in camel case without underscores
const formatCompanyName = (name: string): string => {
  return name
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()) // Capitalize first letter of each word
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim(); // Remove leading/trailing spaces
};

// Utility function to filter companies by industry and location
const filterCompanies = (companies: Company[], searchQuery?: string, selectedLocations?: string[]): Company[] => {
  let filtered = companies;
  
  // Step 1: Filter by industry if mentioned in search query
  if (searchQuery) {
    const industryKeywords = {
      healthcare: ['healthcare', 'health', 'medical', 'hospital', 'clinic', 'patient', 'doctor', 'nurse', 'medicine', 'pharmaceutical', 'biotech'],
      finance: ['finance', 'financial', 'banking', 'investment', 'trading', 'insurance', 'fintech', 'payment', 'lending', 'credit'],
      education: ['education', 'learning', 'school', 'university', 'training', 'course', 'student', 'teacher', 'academic', 'edtech'],
      ecommerce: ['ecommerce', 'e-commerce', 'retail', 'shopping', 'marketplace', 'store', 'commerce', 'sales', 'merchant'],
      marketing: ['marketing', 'advertising', 'campaign', 'brand', 'promotion', 'social media', 'content', 'seo', 'digital marketing'],
      hr: ['hr', 'human resources', 'recruitment', 'hiring', 'employee', 'workforce', 'talent', 'recruiting', 'staffing'],
      legal: ['legal', 'law', 'attorney', 'lawyer', 'compliance', 'contract', 'litigation', 'court', 'judicial'],
      realestate: ['real estate', 'property', 'housing', 'rental', 'mortgage', 'construction', 'building', 'architecture'],
      manufacturing: ['manufacturing', 'production', 'factory', 'industrial', 'supply chain', 'logistics', 'warehouse', 'inventory'],
      travel: ['travel', 'tourism', 'hotel', 'hospitality', 'booking', 'vacation', 'flight', 'transportation'],
      gaming: ['gaming', 'game', 'entertainment', 'esports', 'mobile game', 'video game', 'interactive'],
      automotive: ['automotive', 'car', 'vehicle', 'transportation', 'mobility', 'fleet', 'driving'],
      agriculture: ['agriculture', 'farming', 'crop', 'livestock', 'food', 'agtech', 'agricultural'],
      energy: ['energy', 'renewable', 'solar', 'wind', 'oil', 'gas', 'power', 'electricity', 'utility'],
      cybersecurity: ['cybersecurity', 'security', 'cyber', 'protection', 'threat', 'vulnerability', 'encryption']
    };
    
    const queryLower = searchQuery.toLowerCase();
    const mentionedIndustries = Object.entries(industryKeywords).filter(([industry, keywords]) => 
      keywords.some(keyword => queryLower.includes(keyword))
    ).map(([industry]) => industry);
    
    if (mentionedIndustries.length > 0) {
      const industryFiltered = companies.filter(company => {
        if (!company.industriesServed || company.industriesServed.length === 0) return false;
        return company.industriesServed.some(industry => {
          const industryLower = industry.toLowerCase();
          return mentionedIndustries.some(mentionedIndustry => {
            const keywords = industryKeywords[mentionedIndustry as keyof typeof industryKeywords];
            return keywords.some(keyword => industryLower.includes(keyword));
          });
        });
      });
      if (industryFiltered.length > 0) filtered = industryFiltered;
    }
  }
  
  // Step 2: Filter by location if selected
  if (selectedLocations && selectedLocations.length > 0) {
    const locationFiltered = filtered.filter(company => {
      if (!company.location) return false;
      return selectedLocations.some(selectedLocation => {
        const locationLower = company.location!.toLowerCase();
        const selectedLower = selectedLocation.toLowerCase();
        return locationLower.includes(selectedLower) || selectedLower.includes(locationLower);
      });
    });
    if (locationFiltered.length > 0) filtered = locationFiltered;
  }
  
  return filtered;
};

interface Company {
  name: string;
  description: string;
  features: string[];
  pricing: string;
  website: string;
  category: string;
  specifications?: string[];
  location?: string;
  about?: string[];
  linkedin_url?: string;
  rating?: {
    rating: number;
    reviews: number;
  };
  // Enhanced fields from RAG
  companyStage?: string;
  industriesServed?: string[];
  pricingRanges?: string[];
  pricingModel?: string[];
  employees?: string;
  productsServices?: string[];
  topClients?: string[];
  logoUrl?: string;
  founded?: string;
  enhancedAbout?: string;
  enhancedUseCases?: string[];
  tagline?: string;
  // New fields
  trialAvailable?: boolean;
  customerSegments?: string[];
  uspTagline?: string;
  deploymentType?: string[];
  idealScenarios?: string[];
}

interface CompanyCardsProps {
  companies: Company[];
  webSearchEnabled?: boolean;
  searchQuery?: string;
  selectedLocations?: string[];
  tinderMode?: boolean;
  onTinderModeChange?: (mode: boolean) => void;
  currentCardIndex?: number;
  onCardIndexChange?: (index: number) => void;
  onSwipe?: (direction: 'left' | 'right') => void;
  onReset?: () => void;
}

export function CompanyCards({ 
  companies, 
  webSearchEnabled, 
  searchQuery,
  selectedLocations,
  tinderMode = false,
  onTinderModeChange,
  currentCardIndex = 0,
  onCardIndexChange,
  onSwipe,
  onReset
}: CompanyCardsProps) {
  // Filter companies based on search query and selected locations
  const filteredCompanies = filterCompanies(companies, searchQuery, selectedLocations);
  const [chatStates, setChatStates] = useState<{[key: number]: boolean}>({});
  const [messages, setMessages] = useState<{[key: number]: Array<{text: string, isUser: boolean}>}>({});
  const [inputValues, setInputValues] = useState<{[key: number]: string}>({});
  const [aboutDropdownStates, setAboutDropdownStates] = useState<{[key: number]: boolean}>({});
  const [expandedIndustries, setExpandedIndustries] = useState<{[key: number]: boolean}>({});
  const [expandedProducts, setExpandedProducts] = useState<{[key: number]: boolean}>({});
  const [expandedCards, setExpandedCards] = useState<{[key: number]: boolean}>({});
  const [selectedForComparison, setSelectedForComparison] = useState<Set<number>>(new Set());
  const [showComparisonPopup, setShowComparisonPopup] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<string>("");
  const [isLoadingComparison, setIsLoadingComparison] = useState(false);
  const [engagementData, setEngagementData] = useState<{[key: string]: {views: number, clicks: number, saves: number}}>({});
  const [swipedCards, setSwipedCards] = useState<Set<number>>(new Set());
  const [partnerPopup, setPartnerPopup] = useState<{isOpen: boolean, companyName: string}>({isOpen: false, companyName: ""});
  const [showSuccessNotification, setShowSuccessNotification] = useState<{isVisible: boolean, companyName: string}>({isVisible: false, companyName: ""});

  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { currentUser } = useFirebaseAuth();
  const { showFavoritesNotification } = useNotification();

  // Track engagement
  const trackEngagement = async (companyName: string, action: 'view' | 'click' | 'save') => {
    try {
      await apiRequest('POST', '/api/engagement/track', {
        companyName,
        action
      });
      
      // Update local state
      setEngagementData(prev => ({
        ...prev,
        [companyName]: {
          views: prev[companyName]?.views || 0,
          clicks: prev[companyName]?.clicks || 0,
          saves: prev[companyName]?.saves || 0,
          [action + 's']: (prev[companyName]?.[action + 's'] || 0) + 1
        }
      }));
    } catch (error) {
      console.error('Failed to track engagement:', error);
    }
  };

  // Load engagement data on mount
  React.useEffect(() => {
    const loadEngagementData = async () => {
      try {
        const response = await apiRequest('GET', '/api/engagement/data');
        const data = await response.json();
        if (data.success) {
          setEngagementData(data.engagement);
        }
      } catch (error) {
        console.error('Failed to load engagement data:', error);
      }
    };
    loadEngagementData();
  }, []);

  // Track views when companies are displayed
  React.useEffect(() => {
    filteredCompanies.forEach(company => {
      trackEngagement(company.name, 'view');
    });
  }, [filteredCompanies]);

  const handleChatClick = (index: number) => {
    setChatStates(prev => ({...prev, [index]: true}));
    if (!messages[index]) {
      setMessages(prev => ({...prev, [index]: [{text: `Hi! I'm here to help you learn more about ${filteredCompanies[index].name}. What would you like to know?`, isUser: false}]}));
    }
  };

  const handleBackClick = (index: number) => {
    setChatStates(prev => ({...prev, [index]: false}));
  };

  const handleSendMessage = (index: number) => {
    const message = inputValues[index]?.trim();
    if (!message) return;

    setMessages(prev => ({
      ...prev,
      [index]: [...(prev[index] || []), 
        {text: message, isUser: true},
        {text: `Thanks for your message about ${filteredCompanies[index].name}. Our team will get back to you soon!`, isUser: false}
      ]
    }));
    setInputValues(prev => ({...prev, [index]: ""}));
  };

  const handleVisitWebsite = (website: string, companyName: string) => {
    if (website && website !== "#") {
      trackEngagement(companyName, 'click');
      window.open(website, "_blank", "noopener,noreferrer");
    }
  };

  const handlePartnerRequest = (companyName: string) => {
    trackEngagement(companyName, 'click');
    setPartnerPopup({isOpen: true, companyName});
  };

  const handlePartnerSubmit = (formData: {name: string, phone: string, email: string}) => {
    // Close popup
    setPartnerPopup({isOpen: false, companyName: ""});
    
    // Show success notification
    setShowSuccessNotification({isVisible: true, companyName: partnerPopup.companyName});
    
    // Hide notification after 4 seconds
    setTimeout(() => {
      setShowSuccessNotification({isVisible: false, companyName: ""});
    }, 4000);
    
    // Here you could also send the data to your backend
    console.log('Partnership request submitted:', {
      company: partnerPopup.companyName,
      searchQuery,
      ...formData
    });
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    const company = filteredCompanies[currentCardIndex];
    
    if (direction === 'right') {
      // Add to favorites
      const companyId = `company_${currentCardIndex}_${company.name}`;
      trackEngagement(company.name, 'save');
      addToFavorites({
        id: companyId,
        type: 'company',
        name: company.name,
        description: company.description,
        features: company.features,
        pricing: company.pricing,
        website: company.website,
        category: company.category,
        specifications: company.specifications,
        location: company.location,
        about: company.about,
        linkedin_url: company.linkedin_url,
        rating: company.rating,
        companyStage: company.companyStage,
        industriesServed: company.industriesServed,
        pricingRanges: company.pricingRanges,
        pricingModel: company.pricingModel,
        employees: company.employees,
        productsServices: company.productsServices,
        topClients: company.topClients,
        logoUrl: company.logoUrl,
        founded: company.founded,
        enhancedAbout: company.enhancedAbout,
        enhancedUseCases: company.enhancedUseCases,
        tagline: company.tagline,
        trialAvailable: company.trialAvailable,
        customerSegments: company.customerSegments,
        uspTagline: company.uspTagline,
        deploymentType: company.deploymentType,
        idealScenarios: company.idealScenarios
      }, showFavoritesNotification);
    }
    
    setSwipedCards(prev => new Set([...prev, currentCardIndex]));
    onCardIndexChange?.(currentCardIndex + 1);
    onSwipe?.(direction);
  };

  const resetTinderMode = () => {
    onCardIndexChange?.(0);
    setSwipedCards(new Set());
    onReset?.();
  };

  const handleCompareToggle = (index: number) => {
    const newSelected = new Set(selectedForComparison);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedForComparison(newSelected);
  };

  const handleCompare = async () => {
    if (selectedForComparison.size < 2) return;
    
    setIsLoadingComparison(true);
    setShowComparisonPopup(true);
    
    try {
      const selectedCompanies = Array.from(selectedForComparison).map(index => filteredCompanies[index]);
      
      const response = await apiRequest("POST", "/api/ai-service/compare", {
        companies: selectedCompanies
      });
      
      const data = await response.json();
      setComparisonResult(data.comparison || "Comparison unavailable.");
    } catch (error) {
      console.error('Comparison failed:', error);
      setComparisonResult("Failed to generate comparison. Please try again.");
    } finally {
      setIsLoadingComparison(false);
    }
  };

  const closeComparisonPopup = () => {
    setShowComparisonPopup(false);
    setComparisonResult("");
    setSelectedForComparison(new Set());
  };

  const toggleAboutDropdown = (index: number) => {
    setAboutDropdownStates(prev => ({...prev, [index]: !prev[index]}));
  };

  const toggleIndustriesExpansion = (index: number) => {
    setExpandedIndustries(prev => ({...prev, [index]: !prev[index]}));
  };

  const toggleProductsExpansion = (index: number) => {
    setExpandedProducts(prev => ({...prev, [index]: !prev[index]}));
  };

  const toggleCardExpansion = (index: number) => {
    setExpandedCards(prev => ({...prev, [index]: !prev[index]}));
  };



  // Helper function to check if a field has meaningful data
  const hasData = (value: any): boolean => {
    if (!value) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'string') {
      const cleaned = value.toLowerCase().trim();
      return cleaned !== '' && cleaned !== 'n/a' && cleaned !== 'not applicable' && cleaned !== 'null' && cleaned !== 'undefined';
    }
    return true;
  };

  // Helper function to check if pricing data is meaningful (not placeholder text)
  const hasMeaningfulPricing = (company: Company): boolean => {
    const placeholderTexts = [
      'contact for pricing',
      'contact us for pricing',
      'pricing available on request',
      'custom pricing',
      'quote available',
      'request quote',
      'call for pricing',
      'pricing on request'
    ];
    
    // Check if we have meaningful pricing ranges or models
    if (hasData(company.pricingRanges) || hasData(company.pricingModel)) {
      return true;
    }
    
    // Check if pricing text is meaningful (not a placeholder)
    if (hasData(company.pricing)) {
      const pricingText = company.pricing!.toLowerCase().trim();
      return !placeholderTexts.some(placeholder => pricingText.includes(placeholder));
    }
    
    return false;
  };



  // Get available sections for a company
  const getAvailableSections = (company: Company) => {
    const sections = [];
    if (hasData(company.specifications) || hasData(company.features)) sections.push('specifications');
    if (hasData(company.enhancedUseCases)) sections.push('usecases');
    if (hasMeaningfulPricing(company)) sections.push('pricing');
    if (hasData(company.location)) sections.push('location');
    if (hasData(company.employees)) sections.push('employees');
    if (hasData(company.founded)) sections.push('founded');
    if (hasData(company.companyStage)) sections.push('stage');
    if (hasData(company.industriesServed)) sections.push('industries');
    if (hasData(company.productsServices)) sections.push('products');
    if (hasData(company.topClients)) sections.push('clients');
    if (hasData(company.customerSegments)) sections.push('segments');
    if (hasData(company.deploymentType)) sections.push('deployment');
    if (hasData(company.idealScenarios)) sections.push('scenarios');
    if (company.trialAvailable) sections.push('trial');
    return sections;
  };

  // Get icon for section
  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'specifications': return <Briefcase className="w-4 h-4 text-white" />;
      case 'usecases': return <Target className="w-4 h-4 text-white" />;
      case 'pricing': return <DollarSign className="w-4 h-4 text-white" />;
      case 'location': return <MapPin className="w-4 h-4 text-white" />;
      case 'employees': return <Users className="w-4 h-4 text-white" />;
      case 'founded': return <Calendar className="w-4 h-4 text-white" />;
      case 'stage': return <TrendingUp className="w-4 h-4 text-white" />;
      case 'industries': return <Target className="w-4 h-4 text-white" />;
      case 'products': return <Award className="w-4 h-4 text-white" />;
      case 'clients': return <Building2 className="w-4 h-4 text-white" />;
      case 'segments': return <Target className="w-4 h-4 text-white" />;
      case 'deployment': return <Building2 className="w-4 h-4 text-white" />;
      case 'scenarios': return <Briefcase className="w-4 h-4 text-white" />;
      case 'trial': return <Award className="w-4 h-4 text-white" />;
      default: return <Briefcase className="w-4 h-4 text-white" />;
    }
  };

  if (filteredCompanies.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">

      {tinderMode ? (
        /* Tinder Mode View - Using existing cards */
        <div className="relative h-[700px] flex items-center justify-center px-4">
          {currentCardIndex >= filteredCompanies.length ? (
            <div className="text-center text-white">
              <Heart className="w-16 h-16 mx-auto mb-4 text-pink-500" />
              <h3 className="text-2xl font-bold mb-2">All Done!</h3>
              <p className="text-white/70 mb-4">You've reviewed all companies</p>
              <Button onClick={resetTinderMode} className="bg-pink-500 hover:bg-pink-600">
                Start Over
              </Button>
            </div>
          ) : (
            <div className="relative w-full max-w-2xl h-[500px]">
              {/* Stack of existing cards in tinder style */}
              {filteredCompanies.slice(currentCardIndex, currentCardIndex + 3).map((company, stackIndex) => {
                const actualIndex = currentCardIndex + stackIndex;
                const isTop = stackIndex === 0;
                const availableSections = getAvailableSections(company);
                const isExpanded = true; // Force expanded in tinder mode
                const cardHeight = "auto";
                
                return (
                  <div
                    key={actualIndex}
                    className={`absolute inset-0 transition-all duration-300 ${
                      isTop ? 'z-30 scale-100' : stackIndex === 1 ? 'z-20 scale-95 translate-y-2' : 'z-10 scale-90 translate-y-4'
                    }`}
                    style={{
                      transform: `scale(${1 - stackIndex * 0.05}) translateY(${stackIndex * 8}px)`,
                      opacity: 1 - stackIndex * 0.2
                    }}
                  >
                    {/* Use gradient card design */}
                    <div className="gradient-company-card tinder-mode">
                      <div className="gradient-company-card-info">
                      {chatStates[actualIndex] ? (
                        <div className="space-y-3 h-full flex flex-col p-4">
                          <div className="flex items-center justify-between">
                            <h5 className="text-white text-base font-medium">{formatCompanyName(company.name)}</h5>
                            <Button
                              onClick={() => handleBackClick(actualIndex)}
                              size="sm"
                              variant="outline"
                              className="border-white/20 text-white/80 hover:bg-white/10 text-xs"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          <div className="bg-black/20 rounded-lg p-3 flex-1 overflow-y-auto space-y-2">
                            {(messages[actualIndex] || []).map((msg, msgIndex) => (
                              <div key={msgIndex} className={`text-xs ${msg.isUser ? 'text-right' : 'text-left'}`}>
                                <span className={`inline-block px-2 py-1 rounded ${msg.isUser ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/80'}`}>
                                  {msg.text}
                                </span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex space-x-2">
                            <Input
                              value={inputValues[actualIndex] || ""}
                              onChange={(e) => setInputValues(prev => ({...prev, [actualIndex]: e.target.value}))}
                              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(actualIndex)}
                              placeholder="Type your message..."
                              className="flex-1 h-8 text-xs bg-white/5 border-white/20 text-white"
                            />
                            <Button
                              onClick={() => handleSendMessage(actualIndex)}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Send className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 h-full flex flex-col p-4">
                          {/* Copy exact expanded card content from grid view */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <motion.div
                                className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
                                style={{
                                  background: company.logoUrl ? "transparent" : "linear-gradient(225deg, #171c2c 0%, #121624 100%)",
                                  boxShadow: "0 4px 8px -1px rgba(0, 0, 0, 0.2), inset 1px 1px 3px rgba(255, 255, 255, 0.1), inset -1px -1px 2px rgba(0, 0, 0, 0.4)"
                                }}
                              >
                                {company.logoUrl ? (
                                  <img src={company.logoUrl} alt={`${company.name} logo`} className="w-full h-full object-cover" />
                                ) : (
                                  <Building2 className="w-5 h-5 text-white" />
                                )}
                              </motion.div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <h5 className="text-white text-lg font-semibold">{formatCompanyName(company.name)}</h5>
                                  </div>
                                </div>
                                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">{company.category}</span>
                              </div>
                            </div>
                            {currentUser && (
                              <div className="flex space-x-1">
                                <Button
                                  onClick={() => {
                                    const companyId = `company_${actualIndex}_${company.name}`;
                                    if (isFavorite(companyId)) {
                                      removeFromFavorites(companyId);
                                    } else {
                                      trackEngagement(company.name, 'save');
                                      addToFavorites({
                                        id: companyId,
                                        type: 'company',
                                        name: company.name,
                                        description: company.description,
                                        features: company.features,
                                        pricing: company.pricing,
                                        website: company.website,
                                        category: company.category
                                      }, showFavoritesNotification);
                                    }
                                  }}
                                  size="sm"
                                  variant="ghost"
                                  className="p-1 h-auto"
                                >
                                  <Heart className={`w-4 h-4 ${isFavorite(`company_${actualIndex}_${company.name}`) ? 'text-red-500 fill-current' : 'text-white/40 hover:text-red-400'}`} />
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* All expanded content from original cards */}
                          <div className="space-y-4 flex-1 overflow-y-auto pr-2" style={{maxHeight: '350px', scrollbarWidth: 'thin'}}>
                            <div className="grid grid-cols-4 gap-3 text-xs">
                              {hasData(company.location) && (
                                <div>
                                  <div className="flex items-center gap-1 mb-1">
                                    <MapPin className="w-3 h-3 text-white/60" />
                                    <span className="font-semibold text-white">Location</span>
                                  </div>
                                  <div className="text-white/80">{company.location}</div>
                                </div>
                              )}
                              {hasData(company.employees) && (
                                <div>
                                  <div className="flex items-center gap-1 mb-1">
                                    <Users className="w-3 h-3 text-white/60" />
                                    <span className="font-semibold text-white">Employees</span>
                                  </div>
                                  <div className="text-white/80">{company.employees}</div>
                                </div>
                              )}
                              {hasData(company.founded) && (
                                <div>
                                  <div className="flex items-center gap-1 mb-1">
                                    <Calendar className="w-3 h-3 text-white/60" />
                                    <span className="font-semibold text-white">Founded</span>
                                  </div>
                                  <div className="text-white/80">{company.founded}</div>
                                </div>
                              )}
                              {hasData(company.companyStage) && (
                                <div>
                                  <div className="flex items-center gap-1 mb-1">
                                    <TrendingUp className="w-3 h-3 text-white/60" />
                                    <span className="font-semibold text-white">Stage</span>
                                  </div>
                                  <div className="text-white/80">{company.companyStage}</div>
                                </div>
                              )}
                            </div>
                            
                            {(hasData(company.specifications) || hasData(company.features)) && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Briefcase className="w-4 h-4 text-white/60" />
                                  <h6 className="text-sm font-semibold text-white">Key Specifications</h6>
                                </div>
                                <div className="space-y-1">
                                  {company.specifications ? company.specifications.slice(0, 5).map((spec, i) => (
                                    <div key={i} className="text-xs text-white/80">- {spec}</div>
                                  )) : (
                                    company.features && company.features.slice(0, 5).map((feature, i) => (
                                      <div key={i} className="text-xs text-white/80">- {feature}</div>
                                    ))
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {hasData(company.customerSegments) && (
                              <div>
                                <div className="flex items-center gap-1 mb-1">
                                  <Target className="w-3 h-3 text-white/60" />
                                  <span className="font-semibold text-white">Customer Segments</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {company.customerSegments.map((segment, i) => (
                                    <span key={i} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                                      {segment}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {hasData(company.deploymentType) && (
                              <div>
                                <div className="flex items-center gap-1 mb-1">
                                  <Building2 className="w-3 h-3 text-white/60" />
                                  <span className="font-semibold text-white">Deployment</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {company.deploymentType.map((type, i) => (
                                    <span key={i} className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
                                      {type}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {hasData(company.idealScenarios) && (
                              <div>
                                <div className="flex items-center gap-1 mb-1">
                                  <Briefcase className="w-3 h-3 text-white/60" />
                                  <span className="font-semibold text-white">Ideal For</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {company.idealScenarios.map((scenario, i) => (
                                    <span key={i} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                                      {scenario}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {company.trialAvailable && (
                              <div>
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                  <span className="text-green-300 font-medium text-sm">Free Trial Available</span>
                                </div>
                              </div>
                            )}
                            
                            {hasData(company.productsServices) && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Award className="w-4 h-4 text-white/60" />
                                  <h6 className="text-sm font-semibold text-white">Products & Services</h6>
                                </div>
                                <div className="space-y-1">
                                  {company.productsServices.slice(0, 3).map((product, i) => (
                                    <div key={i} className="text-xs text-white/80 leading-relaxed">- {product}</div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {hasMeaningfulPricing(company) && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <DollarSign className="w-4 h-4 text-white/60" />
                                  <h6 className="text-sm font-semibold text-white">Pricing Information</h6>
                                </div>
                                <div className="text-xs">
                                  {hasData(company.pricingRanges) && (
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-white/60">Ranges:</span>
                                      <div className="flex flex-wrap gap-1">
                                        {company.pricingRanges.map((range, i) => (
                                          <span key={i} className="bg-green-500/20 text-green-300 px-2 py-1 rounded">
                                            {range}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {hasData(company.pricingModel) && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-white/60">Models:</span>
                                      <div className="flex flex-wrap gap-1">
                                        {company.pricingModel.map((model, i) => (
                                          <span key={i} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                                            {model}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {hasData(company.pricing) && !hasData(company.pricingRanges) && !hasData(company.pricingModel) && (
                                    <div className="text-white/80">{company.pricing}</div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {hasData(company.enhancedUseCases) && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Target className="w-4 h-4 text-white/60" />
                                  <h6 className="text-sm font-semibold text-white">Use Cases</h6>
                                </div>
                                <div className="space-y-1">
                                  {(company.enhancedUseCases as string[]).slice(0, 3).map((useCase, i) => (
                                    <div key={i} className="text-xs text-white/80">- {useCase}</div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {hasData(company.enhancedAbout) && (
                              <div>
                                <div className="text-sm font-semibold text-white py-2 border-t border-white/10">
                                  About Company
                                </div>
                                <div className="text-xs text-white/80 bg-white/5 p-3 rounded leading-relaxed max-h-32 overflow-y-auto">
                                  {company.enhancedAbout}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex space-x-1 mt-auto">
                            <Button
                              onClick={() => handleChatClick(actualIndex)}
                              size="sm"
                              className="flex-1 bg-white text-black font-medium hover:bg-gray-100 text-xs px-2"
                            >
                              <MessageCircle className="w-3 h-3 mr-1" />
                              Chat
                            </Button>
                            <Button
                              onClick={() => {
                                if ((company as any).phoneNumber) {
                                  trackEngagement(company.name, 'click');
                                  window.open(`tel:${(company as any).phoneNumber}`, '_self');
                                } else {
                                  alert(`No phone number available for ${company.name}`);
                                }
                              }}
                              size="sm"
                              className="flex-1 bg-white text-black font-medium hover:bg-gray-100 text-xs px-2"
                            >
                              📞 Call
                            </Button>
                            <Button
                              onClick={() => handlePartnerRequest(company.name)}
                              size="sm"
                              className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white font-medium hover:from-green-600 hover:to-blue-600 text-xs px-2"
                              title="Partner with this company"
                            >
                              <Handshake className="w-3 h-3 mr-1" />
                              Partner
                            </Button>
                            {company.website && company.website !== "#" && (
                              <Button
                                onClick={() => handleVisitWebsite(company.website, company.name)}
                                size="sm"
                                className="bg-white text-black font-medium hover:bg-gray-100 text-xs px-2"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Swipe buttons */}
              <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 flex gap-6">
                <Button
                  onClick={() => handleSwipe('left')}
                  className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg"
                >
                  <X className="w-8 h-8" />
                </Button>
                <Button
                  onClick={() => handleSwipe('right')}
                  className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg"
                >
                  <Heart className="w-8 h-8" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Original Grid View */
        <div className="space-y-6">
        {/* Mobile: Horizontal scroll with single cards */}
        <div className="md:hidden">
          {filteredCompanies.length > 1 && (
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-white/60 text-sm">Swipe to explore more companies</span>
              <span className="text-white/40 text-xs">{filteredCompanies.length} companies</span>
            </div>
          )}
          <div className="flex gap-4 overflow-x-auto pb-4 mobile-card-scroll">
            {filteredCompanies.map((company, index) => {
          const availableSections = getAvailableSections(company);
          const isExpanded = expandedCards[index];
          const cardHeight = isExpanded ? "auto" : "200px";
          
          return (
          <div 
            key={index} 
            className={`gradient-company-card ${isExpanded ? 'expanded' : ''} mobile-card w-80`}
            onClick={isExpanded ? (e) => {
              // Only collapse if clicking on blank area (not on interactive elements)
              if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('blank-area')) {
                toggleCardExpansion(index);
              }
            } : undefined}
          >
            <div className="gradient-company-card-info">
            {chatStates[index] ? (
              <div className="space-y-3 h-full flex flex-col p-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-white text-base font-medium">{formatCompanyName(company.name)}</h5>
                  <Button
                    onClick={() => handleBackClick(index)}
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white/80 hover:bg-white/10 text-xs"
                  >
                    <ArrowLeft className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="bg-black/20 rounded-lg p-3 flex-1 overflow-y-auto space-y-2">
                  {(messages[index] || []).map((msg, msgIndex) => (
                    <div key={msgIndex} className={`text-xs ${msg.isUser ? 'text-right' : 'text-left'}`}>
                      <span className={`inline-block px-2 py-1 rounded ${msg.isUser ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/80'}`}>
                        {msg.text}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <Input
                    value={inputValues[index] || ""}
                    onChange={(e) => setInputValues(prev => ({...prev, [index]: e.target.value}))}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(index)}
                    placeholder="Type your message..."
                    className="flex-1 h-8 text-xs bg-white/5 border-white/20 text-white"
                  />
                  <Button
                    onClick={() => handleSendMessage(index)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Send className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className={`space-y-3 h-full flex flex-col p-4 ${isExpanded ? 'overflow-y-auto' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <motion.div
                      className={`${isExpanded ? 'w-12 h-12' : 'w-14 h-14'} rounded-full flex items-center justify-center overflow-hidden flex-shrink-0`}
                      style={{
                        background: company.logoUrl ? "transparent" : "linear-gradient(225deg, #171c2c 0%, #121624 100%)",
                        boxShadow: "0 4px 8px -1px rgba(0, 0, 0, 0.2), inset 1px 1px 3px rgba(255, 255, 255, 0.1), inset -1px -1px 2px rgba(0, 0, 0, 0.4)"
                      }}
                      whileHover={{ y: -1, boxShadow: "0 6px 12px -1px rgba(0, 0, 0, 0.3), inset 1px 1px 3px rgba(255, 255, 255, 0.15), inset -1px -1px 2px rgba(0, 0, 0, 0.5)" }}
                    >
                      {company.logoUrl ? (
                        <img src={company.logoUrl} alt={`${company.name} logo`} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className={`${isExpanded ? 'w-6 h-6' : 'w-7 h-7'} text-white`} />
                      )}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <h5 className={`text-white ${isExpanded ? 'text-lg' : 'text-xl'} font-semibold truncate`}>{formatCompanyName(company.name)}</h5>
                          {isExpanded && company.linkedin_url && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(company.linkedin_url, "_blank", "noopener,noreferrer");
                              }}
                              className="text-white/60 hover:text-blue-400 transition-colors flex-shrink-0"
                              title="View LinkedIn Profile"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                              </svg>
                            </button>
                          )}
                        </div>

                      </div>
                      <span className={`${isExpanded ? 'text-xs' : 'text-sm'} bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full font-medium`}>{company.category}</span>
                    </div>
                  </div>
                  {currentUser && (
                    <div className="flex space-x-1">
                      {isExpanded && (
                        <Button
                          onClick={() => toggleCardExpansion(index)}
                          size="sm"
                          variant="ghost"
                          className="p-1 h-auto"
                          title="Collapse card"
                        >
                          <X className="w-4 h-4 text-white/60 hover:text-white" />
                        </Button>
                      )}
                      <Button
                        onClick={() => handleCompareToggle(index)}
                        size="sm"
                        variant="ghost"
                        className="p-1 h-auto"
                      >
                        <GitCompare className={`w-4 h-4 ${selectedForComparison.has(index) ? 'text-blue-500' : 'text-white/40 hover:text-blue-400'}`} />
                      </Button>
                      <Button
                        onClick={() => {
                          const companyId = `company_${index}_${company.name}`;
                          if (isFavorite(companyId)) {
                            removeFromFavorites(companyId);
                          } else {
                            trackEngagement(company.name, 'save');
                            addToFavorites({
                              id: companyId,
                              type: 'company',
                              name: company.name,
                              description: company.description,
                              features: company.features,
                              pricing: company.pricing,
                              website: company.website,
                              category: company.category,
                              specifications: company.specifications,
                              location: company.location,
                              about: company.about,
                              linkedin_url: company.linkedin_url,
                              rating: company.rating,
                              companyStage: company.companyStage,
                              industriesServed: company.industriesServed,
                              pricingRanges: company.pricingRanges,
                              pricingModel: company.pricingModel,
                              employees: company.employees,
                              productsServices: company.productsServices,
                              topClients: company.topClients,
                              logoUrl: company.logoUrl,
                              founded: company.founded,
                              enhancedAbout: company.enhancedAbout,
                              enhancedUseCases: company.enhancedUseCases,
                              tagline: company.tagline,
                              trialAvailable: company.trialAvailable,
                              customerSegments: company.customerSegments,
                              uspTagline: company.uspTagline,
                              deploymentType: company.deploymentType,
                              idealScenarios: company.idealScenarios
                            }, showFavoritesNotification);
                          }
                        }}
                        size="sm"
                        variant="ghost"
                        className="p-1 h-auto"
                      >
                        <Heart className={`w-4 h-4 ${isFavorite(`company_${index}_${company.name}`) ? 'text-red-500 fill-current' : 'text-white/40 hover:text-red-400'}`} />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Compact View - Basic Info */}
                {!isExpanded && (
                  <div className="flex-1 flex flex-col justify-between">
                    {/* USP Tagline or Company Tagline */}
                    {(hasData(company.uspTagline) || hasData(company.tagline)) && (
                      <div className="mb-4">
                        <p className="text-sm text-white/80 leading-relaxed">
                          {company.uspTagline ? 
                            (company.uspTagline.length > 140 ? company.uspTagline.substring(0, 140) + '...' : company.uspTagline) :
                            (company.tagline!.length > 140 ? company.tagline!.substring(0, 140) + '...' : company.tagline)
                          }
                        </p>
                      </div>
                    )}
                    

                    
                    {/* Engagement Stats */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4 text-xs text-white/60">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{engagementData[company.name]?.views || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MousePointer className="w-3 h-3" />
                          <span>{engagementData[company.name]?.clicks || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          <span>{engagementData[company.name]?.saves || 0}</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => toggleCardExpansion(index)}
                        size="sm"
                        className="bg-white text-black hover:bg-gray-100 text-xs px-3 py-1 h-7"
                      >
                        Learn More
                      </Button>
                    </div>
                    
                    {/* Bottom section with icons and actions */}
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/10">
                      <div className="flex items-center gap-3">
                        {company.website && company.website !== "#" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVisitWebsite(company.website, company.name);
                            }}
                            className="text-white/60 hover:text-blue-400 transition-colors p-1"
                            title="Visit Website"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                        {company.linkedin_url && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(company.linkedin_url, "_blank", "noopener,noreferrer");
                            }}
                            className="text-white/60 hover:text-blue-400 transition-colors p-1"
                            title="View LinkedIn Profile"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                          </button>
                        )}
                        {company.trialAvailable && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-green-300 text-xs font-medium">Trial</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {/* Section Icons */}
                        {availableSections.slice(0, 5).map((section) => (
                          <div key={section} className="text-white/60" title={section}>
                            {getSectionIcon(section)}
                          </div>
                        ))}
                        {availableSections.length > 5 && (
                          <span className="text-xs text-white/60">+{availableSections.length - 5}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Expanded View - Full Details */}
                {isExpanded && (
                  <div className="space-y-4 blank-area" onClick={(e) => e.stopPropagation()}>
                    
                    {/* Company Info Grid */}
                    <div className="grid grid-cols-4 gap-3 text-xs">
                      {hasData(company.location) && (
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <MapPin className="w-3 h-3 text-white/60" />
                            <span className="font-semibold text-white">Location</span>
                          </div>
                          <div className="text-white/80">{company.location}</div>
                        </div>
                      )}
                      {hasData(company.employees) && (
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <Users className="w-3 h-3 text-white/60" />
                            <span className="font-semibold text-white">Employees</span>
                          </div>
                          <div className="text-white/80">{company.employees}</div>
                        </div>
                      )}
                      {hasData(company.founded) && (
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <Calendar className="w-3 h-3 text-white/60" />
                            <span className="font-semibold text-white">Founded</span>
                          </div>
                          <div className="text-white/80">{company.founded}</div>
                        </div>
                      )}
                      {hasData(company.companyStage) && (
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <TrendingUp className="w-3 h-3 text-white/60" />
                            <span className="font-semibold text-white">Stage</span>
                          </div>
                          <div className="text-white/80">{company.companyStage}</div>
                        </div>
                      )}
                    </div>
                    
                    {/* New Fields Section */}
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      {hasData(company.customerSegments) && (
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <Target className="w-3 h-3 text-white/60" />
                            <span className="font-semibold text-white">Customer Segments</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {company.customerSegments!.map((segment, i) => (
                              <span key={i} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                                {segment}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {hasData(company.deploymentType) && (
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <Building2 className="w-3 h-3 text-white/60" />
                            <span className="font-semibold text-white">Deployment</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {company.deploymentType!.map((type, i) => (
                              <span key={i} className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {hasData(company.idealScenarios) && (
                        <div className="col-span-2">
                          <div className="flex items-center gap-1 mb-1">
                            <Briefcase className="w-3 h-3 text-white/60" />
                            <span className="font-semibold text-white">Ideal For</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {company.idealScenarios!.map((scenario, i) => (
                              <span key={i} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                                {scenario}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {company.trialAvailable && (
                        <div className="col-span-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-green-300 font-medium text-sm">Free Trial Available</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Industries */}
                    {hasData(company.industriesServed) && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-white/60" />
                          <h6 className="text-sm font-semibold text-white">Industries Served</h6>
                        </div>
                        <div className="flex flex-wrap items-center gap-1">
                          {(expandedIndustries[index] ? company.industriesServed : company.industriesServed!.slice(0, 3)).map((industry, i) => (
                            <span key={i} className="text-xs text-white/80">
                              {industry}{i < (expandedIndustries[index] ? company.industriesServed! : company.industriesServed!.slice(0, 3)).length - 1 ? ', ' : ''}
                            </span>
                          ))}
                          {company.industriesServed!.length > 3 && (
                            <button
                              onClick={() => toggleIndustriesExpansion(index)}
                              className="text-xs text-white/50 hover:text-white/80 underline ml-1"
                            >
                              {expandedIndustries[index] ? 'Show Less' : `+${company.industriesServed!.length - 3} more`}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Products/Services */}
                    {hasData(company.productsServices) && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="w-4 h-4 text-white/60" />
                          <h6 className="text-sm font-semibold text-white">Products & Services</h6>
                        </div>
                        <div className="space-y-1">
                          {(expandedProducts[index] ? company.productsServices : company.productsServices!.slice(0, 3)).map((product, i) => (
                            <div key={i} className="text-xs text-white/80 leading-relaxed">- {product.length > 120 ? product.substring(0, 120) + '...' : product}</div>
                          ))}
                          {company.productsServices!.length > 3 && (
                            <button
                              onClick={() => toggleProductsExpansion(index)}
                              className="text-xs text-white/60 hover:text-white/80 underline mt-1"
                            >
                              {expandedProducts[index] ? 'Show Less' : `Show ${company.productsServices!.length - 3} more products`}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    

                    {/* Key Specifications */}
                    {(hasData(company.specifications) || hasData(company.features)) && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Briefcase className="w-4 h-4 text-white/60" />
                          <h6 className="text-sm font-semibold text-white">Key Specifications</h6>
                        </div>
                        <div className="space-y-1">
                          {company.specifications ? company.specifications.slice(0, 5).map((spec, i) => (
                            <div key={i} className="text-xs text-white/80">- {spec}</div>
                          )) : (
                            company.features && company.features.slice(0, 5).map((feature, i) => (
                              <div key={i} className="text-xs text-white/80">- {feature}</div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Pricing Information */}
                    {hasMeaningfulPricing(company) && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-4 h-4 text-white/60" />
                          <h6 className="text-sm font-semibold text-white">Pricing Information</h6>
                        </div>
                        <div className="text-xs">
                          <div className="flex flex-wrap items-center gap-4">
                            {hasData(company.pricingRanges) && (
                              <div className="flex items-center gap-2">
                                <span className="text-white/60">Ranges:</span>
                                <div className="flex flex-wrap gap-1">
                                  {company.pricingRanges!.map((range, i) => (
                                    <span key={i} className="bg-green-500/20 text-green-300 px-2 py-1 rounded">
                                      {range}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {hasData(company.pricingModel) && (
                              <div className="flex items-center gap-2">
                                <span className="text-white/60">Models:</span>
                                <div className="flex flex-wrap gap-1">
                                  {company.pricingModel!.map((model, i) => (
                                    <span key={i} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                                      {model}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          {hasData(company.pricing) && !hasData(company.pricingRanges) && !hasData(company.pricingModel) && (
                            <div className="text-white/80 mt-2">{company.pricing}</div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Use Cases */}
                    {hasData(company.enhancedUseCases) && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-white/60" />
                          <h6 className="text-sm font-semibold text-white">Use Cases</h6>
                        </div>
                        <div className="space-y-1">
                          {(company.enhancedUseCases as string[]).slice(0, 3).map((useCase, i) => (
                            <div key={i} className="text-xs text-white/80">- {useCase}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Top Clients */}
                    {hasData(company.topClients) && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="w-4 h-4 text-white/60" />
                          <h6 className="text-sm font-semibold text-white">Notable Clients</h6>
                        </div>
                        <div className="text-xs text-white/80 leading-relaxed">
                          {company.topClients!.slice(0, 4).join(', ')}
                          {company.topClients!.length > 4 && ` and ${company.topClients!.length - 4} more`}
                        </div>
                      </div>
                    )}
                    
                    {/* About Company Dropdown */}
                    {hasData(company.enhancedAbout) && (
                      <div>
                        <button
                          onClick={() => toggleAboutDropdown(index)}
                          className="w-full text-left flex items-center justify-between text-sm font-semibold text-white hover:text-white/80 transition-colors py-2 border-t border-white/10"
                        >
                          <span>About Company</span>
                          <span className={`transform transition-transform ${aboutDropdownStates[index] ? 'rotate-180' : ''}`}>v</span>
                        </button>
                        {aboutDropdownStates[index] && (
                          <div className="mt-2 text-xs text-white/80 bg-white/5 p-3 rounded leading-relaxed max-h-32 overflow-y-auto">
                            {company.enhancedAbout}
                          </div>
                        )}
                      </div>
                    )}
                    

                  </div>
                )}
                
                {isExpanded && (
                  <div className="flex space-x-1 mt-auto">
                    <Button
                      onClick={() => handleChatClick(index)}
                      size="sm"
                      className="flex-1 bg-white text-black font-medium hover:bg-gray-100 text-xs px-2"
                    >
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Chat
                    </Button>
                    <Button
                      onClick={() => {
                        if ((company as any).phoneNumber) {
                          trackEngagement(company.name, 'click');
                          window.open(`tel:${(company as any).phoneNumber}`, '_self');
                        } else {
                          alert(`No phone number available for ${company.name}`);
                        }
                      }}
                      size="sm"
                      className="flex-1 bg-white text-black font-medium hover:bg-gray-100 text-xs px-2"
                    >
                      📞 Call
                    </Button>
                    <Button
                      onClick={() => handlePartnerRequest(company.name)}
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white font-medium hover:from-green-600 hover:to-blue-600 text-xs px-2"
                      title="Partner with this company"
                    >
                      <Handshake className="w-3 h-3 mr-1" />
                      Partner
                    </Button>
                    {company.website && company.website !== "#" && (
                      <Button
                        onClick={() => handleVisitWebsite(company.website, company.name)}
                        size="sm"
                        className="bg-white text-black font-medium hover:bg-gray-100 text-xs px-2"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
              );
            })}
          </div>
          {filteredCompanies.length > 1 && (
            <div className="flex justify-center mt-4">
              <div className="flex gap-1">
                {filteredCompanies.map((_, index) => (
                  <div 
                    key={index} 
                    className="w-2 h-2 rounded-full bg-white/20"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Desktop: Grid layout */}
        <div className="hidden md:block">
        {Array.from({length: Math.ceil(filteredCompanies.length / 3)}, (_, rowIndex) => (
          <div key={rowIndex} className="flex gap-6 overflow-x-auto mb-6" style={{scrollbarWidth: 'thin'}}>
            {filteredCompanies.slice(rowIndex * 3, (rowIndex + 1) * 3).map((company, relativeIndex) => {
              const index = rowIndex * 3 + relativeIndex;
          const availableSections = getAvailableSections(company);
          const isExpanded = expandedCards[index];
          const cardHeight = isExpanded ? "auto" : "200px";
          
          return (
          <div 
            key={index} 
            className={`gradient-company-card ${isExpanded ? 'expanded' : ''}`}
            onClick={isExpanded ? (e) => {
              // Only collapse if clicking on blank area (not on interactive elements)
              if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('blank-area')) {
                toggleCardExpansion(index);
              }
            } : undefined}
          >
            <div className="gradient-company-card-info">
            {chatStates[index] ? (
              <div className="space-y-3 h-full flex flex-col p-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-white text-base font-medium">{formatCompanyName(company.name)}</h5>
                  <Button
                    onClick={() => handleBackClick(index)}
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white/80 hover:bg-white/10 text-xs"
                  >
                    <ArrowLeft className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="bg-black/20 rounded-lg p-3 flex-1 overflow-y-auto space-y-2">
                  {(messages[index] || []).map((msg, msgIndex) => (
                    <div key={msgIndex} className={`text-xs ${msg.isUser ? 'text-right' : 'text-left'}`}>
                      <span className={`inline-block px-2 py-1 rounded ${msg.isUser ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/80'}`}>
                        {msg.text}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <Input
                    value={inputValues[index] || ""}
                    onChange={(e) => setInputValues(prev => ({...prev, [index]: e.target.value}))}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(index)}
                    placeholder="Type your message..."
                    className="flex-1 h-8 text-xs bg-white/5 border-white/20 text-white"
                  />
                  <Button
                    onClick={() => handleSendMessage(index)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Send className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className={`space-y-3 h-full flex flex-col p-4 ${isExpanded ? 'overflow-y-auto' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <motion.div
                      className={`${isExpanded ? 'w-12 h-12' : 'w-14 h-14'} rounded-full flex items-center justify-center overflow-hidden flex-shrink-0`}
                      style={{
                        background: company.logoUrl ? "transparent" : "linear-gradient(225deg, #171c2c 0%, #121624 100%)",
                        boxShadow: "0 4px 8px -1px rgba(0, 0, 0, 0.2), inset 1px 1px 3px rgba(255, 255, 255, 0.1), inset -1px -1px 2px rgba(0, 0, 0, 0.4)"
                      }}
                      whileHover={{ y: -1, boxShadow: "0 6px 12px -1px rgba(0, 0, 0, 0.3), inset 1px 1px 3px rgba(255, 255, 255, 0.15), inset -1px -1px 2px rgba(0, 0, 0, 0.5)" }}
                    >
                      {company.logoUrl ? (
                        <img src={company.logoUrl} alt={`${company.name} logo`} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className={`${isExpanded ? 'w-6 h-6' : 'w-7 h-7'} text-white`} />
                      )}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <h5 className={`text-white ${isExpanded ? 'text-lg' : 'text-xl'} font-semibold truncate`}>{formatCompanyName(company.name)}</h5>
                          {isExpanded && company.linkedin_url && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(company.linkedin_url, "_blank", "noopener,noreferrer");
                              }}
                              className="text-white/60 hover:text-blue-400 transition-colors flex-shrink-0"
                              title="View LinkedIn Profile"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                              </svg>
                            </button>
                          )}
                        </div>

                      </div>
                      <span className={`${isExpanded ? 'text-xs' : 'text-sm'} bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full font-medium`}>{company.category}</span>
                    </div>
                  </div>
                  {currentUser && (
                    <div className="flex space-x-1">
                      {isExpanded && (
                        <Button
                          onClick={() => toggleCardExpansion(index)}
                          size="sm"
                          variant="ghost"
                          className="p-1 h-auto"
                          title="Collapse card"
                        >
                          <X className="w-4 h-4 text-white/60 hover:text-white" />
                        </Button>
                      )}
                      <Button
                        onClick={() => handleCompareToggle(index)}
                        size="sm"
                        variant="ghost"
                        className="p-1 h-auto"
                      >
                        <GitCompare className={`w-4 h-4 ${selectedForComparison.has(index) ? 'text-blue-500' : 'text-white/40 hover:text-blue-400'}`} />
                      </Button>
                      <Button
                        onClick={() => {
                          const companyId = `company_${index}_${company.name}`;
                          if (isFavorite(companyId)) {
                            removeFromFavorites(companyId);
                          } else {
                            trackEngagement(company.name, 'save');
                            addToFavorites({
                              id: companyId,
                              type: 'company',
                              name: company.name,
                              description: company.description,
                              features: company.features,
                              pricing: company.pricing,
                              website: company.website,
                              category: company.category,
                              specifications: company.specifications,
                              location: company.location,
                              about: company.about,
                              linkedin_url: company.linkedin_url,
                              rating: company.rating,
                              companyStage: company.companyStage,
                              industriesServed: company.industriesServed,
                              pricingRanges: company.pricingRanges,
                              pricingModel: company.pricingModel,
                              employees: company.employees,
                              productsServices: company.productsServices,
                              topClients: company.topClients,
                              logoUrl: company.logoUrl,
                              founded: company.founded,
                              enhancedAbout: company.enhancedAbout,
                              enhancedUseCases: company.enhancedUseCases,
                              tagline: company.tagline,
                              trialAvailable: company.trialAvailable,
                              customerSegments: company.customerSegments,
                              uspTagline: company.uspTagline,
                              deploymentType: company.deploymentType,
                              idealScenarios: company.idealScenarios
                            }, showFavoritesNotification);
                          }
                        }}
                        size="sm"
                        variant="ghost"
                        className="p-1 h-auto"
                      >
                        <Heart className={`w-4 h-4 ${isFavorite(`company_${index}_${company.name}`) ? 'text-red-500 fill-current' : 'text-white/40 hover:text-red-400'}`} />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Compact View - Basic Info */}
                {!isExpanded && (
                  <div className="flex-1 flex flex-col justify-between">
                    {/* USP Tagline or Company Tagline */}
                    {(hasData(company.uspTagline) || hasData(company.tagline)) && (
                      <div className="mb-4">
                        <p className="text-sm text-white/80 leading-relaxed">
                          {company.uspTagline ? 
                            (company.uspTagline.length > 140 ? company.uspTagline.substring(0, 140) + '...' : company.uspTagline) :
                            (company.tagline!.length > 140 ? company.tagline!.substring(0, 140) + '...' : company.tagline)
                          }
                        </p>
                      </div>
                    )}
                    

                    
                    {/* Engagement Stats */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4 text-xs text-white/60">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{engagementData[company.name]?.views || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MousePointer className="w-3 h-3" />
                          <span>{engagementData[company.name]?.clicks || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          <span>{engagementData[company.name]?.saves || 0}</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => toggleCardExpansion(index)}
                        size="sm"
                        className="bg-white text-black hover:bg-gray-100 text-xs px-3 py-1 h-7"
                      >
                        Learn More
                      </Button>
                    </div>
                    
                    {/* Bottom section with icons and actions */}
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/10">
                      <div className="flex items-center gap-3">
                        {company.website && company.website !== "#" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVisitWebsite(company.website, company.name);
                            }}
                            className="text-white/60 hover:text-blue-400 transition-colors p-1"
                            title="Visit Website"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                        {company.linkedin_url && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(company.linkedin_url, "_blank", "noopener,noreferrer");
                            }}
                            className="text-white/60 hover:text-blue-400 transition-colors p-1"
                            title="View LinkedIn Profile"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                          </button>
                        )}
                        {company.trialAvailable && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-green-300 text-xs font-medium">Trial</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {/* Section Icons */}
                        {availableSections.slice(0, 5).map((section) => (
                          <div key={section} className="text-white/60" title={section}>
                            {getSectionIcon(section)}
                          </div>
                        ))}
                        {availableSections.length > 5 && (
                          <span className="text-xs text-white/60">+{availableSections.length - 5}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Expanded View - Full Details */}
                {isExpanded && (
                  <div className="space-y-4 blank-area" onClick={(e) => e.stopPropagation()}>
                    
                    {/* Company Info Grid */}
                    <div className="grid grid-cols-4 gap-3 text-xs">
                      {hasData(company.location) && (
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <MapPin className="w-3 h-3 text-white/60" />
                            <span className="font-semibold text-white">Location</span>
                          </div>
                          <div className="text-white/80">{company.location}</div>
                        </div>
                      )}
                      {hasData(company.employees) && (
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <Users className="w-3 h-3 text-white/60" />
                            <span className="font-semibold text-white">Employees</span>
                          </div>
                          <div className="text-white/80">{company.employees}</div>
                        </div>
                      )}
                      {hasData(company.founded) && (
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <Calendar className="w-3 h-3 text-white/60" />
                            <span className="font-semibold text-white">Founded</span>
                          </div>
                          <div className="text-white/80">{company.founded}</div>
                        </div>
                      )}
                      {hasData(company.companyStage) && (
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <TrendingUp className="w-3 h-3 text-white/60" />
                            <span className="font-semibold text-white">Stage</span>
                          </div>
                          <div className="text-white/80">{company.companyStage}</div>
                        </div>
                      )}
                    </div>
                    
                    {/* New Fields Section */}
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      {hasData(company.customerSegments) && (
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <Target className="w-3 h-3 text-white/60" />
                            <span className="font-semibold text-white">Customer Segments</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {company.customerSegments!.map((segment, i) => (
                              <span key={i} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                                {segment}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {hasData(company.deploymentType) && (
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <Building2 className="w-3 h-3 text-white/60" />
                            <span className="font-semibold text-white">Deployment</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {company.deploymentType!.map((type, i) => (
                              <span key={i} className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {hasData(company.idealScenarios) && (
                        <div className="col-span-2">
                          <div className="flex items-center gap-1 mb-1">
                            <Briefcase className="w-3 h-3 text-white/60" />
                            <span className="font-semibold text-white">Ideal For</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {company.idealScenarios!.map((scenario, i) => (
                              <span key={i} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                                {scenario}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {company.trialAvailable && (
                        <div className="col-span-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-green-300 font-medium text-sm">Free Trial Available</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Industries */}
                    {hasData(company.industriesServed) && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-white/60" />
                          <h6 className="text-sm font-semibold text-white">Industries Served</h6>
                        </div>
                        <div className="flex flex-wrap items-center gap-1">
                          {(expandedIndustries[index] ? company.industriesServed : company.industriesServed!.slice(0, 3)).map((industry, i) => (
                            <span key={i} className="text-xs text-white/80">
                              {industry}{i < (expandedIndustries[index] ? company.industriesServed! : company.industriesServed!.slice(0, 3)).length - 1 ? ', ' : ''}
                            </span>
                          ))}
                          {company.industriesServed!.length > 3 && (
                            <button
                              onClick={() => toggleIndustriesExpansion(index)}
                              className="text-xs text-white/50 hover:text-white/80 underline ml-1"
                            >
                              {expandedIndustries[index] ? 'Show Less' : `+${company.industriesServed!.length - 3} more`}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Products/Services */}
                    {hasData(company.productsServices) && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="w-4 h-4 text-white/60" />
                          <h6 className="text-sm font-semibold text-white">Products & Services</h6>
                        </div>
                        <div className="space-y-1">
                          {(expandedProducts[index] ? company.productsServices : company.productsServices!.slice(0, 3)).map((product, i) => (
                            <div key={i} className="text-xs text-white/80 leading-relaxed">- {product.length > 120 ? product.substring(0, 120) + '...' : product}</div>
                          ))}
                          {company.productsServices!.length > 3 && (
                            <button
                              onClick={() => toggleProductsExpansion(index)}
                              className="text-xs text-white/60 hover:text-white/80 underline mt-1"
                            >
                              {expandedProducts[index] ? 'Show Less' : `Show ${company.productsServices!.length - 3} more products`}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    

                    {/* Key Specifications */}
                    {(hasData(company.specifications) || hasData(company.features)) && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Briefcase className="w-4 h-4 text-white/60" />
                          <h6 className="text-sm font-semibold text-white">Key Specifications</h6>
                        </div>
                        <div className="space-y-1">
                          {company.specifications ? company.specifications.slice(0, 5).map((spec, i) => (
                            <div key={i} className="text-xs text-white/80">- {spec}</div>
                          )) : (
                            company.features && company.features.slice(0, 5).map((feature, i) => (
                              <div key={i} className="text-xs text-white/80">- {feature}</div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Pricing Information */}
                    {hasMeaningfulPricing(company) && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-4 h-4 text-white/60" />
                          <h6 className="text-sm font-semibold text-white">Pricing Information</h6>
                        </div>
                        <div className="text-xs">
                          <div className="flex flex-wrap items-center gap-4">
                            {hasData(company.pricingRanges) && (
                              <div className="flex items-center gap-2">
                                <span className="text-white/60">Ranges:</span>
                                <div className="flex flex-wrap gap-1">
                                  {company.pricingRanges!.map((range, i) => (
                                    <span key={i} className="bg-green-500/20 text-green-300 px-2 py-1 rounded">
                                      {range}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {hasData(company.pricingModel) && (
                              <div className="flex items-center gap-2">
                                <span className="text-white/60">Models:</span>
                                <div className="flex flex-wrap gap-1">
                                  {company.pricingModel!.map((model, i) => (
                                    <span key={i} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                                      {model}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          {hasData(company.pricing) && !hasData(company.pricingRanges) && !hasData(company.pricingModel) && (
                            <div className="text-white/80 mt-2">{company.pricing}</div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Use Cases */}
                    {hasData(company.enhancedUseCases) && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-white/60" />
                          <h6 className="text-sm font-semibold text-white">Use Cases</h6>
                        </div>
                        <div className="space-y-1">
                          {(company.enhancedUseCases as string[]).slice(0, 3).map((useCase, i) => (
                            <div key={i} className="text-xs text-white/80">- {useCase}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Top Clients */}
                    {hasData(company.topClients) && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="w-4 h-4 text-white/60" />
                          <h6 className="text-sm font-semibold text-white">Notable Clients</h6>
                        </div>
                        <div className="text-xs text-white/80 leading-relaxed">
                          {company.topClients!.slice(0, 4).join(', ')}
                          {company.topClients!.length > 4 && ` and ${company.topClients!.length - 4} more`}
                        </div>
                      </div>
                    )}
                    
                    {/* About Company Dropdown */}
                    {hasData(company.enhancedAbout) && (
                      <div>
                        <button
                          onClick={() => toggleAboutDropdown(index)}
                          className="w-full text-left flex items-center justify-between text-sm font-semibold text-white hover:text-white/80 transition-colors py-2 border-t border-white/10"
                        >
                          <span>About Company</span>
                          <span className={`transform transition-transform ${aboutDropdownStates[index] ? 'rotate-180' : ''}`}>v</span>
                        </button>
                        {aboutDropdownStates[index] && (
                          <div className="mt-2 text-xs text-white/80 bg-white/5 p-3 rounded leading-relaxed max-h-32 overflow-y-auto">
                            {company.enhancedAbout}
                          </div>
                        )}
                      </div>
                    )}
                    

                  </div>
                )}
                
                {isExpanded && (
                  <div className="flex space-x-1 mt-auto">
                    <Button
                      onClick={() => handleChatClick(index)}
                      size="sm"
                      className="flex-1 bg-white text-black font-medium hover:bg-gray-100 text-xs px-2"
                    >
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Chat
                    </Button>
                    <Button
                      onClick={() => {
                        if ((company as any).phoneNumber) {
                          trackEngagement(company.name, 'click');
                          window.open(`tel:${(company as any).phoneNumber}`, '_self');
                        } else {
                          alert(`No phone number available for ${company.name}`);
                        }
                      }}
                      size="sm"
                      className="flex-1 bg-white text-black font-medium hover:bg-gray-100 text-xs px-2"
                    >
                      📞 Call
                    </Button>
                    <Button
                      onClick={() => handlePartnerRequest(company.name)}
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white font-medium hover:from-green-600 hover:to-blue-600 text-xs px-2"
                      title="Partner with this company"
                    >
                      <Handshake className="w-3 h-3 mr-1" />
                      Partner
                    </Button>
                    {company.website && company.website !== "#" && (
                      <Button
                        onClick={() => handleVisitWebsite(company.website, company.name)}
                        size="sm"
                        className="bg-white text-black font-medium hover:bg-gray-100 text-xs px-2"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
              );
            })}
          </div>
        ))}
        </div>
        </div>
      
      )}
      
      {/* Compare Section - only show in grid mode */}
      {!tinderMode && selectedForComparison.size >= 2 && (
        <div className="mt-6 bg-black/20 backdrop-blur-3xl p-4 border border-white/10 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GitCompare className="w-5 h-5 text-blue-400" />
              <span className="text-white font-medium">
                {selectedForComparison.size} companies selected for comparison
              </span>
            </div>
            <Button
              onClick={handleCompare}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Compare
            </Button>
          </div>
        </div>
      )}
      
      {/* Comparison Popup */}
      {showComparisonPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-3xl flex items-center justify-center z-50 p-4">
          <div className="bg-black/90 backdrop-blur-3xl border border-white/20 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Company Comparison</h3>
              <Button
                onClick={closeComparisonPopup}
                size="sm"
                variant="ghost"
                className="p-1 h-auto text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {Array.from(selectedForComparison).map(index => (
                  <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                    {filteredCompanies[index].name}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              {isLoadingComparison ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                    <span className="text-white/70">Generating comparison...</span>
                  </div>
                </div>
              ) : (
                <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                  {comparisonResult}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Partner Popup */}
      <PartnerPopup
        isOpen={partnerPopup.isOpen}
        onClose={() => setPartnerPopup({isOpen: false, companyName: ""})}
        companyName={partnerPopup.companyName}
        searchQuery={searchQuery}
        onSubmit={handlePartnerSubmit}
      />
      
      {/* Success Notification */}
      <PartnerSuccessNotification
        isVisible={showSuccessNotification.isVisible}
        companyName={showSuccessNotification.companyName}
      />
    </div>
  );
}