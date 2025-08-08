import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ToolForm } from "@/components/tool-form";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Eye, 
  MessageSquare, 
  TrendingUp, 
  Bolt, 
  Plus, 
  MoreVertical,
  Calendar,
  Users,
  BarChart3,
  Edit,
  Trash2
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { AiTool } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showToolForm, setShowToolForm] = useState(false);
  const [editingTool, setEditingTool] = useState<AiTool | null>(null);

  // Redirect non-startup users
  if (user?.role !== "startup") {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground">This dashboard is only available for startup accounts.</p>
      </div>
    );
  }

  const { data: tools, isLoading: toolsLoading } = useQuery({
    queryKey: ["/api/startup", user.id, "tools"],
    queryFn: async () => {
      const response = await fetch(`/api/startup/${user.id}/tools`);
      return response.json();
    },
    enabled: !!user?.id
  });

  const { data: contactRequests, isLoading: contactsLoading } = useQuery({
    queryKey: ["/api/startup", user.id, "contact-requests"],
    queryFn: async () => {
      const response = await fetch(`/api/startup/${user.id}/contact-requests`);
      return response.json();
    },
    enabled: !!user?.id
  });

  const { data: analytics } = useQuery({
    queryKey: ["/api/startup", user.id, "analytics"],
    queryFn: async () => {
      const response = await fetch(`/api/startup/${user.id}/analytics`);
      return response.json();
    },
    enabled: !!user?.id
  });

  const deleteToolMutation = useMutation({
    mutationFn: async (toolId: string) => {
      await apiRequest("DELETE", `/api/tools/${toolId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/startup", user.id, "tools"] });
      toast({
        title: "Success",
        description: "Tool deleted successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete tool.",
        variant: "destructive"
      });
    }
  });

  const handleDeleteTool = (toolId: string) => {
    if (confirm("Are you sure you want to delete this tool?")) {
      deleteToolMutation.mutate(toolId);
    }
  };

  const handleEditTool = (tool: AiTool) => {
    setEditingTool(tool);
    setShowToolForm(true);
  };

  const handleFormSuccess = () => {
    setShowToolForm(false);
    setEditingTool(null);
    queryClient.invalidateQueries({ queryKey: ["/api/startup", user.id, "tools"] });
  };

  // Calculate metrics
  const totalViews = tools?.reduce((sum: number, tool: AiTool) => sum + (tool.analytics?.views || 0), 0) || 0;
  const totalContacts = contactRequests?.length || 0;
  const activeTools = tools?.filter((tool: AiTool) => tool.status === "approved").length || 0;
  const pendingTools = tools?.filter((tool: AiTool) => tool.status === "pending").length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" data-testid="dashboard-title">
              Startup Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your AI tool listings and view performance analytics
            </p>
          </div>
          <Button 
            onClick={() => setShowToolForm(true)}
            className="mt-4 sm:mt-0"
            data-testid="add-tool-button"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Tool
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList>
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="tools" data-testid="tab-tools">My Bolt</TabsTrigger>
            <TabsTrigger value="contacts" data-testid="tab-contacts">Inquiries</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Views</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100" data-testid="total-views">
                        {totalViews.toLocaleString()}
                      </p>
                    </div>
                    <Eye className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-green-600">+12% vs last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 border-green-200 dark:border-green-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 dark:text-green-400 text-sm font-medium">Contact Requests</p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100" data-testid="total-contacts">
                        {totalContacts}
                      </p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-green-600">+8% vs last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/30 border-amber-200 dark:border-amber-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-600 dark:text-amber-400 text-sm font-medium">Active Bolt</p>
                      <p className="text-2xl font-bold text-amber-900 dark:text-amber-100" data-testid="active-tools">
                        {activeTools}
                      </p>
                    </div>
                    <Bolt className="w-8 h-8 text-amber-500" />
                  </div>
                  <div className="mt-4 text-sm text-muted-foreground">
                    {pendingTools > 0 && `${pendingTools} pending review`}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30 border-purple-200 dark:border-purple-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Conversion Rate</p>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">4.2%</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-500" />
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-green-600">+2.1% vs last month</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Analytics chart would be rendered here</p>
                    <p className="text-sm text-muted-foreground mt-2">Using Recharts library in production</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your Tool Listings</CardTitle>
                    <CardDescription>Manage and monitor your AI tools</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {toolsLoading ? (
                  <div className="text-center py-8" data-testid="tools-loading">
                    Loading tools...
                  </div>
                ) : tools?.length > 0 ? (
                  <div className="space-y-4" data-testid="tools-list">
                    {tools.map((tool: AiTool) => (
                      <div
                        key={tool.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/40 rounded-lg flex items-center justify-center">
                            <span className="font-bold text-primary">
                              {tool.name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold" data-testid={`tool-name-${tool.id}`}>
                              {tool.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {tool.oneLiner}
                            </p>
                            <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                Created {new Date(tool.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <Badge
                            variant={
                              tool.status === "approved"
                                ? "default"
                                : tool.status === "pending"
                                ? "secondary"
                                : "destructive"
                            }
                            data-testid={`tool-status-${tool.id}`}
                          >
                            {tool.status}
                          </Badge>
                          
                          <div className="text-right text-sm">
                            <p className="font-medium">1.2K views</p>
                            <p className="text-muted-foreground">24 contacts</p>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" data-testid={`tool-menu-${tool.id}`}>
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleEditTool(tool)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteTool(tool.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8" data-testid="no-tools">
                    <Bolt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No tools created yet</p>
                    <Button 
                      onClick={() => setShowToolForm(true)} 
                      className="mt-4"
                      data-testid="create-first-tool-button"
                    >
                      Create Your First Tool
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Requests</CardTitle>
                <CardDescription>Messages from potential clients</CardDescription>
              </CardHeader>
              <CardContent>
                {contactsLoading ? (
                  <div className="text-center py-8" data-testid="contacts-loading">
                    Loading contact requests...
                  </div>
                ) : contactRequests?.length > 0 ? (
                  <div className="space-y-4" data-testid="contacts-list">
                    {contactRequests.map((contact: any) => (
                      <div
                        key={contact.id}
                        className="p-4 border border-border rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <Users className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-semibold" data-testid={`contact-name-${contact.id}`}>
                                  {contact.clientName}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {contact.clientEmail}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              Interested in: <span className="font-medium">{contact.toolName}</span>
                            </p>
                            <p className="text-sm">{contact.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(contact.createdAt).toLocaleDateString()} • {contact.status}
                            </p>
                          </div>
                          <Button size="sm" data-testid={`reply-button-${contact.id}`}>
                            Reply
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8" data-testid="no-contacts">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No contact requests yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Tool Form Dialog */}
        <Dialog open={showToolForm} onOpenChange={setShowToolForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="tool-form-dialog">
            <DialogHeader>
              <DialogTitle>
                {editingTool ? "Edit AI Tool" : "Add New AI Tool"}
              </DialogTitle>
            </DialogHeader>
            <ToolForm
              initialData={editingTool || undefined}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setShowToolForm(false);
                setEditingTool(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
