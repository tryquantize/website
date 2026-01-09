import { cn } from "@/lib/utils";
import { useState, useEffect, useRef, useMemo } from "react";
import UnicornScene from "unicornstudio-react";

// Optimized Raycast Background with performance controls
export const OptimizedRaycastBackground = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detect mobile for resolution scaling
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Calculate optimized dimensions (50% on mobile for performance)
  const dimensions = useMemo(() => {
    if (typeof window === 'undefined') return { width: 1920, height: 1080 };
    const scale = isMobile ? 0.5 : 1;
    return {
      width: Math.round(window.innerWidth * scale),
      height: Math.round(window.innerHeight * scale),
    };
  }, [isMobile]);

  // Scroll-based visibility control - pause when scrolled past hero
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = window.innerHeight * 0.8;

      // Pause animation when scrolled past hero section
      if (scrollY > heroHeight) {
        setIsPaused(true);
        setIsVisible(false);
      } else {
        setIsVisible(true);
        // Small delay before resuming to prevent jank during scroll
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = setTimeout(() => {
          setIsPaused(false);
        }, 100);
      }
    };

    // Use passive listener for better scroll performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Don't render at all when not visible (major performance boost)
  if (!isVisible && isPaused) {
    return (
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full bg-black"
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 w-full h-full transition-opacity duration-300",
        isPaused ? "opacity-30" : "opacity-100"
      )}
      style={{
        // Disable pointer events when paused for smoother scrolling
        pointerEvents: isPaused ? 'none' : 'auto',
        // Scale up if using reduced resolution
        transform: isMobile ? 'scale(2)' : 'none',
        transformOrigin: 'top left',
      }}
    >
      <UnicornScene
        key="raycast-bg-optimized"
        production={true}
        projectId="cbmTT38A0CcuYxeiyj5H"
        width={dimensions.width}
        height={dimensions.height}
      />
    </div>
  );
};

// Legacy export for compatibility
export const Component = OptimizedRaycastBackground;