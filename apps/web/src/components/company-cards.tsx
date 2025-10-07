import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, ExternalLink, ArrowLeft, Send, Heart, Building2, GitCompare, X, Loader2 } from "lucide-react";
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
  rating?: {
    rating: number;
    reviews: number;
  };
}

interface CompanyCardsProps {
  companies: Company[];
}

export function CompanyCards({ companies }: CompanyCardsProps) {
  const [chatStates, setChatStates] = useState<{[key: number]: boolean}>({});
  const [messages, setMessages] = useState<{[key: number]: Array<{text: string, isUser: boolean}>}>({});
  const [inputValues, setInputValues] = useState<{[key: number]: string}>({});
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

  return (
    <div className="mt-6">
      <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-2" style={{scrollbarWidth: 'thin'}}>
        {companies.map((company, index) => (
          <GradientCardBase key={index} className="min-w-[400px] max-w-[400px] flex-shrink-0" width="400px" height="600px">
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
              <div className="space-y-3 h-full flex flex-col p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {/* Icon circle with gradient */}
                    <motion.div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{
                        background: "linear-gradient(225deg, #171c2c 0%, #121624 100%)",
                        boxShadow: "0 4px 8px -1px rgba(0, 0, 0, 0.2), inset 1px 1px 3px rgba(255, 255, 255, 0.1), inset -1px -1px 2px rgba(0, 0, 0, 0.4)"
                      }}
                      whileHover={{ y: -1, boxShadow: "0 6px 12px -1px rgba(0, 0, 0, 0.3), inset 1px 1px 3px rgba(255, 255, 255, 0.15), inset -1px -1px 2px rgba(0, 0, 0, 0.5)" }}
                    >
                      <Building2 className="w-5 h-5 text-white" />
                    </motion.div>
                    <div>
                      <h5 className="text-white text-base font-medium">{company.name}</h5>
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
                              category: company.category
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
                
                <p className="text-white/70 text-sm mb-3">{company.description}</p>
                
                <div className="mb-3">
                  <h6 className="text-sm font-semibold text-blue-300 mb-2 tracking-wide">About Us</h6>
                  <div className="text-xs text-white/70 leading-relaxed">
                    {company.about ? company.about.map((line, i) => (
                      <div key={i}>{line}</div>
                    )) : (
                      <>
                        <div>Leading manufacturer specializing in advanced technology solutions.</div>
                        <div>Established company with strong market presence and innovation focus.</div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="mb-3">
                  <h6 className="text-sm font-semibold text-green-300 mb-2 tracking-wide">Location</h6>
                  <div className="text-xs text-white/70">{company.location || "Mumbai, India"}</div>
                </div>
                
                <div className="mb-3">
                  <h6 className="text-sm font-semibold text-purple-300 mb-2 tracking-wide">Key Specifications</h6>
                  <div className="space-y-1">
                    {company.specifications ? company.specifications.map((spec, i) => (
                      <div key={i} className="text-xs text-white/70">• {spec}</div>
                    )) : (
                      <>
                        <div className="text-xs text-white/70">• Advanced microprocessor control system</div>
                        <div className="text-xs text-white/70">• High-quality halogen operating light</div>
                        <div className="text-xs text-white/70">• Integrated micromotor with scaler</div>
                        <div className="text-xs text-white/70">• Built-in X-ray viewer functionality</div>
                        <div className="text-xs text-white/70">• ISO 13485 certified quality standards</div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <h6 className="text-sm font-semibold text-orange-300 tracking-wide">Category</h6>
                    <span className="text-xs text-white/80">{company.category}</span>
                  </div>
                  <div className="text-sm text-white/80 font-medium">{company.pricing}</div>
                </div>
                
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
                    onClick={() => alert(`Calling ${company.name}...`)}
                    size="sm"
                    className="flex-1 bg-white text-black font-medium hover:bg-gray-100 text-xs px-2"
                  >
                    📞 Call
                  </Button>
                  {company.website && company.website !== "#" && (
                    <Button
                      onClick={() => handleVisitWebsite(company.website)}
                      size="sm"
                      variant="outline"
                      className="border-white/20 text-white/80 hover:bg-white/10 text-xs px-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </GradientCardBase>
        ))}
      </div>
      
      {/* Compare Section */}
      {selectedForComparison.size >= 2 && (
        <div className="mt-6 bg-black/20 backdrop-blur-xl p-4 border border-white/10 rounded-lg">
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
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