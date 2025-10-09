import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, ExternalLink, ArrowLeft, Send, Heart, Package, User, Building2, MapPin, Users, Calendar, TrendingUp, DollarSign, Target, Briefcase, Award, ChevronDown, ChevronUp } from "lucide-react";
import { useFavorites, FavoriteItem } from "@/contexts/favorites-context";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { GradientCardBase } from "@/components/ui/gradient-card-base";
import { motion } from "framer-motion";

interface FavoritesCardProps {
  item: FavoriteItem;
}

export function FavoritesCard({ item }: FavoritesCardProps) {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([{text: `Hi! I'm here to help you learn more about ${item.name}. What would you like to know?`, isUser: false}]);
  const [inputValue, setInputValue] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedIndustries, setExpandedIndustries] = useState(false);
  const [expandedProducts, setExpandedProducts] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const { removeFromFavorites } = useFavorites();

  const handleSendMessage = () => {
    const message = inputValue.trim();
    if (!message) return;

    setMessages(prev => [...prev, 
      {text: message, isUser: true},
      {text: `Thanks for your message about ${item.name}. Our team will get back to you soon!`, isUser: false}
    ]);
    setInputValue("");
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

  // Get available sections for the item
  const getAvailableSections = (item: FavoriteItem) => {
    const sections = [];
    if (hasData(item.specifications) || hasData(item.features)) sections.push('specifications');
    if (hasData(item.pricingRanges) || hasData(item.pricingModel) || hasData(item.pricing)) sections.push('pricing');
    if (hasData(item.location)) sections.push('location');
    if (hasData(item.employees)) sections.push('employees');
    if (hasData(item.founded)) sections.push('founded');
    if (hasData(item.companyStage)) sections.push('stage');
    if (hasData(item.industriesServed)) sections.push('industries');
    if (hasData(item.productsServices)) sections.push('products');
    if (hasData(item.topClients)) sections.push('clients');
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

  const handleVisitWebsite = (website: string) => {
    if (website && website !== "#") {
      window.open(website, "_blank", "noopener,noreferrer");
    }
  };

  const getIcon = () => {
    switch (item.type) {
      case 'company': return <Building2 className="w-4 h-4 text-white" />;
      case 'product': return <Package className="w-4 h-4 text-white" />;
      case 'freelancer': return <User className="w-4 h-4 text-white" />;
      default: return <Package className="w-4 h-4 text-white" />;
    }
  };

  const getActionButton = () => {
    if (item.type === 'freelancer') {
      return (
        <Button
          onClick={() => alert(`Hiring ${item.name}...`)}
          size="sm"
          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs px-2"
        >
          💼 Hire
        </Button>
      );
    } else {
      return (
        <Button
          onClick={() => alert(`Calling ${item.name}...`)}
          size="sm"
          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs px-2"
        >
          📞 Call
        </Button>
      );
    }
  };

  const availableSections = getAvailableSections(item);
  const cardHeight = isExpanded ? "auto" : "400px";

  if (chatOpen) {
    return (
      <GradientCardBase className="min-w-[600px] max-w-[600px] flex-shrink-0" width="600px" height="400px">
        <div className="space-y-3 h-full flex flex-col p-4">
          <div className="flex items-center justify-between">
            <h5 className="text-white text-base font-medium">{item.name}</h5>
            <Button
              onClick={() => setChatOpen(false)}
              size="sm"
              variant="outline"
              className="border-white/20 text-white/80 hover:bg-white/10 text-xs"
            >
              <ArrowLeft className="w-3 h-3" />
            </Button>
          </div>
          
          <div className="bg-black/20 rounded-lg p-3 flex-1 overflow-y-auto space-y-2">
            {messages.map((msg, msgIndex) => (
              <div key={msgIndex} className={`text-xs ${msg.isUser ? 'text-right' : 'text-left'}`}>
                <span className={`inline-block px-2 py-1 rounded ${msg.isUser ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/80'}`}>
                  {msg.text}
                </span>
              </div>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 h-8 text-xs bg-white/5 border-white/20 text-white"
            />
            <Button
              onClick={handleSendMessage}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </GradientCardBase>
    );
  }

  return (
    <GradientCardBase className="min-w-[600px] max-w-[600px] flex-shrink-0" width="600px" height={cardHeight}>
      <div className={`space-y-3 h-full flex flex-col p-4 ${isExpanded ? 'overflow-y-auto' : ''}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
              style={{
                background: item.logoUrl ? "transparent" : "linear-gradient(225deg, #171c2c 0%, #121624 100%)",
                boxShadow: "0 4px 8px -1px rgba(0, 0, 0, 0.2), inset 1px 1px 3px rgba(255, 255, 255, 0.1), inset -1px -1px 2px rgba(0, 0, 0, 0.4)"
              }}
              whileHover={{ y: -1, boxShadow: "0 6px 12px -1px rgba(0, 0, 0, 0.3), inset 1px 1px 3px rgba(255, 255, 255, 0.15), inset -1px -1px 2px rgba(0, 0, 0, 0.5)" }}
            >
              {item.logoUrl ? (
                <img src={item.logoUrl} alt={`${item.name} logo`} className="w-full h-full object-cover" />
              ) : (
                getIcon()
              )}
            </motion.div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h5 className="text-white text-lg font-semibold">{item.name}</h5>
                <div className="flex items-center gap-1">
                  {item.linkedin_url && (
                    <button
                      onClick={() => window.open(item.linkedin_url, "_blank", "noopener,noreferrer")}
                      className="text-white/80 hover:text-blue-400 transition-colors"
                      title="View LinkedIn Profile"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </button>
                  )}
                  {item.website && item.website !== "#" && (
                    <button
                      onClick={() => handleVisitWebsite(item.website)}
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
              <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">{item.category}</span>
            </div>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="p-1 h-auto"
              >
                <Heart className="w-4 h-4 text-red-500 fill-current" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-black/90 border-white/20">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">Remove from Favorites</AlertDialogTitle>
                <AlertDialogDescription className="text-white/70">
                  Are you sure you want to remove "{item.name}" from your favorites?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20">Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => removeFromFavorites(item.id)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Compact View - Basic Info */}
        {!isExpanded && (
          <div className="space-y-3">
            <p className="text-white/80 text-sm line-clamp-2">{item.description}</p>
            
            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              {hasData(item.location) && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-white/60" />
                  <span className="text-white">{item.location}</span>
                </div>
              )}
              {hasData(item.employees) && (
                <div className="flex items-center gap-2">
                  <Users className="w-3 h-3 text-white/60" />
                  <span className="text-white">{item.employees}</span>
                </div>
              )}
              {hasData(item.founded) && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-white/60" />
                  <span className="text-white">{item.founded}</span>
                </div>
              )}
              {hasData(item.companyStage) && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 text-white/60" />
                  <span className="text-white">{item.companyStage}</span>
                </div>
              )}
            </div>
            
            {/* Expand Button */}
            <button
              onClick={() => setIsExpanded(true)}
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
            <p className="text-white/80 text-sm">{item.description}</p>
            
            {/* Company Info Grid */}
            <div className="grid grid-cols-4 gap-3 text-xs">
              {hasData(item.location) && (
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <MapPin className="w-3 h-3 text-white/60" />
                    <span className="font-semibold text-white">Location</span>
                  </div>
                  <div className="text-white/80">{item.location}</div>
                </div>
              )}
              {hasData(item.employees) && (
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Users className="w-3 h-3 text-white/60" />
                    <span className="font-semibold text-white">Employees</span>
                  </div>
                  <div className="text-white/80">{item.employees}</div>
                </div>
              )}
              {hasData(item.founded) && (
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Calendar className="w-3 h-3 text-white/60" />
                    <span className="font-semibold text-white">Founded</span>
                  </div>
                  <div className="text-white/80">{item.founded}</div>
                </div>
              )}
              {hasData(item.companyStage) && (
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <TrendingUp className="w-3 h-3 text-white/60" />
                    <span className="font-semibold text-white">Stage</span>
                  </div>
                  <div className="text-white/80">{item.companyStage}</div>
                </div>
              )}
            </div>
            
            {/* Industries */}
            {hasData(item.industriesServed) && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-white/60" />
                  <h6 className="text-sm font-semibold text-white">Industries Served</h6>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  {(expandedIndustries ? item.industriesServed : item.industriesServed!.slice(0, 3)).map((industry, i) => (
                    <span key={i} className="text-xs text-white/80">
                      {industry}{i < (expandedIndustries ? item.industriesServed! : item.industriesServed!.slice(0, 3)).length - 1 ? ', ' : ''}
                    </span>
                  ))}
                  {item.industriesServed!.length > 3 && (
                    <button
                      onClick={() => setExpandedIndustries(!expandedIndustries)}
                      className="text-xs text-white/50 hover:text-white/80 underline ml-1"
                    >
                      {expandedIndustries ? 'Show Less' : `+${item.industriesServed!.length - 3} more`}
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* Products/Services */}
            {hasData(item.productsServices) && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-white/60" />
                  <h6 className="text-sm font-semibold text-white">Products & Services</h6>
                </div>
                <div className="space-y-1">
                  {(expandedProducts ? item.productsServices : item.productsServices!.slice(0, 3)).map((product, i) => (
                    <div key={i} className="text-xs text-white/80 leading-relaxed">• {product.length > 120 ? product.substring(0, 120) + '...' : product}</div>
                  ))}
                  {item.productsServices!.length > 3 && (
                    <button
                      onClick={() => setExpandedProducts(!expandedProducts)}
                      className="text-xs text-white/60 hover:text-white/80 underline mt-1"
                    >
                      {expandedProducts ? 'Show Less' : `Show ${item.productsServices!.length - 3} more products`}
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* Key Specifications */}
            {(hasData(item.specifications) || hasData(item.features)) && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="w-4 h-4 text-white/60" />
                  <h6 className="text-sm font-semibold text-white">Key Specifications</h6>
                </div>
                <div className="space-y-1">
                  {item.specifications ? item.specifications.slice(0, 5).map((spec, i) => (
                    <div key={i} className="text-xs text-white/80">• {spec}</div>
                  )) : (
                    item.features && item.features.slice(0, 5).map((feature, i) => (
                      <div key={i} className="text-xs text-white/80">• {feature}</div>
                    ))
                  )}
                </div>
              </div>
            )}
            
            {/* Pricing Information */}
            {(hasData(item.pricingRanges) || hasData(item.pricingModel) || hasData(item.pricing)) && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-white/60" />
                  <h6 className="text-sm font-semibold text-white">Pricing Information</h6>
                </div>
                <div className="space-y-2 text-xs">
                  {hasData(item.pricingRanges) && (
                    <div className="flex items-center gap-2">
                      <span className="text-white/60">Ranges:</span>
                      <div className="flex flex-wrap gap-1">
                        {item.pricingRanges!.map((range, i) => (
                          <span key={i} className="bg-green-500/20 text-green-300 px-2 py-1 rounded">
                            {range}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {hasData(item.pricingModel) && (
                    <div className="flex items-center gap-2">
                      <span className="text-white/60">Models:</span>
                      <div className="flex flex-wrap gap-1">
                        {item.pricingModel!.map((model, i) => (
                          <span key={i} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                            {model}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {hasData(item.pricing) && !hasData(item.pricingRanges) && !hasData(item.pricingModel) && (
                    <div className="text-white/80">{item.pricing}</div>
                  )}
                </div>
              </div>
            )}
            
            {/* Top Clients */}
            {hasData(item.topClients) && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-white/60" />
                  <h6 className="text-sm font-semibold text-white">Notable Clients</h6>
                </div>
                <div className="text-xs text-white/80 leading-relaxed">
                  {item.topClients!.slice(0, 4).join(', ')}
                  {item.topClients!.length > 4 && ` and ${item.topClients!.length - 4} more`}
                </div>
              </div>
            )}
            
            {/* About Company Dropdown */}
            {hasData(item.enhancedAbout) && (
              <div>
                <button
                  onClick={() => setAboutDropdownOpen(!aboutDropdownOpen)}
                  className="w-full text-left flex items-center justify-between text-sm font-semibold text-white hover:text-white/80 transition-colors py-2 border-t border-white/10"
                >
                  <span>About Company</span>
                  <span className={`transform transition-transform ${aboutDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {aboutDropdownOpen && (
                  <div className="mt-2 text-xs text-white/80 bg-white/5 p-3 rounded leading-relaxed">
                    {item.enhancedAbout}
                  </div>
                )}
              </div>
            )}
            
            {/* Collapse Button */}
            <button
              onClick={() => setIsExpanded(false)}
              className="w-full flex items-center justify-center gap-2 py-2 text-white/60 hover:text-white transition-colors border-t border-white/10 mt-4"
            >
              <span className="text-sm">Show Less</span>
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <div className="flex space-x-1 mt-auto">
          <Button
            onClick={() => setChatOpen(true)}
            size="sm"
            className="flex-1 bg-white text-black font-medium hover:bg-gray-100 text-xs px-2"
          >
            <MessageCircle className="w-3 h-3 mr-1" />
            Chat
          </Button>
          {getActionButton()}
        </div>
      </div>
    </GradientCardBase>
  );
}