// Custom components
import { SearchInterface } from "@/components/search-interface";

// Background component
import { Component as RaycastAnimatedBackground } from "@/components/ui/raycast-animated-blue-background";

export default function Home() {
  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0">
        <RaycastAnimatedBackground />
      </div>
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 relative z-10 pt-4">
        <SearchInterface onSearchResults={() => {}} />
      </div>
    </div>
  );
}