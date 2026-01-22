import { cn } from "@/lib/utils";
import { GlowingShadow } from "@/components/ui/glowing-shadow";
import {
  IconAdjustmentsBolt,
  IconCloud,
  IconCurrencyDollar,
  IconEaseInOut,
  IconHeart,
  IconHelp,
  IconRouteAltLeft,
  IconTerminal2,
} from "@tabler/icons-react";

export function FeaturesSectionWithHoverEffects() {
  const features = [
    {
      title: "AI-Powered Search",
      description:
        "Advanced AI algorithms that understand context and deliver precise results for your queries.",
      icon: <IconTerminal2 />,
    },
    {
      title: "Lightning Fast",
      description:
        "Get instant results with our optimized search infrastructure and real-time processing.",
      icon: <IconEaseInOut />,
    },
    {
      title: "Smart Pricing",
      description:
        "Transparent pricing with no hidden fees. Pay only for what you use with our flexible plans.",
      icon: <IconCurrencyDollar />,
    },
    {
      title: "99.9% Uptime",
      description: "Reliable service with enterprise-grade infrastructure and monitoring.",
      icon: <IconCloud />,
    },
    {
      title: "Scalable Architecture",
      description: "Built to handle millions of queries with seamless scaling capabilities.",
      icon: <IconRouteAltLeft />,
    },
    {
      title: "24/7 Support",
      description:
        "Round-the-clock customer support with AI-powered assistance and human experts.",
      icon: <IconHelp />,
    },
    {
      title: "Data Security",
      description:
        "Enterprise-grade security with end-to-end encryption and privacy protection.",
      icon: <IconAdjustmentsBolt />,
    },
    {
      title: "Developer Friendly",
      description: "Comprehensive APIs and SDKs for seamless integration into your applications.",
      icon: <IconHeart />,
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  relative z-10 py-10 max-w-7xl mx-auto">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div className="p-2">
      <GlowingShadow>
        <div className="flex flex-col py-10 px-6 h-full w-full group/feature">
          <div className="mb-4 relative z-10">
            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-md group-hover/feature:bg-gray-100 transition-colors duration-200">
              <div className="text-black">{icon}</div>
            </div>
          </div>
          <div className="text-lg font-bold mb-2 relative z-10">
            <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
            <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800 dark:text-neutral-100 ml-4">
              {title}
            </span>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 relative z-10 ml-4">
            {description}
          </p>
        </div>
      </GlowingShadow>
    </div>
  );
};