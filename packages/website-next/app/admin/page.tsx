"use client";

/* File Overview
  Path: client/src/pages/admin.tsx
  Purpose: A top-level page component rendered based on the current route.

  Reading tip for newcomers:
  - Scan the exports at the bottom to see what the rest of the app imports from here
  - Follow the data flow via function parameters and return values
*/

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Users, 
  Bolt, 
  Search, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  AlertTriangle,
  Calendar,
  ExternalLink,
  Eye
} from "lucide-react";
import type { AiTool } from "@shared/schema";

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("overview");

  // Redirect non-admin users
  if (user?.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">This admin panel is only available for administrator accounts.</p>
        </div>
      </div>
    );
  }

  const { data: pendingTools, isLoading: pendingLoading } = useQuery({
    queryKey: ["/api/admin/pending-tools"],
    queryFn: async () => {
      const response = await fetch("/api/admin/pending-tools");
      return response.json();
    }
  });

  const { data: allTools } = useQuery({
    queryKey: ["/api/tools", { status: "all" }],
    queryFn: async () => {
      const response = await fetch("/api/tools?status=all");
      return response.json();
    }
  });

  const approveMutation = useMutation({
    mutationFn: async (toolId: string) => {
      await apiRequest("POST", `/api/admin/tools/${toolId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-tools"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tools"] });
      toast({
        title: "Success",
        description: "Tool approved successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve tool.",
        variant: "destructive"
      });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (toolId: string) => {
      await apiRequest("POST", `/api/admin/tools/${toolId}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-tools"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tools"] });
      toast({
        title: "Success",
        description: "Tool rejected successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject tool.",
        variant: "destructive"
      });
    }
  });

  const handleApprove = (toolId: string) => {
    approveMutation.mutate(toolId);
  };

  const handleReject = (toolId: string) => {
    if (confirm("Are you sure you want to reject this tool?")) {
      rejectMutation.mutate(toolId);
    }
  };

  const totalTools = allTools?.length || 0;
  const approvedTools = allTools?.filter((tool: AiTool) => tool.status === "approved").length || 0;
  const pendingCount = pendingTools?.length || 0;
  const rejectedTools = allTools?.filter((tool: AiTool) => tool.status === "rejected").length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center" data-testid="admin-title">
              <Shield className="w-8 h-8 mr-3 text-primary" />
              Admin Panel
            </h1>
            <p className="text-muted-foreground mt-1">
              Platform management and tool moderation
            </p>
          </div>
          {pendingCount > 0 && (
            <Alert className="w-auto" data-testid="pending-alert">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {pendingCount} tool{pendingCount !== 1 ? 's' : ''} pending review
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" data-testid="tab-overview">
              <TrendingUp className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="moderation" data-testid="tab-moderation">
              <CheckCircle className="w-4 h-4 mr-2" />
              Moderation ({pendingCount})
            </TabsTrigger>
            <TabsTrigger value="tools" data-testid="tab-tools">
              <Bolt className="w-4 h-4 mr-2" />
              All Bolt
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Platform Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Bolt</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100" data-testid="total-tools-count">
                        {totalTools}
                      </p>
                    </div>
                    <Bolt className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 border-green-200 dark:border-green-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 dark:text-green-400 text-sm font-medium">Approved</p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100" data-testid="approved-tools-count">
                        {approvedTools}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/30 border-amber-200 dark:border-amber-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-600 dark:text-amber-400 text-sm font-medium">Pending Review</p>
                      <p className="text-2xl font-bold text-amber-900 dark:text-amber-100" data-testid="pending-tools-count">
                        {pendingCount}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-amber-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/30 border-red-200 dark:border-red-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-600 dark:text-red-400 text-sm font-medium">Rejected</p>
                      <p className="text-2xl font-bold text-red-900 dark:text-red-100" data-testid="rejected-tools-count">
                        {rejectedTools}
                      </p>
                    </div>
                    <XCircle className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest platform activities and changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4" data-testid="recent-activity">
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Tool approved</p>
                      <p className="text-xs text-muted-foreground">5 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New user registered</p>
                      <p className="text-xs text-muted-foreground">12 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Tool submitted for review</p>
                      <p className="text-xs text-muted-foreground">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="moderation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Tool Reviews</CardTitle>
                <CardDescription>
                  Review and moderate AI tool submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingLoading ? (
                  <div className="text-center py-8" data-testid="moderation-loading">
                    Loading pending tools...
                  </div>
                ) : pendingTools?.length > 0 ? (
                  <div className="space-y-6" data-testid="pending-tools-list">
                    {pendingTools.map((tool: AiTool) => (
                      <div
                        key={tool.id}
                        className="border border-border rounded-lg p-6 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/40 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-lg font-bold text-primary">
                                {tool.name.charAt(0)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-lg font-semibold" data-testid={`pending-tool-name-${tool.id}`}>
                                {tool.name}
                              </h4>
                              <p className="text-muted-foreground mt-1">
                                {tool.oneLiner}
                              </p>
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                {tool.description}
                              </p>
                              
                              <div className="flex items-center space-x-4 mt-3 text-xs text-muted-foreground">
                                <span className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  Submitted {new Date(tool.createdAt).toLocaleDateString()}
                                </span>
                                {tool.websiteUrl && (
                                  <a
                                    href={tool.websiteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center text-primary hover:underline"
                                  >
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    Visit Website
                                  </a>
                                )}
                              </div>

                              {/* Features and Industries */}
                              <div className="mt-3 space-y-2">
                                {tool.features && tool.features.length > 0 && (
                                  <div>
                                    <span className="text-xs font-medium text-muted-foreground">Features: </span>
                                    <span className="text-xs text-muted-foreground">
                                      {tool.features.slice(0, 3).join(", ")}
                                      {tool.features.length > 3 && ` +${tool.features.length - 3} more`}
                                    </span>
                                  </div>
                                )}
                                {tool.industries && tool.industries.length > 0 && (
                                  <div>
                                    <span className="text-xs font-medium text-muted-foreground">Industries: </span>
                                    <span className="text-xs text-muted-foreground">
                                      {tool.industries.join(", ")}
                                    </span>
                                  </div>
                                )}
                                {tool.pricingModel && (
                                  <div>
                                    <span className="text-xs font-medium text-muted-foreground">Pricing: </span>
                                    <Badge variant="outline" className="text-xs">
                                      {tool.pricingModel}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-3 flex-shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReject(tool.id)}
                              disabled={rejectMutation.isPending}
                              className="text-destructive hover:text-destructive border-destructive/20 hover:border-destructive/30"
                              data-testid={`reject-tool-${tool.id}`}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(tool.id)}
                              disabled={approveMutation.isPending}
                              className="bg-green-600 hover:bg-green-700"
                              data-testid={`approve-tool-${tool.id}`}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8" data-testid="no-pending-tools">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">No pending tools to review</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Bolt</CardTitle>
                <CardDescription>
                  Complete list of all AI tools on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allTools?.length > 0 ? (
                  <div className="space-y-4" data-testid="all-tools-list">
                    {allTools.map((tool: AiTool) => (
                      <div
                        key={tool.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/40 rounded-lg flex items-center justify-center">
                            <span className="font-bold text-primary text-sm">
                              {tool.name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold" data-testid={`all-tool-name-${tool.id}`}>
                              {tool.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {tool.oneLiner}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Badge
                            variant={
                              tool.status === "approved"
                                ? "default"
                                : tool.status === "pending"
                                ? "secondary"
                                : "destructive"
                            }
                            data-testid={`all-tool-status-${tool.id}`}
                          >
                            {tool.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(tool.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8" data-testid="no-tools">
                    <Bolt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No tools found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
