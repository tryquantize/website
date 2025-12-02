import { MoveRight, PhoneCall, Building2 } from "lucide-react";
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

  // Handle navigation to add company page
  const navigateToAddCompany = () => {
    window.location.href = "/add-company";
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

          {/* CTAs with improved hierarchy */}
          <div className="flex flex-col gap-4 w-full sm:w-auto items-center">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <style>{`
                .cssbuttons-io-button {
                  background: white;
                  color: black;
                  font-family: inherit;
                  padding: 0.35em;
                  padding-left: 1.2em;
                  font-size: 17px;
                  font-weight: 500;
                  border-radius: 0.9em;
                  border: none;
                  letter-spacing: 0.05em;
                  display: flex;
                  align-items: center;
                  box-shadow: inset 0 0 1.6em -0.6em rgba(0, 0, 0, 0.1);
                  overflow: hidden;
                  position: relative;
                  height: 2.8em;
                  padding-right: 3.3em;
                  cursor: pointer;
                  width: 100%;
                  transition: all 0.3s ease;
                }
                .cssbuttons-io-button:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 8px 20px rgba(255, 255, 255, 0.3);
                }
                @media (min-width: 640px) {
                  .cssbuttons-io-button {
                    width: auto;
                  }
                }
                .cssbuttons-io-button.primary {
                  font-size: 18px;
                  height: 3.2em;
                  font-weight: 600;
                }
                .cssbuttons-io-button.secondary {
                  background: transparent;
                  color: white;
                  border: 2px solid white/30;
                  font-size: 16px;
                }
                .cssbuttons-io-button.secondary:hover {
                  background: white/10;
                  border-color: white/50;
                }
                .cssbuttons-io-button .icon {
                  background: white;
                  margin-left: 1em;
                  position: absolute;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  height: 2.2em;
                  width: 2.2em;
                  border-radius: 0.7em;
                  box-shadow: 0.1em 0.1em 0.6em 0.2em rgba(0, 0, 0, 0.2);
                  right: 0.3em;
                  transition: all 0.3s;
                }
                .cssbuttons-io-button.secondary .icon {
                  background: white;
                }
                .cssbuttons-io-button:hover .icon {
                  width: calc(100% - 0.6em);
                }
                .cssbuttons-io-button .icon svg {
                  width: 1.1em;
                  transition: transform 0.3s;
                  color: black;
                }
                .cssbuttons-io-button:hover .icon svg {
                  transform: translateX(0.1em);
                }
                .cssbuttons-io-button:active .icon {
                  transform: scale(0.95);
                }
              `}</style>
              <button className="cssbuttons-io-button primary" onClick={navigateToHomePage}>
                Try Quantize Free
                <div className="icon">
                  <MoveRight className="w-4 h-4" />
                </div>
              </button>
              <button className="cssbuttons-io-button secondary" onClick={navigateToAddCompany}>
                Add Your Company
                <div className="icon">
                  <Building2 className="w-4 h-4" />
                </div>
              </button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-white/60 text-sm">
              <span className="text-xs">No credit card required</span>
              <span className="hidden sm:inline text-white/30">•</span>
              <span className="text-xs">Free forever</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };