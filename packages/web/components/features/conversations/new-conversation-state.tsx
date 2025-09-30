import React from 'react';
import { QuantizeLogo } from '@/components/shared/branding';

interface NewConversationStateProps {
  firstName: string;
}

export function NewConversationState({ firstName }: NewConversationStateProps) {
  const currentHour = new Date().getHours();
  let greeting = 'Good evening';
  
  if (currentHour < 12) {
    greeting = 'Good morning';
  } else if (currentHour < 17) {
    greeting = 'Good afternoon';
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="mb-6">
        <QuantizeLogo size={48} />
      </div>
      <h2 className="text-2xl font-semibold text-white mb-2">
        {greeting}, what are you looking for, {firstName}?
      </h2>
      <p className="text-white/70 text-lg">
        Start a new conversation by typing your question below
      </p>
    </div>
  );
}