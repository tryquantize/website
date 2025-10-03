import React from 'react';
import { cn } from '@/lib/utils';

interface GlowingBorderProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  intensity?: 'low' | 'medium' | 'high';
}

export const GlowingBorder: React.FC<GlowingBorderProps> = ({ 
  children, 
  className = '', 
  glowColor = '#402fb5,#cf30aa',
  intensity = 'medium'
}) => {
  const intensityClasses = {
    low: 'before:blur-[1px]',
    medium: 'before:blur-[2px]', 
    high: 'before:blur-[3px]'
  };

  return (
    <div className={cn("relative group", className)}>
      <div className={cn(
        "absolute z-[-1] overflow-hidden h-full w-full rounded-lg",
        intensityClasses[intensity],
        "before:absolute before:content-[''] before:z-[-2] before:w-[400px] before:h-[400px]",
        "before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2",
        "before:rotate-0 before:transition-all before:duration-1000",
        "group-hover:before:rotate-180"
      )}
      style={{
        '--glow-colors': glowColor
      } as React.CSSProperties}
      >
        <div 
          className="absolute inset-0 rounded-lg"
          style={{
            background: `conic-gradient(transparent, ${glowColor.split(',')[0]}, transparent 50%, ${glowColor.split(',')[1] || glowColor.split(',')[0]}, transparent)`
          }}
        />
      </div>
      {children}
    </div>
  );
};