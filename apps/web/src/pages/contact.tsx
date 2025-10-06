import { Mail, MessageSquare, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Component as RaycastAnimatedBackground } from "@/components/ui/raycast-animated-black-background";
import TestimonialsDemo from "@/components/ui/3d-testimonials-demo";

export default function ContactPage() {
  return (
    <div className="min-h-screen relative bg-black">
      <div className="absolute inset-0">
        <RaycastAnimatedBackground />
      </div>
      
      <div className="relative z-10 pt-20">
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Get in <span className="bg-gradient-to-r from-purple-400 via-violet-500 to-indigo-600 bg-clip-text text-transparent">Touch</span>
            </h1>
            
            <p className="text-xl text-white/80 mb-12">
              Have questions? We'd love to hear from you.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <Mail className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Email</h3>
                  <p className="text-white/70">info@quantize.site</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Support</h3>
                  <p className="text-white/70">support@quantize.site</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <Phone className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Business</h3>
                  <p className="text-white/70">business@quantize.site</p>
                </CardContent>
              </Card>
            </div>
            
            <Button 
              className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl"
              onClick={() => window.location.href = 'mailto:info@quantize.site'}
            >
              Send us an Email
            </Button>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              What Our <span className="bg-gradient-to-r from-purple-400 via-violet-500 to-indigo-600 bg-clip-text text-transparent">Users Say</span>
            </h2>
            
            <p className="text-xl text-white/80 mb-12">
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