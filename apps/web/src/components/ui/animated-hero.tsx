import { MoveRight, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParticleTextEffect } from "@/components/ui/particle-text-effect";

function Hero() {

  // Handle navigation to home page
  const navigateToHomePage = () => {
    window.location.href = "https://quantize.site/home";
  };

  // Handle navigation to login with redirect
  const navigateToLogin = () => {
    window.location.href = "https://quantize.site/auth?redirect=/home";
  };

  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">

          <div className="flex gap-8 flex-col items-center">
            <ParticleTextEffect words={["Welcome", "to", "intelligent", "Search"]} />

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-white/80 max-w-2xl text-center font-bold">
              Experience AI-powered search that understands context, provides intelligent insights, and delivers exactly what you're looking for. Built for the next generation of knowledge discovery.
            </p>
          </div>
          <div className="flex flex-row gap-3">
            <Button size="lg" className="gap-4" variant="outline" onClick={navigateToLogin}>
              Login <PhoneCall className="w-4 h-4" />
            </Button>
            <Button size="lg" className="gap-4 bg-white text-black hover:bg-white/90" onClick={navigateToHomePage}>
              Try for free <MoveRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };