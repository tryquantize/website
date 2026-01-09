import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import { motion } from "motion/react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const testimonials = [
  {
    text: "Quantize revolutionized our AI tool discovery process. We found the perfect solution for our startup in minutes, not weeks.",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    name: "Sarah Chen",
    role: "Startup Founder",
  },
  {
    text: "The curation quality is exceptional. Every tool we've discovered through Quantize has been exactly what we needed.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    name: "Marcus Rodriguez",
    role: "Product Manager",
  },
  {
    text: "Finally, a platform that understands what businesses actually need. The filtering and comparison features are game-changing.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    name: "Emily Watson",
    role: "Operations Director",
  },
  {
    text: "Quantize saved us countless hours of research. The direct vendor contact feature streamlined our entire procurement process.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    name: "David Kim",
    role: "CTO",
  },
  {
    text: "The team collaboration features in early access are incredible. Can't wait for the full release!",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    name: "Lisa Thompson",
    role: "Growth Manager",
  },
  {
    text: "From free tools to enterprise solutions, Quantize covers everything. It's become our go-to resource for AI discovery.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    name: "James Wilson",
    role: "Innovation Lead",
  },
  {
    text: "The quality of listings and vendor verification gives us confidence in every tool we evaluate through the platform.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    name: "Rachel Green",
    role: "Business Analyst",
  },
  {
    text: "Quantize understands our industry needs perfectly. The categorization and filtering make finding relevant tools effortless.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    name: "Alex Johnson",
    role: "Marketing Director",
  },
  {
    text: "The platform's focus on real buyer workflows sets it apart. Everything is designed for actual decision-making, not just browsing.",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
    name: "Sophia Martinez",
    role: "VP of Technology",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

const TestimonialsColumns = () => {
  return (
    <section className="relative">
      <div className="container z-10 mx-auto">
        <div className="hidden md:flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>

        {/* Mobile Carousel View */}
        <div className="md:hidden mt-10 px-4">
          <Carousel className="w-full max-w-sm mx-auto" opts={{ align: "start", loop: true }}>
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="basis-[85%]">
                  <div className="h-full p-1">
                    <div className="h-full flex flex-col p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
                      <p className="text-white/90 text-sm leading-relaxed mb-6">"{testimonial.text}"</p>
                      <div className="flex items-center gap-3 mt-auto">
                        <img src={testimonial.image} alt={testimonial.name} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <div className="text-white font-medium text-sm">{testimonial.name}</div>
                          <div className="text-white/50 text-xs">{testimonial.role}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-end gap-2 mt-4 pr-4">
              <CarouselPrevious className="static translate-y-0 bg-white/10 border-white/20 text-white hover:bg-white/20" />
              <CarouselNext className="static translate-y-0 bg-white text-black hover:bg-white/90" />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsColumns;