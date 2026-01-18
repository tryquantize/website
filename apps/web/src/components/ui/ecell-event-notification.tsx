import { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';

export function EcellEventNotification() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const dismissed = localStorage.getItem('ecell-event-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000); // Show after 1s (after VC notification)

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('ecell-event-dismissed', 'true');
  };

  const handleJoinEvent = () => {
    setLocation('/add-company');
  };

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-[22rem] right-4 z-50 w-80 bg-black/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Event Header Image */}
          <div className="relative h-20 overflow-hidden">
            <img 
              src="/BHLogo.png" 
              alt="E-Cell IIT BHU Logo" 
              className="w-full h-full object-contain bg-white/10"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          </div>
          
          <div className="relative p-5">
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-200 uppercase tracking-wider">Exclusive Collaboration</span>
              </div>
              
              <h3 className="text-white font-semibold text-sm leading-tight">
                🎓 Founder's Meet & Greet || E-Cell IIT BHU
              </h3>
              
              <p className="text-white/80 text-xs leading-relaxed">
                Join us for an exclusive founder's networking event on 31st January 2026 Saturday, 8 PM onwards at GTAC Guest House, IIT BHU Varanasi.
              </p>
              
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-white/60">
                  📍 GTAC Guest House • 31st Jan, 8 PM
                </div>
                
                <button
                  onClick={handleJoinEvent}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium rounded-lg transition-all duration-200 hover:scale-105"
                >
                  Join Event
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}