import { useState, useEffect } from "react";
import { Monitor, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileDesktopPromptProps {
  onDismiss?: () => void;
}

export function MobileDesktopPrompt({ onDismiss }: MobileDesktopPromptProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Show prompt only on mobile devices (don't check localStorage)
    if (isMobile) {
      setIsVisible(true);
    }
  }, [isMobile]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    onDismiss?.();
  };

  const handleSwitchToDesktop = () => {
    // Request desktop site
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=1024');
    }
    handleDismiss();
  };

  if (!isMobile || isDismissed || !isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Monitor className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Better Experience</h3>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-white/70" />
          </button>
        </div>
        
        <p className="text-white/80 text-sm mb-6 leading-relaxed">
          For the best search experience with all features, we recommend using desktop mode or switching to a desktop device.
        </p>
        
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleSwitchToDesktop}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Switch to Desktop View
          </Button>
          <Button
            onClick={handleDismiss}
            variant="outline"
            className="w-full border-white/20 text-white hover:bg-white/10"
          >
            Continue on Mobile
          </Button>
        </div>
      </div>
    </div>
  );
}