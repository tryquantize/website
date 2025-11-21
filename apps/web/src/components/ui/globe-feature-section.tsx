"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils"
import { useNavigation } from "@/hooks/use-navigation";

export default function Featured_05() {
  const { navigateWithLoading } = useNavigation();

  const handleJoinToday = () => {
    navigateWithLoading('/auth/register');
  };

  return (
    <section className="relative w-full mx-auto overflow-hidden rounded-3xl bg-muted border border-gray-200 dark:border-gray-800 shadow-md px-6 py-16 md:px-16 md:py-24 mt-48">
      <div className="flex flex-col-reverse items-center justify-between gap-10 md:flex-row">
        <div className="z-10 max-w-xl text-left">
          <h1 className="text-3xl font-normal text-gray-900 dark:text-white">
            Build with <span className="text-primary">Quantize</span>{" "}
            <span className="text-gray-500 dark:text-gray-400">Transform your business with AI-powered insights and automation. Quantize brings intelligence and efficiency to your modern workflows.</span>
          </h1>
          <Button
            onClick={handleJoinToday}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 px-5 py-2 text-sm font-semibold text-black transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Join Today <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative h-[180px] w-full max-w-xl">
          <Globe className="absolute -bottom-20 -right-40 scale-150" />
        </div>
      </div>
    </section>
  );
}

export function Globe({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-full max-w-[600px] aspect-square mx-auto", className)}>
      <style>{`
        @keyframes spin-earth {
          from { background-position: 0 0; }
          to { background-position: -200% 0; }
        }
        .earth-globe {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background-image: url('https://raw.githubusercontent.com/shuding/cobe/main/website/public/map.png');
          background-size: 200% 100%;
          box-shadow: inset 0 0 20px rgba(0,0,0,1), 0 0 20px rgba(100,100,255,0.2);
          animation: spin-earth 20s linear infinite;
          opacity: 0.8;
          filter: grayscale(100%) invert(100%);
        }
        .earth-globe::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          box-shadow: -20px -20px 50px 2px #000 inset;
        }
      `}</style>
      <div className="earth-globe" />
    </div>
  )
}