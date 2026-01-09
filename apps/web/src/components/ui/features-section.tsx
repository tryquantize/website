import { Search, Zap, DollarSign, Shield, BarChart3, Headphones, Lock, Code } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Search,
    title: "Semantic Search",
    description: "Understand intent, not just keywords. Find exactly what you're looking for with natural language queries.",
    className: "md:col-span-2 md:row-span-2",
  },
  {
    icon: Zap,
    title: "Real-time Updates",
    description: "Our index is updated continuously to ensure you have the latest information on every tool.",
    className: "md:col-span-1 md:row-span-1",
  },
  {
    icon: Shield,
    title: "Verified Listings",
    description: "Every tool is manually verified to ensure quality and safety standards.",
    className: "md:col-span-1 md:row-span-1",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Track trends and compare tool performance with built-in analytics.",
    className: "md:col-span-1 md:row-span-1",
  },
  {
    icon: DollarSign,
    title: "Price Comparison",
    description: "Compare pricing plans across multiple tools instantly.",
    className: "md:col-span-1 md:row-span-1",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description: "SOC2 compliant infrastructure for enterprise needs.",
    className: "md:col-span-2 md:row-span-1",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Dedicated support team to help you find the right solutions.",
    className: "md:col-span-1 md:row-span-1",
  },
  {
    icon: Code,
    title: "API Access",
    description: "Integrate our search capabilities directly into your applications.",
    className: "md:col-span-1 md:row-span-1",
  },
];

export default function FeaturesSection() {
  const { ref, inView } = useScrollAnimation();

  return (
    <section ref={ref} className="relative">
      {/* Desktop Bento Grid View */}
      <div className="hidden md:grid grid-cols-4 gap-4 max-w-7xl mx-auto px-4">
        {features.map((feature, index) => (
          <div
            key={index}
            className={cn(
              "group relative overflow-hidden rounded-3xl",
              "bg-gradient-to-br from-white/12 to-white/8 backdrop-blur-2xl border border-white/20",
              "shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
              "hover:shadow-[0_16px_48px_rgba(59,130,246,0.12)] hover:border-white/30",
              "p-8 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1",
              feature.className,
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
            style={{ transitionDelay: `${index * 50}ms` }}
          >
            {/* Inner glow on hover */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10 h-full flex flex-col">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-blue-400 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300">
                <feature.icon className="h-6 w-6" />
              </div>

              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#0071e3] transition-colors">
                {feature.title}
              </h3>

              <p className="text-white/70 leading-relaxed text-sm">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Carousel View */}
      <div className="md:hidden px-4">
        <Carousel className="w-full max-w-sm mx-auto" opts={{ align: "start", loop: true }}>
          <CarouselContent>
            {features.map((feature, index) => (
              <CarouselItem key={index} className="basis-[85%]">
                <div className="h-full p-1">
                  <div className="h-full flex flex-col p-6 rounded-3xl bg-white/5 border border-white/10 min-h-[200px]">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-blue-400">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">{feature.title}</h4>
                    <p className="text-white/60 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-end gap-2 mt-4 pr-4">
            <CarouselPrevious className="static translate-y-0 bg-white/10 border-white/20 text-white hover:bg-white/20" />
            <CarouselNext className="static translate-y-0 bg-white text-black hover:bg-white/90" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}