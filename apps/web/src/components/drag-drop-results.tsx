import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Grip } from 'lucide-react';

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
          className={`h-full border-2 border-dashed rounded-lg transition-all duration-300 ${
            isDragOver 
              ? 'border-blue-400 bg-blue-500/10' 
              : 'border-white/20 bg-black/5'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {expandedCompanies.length === 0 ? (
            <div className="flex items-center justify-center h-full">
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
  return (
    <motion.div
      className={`bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg p-3 cursor-grab active:cursor-grabbing transition-all duration-200 hover:border-white/20 hover:bg-black/50 ${
        isDragging ? 'opacity-50 scale-95' : ''
      } ${isExpanded ? 'ring-2 ring-blue-500/50' : ''}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragEnd={onDragEnd}
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
          {company.logoUrl ? (
            <img src={company.logoUrl} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            formatCompanyName(company.name).charAt(0)
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h6 className="text-white text-sm font-semibold truncate">
            {formatCompanyName(company.name)}
          </h6>
          <p className="text-white/60 text-xs truncate">
            {company.uspTagline || company.tagline || company.description}
          </p>
          <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full mt-1 inline-block">
            {company.category}
          </span>
        </div>
        
        <Grip className="w-4 h-4 text-white/40" />
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