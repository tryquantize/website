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
import { Rocket, Building2, User2 } from "lucide-react";
import type { AiTool } from "@shared/schemas/schema";

const MAX_FEATURES = 5;

const formSchema = z.object({
  // Section 1 — Basic Information
  profileType: z.enum(["Freelancer / Individual Creator", "Startup", "Company / Enterprise", "Agency", "Other"]).optional(),
  profileTypeOther: z.string().optional(),
  listType: z.enum(["AI Tool", "AI Product", "AI Solution / Service", "Other"]).optional(),
  listTypeOther: z.string().optional(),
  companyName: z.string().optional(),
  fullName: z.string().optional(),
  contactEmail: z.string().email("Please enter a valid email"),
  websiteUrl: z.string().url("Please enter a valid URL"),
  socialLink: z.string().url().optional().or(z.literal("")),

  // Section 2 — Product / Service Details
  productName: z.string().min(1, "Name is required"),
  tagline: z.string().max(150, "Max 150 characters"),
  description: z.string().min(1, "Please provide a detailed description"),
  features: z.array(z.string()).max(MAX_FEATURES, `Limit ${MAX_FEATURES} features`),
  primaryUseCases: z.array(z.string()).optional(),
  primaryUseCaseOther: z.string().optional(),
  industriesServed: z.string().optional(),
  targetAudience: z.string().optional(),

  // Section 3 — Pricing & Access
  pricingModels: z.array(z.string()).optional(),
  priceTiers: z.string().optional(),
  freeTrial: z.enum(["Yes", "No"]).optional(),
  freeTrialDuration: z.string().optional(),
  demoAvailable: z.enum(["Yes", "No"]).optional(),
  demoLink: z.string().url().optional().or(z.literal("")),

  // Section 4 — Media & Links
  demoVideo: z.string().url().optional().or(z.literal("")),
  caseStudies: z.string().optional(),

  // Section 5 — Additional Information
  usp: z.string().optional(),
  launchDate: z.string().optional(),
  achievements: z.string().optional(),
  aiTechUsed: z.string().optional(),
  roadmap: z.string().optional(),

  // Section 6 — Verification & Agreement
  confirmAccuracy: z.boolean().refine(v => v, { message: "Please confirm information accuracy" }),
  agreeTerms: z.boolean().refine(v => v, { message: "You must agree to the Terms & Conditions and Privacy Policy" }),
});

type OnboardingFormData = z.infer<typeof formSchema>;

const USE_CASES = [
  "Customer Support Automation",
  "Content Creation & Marketing",
  "Data Analysis & Insights",
  "Sales & CRM Automation",
  "Workflow / Process Automation",
  "Search & Discovery",
  "Other",
];

const PRICING_MODELS = [
  "Free",
  "Freemium",
  "Subscription (Monthly / Yearly)",
  "One-Time Payment",
  "Pay-per-Use",
  "Custom Pricing",
];

interface OnboardingFormProps {
  initialData?: AiTool;
  onSuccess: () => void;
  onCancel: () => void;
}

export function OnboardingForm({ initialData, onSuccess, onCancel }: OnboardingFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1); // Start at step 1 since auth is handled separately
  const [features, setFeatures] = useState<string[]>([""]);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      profileType: user?.role === "startup" ? "Startup" : "Freelancer / Individual Creator",
      features: [""],
      primaryUseCases: [],
      pricingModels: [],
      confirmAccuracy: false,
      agreeTerms: false,
      ...initialData,
    },
  });

  const addFeature = () => {
    if (features.length < MAX_FEATURES) {
      setFeatures([...features, ""]);
    }
  };

  const removeFeature = (index: number) => {
    if (features.length > 1) {
      const newFeatures = features.filter((_, i) => i !== index);
      setFeatures(newFeatures);
      form.setValue("features", newFeatures);
    }
  };

  const stepFieldsFor = (currentStep: number): (keyof OnboardingFormData)[] => {
    if (currentStep === 1) return ["listType"]; // Section 1 only asks what you want to list
    if (currentStep === 2) return ["productName", "tagline", "description", "features"];
    if (currentStep === 3) return ["pricingModels", "priceTiers", "freeTrial", "demoAvailable"];
    if (currentStep === 4) return ["demoVideo", "caseStudies"];
    if (currentStep === 5) return ["usp", "launchDate", "achievements", "aiTechUsed", "roadmap"];
    if (currentStep === 6) return ["confirmAccuracy", "agreeTerms"];
    return [];
  };

  const nextStep = async () => {
    // Validate current step fields before moving forward
    if (step >= 1 && step <= 6) {
      const fields = stepFieldsFor(step);
      const valid = await form.trigger(fields as any, { shouldFocus: true });
      if (!valid) return;
    }
    setStep(Math.min(step + 1, 6));
  };

  const prevStep = () => setStep(Math.max(step - 1, 1));

  const onSubmit = async (data: OnboardingFormData) => {
    try {
      // Create a proper tool object from the form data
      const toolData = {
        id: Date.now().toString(), // Generate a temporary ID
        name: data.productName || "Untitled Tool",
        description: data.description || "",
        oneLiner: data.tagline || "",
        features: data.features || [""],
        listType: data.listType || "AI Tool",
        pricingModels: data.pricingModels || [],
        priceTiers: data.priceTiers || "",
        freeTrial: data.freeTrial || "No",
        demoAvailable: data.demoAvailable || "No",
        demoVideo: data.demoVideo || "",
        caseStudies: data.caseStudies || "",
        usp: data.usp || "",
        launchDate: data.launchDate || "",
        aiTechUsed: data.aiTechUsed || "",
        roadmap: data.roadmap || "",
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
        // Add user info
        userId: user?.id || "unknown",
        userRole: user?.role || "startup"
      };

      // Here you would typically submit to your API
      console.log("Onboarding submission", toolData);
      
      // For now, we'll store it in localStorage to simulate persistence
      const existingTools = JSON.parse(localStorage.getItem('userTools') || '[]');
      existingTools.push(toolData);
      localStorage.setItem('userTools', JSON.stringify(existingTools));
      
      toast({ title: "Success!", description: "Your AI tool/service has been listed successfully!" });
      onSuccess();
    } catch (error) {
      console.error("Submission error:", error);
      toast({ title: "Error", description: "Failed to submit. Please try again.", variant: "destructive" });
    }
  };

  const containerVariants = {
    initial: { opacity: 0, filter: "blur(8px)", y: 16 },
    animate: { opacity: 1, filter: "blur(0px)", y: 0 },
    exit: { opacity: 0, filter: "blur(12px)", y: -16 },
  };

  const sectionTitleWrap = "bg-black/20 backdrop-blur-md rounded-xl p-4 border border-white/20";

  return (
    <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8 bg-black/80 p-6 rounded-xl">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="section-1" variants={containerVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }}>
            <Card className="bg-black/60 backdrop-blur-md border-white/20">
              <CardHeader>
                <div className={sectionTitleWrap}>
                  <CardTitle className="text-white">Section 1 — Listing Type</CardTitle>
                </div>
                <CardDescription className="text-white/80">Choose what you want to list.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white/90">What would you like to list?</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {["AI Tool", "AI Product", "AI Solution / Service", "Other"].map(opt => (
                      <label key={opt} className="flex items-center space-x-2">
                        <input className="accent-purple-500" type="radio" value={opt} checked={form.watch("listType") === opt} onChange={() => form.setValue("listType", opt as any)} />
                        <span className="text-white/90 text-sm">{opt}</span>
                      </label>
                    ))}
                  </div>
                  {form.watch("listType") === "Other" && (
                    <Input placeholder="Please specify" {...form.register("listTypeOther")} className="bg-black/40 border-white/20 text-white placeholder:text-white/50" />
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="section-2" variants={containerVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }}>
            <Card className="bg-black/60 backdrop-blur-md border-white/20">
              <CardHeader>
                <div className={sectionTitleWrap}>
                  <CardTitle className="text-white">Section 2 — Product Details</CardTitle>
                </div>
                <CardDescription className="text-white/80">Tell us about your AI product or service.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="productName" className="text-white/90">Name of Product / Service / Tool</Label>
                                      <Input
                      id="productName"
                      placeholder="e.g., AI Content Writer Pro"
                      className="bg-black/40 border-white/20 text-white placeholder:text-white/50"
                      {...form.register("productName")}
                    />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline" className="text-white/90">One-Line Tagline (Max 150 characters)</Label>
                  <Input
                    id="tagline"
                    placeholder="Revolutionary AI-powered content creation"
                    maxLength={150}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    {...form.register("tagline")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white/90">Detailed Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What it does, who it helps, unique value proposition..."
                    rows={4}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    {...form.register("description")}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/90">Key Features (up to 5)</Label>
                  {features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Feature ${index + 1}`}
                        value={feature}
                        onChange={(e) => {
                          const newFeatures = [...features];
                          newFeatures[index] = e.target.value;
                          setFeatures(newFeatures);
                          form.setValue("features", newFeatures);
                        }}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                      {features.length > 1 && (
                        <Button type="button" variant="outline" size="sm" onClick={() => removeFeature(index)} className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30">
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  {features.length < MAX_FEATURES && (
                    <Button type="button" variant="outline" onClick={addFeature} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                      Add Feature
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="section-3" variants={containerVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }}>
            <Card className="bg-black/60 backdrop-blur-md border-white/20">
              <CardHeader>
                <div className={sectionTitleWrap}>
                  <CardTitle className="text-white">Section 3 — Pricing & Access</CardTitle>
                </div>
                <CardDescription className="text-white/80">How do users access your product?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white/90">Pricing Model (choose all that apply)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRICING_MODELS.map(model => (
                      <label key={model} className="flex items-center space-x-2">
                        <Checkbox
                          checked={form.watch("pricingModels")?.includes(model) || false}
                          onCheckedChange={(checked) => {
                            const current = form.watch("pricingModels") || [];
                            if (checked) {
                              form.setValue("pricingModels", [...current, model]);
                            } else {
                              form.setValue("pricingModels", current.filter(m => m !== model));
                            }
                          }}
                        />
                        <span className="text-white/90 text-sm">{model}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceTiers" className="text-white/90">Price Range / Tiers</Label>
                  <Textarea
                    id="priceTiers"
                    placeholder="List each plan with price & features..."
                    rows={3}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    {...form.register("priceTiers")}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/90">Free Trial Available?</Label>
                    <Select onValueChange={(value) => form.setValue("freeTrial", value as "Yes" | "No")}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/90">Demo Available?</Label>
                    <Select onValueChange={(value) => form.setValue("demoAvailable", value as "Yes" | "No")}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="section-4" variants={containerVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }}>
            <Card className="bg-black/60 backdrop-blur-md border-white/20">
              <CardHeader>
                <div className={sectionTitleWrap}>
                  <CardTitle className="text-white">Section 4 — Media & Links</CardTitle>
                </div>
                <CardDescription className="text-white/80">Share media and additional resources.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="demoVideo" className="text-white/90">Product Demo Video Link (optional)</Label>
                  <Input
                    id="demoVideo"
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    {...form.register("demoVideo")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="caseStudies" className="text-white/90">Case Studies / Testimonials (optional)</Label>
                  <Textarea
                    id="caseStudies"
                    placeholder="Links to case studies, testimonials, or success stories..."
                    rows={3}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    {...form.register("caseStudies")}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key="section-5" variants={containerVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }}>
            <Card className="bg-black/60 backdrop-blur-md border-white/20">
              <CardHeader>
                <div className={sectionTitleWrap}>
                  <CardTitle className="text-white">Section 5 — Additional Information</CardTitle>
                </div>
                <CardDescription className="text-white/80">Tell us more about your company and technology.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="usp" className="text-white/90">Unique Selling Point</Label>
                  <Textarea
                    id="usp"
                    placeholder="Why should someone choose you over others?"
                    rows={3}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    {...form.register("usp")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="launchDate" className="text-white/90">Launch Date / Year Founded</Label>
                  <Input
                    id="launchDate"
                    placeholder="e.g., 2023, Q2 2024, or specific date"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    {...form.register("launchDate")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aiTechUsed" className="text-white/90">AI Technology Used</Label>
                  <Input
                    id="aiTechUsed"
                    placeholder="e.g., GPT-4, custom LLM, computer vision, etc."
                    className="bg-white/10 border-white/10 border-white/20 text-white placeholder:text-white/50"
                    {...form.register("aiTechUsed")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roadmap" className="text-white/90">Future Roadmap (optional)</Label>
                  <Textarea
                    id="roadmap"
                    placeholder="Short description of what's coming next..."
                    rows={3}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    {...form.register("roadmap")}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 6 && (
          <motion.div key="section-6" variants={containerVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }}>
            <Card className="bg-black/60 backdrop-blur-md border-white/20">
              <CardHeader>
                <div className={sectionTitleWrap}>
                  <CardTitle className="text-white">Section 6 — Verification & Agreement</CardTitle>
                </div>
                <CardDescription className="text-white/80">Final confirmation and terms.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={form.watch("confirmAccuracy") || false}
                      onCheckedChange={(checked) => form.setValue("confirmAccuracy", checked as boolean)}
                    />
                    <span className="text-white/90 text-sm">I confirm that the information provided is accurate.</span>
                  </label>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={form.watch("agreeTerms") || false}
                      onCheckedChange={(checked) => form.setValue("agreeTerms", checked as boolean)}
                    />
                    <span className="text-white/90 text-sm">I agree to the Terms & Conditions & Privacy Policy.</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      {step > 1 && step < 6 && (
        <WizardNav onBack={prevStep} onNext={nextStep} />
      )}

      {/* Final Submit */}
      {step === 6 && (
        <div className="flex justify-center space-x-4">
          <Button type="button" variant="outline" onClick={prevStep} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            Back
          </Button>
          <Button type="submit" className="bg-white text-black hover:bg-white/90">
            Submit Listing
          </Button>
        </div>
      )}

      {/* Step 1 Next Button */}
      {step === 1 && (
        <div className="flex justify-center">
          <Button type="button" onClick={nextStep} className="bg-white text-black hover:bg-white/90">
            Next
          </Button>
        </div>
      )}
    </form>
  );
}

function WizardNav({ onBack, onNext, nextLabel = "Next" }: { onBack: () => void; onNext: () => void; nextLabel?: string }) {
  return (
    <div className="flex justify-between items-center pt-4">
      <Button type="button" variant="outline" onClick={onBack} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
        Back
      </Button>
      <Button type="button" onClick={onNext} className="bg-white text-black hover:bg-white/90">
        {nextLabel}
      </Button>
    </div>
  );
} 