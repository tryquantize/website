import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Contact2 = () => {
  return (
    <form className="bg-gradient-to-br from-white/12 to-white/8 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
      {/* Name Fields Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div className="space-y-2">
          <Label htmlFor="firstname" className="text-sm font-medium text-white">
            First Name
          </Label>
          <Input
            type="text"
            id="firstname"
            placeholder="John"
            className="h-12 bg-white/10 border border-white/20 text-white placeholder:text-white/50 
                     focus:bg-white/15 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/30 
                     transition-all duration-200"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastname" className="text-sm font-medium text-white">
            Last Name
          </Label>
          <Input
            type="text"
            id="lastname"
            placeholder="Doe"
            className="h-12 bg-white/10 border border-white/20 text-white placeholder:text-white/50 
                     focus:bg-white/15 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/30 
                     transition-all duration-200"
          />
        </div>
      </div>

      {/* Email Field */}
      <div className="space-y-2 mb-6">
        <Label htmlFor="email" className="text-sm font-medium text-[#f5f5f7]">
          Email
        </Label>
        <Input
          type="email"
          id="email"
          placeholder="john@example.com"
          className="h-12 bg-white/10 border border-white/10 text-[#f5f5f7] placeholder:text-[#86868b] 
                   focus:bg-white/15 focus:border-[#0071e3]/50 focus:ring-2 focus:ring-[#0071e3]/50 
                   transition-all duration-200"
        />
      </div>

      {/* Subject Field */}
      <div className="space-y-2 mb-6">
        <Label htmlFor="subject" className="text-sm font-medium text-[#f5f5f7]">
          Subject
        </Label>
        <Input
          type="text"
          id="subject"
          placeholder="How can we help?"
          className="h-12 bg-white/10 border border-white/10 text-[#f5f5f7] placeholder:text-[#86868b] 
                   focus:bg-white/15 focus:border-[#0071e3]/50 focus:ring-2 focus:ring-[#0071e3]/50 
                   transition-all duration-200"
        />
      </div>

      {/* Message Field */}
      <div className="space-y-2 mb-8">
        <Label htmlFor="message" className="text-sm font-medium text-[#f5f5f7]">
          Message
        </Label>
        <Textarea
          id="message"
          placeholder="Tell us more about your inquiry..."
          rows={6}
          className="bg-white/10 border border-white/10 text-[#f5f5f7] placeholder:text-[#86868b] 
                   focus:bg-white/15 focus:border-[#0071e3]/50 focus:ring-2 focus:ring-[#0071e3]/50 
                   transition-all duration-200 resize-none"
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-14 bg-white text-black font-semibold text-base hover:bg-gray-100 
                 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5"
      >
        Send Message
      </Button>
    </form>
  );
};