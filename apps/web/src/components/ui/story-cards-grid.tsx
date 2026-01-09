import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Search, Bot, Megaphone, Zap, Target, Scale, Sparkles, Brain, Trophy } from "lucide-react";

export function StoryCardsGrid() {
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { once: true, amount: 0.1 });

    const storyCards = [
        {
            icon: Search,
            title: "The Problem",
            content: "Google search is a disaster. You spend hours trying to find a product, startup, or service, and what do you get? SEO spam. Paid ads. Generic blog lists written by people who've never used the tools they're ranking."
        },
        {
            icon: Bot,
            title: "Current Solutions Fall Short",
            content: "Even 'smart' tools like Perplexity just skim the surface. You might find something promising… then you're dumped into an endless maze of forms, demos, and 'contact us' pages just to get a simple answer."
        },
        {
            icon: Megaphone,
            title: "Discovery Arbitrage",
            content: "The current discovery process is a joke. Great companies and incredible products are buried because they can't win the SEO or ad-spend war. Meanwhile, users waste hours sifting through noise, only to settle for whoever shouts the loudest."
        },
        {
            icon: Zap,
            title: "Our Solution",
            content: "We're fixing this. Me and Yashwardhan Sable are building Quantize, an AI-powered search engine that connects you instantly to the exact product, company, startup, solution or freelancer you need."
        },
        {
            icon: Target,
            title: "Instant Connection",
            content: "No more 20 irrelevant links. No more guessing which landing page is worth your time. Type in what you're looking for, and our system surfaces the best-fit solutions, with one click, you can chat with the company, get a quote, use the product directly, or talk to a real human."
        },
        {
            icon: Scale,
            title: "Leveling the Playing Field",
            content: "This isn't just about convenience. It's about fixing a massive discovery arbitrage. It's about giving visibility back to the companies doing great work, not just the ones gaming the algorithm."
        },
        {
            icon: Sparkles,
            title: "The Vision",
            content: "Imagine replacing three hours of Googling and second-guessing with one clear, custom-fit recommendation, and an instant path to action."
        },
        {
            icon: Brain,
            title: "Intelligence First",
            content: "We're not here to 'index the web.' We're here to weaponize intelligence for search. To make finding a tool, startup, product, or solution feel like magic."
        },
        {
            icon: Trophy,
            title: "Merit-Based Discovery",
            content: "And to finally give visibility back to the companies doing great work, not just the ones who know how to game the algorithm."
        }
    ];

    const getRandomDirection = (index: number) => {
        // Simplified directions - just fade up
        return { x: 0, y: 50, rotate: 0 };
    };

    return (
        <>
            <style>{`
        .hover-card {
          width: 100%;
          height: 254px;
          background: #171717;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          position: relative;
          position: relative;
          border: 1px solid #333; /* Simple border instead of shadow */
          cursor: pointer;
          will-change: transform, opacity;
        }
        .hover-card .content {
          border-radius: 5px;
          background: #171717;
          width: calc(100% - 4px);
          height: 250px;
          z-index: 1;
          padding: 20px;
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: flex-start;
        }
        .content::before {
          opacity: 0;
          transition: opacity 300ms;
          content: " ";
          display: block;
          background: white;
          width: 5px;
          height: 50px;
          position: absolute;
          position: absolute;
          /* filter: blur(50px); REMOVED for performance */
          opacity: 0.5; /* Reduced opacity to compensate */
          overflow: hidden;
        }
        .hover-card:hover .content::before {
          opacity: 1;
        }
        .hover-card::before {
          opacity: 0;
          content: " ";
          position: absolute;
          display: block;
          width: 80px;
          height: 360px;
          background: linear-gradient(#ff2288, #387ef0);
          transition: opacity 300ms;
          animation: rotation_9018 8000ms infinite linear;
          animation-play-state: paused;
          will-change: transform, opacity;
        }
        .hover-card:hover::before {
          opacity: 1;
          animation-play-state: running;
        }
        .hover-card::after {
          position: absolute;
          content: " ";
          display: block;
          width: 250px;
          height: 360px;
          background: #171717;
          opacity: 0.8;
          /* backdrop-filter: blur(50px); REMOVED for performance */
          transform: translateZ(0);
        }
        @keyframes rotation_9018 {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
            <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {storyCards.map((card, index) => {
                    const direction = getRandomDirection(index);
                    return (
                        <motion.div
                            key={index}
                            className="hover-card"
                            initial={{
                                opacity: 0,
                                x: direction.x,
                                y: direction.y,
                                rotate: direction.rotate,
                                scale: 0.8
                            }}
                            animate={isInView ? {
                                opacity: 1,
                                x: 0,
                                y: 0,
                                rotate: 0,
                                scale: 1
                            } : {}}
                            transition={{
                                duration: 0.5,
                                delay: index * 0.05,
                                ease: "easeOut"
                            }}
                        >
                            <div className="content">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                                        <card.icon className="w-5 h-5 text-black" />
                                    </div>
                                    <h4 className="font-bold text-lg text-blue-400">{card.title}</h4>
                                </div>
                                <p className="text-sm leading-relaxed text-white/90">{card.content}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </>
    );
}
