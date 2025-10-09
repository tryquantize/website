import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, ExternalLink, ArrowLeft, Send, Heart, Building2, GitCompare, X, Loader2, MapPin, Users, Calendar, TrendingUp, DollarSign, Target, Briefcase, Award, ChevronDown, ChevronUp } from "lucide-react";
import { useFavorites } from "@/contexts/favorites-context";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { useNotification } from "@/contexts/notification-context";
import { GradientCardBase } from "@/components/ui/gradient-card-base";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";

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

}

interface CompanyCardsProps {
  companies: Company[];
  webSearchEnabled?: boolean;
  searchQuery?: string;
}

export function CompanyCards({ companies, webSearchEnabled, searchQuery }: CompanyCardsProps) {
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

  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { currentUser } = useFirebaseAuth();
  const { showFavoritesNotification } = useNotification();

  const handleChatClick = (index: number) => {
    setChatStates(prev => ({...prev, [index]: true}));
    if (!messages[index]) {
      setMessages(prev => ({...prev, [index]: [{text: `Hi! I'm here to help you learn more about ${companies[index].name}. What would you like to know?`, isUser: false}]}));
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
        {text: `Thanks for your message about ${companies[index].name}. Our team will get back to you soon!`, isUser: false}
      ]
    }));
    setInputValues(prev => ({...prev, [index]: ""}));
  };

  const handleVisitWebsite = (website: string) => {
    if (website && website !== "#") {
      window.open(website, "_blank", "noopener,noreferrer");
    }
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
      const selectedCompanies = Array.from(selectedForComparison).map(index => companies[index]);
      
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

    if (hasMeaningfulPricing(company)) sections.push('pricing');
    if (hasData(company.location)) sections.push('location');
    if (hasData(company.employees)) sections.push('employees');
    if (hasData(company.founded)) sections.push('founded');
    if (hasData(company.companyStage)) sections.push('stage');
    if (hasData(company.industriesServed)) sections.push('industries');
    if (hasData(company.productsServices)) sections.push('products');
    if (hasData(company.topClients)) sections.push('clients');
    return sections;
  };

  // Get icon for section
  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'specifications': return <Briefcase className="w-4 h-4 text-white" />;

      case 'pricing': return <DollarSign className="w-4 h-4 text-white" />;
      case 'location': return <MapPin className="w-4 h-4 text-white" />;
      case 'employees': return <Users className="w-4 h-4 text-white" />;
      case 'founded': return <Calendar className="w-4 h-4 text-white" />;
      case 'stage': return <TrendingUp className="w-4 h-4 text-white" />;
      case 'industries': return <Target className="w-4 h-4 text-white" />;
      case 'products': return <Award className="w-4 h-4 text-white" />;
      case 'clients': return <Building2 className="w-4 h-4 text-white" />;
      default: return <Briefcase className="w-4 h-4 text-white" />;
    }
  };

  return (
    <div className="mt-6">
      <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-2" style={{scrollbarWidth: 'thin'}}>
        {companies.map((company, index) => {
          const availableSections = getAvailableSections(company);
          const isExpanded = expandedCards[index];
          const cardHeight = isExpanded ? "auto" : "200px";
          
          return (
          <GradientCardBase key={index} className={`${isExpanded ? 'min-w-[600px] max-w-[600px]' : 'min-w-[300px] max-w-[300px]'} flex-shrink-0`} width={isExpanded ? "600px" : "300px"} height={cardHeight}>
            {chatStates[index] ? (
              <div className="space-y-3 h-full flex flex-col p-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-white text-base font-medium">{company.name}</h5>
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
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
                      style={{
                        background: company.logoUrl ? "transparent" : "linear-gradient(225deg, #171c2c 0%, #121624 100%)",
                        boxShadow: "0 4px 8px -1px rgba(0, 0, 0, 0.2), inset 1px 1px 3px rgba(255, 255, 255, 0.1), inset -1px -1px 2px rgba(0, 0, 0, 0.4)"
                      }}
                      whileHover={{ y: -1, boxShadow: "0 6px 12px -1px rgba(0, 0, 0, 0.3), inset 1px 1px 3px rgba(255, 255, 255, 0.15), inset -1px -1px 2px rgba(0, 0, 0, 0.5)" }}
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
                          <h5 className="text-white text-lg font-semibold">{company.name}</h5>
                          {isExpanded && company.linkedin_url && (
                            <button
                              onClick={() => window.open(company.linkedin_url, "_blank", "noopener,noreferrer")}
                              className="text-white/60 hover:text-blue-400 transition-colors"
                              title="View LinkedIn Profile"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                              </svg>
                            </button>
                          )}
                        </div>
                        {isExpanded && (
                          <button
                            onClick={() => toggleCardExpansion(index)}
                            className="text-white/60 hover:text-white transition-colors"
                          >
                            <ChevronUp className="w-6 h-6" />
                          </button>
                        )}
                      </div>
                      <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">{company.category}</span>
                    </div>
                  </div>
                  {currentUser && (
                    <div className="flex space-x-1">
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
                              enhancedAbout: company.enhancedAbout
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
                  <div 
                    className="cursor-pointer flex-1 flex flex-col justify-between"
                    onClick={() => toggleCardExpansion(index)}
                  >
                    {/* Expand Arrow */}
                    <div className="flex justify-end mb-2">
                      <ChevronDown className="w-4 h-4 text-white/60" />
                    </div>
                    
                    {/* Icons at bottom */}
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        {company.website && company.website !== "#" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVisitWebsite(company.website);
                            }}
                            className="text-white/60 hover:text-blue-400 transition-colors"
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
                            className="text-white/60 hover:text-blue-400 transition-colors"
                            title="View LinkedIn Profile"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {/* Section Icons */}
                        {availableSections.slice(0, 4).map((section) => (
                          <div key={section} className="text-white/60" title={section}>
                            {getSectionIcon(section)}
                          </div>
                        ))}
                        {availableSections.length > 4 && (
                          <span className="text-xs text-white/60">+{availableSections.length - 4}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Expanded View - Full Details */}
                {isExpanded && (
                  <div className="space-y-4">
                    
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
                            <div key={i} className="text-xs text-white/80 leading-relaxed">• {product.length > 120 ? product.substring(0, 120) + '...' : product}</div>
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
                            <div key={i} className="text-xs text-white/80">• {spec}</div>
                          )) : (
                            company.features && company.features.slice(0, 5).map((feature, i) => (
                              <div key={i} className="text-xs text-white/80">• {feature}</div>
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
                          <span className={`transform transition-transform ${aboutDropdownStates[index] ? 'rotate-180' : ''}`}>▼</span>
                        </button>
                        {aboutDropdownStates[index] && (
                          <div className="mt-2 text-xs text-white/80 bg-white/5 p-3 rounded leading-relaxed max-h-32 overflow-y-auto">
                            {company.enhancedAbout}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Collapse Button */}
                    <button
                      onClick={() => toggleCardExpansion(index)}
                      className="w-full flex items-center justify-center gap-2 py-2 text-white/60 hover:text-white transition-colors border-t border-white/10 mt-4"
                    >
                      <span className="text-sm">Show Less</span>
                      <ChevronUp className="w-4 h-4" />
                    </button>
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
                    {company.website && company.website !== "#" && (
                      <Button
                        onClick={() => handleVisitWebsite(company.website)}
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
          </GradientCardBase>
          );
        })}
      </div>
      
      {/* Compare Section */}
      {selectedForComparison.size >= 2 && (
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
                    {companies[index].name}
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
    </div>
  );
}