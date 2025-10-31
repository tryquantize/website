"use client";

import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Star,
  ExternalLink,
  Edit,
  Trash2,
  MoreVertical,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useExpandable } from "@/hooks/use-expandable";

interface ProductServiceCardProps {
  id: string;
  title: string;
  description: string;
  websiteUrl?: string;
  keySpecifications: string[];
  type: "Product" | "Service";
  createdAt: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ProductServiceCard({
  id,
  title,
  description,
  websiteUrl,
  keySpecifications,
  type,
  createdAt,
  onEdit,
  onDelete,
}: ProductServiceCardProps) {
  const { isExpanded, toggleExpand, animatedHeight } = useExpandable();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      animatedHeight.set(isExpanded ? contentRef.current.scrollHeight : 0);
    }
  }, [isExpanded, animatedHeight]);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't expand if clicking on buttons or dropdown
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('[role="menuitem"]')) {
      return;
    }
    toggleExpand();
  };

  return (
    <Card
      className="w-full cursor-pointer transition-all duration-300 hover:shadow-lg border border-white/10 bg-white/5 backdrop-blur-md"
      onClick={handleCardClick}
    >
      <CardHeader className="space-y-1">
        <div className="flex justify-between items-start w-full">
          <div className="space-y-2">
            <Badge
              variant="secondary"
              className={
                type === "Product"
                  ? "bg-green-100 text-green-600"
                  : "bg-blue-100 text-blue-600"
              }
            >
              {type}
            </Badge>
            <h3 className="text-xl font-semibold text-white">{title}</h3>
          </div>
          <div className="flex items-center space-x-2">
            {websiteUrl && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="icon" 
                      variant="outline" 
                      className="h-8 w-8 bg-black/20 border-white/10 text-white hover:bg-black/40"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(websiteUrl, '_blank');
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Visit Website</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 text-white hover:bg-black/40"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onEdit?.(id)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete?.(id)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {!isExpanded && <p className="text-sm text-white/80 line-clamp-2">{description}</p>}

          <motion.div
            style={{ height: animatedHeight }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div ref={contentRef}>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4 pt-2 bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/5"
                  >
                    <div>
                      <p className="text-sm text-white/90">{description}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm text-white/70">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>Created {new Date(createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-1 text-yellow-400" />
                          <span>1.2K views</span>
                        </div>
                      </div>
                    </div>

                    {keySpecifications && keySpecifications.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-white flex items-center">
                          Key Specifications
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {keySpecifications.map((spec, index) => (
                            <span
                              key={index}
                              className="bg-black/30 text-white px-2 py-1 rounded text-xs"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {websiteUrl && (
                      <div className="space-y-2">
                        <Button 
                          className="w-full bg-white text-black hover:bg-white/90"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(websiteUrl, '_blank');
                          }}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Visit Website
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </CardContent>

      <CardFooter>
        <div className="flex items-center justify-between w-full text-sm text-white/60">
          <span>Last updated: 2 hours ago</span>
          <span className="text-white/80">Click to expand</span>
        </div>
      </CardFooter>
    </Card>
  );
}