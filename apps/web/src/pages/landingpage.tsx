// React hooks
import { useEffect, useState } from "react";

// UI components
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Component as RaycastBackground } from "@/components/ui/raycast-animated-background";
import { Hero } from "@/components/ui/animated-hero";

// Components
import TestimonialsColumns from "@/components/ui/testimonials-demo";
import Featured_05 from "@/components/ui/globe-feature-section";
import FeaturesSection from "@/components/ui/features-section";
import { FeatureCarousel, type ImageSet } from "@/components/ui/animated-feature-carousel";


export default function LandingPage() {
  const [startVisible, setStartVisible] = useState(false);
  
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
      <div className="fixed inset-0 w-full h-full z-0">
        <RaycastBackground />
      </div>
      
      {/* Hero Section */}
      <section className="relative w-full min-h-[80vh] sm:h-[85vh] flex items-center justify-center z-10 -mt-12 sm:-mt-16 px-4">
        <Hero />
      </section>

      {/* Content Sections */}
      <div className="relative z-10 bg-black/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pb-0">
          {/* Hero Text Section */}
          <section className="text-center py-16 sm:py-24 md:py-32">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 md:mb-8 leading-tight px-2">
              The Future of Search is Here with <span className="text-blue-400">Quantize</span>
            </h2>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/80 max-w-4xl mx-auto mb-6 sm:mb-8 md:mb-10 lg:mb-12 leading-relaxed px-4">
              Experience AI-powered search that understands context, provides intelligent insights, and delivers exactly what you're looking for. Built for the next generation of knowledge discovery.
            </p>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                <div className="p-6 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🔍</span>
                    <h4 className="font-semibold text-lg text-blue-400">The Problem</h4>
                  </div>
                  <p className="text-sm leading-relaxed text-white/90">Google search is a disaster. You spend hours trying to find a product, startup, or service, and what do you get? SEO spam. Paid ads. Generic blog lists written by people who've never used the tools they're ranking.</p>
                </div>
                
                <div className="p-6 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🤖</span>
                    <h4 className="font-semibold text-lg text-blue-400">Current Solutions Fall Short</h4>
                  </div>
                  <p className="text-sm leading-relaxed text-white/90">Even 'smart' tools like Perplexity just skim the surface. You might find something promising… then you're dumped into an endless maze of forms, demos, and 'contact us' pages just to get a simple answer.</p>
                </div>
                
                <div className="p-6 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">📢</span>
                    <h4 className="font-semibold text-lg text-blue-400">Discovery Arbitrage</h4>
                  </div>
                  <p className="text-sm leading-relaxed text-white/90">The current discovery process is a joke. Great companies and incredible products are buried because they can't win the SEO or ad-spend war. Meanwhile, users waste hours sifting through noise, only to settle for whoever shouts the loudest.</p>
                </div>
                
                <div className="p-6 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">⚡</span>
                    <h4 className="font-semibold text-lg text-blue-400">Our Solution</h4>
                  </div>
                  <p className="text-sm leading-relaxed text-white/90">We're fixing this. Me and Yashwardhan Sable are building Quantize, an AI-powered search engine that connects you instantly to the exact product, company, startup, solution or freelancer you need.</p>
                </div>
                
                <div className="p-6 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🎯</span>
                    <h4 className="font-semibold text-lg text-blue-400">Instant Connection</h4>
                  </div>
                  <p className="text-sm leading-relaxed text-white/90">No more 20 irrelevant links. No more guessing which landing page is worth your time. Type in what you're looking for, and our system surfaces the best-fit solutions, with one click, you can chat with the company, get a quote, use the product directly, or talk to a real human.</p>
                </div>
                
                <div className="p-6 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">⚖️</span>
                    <h4 className="font-semibold text-lg text-blue-400">Leveling the Playing Field</h4>
                  </div>
                  <p className="text-sm leading-relaxed text-white/90">This isn't just about convenience. It's about fixing a massive discovery arbitrage. It's about giving visibility back to the companies doing great work, not just the ones gaming the algorithm.</p>
                </div>
                
                <div className="p-6 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">✨</span>
                    <h4 className="font-semibold text-lg text-blue-400">The Vision</h4>
                  </div>
                  <p className="text-sm leading-relaxed text-white/90">Imagine replacing three hours of Googling and second-guessing with one clear, custom-fit recommendation, and an instant path to action.</p>
                </div>
                
                <div className="p-6 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🧠</span>
                    <h4 className="font-semibold text-lg text-blue-400">Intelligence First</h4>
                  </div>
                  <p className="text-sm leading-relaxed text-white/90">We're not here to 'index the web.' We're here to weaponize intelligence for search. To make finding a tool, startup, product, or solution feel like magic.</p>
                </div>
                
                <div className="p-6 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🏆</span>
                    <h4 className="font-semibold text-lg text-blue-400">Merit-Based Discovery</h4>
                  </div>
                  <p className="text-sm leading-relaxed text-white/90">And to finally give visibility back to the companies doing great work, not just the ones who know how to game the algorithm.</p>
                </div>
              </div>
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
          </section>

          {/* Testimonials Section */}
          <section className="mb-8 sm:mb-12 md:mb-16 lg:mb-20 xl:mb-24 px-4">
            <TestimonialsColumns />
          </section>

          {/* Features Section */}
          <FeaturesSection />

          {/* Globe Feature Section */}
          <section>
            <Featured_05 />
          </section>
        </div>
      </div>
    </div>
  );
}