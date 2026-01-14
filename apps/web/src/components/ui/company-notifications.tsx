import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { getCompanyNotifications, type CompanyNotification } from '@/services/company-notifications';

export function CompanyNotifications() {
  const [companies, setCompanies] = useState<CompanyNotification[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    getCompanyNotifications().then(setCompanies);
  }, []);

  useEffect(() => {
    if (companies.length === 0) return;

    const startTimer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(startTimer);
  }, [companies]);

  useEffect(() => {
    if (!isVisible || companies.length === 0) return;

    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % companies.length);
        setIsVisible(true);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, [isVisible, companies.length]);

  const handleVisitWebsite = (website: string) => {
    if (website) {
      window.open(website, '_blank', 'noopener,noreferrer');
    }
  };

  if (companies.length === 0) return null;

  const currentCompany = companies[currentIndex];

  return (
    <AnimatePresence>
      {isVisible && currentCompany && (
        <motion.div
          initial={{ x: -350, opacity: 0, scale: 0.9 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: -350, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed bottom-6 left-6 z-50 w-72 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-xl shadow-2xl overflow-hidden"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-emerald-300 uppercase tracking-wide">Featured</span>
              </div>
              <span className="text-xs text-white/50">{currentIndex + 1}/{companies.length}</span>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-white font-semibold text-base leading-tight">
                {currentCompany.name}
              </h3>
              
              <p className="text-white/75 text-sm leading-relaxed">
                {currentCompany.usp}
              </p>
              
              {currentCompany.website && (
                <button
                  onClick={() => handleVisitWebsite(currentCompany.website!)}
                  className="flex items-center gap-2 px-3 py-2 bg-white/15 hover:bg-white/25 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 w-full justify-center"
                >
                  <ExternalLink className="w-4 h-4" />
                  Visit Website
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}