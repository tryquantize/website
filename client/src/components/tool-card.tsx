import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Bookmark, ExternalLink } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import type { AiTool } from "@shared/schema";

interface ToolCardProps {
  tool: AiTool;
  searchQuery?: string;
  onContact?: (tool: AiTool) => void;
}

export function ToolCard({ tool, searchQuery, onContact }: ToolCardProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const clickMutation = useMutation({
    mutationFn: async (toolId: string) => {
      await apiRequest("POST", `/api/tools/${toolId}/click`);
    }
  });

  const handleClick = () => {
    clickMutation.mutate(tool.id);
  };

  const handleContact = () => {
    if (onContact) {
      onContact(tool);
    }
  };

  const handleVisitWebsite = () => {
    if (tool.websiteUrl) {
      window.open(tool.websiteUrl, '_blank');
      handleClick();
    }
  };

  const getPricingBadgeVariant = (pricingModel: string) => {
    switch (pricingModel) {
      case 'free':
        return 'secondary';
      case 'freemium':
        return 'default';
      case 'paid':
        return 'outline';
      case 'enterprise':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Card 
      className="h-full hover:shadow-lg hover:border-primary/20 transition-all duration-200 group"
      data-testid={`tool-card-${tool.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {tool.logoUrl ? (
              <img 
                src={tool.logoUrl} 
                alt={`${tool.name} logo`}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/40 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-primary">
                  {tool.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-lg truncate" data-testid="tool-name">
                {tool.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {tool.industries?.[0] || "AI Tool"}
              </p>
            </div>
          </div>
          {tool.pricingModel && (
            <Badge variant={getPricingBadgeVariant(tool.pricingModel)} className="ml-2 flex-shrink-0">
              {tool.pricingModel}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm line-clamp-3" data-testid="tool-description">
          {tool.oneLiner || tool.description}
        </p>

        {/* Features/Tags */}
        {tool.features && tool.features.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tool.features.slice(0, 3).map((feature, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
            {tool.features.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{tool.features.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Rating placeholder - would be calculated from user reviews */}
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span>4.8</span>
          </div>
          <span>1k+ users</span>
        </div>

        {/* Why Recommended - only show if there's a search query */}
        {searchQuery && (
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm text-primary/80">
              <span className="font-medium">Why recommended:</span> Matches your search for "{searchQuery}" with relevant features and capabilities.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              data-testid="bookmark-button"
            >
              <Bookmark className="w-4 h-4" />
              <span className="sr-only">Save tool</span>
            </Button>
          </div>
          
          <div className="flex space-x-2">
            {tool.websiteUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleVisitWebsite}
                data-testid="visit-website-button"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Visit
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleContact}
              data-testid="contact-button"
            >
              Contact
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
