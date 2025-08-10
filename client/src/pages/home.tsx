import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchInterface } from "@/components/search-interface";
import { ToolCard } from "@/components/tool-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContactRequestSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import type { AiTool } from "@shared/schema";
import { z } from "zod";

const contactFormSchema = insertContactRequestSchema.extend({
  clientName: z.string().min(1, "Name is required"),
  clientEmail: z.string().email("Valid email is required"),
  message: z.string().min(10, "Message must be at least 10 characters")
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function Home() {
  const [searchResults, setSearchResults] = useState<any>(null);
  const [selectedTool, setSelectedTool] = useState<AiTool | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    pricingModel: "all",
    industries: "all"
  });

  const { user } = useAuth();
  const { toast } = useToast();

  const contactForm = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      clientName: user?.name || "",
      clientEmail: user?.email || "",
      message: ""
    }
  });

  const { data: tools, isLoading } = useQuery({
    queryKey: ["/api/tools", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.pricingModel && filters.pricingModel !== "all") {
        params.append("pricingModel", filters.pricingModel);
      }
      if (filters.industries && filters.industries !== "all") {
        params.append("industries", filters.industries);
      }
      
      const response = await fetch(`/api/tools?${params.toString()}`);
      return response.json();
    }
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const response = await apiRequest("POST", "/api/contact-requests", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message sent!",
        description: "Your contact request has been sent to the startup."
      });
      setContactDialogOpen(false);
      contactForm.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send contact request. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSearchResults = (results: any) => {
    setSearchResults(results);
  };

  const handleToolContact = (tool: AiTool) => {
    setSelectedTool(tool);
    contactForm.setValue("toolId", tool.id);
    setContactDialogOpen(true);
  };

  const onContactSubmit = (data: ContactFormData) => {
    contactMutation.mutate({
      ...data,
      toolId: selectedTool?.id || "",
      clientId: user?.id || ""
    });
  };

  const displayTools = searchResults?.results || tools || [];
  const searchQuery = searchResults?.query;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4">
        {/* Hero Section with Search */}
        <div className="mb-16">
          <SearchInterface onSearchResults={handleSearchResults} />
        </div>

        {/* Results Section */}
        {(searchResults || tools) && (
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-white" data-testid="results-title">
                  {searchResults ? "Search Results" : "Featured AI Tools"}
                </h3>
                <p className="text-white mt-1" data-testid="results-count">
                  {searchResults 
                    ? `Found ${searchResults.count} tools matching your search`
                    : `Discover ${tools?.length || 0} innovative AI tools`
                  }
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-4">
                <Select
                  value={filters.pricingModel}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, pricingModel: value }))}
                >
                  <SelectTrigger className="w-40" data-testid="pricing-filter">
                    <SelectValue placeholder="Any Pricing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Pricing</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="freemium">Freemium</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.industries}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, industries: value }))}
                >
                  <SelectTrigger className="w-40" data-testid="industry-filter">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Marketing & Advertising">Marketing</SelectItem>
                    <SelectItem value="E-commerce">E-commerce</SelectItem>
                    <SelectItem value="Customer Service">Customer Service</SelectItem>
                    <SelectItem value="Data Analytics">Data Analytics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tools Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12" data-testid="loading-spinner">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : displayTools.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-testid="tools-grid">
                {displayTools.map((tool: AiTool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    searchQuery={searchQuery}
                    onContact={handleToolContact}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12" data-testid="no-results">
                <p className="text-white">No AI tools found matching your criteria.</p>
              </div>
            )}

            {/* Load More */}
            {displayTools.length > 0 && !searchResults && (
              <div className="text-center mt-12">
                <Button variant="outline" size="lg" data-testid="load-more-button">
                  Load More Tools
                </Button>
              </div>
            )}
          </div>
        )}

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
