// React hooks
import { useEffect, useState, useRef, lazy, Suspense } from "react";

// UI components
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/ui/animated-hero";
import { OptimizedRaycastBackground } from "@/components/ui/raycast-animated-background";

// Components
import { motion, useInView } from "framer-motion";
import { Search, Bot, Megaphone, Zap, Target, Scale, Sparkles, Brain, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Services
import { CompanyService, type Company } from "@/services/company-service";

// Lazy load heavy components below the fold
const Featured_05 = lazy(() => import("@/components/ui/globe-feature-section"));
const FeaturesSection = lazy(() => import("@/components/ui/features-section"));
const FeatureCarousel = lazy(() => import("@/components/ui/animated-feature-carousel").then(module => ({ default: module.FeatureCarousel })));
const LogoCarouselBasic = lazy(() => import("@/components/ui/logo-carousel-demo").then(module => ({ default: module.LogoCarouselBasic })));
const StorySection = lazy(() => import("@/components/ui/story-section").then(module => ({ default: module.StorySection })));


import { FaqSection } from "@/components/ui/faq-section";
import { SectionBadge } from "@/components/ui/section-badge";
import { VCEventNotification } from "@/components/ui/vc-event-notification";
import { CompanyNotifications } from "@/components/ui/company-notifications";
import { MultiWebsiteEmbed } from "@/components/ui/MultiWebsiteEmbed";

export default function LandingPage() {
  const [startVisible, setStartVisible] = useState(false);
  const [firestoreCompanies, setFirestoreCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  
  // Default websites to display on page load
  const defaultWebsites = [
    { id: 'clarus', url: 'https://clarus.so', title: 'Clarus' },
    { id: 'openfoundry', url: 'https://openfoundry.ai', title: 'OpenFoundry' },
    { id: 'smallest', url: 'https://smallest.ai', title: 'Smallest.ai' },
    { id: 'raycaster', url: 'https://www.raycaster.ai', title: 'Raycaster' }
  ];
  
  const [embeddedWebsites, setEmbeddedWebsites] = useState<Array<{id: string, url: string, title: string}>>(defaultWebsites);

  // Handle navigation to home page
  const navigateToHomePage = () => {
    window.location.href = "/home";
  };

  // Handle navigation to login with redirect
  const navigateToLogin = () => {
    window.location.href = "/auth?redirect=/home";
  };

  // Handle website embedding from company notifications
  const handleWebsiteEmbed = (url: string, title: string) => {
    const id = Date.now().toString();
    const newWebsite = { id, url, title };
    
    // Add new website to the beginning and remove if it already exists
    setEmbeddedWebsites(prev => {
      const filtered = prev.filter(site => site.url !== url);
      return [newWebsite, ...filtered];
    });
  };

  const closeWebsiteEmbed = (id: string) => {
    setEmbeddedWebsites(prev => prev.filter(site => site.id !== id));
  };



  // Fetch companies from Firestore
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const companies = await CompanyService.getAllCompanies();
        const companyWebsites = companies
          .filter(company => company.website)
          .map(company => ({
            id: company.id,
            url: company.website,
            title: company.companyName
          }));
        
        // Combine default websites with Firestore companies
        setEmbeddedWebsites([...defaultWebsites, ...companyWebsites]);
        setFirestoreCompanies(companies);
      } catch (error) {
        console.error('Failed to fetch companies:', error);
        // Keep default websites if Firestore fails
      } finally {
        setIsLoadingCompanies(false);
      }
    };

    fetchCompanies();
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
      {/* Notifications */}
      <VCEventNotification />
      <CompanyNotifications onWebsiteEmbed={handleWebsiteEmbed} />
      
      {/* Optimized Raycast Background - pauses when scrolled for performance */}
      <div className="fixed inset-0 w-full h-full z-0">
        <OptimizedRaycastBackground />
        {/* Dark vignette overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/20 to-black/60" />
      </div>

      {/* Hero Section */}
      <section className="relative w-full min-h-[80vh] sm:h-[85vh] flex items-center justify-center z-10 px-4 pt-20 md:pt-24">
        <Hero />
      </section>

      {/* Content Sections - no background, pure Raycast */}
      <div className="relative z-10">
        {/* Website Embed Section - Always visible with default websites */}
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-8">
          <MultiWebsiteEmbed
            websites={embeddedWebsites}
            onClose={closeWebsiteEmbed}
            height="600px"
          />
        </div>
        
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
                  className="bg-gradient-to-br from-white/12 to-white/8 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 shadow-2xl"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  viewport={{ once: true, amount: 0.3 }}
                >
                  <video
                    className="w-full h-auto rounded-xl"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
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

              <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Skeleton className="h-64 bg-white/5" /><Skeleton className="h-64 bg-white/5" /><Skeleton className="h-64 bg-white/5" /></div>}>
                <StorySection />
              </Suspense>
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
      </div>
    </div>
  );
}