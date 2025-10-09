import { LoggedInSearchInterface } from "@/components/logged-in-search-interface";
import { useState } from "react";
import { Component as RaycastAnimatedBackground } from "@/components/ui/raycast-animated-blue-background";

export default function LoggedInHome() {
  const [searchResults, setSearchResults] = useState<any>(null);

  const handleSearchResults = (results: any) => {
    setSearchResults(results);
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0">
        <RaycastAnimatedBackground />
      </div>
      <div className="relative z-10">
        <LoggedInSearchInterface onSearchResults={handleSearchResults} />
      </div>
    </div>
  );
}