// React hooks
import { useEffect, useState, useRef, lazy, Suspense } from "react";

// UI components
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Component as RaycastBackground } from "@/components/ui/raycast-animated-background";
import { Hero } from "@/components/ui/animated-hero";

// Components
import { motion, useInView } from "framer-motion";
import { Search, Bot, Megaphone, Zap, Target, Scale, Sparkles, Brain, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load heavy components below the fold
const TestimonialsColumns = lazy(() => import("@/components/ui/testimonials-demo"));
const Featured_05 = lazy(() => import("@/components/ui/globe-feature-section"));
const FeaturesSection = lazy(() => import("@/components/ui/features-section"));
const FeatureCarousel = lazy(() => import("@/components/ui/animated-feature-carousel").then(module => ({ default: module.FeatureCarousel })));
const LogoCarouselBasic = lazy(() => import("@/components/ui/logo-carousel-demo").then(module => ({ default: module.LogoCarouselBasic })));


import { StorySection } from "@/components/ui/story-section";
import { FaqSection } from "@/components/ui/faq-section";
import { SectionBadge } from "@/components/ui/section-badge";

export default function LandingPage() {
  const [startVisible, setStartVisible] = useState(false);
  // Start with background hidden to prioritize first paint of text/UI
  const [showBackground, setShowBackground] = useState(false);

  useEffect(() => {
    // Enable background after a short delay to allow main thread to clear
    const timer = setTimeout(() => {
      setShowBackground(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle navigation to home page
  const navigateToHomePage = () => {
    window.location.href = "https://quantize.site/home";
  };

  // Handle navigation to login with redirect
  const navigateToLogin = () => {
    window.location.href = "https://quantize.site/auth?redirect=/home";
  };

  // Handle navigation to onboarding page
  const navigateToOnboarding = () => {
    window.location.href = "/onboarding";
  };

  // Optimize scroll performance and interaction
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;

      // "showBackground" here effectively means "is in Hero section"
      // We use this to toggle pointer-events.
      // When false, the background is non-interactive (no mouse, no scroll hijacking).
      if (scrollY > windowHeight * 0.8) {
        setShowBackground(false);
      } else {
        setShowBackground(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fade in the buttons after page loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setStartVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);



  return (
    <div className="relative w-full min-h-screen bg-black overflow-hidden">
      {/* Raycast Animation Background */}
      <div
        className="fixed inset-0 w-full h-full z-0"
        style={{
          // Only allow pointer events (mouse interaction) when at the top of the page
          // This prevents the background from stealing scrolls or clicks when reading content
          pointerEvents: showBackground ? "auto" : "none"
        }}
      >
        <RaycastBackground />
      </div>

      {/* Hero Section */}
      <section className="relative w-full min-h-[80vh] sm:h-[85vh] flex items-center justify-center z-10 px-4">
        <Hero />
      </section>

      {/* Content Sections with integrated gradient transition */}
      <div className="relative z-10">
        {/* Gradient overlay for smooth transition */}
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-transparent via-black/50 to-black/80 pointer-events-none"></div>

        <div className="relative bg-gradient-to-b from-transparent via-black/70 to-black/90">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pb-0">


            {/* Video Section */}
            <section className="my-24 sm:my-32 md:my-40 relative">
              <div className="text-center mb-20">
                <SectionBadge>SEE IT IN ACTION</SectionBadge>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#f5f5f7] mb-6 tracking-tight">Experience Quantize</h2>
                <p className="text-[#86868b] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">Watch how Quantize transforms complex searches into instant, accurate results</p>
              </div>
              <div className="container mx-auto px-4">
                <div className="max-w-15xl mx-auto">
                  <motion.div
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl"
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    viewport={{ once: true, amount: 0.3 }}
                  >
                    <video
                      className="w-full h-auto rounded-xl"
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="none"
                    >
                      <source src="/video.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* Feature Carousel Section (Moved Up) */}
            <section id="features" className="my-24 sm:my-32 md:my-40 relative px-4">
              <div className="text-center mb-20">
                <SectionBadge>HOW IT WORKS</SectionBadge>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#f5f5f7] mb-6 tracking-tight">
                  How <span className="text-[#0071e3]">Quantize</span> Works
                </h2>
                <p className="text-base sm:text-lg text-[#86868b] max-w-2xl mx-auto px-4 leading-relaxed">
                  Discover the power of AI-driven search in four simple steps
                </p>
              </div>
              <Suspense fallback={<Skeleton className="w-full h-96 rounded-xl bg-white/5" />}>
                <FeatureCarousel
                  image={{
                    alt: "Quantize AI Search Interface",
                    step1img1: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1740&auto=format&fit=crop",
                    step1img2: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1740&auto=format&fit=crop",
                    step2img1: "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=1740&auto=format&fit=crop",
                    step2img2: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?q=80&w=1674&auto=format&fit=crop",
                    step3img: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=1740&auto=format&fit=crop",
                    step4img: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1742&auto=format&fit=crop",
                  }}
                />
              </Suspense>
            </section>

            {/* Quantize Story Section */}
            <section className="my-24 sm:my-32 md:my-40 relative">
              <div className="container z-10 mx-auto px-4">
                <div className="text-center mb-20">
                  <SectionBadge>OUR STORY</SectionBadge>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#f5f5f7] mb-6 tracking-tight">
                    Why We Built <span className="text-[#0071e3]">Quantize</span>
                  </h2>
                  <p className="text-[#86868b] text-lg max-w-3xl mx-auto leading-relaxed">
                    The journey from frustration to solution - discover the story behind Quantize and our mission to revolutionize search.
                  </p>
                </div>

                <StorySection />
              </div>
            </section>

            {/* FAQs Section */}
            <section className="mb-16 sm:mb-20 md:mb-24">
              <div className="text-center mb-8 sm:mb-12">
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 px-4">Frequently Asked <span className="text-blue-400">Questions</span></h3>
                <p className="text-white/70 max-w-2xl mx-auto px-4 text-sm sm:text-base">Find answers to common questions about our platform, how we curate tools, and what's coming next.</p>
              </div>
              <FaqSection />
            </section>

            {/* Testimonials Section */}
            <section className="my-24 sm:my-32 md:my-40 px-4">
              <div className="text-center mb-20">
                <SectionBadge>TESTIMONIALS</SectionBadge>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#f5f5f7] mb-6 tracking-tight">Trusted by Industry Leaders</h2>
                <p className="text-[#86868b] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">See what our users are saying about Quantize</p>
              </div>
              <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Skeleton className="h-64 bg-white/5" /><Skeleton className="h-64 bg-white/5" /><Skeleton className="h-64 bg-white/5" /></div>}>
                <TestimonialsColumns />
              </Suspense>
            </section>

            {/* Why Choose Quantize Section */}
            <section className="my-24 sm:my-32 md:my-40">
              <div className="text-center mb-20">
                <SectionBadge>FEATURES</SectionBadge>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#f5f5f7] mb-6 tracking-tight">Why Choose Quantize</h2>
                <p className="text-[#86868b] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">Discover what makes our AI search different from the rest</p>
              </div>
              <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-20"><Skeleton className="h-96 bg-white/5" /><Skeleton className="h-96 bg-white/5" /></div>}>
                <FeaturesSection />
              </Suspense>
            </section>

            {/* Globe Feature Section */}
            <section className="my-16 sm:my-24">
              <Suspense fallback={<Skeleton className="w-full h-[500px] bg-white/5" />}>
                <Featured_05 />
              </Suspense>
            </section>
          </div>

          {/* Smooth gradient fade to footer */}
          <div className="h-32 sm:h-40 bg-gradient-to-b from-black/90 via-black/50 to-transparent"></div>
        </div>
      </div>
    </div>
  );
}