// Custom components
import { SearchInterface } from "@/components/search-interface";

// Background component
import AnimatedShaderBackground from "@/components/ui/animated-shader-background";

export default function Home() {
  return (
    <div className="min-h-screen relative">
      <AnimatedShaderBackground />
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 relative z-10">
        <SearchInterface onSearchResults={() => {}} />
      </div>
    </div>
  );
}