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


// Story Cards Component with animations
function StoryCardsGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.1 });

  const storyCards = [
    {
      icon: Search,
      title: "The Problem",
      content: "Google search is a disaster. You spend hours trying to find a product, startup, or service, and what do you get? SEO spam. Paid ads. Generic blog lists written by people who've never used the tools they're ranking."
    },
    {
      icon: Bot,
      title: "Current Solutions Fall Short",
      content: "Even 'smart' tools like Perplexity just skim the surface. You might find something promising… then you're dumped into an endless maze of forms, demos, and 'contact us' pages just to get a simple answer."
    },
    {
      icon: Megaphone,
      title: "Discovery Arbitrage",
      content: "The current discovery process is a joke. Great companies and incredible products are buried because they can't win the SEO or ad-spend war. Meanwhile, users waste hours sifting through noise, only to settle for whoever shouts the loudest."
    },
    {
      icon: Zap,
      title: "Our Solution",
      content: "We're fixing this. Me and Yashwardhan Sable are building Quantize, an AI-powered search engine that connects you instantly to the exact product, company, startup, solution or freelancer you need."
    },
    {
      icon: Target,
      title: "Instant Connection",
      content: "No more 20 irrelevant links. No more guessing which landing page is worth your time. Type in what you're looking for, and our system surfaces the best-fit solutions, with one click, you can chat with the company, get a quote, use the product directly, or talk to a real human."
    },
    {
      icon: Scale,
      title: "Leveling the Playing Field",
      content: "This isn't just about convenience. It's about fixing a massive discovery arbitrage. It's about giving visibility back to the companies doing great work, not just the ones gaming the algorithm."
    },
    {
      icon: Sparkles,
      title: "The Vision",
      content: "Imagine replacing three hours of Googling and second-guessing with one clear, custom-fit recommendation, and an instant path to action."
    },
    {
      icon: Brain,
      title: "Intelligence First",
      content: "We're not here to 'index the web.' We're here to weaponize intelligence for search. To make finding a tool, startup, product, or solution feel like magic."
    },
    {
      icon: Trophy,
      title: "Merit-Based Discovery",
      content: "And to finally give visibility back to the companies doing great work, not just the ones who know how to game the algorithm."
    }
  ];

  const getRandomDirection = (index: number) => {
    const directions = [
      { x: -100, y: -50, rotate: -15 },
      { x: 100, y: -30, rotate: 10 },
      { x: -80, y: 60, rotate: 12 },
      { x: 120, y: 40, rotate: -8 },
      { x: -60, y: -80, rotate: 18 },
      { x: 90, y: 70, rotate: -12 },
      { x: -110, y: 30, rotate: 15 },
      { x: 70, y: -60, rotate: -10 },
      { x: -40, y: 90, rotate: 8 }
    ];
    return directions[index % directions.length];
  };

  return (
    <>
      <style>{`
        .hover-card {
          width: 100%;
          height: 254px;
          background: #171717;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          position: relative;
          box-shadow: 0px 0px 3px 1px #00000088;
          cursor: pointer;
        }
        .hover-card .content {
          border-radius: 5px;
          background: #171717;
          width: calc(100% - 4px);
          height: 250px;
          z-index: 1;
          padding: 20px;
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: flex-start;
        }
        .content::before {
          opacity: 0;
          transition: opacity 300ms;
          content: " ";
          display: block;
          background: white;
          width: 5px;
          height: 50px;
          position: absolute;
          filter: blur(50px);
          overflow: hidden;
        }
        .hover-card:hover .content::before {
          opacity: 1;
        }
        .hover-card::before {
          opacity: 0;
          content: " ";
          position: absolute;
          display: block;
          width: 80px;
          height: 360px;
          background: linear-gradient(#ff2288, #387ef0);
          transition: opacity 300ms;
          animation: rotation_9018 8000ms infinite linear;
          animation-play-state: paused;
        }
        .hover-card:hover::before {
          opacity: 1;
          animation-play-state: running;
        }
        .hover-card::after {
          position: absolute;
          content: " ";
          display: block;
          width: 250px;
          height: 360px;
          background: #17171733;
          backdrop-filter: blur(50px);
        }
        @keyframes rotation_9018 {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
      <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {storyCards.map((card, index) => {
          const direction = getRandomDirection(index);
          return (
            <motion.div
              key={index}
              className="hover-card"
              initial={{
                opacity: 0,
                x: direction.x,
                y: direction.y,
                rotate: direction.rotate,
                scale: 0.8
              }}
              animate={isInView ? {
                opacity: 1,
                x: 0,
                y: 0,
                rotate: 0,
                scale: 1
              } : {}}
              transition={{
                duration: 0.8,
                delay: index * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94],
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
            >
              <div className="content">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                    <card.icon className="w-5 h-5 text-black" />
                  </div>
                  <h4 className="font-bold text-lg text-blue-400">{card.title}</h4>
                </div>
                <p className="text-sm leading-relaxed text-white/90">{card.content}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}

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

  // FAQ CONTENT
  const faqs: { question: string; answer: string }[] = [
    {
      question: "What makes Quantize different from other AI directories?",
      answer: "We curate, not crawl. Listings are verified by humans and organized for real buyer workflows — compare, shortlist, and take action fast.",
    },
    {
      question: "Does Quantize support unique use cases or custom needs?",
      answer: "Yes. Filter by industry, team size, pricing model, and integrations. You can also contact vendors directly from the platform.",
    },
    {
      question: "How do you keep listings accurate and up to date?",
      answer: "Vendors maintain their profiles and our team audits changes weekly. Popular tools are refreshed more frequently.",
    },
    {
      question: "Is there a cost to use Quantize?",
      answer: "Browsing is free. We may offer premium research packs and expert consultations for power users.",
    },
    {
      question: "Can teams collaborate inside Quantize?",
      answer: "Saved lists and shared notes are coming with early access. Join the waitlist to try it first.",
    },
    {
      question: "How do I contact a vendor through Quantize?",
      answer: "Open a tool card and use the contact form to send a message directly to the vendor's team.",
    },
    {
      question: "Do you cover both free and paid tools?",
      answer: "Absolutely. Filter by pricing model to explore free, freemium, or paid options across categories.",
    },
    {
      question: "Can I save and share shortlists with my team?",
      answer: "Team lists and shared notes are in early access. Join the waitlist to get it first.",
    },
    {
      question: "Which industries are best represented?",
      answer: "We're strong in marketing, sales, productivity, data, and customer support — with new industries added weekly.",
    },
    {
      question: "How often are new tools added?",
      answer: "We review and add tools every week, prioritizing quality and demand from our community.",
    },
  ];

  // Auto-scrolling FAQ carousel
  const [faqApi, setFaqApi] = useState<CarouselApi | null>(null);
  useEffect(() => {
    if (!faqApi) return;
    let stop = false;
    const cycle = () => {
      if (stop) return;
      faqApi.scrollNext();
      if (!faqApi.canScrollNext()) {
        faqApi.scrollTo(0);
      }
    };
    const id = setInterval(cycle, 3000);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, [faqApi]);

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
      <section className="relative w-full min-h-[80vh] sm:h-[85vh] flex items-center justify-center z-10 -mt-12 sm:-mt-16 px-4">
        <Hero />
      </section>

      {/* Content Sections */}
      <div className="relative z-10 bg-black/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pb-0">


          {/* Video Section */}
          <section className="my-20 relative">
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

          {/* Quantize Story Section */}
          <section className="my-20 relative">
            <div className="container z-10 mx-auto px-4">
              <div className="text-center mb-12">
                <div className="border border-white/20 py-2 px-6 rounded-lg bg-white/10 backdrop-blur-md text-white inline-block mb-6">Our Story</div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
                  Why We Built <span className="text-blue-400">Quantize</span>
                </h2>
                <p className="text-white/70 text-lg max-w-3xl mx-auto">
                  The journey from frustration to solution - discover the story behind Quantize and our mission to revolutionize search.
                </p>
              </div>

              <StoryCardsGrid />
            </div>
          </section>

          {/* FAQs Section */}
          <section className="mb-16 sm:mb-20 md:mb-24">
            <div className="text-center mb-8 sm:mb-12">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 px-4">Frequently Asked <span className="text-blue-400">Questions</span></h3>
              <p className="text-white/70 max-w-2xl mx-auto px-4 text-sm sm:text-base">Find answers to common questions about our platform, how we curate tools, and what's coming next.</p>
            </div>
            <div className="relative px-4">
              <Carousel className="" opts={{ align: "start", loop: true, dragFree: true }} setApi={setFaqApi}>
                <CarouselContent className="-ml-2 md:-ml-4">
                  {faqs.map((item, idx) => (
                    <CarouselItem key={idx} className="pl-2 md:pl-4 basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                      <div
                        className="rounded-2xl p-4 sm:p-6 h-full bg-white/10 backdrop-blur-md border border-white/10 text-white/90"
                        style={{ minHeight: 180 }}
                      >
                        <h4 className="text-base sm:text-lg font-semibold mb-3 leading-snug text-white">{item.question}</h4>
                        <p className="text-sm leading-relaxed text-white/80">{item.answer}</p>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden sm:flex -top-12 left-auto right-12 md:right-14 bg-white/10 border-white/20 text-white hover:bg-white/20" />
                <CarouselNext className="hidden sm:flex -top-12 right-3 md:right-5 bg-white text-black hover:bg-white/90" />
              </Carousel>
            </div>
          </section>

          {/* Feature Carousel Section */}
          <section className="mb-16 sm:mb-20 md:mb-24 lg:mb-28 xl:mb-32 px-4">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 px-2">
                How <span className="text-blue-400">Quantize</span> Works
              </h2>
              <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto px-4">
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

          {/* Testimonials Section */}
          <section className="mb-8 sm:mb-12 md:mb-16 lg:mb-20 xl:mb-24 px-4">
            <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Skeleton className="h-64 bg-white/5" /><Skeleton className="h-64 bg-white/5" /><Skeleton className="h-64 bg-white/5" /></div>}>
              <TestimonialsColumns />
            </Suspense>
          </section>

          {/* Features Section */}
          <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-20"><Skeleton className="h-96 bg-white/5" /><Skeleton className="h-96 bg-white/5" /></div>}>
            <FeaturesSection />
          </Suspense>

          {/* Globe Feature Section */}
          <section>
            <Suspense fallback={<Skeleton className="w-full h-[500px] bg-white/5" />}>
              <Featured_05 />
            </Suspense>
          </section>
        </div>
      </div>
    </div>
  );
}