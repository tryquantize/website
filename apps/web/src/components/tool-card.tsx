import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Bookmark, ExternalLink } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";
import { useState } from "react";
import type { AiTool } from "@shared/schemas/schema";

interface ToolCardProps {
  tool: AiTool;
  searchQuery?: string;
  onContact?: (tool: AiTool) => void;
}

export function ToolCard({ tool, searchQuery, onContact }: ToolCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) / rect.width;
    const deltaY = (e.clientY - centerY) / rect.height;

    setMousePosition({ x: deltaX * 10, y: deltaY * 10 });
  };

  const cardVariants = {
    rest: {
      scale: 1,
      rotateX: 0,
      rotateY: 0,
      boxShadow: "0 4px 24px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
    },
    hover: {
      scale: 1.02,
      rotateX: 3,
      rotateY: 3,
      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
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
    <motion.div
      className="group relative perspective-1000 h-full"
      variants={cardVariants}
      initial="rest"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      style={{
        transformStyle: 'preserve-3d',
        transform: isHovered 
          ? `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0)` 
          : 'translate3d(0, 0, 0)'
      }}
    >
      <Card 
        className="h-full bg-gradient-to-br from-black/40 via-black/60 to-black/80 backdrop-blur-xl border border-white/10 overflow-hidden relative"
        data-testid={`tool-card-${tool.id}`}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100"
          animate={{
            background: [
              'linear-gradient(0deg, rgba(59,130,246,0.2), rgba(147,51,234,0.2), rgba(236,72,153,0.2))',
              'linear-gradient(360deg, rgba(59,130,246,0.2), rgba(147,51,234,0.2), rgba(236,72,153,0.2))'
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {tool.logoUrl ? (
              <motion.img 
                src={tool.logoUrl} 
                alt={`${tool.name} logo`}
                className="w-12 h-12 rounded-lg object-cover"
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ duration: 0.2 }}
              />
            ) : (
              <motion.div 
                className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center"
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-lg font-bold text-white">
                  {tool.name.charAt(0)}
                </span>
              </motion.div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-lg truncate text-white" data-testid="tool-name">
                {tool.name}
              </h3>
              <p className="text-sm text-white/70">
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
        <p className="text-white/80 text-sm line-clamp-3" data-testid="tool-description">
          {tool.oneLiner || tool.description}
        </p>

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

        <div className="flex items-center space-x-4 text-sm text-white/70">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span>4.8</span>
          </div>
          <span>1k+ users</span>
        </div>

        {searchQuery && (
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm text-primary/80">
              <span className="font-medium">Why recommended:</span> Matches your search for "{searchQuery}" with relevant features and capabilities.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <motion.button
              className="p-2 bg-white/10 rounded-xl text-white/60 hover:text-white hover:bg-white/20"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              data-testid="bookmark-button"
            >
              <Bookmark className="w-4 h-4" />
              <span className="sr-only">Save tool</span>
            </motion.button>
          </div>
          
          <div className="flex space-x-2">
            {tool.websiteUrl && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleVisitWebsite}
                data-testid="visit-website-button"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Visit
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleContact}
              data-testid="contact-button"
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Contact
            </Button>
          </div>
        </div>

        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100"
          transition={{ duration: 0.3 }}
        />
      </CardContent>
    </Card>
    <motion.div
      className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100"
      animate={isHovered ? {
        scale: [1, 1.2, 1],
        opacity: [0, 1, 0]
      } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    />
    </motion.div>
  );
}
