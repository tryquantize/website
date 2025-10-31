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
    <div className="w-full px-4">
      <div className="container mx-auto">
        <div className="flex gap-6 sm:gap-8 py-16 sm:py-20 lg:py-40 items-center justify-center flex-col">

          <div className="flex gap-6 sm:gap-8 flex-col items-center">
            <ParticleTextEffect words={["Welcome", "to", "intelligent", "Search"]} />

            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl leading-relaxed tracking-tight text-white/80 max-w-3xl text-center font-bold px-4">
              An AI Search Engine that Quantizes infinite information
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button size="lg" className="gap-4 bg-white text-black hover:bg-white/90 w-full sm:w-auto" onClick={navigateToHomePage}>
              Try for free <MoveRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };