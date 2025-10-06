import { Mail, MessageSquare, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Component as RaycastAnimatedBackground } from "@/components/ui/raycast-animated-purple-background";

import { Contact2 } from "@/components/ui/contact-2";
import Featured_05 from "@/components/ui/globe-feature-section";

export default function ContactPage() {
  return (
    <div className="min-h-screen relative bg-gradient-to-br from-purple-900 via-black to-indigo-900">
      <div className="fixed inset-0 z-0">
        <RaycastAnimatedBackground />
      </div>
      
      <div className="relative z-10 pt-20">
        {/* Contact Form Section */}
        <section className="py-2 sm:py-3 md:py-4 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-white">
              <Contact2 
                title="Contact Us"
                description="We are available for questions, feedback, or collaboration opportunities. Let us know how we can help!"
                phone="+91 7776004343"
                email="info@quantize.site"
                web={{ label: "quantize.site", url: "https://quantize.site" }}
                linkedin={{ label: "tryquantize", url: "https://www.linkedin.com/company/tryquantize/" }}
              />
            </div>
          </div>
        </section>

        {/* Globe Feature Section */}
        <section className="px-4">
          <Featured_05 />
        </section>

      </div>
    </div>
  );
}