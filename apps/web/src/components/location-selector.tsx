import { useState, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface LocationSelectorProps {
  selectedLocations: string[];
  onLocationChange: (locations: string[]) => void;
  className?: string;
}

const TECH_HUB_LOCATIONS = [
  'San Francisco, USA',
  'New York, USA',
  'London, UK',
  'Berlin, Germany',
  'Tel Aviv, Israel',
  'Singapore',
  'Bangalore, India',
  'Tokyo, Japan',
  'Toronto, Canada',
  'Sydney, Australia'
];

export function LocationSelector({ selectedLocations, onLocationChange, className }: LocationSelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLocationToggle = (location: string) => {
    if (location === 'Go Global') {
      onLocationChange([]);
      return;
    }

    const newLocations = selectedLocations.includes(location)
      ? selectedLocations.filter(l => l !== location)
      : [...selectedLocations, location];
    
    onLocationChange(newLocations);
  };

  const isGlobalSelected = selectedLocations.length === 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowDropdown(false);
    };
    
    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDropdown]);

  return (
    <div className={`relative ${className || ''}`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              className={`flex h-6 w-6 xs:h-7 xs:w-7 sm:h-7 sm:w-7 items-center justify-center hover:text-white/80 transition-colors aspect-square touch-manipulation ${
                isGlobalSelected ? 'text-yellow-400' : 'text-green-400'
              }`}
            >
              <Globe className="h-5 w-5 xs:h-5.5 xs:w-5.5 sm:h-5.5 sm:w-5.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Location Filter</p>
            <p className="text-xs text-muted-foreground mt-1">
              {isGlobalSelected ? 'Global results' : `${selectedLocations.length} location(s) selected`}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      

      
      {showDropdown && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[10000]" onClick={() => setShowDropdown(false)} />
          <div className="absolute bottom-8 left-0 z-[10001] bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg shadow-2xl min-w-[200px] xs:min-w-[220px] max-h-64 overflow-y-auto">
            {/* Go Global Option */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLocationToggle('Go Global');
                setShowDropdown(false);
              }}
              className={`w-full px-3 py-2.5 text-left text-sm hover:bg-white/10 transition-colors first:rounded-t-lg flex items-center justify-between touch-manipulation ${
                isGlobalSelected ? 'bg-green-600/20 text-green-300' : 'text-white/80'
              }`}
            >
              <span className="font-medium">Go Global</span>
              {isGlobalSelected && <Check className="w-4 h-4" />}
            </button>
            
            <div className="border-t border-white/10 my-1" />
            
            {/* Location Options */}
            {TECH_HUB_LOCATIONS.map((location) => (
              <button
                key={location}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLocationToggle(location);
                }}
                className={`w-full px-3 py-2.5 text-left text-sm hover:bg-white/10 transition-colors last:rounded-b-lg flex items-center justify-between touch-manipulation ${
                  selectedLocations.includes(location) ? 'bg-blue-600/20 text-blue-300' : 'text-white/80'
                }`}
              >
                <span>{location}</span>
                {selectedLocations.includes(location) && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}