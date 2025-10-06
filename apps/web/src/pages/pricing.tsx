import { Pricing } from "@/components/ui/pricing";
import TestimonialsColumns from "@/components/ui/testimonials-demo";
import { Component as AnimatedBackground } from "@/components/ui/raycast-animated-black-background";

const quantizePlans = [
  {
    name: "EXPLORER",
    price: "0",
    yearlyPrice: "0",
    period: "per month",
    features: [
      "50 AI searches per month",
      "Basic search results",
      "Community support",
      "Standard response time",
      "Web search integration",
    ],
    description: "Perfect for trying out Quantize's AI search capabilities",
    buttonText: "Start Free",
    href: "/register",
    isPopular: false,
  },
  {
    name: "PROFESSIONAL",
    price: "29",
    yearlyPrice: "23",
    period: "per month",
    features: [
      "Unlimited AI searches",
      "Advanced search algorithms",
      "Priority support",
      "Faster response times",
      "Enhanced web search",
      "Search history & favorites",
      "Custom search filters",
    ],
    description: "Ideal for professionals and power users",
    buttonText: "Get Started",
    href: "/register?plan=pro",
    isPopular: true,
  },
  {
    name: "ENTERPRISE",
    price: "99",
    yearlyPrice: "79",
    period: "per month",
    features: [
      "Everything in Professional",
      "Team collaboration",
      "API access",
      "Custom integrations",
      "Dedicated support",
      "Advanced analytics",
      "White-label options",
      "SLA guarantee",
    ],
    description: "For teams and organizations with advanced needs",
    buttonText: "Contact Sales",
    href: "/contact",
    isPopular: false,
  },
];

export function PricingPage() {
  return (
    <div className="min-h-screen bg-black relative">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <AnimatedBackground />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <Pricing 
          plans={quantizePlans}
          title="Unlock the Power of AI Search"
          description="Choose the plan that fits your search needs\nAll plans include access to our advanced AI search engine and comprehensive web integration."
        />
        
        {/* Testimonials Section */}
        <section className="py-16 px-4">
          <TestimonialsColumns />
        </section>
      </div>
    </div>
  );
}