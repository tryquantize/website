import { Search, Zap, DollarSign, Shield, BarChart3, Headphones, Lock, Code } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const features = [
  {
    icon: Search,
    title: "AI-Powered Search",
    description: "Advanced AI algorithms that understand context and deliver precise results for your queries."
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Get instant results with our optimized search infrastructure and real-time processing."
  },
  {
    icon: DollarSign,
    title: "Smart Pricing",
    description: "Transparent pricing with no hidden fees. Pay only for what you use with our flexible plans."
  },
  {
    icon: Shield,
    title: "99.9% Uptime",
    description: "Reliable service with enterprise-grade infrastructure and monitoring."
  },
  {
    icon: BarChart3,
    title: "Scalable Architecture",
    description: "Built to handle millions of queries with seamless scaling capabilities."
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Round-the-clock customer support with AI-powered assistance and human experts."
  },
  {
    icon: Lock,
    title: "Data Security",
    description: "Enterprise-grade security with end-to-end encryption and privacy protection."
  },
  {
    icon: Code,
    title: "Developer Friendly",
    description: "Comprehensive APIs and SDKs for seamless integration into your applications."
  }
];

export default function FeaturesSection() {
  const { ref, inView: isVisible } = useScrollAnimation(0.1);

  return (
    <section ref={ref} className="mb-24">
      <div className="text-center mb-16">
        <h3 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Why Choose <span className="text-blue-400">Quantize</span>
        </h3>
        <p className="text-white/70 text-lg max-w-2xl mx-auto">
          Discover the powerful features that make Quantize the ultimate AI search platform
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className={`group p-4 sm:p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-700 transform ${
              isVisible 
                ? 'translate-y-0 opacity-100' 
                : 'translate-y-8 opacity-0'
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className="mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:bg-gray-100 group-hover:border-gray-300 transition-all duration-300 shadow-md">
                <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-black group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <h4 className="text-base sm:text-lg font-semibold text-white mb-3">{feature.title}</h4>
            <p className="text-white/70 text-sm leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}