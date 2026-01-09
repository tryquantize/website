"use client";

import { buttonVariants } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { useState, useRef } from "react";
// @ts-ignore
import confetti from "canvas-confetti";
import NumberFlow from "@number-flow/react";

interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
}

interface PricingProps {
  plans: PricingPlan[];
}

export function Pricing({ plans }: PricingProps) {
  const [isMonthly, setIsMonthly] = useState(true);
  const switchRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (checked: boolean) => {
    setIsMonthly(!checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      confetti({
        particleCount: 50,
        spread: 60,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
      });
    }
  };

  return (
    <section className="px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-16">
          <span className={cn(
            "text-base font-medium transition-colors",
            isMonthly ? "text-[#f5f5f7]" : "text-[#86868b]"
          )}>
            Monthly
          </span>
          <Switch
            ref={switchRef}
            checked={!isMonthly}
            onCheckedChange={handleToggle}
            className="data-[state=checked]:bg-[#0071e3]"
          />
          <span className={cn(
            "text-base font-medium transition-colors",
            !isMonthly ? "text-[#f5f5f7]" : "text-[#86868b]"
          )}>
            Yearly
            <span className="ml-2 text-xs text-green-400 font-semibold">Save 20%</span>
          </span>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.8,
                delay: index * 0.1,
                ease: [0.21, 0.47, 0.32, 0.98]
              }}
              className={cn(
                "relative flex flex-col p-8 rounded-3xl backdrop-blur-2xl transition-all duration-500",
                "bg-gradient-to-br from-white/12 to-white/8 border border-white/20",
                "shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
                "hover:shadow-[0_16px_48px_rgba(59,130,246,0.12)] hover:border-white/30",
                plan.isPopular && "scale-105 border-[#0071e3]/50"
              )}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="bg-gradient-to-r from-blue-600 to-violet-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Most Popular
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-sm font-semibold text-[#86868b] mb-3 uppercase tracking-wider">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold text-[#f5f5f7] tracking-tight">
                    <NumberFlow
                      value={isMonthly ? Number(plan.price) : Number(plan.yearlyPrice)}
                      format={{ style: "currency", currency: "USD", minimumFractionDigits: 0 }}
                    />
                  </span>
                  <span className="text-[#86868b] text-base">/{plan.period.replace("per ", "")}</span>
                </div>
                <p className="text-[#86868b] text-sm mt-4 leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <div className="flex-1 mb-8">
                <ul className="space-y-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-[#f5f5f7]">
                      <div className="mt-0.5 w-5 h-5 rounded-full bg-[#0071e3]/20 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-[#0071e3]" />
                      </div>
                      <span className="leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={plan.href}
                className={cn(
                  "w-full h-12 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center",
                  plan.isPopular
                    ? "bg-white text-black hover:bg-gray-100 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                    : "bg-white/10 border border-white/10 text-[#f5f5f7] hover:bg-white/15 hover:border-white/20"
                )}
              >
                {plan.buttonText}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}