import { motion } from "framer-motion";
import { Search, Bot, Megaphone, Zap, Target, Scale, Sparkles, Brain, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

const storyItems = [
    {
        icon: Search,
        title: "The Problem",
        content: "Google search is a disaster. You spend hours trying to find a product, startup, or service, and what do you get? SEO spam. Paid ads. Generic blog lists.",
        className: "md:col-span-2 md:row-span-1",
    },
    {
        icon: Bot,
        title: "Current Solutions Fall Short",
        content: "Even 'smart' tools like Perplexity just skim the surface. You might find something promising… then you're dumped into an endless maze of forms.",
        className: "md:col-span-1 md:row-span-1",
    },
    {
        icon: Megaphone,
        title: "Discovery Arbitrage",
        content: "Great companies and incredible products are buried because they can't win the SEO or ad-spend war. Users waste hours sifting through noise.",
        className: "md:col-span-1 md:row-span-2",
    },
    {
        icon: Zap,
        title: "Our Solution",
        content: "We're fixing this. Me and Yashwardhan Sable are building Quantize, an AI-powered search engine that connects you instantly to the exact solution you need.",
        className: "md:col-span-2 md:row-span-1",
    },
    {
        icon: Target,
        title: "Instant Connection",
        content: "No more 20 irrelevant links. Type in what you're looking for, and our system surfaces the best-fit solutions. Chat, get a quote, or use the product directly.",
        className: "md:col-span-2 md:row-span-1",
    },
    {
        icon: Scale,
        title: "Leveling the Playing Field",
        content: "This isn't just about convenience. It's about fixing a massive discovery arbitrage. Giving visibility back to the companies doing great work.",
        className: "md:col-span-1 md:row-span-1",
    },
    {
        icon: Sparkles,
        title: "The Vision",
        content: "Imagine replacing three hours of Googling and second-guessing with one clear, custom-fit recommendation, and an instant path to action.",
        className: "md:col-span-1 md:row-span-1",
    },
    {
        icon: Brain,
        title: "Intelligence First",
        content: "We're not here to 'index the web.' We're here to weaponize intelligence for search. To make finding a tool feel like magic.",
        className: "md:col-span-1 md:row-span-1",
    },
    {
        icon: Trophy,
        title: "Merit-Based Discovery",
        content: "Finally give visibility back to the companies doing great work, not just the ones who know how to game the algorithm.",
        className: "md:col-span-1 md:row-span-1",
    },
];

export function StorySection() {
    return (
        <>
            {/* Desktop Grid View */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
                {storyItems.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className={cn(
                            "group relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-colors duration-300",
                            item.className
                        )}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative z-10 h-full flex flex-col">
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-blue-400 group-hover:scale-110 transition-transform duration-300">
                                <item.icon className="h-6 w-6" />
                            </div>

                            <h3 className="mb-2 text-xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300">
                                {item.title}
                            </h3>

                            <p className="text-white/70 leading-relaxed text-sm flex-grow">
                                {item.content}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Mobile Carousel View */}
            <div className="md:hidden w-full px-4">
                <Carousel className="w-full max-w-sm mx-auto" opts={{ align: "start", loop: true }}>
                    <CarouselContent>
                        {storyItems.map((item, index) => (
                            <CarouselItem key={index} className="basis-[85%]">
                                <div className="h-full p-1">
                                    <div className="h-full flex flex-col rounded-3xl bg-white/5 border border-white/10 p-6">
                                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-blue-400">
                                            <item.icon className="h-6 w-6" />
                                        </div>
                                        <h3 className="mb-2 text-xl font-bold text-white">
                                            {item.title}
                                        </h3>
                                        <p className="text-white/70 leading-relaxed text-sm">
                                            {item.content}
                                        </p>
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
        </>
    );
}
