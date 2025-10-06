import { LoggedInSearchInterface } from "@/components/logged-in-search-interface";
import { Button } from "@/components/ui/button";
import { useNavigation } from "@/hooks/use-navigation";
import { useState } from "react";
import { Component as RaycastAnimatedBackground } from "@/components/ui/raycast-animated-blue-background";

export default function LoggedInHome() {
  const { navigateWithLoading } = useNavigation();
  const [searchResults, setSearchResults] = useState<any>(null);

  const handleSearchResults = (results: any) => {
    setSearchResults(results);
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0">
        <RaycastAnimatedBackground />
      </div>
      <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 relative z-10">
        {/* Hero Section with Custom Search Interface */}
        <div>
          <LoggedInSearchInterface onSearchResults={handleSearchResults} />
        </div>
        

      </div>
      
      {/* Blank Footer */}
      <footer className="w-full h-16 bg-transparent">
        {/* Completely blank footer */}
      </footer>
    </div>
  );
}