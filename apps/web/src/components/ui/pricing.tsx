"use client";

import { buttonVariants } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { useState, useRef } from "react";
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
  title?: string;
  description?: string;
}

export function Pricing({
  plans,
  title = "Simple, Transparent Pricing",
  description = "Choose the plan that works for you\nAll plans include access to our platform, lead generation tools, and dedicated support.",
}: PricingProps) {
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
        colors: [
          "hsl(var(--primary))",
          "hsl(var(--accent))",
          "hsl(var(--secondary))",
          "hsl(var(--muted))",
        ],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ["circle"],
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-24 relative overflow-hidden">
      <div className="container max-w-7xl mx-auto px-4 relative z-10">

        {/* Header */}
        <div className="text-center space-y-6 mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold tracking-tighter text-white"
          >
            {title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto whitespace-pre-line leading-relaxed"
          >
            {description}
          </motion.p>
        </div>

        {/* Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center items-center mb-16 gap-4"
        >
          <span className={cn("text-sm font-medium transition-colors", isMonthly ? "text-white" : "text-white/50")}>Monthly</span>
          <Switch
            ref={switchRef as any}
            checked={!isMonthly}
            onCheckedChange={handleToggle}
            className="data-[state=checked]:bg-blue-600 bg-white/10 border-white/10"
          />
          <span className={cn("text-sm font-medium transition-colors", !isMonthly ? "text-white" : "text-white/50")}>
            Yearly <span className="text-blue-400 ml-1 font-bold">(-20%)</span>
          </span>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.8,
                delay: index * 0.1 + 0.3,
                ease: [0.21, 0.47, 0.32, 0.98]
              }}
              className={cn(
                "relative flex flex-col p-6 md:p-8 rounded-[2rem] backdrop-blur-3xl transition-all duration-500 group",
                plan.isPopular
                  ? "bg-white/10 border border-white/20 shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)]"
                  : "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20"
              )}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="bg-gradient-to-r from-blue-600 to-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6 md:mb-8">
                <h3 className="text-lg font-medium text-white/80 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                    <NumberFlow
                      value={isMonthly ? Number(plan.price) : Number(plan.yearlyPrice)}
                      format={{ style: "currency", currency: "USD", minimumFractionDigits: 0 }}
                    />
                  </span>
                  <span className="text-white/50 text-sm">/{plan.period.replace("per ", "")}</span>
                </div>
                <p className="text-white/50 text-sm mt-4 leading-relaxed min-h-[40px]">
                  {plan.description}
                </p>
              </div>

              <div className="flex-1 mb-8">
                <ul className="space-y-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-white/80">
                      <div className="mt-1 w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-blue-400" />
                      </div>
                      <span className="leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={plan.href}
                className={cn(
                  buttonVariants({ variant: plan.isPopular ? "default" : "outline" }),
                  "w-full rounded-xl py-6 text-base font-semibold transition-all duration-300",
                  plan.isPopular
                    ? "bg-white text-black hover:bg-white/90 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 hover:text-white"
                )}
              >
                {plan.buttonText}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}