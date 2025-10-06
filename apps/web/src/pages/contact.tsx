import { Mail, MessageSquare, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Component as RaycastAnimatedBackground } from "@/components/ui/raycast-animated-black-background";
import TestimonialsDemo from "@/components/ui/3d-testimonials-demo";
import { Contact2 } from "@/components/ui/contact-2";

export default function ContactPage() {
  return (
    <div className="min-h-screen relative bg-black">
      <div className="absolute inset-0">
        <RaycastAnimatedBackground />
      </div>
      
      <div className="relative z-10 pt-20">
        {/* Contact Form Section */}
        <section className="py-12 sm:py-16 md:py-20 px-4">
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
        
        {/* Testimonials Section */}
        <section className="py-12 sm:py-16 md:py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              What Our <span className="bg-gradient-to-r from-purple-400 via-violet-500 to-indigo-600 bg-clip-text text-transparent">Users Say</span>
            </h2>
            
            <p className="text-lg sm:text-xl text-white/80 mb-8 sm:mb-12 px-4">
              Join thousands of researchers, students, and professionals who trust Quantize for their search needs.
            </p>
            
            <div className="flex justify-center">
              <TestimonialsDemo />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}