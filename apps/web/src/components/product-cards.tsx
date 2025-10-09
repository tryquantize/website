import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Package, Heart, MapPin, Users, Calendar, TrendingUp, DollarSign, Target, Briefcase, Award, ChevronDown, ChevronUp, Building2 } from "lucide-react";
import { useFavorites } from "@/contexts/favorites-context";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { useNotification } from "@/contexts/notification-context";
import { GradientCardBase } from "@/components/ui/gradient-card-base";
import { motion } from "framer-motion";

interface Product {
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

interface ProductCardsProps {
  products: Product[];
}

export function ProductCards({ products }: ProductCardsProps) {
  const [expandedCards, setExpandedCards] = useState<{[key: number]: boolean}>({});
  const [expandedIndustries, setExpandedIndustries] = useState<{[key: number]: boolean}>({});
  const [expandedProducts, setExpandedProducts] = useState<{[key: number]: boolean}>({});
  const [aboutDropdownStates, setAboutDropdownStates] = useState<{[key: number]: boolean}>({});
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { currentUser } = useFirebaseAuth();
  const { showFavoritesNotification } = useNotification();
  
  const handleTryProduct = (website: string) => {
    if (website && website !== "#") {
      window.open(website, "_blank", "noopener,noreferrer");
    }
  };

  const toggleCardExpansion = (index: number) => {
    setExpandedCards(prev => ({...prev, [index]: !prev[index]}));
  };

  const toggleIndustriesExpansion = (index: number) => {
    setExpandedIndustries(prev => ({...prev, [index]: !prev[index]}));
  };

  const toggleProductsExpansion = (index: number) => {
    setExpandedProducts(prev => ({...prev, [index]: !prev[index]}));
  };

  const toggleAboutDropdown = (index: number) => {
    setAboutDropdownStates(prev => ({...prev, [index]: !prev[index]}));
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

  // Get available sections for a product
  const getAvailableSections = (product: Product) => {
    const sections = [];
    if (hasData(product.specifications) || hasData(product.features)) sections.push('specifications');
    if (hasData(product.pricingRanges) || hasData(product.pricingModel) || hasData(product.pricing)) sections.push('pricing');
    if (hasData(product.location)) sections.push('location');
    if (hasData(product.employees)) sections.push('employees');
    if (hasData(product.founded)) sections.push('founded');
    if (hasData(product.companyStage)) sections.push('stage');
    if (hasData(product.industriesServed)) sections.push('industries');
    if (hasData(product.productsServices)) sections.push('products');
    if (hasData(product.topClients)) sections.push('clients');
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
        {products.map((product, index) => {
          const availableSections = getAvailableSections(product);
          const isExpanded = expandedCards[index];
          const cardHeight = isExpanded ? "auto" : "400px";
          
          return (
          <GradientCardBase key={index} className="min-w-[600px] max-w-[600px] flex-shrink-0" width="600px" height={cardHeight}>
            <div className={`space-y-3 h-full flex flex-col p-4 ${isExpanded ? 'overflow-y-auto' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
                    style={{
                      background: product.logoUrl ? "transparent" : "linear-gradient(225deg, #171c2c 0%, #121624 100%)",
                      boxShadow: "0 4px 8px -1px rgba(0, 0, 0, 0.2), inset 1px 1px 3px rgba(255, 255, 255, 0.1), inset -1px -1px 2px rgba(0, 0, 0, 0.4)"
                    }}
                    whileHover={{ y: -1, boxShadow: "0 6px 12px -1px rgba(0, 0, 0, 0.3), inset 1px 1px 3px rgba(255, 255, 255, 0.15), inset -1px -1px 2px rgba(0, 0, 0, 0.5)" }}
                  >
                    {product.logoUrl ? (
                      <img src={product.logoUrl} alt={`${product.name} logo`} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-5 h-5 text-white" />
                    )}
                  </motion.div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="text-white text-lg font-semibold">{product.name}</h5>
                      <div className="flex items-center gap-1">
                        {product.linkedin_url && (
                          <button
                            onClick={() => window.open(product.linkedin_url, "_blank", "noopener,noreferrer")}
                            className="text-white/80 hover:text-blue-400 transition-colors"
                            title="View LinkedIn Profile"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                          </button>
                        )}
                        {product.website && product.website !== "#" && (
                          <button
                            onClick={() => handleTryProduct(product.website)}
                            className="text-white/80 hover:text-blue-400 transition-colors"
                            title="Visit Website"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                        {/* Section Icons */}
                        <div className="flex items-center gap-1 ml-2">
                          {availableSections.slice(0, 6).map((section) => (
                            <div key={section} className="text-white/60 hover:text-white transition-colors" title={section}>
                              {getSectionIcon(section)}
                            </div>
                          ))}
                          {availableSections.length > 6 && (
                            <span className="text-xs text-white/60">+{availableSections.length - 6}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">{product.category}</span>
                  </div>
                </div>
                {currentUser && (
                  <Button
                    onClick={() => {
                      const productId = `product_${index}_${product.name}`;
                      if (isFavorite(productId)) {
                        removeFromFavorites(productId);
                      } else {
                        addToFavorites({
                          id: productId,
                          type: 'product',
                          name: product.name,
                          description: product.description,
                          features: product.features,
                          pricing: product.pricing,
                          website: product.website,
                          category: product.category,
                          specifications: product.specifications,
                          location: product.location,
                          about: product.about,
                          linkedin_url: product.linkedin_url,
                          rating: product.rating,
                          companyStage: product.companyStage,
                          industriesServed: product.industriesServed,
                          pricingRanges: product.pricingRanges,
                          pricingModel: product.pricingModel,
                          employees: product.employees,
                          productsServices: product.productsServices,
                          topClients: product.topClients,
                          logoUrl: product.logoUrl,
                          founded: product.founded,
                          enhancedAbout: product.enhancedAbout
                        }, showFavoritesNotification);
                      }
                    }}
                    size="sm"
                    variant="ghost"
                    className="p-1 h-auto"
                  >
                    <Heart className={`w-4 h-4 ${isFavorite(`product_${index}_${product.name}`) ? 'text-red-500 fill-current' : 'text-white/40 hover:text-red-400'}`} />
                  </Button>
                )}
              </div>

              {/* Compact View - Basic Info */}
              {!isExpanded && (
                <div className="space-y-3">
                  <p className="text-white/80 text-sm line-clamp-2">{product.description}</p>
                  
                  {/* Quick Info Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {hasData(product.location) && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-white/60" />
                        <span className="text-white">{product.location}</span>
                      </div>
                    )}
                    {hasData(product.employees) && (
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3 text-white/60" />
                        <span className="text-white">{product.employees}</span>
                      </div>
                    )}
                    {hasData(product.founded) && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-white/60" />
                        <span className="text-white">{product.founded}</span>
                      </div>
                    )}
                    {hasData(product.companyStage) && (
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-3 h-3 text-white/60" />
                        <span className="text-white">{product.companyStage}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Expand Button */}
                  <button
                    onClick={() => toggleCardExpansion(index)}
                    className="w-full flex items-center justify-center gap-2 py-2 text-white/60 hover:text-white transition-colors border-t border-white/10 mt-4"
                  >
                    <span className="text-sm">View Details</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Expanded View - Full Details */}
              {isExpanded && (
                <div className="space-y-4">
                  <p className="text-white/80 text-sm">{product.description}</p>
                  
                  {/* Product Info Grid */}
                  <div className="grid grid-cols-4 gap-3 text-xs">
                    {hasData(product.location) && (
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <MapPin className="w-3 h-3 text-white/60" />
                          <span className="font-semibold text-white">Location</span>
                        </div>
                        <div className="text-white/80">{product.location}</div>
                      </div>
                    )}
                    {hasData(product.employees) && (
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <Users className="w-3 h-3 text-white/60" />
                          <span className="font-semibold text-white">Employees</span>
                        </div>
                        <div className="text-white/80">{product.employees}</div>
                      </div>
                    )}
                    {hasData(product.founded) && (
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <Calendar className="w-3 h-3 text-white/60" />
                          <span className="font-semibold text-white">Founded</span>
                        </div>
                        <div className="text-white/80">{product.founded}</div>
                      </div>
                    )}
                    {hasData(product.companyStage) && (
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <TrendingUp className="w-3 h-3 text-white/60" />
                          <span className="font-semibold text-white">Stage</span>
                        </div>
                        <div className="text-white/80">{product.companyStage}</div>
                      </div>
                    )}
                  </div>
                  
                  {/* Key Specifications */}
                  {(hasData(product.specifications) || hasData(product.features)) && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="w-4 h-4 text-white/60" />
                        <h6 className="text-sm font-semibold text-white">Key Specifications</h6>
                      </div>
                      <div className="space-y-1">
                        {product.specifications ? product.specifications.slice(0, 5).map((spec, i) => (
                          <div key={i} className="text-xs text-white/80">• {spec}</div>
                        )) : (
                          product.features && product.features.slice(0, 5).map((feature, i) => (
                            <div key={i} className="text-xs text-white/80">• {feature}</div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Pricing Information */}
                  {(hasData(product.pricingRanges) || hasData(product.pricingModel) || hasData(product.pricing)) && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-white/60" />
                        <h6 className="text-sm font-semibold text-white">Pricing Information</h6>
                      </div>
                      <div className="space-y-2 text-xs">
                        {hasData(product.pricingRanges) && (
                          <div className="flex items-center gap-2">
                            <span className="text-white/60">Ranges:</span>
                            <div className="flex flex-wrap gap-1">
                              {product.pricingRanges!.map((range, i) => (
                                <span key={i} className="bg-green-500/20 text-green-300 px-2 py-1 rounded">
                                  {range}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {hasData(product.pricingModel) && (
                          <div className="flex items-center gap-2">
                            <span className="text-white/60">Models:</span>
                            <div className="flex flex-wrap gap-1">
                              {product.pricingModel!.map((model, i) => (
                                <span key={i} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                                  {model}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {hasData(product.pricing) && !hasData(product.pricingRanges) && !hasData(product.pricingModel) && (
                          <div className="text-white/80">{product.pricing}</div>
                        )}
                      </div>
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
              
              <div className="flex space-x-1 mt-auto">
                <Button
                  onClick={() => handleTryProduct(product.website)}
                  className="flex-1 bg-white text-black font-medium hover:bg-gray-100 text-xs px-2"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Try This Product!
                </Button>
              </div>
            </div>
          </GradientCardBase>
          );
        })}
      </div>
    </div>
  );
}