// React hooks
import { useEffect, useRef, useState } from "react";                                 // State management

// Data fetching
import { useQuery, useMutation } from "@tanstack/react-query";     // API data fetching and mutations
import { apiRequest } from "@/lib/queryClient";                    // API request utility

// Custom components
import { SearchInterface } from "@/components/search-interface";    // Main search component with typewriter effect
import { ToolCard } from "@/components/tool-card";                 // Individual tool display cards

// UI components
import { Button } from "@/components/ui/button";                   // Reusable button component
import { Input } from "@/components/ui/input";                     // Form input component
import { Textarea } from "@/components/ui/textarea";               // Multi-line text input
import { Label } from "@/components/ui/label";                     // Form labels
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Dropdown components
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // Popover components
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"; // Command palette
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"; // Modal dialogs
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel"; // Carousel for FAQs

// Icons
import { ChevronsUpDown, Check, Loader2, Star, Clock, MapPin } from "lucide-react";      // UI icons

// Form handling
import { useForm } from "react-hook-form";                        // Form state management
import { zodResolver } from "@hookform/resolvers/zod";             // Zod schema validation
import { z } from "zod";                                           // Schema validation

// Utilities and hooks
import { cn } from "@/lib/utils";                                 // Utility for conditional classes
import { useToast } from "@/hooks/use-toast";                     // Toast notifications
import { useAuth } from "@/lib/auth";                              // Authentication state
import { useNavigation } from "@/hooks/use-navigation";            // Navigation with loading transitions
import { useMistScroll } from "@/hooks/use-mist-scroll";           // Mist fade on scroll

// Types and schemas
import { insertContactRequestSchema } from "@shared/schema";        // Contact form schema
import type { AiTool } from "@shared/schema";                      // AI tool type definition


/**
 * CONTACT FORM SCHEMA
 * 
 * Extends the base contact request schema with additional validation
 * Ensures all required fields are properly validated before submission
 * 
 * VALIDATION RULES:
 * - clientName: Required, non-empty string
 * - clientEmail: Valid email format required
 * - message: Minimum 10 characters for meaningful communication
 */
const contactFormSchema = insertContactRequestSchema.extend({
  clientName: z.string().min(1, "Name is required"),              // Required name field
  clientEmail: z.string().email("Valid email is required"),       // Valid email required
  message: z.string().min(10, "Message must be at least 10 characters") // Minimum message length
});

// TypeScript type derived from the schema
type ContactFormData = z.infer<typeof contactFormSchema>;

/**
 * HOME PAGE COMPONENT
 * 
 * The main landing page featuring:
 * 
 * SECTIONS:
 * 1. Hero Section: Large search interface with typewriter effect
 * 2. Value Proposition: Core benefits of the platform
 * 3. Trust Signals: Statistics and credibility indicators
 * 4. Popular Categories: Showcase of main content types
 * 5. How It Works: Step-by-step process explanation
 * 6. Benefits: Why choose this platform
 * 7. Testimonials: Social proof from users
 * 8. Newsletter Signup: Lead capture
 * 
 * FEATURES:
 * - Responsive design with cosmic theme
 * - Interactive search with suggestions
 * - Contact form for tool inquiries
 * - Category filtering system
 * - Loading transitions for navigation
 * - Comprehensive content sections
 * 
 * DESIGN THEME:
 * - Space nebula cosmos aesthetic
 * - Purple, blue, and cyan color palette
 * - Glassmorphism effects with backdrop blur
 * - No glow effects for clean appearance
 * - Large cards with generous spacing
 */
export default function Home() {
  // SEARCH STATE
  const [searchResults, setSearchResults] = useState<any>(null);    // Results from search API
  
  // CONTACT FORM STATE
  const [selectedTool, setSelectedTool] = useState<AiTool | null>(null); // Tool for contact inquiry
  const [contactDialogOpen, setContactDialogOpen] = useState(false); // Contact modal visibility
  
  // FILTER STATE
  const [filters, setFilters] = useState({
    pricingModel: "all",                                          // Pricing filter (all/free/paid)
    industries: "all"                                             // Industry filter
  });

  // HOOKS AND UTILITIES
  const { user } = useAuth();                                      // Current authenticated user
  const { toast } = useToast();                                    // Toast notification system
  const { navigateWithLoading } = useNavigation();                 // Navigation with loading transitions

  /**
   * CONTACT FORM SETUP
   * 
   * React Hook Form configuration with Zod validation
   * Pre-fills user information if authenticated
   * Provides form state management and validation
   */
  const contactForm = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),                      // Use Zod schema for validation
    defaultValues: {
      clientName: user?.name || "",                               // Pre-fill with user name
      clientEmail: user?.email || "",                             // Pre-fill with user email
      message: ""                                                 // Empty message field
    }
  });

  // FAQ CONTENT (10 items)
  const faqs: { question: string; answer: string }[] = [
    {
      question: "What makes AI Discovery different from other AI directories?",
      answer:
        "We curate, not crawl. Listings are verified by humans and organized for real buyer workflows — compare, shortlist, and take action fast.",
    },
    {
      question: "Does AI Discovery support unique use cases or custom needs?",
      answer:
        "Yes. Filter by industry, team size, pricing model, and integrations. You can also contact vendors directly from the platform.",
    },
    {
      question: "How do you keep listings accurate and up to date?",
      answer:
        "Vendors maintain their profiles and our team audits changes weekly. Popular tools are refreshed more frequently.",
    },
    {
      question: "Is there a cost to use AI Discovery?",
      answer:
        "Browsing is free. We may offer premium research packs and expert consultations for power users.",
    },
    {
      question: "Can teams collaborate inside AI Discovery?",
      answer:
        "Saved lists and shared notes are coming with early access. Join the waitlist to try it first.",
    },
    {
      question: "How do I contact a vendor through AI Discovery?",
      answer:
        "Open a tool card and use the contact form to send a message directly to the vendor’s team.",
    },
    {
      question: "Do you cover both free and paid tools?",
      answer:
        "Absolutely. Filter by pricing model to explore free, freemium, or paid options across categories.",
    },
    {
      question: "Can I save and share shortlists with my team?",
      answer:
        "Team lists and shared notes are in early access. Join the waitlist to get it first.",
    },
    {
      question: "Which industries are best represented?",
      answer:
        "We’re strong in marketing, sales, productivity, data, and customer support — with new industries added weekly.",
    },
    {
      question: "How often are new tools added?",
      answer:
        "We review and add tools every week, prioritizing quality and demand from our community.",
    },
  ];

  // Auto-scrolling FAQ carousel
  const [faqApi, setFaqApi] = useState<CarouselApi | null>(null);
  useEffect(() => {
    if (!faqApi) return;
    let stop = false;
    const cycle = () => {
      if (stop) return;
      faqApi.scrollNext();
      // if at end, jump to start seamlessly
      if (!faqApi.canScrollNext()) {
        faqApi.scrollTo(0);
      }
    };
    const id = setInterval(cycle, 3000); // 3s per card
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, [faqApi]);

  // TESTIMONIALS CONTENT
  const testimonials: { quote: string; name: string; role: string; initials: string }[] = [
    {
      quote:
        "We found the perfect AI CRM for our startup in under 10 minutes. Saved us weeks of research.",
      name: "Sarah Lee",
      role: "Startup Founder",
      initials: "SL",
    },
    {
      quote:
        "The filters and comparisons made it so easy to pick the right automation tool for our workflows.",
      name: "James Reed",
      role: "Digital Marketer",
      initials: "JR",
    },
    {
      quote:
        "Exactly what my team needed: verified listings, clean comparisons, and quick vendor contact.",
      name: "Priya Kapoor",
      role: "Head of Product",
      initials: "PK",
    },
    {
      quote:
        "I cut vendor discovery time by 90%. It's now part of our standard evaluation process.",
      name: "Daniel Chen",
      role: "Operations Lead",
      initials: "DC",
    },
    {
      quote:
        "Fantastic curation. I trust the results and love how fast it is to shortlist options.",
      name: "Aisha Khan",
      role: "Growth Manager",
      initials: "AK",
    },
    {
      quote:
        "The upcoming team lists will be a game changer for us. Can't wait to try early access.",
      name: "Marco Ruiz",
      role: "CTO",
      initials: "MR",
    },
  ];

  // Testimonials carousel state
  const [tApi, setTApi] = useState<CarouselApi | null>(null);
  useEffect(() => {
    if (!tApi) return;
    const id = setInterval(() => {
      tApi.scrollNext();
      if (!tApi.canScrollNext()) tApi.scrollTo(0);
    }, 4000);
    return () => clearInterval(id);
  }, [tApi]);

  /**
   * TOOLS DATA FETCHING
   * 
   * Fetches AI tools from the API with filtering support
   * Uses React Query for caching and automatic refetching
   * Builds query parameters based on current filter state
   */
  const { data: tools, isLoading } = useQuery({
    queryKey: ["/api/tools", filters],                            // Cache key includes filters
    queryFn: async () => {
      // Build query parameters from filters
      const params = new URLSearchParams();
      
      // Add pricing model filter if not "all"
      if (filters.pricingModel && filters.pricingModel !== "all") {
        params.append("pricingModel", filters.pricingModel);
      }
      
      // Add industry filter if not "all"
      if (filters.industries && filters.industries !== "all") {
        params.append("industries", filters.industries);
      }
      
      // Fetch tools with filters applied
      const response = await fetch(`/api/tools?${params.toString()}`);
      return response.json();
    }
  });

  /**
   * CONTACT FORM SUBMISSION MUTATION
   * 
   * Handles sending contact requests to startups/tools
   * Provides success and error handling with user feedback
   * Resets form and closes dialog on success
   */
  const contactMutation = useMutation({
    // API call function
    mutationFn: async (data: ContactFormData) => {
      const response = await apiRequest("POST", "/api/contact-requests", data);
      return response.json();
    },
    // Success handler
    onSuccess: () => {
      // Show success toast
      toast({
        title: "Message sent!",
        description: "Your contact request has been sent to the startup."
      });
      setContactDialogOpen(false);                               // Close dialog
      contactForm.reset();                                       // Reset form
    },
    // Error handler
    onError: () => {
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to send contact request. Please try again.",
        variant: "destructive"
      });
    }
  });

  /**
   * SEARCH RESULTS HANDLER
   * 
   * Callback function passed to SearchInterface component
   * Updates local state with search results for display
   */
  const handleSearchResults = (results: any) => {
    setSearchResults(results);                                     // Store search results
  };

  /**
   * TOOL CONTACT HANDLER
   * 
   * Initiates contact flow for a specific tool
   * Pre-fills form with tool information and opens dialog
   */
  const handleToolContact = (tool: AiTool) => {
    setSelectedTool(tool);                                         // Store selected tool
    contactForm.setValue("toolId", tool.id);                      // Set tool ID in form
    setContactDialogOpen(true);                                    // Open contact dialog
  };

  /**
   * CONTACT FORM SUBMISSION HANDLER
   * 
   * Processes contact form submission with additional metadata
   * Includes tool ID and client ID for proper routing
   */
  const onContactSubmit = (data: ContactFormData) => {
    contactMutation.mutate({
      ...data,                                                     // Form data
      toolId: selectedTool?.id || "",                              // Selected tool ID
      clientId: user?.id || ""                                     // Current user ID
    });
  };

  // DATA PREPARATION
  const displayTools = searchResults?.results || tools || [];      // Tools to display (search results or all tools)
  const searchQuery = searchResults?.query;                        // Current search query for display

  /**
   * CATEGORY OPTIONS FOR FILTERING
   * 
   * Comprehensive list of industry categories for filtering tools
   * Organized alphabetically for easy navigation
   * Covers wide range of industries and use cases
   * 
   * Used in the category combobox component for filtering
   */
  const CATEGORY_OPTIONS: { label: string; value: string }[] = [
    { label: "All Categories", value: "all" },
    { label: "Marketing", value: "Marketing" },
    { label: "E-commerce", value: "E-commerce" },
    { label: "Customer Service", value: "Customer Service" },
    { label: "Sales Automation", value: "Sales Automation" },
    { label: "Healthcare", value: "Healthcare" },
    { label: "Telemedicine", value: "Telemedicine" },
    { label: "Legal Tech", value: "Legal Tech" },
    { label: "Fintech", value: "Fintech" },
    { label: "Banking", value: "Banking" },
    { label: "Insurance", value: "Insurance" },
    { label: "Real Estate", value: "Real Estate" },
    { label: "Construction", value: "Construction" },
    { label: "Architecture", value: "Architecture" },
    { label: "Interior Design", value: "Interior Design" },
    { label: "Education", value: "Education" },
    { label: "EdTech", value: "EdTech" },
    { label: "HR Tech", value: "HR Tech" },
    { label: "Recruitment", value: "Recruitment" },
    { label: "Talent Management", value: "Talent Management" },
    { label: "Manufacturing", value: "Manufacturing" },
    { label: "Supply Chain", value: "Supply Chain" },
    { label: "Logistics", value: "Logistics" },
    { label: "Transportation", value: "Transportation" },
    { label: "Automotive", value: "Automotive" },
    { label: "Aviation", value: "Aviation" },
    { label: "Aerospace", value: "Aerospace" },
    { label: "Energy", value: "Energy" },
    { label: "Renewable Energy", value: "Renewable Energy" },
    { label: "Oil and Gas", value: "Oil and Gas" },
    { label: "Mining", value: "Mining" },
    { label: "Agriculture", value: "Agriculture" },
    { label: "Food Processing", value: "Food Processing" },
    { label: "Retail", value: "Retail" },
    { label: "Wholesale", value: "Wholesale" },
    { label: "Fashion", value: "Fashion" },
    { label: "Apparel", value: "Apparel" },
    { label: "Footwear", value: "Footwear" },
    { label: "Jewelry", value: "Jewelry" },
    { label: "Beauty", value: "Beauty" },
    { label: "Cosmetics", value: "Cosmetics" },
    { label: "Personal Care", value: "Personal Care" },
    { label: "Fitness", value: "Fitness" },
    { label: "Wellness", value: "Wellness" },
    { label: "Mental Health", value: "Mental Health" },
    { label: "Therapy", value: "Therapy" },
    { label: "Sports", value: "Sports" },
    { label: "Entertainment", value: "Entertainment" },
    { label: "Music", value: "Music" },
    { label: "Film", value: "Film" },
    { label: "Television", value: "Television" },
    { label: "Streaming", value: "Streaming" },
    { label: "Gaming", value: "Gaming" },
    { label: "Esports", value: "Esports" },
    { label: "Publishing", value: "Publishing" },
    { label: "News Media", value: "News Media" },
    { label: "Social Media", value: "Social Media" },
    { label: "Influencer Marketing", value: "Influencer Marketing" },
    { label: "Events", value: "Events" },
    { label: "Hospitality", value: "Hospitality" },
    { label: "Travel", value: "Travel" },
    { label: "Tourism", value: "Tourism" },
    { label: "Restaurants", value: "Restaurants" },
    { label: "Food Delivery", value: "Food Delivery" },
    { label: "Home Services", value: "Home Services" },
    { label: "Cleaning", value: "Cleaning" },
    { label: "Security", value: "Security" },
    { label: "Cybersecurity", value: "Cybersecurity" },
    { label: "Cloud Computing", value: "Cloud Computing" },
    { label: "Data Analytics", value: "Data Analytics" },
    { label: "Business Intelligence", value: "Business Intelligence" },
    { label: "Artificial Intelligence", value: "Artificial Intelligence" },
    { label: "Machine Learning", value: "Machine Learning" },
    { label: "Natural Language Processing", value: "Natural Language Processing" },
    { label: "Computer Vision", value: "Computer Vision" },
    { label: "Robotics", value: "Robotics" },
    { label: "Internet of Things", value: "Internet of Things" },
    { label: "Smart Home", value: "Smart Home" },
    { label: "Smart Cities", value: "Smart Cities" },
    { label: "Blockchain", value: "Blockchain" },
    { label: "Cryptocurrency", value: "Cryptocurrency" },
    { label: "Web3", value: "Web3" },
    { label: "NFTs", value: "NFTs" },
    { label: "Metaverse", value: "Metaverse" },
    { label: "AR/VR", value: "AR/VR" },
    { label: "Quantum Computing", value: "Quantum Computing" },
    { label: "Biotechnology", value: "Biotechnology" },
    { label: "Pharmaceuticals", value: "Pharmaceuticals" },
    { label: "Medical Devices", value: "Medical Devices" },
    { label: "Diagnostics", value: "Diagnostics" },
    { label: "Environmental Tech", value: "Environmental Tech" },
    { label: "Climate Tech", value: "Climate Tech" },
    { label: "Water Management", value: "Water Management" },
    { label: "Waste Management", value: "Waste Management" },
    { label: "Recycling", value: "Recycling" },
    { label: "Packaging", value: "Packaging" },
    { label: "Printing", value: "Printing" },
    { label: "Telecommunications", value: "Telecommunications" },
    { label: "Networking", value: "Networking" },
    { label: "Hardware", value: "Hardware" },
    { label: "Electronics", value: "Electronics" },
    { label: "Semiconductors", value: "Semiconductors" },
    { label: "Education Consulting", value: "Education Consulting" },
    { label: "Market Research", value: "Market Research" },
    { label: "Creative Agencies", value: "Creative Agencies" },
    { label: "Product Design", value: "Product Design" },
    { label: "Prototyping", value: "Prototyping" },
    { label: "UX/UI Design", value: "UX/UI Design" },
    { label: "Automation Tools", value: "Automation Tools" },
    { label: "Collaboration Tools", value: "Collaboration Tools" },
    { label: "Productivity Software", value: "Productivity Software" },
    { label: "Knowledge Management", value: "Knowledge Management" },
    { label: "File Storage", value: "File Storage" },
    { label: "Document Management", value: "Document Management" },
    { label: "Payments", value: "Payments" },
    { label: "Accounting", value: "Accounting" },
    { label: "Taxation", value: "Taxation" },
    { label: "Bookkeeping", value: "Bookkeeping" },
    { label: "Compliance", value: "Compliance" },
  ];

  /**
   * CATEGORY COMBOBOX COMPONENT
   * 
   * Searchable dropdown for selecting industry categories
   * Features:
   * - Search functionality for quick category finding
   * - Visual selection indicators
   * - Keyboard navigation support
   * - Responsive design
   * 
   * Props:
   * - value: Currently selected category value
   * - onChange: Callback when selection changes
   */
  function CategoryCombobox({ value, onChange }: { value: string; onChange: (val: string) => void }) {
    const [open, setOpen] = useState(false);                       // Dropdown open state
    const current = CATEGORY_OPTIONS.find((c) => c.value === value) || CATEGORY_OPTIONS[0]; // Current selection
    
    return (
      <Popover open={open} onOpenChange={setOpen}>
        {/* Trigger button showing current selection */}
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-48 justify-between" data-testid="industry-filter">
            {current.label}                                        {/* Display current category */}
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" /> {/* Dropdown indicator */}
          </Button>
        </PopoverTrigger>
        
        {/* Dropdown content with search */}
        <PopoverContent className="w-64 p-0">
          <Command>
            <CommandInput placeholder="Search category..." />      {/* Search input */}
            <CommandList>
              <CommandEmpty>No category found.</CommandEmpty>       {/* No results message */}
              <CommandGroup>
                {/* Render all category options */}
                {CATEGORY_OPTIONS.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    value={opt.label}
                    onSelect={() => {
                      onChange(opt.value);                         // Update selection
                      setOpen(false);                              // Close dropdown
                    }}
                  >
                    {/* Check mark for selected item */}
                    <Check className={cn("mr-2 h-4 w-4", value === opt.value ? "opacity-100" : "opacity-0")} />
                    {opt.label}                                    {/* Category label */}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }

  const pageRef = useRef<HTMLDivElement | null>(null);
  useMistScroll(pageRef, { selector: ".mist-target", intensityViewportFactor: 0.8 });

  return (
    /**
     * MAIN PAGE CONTAINER
     * 
     * Full-height container with responsive padding
     * Uses container class for consistent max-width and centering
     */
    <div ref={pageRef} className="min-h-screen">
      <div className="container mx-auto px-4">
        {/* 
         * HERO SECTION WITH SEARCH
         * 
         * Main focal point of the homepage featuring:
         * - Large search interface with typewriter effect
         * - Quick access button to browse all solutions
         * - Cosmic theme styling with purple accents
         */}
        <div className="mb-16 mist-target mist-lift">
          {/* Main search interface component */}
          <SearchInterface onSearchResults={handleSearchResults} />
          
          {/* 
           * QUICK ACCESS BUTTON
           * Secondary CTA for users who want to browse without searching
           * Styled with cosmic theme colors and hover effects
           */}
          <div className="text-center mt-8">
            <Button
              onClick={() => navigateWithLoading('/list')}           // Navigate with loading transition
              variant="outline"
              className="border-purple-400/40 text-white hover:bg-purple-500/20 hover:border-purple-400/60 px-8 py-4 text-lg"
            >
              Browse All Solutions
            </Button>
          </div>
        </div>

        {/* 
         * HERO VALUE PROPOSITION
         * 
         * Main value statement explaining the platform's purpose
         * Large, bold typography for maximum impact
         * Centered layout with generous spacing
         */}
        <div className="text-center mb-24 mist-target mist-lift">
          {/* 
           * MAIN HEADLINE
           * Large, responsive text that scales from 5xl to 6xl
           * Bold weight for strong visual hierarchy
           */}
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
            Discover the World's Best AI Tools, All in One Place
          </h2>
          
          {/* 
           * SUPPORTING DESCRIPTION
           * Explains the core value proposition in detail
           * Large text size for readability, constrained width for optimal reading
           */}
          <p className="text-2xl text-white/80 max-w-4xl mx-auto mb-12">
            We bring together the smartest AI tools, products, services, and experts so you can find exactly what you need — faster, simpler, smarter.
          </p>
        </div>

        {/* Value Proposition Cards - removed as requested */}

        {/* Trust Signals - removed as requested */}

        {/* Popular Categories - removed as requested */}

        {/* How It Works - removed as requested */}

        {/* Why Choose section - removed as requested */}

        {/* Testimonials - removed as requested */}

        {/* Stay Updated - removed as requested */}

        {/* FAQs Section */}
        <div className="mb-24 mist-target">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h3 className="text-4xl md:text-5xl font-bold text-white mb-2">Frequently Asked <span className="text-blue-400">Questions</span></h3>
              <p className="text-white/70 max-w-xl">Find answers to common questions about our platform, how we curate tools, and what’s coming next.</p>
            </div>
          </div>
          <div className="relative">
            <Carousel className="px-2" opts={{ align: "start", loop: true, dragFree: true }} setApi={setFaqApi}>
              <CarouselContent>
                {faqs.map((item, idx) => (
                  <CarouselItem key={idx} className="md:basis-1/3 lg:basis-1/4">
                    <div
                      className="rounded-2xl p-6 md:p-6 h-full bg-white/10 backdrop-blur-md border border-white/10 text-white/90"
                      style={{ minHeight: 180 }}
                    >
                      <h4 className="text-lg font-semibold mb-3 leading-snug text-white">{item.question}</h4>
                      <p className="text-sm leading-relaxed text-white/80">{item.answer}</p>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-top-12 left-auto right-12 md:right-14 bg-white/10 border-white/20 text-white hover:bg-white/20" />
              <CarouselNext className="-top-12 right-3 md:right-5 bg-white text-black hover:bg-white/90" />
            </Carousel>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mb-24 mist-target">
          <div className="text-center mb-12">
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-3">What Our Users Are Saying</h3>
            <p className="text-white/70">Trusted by teams worldwide for speed, curation, and clarity.</p>
          </div>

          {/* 2 rows x 3 columns responsive grid with a tilted featured card */}
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.slice(0, 6).map((t, idx) => (
              <div
                key={idx}
                className={
                  idx === 1
                    ? "md:col-span-1 relative" // middle of first row gets the featured card next
                    : ""
                }
              >
                <div
                  className={
                    idx === 1
                      ? "rounded-3xl p-6 md:p-8 bg-white/12 backdrop-blur-lg border border-white/20 shadow-xl transform md:rotate-[-4deg]"
                      : "rounded-2xl p-6 bg-white/8 backdrop-blur-md border border-white/10"
                  }
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
                        {t.initials}
                      </div>
                      <div>
                        <div className="text-white font-semibold text-sm">{t.name}</div>
                        <div className="text-white/60 text-xs">{t.role}</div>
                      </div>
                    </div>
                    <div className="flex gap-1 text-yellow-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-white/90 leading-relaxed text-sm md:text-base">“{t.quote}”</p>
                  <div className="mt-5 inline-flex items-center gap-2 text-white/60 text-xs bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    <Clock className="w-3.5 h-3.5" /> Using for 6–12 months
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Dialog */}
        <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
          <DialogContent className="sm:max-w-md" data-testid="contact-dialog">
            <DialogHeader>
              <DialogTitle>Contact {selectedTool?.name}</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={contactForm.handleSubmit(onContactSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Your Name *</Label>
                  <Input
                    id="clientName"
                    {...contactForm.register("clientName")}
                    data-testid="contact-name-input"
                  />
                  {contactForm.formState.errors.clientName && (
                    <p className="text-sm text-destructive">
                      {contactForm.formState.errors.clientName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Your Email *</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    {...contactForm.register("clientEmail")}
                    data-testid="contact-email-input"
                  />
                  {contactForm.formState.errors.clientEmail && (
                    <p className="text-sm text-destructive">
                      {contactForm.formState.errors.clientEmail.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  rows={4}
                  placeholder="Tell them about your needs and how you'd like to use their AI tool..."
                  {...contactForm.register("message")}
                  data-testid="contact-message-input"
                />
                {contactForm.formState.errors.message && (
                  <p className="text-sm text-destructive">
                    {contactForm.formState.errors.message.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setContactDialogOpen(false)}
                  data-testid="contact-cancel-button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={contactMutation.isPending}
                  data-testid="contact-send-button"
                >
                  {contactMutation.isPending ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
