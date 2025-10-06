import React from "react";
import { Phone, Mail, Globe, Linkedin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Contact2Props {
  title?: string;
  description?: string;
  phone?: string;
  email?: string;
  web?: { label: string; url: string };
  linkedin?: { label: string; url: string };
}

export const Contact2 = ({
  title = "Contact Us",
  description = "We are available for questions, feedback, or collaboration opportunities. Let us know how we can help!",
  phone = "(123) 34567890",
  email = "email@example.com",
  web = { label: "shadcnblocks.com", url: "https://shadcnblocks.com" },
  linkedin,
}: Contact2Props) => {
  return (
    <section className="py-8">
      <div className="container">
        <div className="mx-auto flex max-w-screen-xl flex-col justify-between gap-10 lg:flex-row lg:gap-20">
          <div className="mx-auto flex max-w-sm flex-col justify-between gap-10">
            <div className="text-center lg:text-left">
              <h1 className="mb-2 text-5xl font-semibold lg:mb-1 lg:text-6xl text-white">
                {title}
              </h1>
              <p className="text-white/80">{description}</p>
            </div>
            <div className="mx-auto w-fit lg:mx-0">
              <h3 className="mb-6 text-center text-2xl font-semibold lg:text-left text-white">
                Contact Details
              </h3>
              <div className="flex gap-4">
                <a href={`tel:${phone}`} className="w-12 h-12 rounded-full bg-white/10 border border-white/30 flex items-center justify-center text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300 group">
                  <Phone className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
                <a href={`mailto:${email}`} className="w-12 h-12 rounded-full bg-white/10 border border-white/30 flex items-center justify-center text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300 group">
                  <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
                <a href={web.url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/10 border border-white/30 flex items-center justify-center text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300 group">
                  <Globe className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
                {linkedin && (
                  <a href={linkedin.url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/10 border border-white/30 flex items-center justify-center text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300 group">
                    <Linkedin className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="mx-auto flex max-w-screen-md flex-col gap-6 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-10">
            <div className="flex gap-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="firstname" className="text-white">First Name</Label>
                <Input type="text" id="firstname" placeholder="First Name" className="bg-white/10 border-white/20 text-white placeholder:text-white/50" />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="lastname" className="text-white">Last Name</Label>
                <Input type="text" id="lastname" placeholder="Last Name" className="bg-white/10 border-white/20 text-white placeholder:text-white/50" />
              </div>
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input type="email" id="email" placeholder="Email" className="bg-white/10 border-white/20 text-white placeholder:text-white/50" />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="subject" className="text-white">Subject</Label>
              <Input type="text" id="subject" placeholder="Subject" className="bg-white/10 border-white/20 text-white placeholder:text-white/50" />
            </div>
            <div className="grid w-full gap-1.5">
              <Label htmlFor="message" className="text-white">Message</Label>
              <Textarea placeholder="Type your message here." id="message" className="bg-white/10 border-white/20 text-white placeholder:text-white/50" />
            </div>
            <Button className="w-full bg-white hover:bg-gray-100 text-black">Send Message</Button>
          </div>
        </div>
      </div>
    </section>
  );
};