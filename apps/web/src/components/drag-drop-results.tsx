import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Building2, Eye, MousePointer, Heart, ExternalLink, MessageCircle, Handshake, MapPin, Users, Calendar, Briefcase, Globe, Linkedin, DollarSign, Target, Layers, Zap, Award, CheckCircle } from 'lucide-react';
import { useFavorites } from "@/contexts/favorites-context";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { useNotification } from "@/contexts/notification-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PartnerPopup } from "@/components/partner-popup";
import { PartnerSuccessNotification } from "@/components/partner-success-notification";
import { app } from "@/lib/firebase-init";
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { GlowingShadow } from "@/components/ui/glowing-shadow";

interface Company {
  name: string;
  description: string;
  website: string;
  category: string;
  logoUrl?: string;
  tagline?: string;
  uspTagline?: string;
  features?: string[];
  specifications?: string[];
  location?: string;
  employees?: string;
  founded?: string;
  companyStage?: string;
  industriesServed?: string[];
  pricingRanges?: string[];
  pricingModel?: string[];
  pricing?: string;
  productsServices?: string[];
  topClients?: string[];
  enhancedAbout?: string;
  enhancedUseCases?: string[];
  trialAvailable?: boolean;
  customerSegments?: string[];
  deploymentType?: string[];
  idealScenarios?: string[];
  [key: string]: any;
}

interface ExpandedCompany {
  id: string;
  company: Company;
  originalIndex: number;
}

interface DragDropResultsProps {
  companies: Company[];
  searchQuery?: string;
}

export function DragDropResults({ companies, searchQuery }: DragDropResultsProps) {
  const [expandedCompanies, setExpandedCompanies] = useState<ExpandedCompany[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [partnerPopup, setPartnerPopup] = useState<{isOpen: boolean, companyName: string, companyEmail?: string, companyWebsite?: string, companyLinkedIn?: string}>({isOpen: false, companyName: ""});
  const [showSuccessNotification, setShowSuccessNotification] = useState<{isVisible: boolean, companyName: string}>({isVisible: false, companyName: ""});

  const handlePartnerSubmit = async (formData: {
    name: string;
    phone: string;
    email: string;
    companyEmail?: string;
    companyWebsite?: string;
    companyLinkedIn?: string;
  }) => {
    try {
      console.log('Submitting partner request to Firestore:', {
        userName: formData.name,
        userEmail: formData.email,
        userPhone: formData.phone,
        companyName: partnerPopup.companyName,
        companyEmail: formData.companyEmail,
        companyWebsite: formData.companyWebsite,
        companyLinkedIn: formData.companyLinkedIn,
        searchQuery
      });
      
      // Store directly in Firestore
      const db = getFirestore(app);
      const docRef = await addDoc(collection(db, 'partnerRequests'), {
        userName: formData.name,
        userEmail: formData.email,
        userPhone: formData.phone,
        companyName: partnerPopup.companyName,
        companyEmail: formData.companyEmail || null,
        companyWebsite: formData.companyWebsite || null,
        companyLinkedIn: formData.companyLinkedIn || null,
        searchQuery: searchQuery || null,
        timestamp: serverTimestamp(),
        status: 'pending'
      });
      
      console.log('Partner request stored in Firestore with ID:', docRef.id);
      
      // Close popup
      setPartnerPopup({isOpen: false, companyName: ""});
      
      // Show success notification
      setShowSuccessNotification({isVisible: true, companyName: partnerPopup.companyName});
      
      // Hide notification after 4 seconds
      setTimeout(() => {
        setShowSuccessNotification({isVisible: false, companyName: ""});
      }, 4000);
      
    } catch (error) {
      console.error('Firestore error:', error);
      alert('Failed to submit partner request. Please try again.');
    }
  };

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const index = parseInt(e.dataTransfer.getData('text/plain'));
    const company = companies[index];
    
    if (!company) return;
    
    // Check if already expanded
    const isAlreadyExpanded = expandedCompanies.some(exp => exp.originalIndex === index);
    if (isAlreadyExpanded) return;
    
    const newExpanded: ExpandedCompany = {
      id: `expanded-${index}-${Date.now()}`,
      company,
      originalIndex: index
    };
    
    setExpandedCompanies(prev => [...prev, newExpanded]);
  }, [companies, expandedCompanies]);

  const handleRemoveExpanded = useCallback((id: string) => {
    setExpandedCompanies(prev => prev.filter(exp => exp.id !== id));
  }, []);

  const formatCompanyName = (name: string) => {
    return name.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase()).trim();
  };

  const getWebsiteUrl = (website: string) => {
    if (!website || website === '#') return '';
    return website.startsWith('http') ? website : `https://${website}`;
  };

  return (
    <div className="flex h-full min-h-[calc(100vh-200px)]">
      {/* Center/Left Area - Exploration Canvas */}
      <div className="flex-1 p-6">
        <div
          className={`h-full border-2 border-dashed rounded-lg transition-all duration-300 relative ${
            isDragOver 
              ? 'border-blue-400 bg-blue-500/10' 
              : 'border-white/20 bg-black/5'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Drop Zone Indicator - Only show when dragging AND no expanded companies */}
          {draggedIndex !== null && expandedCompanies.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-lg p-8 text-center">
                <Plus className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Drop here to expand
                </h3>
                <p className="text-white/60">
                  Release to view company details with website
                </p>
              </div>
            </div>
          )}
          {expandedCompanies.length === 0 ? (
            <div className={`flex items-center justify-center h-full transition-all duration-300 ${
              draggedIndex !== null ? 'blur-sm' : ''
            }`}>
              <div className="text-center">
                <Plus className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-white/60 mb-2">
                  Drag companies here to explore
                </h3>
                <p className="text-white/40 max-w-md">
                  Drag company cards from the right sidebar to view their details alongside their websites
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-6 h-full overflow-y-auto">
              <AnimatePresence>
                {expandedCompanies.map((expanded) => (
                  <ExpandedCompanyPair
                    key={expanded.id}
                    expanded={expanded}
                    onRemove={handleRemoveExpanded}
                    formatCompanyName={formatCompanyName}
                    getWebsiteUrl={getWebsiteUrl}
                    searchQuery={searchQuery}
                    onPartnerRequest={(companyName, companyEmail, companyWebsite, companyLinkedIn) => {
                      setPartnerPopup({isOpen: true, companyName, companyEmail, companyWebsite, companyLinkedIn});
                    }}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Company Cards Queue */}
      <div className="w-80 bg-black/20 backdrop-blur-xl border-l border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <h4 className="text-white font-semibold mb-1">
            Companies ({companies.length - expandedCompanies.length}/{companies.length})
          </h4>
          <p className="text-white/60 text-sm">Drag cards to explore with websites</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {companies.map((company, index) => {
            const isExpanded = expandedCompanies.some(exp => exp.originalIndex === index);
            if (isExpanded) return null; // Hide dragged cards
            
            return (
              <CompactCompanyCard
                key={index}
                company={company}
                index={index}
                isDragging={draggedIndex === index}
                isExpanded={false}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                formatCompanyName={formatCompanyName}
              />
            );
          })}
        </div>
      </div>
      
      {/* Partner Popup */}
      <PartnerPopup
        isOpen={partnerPopup.isOpen}
        onClose={() => setPartnerPopup({isOpen: false, companyName: ""})}
        companyName={partnerPopup.companyName}
        companyEmail={partnerPopup.companyEmail}
        companyWebsite={partnerPopup.companyWebsite}
        companyLinkedIn={partnerPopup.companyLinkedIn}
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

// Compact Company Card Component
interface CompactCardProps {
  company: Company;
  index: number;
  isDragging: boolean;
  isExpanded: boolean;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  formatCompanyName: (name: string) => string;
}

function CompactCompanyCard({ 
  company, 
  index, 
  isDragging, 
  isExpanded,
  onDragStart, 
  onDragEnd,
  formatCompanyName 
}: CompactCardProps) {
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { currentUser } = useFirebaseAuth();
  const { showFavoritesNotification } = useNotification();
  const [engagementData] = useState<{views: number, clicks: number, saves: number}>({views: 0, clicks: 0, saves: 0});

  const hasData = (value: any): boolean => {
    if (!value) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'string') {
      const cleaned = value.toLowerCase().trim();
      return cleaned !== '' && cleaned !== 'n/a' && cleaned !== 'not applicable';
    }
    return true;
  };

  return (
    <motion.div
      className={`transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-95' : ''
      } ${isExpanded ? 'ring-2 ring-blue-500/50' : ''}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragEnd={onDragEnd}
      style={{ cursor: 'grab' }}
    >
      <GlowingShadow>
        <div className="space-y-3 h-full flex flex-col p-4 w-full">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
                style={{
                  background: company.logoUrl ? "transparent" : "linear-gradient(225deg, #171c2c 0%, #121624 100%)",
                  boxShadow: "0 4px 8px -1px rgba(0, 0, 0, 0.2), inset 1px 1px 3px rgba(255, 255, 255, 0.1), inset -1px -1px 2px rgba(0, 0, 0, 0.4)"
                }}
                whileHover={{ y: -1, boxShadow: "0 6px 12px -1px rgba(0, 0, 0, 0.3), inset 1px 1px 3px rgba(255, 255, 255, 0.15), inset -1px -1px 2px rgba(0, 0, 0, 0.5)" }}
              >
                {company.logoUrl ? (
                  <img src={company.logoUrl} alt={`${company.name} logo`} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-7 h-7 text-white" />
                )}
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <h5 className="text-white text-xl font-semibold truncate">{formatCompanyName(company.name)}</h5>
                  </div>
                </div>
                <span className="text-sm bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full font-medium">{company.category}</span>
              </div>
            </div>
            {currentUser && (
              <div className="flex space-x-1">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    const companyId = `company_${index}_${company.name}`;
                    if (isFavorite(companyId)) {
                      removeFromFavorites(companyId);
                    } else {
                      addToFavorites({
                        id: companyId,
                        type: 'company',
                        name: company.name,
                        description: company.description,
                        features: company.features || [],
                        pricing: company.pricing || '',
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

          <div className="flex-1 flex flex-col justify-between">
            {(hasData(company.uspTagline) || hasData(company.tagline)) && (
              <div className="mb-4">
                <p className="text-sm text-white/80 leading-relaxed">
                  {company.uspTagline ? 
                    (company.uspTagline.length > 140 ? company.uspTagline.substring(0, 140) + '...' : company.uspTagline) :
                    (company.tagline && company.tagline.length > 140 ? company.tagline.substring(0, 140) + '...' : company.tagline)
                  }
                </p>
              </div>
            )}
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4 text-xs text-white/60">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{Math.floor(Math.random() * 50) + 10}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MousePointer className="w-3 h-3" />
                  <span>{Math.floor(Math.random() * 20) + 5}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  <span>{Math.floor(Math.random() * 15) + 2}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/10">
              <div className="flex items-center gap-2">
                {hasData(company.location) && <MapPin className="w-3 h-3 text-white/60" />}
                {hasData(company.employees) && <Users className="w-3 h-3 text-white/60" />}
                {hasData(company.founded) && <Calendar className="w-3 h-3 text-white/60" />}
                {hasData(company.companyStage) && <Briefcase className="w-3 h-3 text-white/60" />}
                {hasData(company.customerSegments) && <Target className="w-3 h-3 text-white/60" />}
                {hasData(company.deploymentType) && <Layers className="w-3 h-3 text-white/60" />}
                {hasData(company.industriesServed) && <Zap className="w-3 h-3 text-white/60" />}
                {(hasData(company.pricingRanges) || hasData(company.pricing)) && <DollarSign className="w-3 h-3 text-white/60" />}
                {hasData(company.topClients) && <Award className="w-3 h-3 text-white/60" />}
                {company.website && company.website !== "#" && <Globe className="w-3 h-3 text-white/60" />}
                {company.trialAvailable && <CheckCircle className="w-3 h-3 text-green-400" />}
              </div>
              <div className="flex items-center gap-2">
                {(company as any).linkedin_url && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open((company as any).linkedin_url, "_blank", "noopener,noreferrer");
                    }}
                    className="text-white/60 hover:text-blue-400 transition-colors p-1"
                    title="LinkedIn Profile"
                  >
                    <Linkedin className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </GlowingShadow>
    </motion.div>
  );
}

// Expanded Company Pair Component
interface ExpandedPairProps {
  expanded: ExpandedCompany;
  onRemove: (id: string) => void;
  formatCompanyName: (name: string) => string;
  getWebsiteUrl: (website: string) => string;
  searchQuery?: string;
  onPartnerRequest: (companyName: string, companyEmail?: string, companyWebsite?: string, companyLinkedIn?: string) => void;
}

function ExpandedCompanyPair({ expanded, onRemove, formatCompanyName, getWebsiteUrl, searchQuery, onPartnerRequest }: ExpandedPairProps) {
  const { company } = expanded;
  const websiteUrl = getWebsiteUrl(company.website);
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { currentUser } = useFirebaseAuth();
  const { showFavoritesNotification } = useNotification();
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{text: string, isUser: boolean}>>([]);
  const [inputValue, setInputValue] = useState("");
  const [aboutOpen, setAboutOpen] = useState(false);

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

  // Helper function to check if pricing data is meaningful
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
    
    if (hasData(company.pricingRanges) || hasData(company.pricingModel)) {
      return true;
    }
    
    if (hasData(company.pricing)) {
      const pricingText = company.pricing!.toLowerCase().trim();
      return !placeholderTexts.some(placeholder => pricingText.includes(placeholder));
    }
    
    return false;
  };

  const handleChatClick = () => {
    setChatOpen(true);
    if (messages.length === 0) {
      setMessages([{text: `Hi! I'm here to help you learn more about ${company.name}. What would you like to know?`, isUser: false}]);
    }
  };

  const handleSendMessage = () => {
    const message = inputValue.trim();
    if (!message) return;

    setMessages(prev => [
      ...prev,
      {text: message, isUser: true},
      {text: `Thanks for your message about ${company.name}. Our team will get back to you soon!`, isUser: false}
    ]);
    setInputValue("");
  };

  const handleCallClick = () => {
    if ((company as any).phoneNumber) {
      window.open(`tel:${(company as any).phoneNumber}`, '_self');
    } else {
      alert(`No phone number available for ${company.name}`);
    }
  };

  const handlePartnerClick = () => {
    onPartnerRequest(
      company.name,
      (company as any).email || (company as any).companyEmail,
      company.website,
      (company as any).linkedin_url || (company as any).linkedinUrl
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-2 gap-4 h-[600px] bg-black/20 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden"
    >
      {/* Website iframe */}
      <div className="bg-black/40 flex flex-col">
        <div className="bg-black/60 px-4 py-2 border-b border-white/10 flex items-center justify-between">
          <h6 className="text-white text-sm font-medium truncate">
            {formatCompanyName(company.name)} - Website
          </h6>
        </div>
        <div className="flex-1">
          {websiteUrl ? (
            <iframe
              src={websiteUrl}
              className="w-full h-full border-0"
              title={`${company.name} website`}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-white/60">
              No website available
            </div>
          )}
        </div>
      </div>

      {/* Company Details */}
      <div className="bg-black/40 flex flex-col">
        <div className="bg-black/60 px-4 py-2 border-b border-white/10 flex items-center justify-between">
          <h6 className="text-white text-sm font-medium">Company Details</h6>
          <div className="flex items-center gap-2">
            {currentUser && (
              <Button
                onClick={() => {
                  const companyId = `company_${expanded.originalIndex}_${company.name}`;
                  if (isFavorite(companyId)) {
                    removeFromFavorites(companyId);
                  } else {
                    addToFavorites({
                      id: companyId,
                      type: 'company',
                      name: company.name,
                      description: company.description,
                      features: company.features || [],
                      pricing: company.pricing || '',
                      website: company.website,
                      category: company.category
                    }, showFavoritesNotification);
                  }
                }}
                size="sm"
                variant="ghost"
                className="p-1 h-auto"
              >
                <Heart className={`w-4 h-4 ${isFavorite(`company_${expanded.originalIndex}_${company.name}`) ? 'text-red-500 fill-current' : 'text-white/40 hover:text-red-400'}`} />
              </Button>
            )}
            <button
              onClick={() => onRemove(expanded.id)}
              className="text-white/60 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
        
        {chatOpen ? (
          <div className="flex-1 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-white text-base font-medium">{formatCompanyName(company.name)}</h5>
              <Button
                onClick={() => setChatOpen(false)}
                size="sm"
                variant="outline"
                className="border-white/20 text-white/80 hover:bg-white/10 text-xs"
              >
                Back
              </Button>
            </div>
            
            <div className="bg-black/20 rounded-lg p-3 flex-1 overflow-y-auto space-y-2 mb-3">
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
                Send
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 p-4 overflow-y-auto" style={{maxHeight: '520px'}}>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden" style={{
                  background: company.logoUrl ? "transparent" : "linear-gradient(225deg, #171c2c 0%, #121624 100%)",
                  boxShadow: "0 4px 8px -1px rgba(0, 0, 0, 0.2), inset 1px 1px 3px rgba(255, 255, 255, 0.1), inset -1px -1px 2px rgba(0, 0, 0, 0.4)"
                }}>
                  {company.logoUrl ? (
                    <img src={company.logoUrl} alt={`${company.name} logo`} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h5 className="text-white text-lg font-semibold mb-1">
                    {formatCompanyName(company.name)}
                  </h5>
                  <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs">
                    {company.category}
                  </span>
                </div>
              </div>
              
              {/* Company Info Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
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
                      <Briefcase className="w-3 h-3 text-white/60" />
                      <span className="font-semibold text-white">Stage</span>
                    </div>
                    <div className="text-white/80">{company.companyStage}</div>
                  </div>
                )}
              </div>
              
              {/* Description/Tagline */}
              {(hasData(company.uspTagline) || hasData(company.tagline) || hasData(company.enhancedAbout) || hasData(company.description)) && (
                <p className="text-white/80 text-sm leading-relaxed">
                  {company.uspTagline || company.tagline || company.enhancedAbout || company.description}
                </p>
              )}
              
              {/* Customer Segments */}
              {hasData(company.customerSegments) && (
                <div>
                  <h6 className="text-white font-medium mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-white/60" />
                    Customer Segments
                  </h6>
                  <div className="flex flex-wrap gap-1">
                    {company.customerSegments!.map((segment: string, i: number) => (
                      <span key={i} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                        {segment}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Deployment Type */}
              {hasData(company.deploymentType) && (
                <div>
                  <h6 className="text-white font-medium mb-2 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-white/60" />
                    Deployment
                  </h6>
                  <div className="flex flex-wrap gap-1">
                    {company.deploymentType!.map((type: string, i: number) => (
                      <span key={i} className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Ideal Scenarios */}
              {hasData(company.idealScenarios) && (
                <div>
                  <h6 className="text-white font-medium mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-white/60" />
                    Ideal For
                  </h6>
                  <div className="flex flex-wrap gap-1">
                    {company.idealScenarios!.map((scenario: string, i: number) => (
                      <span key={i} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                        {scenario}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Industries Served */}
              {hasData(company.industriesServed) && (
                <div>
                  <h6 className="text-white font-medium mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-white/60" />
                    Industries Served
                  </h6>
                  <div className="text-xs text-white/80">
                    {company.industriesServed!.slice(0, 5).join(', ')}
                    {company.industriesServed!.length > 5 && ` +${company.industriesServed!.length - 5} more`}
                  </div>
                </div>
              )}
              
              {/* Key Features/Specifications */}
              {(hasData(company.features) || hasData(company.specifications)) && (
                <div>
                  <h6 className="text-white font-medium mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-white/60" />
                    Key Features
                  </h6>
                  <ul className="space-y-1">
                    {(company.specifications || company.features)?.slice(0, 6).map((item: string, i: number) => (
                      <li key={i} className="text-white/70 text-sm">• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Products & Services */}
              {hasData(company.productsServices) && (
                <div>
                  <h6 className="text-white font-medium mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-white/60" />
                    Products & Services
                  </h6>
                  <div className="space-y-1">
                    {company.productsServices!.slice(0, 4).map((product: string, i: number) => (
                      <div key={i} className="text-xs text-white/80 leading-relaxed">
                        • {product.length > 100 ? product.substring(0, 100) + '...' : product}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Pricing */}
              {hasMeaningfulPricing(company) && (
                <div>
                  <h6 className="text-white font-medium mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-white/60" />
                    Pricing
                  </h6>
                  <div className="text-xs">
                    {hasData(company.pricingRanges) && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {company.pricingRanges!.map((range: string, i: number) => (
                          <span key={i} className="bg-green-500/20 text-green-300 px-2 py-1 rounded">
                            {range}
                          </span>
                        ))}
                      </div>
                    )}
                    {hasData(company.pricingModel) && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {company.pricingModel!.map((model: string, i: number) => (
                          <span key={i} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                            {model}
                          </span>
                        ))}
                      </div>
                    )}
                    {hasData(company.pricing) && !hasData(company.pricingRanges) && !hasData(company.pricingModel) && (
                      <div className="text-white/80">{company.pricing}</div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Use Cases */}
              {hasData(company.enhancedUseCases) && (
                <div>
                  <h6 className="text-white font-medium mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-white/60" />
                    Use Cases
                  </h6>
                  <div className="space-y-1">
                    {company.enhancedUseCases!.slice(0, 4).map((useCase: string, i: number) => (
                      <div key={i} className="text-xs text-white/80">• {useCase}</div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Top Clients */}
              {hasData(company.topClients) && (
                <div>
                  <h6 className="text-white font-medium mb-2 flex items-center gap-2">
                    <Award className="w-4 h-4 text-white/60" />
                    Notable Clients
                  </h6>
                  <div className="text-xs text-white/80">
                    {company.topClients!.slice(0, 6).join(', ')}
                    {company.topClients!.length > 6 && ` and ${company.topClients!.length - 6} more`}
                  </div>
                </div>
              )}
              
              {/* Trial Available */}
              {company.trialAvailable && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-300 font-medium text-sm">Free Trial Available</span>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-white/10">
              {/* About Company Dropdown */}
              <div className="mb-4">
                <Button
                  onClick={() => setAboutOpen(!aboutOpen)}
                  size="sm"
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  About Company {aboutOpen ? '▲' : '▼'}
                </Button>
                {aboutOpen && (
                  <div className="mt-2 p-3 bg-black/20 rounded-lg border border-white/10 max-h-40 overflow-y-auto">
                    <div className="space-y-2 text-xs">
                      {hasData(company.location) && (
                        <div><span className="text-white/60">Location:</span> <span className="text-white/80">{company.location}</span></div>
                      )}
                      {hasData(company.employees) && (
                        <div><span className="text-white/60">Employees:</span> <span className="text-white/80">{company.employees}</span></div>
                      )}
                      {hasData(company.founded) && (
                        <div><span className="text-white/60">Founded:</span> <span className="text-white/80">{company.founded}</span></div>
                      )}
                      {hasData(company.companyStage) && (
                        <div><span className="text-white/60">Stage:</span> <span className="text-white/80">{company.companyStage}</span></div>
                      )}
                      {hasData(company.customerSegments) && (
                        <div><span className="text-white/60">Customer Segments:</span> <span className="text-white/80">{company.customerSegments.join(', ')}</span></div>
                      )}
                      {hasData(company.industriesServed) && (
                        <div><span className="text-white/60">Industries:</span> <span className="text-white/80">{company.industriesServed.slice(0, 3).join(', ')}</span></div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2 mb-3">
                <Button 
                  onClick={handleChatClick}
                  size="sm" 
                  className="flex-1 bg-white text-black font-medium hover:bg-gray-100"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat
                </Button>
                <Button 
                  onClick={handleCallClick}
                  size="sm" 
                  className="flex-1 bg-white text-black font-medium hover:bg-gray-100"
                >
                  📞 Call
                </Button>
                <Button 
                  onClick={handlePartnerClick}
                  size="sm" 
                  className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white font-medium hover:from-green-600 hover:to-blue-600"
                >
                  <Handshake className="w-4 h-4 mr-2" />
                  Partner
                </Button>
                {company.website && company.website !== "#" && (
                  <Button
                    onClick={() => window.open(getWebsiteUrl(company.website), "_blank")}
                    size="sm"
                    className="bg-white text-black font-medium hover:bg-gray-100"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              <Button
                size="sm"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium"
              >
                Deep Research
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}