/* File Overview
  Path: client/src/components/loading-transition.tsx
  Purpose: Reusable React component used across pages.

  Reading tip for newcomers:
  - Scan the exports at the bottom to see what the rest of the app imports from here
  - Follow the data flow via function parameters and return values
*/

import React, { useEffect, useState } from 'react';
import { BackgroundParticles } from '@/components/background-particles';
import { useLoading } from '@/contexts/loading-context';

const quotes = [
  "Discovering innovation...",
  "Connecting possibilities...",
  "Exploring new horizons...",
  "Igniting creativity...",
  "Unleashing potential..."
];

export function LoadingTransition() {
  const { isLoading } = useLoading();
  const [quote, setQuote] = useState('');

  useEffect(() => {
    if (isLoading) {
      setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
      
      // Blur individual elements instead of entire page (excluding footer)
      const elements = document.querySelectorAll('header, main, section, div:not(footer div), nav, aside');
      elements.forEach((element, index) => {
        const el = element as HTMLElement;
        // Make the transition take ~1.5s total with light staggering
        el.style.transition = 'filter 1.4s ease, opacity 1.4s ease';
        
        const delay = Math.min(index * 30, 300); // cap staggering to keep total under ~2s
        setTimeout(() => {
          el.style.filter = 'blur(6px)';
          el.style.opacity = '0.3';
        }, delay);
      });
    } else {
      // Remove blur from all elements when loading stops
      const elements = document.querySelectorAll('header, main, section, div, nav, aside');
      elements.forEach((element) => {
        const el = element as HTMLElement;
        el.style.filter = '';
        el.style.opacity = '';
        el.style.transition = '';
      });
    }
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center">
      {/* Foreground particles overlay during transitions */}
      <BackgroundParticles zIndex={10000} densityScale={0.8} />
      <div className="text-center space-y-8">
        {/* Dual Spinning Rings */}
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 border-4 border-transparent border-t-white/70 border-r-white/40 rounded-full animate-spin" />
          <div className="absolute inset-2 border-4 border-transparent border-b-white/60 border-l-white/30 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
        </div>

        {/* Quote */}
        <div className="text-sm text-gray-300 max-w-xs mx-auto">
          {quote}
        </div>
      </div>
    </div>
  );
}