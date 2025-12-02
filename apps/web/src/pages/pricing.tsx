import { Pricing } from "@/components/ui/pricing";
import { Component as RaycastBackground } from "@/components/ui/raycast-animated-background";
import { SectionBadge } from "@/components/ui/section-badge";

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
    <div className="relative w-full min-h-screen bg-black overflow-hidden">
      {/* Raycast Animation Background */}
      <div className="fixed inset-0 w-full h-full z-0">
        <RaycastBackground />
      </div>

      {/* Content */}
      <div className="relative z-10 pt-32 pb-24">
        {/* Hero Section */}
        <section className="text-center mb-20 px-4">
          <div className="max-w-3xl mx-auto">
            <SectionBadge>PRICING</SectionBadge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#f5f5f7] mb-6">
              Unlock the Power of AI Search
            </h1>
            <p className="text-lg text-[#86868b] leading-relaxed">
              Choose the plan that fits your search needs. All plans include access to our advanced AI search engine and comprehensive web integration.
            </p>
          </div>
        </section>

        {/* Pricing Section */}
        <Pricing plans={quantizePlans} />
      </div>
    </div>
  );
}