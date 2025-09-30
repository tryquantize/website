"use client";

/* File Overview
  Path: client/src/pages/dashboard.tsx
  Purpose: A top-level page component rendered based on the current route.

  Reading tip for newcomers:
  - Scan the exports at the bottom to see what the rest of the app imports from here
  - Follow the data flow via function parameters and return values
*/

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { OnboardingForm } from "@/components/onboarding-form";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
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
  Trash2,
  Building2,
  Zap,
  Target,
  Settings,
  HelpCircle,
  LogOut
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { AiTool } from "@shared/schema";

export default function Dashboard() {
  const { currentUser, signOut } = useFirebaseAuth();
  const { toast } = useToast();
  const [showToolForm, setShowToolForm] = useState(false);
  const [editingTool, setEditingTool] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Redirect non-authenticated users
  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground">Please log in to access your dashboard.</p>
      </div>
    );
  }

  // Get tools from localStorage for now (simulating persistence)
  const getTools = () => {
    try {
      const tools = JSON.parse(localStorage.getItem('userTools') || '[]');
      return tools.filter((tool: any) => tool.userId === currentUser.uid);
    } catch {
      return [];
    }
  };

  const tools = getTools();
  const toolsLoading = false;

  // Mock data for now
  const contactRequests: any[] = [];
  const contactsLoading = false;
  const analytics = null;

  const handleDeleteTool = (toolId: string) => {
    if (confirm("Are you sure you want to delete this tool?")) {
      // Remove from localStorage for now
      const existingTools = JSON.parse(localStorage.getItem('userTools') || '[]');
      const updatedTools = existingTools.filter((tool: any) => tool.id !== toolId);
      localStorage.setItem('userTools', JSON.stringify(updatedTools));
      
      toast({
        title: "Success",
        description: "Tool deleted successfully."
      });
      
      // Refresh the page to show updated tools
      window.location.reload();
    }
  };



  const handleEditTool = (tool: any) => {
    setEditingTool(tool);
    setShowToolForm(true);
  };

  const handleFormSuccess = () => {
    setShowToolForm(false);
    setEditingTool(null);
    // Refresh the page to show new tools
    window.location.reload();
  };

  // Calculate metrics
  const totalViews = tools?.reduce((sum: number, tool: any) => sum + (tool.analytics?.views || 0), 0) || 0;
  const totalContacts = contactRequests?.length || 0;
  const activeTools = tools?.filter((tool: any) => tool.status === "approved").length || 0;
  const pendingTools = tools?.filter((tool: any) => tool.status === "pending").length || 0;

  return (
    <div className="dashboard-layout" style={{ ['--dashboard-header-h' as any]: '64px' }}>
    <SidebarProvider defaultOpen={false}>
      <Sidebar variant="sidebar" collapsible="icon" className="bg-white/10 backdrop-blur-md text-white border-r border-white/20 w-64">
        <SidebarHeader>
          <div className="flex items-center justify-between px-2">
              <span className="text-base font-semibold text-firequest">Quantize</span>
            <SidebarTrigger className="md:hidden" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === "overview"} onClick={() => setActiveTab("overview")}>
                  <BarChart3 />
                  <span>Overview</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === "tools"} onClick={() => setActiveTab("tools")}>
                  <Bolt />
                  <span>My Tools</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === "products"} onClick={() => setActiveTab("products")}>
                  <Building2 />
                  <span>Products</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === "services"} onClick={() => setActiveTab("services")}>
                  <Zap />
                  <span>Services</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === "solutions"} onClick={() => setActiveTab("solutions")}>
                  <Target />
                  <span>Solutions</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === "contacts"} onClick={() => setActiveTab("contacts")}>
                  <MessageSquare />
                  <span>Inquiries</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={activeTab === "settings"} onClick={() => setActiveTab("settings")}>
                <Settings />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={activeTab === "help"} onClick={() => setActiveTab("help")}>
                <HelpCircle />
                <span>Help</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={async () => {
                const result = await signOut();
                if (result.success) {
                  toast({ title: "Logged out", description: "You have been logged out successfully." });
                } else {
                  toast({ title: "Logout failed", description: result.error || "Failed to log out.", variant: "destructive" });
                }
              }}>
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
          {/* Header row inside inset */}
          <div className="border-b border-white/10 bg-white/5 backdrop-blur-md">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <h2 className="text-xl font-semibold text-white">
                  {activeTab === "overview" && "Dashboard Overview"}
                  {activeTab === "tools" && "My AI Tools"}
                  {activeTab === "products" && "AI Products"}
                  {activeTab === "services" && "AI Services"}
                  {activeTab === "solutions" && "AI Solutions"}
                  {activeTab === "contacts" && "Contact Inquiries"}
                  {activeTab === "settings" && "Settings"}
                  {activeTab === "help" && "Help & Support"}
                </h2>
                <p className="text-white/70 text-sm">
                  {activeTab === "overview" && "Manage your AI tool listings and view performance analytics"}
                  {activeTab === "tools" && "Manage and monitor your AI tools"}
                  {activeTab === "products" && "Manage and monitor your AI products"}
                  {activeTab === "services" && "Manage and monitor your AI services"}
                  {activeTab === "solutions" && "Manage and monitor your AI solutions"}
                  {activeTab === "contacts" && "Messages from potential clients"}
                  {activeTab === "settings" && "Configure your account and preferences"}
                  {activeTab === "help" && "Get help and support for your account"}
                </p>
              </div>
              <Button onClick={() => setShowToolForm(true)} className="bg-white text-black hover:bg-white/90" data-testid="add-tool-button">
                <Plus className="w-4 h-4 mr-2" /> Add New
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            {activeTab === "overview" && "Dashboard Overview"}
            {activeTab === "tools" && "My AI Tools"}
            {activeTab === "products" && "AI Products"}
            {activeTab === "services" && "AI Services"}
            {activeTab === "solutions" && "AI Solutions"}
            {activeTab === "contacts" && "Contact Inquiries"}
            {activeTab === "settings" && "Settings"}
            {activeTab === "help" && "Help & Support"}
          </h2>
          <p className="text-white/80">
            {activeTab === "overview" && "Manage your AI tool listings and view performance analytics"}
            {activeTab === "tools" && "Manage and monitor your AI tools"}
            {activeTab === "products" && "Manage and monitor your AI products"}
            {activeTab === "services" && "Manage and monitor your AI services"}
            {activeTab === "solutions" && "Manage and monitor your AI solutions"}
            {activeTab === "contacts" && "Messages from potential clients"}
            {activeTab === "settings" && "Configure your account and preferences"}
            {activeTab === "help" && "Get help and support for your account"}
          </p>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-8">
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
                      <p className="text-amber-600 dark:text-amber-400 text-sm font-medium">Active Tools</p>
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

<Card className="bg-gradient-to-br from-white/5 to-white/10 dark:from-white/5 dark:to-white/10 border-white/20">
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
          </div>
        )}

                  {activeTab === "tools" && (
          <div className="space-y-6">
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
                ) : tools?.filter((tool: any) => tool.listType === "AI Tool")?.length > 0 ? (
                  <div className="space-y-4" data-testid="tools-list">
                    {tools.filter((tool: any) => tool.listType === "AI Tool").map((tool: any) => (
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
                    <p className="text-muted-foreground">No AI tools listed yet</p>
                    <Button 
                      onClick={() => setShowToolForm(true)} 
                      className="mt-4"
                      data-testid="create-first-tool-button"
                    >
                      List Your First Tool
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

                   {activeTab === "products" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your AI Products</CardTitle>
                    <CardDescription>Manage and monitor your AI products</CardDescription>
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
                  <div className="text-center py-8" data-testid="products-loading">
                    Loading products...
                  </div>
                ) : tools?.filter((tool: any) => tool.listType === "AI Product")?.length > 0 ? (
                  <div className="space-y-4" data-testid="products-list">
                    {tools.filter((tool: any) => tool.listType === "AI Product").map((tool: any) => (
                      <div
                        key={tool.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/40 rounded-lg flex items-center justify-center">
                            <span className="font-bold text-green-600">
                              {tool.name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold" data-testid={`product-name-${tool.id}`}>
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
                            data-testid={`product-status-${tool.id}`}
                          >
                            {tool.status}
                          </Badge>
                          
                          <div className="text-right text-sm">
                            <p className="font-medium">1.2K views</p>
                            <p className="text-muted-foreground">24 contacts</p>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" data-testid={`product-menu-${tool.id}`}>
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
                  <div className="text-center py-8" data-testid="no-products">
                    <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No AI products listed yet</p>
                    <Button 
                      onClick={() => setShowToolForm(true)} 
                      className="mt-4"
                      data-testid="create-first-product-button"
                    >
                      List Your First Product
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

                   {activeTab === "services" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your AI Services</CardTitle>
                    <CardDescription>Manage and monitor your AI services</CardDescription>
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
                  <div className="text-center py-8" data-testid="services-loading">
                    Loading services...
                  </div>
                ) : tools?.filter((tool: any) => tool.listType === "AI Solution / Service")?.length > 0 ? (
                  <div className="space-y-4" data-testid="services-list">
                    {tools.filter((tool: any) => tool.listType === "AI Solution / Service").map((tool: any) => (
                      <div
                        key={tool.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/40 rounded-lg flex items-center justify-center">
                            <span className="font-bold text-blue-600">
                              {tool.name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold" data-testid={`service-name-${tool.id}`}>
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
                            data-testid={`service-status-${tool.id}`}
                          >
                            {tool.status}
                          </Badge>
                          
                          <div className="text-right text-sm">
                            <p className="font-medium">1.2K views</p>
                            <p className="text-muted-foreground">24 contacts</p>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" data-testid={`service-menu-${tool.id}`}>
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
                  <div className="text-center py-8" data-testid="no-services">
                    <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No AI services listed yet</p>
                    <Button 
                      onClick={() => setShowToolForm(true)} 
                      className="mt-4"
                      data-testid="create-first-service-button"
                    >
                      List Your First Service
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

                   {activeTab === "solutions" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your AI Solutions</CardTitle>
                    <CardDescription>Manage and monitor your AI solutions</CardDescription>
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
                  <div className="text-center py-8" data-testid="solutions-loading">
                    Loading solutions...
                  </div>
                ) : tools?.filter((tool: any) => tool.listType === "AI Solution / Service")?.length > 0 ? (
                  <div className="space-y-4" data-testid="solutions-list">
                    {tools.filter((tool: any) => tool.listType === "AI Solution / Service").map((tool: any) => (
                      <div
                        key={tool.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/40 rounded-lg flex items-center justify-center">
                            <span className="font-bold text-purple-600">
                              {tool.name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold" data-testid={`solution-name-${tool.id}`}>
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
                        
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              tool.status === "approved"
                                ? "default"
                                : tool.status === "pending"
                                ? "secondary"
                                : "destructive"
                            }
                            data-testid={`solution-status-${tool.id}`}
                          >
                            {tool.status}
                          </Badge>
                          
                          <div className="text-right text-sm">
                            <p className="font-medium">1.2K views</p>
                            <p className="text-muted-foreground">24 contacts</p>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" data-testid={`solution-menu-${tool.id}`}>
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
                  <div className="text-center py-8" data-testid="no-solutions">
                    <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No AI solutions listed yet</p>
                    <Button 
                      onClick={() => setShowToolForm(true)} 
                      className="mt-4"
                      data-testid="create-first-solution-button"
                    >
                      List Your First Solution
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

         {activeTab === "contacts" && (
          <div className="space-y-6">
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
          </div>
        )}

        {/* Settings and Help tabs */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Configure your account and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Settings configuration coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "help" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Help & Support</CardTitle>
                <CardDescription>Get help and support for your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Help and support documentation coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tool Form Dialog */}
        <Dialog open={showToolForm} onOpenChange={setShowToolForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="tool-form-dialog">
            <DialogHeader>
              <DialogTitle>
                {editingTool ? "Edit AI Tool" : "List New AI Tool/Service"}
              </DialogTitle>
            </DialogHeader>
            <OnboardingForm
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
      </SidebarInset>
    </SidebarProvider>
    </div>
  );
}
