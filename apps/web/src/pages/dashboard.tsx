/* File Overview
  Path: client/src/pages/dashboard.tsx
  Purpose: A top-level page component rendered based on the current route.

  Reading tip for newcomers:
  - Scan the exports at the bottom to see what the rest of the app imports from here
  - Follow the data flow via function parameters and return values
*/

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Squares } from "@/components/ui/squares-background";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sidebar } from "@/components/ui/modern-side-bar";
import { OnboardingForm } from "@/components/onboarding-form";
import { ProductServiceCard } from "@/components/ui/expandable-card";
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
import type { AiTool } from "@shared/schemas/schema";

export default function Dashboard() {
  const { currentUser, signOut } = useFirebaseAuth();
  const { toast } = useToast();
  const [showToolForm, setShowToolForm] = useState(false);
  const [editingTool, setEditingTool] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedTool, setExpandedTool] = useState<string | null>(null);

  // Debug authentication
  console.log('Current user:', currentUser);
  
  // Temporarily bypass auth for testing
  // if (!currentUser) {
  //   return (
  //     <div className="container mx-auto px-4 py-16 text-center">
  //       <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
  //       <p className="text-muted-foreground">Please log in to access your dashboard.</p>
  //     </div>
  //   );
  // }

  // State for tools
  const [tools, setTools] = useState<any[]>([]);
  const [toolsLoading, setToolsLoading] = useState(true);

  // Fetch tools from API
  const fetchTools = async () => {
    const userId = currentUser?.uid || 'test-user'; // Use test user if not logged in
    
    try {
      setToolsLoading(true);
      // Temporarily fetch from localStorage
      const localTools = JSON.parse(localStorage.getItem('dashboardTools') || '[]');
      console.log('Fetched local tools:', localTools);
      console.log('Products:', localTools.filter((t: any) => t.description?.includes('[AI Product]')));
      console.log('Services:', localTools.filter((t: any) => t.description?.includes('[AI Service]')));
      setTools(localTools);
    } catch (error) {
      console.error('Failed to fetch tools:', error);
    } finally {
      setToolsLoading(false);
    }
  };

  // Fetch tools on component mount and user change
  useEffect(() => {
    fetchTools();
  }, [currentUser?.uid]);

  // Mock data for now
  const contactRequests: any[] = [];
  const contactsLoading = false;
  const analytics = null;

  const handleDeleteTool = async (toolId: string) => {
    if (confirm("Are you sure you want to delete this tool?")) {
      try {
        const response = await fetch(`/api/tools/${toolId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          toast({
            title: "Success",
            description: "Tool deleted successfully."
          });
          
          // Refresh tools list
          fetchTools();
        } else {
          throw new Error('Failed to delete tool');
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete tool. Please try again.",
          variant: "destructive"
        });
      }
    }
  };



  const handleEditTool = (toolId: string) => {
    const tool = tools.find(t => t.id === toolId);
    if (tool) {
      setEditingTool(tool);
      setShowToolForm(true);
    }
  };

  const handleFormSuccess = () => {
    setShowToolForm(false);
    setEditingTool(null);
    // Refresh tools list
    fetchTools();
  };

  // Calculate metrics
  const totalViews = tools?.reduce((sum: number, tool: any) => sum + (tool.analytics?.views || 0), 0) || 0;
  const totalContacts = contactRequests?.length || 0;
  const activeTools = tools?.filter((tool: any) => tool.status === "approved").length || 0;
  const pendingTools = tools?.filter((tool: any) => tool.status === "pending").length || 0;

  return (
    <div className="relative w-full min-h-screen bg-black overflow-hidden">
      {/* Squares Animation Background */}
      <div className="fixed inset-0 w-full h-full z-0">
        <Squares 
          direction="diagonal"
          speed={0.3}
          squareSize={50}
          borderColor="#333"
          hoverFillColor="#222"
        />
      </div>
      
      {/* Dashboard Content */}
      <div className="relative z-10">
        <Sidebar 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          currentUser={currentUser}
          onSignOut={async () => {
            const result = await signOut();
            if (result.success) {
              toast({ title: "Logged out", description: "You have been logged out successfully." });
            } else {
              toast({ title: "Logout failed", description: result.error || "Failed to log out.", variant: "destructive" });
            }
          }}
        />


        {/* Main Content */}
        <div className="ml-72 overflow-y-auto h-screen bg-gradient-to-br from-background via-background to-muted/20">
          <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {activeTab === "overview" && `${currentUser?.displayName || 'Company'} Dashboard`}
                {activeTab === "tools" && "My AI Tools"}
                {activeTab === "products" && "Products"}
                {activeTab === "services" && "Service"}
                {activeTab === "solutions" && "AI Solutions"}
                {activeTab === "contacts" && "Contact Inquiries"}
                {activeTab === "settings" && "Settings"}
                {activeTab === "help" && "Help & Support"}
              </h1>
              <p className="text-white/80">
                {activeTab === "overview" && "Manage your AI tool listings and view performance analytics"}
                {activeTab === "tools" && "Manage and monitor your AI tools"}
                {activeTab === "products" && "Manage and monitor your products"}
                {activeTab === "services" && "Manage and monitor your service"}
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

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/10 backdrop-blur-md border border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">Total Views</p>
                      <p className="text-2xl font-bold text-white" data-testid="total-views">
                        {totalViews.toLocaleString()}
                      </p>
                    </div>
                    <Eye className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                    <span className="text-white">+12% vs last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">Contact Requests</p>
                      <p className="text-2xl font-bold text-white" data-testid="total-contacts">
                        {totalContacts}
                      </p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-green-400" />
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                    <span className="text-white">+8% vs last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">Active Tools</p>
                      <p className="text-2xl font-bold text-white" data-testid="active-tools">
                        {activeTools}
                      </p>
                    </div>
                    <Bolt className="w-8 h-8 text-amber-400" />
                  </div>
                  <div className="mt-4 text-sm text-white">
                    {pendingTools > 0 && `${pendingTools} pending review`}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">Conversion Rate</p>
                      <p className="text-2xl font-bold text-white">4.2%</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-400" />
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                    <span className="text-white">+2.1% vs last month</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Chart Placeholder */}
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-white/5 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-white/70 mx-auto mb-4" />
                    <p className="text-white/70">Analytics chart would be rendered here</p>
                    <p className="text-sm text-white/50 mt-2">Using Recharts library in production</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}



                   {activeTab === "products" && (
          <div className="space-y-6">
            <Card className="bg-transparent border-none shadow-none">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Your Products</CardTitle>
                    <CardDescription className="text-white/70">Manage and monitor your products</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {toolsLoading ? (
                  <div className="text-center py-8" data-testid="products-loading">
                    Loading products...
                  </div>
) : tools?.filter((tool: any) => tool.description?.includes('[Product]'))?.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2" data-testid="products-list">
                    {tools.filter((tool: any) => tool.description?.includes('[Product]')).map((tool: any) => (
                      <ProductServiceCard
                        key={tool.id}
                        id={tool.id}
                        title={tool.name}
                        description={tool.description?.replace('[Product] ', '') || ''}
                        websiteUrl={tool.websiteUrl}
                        keySpecifications={tool.keySpecifications || []}
                        type="Product"
                        createdAt={tool.createdAt}
                        onEdit={handleEditTool}
                        onDelete={handleDeleteTool}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8" data-testid="no-products">
                    <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No products listed yet</p>
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
            <Card className="bg-transparent border-none shadow-none">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Your Service</CardTitle>
                    <CardDescription className="text-white/70">Manage and monitor your service</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {toolsLoading ? (
                  <div className="text-center py-8" data-testid="services-loading">
                    Loading services...
                  </div>
) : tools?.filter((tool: any) => tool.description?.includes('[Service]'))?.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2" data-testid="services-list">
                    {tools.filter((tool: any) => tool.description?.includes('[Service]')).map((tool: any) => (
                      <ProductServiceCard
                        key={tool.id}
                        id={tool.id}
                        title={tool.name}
                        description={tool.description?.replace('[Service] ', '') || ''}
                        websiteUrl={tool.websiteUrl}
                        keySpecifications={tool.keySpecifications || []}
                        type="Service"
                        createdAt={tool.createdAt}
                        onEdit={handleEditTool}
                        onDelete={handleDeleteTool}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8" data-testid="no-services">
                    <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No service listed yet</p>
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



         {activeTab === "contacts" && (
          <div className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Contact Requests</CardTitle>
                <CardDescription className="text-white/70">Messages from potential clients</CardDescription>
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
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Settings</CardTitle>
                <CardDescription className="text-white/70">Configure your account and preferences</CardDescription>
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
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Help & Support</CardTitle>
                <CardDescription className="text-white/70">Get help and support for your account</CardDescription>
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

        {/* Blur Backdrop */}
        {showToolForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-40" />
        )}

        {/* Tool Form Dialog */}
        <Dialog open={showToolForm} onOpenChange={setShowToolForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto z-50" data-testid="tool-form-dialog">
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
      </div>
    </div>
  );
}
