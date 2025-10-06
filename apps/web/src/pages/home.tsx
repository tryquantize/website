// Custom components
import { SearchInterface } from "@/components/search-interface";

// Background component
import AnimatedShaderBackground from "@/components/ui/animated-shader-background";

export default function Home() {
  return (
    <div className="min-h-screen relative">
      <AnimatedShaderBackground />
      <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 relative z-10">
        <SearchInterface onSearchResults={() => {}} />
      </div>
    </div>
  );
}