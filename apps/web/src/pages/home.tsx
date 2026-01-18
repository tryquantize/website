// Custom components
import { SearchInterface } from "@/components/search-interface";
import { MobileDesktopPrompt } from "@/components/mobile-desktop-prompt";

// Background component
import { Component as RaycastAnimatedBackground } from "@/components/ui/raycast-animated-blue-background";

export default function Home() {
  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0">
        <RaycastAnimatedBackground />
      </div>
      <div className="relative z-10">
        <SearchInterface onSearchResults={() => {}} />
      </div>
      <MobileDesktopPrompt />
    </div>
  );
}