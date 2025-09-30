"use client";

/* File Overview
  Path: client/src/pages/onboarding.tsx
  Purpose: Onboarding wizard with a pre-step (login/signup) and multi-step sections. Each
  section appears one at a time with animated transitions and Next/Back navigation.

  Reading tip for newcomers:
  - Uses react-hook-form + zod for validation and framer-motion for transitions
  - Steps are validated incrementally via form.trigger on relevant fields
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
import { useNavigation } from "@/hooks/use-navigation";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { FirebaseUserService } from "@/services/firebase-user-service";

import { FcGoogle } from "react-icons/fc";
import { Rocket, Building2, User2 } from "lucide-react";

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

const sectionTitleWrap = "inline-block bg-white/10 backdrop-blur-md rounded-xl px-3 py-1";
const glassCard = "bg-white/10 backdrop-blur-md border border-white/20";
const authPrimaryBtn = "bg-blue-600 hover:bg-blue-500 text-white rounded-lg";
const inputSoft = "bg-black/40 border-white/10 text-white placeholder:text-white/60";

export default function OnboardingPage() {
  const { toast } = useToast();
  const { signIn, signUp, signInWithGoogle, currentUser } = useFirebaseAuth();
  const { navigateWithLoading } = useNavigation();

  // Step state: 0 = Auth, 1..6 = sections, 7 = final submit
  const [step, setStep] = useState<number>(0);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [featureInput, setFeatureInput] = useState("");
  const businessRoles = useMemo(() => [
    "Startup",
    "Company / Enterprise",
    "Agency",
  ] as const, []);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      features: [],
      primaryUseCases: [],
      pricingModels: [],
      freeTrial: "No",
      demoAvailable: "No",
      confirmAccuracy: false,
      agreeTerms: false,
    },
    mode: "onChange",
  });

  const addFeature = () => {
    const next = featureInput.trim();
    if (!next) return;
    const current = form.getValues("features") || [];
    if (current.length >= MAX_FEATURES) return;
    if (current.includes(next)) return;
    form.setValue("features", [...current, next]);
    setFeatureInput("");
  };

  const removeFeature = (index: number) => {
    const current = form.getValues("features") || [];
    form.setValue("features", current.filter((_, i) => i !== index));
  };

  const authLogin = async (email: string, password: string) => {
    if (!email || !password) {
      toast({ title: "Missing info", description: "Please enter email and password.", variant: "destructive" });
      return;
    }
    
    const result = await signIn(email, password);
    if (result.success) {
      toast({ title: "Logged in", description: "Welcome back!" });
      navigateWithLoading('/dashboard');
    } else {
      toast({ title: "Login failed", description: result.error || "Invalid credentials.", variant: "destructive" });
    }
  };

  const authSignup = async (name: string, email: string, password: string, role: string, companyName?: string, companyWebsite?: string, linkedinUrl?: string) => {
    if (!name || !email || !password) {
      toast({ title: "Missing info", description: "Please fill out all fields.", variant: "destructive" });
      return;
    }
    
    const result = await signUp(email, password, name);
    if (result.success) {
      toast({ title: "Account created", description: "Welcome! Your account has been created." });
      // remember chosen role in the form for conditional fields
      const mappedProfile: any = role === "Freelancer / Individual Creator" ? "Freelancer / Individual Creator" : "Startup";
      form.setValue("profileType", mappedProfile);
      navigateWithLoading("/dashboard");
    } else {
      // If email already exists, suggest switching to login
      if (result.error?.includes('already registered')) {
        toast({ 
          title: "Email already registered", 
          description: "This email is already registered. Please try logging in instead.", 
          variant: "destructive"
        });
        // Automatically switch to login mode
        setTimeout(() => setAuthMode("login"), 2000);
      } else {
        toast({ title: "Signup failed", description: result.error || "Failed to create account.", variant: "destructive" });
      }
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
    // Validate current step fields before moving forward (skip step 0 auth)
    if (step >= 1 && step <= 6) {
      const fields = stepFieldsFor(step);
      const valid = await form.trigger(fields as any, { shouldFocus: true });
      if (!valid) return;
    }
    setStep(Math.min(step + 1, 7));
  };

  const prevStep = () => setStep(Math.max(step - 1, 0));

  const onSubmit = async (data: OnboardingFormData) => {
    if (!currentUser) {
      toast({ title: "Authentication required", description: "Please log in to submit.", variant: "destructive" });
      return;
    }
    
    try {
      const submissionResult = await FirebaseUserService.submitOnboarding({status: "pending", 
        userId: currentUser.uid,
        userEmail: currentUser.email || '',
        profileType: data.profileType,
        listType: data.listType,
        companyName: data.companyName,
        fullName: data.fullName,
        contactEmail: data.contactEmail,
        websiteUrl: data.websiteUrl,
        socialLink: data.socialLink,
        productName: data.productName,
        tagline: data.tagline,
        description: data.description,
        features: data.features || [],
        primaryUseCases: data.primaryUseCases,
        industriesServed: data.industriesServed,
        targetAudience: data.targetAudience,
        pricingModels: data.pricingModels,
        priceTiers: data.priceTiers,
        freeTrial: data.freeTrial,
        freeTrialDuration: data.freeTrialDuration,
        demoAvailable: data.demoAvailable,
        demoLink: data.demoLink,
        demoVideo: data.demoVideo,
        caseStudies: data.caseStudies,
        usp: data.usp,
        launchDate: data.launchDate,
        achievements: data.achievements,
        aiTechUsed: data.aiTechUsed,
        roadmap: data.roadmap
      });
      
      if (submissionResult.success) {
        toast({ title: "Submitted", description: "Thanks! We will review your submission." });
        form.reset();
        navigateWithLoading("/dashboard");
      } else {
        toast({ title: "Submission failed", description: submissionResult.error || "Please try again.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    }
  };

  const containerVariants = {
    initial: { opacity: 0, filter: "blur(8px)", y: 16 },
    animate: { opacity: 1, filter: "blur(0px)", y: 0 },
    exit: { opacity: 0, filter: "blur(12px)", y: -16 },
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="text-center">
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-firequest mb-2">Welcome to Quantize!</h1>
        <p className="text-white/80 mb-8">Create an account or log in to list your AI products, services, or solutions.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="auth-step" variants={containerVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }}>
              <Card className={`${glassCard} max-w-lg mx-auto rounded-2xl shadow-xl` }>
                <CardHeader className="text-center space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                    <span className="text-white/80 font-semibold">AI</span>
                  </div>
                  <CardTitle className="text-3xl">{authMode === "login" ? "Welcome Back" : "Create Account"}</CardTitle>
                  <CardDescription>
                    {authMode === "login" ? (
                      <span>
                        Don’t have an account yet?{" "}
                        <button type="button" className="text-blue-400 hover:text-blue-300 underline underline-offset-4" onClick={() => setAuthMode("signup")}>Sign up</button>
                      </span>
                    ) : (
                      <span>
                        Already have an account?{" "}
                        <button type="button" className="text-blue-400 hover:text-blue-300 underline underline-offset-4" onClick={() => setAuthMode("login")}>Log in</button>
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {authMode === "login" ? (
                    <LoginPanel onLogin={authLogin} />
                  ) : (
                    <SignupPanel onSignup={authSignup} />
                  )}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"/></div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-transparent px-2 text-white/60">or</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="bg-white text-black border-white/10" 
                      aria-label="Continue with Google"
                      onClick={async () => {
                        const result = await signInWithGoogle();
                        if (result.success) {
                          toast({ title: "Signed in", description: "Welcome!" });
                          navigateWithLoading('/dashboard');
                        } else {
                          toast({ title: "Google sign-in failed", description: result.error || "Please try again.", variant: "destructive" });
                        }
                      }}
                    >
                      <FcGoogle className="w-5 h-5 mr-2" />
                      Continue with Google
                    </Button>
                  </div>

                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="section-1" variants={containerVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }}>
              <Card className={`${glassCard} max-w-3xl mx-auto rounded-2xl shadow-xl`}>
                <CardHeader>
                  <div className={sectionTitleWrap}>
                    <CardTitle>Section 1 — Listing Type</CardTitle>
                  </div>
                  <CardDescription>Choose what you want to list.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>What would you like to list?</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {["AI Tool", "AI Product", "AI Solution / Service", "Other"].map(opt => (
                        <label key={opt} className="flex items-center space-x-2">
                          <input className="accent-purple-500" type="radio" value={opt} checked={form.watch("listType") === opt} onChange={() => form.setValue("listType", opt as any)} />
                          <span className="text-white/90 text-sm">{opt}</span>
                        </label>
                      ))}
                    </div>
                    {form.watch("listType") === "Other" && (
                      <Input placeholder="Please specify" {...form.register("listTypeOther")} />
                    )}
                  </div>
                </CardContent>
              </Card>
              <WizardNav onBack={prevStep} onNext={nextStep} />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="section-2" variants={containerVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }}>
              <Card className={`${glassCard} max-w-3xl mx-auto rounded-2xl shadow-xl`}>
                <CardHeader>
                  <div className={sectionTitleWrap}>
                    <CardTitle>Section 2 — Product / Service Details</CardTitle>
                  </div>
                  <CardDescription>Help others understand your offering.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name of Product / Service / Tool</Label>
                      <Input placeholder="Your product name" {...form.register("productName")} />
                    </div>
                    <div className="space-y-2">
                      <Label>One-Line Tagline (Max 150 characters)</Label>
                      <Input maxLength={150} placeholder="Say it in one line" {...form.register("tagline")} />
                      <p className="text-xs text-muted-foreground">{form.watch("tagline")?.length || 0}/150</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Detailed Description</Label>
                    <Textarea rows={6} placeholder="What it does, who it helps, unique value proposition" {...form.register("description")} />
                  </div>

                  <div className="space-y-2">
                    <Label>Key Features (up to 5)</Label>
                    <div className="flex gap-2">
                      <Input value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} placeholder="Add a feature and press +" />
                      <Button type="button" variant="outline" onClick={addFeature} disabled={!featureInput.trim() || (form.watch("features")?.length || 0) >= MAX_FEATURES}>+</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(form.watch("features") || []).map((f, idx) => (
                        <span key={idx} className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                          {f}
                          <button type="button" className="opacity-70 hover:opacity-100" onClick={() => removeFeature(idx)}>
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    {form.formState.errors.features && (<p className="text-sm text-destructive">{(form.formState.errors.features.message as string) || "Invalid features"}</p>)}
                  </div>

                  <div className="space-y-2">
                    <Label>Primary Use Case(s)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {USE_CASES.map((uc) => (
                        <label key={uc} className="flex items-center space-x-2">
                          <Checkbox
                            checked={!!form.watch("primaryUseCases")?.includes(uc)}
                            onCheckedChange={(checked) => {
                              const current = form.getValues("primaryUseCases") || [];
                              if (checked) form.setValue("primaryUseCases", [...current, uc]);
                              else form.setValue("primaryUseCases", current.filter((v) => v !== uc));
                            }}
                          />
                          <span className="text-white/90 text-sm">{uc}</span>
                        </label>
                      ))}
                    </div>
                    {form.watch("primaryUseCases")?.includes("Other") && (
                      <Input placeholder="Please specify" {...form.register("primaryUseCaseOther")} />
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Industries Served</Label>
                      <Input placeholder="e.g., healthcare, finance, retail" {...form.register("industriesServed")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Target Audience</Label>
                      <Input placeholder="e.g., SMBs, enterprises, solopreneurs" {...form.register("targetAudience")} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <WizardNav onBack={prevStep} onNext={nextStep} />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="section-3" variants={containerVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }}>
              <Card className={`${glassCard} max-w-3xl mx-auto rounded-2xl shadow-xl`}>
                <CardHeader>
                  <div className={sectionTitleWrap}>
                    <CardTitle>Section 3 — Pricing & Access</CardTitle>
                  </div>
                  <CardDescription>Tell us how people can try and buy.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Pricing Model (choose all that apply)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {PRICING_MODELS.map((p) => (
                        <label key={p} className="flex items-center space-x-2">
                          <Checkbox
                            checked={!!form.watch("pricingModels")?.includes(p)}
                            onCheckedChange={(checked) => {
                              const current = form.getValues("pricingModels") || [];
                              if (checked) form.setValue("pricingModels", [...current, p]);
                              else form.setValue("pricingModels", current.filter((v) => v !== p));
                            }}
                          />
                          <span className="text-white/90 text-sm">{p}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Price Range / Tiers</Label>
                    <Textarea rows={4} placeholder="List each plan with price & features" {...form.register("priceTiers")} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Free Trial Available?</Label>
                      <div className="flex items-center gap-4">
                        {["Yes", "No"].map(v => (
                          <label key={v} className="flex items-center gap-2">
                            <input className="accent-purple-500" type="radio" checked={form.watch("freeTrial") === v} onChange={() => form.setValue("freeTrial", v as any)} />
                            <span className="text-white/90 text-sm">{v}</span>
                          </label>
                        ))}
                      </div>
                      {form.watch("freeTrial") === "Yes" && (
                        <Input placeholder="Duration (e.g., 14 days)" {...form.register("freeTrialDuration")} />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Demo Available?</Label>
                      <div className="flex items-center gap-4">
                        {["Yes", "No"].map(v => (
                          <label key={v} className="flex items-center gap-2">
                            <input className="accent-purple-500" type="radio" checked={form.watch("demoAvailable") === v} onChange={() => form.setValue("demoAvailable", v as any)} />
                            <span className="text-white/90 text-sm">{v}</span>
                          </label>
                        ))}
                      </div>
                      {form.watch("demoAvailable") === "Yes" && (
                        <Input type="url" placeholder="Demo link" {...form.register("demoLink")} />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <WizardNav onBack={prevStep} onNext={nextStep} />
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="section-4" variants={containerVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }}>
              <Card className={`${glassCard} max-w-3xl mx-auto rounded-2xl shadow-xl`}>
                <CardHeader>
                  <div className={sectionTitleWrap}>
                    <CardTitle>Section 4 — Media & Links</CardTitle>
                  </div>
                  <CardDescription>Optional visuals and references.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Upload Logo (PNG/JPG)</Label>
                      <Input type="file" accept=".png,.jpg,.jpeg" />
                    </div>
                    <div className="space-y-2">
                      <Label>Upload Product Screenshots (up to 5)</Label>
                      <Input type="file" multiple accept=".png,.jpg,.jpeg" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Product Demo Video Link (optional)</Label>
                    <Input type="url" placeholder="https://..." {...form.register("demoVideo")} />
                  </div>

                  <div className="space-y-2">
                    <Label>Case Studies / Testimonials (links or notes)</Label>
                    <Textarea rows={4} placeholder="One per line (links or short notes)" {...form.register("caseStudies")} />
                  </div>
                </CardContent>
              </Card>
              <WizardNav onBack={prevStep} onNext={nextStep} />
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="section-5" variants={containerVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }}>
              <Card className={`${glassCard} max-w-3xl mx-auto rounded-2xl shadow-xl`}>
                <CardHeader>
                  <div className={sectionTitleWrap}>
                    <CardTitle>Section 5 — Additional Information</CardTitle>
                  </div>
                  <CardDescription>Anything else that helps us evaluate your listing.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Unique Selling Point</Label>
                    <Textarea rows={3} placeholder="Why should someone choose you over others?" {...form.register("usp")} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Launch Date / Year Founded</Label>
                      <Input placeholder="e.g., 2023 or 2024-07-01" {...form.register("launchDate")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Notable Achievements</Label>
                      <Input placeholder="awards, partnerships, media coverage" {...form.register("achievements")} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>AI Technology Used</Label>
                    <Input placeholder="e.g., GPT-4, custom LLM, computer vision" {...form.register("aiTechUsed")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Future Roadmap</Label>
                    <Textarea rows={3} placeholder="Short description of what’s coming next" {...form.register("roadmap")} />
                  </div>
                </CardContent>
              </Card>
              <WizardNav onBack={prevStep} onNext={nextStep} />
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="section-6" variants={containerVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }}>
              <Card className={`${glassCard} max-w-3xl mx-auto rounded-2xl shadow-xl`}>
                <CardHeader>
                  <div className={sectionTitleWrap}>
                    <CardTitle>Section 6 — Verification & Agreement</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <label className="flex items-center gap-2">
                    <Checkbox checked={form.watch("confirmAccuracy") || false} onCheckedChange={(v) => form.setValue("confirmAccuracy", !!v)} />
                    <span className="text-white/90 text-sm">I confirm that the information provided is accurate.</span>
                  </label>
                  {form.formState.errors.confirmAccuracy && (<p className="text-sm text-destructive">{form.formState.errors.confirmAccuracy.message?.toString()}</p>)}
                  <label className="flex items-center gap-2">
                    <Checkbox checked={form.watch("agreeTerms") || false} onCheckedChange={(v) => form.setValue("agreeTerms", !!v)} />
                    <span className="text-white/90 text-sm">I agree to the Terms & Conditions & Privacy Policy.</span>
                  </label>
                  {form.formState.errors.agreeTerms && (<p className="text-sm text-destructive">{form.formState.errors.agreeTerms.message?.toString()}</p>)}
                </CardContent>
              </Card>
              <WizardNav onBack={prevStep} onNext={nextStep} nextLabel="Review & Submit" />
            </motion.div>
          )}

          {step === 7 && (
            <motion.div key="submit-step" variants={containerVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }}>
              <Card className={`${glassCard} max-w-3xl mx-auto rounded-2xl shadow-xl`}>
                <CardHeader>
                  <div className={sectionTitleWrap}>
                    <CardTitle>Review</CardTitle>
                  </div>
                  <CardDescription>Looks good? Submit your listing for review.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-white/80 text-sm">You can go back to edit any section before submitting.</div>
                </CardContent>
              </Card>
              <div className="flex items-center justify-between mt-4">
                <Button type="button" variant="outline" onClick={prevStep}>Back</Button>
                <Button type="submit">Submit</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}

function WizardNav({ onBack, onNext, nextLabel = "Next" }: { onBack: () => void; onNext: () => void; nextLabel?: string }) {
  return (
    <div className="flex items-center justify-between mt-4">
      <Button type="button" variant="outline" onClick={onBack}>Back</Button>
      <Button type="button" onClick={onNext}>{nextLabel}</Button>
    </div>
  );
}

function LoginPanel({ onLogin }: { onLogin: (email: string, password: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Email</Label>
        <Input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Password</Label>
        <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div className="flex items-center justify-center">
        <Button type="button" variant="outline" className="bg-white text-black" onClick={() => onLogin(email, password)}>Login</Button>
      </div>
    </div>
  );
}

function SignupPanel({ onSignup }: { onSignup: (nameOrCompany: string, email: string, password: string, role: string, companyName?: string, companyWebsite?: string, linkedinUrl?: string) => void }) {
  const [role, setRole] = useState<string>("Freelancer / Individual Creator");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isFreelancer = role === "Freelancer / Individual Creator";

  const RoleTile = ({ id, label, icon: Icon }: { id: string; label: string; icon: any }) => (
    <button
      type="button"
      onClick={() => setRole(label)}
      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition ${
        role === label
          ? "bg-white text-black border-black/30"
          : "bg-white/10 backdrop-blur-md text-white border-white/20 hover:bg-white/20"
      }`}
      aria-pressed={role === label}
    >
      <Icon className={`w-4 h-4 ${role === label ? "text-black" : "text-white"}`} />
      <span className={`text-sm ${role === label ? "text-black" : "text-white/90"}`}>{label}</span>
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <RoleTile id="business" label="Startup / Agency / Company" icon={Rocket} />
        <RoleTile id="freelancer" label="Freelancer / Individual Creator" icon={User2} />
      </div>

      {isFreelancer ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Your Full Name</Label>
            <Input placeholder="Jane Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email address</Label>
            <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" placeholder="Create a strong password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Confirm password</Label>
            <Input type="password" placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Your Full Name</Label>
            <Input placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Company / Brand Name</Label>
            <Input placeholder="Acme AI" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Company Website</Label>
            <Input type="url" placeholder="https://acme.ai" value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>LinkedIn URL (optional)</Label>
            <Input type="url" placeholder="https://linkedin.com/company/acme-ai" value={companyUrl} onChange={(e) => setCompanyUrl(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Work email</Label>
            <Input type="email" placeholder="you@acme.ai" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" placeholder="Create a strong password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Confirm password</Label>
            <Input type="password" placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
        </div>
      )}

      <div className="flex items-center justify-center">
        <Button
          type="button"
          variant="outline"
          className="bg-white text-black"
          onClick={() => {
            // Validation
            if (!email || !password || !fullName || (!isFreelancer && !companyName)) {
              alert('Please fill in all required fields');
              return;
            }
            
            if (password !== confirmPassword) {
              alert('Passwords do not match');
              return;
            }
            
            if (password.length < 6) {
              alert('Password must be at least 6 characters long');
              return;
            }
            
            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
              alert('Please enter a valid email address');
              return;
            }
            
            onSignup(
              isFreelancer ? fullName : companyName, 
              email, 
              password, 
              role,
              isFreelancer ? undefined : companyName,
              isFreelancer ? undefined : companyWebsite,
              isFreelancer ? undefined : companyUrl
            );
          }}
        >
          Create account
        </Button>
      </div>
    </div>
  );
}

