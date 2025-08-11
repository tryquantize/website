import React, { useEffect, useState } from 'react';
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
        el.style.transition = 'filter 0.4s ease-out, opacity 0.4s ease-out';
        
        setTimeout(() => {
          el.style.filter = 'blur(6px)';
          el.style.opacity = '0.3';
        }, index * 50); // Stagger the blur effect
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
      <div className="text-center space-y-8">
        {/* Dual Spinning Rings */}
        <div className="relative w-24 h-24 mx-auto">
          {/* Outer ring */}
          <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 border-r-blue-500 rounded-full animate-spin" />
          {/* Inner ring */}
          <div className="absolute inset-2 border-4 border-transparent border-b-cyan-500 border-l-purple-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
        </div>

        {/* Quote */}
        <div className="text-sm text-gray-300 max-w-xs mx-auto">
          {quote}
        </div>
      </div>
    </div>
  );
}