import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { insertAiToolSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Upload, Plus, X } from "lucide-react";

const toolFormSchema = insertAiToolSchema.extend({
  features: z.array(z.string()).optional(),
  industries: z.array(z.string()).optional(),
  integrations: z.array(z.string()).optional(),
  techStack: z.array(z.string()).optional()
});

type ToolFormData = z.infer<typeof toolFormSchema>;

interface ToolFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<ToolFormData>;
}

export function ToolForm({ onSuccess, onCancel, initialData }: ToolFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentTab, setCurrentTab] = useState("basic");
  const [features, setFeatures] = useState<string[]>(initialData?.features || []);
  const [newFeature, setNewFeature] = useState("");

  const form = useForm<ToolFormData>({
    resolver: zodResolver(toolFormSchema),
    defaultValues: {
      name: "",
      description: "",
      oneLiner: "",
      websiteUrl: "",
      pricingModel: "freemium",
      startupId: user?.id,
      features: [],
      industries: [],
      integrations: [],
      techStack: [],
      ...initialData
    }
  });

  const createToolMutation = useMutation({
    mutationFn: async (data: ToolFormData) => {
      const response = await apiRequest("POST", "/api/tools", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tools"] });
      toast({
        title: "Success!",
        description: "Your AI tool has been submitted for review."
      });
      if (onSuccess) onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit your tool. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: ToolFormData) => {
    const submitData = {
      ...data,
      features,
      startupId: user?.id || ""
    };
    createToolMutation.mutate(submitData);
  };

  const addFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addFeature();
    }
  };

  const industries = [
    "Marketing & Advertising",
    "E-commerce",
    "Healthcare",
    "Finance",
    "Education",
    "Manufacturing",
    "Real Estate",
    "Legal",
    "HR & Recruitment",
    "Customer Service",
    "Sales",
    "Content Creation",
    "Data Analytics",
    "Other"
  ];

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="targeting">Targeting</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Tell us about your AI tool
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tool Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., ContentAI Pro"
                    {...form.register("name")}
                    data-testid="tool-name-input"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">Website URL *</Label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    placeholder="https://your-tool.com"
                    {...form.register("websiteUrl")}
                    data-testid="website-url-input"
                  />
                  {form.formState.errors.websiteUrl && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.websiteUrl.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="oneLiner">One-line Description *</Label>
                <Input
                  id="oneLiner"
                  placeholder="Describe your tool in one compelling sentence"
                  maxLength={200}
                  {...form.register("oneLiner")}
                  data-testid="one-liner-input"
                />
                <p className="text-xs text-muted-foreground">
                  {form.watch("oneLiner")?.length || 0}/200 characters
                </p>
                {form.formState.errors.oneLiner && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.oneLiner.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  rows={6}
                  placeholder="Provide a comprehensive description of your AI tool, its capabilities, and benefits..."
                  {...form.register("description")}
                  data-testid="description-input"
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricingModel">Pricing Model</Label>
                <Select 
                  value={form.watch("pricingModel") || "freemium"}
                  onValueChange={(value) => form.setValue("pricingModel", value as any)}
                >
                  <SelectTrigger data-testid="pricing-model-select">
                    <SelectValue placeholder="Select pricing model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="freemium">Freemium</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Features & Capabilities</CardTitle>
              <CardDescription>
                What can your AI tool do?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Key Features</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                    >
                      <span>{feature}</span>
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="w-4 h-4 rounded-full hover:bg-primary/20 flex items-center justify-center"
                        data-testid={`remove-feature-${index}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Input
                    placeholder="e.g., Natural language processing"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={handleKeyPress}
                    data-testid="new-feature-input"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addFeature}
                    disabled={!newFeature.trim()}
                    data-testid="add-feature-button"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="targeting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Target Market</CardTitle>
              <CardDescription>
                Who is your ideal customer?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Target Industries</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {industries.map((industry) => (
                    <div key={industry} className="flex items-center space-x-2">
                      <Checkbox
                        id={industry}
                        checked={form.watch("industries")?.includes(industry) || false}
                        onCheckedChange={(checked) => {
                          const current = form.watch("industries") || [];
                          if (checked) {
                            form.setValue("industries", [...current, industry]);
                          } else {
                            form.setValue("industries", current.filter(i => i !== industry));
                          }
                        }}
                        data-testid={`industry-${industry.toLowerCase().replace(/\s+/g, "-")}`}
                      />
                      <Label htmlFor={industry} className="text-sm font-normal">
                        {industry}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Media & Assets</CardTitle>
              <CardDescription>
                Showcase your tool with visuals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tool Logo</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Drag & drop or click to upload
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG up to 2MB
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="demoVideoUrl">Demo Video (Optional)</Label>
                  <Input
                    id="demoVideoUrl"
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    {...form.register("demoVideoUrl")}
                    data-testid="demo-video-input"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          data-testid="cancel-button"
        >
          Cancel
        </Button>
        <div className="flex space-x-3">
          <Button
            type="button"
            variant="outline"
            data-testid="save-draft-button"
          >
            Save as Draft
          </Button>
          <Button
            type="submit"
            disabled={createToolMutation.isPending}
            data-testid="submit-button"
          >
            {createToolMutation.isPending ? "Submitting..." : "Submit for Review"}
          </Button>
        </div>
      </div>
    </form>
  );
}
