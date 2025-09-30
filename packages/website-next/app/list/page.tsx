"use client";

/* File Overview
  Path: client/src/pages/list-new.tsx
  Purpose: A top-level page component rendered based on the current route.

  Reading tip for newcomers:
  - Scan the exports at the bottom to see what the rest of the app imports from here
  - Follow the data flow via function parameters and return values
*/

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Star, Bot, Briefcase, Building2, Package, Wrench, User, Check } from "lucide-react";
import { useMistScroll } from "@/hooks/use-mist-scroll";

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'Start-up': return <Building2 className="w-4 h-4" />;
    case 'Solution': return <Briefcase className="w-4 h-4" />;
    case 'Company': return <Building2 className="w-4 h-4" />;
    case 'Product': return <Package className="w-4 h-4" />;
    case 'Tool': return <Wrench className="w-4 h-4" />;
    case 'Freelancer': return <User className="w-4 h-4" />;
    default: return <Bot className="w-4 h-4" />;
  }
};

// Mock data with new structure
const mockCompanies = [
  {
    id: 1,
    name: "GPT-4 Pro",
    oneLiner: "AI-powered lead generator for small e-commerce stores",
    category: "AI/ML",
    subCategory: "Marketing",
    type: "Company",
    pricing: "$49/mo",
    rating: 4.8,
    reviews: 1247,
    features: ["Integrates with Slack & Gmail", "Automates follow-ups", "No coding required"],
    freeTrial: true,
    trusted: "1,000+ businesses"
  },
  {
    id: 2,
    name: "Claude Assistant",
    oneLiner: "Constitutional AI assistant for business automation",
    category: "AI/ML",
    subCategory: "Customer Support",
    type: "Start-up",
    pricing: "Under $5000",
    rating: 4.7,
    reviews: 892,
    features: ["24/7 customer support", "Multi-language support", "Custom training"],
    freeTrial: false,
    trusted: "500+ startups"
  },
  {
    id: 3,
    name: "AI Image Pro",
    oneLiner: "Create stunning visuals with AI in seconds",
    category: "Creative",
    subCategory: "Design",
    type: "Tool",
    pricing: "$29/mo",
    rating: 4.9,
    reviews: 2156,
    features: ["HD image generation", "Style customization", "Batch processing"],
    freeTrial: true,
    trusted: "2,000+ creators"
  },
  {
    id: 4,
    name: "Smart Workspace",
    oneLiner: "AI-powered productivity suite for modern teams",
    category: "Productivity",
    subCategory: "Collaboration",
    type: "Product",
    pricing: "$19/mo",
    rating: 4.6,
    reviews: 1567,
    features: ["Real-time collaboration", "Smart templates", "Task automation"],
    freeTrial: true,
    trusted: "800+ teams"
  },
  {
    id: 5,
    name: "Design AI Suite",
    oneLiner: "Complete AI design solution for professionals",
    category: "Design",
    subCategory: "Creative",
    type: "Solution",
    pricing: "Custom Pricing",
    rating: 4.8,
    reviews: 2341,
    features: ["Advanced AI tools", "Team collaboration", "Enterprise security"],
    freeTrial: false,
    trusted: "Fortune 500 companies"
  },
  {
    id: 6,
    name: "John Smith",
    oneLiner: "Expert AI consultant for small business automation",
    category: "Consulting",
    subCategory: "AI Strategy",
    type: "Freelancer",
    pricing: "$150/hour",
    rating: 4.9,
    reviews: 127,
    features: ["10+ years experience", "Custom AI solutions", "Ongoing support"],
    freeTrial: false,
    trusted: "50+ successful projects"
  },
  // Add more companies
  ...Array.from({ length: 94 }, (_, i) => ({
    id: 7 + i,
    name: `AI Solution ${7 + i}`,
    oneLiner: `Smart ${["marketing", "sales", "support", "design", "analytics", "automation"][i % 6]} tool for businesses`,
    category: ["AI/ML", "Productivity", "Creative", "Marketing", "Sales", "Communication", "Design", "Automation", "Analytics", "Security"][i % 10],
    subCategory: ["Marketing", "Customer Support", "Finance", "Design", "Analytics"][i % 5],
    type: ["Start-up", "Solution", "Company", "Product", "Tool", "Freelancer"][i % 6],
    pricing: i % 4 === 0 ? "Custom Pricing" : i % 4 === 1 ? `Under $${Math.floor(Math.random() * 5) + 1}000` : `$${Math.floor(Math.random() * 100) + 10}/mo`,
    rating: (Math.random() * 1.5 + 3.5).toFixed(1),
    reviews: Math.floor(Math.random() * 2000) + 100,
    features: [
      ["Easy integration", "24/7 support", "No setup required"][Math.floor(Math.random() * 3)],
      ["Advanced analytics", "Custom workflows", "Team collaboration"][Math.floor(Math.random() * 3)],
      ["Mobile app", "API access", "White-label option"][Math.floor(Math.random() * 3)]
    ],
    freeTrial: Math.random() > 0.5,
    trusted: `${Math.floor(Math.random() * 5000) + 100}+ ${["businesses", "users", "companies", "teams"][Math.floor(Math.random() * 4)]}`
  }))
];

export default function ListPage() {
  const [filters, setFilters] = useState({ category: "all", pricing: "all", type: "all" });
  const [visibleCount, setVisibleCount] = useState(8);
  const cardsPerLoad = 8;

  const pageRef = useRef<HTMLDivElement | null>(null);
  useMistScroll(pageRef, { selector: ".mist-row", intensityViewportFactor: 0.9, groupByRow: true });

  // Filter companies based on selected filters
  const filteredCompanies = mockCompanies.filter(company => {
    if (filters.category !== "all" && company.category !== filters.category) return false;
    if (filters.type !== "all" && company.type !== filters.type) return false;
    if (filters.pricing !== "all") {
      const price = parseInt(company.pricing.match(/\$(\d+)/)?.[1] || "0");
      if (filters.pricing === "low" && price > 20) return false;
      if (filters.pricing === "medium" && (price <= 20 || price > 50)) return false;
      if (filters.pricing === "high" && price <= 50) return false;
    }
    return true;
  });

  const currentCompanies = filteredCompanies.slice(0, visibleCount);
  const hasMore = visibleCount < filteredCompanies.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + cardsPerLoad, filteredCompanies.length));
  };

  const handleReset = () => {
    setVisibleCount(8);
  };

  return (
    <div ref={pageRef} className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">AI Solutions Directory</h1>
              <p className="text-white/80 mt-2">Discover {filteredCompanies.length} AI-powered solutions for your business</p>
            </div>

            <div className="flex items-center space-x-4">
              <Select value={filters.type} onValueChange={(v) => { setFilters(prev => ({ ...prev, type: v })); handleReset(); }}>
                <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white backdrop-blur-sm">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Start-up">Start-up</SelectItem>
                  <SelectItem value="Solution">Solution</SelectItem>
                  <SelectItem value="Company">Company</SelectItem>
                  <SelectItem value="Product">Product</SelectItem>
                  <SelectItem value="Tool">Tool</SelectItem>
                  <SelectItem value="Freelancer">Freelancer</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.category} onValueChange={(v) => { setFilters(prev => ({ ...prev, category: v })); handleReset(); }}>
                <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white backdrop-blur-sm">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="AI/ML">AI/ML</SelectItem>
                  <SelectItem value="Productivity">Productivity</SelectItem>
                  <SelectItem value="Creative">Creative</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Communication">Communication</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Automation">Automation</SelectItem>
                  <SelectItem value="Analytics">Analytics</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.pricing} onValueChange={(v) => { setFilters(prev => ({ ...prev, pricing: v })); handleReset(); }}>
                <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white backdrop-blur-sm">
                  <SelectValue placeholder="All Pricing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pricing</SelectItem>
                  <SelectItem value="low">Under $20</SelectItem>
                  <SelectItem value="medium">$20 - $50</SelectItem>
                  <SelectItem value="high">Over $50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {currentCompanies.map((company, i) => (
              <div
                key={company.id}
                className="mist-row mist-lift bg-white/5 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-white/10 hover:border-white/20 overflow-hidden relative aspect-square"
              >
                {/* Card Content */}
                <div className="p-4 h-full flex flex-col justify-between">
                  <div className="flex-1">
                    {/* Icon/Logo and Type Tag */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                        {getTypeIcon(company.type)}
                      </div>
                      <Badge variant="secondary" className="text-xs px-2 py-1">
                        {company.type}
                      </Badge>
                    </div>

                    {/* Sub-category */}
                    <Badge variant="outline" className="text-xs mb-3 text-white/70 border-white/20">
                      {company.subCategory}
                    </Badge>

                    {/* Name */}
                    <h3 className="font-bold text-white text-base mb-2 line-clamp-1">{company.name}</h3>
                    
                    {/* One-liner */}
                    <p className="text-white/80 text-sm leading-relaxed mb-3 line-clamp-2">{company.oneLiner}</p>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-base font-bold text-white">{company.pricing}</span>
                      {company.freeTrial && (
                        <Badge variant="default" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                          Free Trial
                        </Badge>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center space-x-1 mb-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-medium text-white">{company.rating}</span>
                      <span className="text-sm text-white/60">({company.reviews})</span>
                    </div>

                    {/* Trusted by */}
                    <p className="text-sm text-white/60 mb-3">Trusted by {company.trusted}</p>

                    {/* Key Features */}
                    <div className="space-y-1 mb-4">
                      {company.features.slice(0, 2).map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-1">
                          <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
                          <span className="text-sm text-white/80">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-white/20 text-white hover:bg-white/10 text-sm h-8"
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm h-8"
                    >
                      {company.type === 'Freelancer' ? 'Contact' : 'Try Now'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Section */}
          {hasMore && (
            <div className="text-center">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <span className="text-white/80">
                  Showing {currentCompanies.length} of {filteredCompanies.length} solutions
                </span>
              </div>
              
              <Button
                onClick={handleLoadMore}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium"
              >
                Load More Solutions
              </Button>
            </div>
          )}

          {/* End of List */}
          {!hasMore && filteredCompanies.length > 0 && (
            <div className="text-center">
              <div className="text-white/60 mb-4">
                <p>You've reached the end of the list!</p>
                <p className="text-sm mt-1">Showing all {filteredCompanies.length} solutions</p>
              </div>
              <Button
                variant="outline"
                onClick={handleReset}
                className="border-white/30 text-white hover:bg-white/10"
              >
                Back to Top
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}