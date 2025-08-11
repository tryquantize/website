import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, TrendingUp, TrendingDown, ExternalLink, Star } from "lucide-react";
import type { AiTool } from "@shared/schema";

// Mock data for demonstration - in real app this would come from API
const mockCompanies = [
  {
    id: 1,
    name: "OpenAI",
    logo: "🤖",
    product: "GPT-4 Enterprise",
    description: "Advanced AI language model for enterprise applications",
    category: "AI/ML",
    pricing: "$0.03 per 1K tokens",
    growth: "+45%",
    engagement: 92,
    color: "bg-blue-500"
  },
  {
    id: 2,
    name: "Anthropic",
    logo: "🧠",
    product: "Claude Pro",
    description: "Constitutional AI assistant for business use",
    category: "AI/ML",
    pricing: "$20/month",
    growth: "+38%",
    engagement: 88,
    color: "bg-purple-500"
  },
  {
    id: 3,
    name: "Midjourney",
    logo: "🎨",
    product: "AI Image Generation",
    description: "Create stunning visuals with AI-powered art generation",
    category: "Creative",
    pricing: "$10/month",
    growth: "+67%",
    engagement: 95,
    color: "bg-pink-500"
  },
  {
    id: 4,
    name: "Notion",
    logo: "📝",
    product: "Notion AI",
    description: "AI-powered workspace for teams and individuals",
    category: "Productivity",
    pricing: "$8/month",
    growth: "+23%",
    engagement: 85,
    color: "bg-gray-500"
  },
  {
    id: 5,
    name: "Figma",
    logo: "🎯",
    product: "Figma AI",
    description: "AI-enhanced design and prototyping platform",
    category: "Design",
    pricing: "$12/month",
    growth: "+41%",
    engagement: 90,
    color: "bg-green-500"
  },
  {
    id: 6,
    name: "Zapier",
    logo: "⚡",
    product: "Zapier AI",
    description: "Automate workflows with AI-powered integrations",
    category: "Automation",
    pricing: "$19.99/month",
    growth: "+29%",
    engagement: 87,
    color: "bg-orange-500"
  },
  {
    id: 7,
    name: "Canva",
    logo: "🎨",
    product: "Canva AI",
    description: "AI-powered graphic design platform",
    category: "Creative",
    pricing: "$12.99/month",
    growth: "+52%",
    engagement: 93,
    color: "bg-blue-400"
  },
  {
    id: 8,
    name: "Grammarly",
    logo: "✍️",
    product: "Grammarly Premium",
    description: "AI writing assistant for better communication",
    category: "Writing",
    pricing: "$12/month",
    growth: "+34%",
    engagement: 89,
    color: "bg-green-400"
  },
  {
    id: 9,
    name: "HubSpot",
    logo: "🏢",
    product: "HubSpot AI",
    description: "AI-powered CRM and marketing automation",
    category: "Marketing",
    pricing: "$45/month",
    growth: "+28%",
    engagement: 86,
    color: "bg-orange-400"
  },
  {
    id: 10,
    name: "Slack",
    logo: "💬",
    product: "Slack AI",
    description: "AI-enhanced team communication platform",
    category: "Communication",
    pricing: "$7.25/month",
    growth: "+19%",
    engagement: 84,
    color: "bg-purple-400"
  },
  {
    id: 11,
    name: "Salesforce",
    logo: "☁️",
    product: "Einstein AI",
    description: "AI-powered CRM and business intelligence",
    category: "Sales",
    pricing: "$25/month",
    growth: "+31%",
    engagement: 91,
    color: "bg-blue-600"
  },
  {
    id: 12,
    name: "Adobe",
    logo: "🎭",
    product: "Adobe Firefly",
    description: "AI-powered creative suite for professionals",
    category: "Creative",
    pricing: "$52.99/month",
    growth: "+48%",
    engagement: 94,
    color: "bg-red-500"
  },
  {
    id: 13,
    name: "Microsoft",
    logo: "🪟",
    product: "Copilot Pro",
    description: "AI assistant integrated with Microsoft 365",
    category: "Productivity",
    pricing: "$20/month",
    growth: "+56%",
    engagement: 96,
    color: "bg-blue-700"
  },
  {
    id: 14,
    name: "Google",
    logo: "🔍",
    product: "Bard Enterprise",
    description: "AI-powered search and productivity tools",
    category: "AI/ML",
    pricing: "$30/month",
    growth: "+42%",
    engagement: 88,
    color: "bg-red-400"
  },
  {
    id: 15,
    name: "Zoom",
    logo: "📹",
    product: "Zoom AI Companion",
    description: "AI-enhanced video conferencing platform",
    category: "Communication",
    pricing: "$14.99/month",
    growth: "+25%",
    engagement: 83,
    color: "bg-blue-500"
  },
  // Add more companies to reach 100+ cards
  ...Array.from({ length: 85 }, (_, i) => ({
    id: 16 + i,
    name: `Company ${16 + i}`,
    logo: ["🚀", "💡", "🔧", "📊", "🎯", "⚡", "🌟", "🔥", "💎", "🎪"][i % 10],
    product: `AI Solution ${16 + i}`,
    description: `Innovative AI-powered solution for modern businesses - Product ${16 + i}`,
    category: ["AI/ML", "Productivity", "Creative", "Marketing", "Sales", "Communication", "Design", "Automation", "Analytics", "Security"][i % 10],
    pricing: `$${Math.floor(Math.random() * 50) + 10}/month`,
    growth: `${Math.random() > 0.3 ? '+' : '-'}${Math.floor(Math.random() * 50) + 10}%`,
    engagement: Math.floor(Math.random() * 20) + 80,
    color: ["bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-green-500", "bg-orange-500", "bg-red-500", "bg-indigo-500", "bg-teal-500", "bg-yellow-500", "bg-gray-500"][i % 10]
  }))
];

export default function ListPage() {
  const [filters, setFilters] = useState({ category: "all", pricing: "all", type: "all" });
  const [visibleCount, setVisibleCount] = useState(12);
  const cardsPerLoad = 12;

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
    setVisibleCount(12);
  };

  return (
    <div className="min-h-screen py-8">
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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {currentCompanies.map((company) => (
              <div
                key={company.id}
                className="bg-white/5 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/10 hover:border-white/20 overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 ${company.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                        {company.logo}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-lg">{company.name}</h3>
                        <p className="text-sm text-white/70">{company.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        {company.growth.startsWith('+') ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${company.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                          {company.growth}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-white text-xl mb-2">{company.product}</h4>
                    <p className="text-white/80 text-sm leading-relaxed">{company.description}</p>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{company.pricing}</p>
                      <p className="text-xs text-white/70">Monthly Pricing</p>
                    </div>
                    <div className="text-center">
                      <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-gray-200"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-blue-500"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeDasharray={`${company.engagement}, 100`}
                            strokeLinecap="round"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-bold text-white">{company.engagement}</span>
                        </div>
                      </div>
                      <p className="text-xs text-white/70 mt-1">Engagement</p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-medium text-white">4.8</span>
                      <span className="text-xs text-white/70">(1.2k reviews)</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-white/20 text-white hover:bg-white/10"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Contact
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

