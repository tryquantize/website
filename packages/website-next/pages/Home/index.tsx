import MainLayout from "@/layouts/MainLayout";
import HeroSection from "@/sections/Home/HeroSection";
import FeatureGrid from "@/sections/Home/FeatureGrid";

export default function HomePage() {
  return (
    <MainLayout showJoinUs>
      <HeroSection />
      <FeatureGrid />
    </MainLayout>
  );
}

