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
    }
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center">


      <div className="text-center space-y-8">
        {/* Dual Spinning Rings */}
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 border-4 border-transparent border-t-white/70 border-r-white/40 rounded-full animate-spin" />
          <div className="absolute inset-2 border-4 border-transparent border-b-white/60 border-l-white/30 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
        </div>
        <div className="text-sm text-gray-300 max-w-xs mx-auto">
          {quote}
        </div>
      </div>
    </div>
  );
}