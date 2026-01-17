import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Building2, Eye, MousePointer, Heart, ExternalLink, MessageCircle, Handshake } from 'lucide-react';
import { useFavorites } from "@/contexts/favorites-context";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { useNotification } from "@/contexts/notification-context";
import { Button } from "@/components/ui/button";
import "@/styles/company-card.css";

interface Company {
  name: string;
  description: string;
  website: string;
  category: string;
  logoUrl?: string;
  tagline?: string;
  uspTagline?: string;
  [key: string]: any;
}

interface ExpandedCompany {
  id: string;
  company: Company;
  originalIndex: number;
}

interface DragDropResultsProps {
  companies: Company[];
}

export function DragDropResults({ companies }: DragDropResultsProps) {
  const [expandedCompanies, setExpandedCompanies] = useState<ExpandedCompany[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

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
      className={`gradient-company-card mobile-card w-full transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-95' : ''
      } ${isExpanded ? 'ring-2 ring-blue-500/50' : ''}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragEnd={onDragEnd}
      style={{ cursor: 'grab' }}
    >
      <div className="gradient-company-card-info">
        <div className="space-y-3 h-full flex flex-col p-4">
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
                  <span>{engagementData.views}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MousePointer className="w-3 h-3" />
                  <span>{engagementData.clicks}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  <span>{engagementData.saves}</span>
                </div>
              </div>
              <div className="text-white/40 text-xs font-medium">
                Drag to explore →
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/10">
              <div className="flex items-center gap-3">
                {company.website && company.website !== "#" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(company.website, "_blank", "noopener,noreferrer");
                    }}
                    className="text-white/60 hover:text-blue-400 transition-colors p-1"
                    title="Visit Website"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
                {company.trialAvailable && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-300 text-xs font-medium">Trial</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Expanded Company Pair Component
interface ExpandedPairProps {
  expanded: ExpandedCompany;
  onRemove: (id: string) => void;
  formatCompanyName: (name: string) => string;
  getWebsiteUrl: (website: string) => string;
}

function ExpandedCompanyPair({ expanded, onRemove, formatCompanyName, getWebsiteUrl }: ExpandedPairProps) {
  const { company } = expanded;
  const websiteUrl = getWebsiteUrl(company.website);

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
          <button
            onClick={() => onRemove(expanded.id)}
            className="text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 p-4 overflow-y-auto" style={{maxHeight: '520px'}}>
          <div className="space-y-4">
            <div>
              <h5 className="text-white text-lg font-semibold mb-2">
                {formatCompanyName(company.name)}
              </h5>
              <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs">
                {company.category}
              </span>
            </div>
            
            {/* Company Info Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              {company.location && (
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="font-semibold text-white">Location</span>
                  </div>
                  <div className="text-white/80">{company.location}</div>
                </div>
              )}
              {company.employees && (
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="font-semibold text-white">Employees</span>
                  </div>
                  <div className="text-white/80">{company.employees}</div>
                </div>
              )}
              {company.founded && (
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="font-semibold text-white">Founded</span>
                  </div>
                  <div className="text-white/80">{company.founded}</div>
                </div>
              )}
              {company.companyStage && (
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="font-semibold text-white">Stage</span>
                  </div>
                  <div className="text-white/80">{company.companyStage}</div>
                </div>
              )}
            </div>
            
            {(company.uspTagline || company.tagline || company.enhancedAbout || company.description) && (
              <p className="text-white/80 text-sm leading-relaxed">
                {company.uspTagline || company.tagline || company.enhancedAbout || company.description}
              </p>
            )}
            
            {/* Key Features/Specifications */}
            {((company.features && Array.isArray(company.features)) || (company.specifications && Array.isArray(company.specifications))) && (
              <div>
                <h6 className="text-white font-medium mb-2">Key Features</h6>
                <ul className="space-y-1">
                  {(company.specifications || company.features)?.slice(0, 6).map((item: string, i: number) => (
                    <li key={i} className="text-white/70 text-sm">• {item}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Customer Segments */}
            {company.customerSegments && Array.isArray(company.customerSegments) && (
              <div>
                <h6 className="text-white font-medium mb-2">Customer Segments</h6>
                <div className="flex flex-wrap gap-1">
                  {company.customerSegments.map((segment: string, i: number) => (
                    <span key={i} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                      {segment}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Industries Served */}
            {company.industriesServed && Array.isArray(company.industriesServed) && (
              <div>
                <h6 className="text-white font-medium mb-2">Industries Served</h6>
                <div className="text-xs text-white/80">
                  {company.industriesServed.slice(0, 5).join(', ')}
                  {company.industriesServed.length > 5 && ` +${company.industriesServed.length - 5} more`}
                </div>
              </div>
            )}
            
            {/* Products & Services */}
            {company.productsServices && Array.isArray(company.productsServices) && (
              <div>
                <h6 className="text-white font-medium mb-2">Products & Services</h6>
                <div className="space-y-1">
                  {company.productsServices.slice(0, 4).map((product: string, i: number) => (
                    <div key={i} className="text-xs text-white/80 leading-relaxed">
                      • {product.length > 100 ? product.substring(0, 100) + '...' : product}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Pricing */}
            {(company.pricing || (company.pricingRanges && Array.isArray(company.pricingRanges)) || (company.pricingModel && Array.isArray(company.pricingModel))) && (
              <div>
                <h6 className="text-white font-medium mb-2">Pricing</h6>
                <div className="text-xs">
                  {company.pricingRanges && Array.isArray(company.pricingRanges) && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {company.pricingRanges.map((range: string, i: number) => (
                        <span key={i} className="bg-green-500/20 text-green-300 px-2 py-1 rounded">
                          {range}
                        </span>
                      ))}
                    </div>
                  )}
                  {company.pricingModel && Array.isArray(company.pricingModel) && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {company.pricingModel.map((model: string, i: number) => (
                        <span key={i} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                          {model}
                        </span>
                      ))}
                    </div>
                  )}
                  {company.pricing && (
                    <div className="text-white/80">{company.pricing}</div>
                  )}
                </div>
              </div>
            )}
            
            {/* Use Cases */}
            {company.enhancedUseCases && Array.isArray(company.enhancedUseCases) && (
              <div>
                <h6 className="text-white font-medium mb-2">Use Cases</h6>
                <div className="space-y-1">
                  {company.enhancedUseCases.slice(0, 4).map((useCase: string, i: number) => (
                    <div key={i} className="text-xs text-white/80">• {useCase}</div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Top Clients */}
            {company.topClients && Array.isArray(company.topClients) && (
              <div>
                <h6 className="text-white font-medium mb-2">Notable Clients</h6>
                <div className="text-xs text-white/80">
                  {company.topClients.slice(0, 6).join(', ')}
                  {company.topClients.length > 6 && ` and ${company.topClients.length - 6} more`}
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
            <div className="flex space-x-2">
              <Button size="sm" className="flex-1 bg-white text-black font-medium hover:bg-gray-100">
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat
              </Button>
              <Button size="sm" className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white font-medium hover:from-green-600 hover:to-blue-600">
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
          </div>
        </div>
      </div>
    </motion.div>
  );
}