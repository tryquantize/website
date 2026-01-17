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
          {/* Drop Zone Indicator */}
          <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 z-10 ${
            draggedIndex !== null ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}>
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
            <div className={`p-4 space-y-6 h-full overflow-y-auto transition-all duration-300 ${
              draggedIndex !== null ? 'blur-sm' : ''
            }`}>
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
          <h4 className="text-white font-semibold mb-1">Companies ({companies.length})</h4>
          <p className="text-white/60 text-sm">Drag cards to explore with websites</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {companies.map((company, index) => (
            <CompactCompanyCard
              key={index}
              company={company}
              index={index}
              isDragging={draggedIndex === index}
              isExpanded={expandedCompanies.some(exp => exp.originalIndex === index)}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              formatCompanyName={formatCompanyName}
            />
          ))}
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
      className="grid grid-cols-2 gap-4 h-96 bg-black/20 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden"
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
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <h5 className="text-white text-lg font-semibold mb-2">
                {formatCompanyName(company.name)}
              </h5>
              <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs">
                {company.category}
              </span>
            </div>
            
            {(company.uspTagline || company.tagline || company.description) && (
              <p className="text-white/80 text-sm leading-relaxed">
                {company.uspTagline || company.tagline || company.description}
              </p>
            )}
            
            {company.features && (
              <div>
                <h6 className="text-white font-medium mb-2">Key Features</h6>
                <ul className="space-y-1">
                  {company.features.slice(0, 4).map((feature: string, i: number) => (
                    <li key={i} className="text-white/70 text-sm">• {feature}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {company.pricing && (
              <div>
                <h6 className="text-white font-medium mb-1">Pricing</h6>
                <p className="text-white/70 text-sm">{company.pricing}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}