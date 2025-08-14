import { LoggedInSearchInterface } from "@/components/logged-in-search-interface";
import { Button } from "@/components/ui/button";
import { useNavigation } from "@/hooks/use-navigation";
import { useState } from "react";

export default function LoggedInHome() {
  const { navigateWithLoading } = useNavigation();
  const [searchResults, setSearchResults] = useState<any>(null);

  const handleSearchResults = (results: any) => {
    setSearchResults(results);
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4">
        {/* Hero Section with Custom Search Interface */}
        <div className="mb-16">
          <LoggedInSearchInterface onSearchResults={handleSearchResults} />
          
          {/* Browse All Solutions Button */}
          <div className="text-center mt-8">
            <Button
              onClick={() => navigateWithLoading('/list')}
              variant="outline"
              className="border-purple-400/40 text-white hover:bg-purple-500/20 hover:border-purple-400/60 px-8 py-4 text-lg"
            >
              Browse All Solutions
            </Button>
          </div>
        </div>
      </div>
      
      {/* Blank Footer */}
      <footer className="w-full h-16 bg-transparent">
        {/* Completely blank footer */}
      </footer>
    </div>
  );
}