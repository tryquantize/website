import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
    {
        question: "What makes Quantize different?",
        answer: "We curate, not crawl. Listings are verified by humans and organized for real buyer workflows — compare, shortlist, and take action fast.",
    },
    {
        question: "Is it free to use?",
        answer: "Yes, searching and comparing tools is completely free for users. We charge vendors for premium listings and lead generation.",
    },
    {
        question: "How often is data updated?",
        answer: "Our index is updated daily. We use a combination of automated monitoring and manual verification to ensure accuracy.",
    },
    {
        question: "Can I list my own tool?",
        answer: "Absolutely. You can submit your tool for review. Once verified, it will be added to our directory.",
    },
    {
        question: "Do you offer API access?",
        answer: "Yes, we offer an API for enterprise customers who want to integrate our search capabilities into their own applications.",
    },
    {
        question: "How do you verify tools?",
        answer: "Our team manually tests every tool to verify its features, pricing, and claims before it goes live on our platform.",
    },
];

export function FaqSection() {
    const [showAll, setShowAll] = useState(false);

    // On mobile, show only top 3 unless expanded
    const mobileFaqs = showAll ? faqs : faqs.slice(0, 3);

    return (
        <section className="py-20 relative">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Desktop 2-Column Grid */}
                <div className="hidden md:grid grid-cols-2 gap-6">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            viewport={{ once: true }}
                        >
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value={`item-${index}`} className="border-white/10 bg-gradient-to-br from-white/12 to-white/8 backdrop-blur-2xl border border-white/20 rounded-xl px-6">
                                    <AccordionTrigger className="text-left text-white hover:text-blue-400 hover:no-underline py-4 text-base font-medium">
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-white/70 pb-4">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </motion.div>
                    ))}
                </div>

                {/* Mobile View with "View More" */}
                <div className="md:hidden space-y-4">
                    {mobileFaqs.map((faq, index) => (
                        <Accordion key={index} type="single" collapsible className="w-full">
                            <AccordionItem value={`item-${index}`} className="border-white/10 bg-gradient-to-br from-white/12 to-white/8 backdrop-blur-2xl border border-white/20 rounded-xl px-5">
                                <AccordionTrigger className="text-left text-white hover:text-blue-400 hover:no-underline py-4 text-sm font-medium">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-white/70 pb-4 text-sm">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    ))}

                    {faqs.length > 3 && (
                        <div className="flex justify-center mt-6">
                            <Button
                                variant="ghost"
                                onClick={() => setShowAll(!showAll)}
                                className="text-white/70 hover:text-white hover:bg-white/10 gap-2"
                            >
                                {showAll ? (
                                    <>Show Less <ChevronUp className="w-4 h-4" /></>
                                ) : (
                                    <>View More <ChevronDown className="w-4 h-4" /></>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
