/* File Overview
  Path: client/src/components/onboarding-form.tsx
  Purpose: A reusable onboarding form component that can be used in modals or standalone pages.
           Handles multi-step form submission for AI tools/services with validation.

  Reading tip for newcomers:
  - This component manages a multi-step form with state validation
  - Uses react-hook-form + zod for validation and framer-motion for transitions
  - Can be used both in the onboarding page and in the dashboard modal
*/

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { Rocket, Building2, User2 } from "lucide-react";
import type { AiTool } from "@shared/schemas/schema";

const formSchema = z.object({
  listType: z.enum(["Product", "Service"]),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  link: z.string().url("Please enter a valid URL").min(1, "Link is required"),
  keySpecifications: z.array(z.string()).min(1, "At least one key specification is required"),
});

type OnboardingFormData = z.infer<typeof formSchema>;



interface OnboardingFormProps {
  initialData?: AiTool;
  onSuccess: () => void;
  onCancel: () => void;
}

export function OnboardingForm({ initialData, onSuccess, onCancel }: OnboardingFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [specificationInput, setSpecificationInput] = useState("");

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      listType: "Product",
      name: "",
      description: "",
      link: "",
      keySpecifications: [],
      ...initialData,
    },
  });



  const onSubmit = async (data: OnboardingFormData) => {
    console.log('Form submission started with data:', data);
    
    try {
      // Create a proper tool object from the form data
      const toolData = {
        name: data.name,
        description: `[${data.listType}] ${data.description}`,
        oneLiner: data.description.substring(0, 100),
        websiteUrl: data.link,
        keySpecifications: data.keySpecifications,
        pricingModel: "paid",
        startupId: "550e8400-e29b-41d4-a716-446655440000"
      };
      
      console.log('Form listType:', data.listType);
      console.log('Submitting tool data:', toolData);

      console.log('Sending tool data:', toolData);

      // Temporarily store in localStorage for testing
      const existingTools = JSON.parse(localStorage.getItem('dashboardTools') || '[]');
      const newTool = {
        ...toolData,
        id: Date.now().toString(),
        status: 'approved',
        createdAt: new Date().toISOString()
      };
      existingTools.push(newTool);
      localStorage.setItem('dashboardTools', JSON.stringify(existingTools));
      
      console.log('Tool stored locally:', newTool);
      
      toast({ title: "Success!", description: "Your tool/service has been listed successfully!" });
      onSuccess();
    } catch (error) {
      console.error("Submission error:", error);
      toast({ title: "Error", description: `Failed to submit: ${error.message}`, variant: "destructive" });
    }
  };

  const addSpecification = () => {
    const spec = specificationInput.trim();
    if (!spec) return;
    const current = form.getValues("keySpecifications") || [];
    if (current.includes(spec)) return;
    form.setValue("keySpecifications", [...current, spec]);
    setSpecificationInput("");
  };

  const removeSpecification = (index: number) => {
    const current = form.getValues("keySpecifications") || [];
    form.setValue("keySpecifications", current.filter((_, i) => i !== index));
  };

  const containerVariants = {
    initial: { opacity: 0, filter: "blur(8px)", y: 16 },
    animate: { opacity: 1, filter: "blur(0px)", y: 0 },
    exit: { opacity: 0, filter: "blur(12px)", y: -16 },
  };

  const sectionTitleWrap = "bg-black/20 backdrop-blur-md rounded-xl p-4 border border-white/20";

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-black/80 p-6 rounded-xl">
      <Card className="bg-black/60 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Add New Listing</CardTitle>
          <CardDescription className="text-white/80">Create a new tool, product, or solution listing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white/90">Type</Label>
            <Select onValueChange={(value) => form.setValue("listType", value as any)}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Product">Products</SelectItem>
                <SelectItem value="Service">Service</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white/90">Name</Label>
            <Input
              id="name"
              placeholder="e.g., Content Writer Pro"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              {...form.register("name")}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white/90">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what your tool does, who it helps, and its unique value proposition..."
              rows={4}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              {...form.register("description")}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="link" className="text-white/90">Product/Service Link</Label>
            <Input
              id="link"
              type="url"
              placeholder="https://your-product-website.com"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              {...form.register("link")}
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-white/90">Key Specifications</Label>
            <div className="flex gap-2">
              <Input
                value={specificationInput}
                onChange={(e) => setSpecificationInput(e.target.value)}
                placeholder="Add a key specification and press +"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const spec = specificationInput.trim();
                  if (!spec) return;
                  const current = form.getValues("keySpecifications") || [];
                  if (current.includes(spec)) return;
                  form.setValue("keySpecifications", [...current, spec]);
                  setSpecificationInput("");
                }}
                disabled={!specificationInput.trim()}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                +
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(form.watch("keySpecifications") || []).map((spec, idx) => (
                <span key={idx} className="inline-flex items-center gap-2 bg-white/10 text-white px-3 py-1 rounded-full text-sm">
                  {spec}
                  <button
                    type="button"
                    className="opacity-70 hover:opacity-100"
                    onClick={() => {
                      const current = form.getValues("keySpecifications") || [];
                      form.setValue("keySpecifications", current.filter((_, i) => i !== idx));
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
          Cancel
        </Button>
        <Button type="submit" className="bg-white text-black hover:bg-white/90">
          Submit
        </Button>
      </div>
    </form>
  );
}

