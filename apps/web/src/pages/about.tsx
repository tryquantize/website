import { Component as RaycastBackground } from "@/components/ui/raycast-animated-background";
import AboutUsSection from "@/components/ui/about-us-section";
import TeamSection from "@/components/ui/team-section";
import { FeaturesSectionWithHoverEffects } from "@/components/ui/feature-section-with-hover-effects";
import { ShuffleHero } from "@/components/ui/shuffle-grid";


export default function AboutPage() {
  return (
    <div className="relative">
      <div className="fixed inset-0 z-0">
        <RaycastBackground />
      </div>
      <div className="relative z-10">
        <AboutUsSection />
        <TeamSection />
        <div className="bg-white dark:bg-black">
          <FeaturesSectionWithHoverEffects />
        </div>

        <ShuffleHero />
      </div>
    </div>
  );
}