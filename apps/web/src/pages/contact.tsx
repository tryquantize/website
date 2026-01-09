import { Component as RaycastBackground } from "@/components/ui/raycast-animated-background";
import { SectionBadge } from "@/components/ui/section-badge";
import { Phone, Mail, Globe, Linkedin, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  return (
    <div className="relative w-full min-h-screen bg-black overflow-hidden">
      {/* Raycast Animation Background */}
      <div className="fixed inset-0 w-full h-full z-0">
        <RaycastBackground />
      </div>

      {/* Content */}
      <div className="relative z-10 pt-32 pb-24">
        {/* Hero Section */}
        <section className="text-center mb-24 px-4">
          <div className="max-w-4xl mx-auto">
            <SectionBadge>CONTACT US</SectionBadge>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#f5f5f7] mb-8">
              Let's Start a
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Conversation
              </span>
            </h1>
            <p className="text-xl text-[#86868b] leading-relaxed max-w-2xl mx-auto">
              Have a question or want to work together? We'd love to hear from you.
            </p>
          </div>
        </section>

        {/* Main Content - Split Layout */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Left Side - Contact Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Get in Touch */}
              <div>
                <h2 className="text-2xl font-bold text-[#f5f5f7] mb-6">Get in Touch</h2>
                <p className="text-[#86868b] leading-relaxed mb-8">
                  Whether you have a question about features, pricing, or anything else, our team is ready to answer all your questions.
                </p>
              </div>

              {/* Contact Methods */}
              <div className="space-y-6">
                {/* Email */}
                <a
                  href="mailto:info@quantize.site"
                  className="group flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 
                           hover:from-white/15 hover:to-white/10 hover:border-white/30 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Mail className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white/70 mb-1 uppercase tracking-wider">Email</h3>
                    <p className="text-white font-medium truncate">info@quantize.site</p>
                  </div>
                </a>

                {/* Phone */}
                <a
                  href="tel:+917776004343"
                  className="group flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 
                           hover:from-white/15 hover:to-white/10 hover:border-white/30 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Phone className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white/70 mb-1 uppercase tracking-wider">Phone</h3>
                    <p className="text-white font-medium">+91 7776004343</p>
                  </div>
                </a>

                {/* Website */}
                <a
                  href="https://quantize.site"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 
                           hover:from-white/15 hover:to-white/10 hover:border-white/30 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Globe className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white/70 mb-1 uppercase tracking-wider">Website</h3>
                    <p className="text-white font-medium">quantize.site</p>
                  </div>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com/company/tryquantize/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 
                           hover:from-white/15 hover:to-white/10 hover:border-white/30 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/20 to-blue-700/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Linkedin className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white/70 mb-1 uppercase tracking-wider">LinkedIn</h3>
                    <p className="text-white font-medium">tryquantize</p>
                  </div>
                </a>
              </div>

              {/* Business Hours */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-400" />
                  </div>
                  <h3 className="text-lg font-bold text-[#f5f5f7]">Business Hours</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-[#86868b]">
                    <span>Monday - Friday</span>
                    <span className="text-[#f5f5f7]">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between text-[#86868b]">
                    <span>Saturday - Sunday</span>
                    <span className="text-[#f5f5f7]">Closed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Contact Form */}
            <div className="lg:col-span-3">
              <form className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10
                             shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                <h2 className="text-2xl font-bold text-[#f5f5f7] mb-8">Send us a Message</h2>

                {/* Name Fields Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstname" className="text-sm font-semibold text-[#f5f5f7]">
                      First Name <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="firstname"
                      placeholder="John"
                      className="h-12 bg-white/5 border border-white/10 text-[#f5f5f7] placeholder:text-[#86868b] 
                               focus:bg-white/10 focus:border-[#0071e3]/50 focus:ring-2 focus:ring-[#0071e3]/20 
                               transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastname" className="text-sm font-semibold text-[#f5f5f7]">
                      Last Name <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="lastname"
                      placeholder="Doe"
                      className="h-12 bg-white/5 border border-white/10 text-[#f5f5f7] placeholder:text-[#86868b] 
                               focus:bg-white/10 focus:border-[#0071e3]/50 focus:ring-2 focus:ring-[#0071e3]/20 
                               transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2 mb-6">
                  <Label htmlFor="email" className="text-sm font-semibold text-[#f5f5f7]">
                    Email <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    placeholder="john@example.com"
                    className="h-12 bg-white/5 border border-white/10 text-[#f5f5f7] placeholder:text-[#86868b] 
                             focus:bg-white/10 focus:border-[#0071e3]/50 focus:ring-2 focus:ring-[#0071e3]/20 
                             transition-all duration-200"
                  />
                </div>

                {/* Subject Field */}
                <div className="space-y-2 mb-6">
                  <Label htmlFor="subject" className="text-sm font-semibold text-[#f5f5f7]">
                    Subject <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="subject"
                    placeholder="How can we help you?"
                    className="h-12 bg-white/5 border border-white/10 text-[#f5f5f7] placeholder:text-[#86868b] 
                             focus:bg-white/10 focus:border-[#0071e3]/50 focus:ring-2 focus:ring-[#0071e3]/20 
                             transition-all duration-200"
                  />
                </div>

                {/* Message Field */}
                <div className="space-y-2 mb-8">
                  <Label htmlFor="message" className="text-sm font-semibold text-[#f5f5f7]">
                    Message <span className="text-red-400">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your inquiry..."
                    rows={6}
                    className="bg-white/5 border border-white/10 text-[#f5f5f7] placeholder:text-[#86868b] 
                             focus:bg-white/10 focus:border-[#0071e3]/50 focus:ring-2 focus:ring-[#0071e3]/20 
                             transition-all duration-200 resize-none"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-14 bg-white text-black font-semibold text-base hover:bg-gray-100 
                           hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group"
                >
                  <span>Send Message</span>
                  <Mail className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>

                <p className="text-center text-sm text-[#86868b] mt-6">
                  We'll get back to you within 24 hours
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}