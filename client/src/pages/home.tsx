// React hooks
import { useState } from "react";                                 // State management

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

// Icons
import { ChevronsUpDown, Check, Loader2 } from "lucide-react";      // UI icons

// Form handling
import { useForm } from "react-hook-form";                        // Form state management
import { zodResolver } from "@hookform/resolvers/zod";             // Zod schema validation
import { z } from "zod";                                           // Schema validation

// Utilities and hooks
import { cn } from "@/lib/utils";                                 // Utility for conditional classes
import { useToast } from "@/hooks/use-toast";                     // Toast notifications
import { useAuth } from "@/lib/auth";                              // Authentication state
import { useNavigation } from "@/hooks/use-navigation";            // Navigation with loading transitions

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

  return (
    /**
     * MAIN PAGE CONTAINER
     * 
     * Full-height container with responsive padding
     * Uses container class for consistent max-width and centering
     */
    <div className="min-h-screen">
      <div className="container mx-auto px-4">
        {/* 
         * HERO SECTION WITH SEARCH
         * 
         * Main focal point of the homepage featuring:
         * - Large search interface with typewriter effect
         * - Quick access button to browse all solutions
         * - Cosmic theme styling with purple accents
         */}
        <div className="mb-16">
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
        <div className="text-center mb-24">
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

        {/* Value Proposition Cards */}
        <div className="grid md:grid-cols-2 gap-12 mb-24">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 border border-purple-500/20 hover:border-purple-500/40 transition-all">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-4xl mb-8">🔍</div>
            <h3 className="text-2xl font-semibold text-white mb-4">Comprehensive Directory</h3>
            <p className="text-white/70 text-lg leading-relaxed">From AI content creation tools to full-scale automation platforms. Discover thousands of verified solutions.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 border border-purple-500/20 hover:border-purple-500/40 transition-all">
            <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center text-4xl mb-8">✅</div>
            <h3 className="text-2xl font-semibold text-white mb-4">Verified Listings</h3>
            <p className="text-white/70 text-lg leading-relaxed">We handpick and review each product for quality and reliability. Only the best make it to our platform.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 border border-purple-500/20 hover:border-purple-500/40 transition-all">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-4xl mb-8">⚡</div>
            <h3 className="text-2xl font-semibold text-white mb-4">Fast Comparisons</h3>
            <p className="text-white/70 text-lg leading-relaxed">Side-by-side feature and pricing breakdowns. Make informed decisions in minutes, not hours.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 border border-purple-500/20 hover:border-purple-500/40 transition-all">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-4xl mb-8">🎯</div>
            <h3 className="text-2xl font-semibold text-white mb-4">For Every Use Case</h3>
            <p className="text-white/70 text-lg leading-relaxed">Whether you're running a startup, managing a business, or freelancing. Solutions for every need.</p>
          </div>
        </div>

        {/* Trust Signals */}
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-3xl p-16 mb-24 border border-purple-500/20">
          <div className="grid md:grid-cols-4 gap-12 text-center">
            <div>
              <div className="text-6xl font-bold text-purple-400 mb-4">2,000+</div>
              <p className="text-white/70 text-xl">AI tools listed</p>
            </div>
            <div>
              <div className="text-6xl font-bold text-purple-400 mb-4">100+</div>
              <p className="text-white/70 text-xl">Categories</p>
            </div>
            <div>
              <div className="text-6xl font-bold text-purple-400 mb-4">50,000+</div>
              <p className="text-white/70 text-xl">Trusted users</p>
            </div>
            <div>
              <div className="text-6xl font-bold text-purple-400 mb-4">Weekly</div>
              <p className="text-white/70 text-xl">New products added</p>
            </div>
          </div>
        </div>

        {/* Popular Categories */}
        <div className="mb-24">
          <h3 className="text-4xl font-bold text-white text-center mb-16">Popular Categories</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-10 border border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-3xl mb-6">✍️</div>
              <h4 className="text-xl font-semibold text-white mb-4">AI Content Creation</h4>
              <p className="text-white/70 text-base leading-relaxed">Turn ideas into posts, videos, and campaigns in minutes.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-10 border border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center text-3xl mb-6">🤖</div>
              <h4 className="text-xl font-semibold text-white mb-4">Customer Service Automation</h4>
              <p className="text-white/70 text-base leading-relaxed">AI agents to handle chats, calls, and emails 24/7.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-10 border border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-3xl mb-6">📊</div>
              <h4 className="text-xl font-semibold text-white mb-4">Data & Analytics</h4>
              <p className="text-white/70 text-base leading-relaxed">AI-powered insights for smarter business decisions.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-10 border border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-3xl mb-6">💼</div>
              <h4 className="text-xl font-semibold text-white mb-4">Sales & Lead Generation</h4>
              <p className="text-white/70 text-base leading-relaxed">Never miss a lead with automated outreach.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-10 border border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center text-3xl mb-6">📱</div>
              <h4 className="text-xl font-semibold text-white mb-4">Marketing & Ads</h4>
              <p className="text-white/70 text-base leading-relaxed">Create, optimize, and track high-performing campaigns.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-10 border border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center text-3xl mb-6">👥</div>
              <h4 className="text-xl font-semibold text-white mb-4">Freelancers & Experts</h4>
              <p className="text-white/70 text-base leading-relaxed">Hire vetted professionals who specialize in AI solutions.</p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-24">
          <h3 className="text-4xl font-bold text-white text-center mb-16">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-8">1</div>
              <h4 className="text-2xl font-semibold text-white mb-6">Browse the Catalog</h4>
              <p className="text-white/70 text-lg leading-relaxed">Search by name, category, or problem you want to solve. Discover thousands of AI solutions.</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-8">2</div>
              <h4 className="text-2xl font-semibold text-white mb-6">Compare Options</h4>
              <p className="text-white/70 text-lg leading-relaxed">See pricing, features, reviews, and integrations side-by-side. Make informed decisions.</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-8">3</div>
              <h4 className="text-2xl font-semibold text-white mb-6">Connect & Get Started</h4>
              <p className="text-white/70 text-lg leading-relaxed">Click through to purchase, try, or hire instantly. Start using AI today.</p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-16 mb-24 border border-purple-500/20">
          <h3 className="text-4xl font-bold text-white text-center mb-16">Why Choose AI Discovery?</h3>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-8">⏰</div>
              <h4 className="text-2xl font-semibold text-white mb-4">Save Hours</h4>
              <p className="text-white/70 text-lg leading-relaxed">No more aimless Googling — everything is in one place. Find what you need instantly.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-8">🧠</div>
              <h4 className="text-2xl font-semibold text-white mb-4">Smarter Choices</h4>
              <p className="text-white/70 text-lg leading-relaxed">Compare features and reviews before committing. Make decisions with confidence.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-8">🚀</div>
              <h4 className="text-2xl font-semibold text-white mb-4">Future-Proof</h4>
              <p className="text-white/70 text-lg leading-relaxed">Stay ahead with the newest AI tech releases. Always be on the cutting edge.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-8">💰</div>
              <h4 className="text-2xl font-semibold text-white mb-4">Budget Friendly</h4>
              <p className="text-white/70 text-lg leading-relaxed">Find options for every price point, from free to enterprise-grade solutions.</p>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-24">
          <h3 className="text-4xl font-bold text-white text-center mb-16">What Our Users Say</h3>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 border border-purple-500/20">
              <p className="text-white/80 mb-8 italic text-xl leading-relaxed">"We found the perfect AI CRM for our startup in under 10 minutes. Saved us weeks of research."</p>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">S</div>
                <div>
                  <p className="text-white font-semibold text-lg">Sarah L.</p>
                  <p className="text-white/60">Startup Founder</p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 border border-purple-500/20">
              <p className="text-white/80 mb-8 italic text-xl leading-relaxed">"The filters and comparisons made it so easy to pick the right automation tool."</p>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">J</div>
                <div>
                  <p className="text-white font-semibold text-lg">James R.</p>
                  <p className="text-white/60">Digital Marketer</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-3xl p-16 mb-24 border border-purple-500/30 text-center">
          <h3 className="text-3xl font-bold text-white mb-6">Stay Updated</h3>
          <p className="text-white/80 mb-12 text-xl">Get the latest AI tools and startup news delivered to your inbox weekly — free.</p>
          <div className="flex max-w-lg mx-auto">
            <Input 
              placeholder="Enter your email" 
              className="rounded-r-none bg-white/10 border-purple-400/40 text-white placeholder-white/60 text-lg py-4"
            />
            <Button className="rounded-l-none bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 px-8 py-4 text-lg">
              Subscribe
            </Button>
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
