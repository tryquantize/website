import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Star, ExternalLink, TrendingUp, TrendingDown, Lightbulb, Users, ArrowRight, ChevronLeft, Package, Building, UserCheck, Lightbulb as Solution } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

// Mock search results - in real app this would come from API
const mockSearchResults = [
  {
    id: 1,
    name: "OpenAI GPT-4",
    description: "Advanced AI language model for enterprise applications. GPT-4 is OpenAI's most advanced system, producing safer and more useful responses.",
    category: "AI/ML",
    pricing: "$0.03 per 1K tokens",
    rating: 4.8,
    reviews: 1247,
    growth: "+45%",
    engagement: 92,
    logo: "🤖",
    color: "bg-blue-500",
    url: "https://openai.com"
  },
  {
    id: 2,
    name: "Anthropic Claude Pro",
    description: "Constitutional AI assistant for business use. Claude helps with writing, analysis, math, coding, and more.",
    category: "AI/ML",
    pricing: "$20/month",
    rating: 4.7,
    reviews: 892,
    growth: "+38%",
    engagement: 88,
    logo: "🧠",
    color: "bg-purple-500",
    url: "https://anthropic.com"
  },
  {
    id: 3,
    name: "Midjourney AI",
    description: "Create stunning visuals with AI-powered art generation. Transform your ideas into beautiful images with advanced AI technology.",
    category: "Creative",
    pricing: "$10/month",
    rating: 4.9,
    reviews: 2156,
    growth: "+67%",
    engagement: 95,
    logo: "🎨",
    color: "bg-pink-500",
    url: "https://midjourney.com"
  },
  {
    id: 4,
    name: "Notion AI",
    description: "AI-powered workspace for teams and individuals. Write, edit, and organize your work with intelligent assistance.",
    category: "Productivity",
    pricing: "$8/month",
    rating: 4.6,
    reviews: 1567,
    growth: "+23%",
    engagement: 85,
    logo: "📝",
    color: "bg-gray-500",
    url: "https://notion.so"
  },
  {
    id: 5,
    name: "Figma AI",
    description: "AI-enhanced design and prototyping platform. Create beautiful designs with intelligent tools and collaboration features.",
    category: "Design",
    pricing: "$12/month",
    rating: 4.8,
    reviews: 2341,
    growth: "+41%",
    engagement: 90,
    logo: "🎯",
    color: "bg-green-500",
    url: "https://figma.com"
  }
];

// Mock similar products data
const mockSimilarProducts = [
  {
    id: 101,
    name: "Jasper AI",
    category: "AI/ML",
    pricing: "$39/month",
    rating: 4.6,
    logo: "✍️",
    color: "bg-orange-500",
    url: "https://jasper.ai"
  },
  {
    id: 102,
    name: "Copy.ai",
    category: "AI/ML",
    pricing: "$36/month",
    rating: 4.5,
    logo: "📝",
    color: "bg-blue-600",
    url: "https://copy.ai"
  },
  {
    id: 103,
    name: "Writesonic",
    category: "AI/ML",
    pricing: "$19/month",
    rating: 4.4,
    logo: "🚀",
    color: "bg-purple-600",
    url: "https://writesonic.com"
  },
  {
    id: 104,
    name: "Grammarly",
    category: "Productivity",
    pricing: "$12/month",
    rating: 4.7,
    logo: "📚",
    color: "bg-green-600",
    url: "https://grammarly.com"
  },
  {
    id: 105,
    name: "Hemingway Editor",
    category: "Productivity",
    pricing: "$19.99",
    rating: 4.3,
    logo: "✒️",
    color: "bg-red-500",
    url: "https://hemingwayapp.com"
  },
  {
    id: 106,
    name: "ChatGPT Plus",
    category: "AI/ML",
    pricing: "$20/month",
    rating: 4.8,
    logo: "💬",
    color: "bg-green-500",
    url: "https://chat.openai.com"
  },
  {
    id: 107,
    name: "Surfer SEO",
    category: "Marketing",
    pricing: "$59/month",
    rating: 4.5,
    logo: "📊",
    color: "bg-blue-500",
    url: "https://surferseo.com"
  },
  {
    id: 108,
    name: "Ahrefs",
    category: "Marketing",
    pricing: "$99/month",
    rating: 4.7,
    logo: "🔍",
    color: "bg-red-500",
    url: "https://ahrefs.com"
  }
];

// Mock similar queries data
const mockSimilarQueries = [
  "How to integrate AI writing tools with my workflow?",
  "What are the best alternatives to GPT-4?",
  "AI tools for content marketing teams",
  "How to train custom AI models for business?",
  "AI-powered customer service solutions",
  "Best practices for AI tool implementation",
  "AI tools for small business owners",
  "How to measure ROI of AI investments?",
  "AI tools for creative professionals",
  "Enterprise AI security considerations",
  "AI tools for data analysis and insights",
  "How to automate content creation with AI?",
  "AI-powered email marketing tools",
  "Best AI tools for startups",
  "AI tools for e-commerce optimization",
  "How to implement AI in customer support?",
  "AI tools for project management",
  "AI-powered analytics platforms",
  "How to choose the right AI tool for my business?",
  "AI tools for social media management"
];

// Skeleton components
const SearchHeaderSkeleton = () => (
  <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
    <div className="w-full px-4 py-4">
      <div className="flex items-center space-x-4">
        {/* Logo skeleton */}
        <div className="flex items-center space-x-3">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="w-24 h-6" />
        </div>

        {/* Search bar skeleton */}
        <div className="flex-1 max-w-2xl">
          <Skeleton className="w-full h-12 rounded-lg" />
        </div>

        {/* Filters skeleton */}
        <div className="flex items-center space-x-2">
          <Skeleton className="w-32 h-10 rounded-md" />
          <Skeleton className="w-32 h-10 rounded-md" />
        </div>
      </div>
    </div>
  </div>
);

const ResultCardSkeleton = () => (
  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
    <div className="flex items-start space-x-4">
      {/* Logo skeleton */}
      <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />

      {/* Content skeleton */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <Skeleton className="w-48 h-6 mb-2" />
            <Skeleton className="w-32 h-4" />
          </div>
          <Skeleton className="w-16 h-4" />
        </div>

        <Skeleton className="w-full h-4 mb-2" />
        <Skeleton className="w-3/4 h-4 mb-3" />

        {/* Meta info skeleton */}
        <div className="flex items-center space-x-6 mb-4">
          <Skeleton className="w-16 h-4" />
          <Skeleton className="w-20 h-4" />
          <Skeleton className="w-12 h-4" />
          <Skeleton className="w-24 h-4" />
        </div>

        {/* Actions skeleton */}
        <div className="flex space-x-3">
          <Skeleton className="w-24 h-8 rounded-md" />
          <Skeleton className="w-20 h-8 rounded-md" />
        </div>
      </div>
    </div>
  </div>
);

const SidebarSkeleton = () => (
  <div className="w-80">
    <Skeleton className="w-full h-8 mb-4" />
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="w-full h-4" />
      ))}
    </div>
  </div>
);

const ResultsSkeleton = () => (
  <div className="flex-1 px-8">
    {/* Results info skeleton */}
    <div className="mb-6">
      <Skeleton className="w-64 h-4" />
    </div>

    {/* Results list skeleton */}
    <div className="space-y-6">
      {Array.from({ length: 5 }).map((_, index) => (
        <ResultCardSkeleton key={index} />
      ))}
    </div>
  </div>
);

export default function ResultsPage() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<any[]>([]);
  const [filters, setFilters] = useState({ category: "all", pricing: "all" });
  const [visibleQueries, setVisibleQueries] = useState(10);
  const [visibleProducts, setVisibleProducts] = useState(8);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Get search query from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';
    setSearchQuery(query);
    
    // Simulate loading
    setIsLoading(true);
    setTimeout(() => {
      // Filter results based on query
      const filteredResults = mockSearchResults.filter(result => 
        result.name.toLowerCase().includes(query.toLowerCase()) ||
        result.description.toLowerCase().includes(query.toLowerCase()) ||
        result.category.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filteredResults);
      setIsLoading(false);
    }, 2000); // 2 second loading time
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLocation(`/results?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleSimilarQueryClick = (query: string) => {
    setSearchQuery(query);
    setLocation(`/results?q=${encodeURIComponent(query)}`);
  };

  const handleLoadMoreQueries = () => {
    setVisibleQueries(prev => Math.min(prev + 5, mockSimilarQueries.length));
  };

  const handleLoadMoreProducts = () => {
    setVisibleProducts(prev => Math.min(prev + 4, mockSimilarProducts.length));
  };

  // Loading screen with skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 sticky top-16 z-40">
          <SearchHeaderSkeleton />
        </div>
        <div className="flex w-full">
          <SidebarSkeleton />
          <ResultsSkeleton />
          <SidebarSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">


      {/* Main Content - Full Width */}
      <div className="w-full">

        {/* Main Results */}
        <div className="flex-1 px-8 py-4">
          {/* Results Info */}
          <div className="mb-6">
            <p className="text-white/70 text-sm">
              About {results.length} results for "{searchQuery}" (0.42 seconds)
            </p>
          </div>

          {/* Results List */}
          <div className="space-y-6">
            {results.map((result) => (
              <div key={result.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all">
                <div className="flex items-start space-x-4">
                  {/* Logo */}
                  <div className={`w-12 h-12 ${result.color} rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0`}>
                    {result.logo}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">
                          <a href={result.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                            {result.name}
                          </a>
                        </h3>
                        <p className="text-green-400 text-sm font-medium">{result.url}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-white text-sm">{result.rating}</span>
                          <span className="text-white/60 text-sm">({result.reviews})</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-white/80 text-sm leading-relaxed mb-3">
                      {result.description}
                    </p>

                    {/* Meta info */}
                    <div className="flex items-center space-x-6 text-sm">
                      <span className="text-white/60">{result.category}</span>
                      <span className="text-white/60">{result.pricing}</span>
                      <div className="flex items-center space-x-1">
                        {result.growth.startsWith('+') ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                        <span className={result.growth.startsWith('+') ? 'text-green-400' : 'text-red-400'}>
                          {result.growth}
                        </span>
                      </div>
                      <span className="text-white/60">Engagement: {result.engagement}%</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-3 mt-4">
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Visit Website
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        Contact
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Similar Queries - Below Results */}
          {results.length > 0 && (
            <div className="mt-12 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center space-x-2 mb-6">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-semibold text-white">Similar Queries</h3>
              </div>
              <div className="space-y-2">
                {mockSimilarQueries.slice(0, visibleQueries).map((query, index) => (
                  <button
                    key={index}
                    onClick={() => handleSimilarQueryClick(query)}
                    className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/20 transition-all group block"
                  >
                    <div className="flex items-center space-x-3">
                      <ArrowRight className="w-4 h-4 text-white/60 flex-shrink-0 group-hover:text-white transition-colors" />
                      <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                        {query}
                      </span>
                    </div>
                  </button>
                ))}
                
                {visibleQueries < mockSimilarQueries.length && (
                  <button
                    onClick={handleLoadMoreQueries}
                    className="w-full p-3 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 border border-orange-400/40 text-white text-sm font-medium transition-all mt-4 fire-glow border-glow"
                  >
                    See More
                  </button>
                )}
              </div>
            </div>
          )}

          {/* No Results */}
          {results.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-white/60" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
              <p className="text-white/70 mb-6">Try adjusting your search terms or filters</p>
              <Button
                onClick={() => setLocation('/')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Back to Search
              </Button>
            </div>
          )}
        </div>

        {/* 4 Toggle Buttons - Right Edge */}
        <div className="fixed right-0 top-1/2 transform -translate-y-1/2 z-50 flex flex-col space-y-2">
          {/* Products Button */}
          <button
            onClick={() => setActiveSection(activeSection === 'products' ? null : 'products')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-l-full shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all fire-glow"
          >
            <Package className="w-5 h-5" />
          </button>
          
          {/* Companies Button */}
          <button
            onClick={() => setActiveSection(activeSection === 'companies' ? null : 'companies')}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 rounded-l-full shadow-lg hover:from-green-600 hover:to-green-700 transition-all fire-glow"
          >
            <Building className="w-5 h-5" />
          </button>
          
          {/* Freelancers Button */}
          <button
            onClick={() => setActiveSection(activeSection === 'freelancers' ? null : 'freelancers')}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-3 rounded-l-full shadow-lg hover:from-purple-600 hover:to-purple-700 transition-all fire-glow"
          >
            <UserCheck className="w-5 h-5" />
          </button>
          
          {/* Solutions Button */}
          <button
            onClick={() => setActiveSection(activeSection === 'solutions' ? null : 'solutions')}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-3 rounded-l-full shadow-lg hover:from-yellow-600 hover:to-yellow-700 transition-all fire-glow"
          >
            <Solution className="w-5 h-5" />
          </button>
        </div>

        {/* Expandable Sections */}
        {activeSection && (
          <div className="fixed right-0 top-0 h-full w-80 bg-background/95 backdrop-blur-md border-l border-orange-500/30 transform transition-transform duration-300 z-40">
            <div className="p-6 pt-20 h-full overflow-y-auto">
              {activeSection === 'products' && (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Package className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">Similar Products</h3>
                  </div>
                  <div className="space-y-3">
                    {mockSimilarProducts.slice(0, 5).map((product) => (
                      <div key={product.id} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/20 transition-all">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 ${product.color} rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0`}>
                            {product.logo}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-white truncate">
                              <a href={product.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                                {product.name}
                              </a>
                            </h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              <span className="text-xs text-white/80">{product.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeSection === 'companies' && (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Building className="w-5 h-5 text-green-400" />
                    <h3 className="text-lg font-semibold text-white">Similar Companies</h3>
                  </div>
                  <div className="space-y-3">
                    {[{name: "TechCorp AI", rating: 4.6}, {name: "InnovateLab", rating: 4.8}, {name: "AI Solutions Inc", rating: 4.5}, {name: "DataMind Corp", rating: 4.7}, {name: "Neural Networks Ltd", rating: 4.4}].map((company, index) => (
                      <div key={index} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/20 transition-all">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0">
                            🏢
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-white">{company.name}</h4>
                            <div className="flex items-center space-x-1 mt-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              <span className="text-xs text-white/80">{company.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeSection === 'freelancers' && (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <UserCheck className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">Similar Freelancers</h3>
                  </div>
                  <div className="space-y-3">
                    {[{name: "Alex Chen", skill: "AI Developer"}, {name: "Sarah Kim", skill: "ML Engineer"}, {name: "Mike Johnson", skill: "Data Scientist"}, {name: "Emma Davis", skill: "AI Consultant"}, {name: "James Wilson", skill: "Deep Learning Expert"}].map((freelancer, index) => (
                      <div key={index} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/20 transition-all">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0">
                            👤
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-white">{freelancer.name}</h4>
                            <p className="text-xs text-white/60">{freelancer.skill}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeSection === 'solutions' && (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Solution className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-lg font-semibold text-white">Similar Solutions</h3>
                  </div>
                  <div className="space-y-3">
                    {[{name: "AI Automation Suite", type: "Enterprise"}, {name: "Smart Analytics Platform", type: "SaaS"}, {name: "Custom AI Models", type: "Service"}, {name: "Predictive Analytics Tool", type: "Cloud"}, {name: "AI Chatbot Framework", type: "API"}].map((solution, index) => (
                      <div key={index} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/20 transition-all">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0">
                            💡
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-white">{solution.name}</h4>
                            <p className="text-xs text-white/60">{solution.type}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 