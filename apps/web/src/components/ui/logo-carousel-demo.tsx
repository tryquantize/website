"use client";

import { LogoCarousel } from "@/components/ui/logo-carousel";

const demoLogos = [
  { id: 1, name: "OpenAI", src: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=120&h=40&fit=crop&crop=center" },
  { id: 2, name: "Google", src: "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=120&h=40&fit=crop&crop=center" },
  { id: 3, name: "Microsoft", src: "https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=120&h=40&fit=crop&crop=center" },
  { id: 4, name: "Apple", src: "https://images.unsplash.com/photo-1621768216002-5ac171876625?w=120&h=40&fit=crop&crop=center" },
  { id: 5, name: "Meta", src: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=120&h=40&fit=crop&crop=center" },
  { id: 6, name: "Amazon", src: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=120&h=40&fit=crop&crop=center" },
];

function LogoCarouselBasic() {
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg">
      <div className="pt-6 pb-6">
        <div className="text-center space-y-4 mb-12">
          <p className="text-sm font-medium tracking-widest text-white/60">
            TRUSTED BY TEAMS FROM AROUND THE WORLD
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-none text-white">
            The best are already here
          </h2>
        </div>
        <LogoCarousel logos={demoLogos} columns={3} />
      </div>
    </div>
  );
}

export { LogoCarouselBasic };