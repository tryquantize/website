import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import '@/styles/custom-input.css';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, X, ChevronLeft, ChevronRight, Sparkles, Check, Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';

import { SectionBadge } from "@/components/ui/section-badge";
import { cn } from "@/lib/utils";

export default function AddCompanyPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isEnhancingDescription, setIsEnhancingDescription] = useState(false);
  const [isEsummitRoute, setIsEsummitRoute] = useState(false);

  // Check if accessed via /esummit route
  useEffect(() => {
    setIsEsummitRoute(window.location.pathname === '/esummit');
  }, []);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const changeStep = (newStep: number) => {
    setDirection(newStep > currentStep ? 1 : -1);
    setCurrentStep(newStep);
    // Scroll to top when changing steps - enhanced for mobile
    setTimeout(() => {
      // Try multiple scroll targets for mobile compatibility
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Also scroll the form container if it exists
      const scrollContainer = scrollContainerRef.current;
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 150);
  };

  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    linkedinPage: '',
    phoneNumber: '',
    email: '',
    founded: '',
    headquarters: '',
    products: [] as string[],
    description: '',
    category: '',
    employees: '',
    industriesServed: [] as string[],
    pricingRanges: [] as string[],
    pricingModel: [] as string[],
    features: '',
    useCases: '',
    testimonialPage: '',
    logo: null as File | null,
    companyStage: '',
    topClients: [] as string[],
    tagline: '',
    // New fields
    trialAvailable: false,
    customerSegments: [] as string[],
    uspTagline: '',
    deploymentType: [] as string[],
    idealScenarios: [] as string[],
    // VC Event Interest
    vcEventInterested: false,
    // Ecell Event Interest
    ecellEventInterested: false,
    ecellPreferredDates: [] as string[],
    // Founders
    founders: [] as Array<{ name: string; phone: string; email: string }>,
    // Pain Point
    painPoint: ''
  });

  const [newProduct, setNewProduct] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [newUseCase, setNewUseCase] = useState('');
  const [newClient, setNewClient] = useState('');
  const [newFounder, setNewFounder] = useState({ name: '', phone: '', email: '' });
  const [isEnhancing, setIsEnhancing] = useState({
    product: false,
    feature: false,
    useCase: false,
    client: false
  });

  const employeeOptions = [
    '0-1', '2-10', '10-50', '50-200', '200-500', '500-1000', '1000-5000', '5000-10000', '10000+'
  ];

  const industryOptions = [
    'Healthcare', 'Fintech', 'EdTech', 'Retail', 'E-commerce', 'SaaS', 'Manufacturing',
    'Real Estate', 'Automotive', 'Agriculture', 'Energy', 'Entertainment', 'Gaming',
    'Media', 'Publishing', 'Telecommunications', 'Transportation', 'Logistics',
    'Construction', 'Legal', 'Consulting', 'Marketing', 'Advertising', 'HR',
    'Recruitment', 'Insurance', 'Banking', 'Investment', 'Cryptocurrency',
    'Blockchain', 'IoT', 'Cybersecurity', 'Cloud Computing', 'DevOps', 'AI/ML',
    'Data Analytics', 'Business Intelligence', 'CRM', 'ERP', 'Supply Chain',
    'Food & Beverage', 'Fashion', 'Beauty', 'Travel', 'Hospitality', 'Sports',
    'Fitness', 'Non-profit', 'Government', 'Defense', 'Aerospace'
  ];

  const pricingModelOptions = [
    'Subscription', 'Usage-based', 'Freemium', 'Custom Quote', 'One-time Purchase', 'Tiered Pricing'
  ];

  const companyStageOptions = [
    'Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Bootstrapped', 'Public', 'Acquired'
  ];

  const customerSegmentOptions = [
    'B2B', 'B2C', 'D2C', 'B2B2C'
  ];

  const deploymentTypeOptions = [
    'Cloud', 'On-premise', 'Hybrid', 'SaaS', 'API'
  ];

  const idealScenarioOptions = [
    'SMBs', 'Enterprises', 'Startups', 'Mid-market', 'Fortune 500', 'Government', 'Non-profit', 'Educational'
  ];

  const pricingOptions = [
    '<$100', '$100-$500', '$500-$1,000', '$1,000-$2,500', '$2,500-$5,000', '$5,000-$10,000',
    '$10,000-$25,000', '$25,000-$50,000', '$50,000-$100,000', '$100,000-$250,000',
    '$250,000-$500,000', '$500,000-$1,000,000', '$1,000,000-$2,500,000', '$2,500,000+', 'Contact for pricing'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addItem = (type: 'products' | 'features' | 'useCases' | 'topClients', value: string) => {
    if (!value.trim()) return;

    if (type === 'features' || type === 'useCases') {
      setFormData(prev => ({
        ...prev,
        [type]: prev[type] ? `${prev[type]}\n${value.trim()}` : value.trim()
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [type]: [...(prev[type] as string[]), value.trim()]
      }));
    }

    if (type === 'products') setNewProduct('');
    if (type === 'features') setNewFeature('');
    if (type === 'useCases') setNewUseCase('');
    if (type === 'topClients') setNewClient('');
  };

  const removeItem = (type: 'products' | 'topClients', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: (prev[type] as string[]).filter((_, i) => i !== index)
    }));
  };

  const addPricingRange = (range: string) => {
    if (!formData.pricingRanges.includes(range)) {
      setFormData(prev => ({
        ...prev,
        pricingRanges: [...prev.pricingRanges, range]
      }));
    }
  };

  const removePricingRange = (range: string) => {
    setFormData(prev => ({
      ...prev,
      pricingRanges: prev.pricingRanges.filter(r => r !== range)
    }));
  };

  const addIndustry = (industry: string) => {
    if (!formData.industriesServed.includes(industry)) {
      setFormData(prev => ({
        ...prev,
        industriesServed: [...prev.industriesServed, industry]
      }));
    }
  };

  const removeIndustry = (industry: string) => {
    setFormData(prev => ({
      ...prev,
      industriesServed: prev.industriesServed.filter(i => i !== industry)
    }));
  };

  const addPricingModel = (model: string) => {
    if (!formData.pricingModel.includes(model)) {
      setFormData(prev => ({
        ...prev,
        pricingModel: [...prev.pricingModel, model]
      }));
    }
  };

  const removePricingModel = (model: string) => {
    setFormData(prev => ({
      ...prev,
      pricingModel: prev.pricingModel.filter(m => m !== model)
    }));
  };

  const addCustomerSegment = (segment: string) => {
    if (!formData.customerSegments.includes(segment)) {
      setFormData(prev => ({
        ...prev,
        customerSegments: [...prev.customerSegments, segment]
      }));
    }
  };

  const removeCustomerSegment = (segment: string) => {
    setFormData(prev => ({
      ...prev,
      customerSegments: prev.customerSegments.filter(s => s !== segment)
    }));
  };

  const addDeploymentType = (type: string) => {
    if (!formData.deploymentType.includes(type)) {
      setFormData(prev => ({
        ...prev,
        deploymentType: [...prev.deploymentType, type]
      }));
    }
  };

  const removeDeploymentType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      deploymentType: prev.deploymentType.filter(t => t !== type)
    }));
  };

  const addIdealScenario = (scenario: string) => {
    if (!formData.idealScenarios.includes(scenario)) {
      setFormData(prev => ({
        ...prev,
        idealScenarios: [...prev.idealScenarios, scenario]
      }));
    }
  };

  const removeIdealScenario = (scenario: string) => {
    setFormData(prev => ({
      ...prev,
      idealScenarios: prev.idealScenarios.filter(s => s !== scenario)
    }));
  };

  const addEcellPreferredDate = (date: string) => {
    if (!formData.ecellPreferredDates.includes(date)) {
      setFormData(prev => ({
        ...prev,
        ecellPreferredDates: [...prev.ecellPreferredDates, date]
      }));
    }
  };

  const removeEcellPreferredDate = (date: string) => {
    setFormData(prev => ({
      ...prev,
      ecellPreferredDates: prev.ecellPreferredDates.filter(d => d !== date)
    }));
  };

  const addFounder = () => {
    if (!newFounder.name.trim() || !newFounder.email.trim() || !newFounder.phone.trim()) {
      toast({
        title: 'Missing Founder Details',
        description: 'Please fill in all founder fields (name, email, and phone).',
        variant: 'destructive'
      });
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      founders: [...prev.founders, { ...newFounder }]
    }));
    setNewFounder({ name: '', phone: '', email: '' });
  };

  const removeFounder = (index: number) => {
    setFormData(prev => ({
      ...prev,
      founders: prev.founders.filter((_, i) => i !== index)
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, logo: file }));
    }
  };

  const enhanceText = async (text: string, type: 'product' | 'feature' | 'useCase' | 'client') => {
    if (!text.trim()) return;

    setIsEnhancing(prev => ({ ...prev, [type]: true }));

    try {
      const response = await fetch('https://website-ocrz.onrender.com/enhance-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          type,
          context: {
            companyName: formData.companyName,
            category: formData.category,
            description: formData.description
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.enhancedText) {
          if (type === 'product') setNewProduct(result.enhancedText);
          if (type === 'feature') {
            setFormData(prev => ({ ...prev, features: result.enhancedText }));
          }
          if (type === 'useCase') {
            setFormData(prev => ({ ...prev, useCases: result.enhancedText }));
          }
          if (type === 'client') setNewClient(result.enhancedText);

          toast({
            title: 'Text Enhanced!',
            description: 'Your text has been improved with AI assistance.',
          });
        } else {
          throw new Error(result.error || result.message || 'Enhancement failed');
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
      }
    } catch (error) {
      toast({
        title: 'Enhancement Failed',
        description: 'Could not enhance text. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsEnhancing(prev => ({ ...prev, [type]: false }));
    }
  };

  const enhanceDescription = async () => {
    if (!formData.description.trim()) {
      toast({
        title: 'No Description',
        description: 'Please enter a description first.',
        variant: 'destructive'
      });
      return;
    }

    setIsEnhancingDescription(true);

    try {
      const response = await fetch('https://website-ocrz.onrender.com/enhance-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: formData.description,
          type: 'description',
          context: {
            companyName: formData.companyName,
            category: formData.category,
            website: formData.website
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.enhancedText) {
          setFormData(prev => ({ ...prev, description: result.enhancedText }));
          toast({
            title: 'Description Enhanced!',
            description: 'Your company description has been improved.',
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Enhancement Failed',
        description: 'Could not enhance description. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsEnhancingDescription(false);
    }
  };

  const steps = [
    { title: 'Basic Info', fields: ['companyName', 'website', 'linkedinPage'] },
    { title: 'Company Details', fields: ['phoneNumber', 'email', 'founded', 'headquarters', 'category', 'employees', 'tagline', 'uspTagline'] },
    { title: 'Products & Description', fields: ['products', 'description'] },
    { title: 'Features & Use Cases', fields: ['features', 'useCases'] },
    { title: 'Business Details', fields: ['industriesServed', 'pricingRanges', 'pricingModel', 'companyStage'] },
    { title: 'Market & Deployment', fields: ['customerSegments', 'deploymentType', 'idealScenarios', 'trialAvailable'] },
    { title: 'Additional Info', fields: ['topClients', 'testimonialPage', 'logo'] }
  ];

  const handleAutoFill = async () => {
    if (!formData.companyName || !formData.website) {
      toast({
        title: 'Missing Information',
        description: 'Please enter company name and website before auto-filling.',
        variant: 'destructive'
      });
      return;
    }

    setIsAutoFilling(true);

    try {
      const response = await fetch('https://website-ocrz.onrender.com/auto-fill-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: formData.companyName,
          website: formData.website,
          linkedinPage: formData.linkedinPage || ''
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        setFormData(prev => {
          let productsArray = prev.products;
          if (result.data.products && Array.isArray(result.data.products)) {
            productsArray = result.data.products.map((product: any) =>
              typeof product === 'string' ? product :
                (product.name && product.description ? `${product.name}: ${product.description}` :
                  product.name || product.description || product)
            );
          } else if (result.data.productsServices && Array.isArray(result.data.productsServices)) {
            productsArray = result.data.productsServices;
          }

          let featuresText = prev.features;
          if (result.data.features) {
            if (Array.isArray(result.data.features)) {
              featuresText = result.data.features.join(', ');
            } else if (typeof result.data.features === 'string') {
              featuresText = result.data.features;
            }
          }

          let useCasesText = prev.useCases;
          if (result.data.useCases) {
            if (Array.isArray(result.data.useCases)) {
              useCasesText = result.data.useCases.join(', ');
            } else if (typeof result.data.useCases === 'string') {
              useCasesText = result.data.useCases;
            }
          }

          return {
            ...prev,
            description: result.data.description || prev.description,
            category: result.data.category || prev.category,
            founded: result.data.founded || prev.founded,
            headquarters: result.data.headquarters || result.data.location || prev.headquarters,
            employees: result.data.employees || prev.employees,
            features: featuresText,
            useCases: useCasesText,
            tagline: result.data.tagline || prev.tagline,
            uspTagline: result.data.uspTagline || prev.uspTagline,
            products: productsArray,
            industriesServed: result.data.industriesServed || prev.industriesServed,
            pricingRanges: result.data.pricingRanges || prev.pricingRanges,
            pricingModel: result.data.pricingModel || prev.pricingModel,
            topClients: result.data.topClients || prev.topClients,
            customerSegments: result.data.customerSegments || prev.customerSegments,
            deploymentType: result.data.deploymentType || prev.deploymentType,
            idealScenarios: result.data.idealScenarios || prev.idealScenarios,
            trialAvailable: result.data.trialAvailable || prev.trialAvailable,
            phoneNumber: result.data.phoneNumber || prev.phoneNumber,
            companyStage: result.data.companyStage || prev.companyStage
          };
        });

        toast({
          title: 'Success!',
          description: `Company details auto-filled successfully from ${result.sources_used?.join(', ') || 'available sources'}. Please review and modify as needed.`,
        });

        setCurrentStep(1);
      } else {
        throw new Error(result.error || result.message || 'Auto-fill returned no data');
      }
    } catch (error) {
      toast({
        title: 'Auto-fill Failed',
        description: error instanceof Error ? error.message : 'Please fill the form manually.',
        variant: 'destructive'
      });
    } finally {
      setIsAutoFilling(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      changeStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      changeStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!formData.companyName || !formData.website || !formData.description || !formData.category) {
        toast({
          title: 'Missing Required Fields',
          description: 'Please fill in company name, website, description, and category.',
          variant: 'destructive'
        });
        return;
      }

      if (formData.products.length === 0) {
        toast({
          title: 'Products Required',
          description: 'Please add at least one product or service.',
          variant: 'destructive'
        });
        return;
      }

      if (formData.founders.length === 0) {
        toast({
          title: 'Founders Required',
          description: 'Please add at least one founder with complete details.',
          variant: 'destructive'
        });
        return;
      }

      // Check if accessed via /esummit route and E-Cell interest is required
      if (isEsummitRoute && !formData.ecellEventInterested) {
        toast({
          title: 'E-Cell Event Interest Required',
          description: 'Please select "Yes, I\'m interested" for the E-Cell event to continue.',
          variant: 'destructive'
        });
        return;
      }

      setIsSubmitting(true);

      const { logo, ...submissionData } = formData;

      const response = await fetch('https://website-ocrz.onrender.com/add-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });

      if (response.ok) {
        toast({
          title: 'Success!',
          description: 'Your company has been submitted for review.',
        });

        setTimeout(() => {
          setLocation('/');
        }, 1000);
      } else {
        const errorText = await response.text();
        throw new Error(`Submission failed: ${response.status}`);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit company. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // If it's a textarea, we might want to allow newlines, but for now let's just prevent submit
      // If we are in an input field that adds items (like products), that logic is handled in the specific input's onKeyDown

      // If we are not on the last step, we could optionally go to next step, 
      // but let's just prevent submission for now to be safe and avoid accidental skips.
      // If the user wants to go next, they should click next. 
      // OR we can make it go next if it's not a multiline text area.

      if (currentStep < steps.length - 1) {
        // Optional: nextStep(); 
        // But for "7/7" auto submit issue, preventing default is key.
      }
    }
  };

  // Scroll Indicators Logic - REMOVED per user request
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isStepComplete = (stepIdx: number) => {
    switch (stepIdx) {
      case 0: // Basic Info
        return !!formData.companyName && !!formData.website;
      case 1: // Company Details
        return !!formData.category && !!formData.email;
      case 2: // Products
        return formData.products.length > 0 && !!formData.description;
      case 3: // Features
        return !!formData.features || !!formData.useCases; // At least one
      case 4: // Business Details
        return formData.industriesServed.length > 0 || formData.pricingModel.length > 0 || !!formData.companyStage;
      case 5: // Market
        return formData.customerSegments.length > 0 || formData.deploymentType.length > 0;
      case 6: // Final
        return !!formData.logo || formData.topClients.length > 0 || !!formData.testimonialPage;
      default:
        return false;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen bg-black text-white selection:bg-blue-500/30 pt-[72px] lg:overflow-hidden">
      {/* Fixed Progress Bar (Header - Mobile Only) - REMOVED per user request to move to bottom */}
      {/* Left Panel - Sticky Info (Hidden on mobile to focus on form, or could be a summary) */}
      <div className="hidden lg:flex w-full lg:w-[35%] xl:w-[30%] relative flex-col px-8 lg:px-12 py-12 h-full bg-zinc-950 border-r border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex-none pb-8">
            <SectionBadge>PARTNER WITH US</SectionBadge>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mt-4 mb-4">Add Your Company</h1>
            <p className="text-white/60 text-lg leading-relaxed">
              Join our directory of innovative AI companies.
            </p>
          </div>

          {/* Vertical Stepper (Scrollable) */}
          <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col">
            <div className="py-12 space-y-6">
              {steps.map((step, idx) => {
                const isCompleted = isStepComplete(idx);
                const isActive = currentStep === idx;

                return (
                  <button
                    key={idx}
                    onClick={() => changeStep(idx)}
                    className="relative flex items-center gap-4 group text-left w-full hover:bg-white/5 p-2 rounded-xl transition-all duration-300"
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 z-10 border",
                      isActive ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-110" :
                        isCompleted ? "bg-zinc-800 border-zinc-700 text-green-400" :
                          "bg-transparent border-white/10 text-white/30 group-hover:border-white/30 group-hover:text-white/50"
                    )}>
                      {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                    </div>
                    <div className="flex flex-col">
                      <span className={cn(
                        "text-sm font-medium transition-colors duration-300",
                        isActive ? "text-white" :
                          isCompleted ? "text-white/80" :
                            "text-white/30 group-hover:text-white/50"
                      )}>
                        {step.title}
                      </span>
                    </div>
                    {idx !== steps.length - 1 && (
                      <div className={cn(
                        "absolute left-6 top-10 w-px h-6 -ml-px transition-colors duration-300",
                        isCompleted ? "bg-zinc-800" : "bg-white/5"
                      )} />
                    )}
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      </div>

      {/* Right Panel - Scrollable Form + Fixed Bottom Bar */}
      <div className="flex-1 relative bg-black h-auto lg:h-full flex flex-col lg:overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-soft-light"></div>

        {/* Scrollable Content */}
        <div
          ref={scrollContainerRef}
          className="flex-1 lg:overflow-y-auto scrollbar-hide relative z-10 overflow-x-hidden"
        >
          <div className="max-w-3xl mx-auto p-6 lg:p-12 pb-32">
            <form onKeyDown={handleKeyDown} className="grid grid-cols-1">
              <AnimatePresence mode="popLayout" custom={direction}>
                {/* Step 0: Basic Information */}
                {currentStep === 0 && (
                  <motion.div
                    key="step0"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="space-y-8 col-start-1 row-start-1 w-full"
                  >
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                      <p className="text-sm text-blue-200 flex gap-2">
                        <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Pro Tip:</strong> Enter your company name and website, then use our AI Auto-fill feature to populate the rest of the form automatically!
                        </span>
                      </p>
                    </div>

                    {/* Ecell IIT BHU Event Section */}
                    <div className="p-6 bg-zinc-900/50 border border-white/10 rounded-xl">
                      <div className="space-y-4">
                        {/* Event Header Image */}
                        <div className="relative w-full h-32 mb-4 rounded-lg overflow-hidden">
                          <img 
                            src="/BHLogo.png" 
                            alt="E-Cell IIT BHU Logo" 
                            className="w-full h-full object-contain bg-white/10"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>
                        
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs font-medium text-green-400 uppercase tracking-wider">Exclusive Collaboration</span>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-white mb-3">
                          🎓 Founder's Meet & Greet || E-Cell IIT BHU
                        </h3>
                        
                        <div className="space-y-3 text-sm text-white/70 leading-relaxed">
                          <p>
                            We are collaborating with <strong className="text-white">E-Cell IIT BHU</strong> to host an exclusive founder's meet and greet during their annual fest i.e E-Summit '26. This is a unique opportunity for founders to connect, share experiences, and build meaningful relationships within the startup ecosystem.
                          </p>
                          
                          <p>
                            This event is <strong className="text-white">exclusively for founders</strong> and will provide a platform for networking, knowledge sharing, and potential collaborations. Join us for an engaging session with fellow entrepreneurs and startup leaders.
                          </p>
                          
                          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                            <div className="grid grid-cols-1 gap-2 text-xs">
                              <div>
                                <span className="text-green-300 font-medium">📍 Location:</span>
                                <span className="text-white ml-1">GTAC Guest House, IIT BHU Varanasi</span>
                              </div>
                              <div>
                                <span className="text-green-300 font-medium">📅 Date & Time:</span>
                                <span className="text-white ml-1">31st January 2026 Saturday, 8 PM onwards</span>
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-xs">
                            This founder's meet and greet is part of E-Cell IIT BHU's annual fest and offers a great opportunity to connect with the vibrant startup community. The event will feature informal networking, experience sharing, and collaborative discussions.
                          </p>
                          
                          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <p className="text-xs text-green-200">
                              <strong>Contact for queries:</strong><br/>
                              📞 +91 80906 72982
                            </p>
                          </div>
                        </div>
                        

                        
                        <div className="flex items-center gap-3 pt-2">
                          <input
                            type="checkbox"
                            id="ecellEventInterested"
                            checked={formData.ecellEventInterested}
                            onChange={(e) => setFormData(prev => ({ ...prev, ecellEventInterested: e.target.checked }))}
                            className="w-4 h-4 rounded border-white/30 bg-white/10 text-green-600 focus:ring-green-500 focus:ring-offset-0"
                          />
                          <label htmlFor="ecellEventInterested" className="text-sm text-white font-medium cursor-pointer">
                            Yes, I'm interested
                          </label>
                        </div>
                        
                        {formData.ecellEventInterested && (
                          <p className="text-xs text-green-400 text-center">
                            ✓ We'll contact you with event details
                          </p>
                        )}
                      </div>
                    </div>

                    {!isEsummitRoute && (
                      /* VC Gathering Event Section */
                      <div className="p-6 bg-zinc-900/50 border border-white/10 rounded-xl">
                        <div className="space-y-4">
                          {/* Event Header Image */}
                          <div className="relative w-full h-32 mb-4 rounded-lg overflow-hidden">
                            <img 
                              src="/blr.png" 
                              alt="Bangalore City" 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          </div>
                          
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">Exclusive Opportunity</span>
                          </div>
                          
                          <h3 className="text-lg font-semibold text-white mb-3">
                            🚀 VC Gathering - Bangalore
                          </h3>
                          
                          <div className="space-y-3 text-sm text-white/70 leading-relaxed">
                            <p>
                              We are curating a small, invitation-only gathering of <strong className="text-white">~10 deep-tech and AI startups</strong> for an in-person interaction with global VCs from leading funds.
                            </p>
                            
                            <p>
                              The participating investors are US-based global VCs, several of whom are former serial entrepreneurs with successful technology exits. They are specifically interested in <strong className="text-white">deep-tech and AI startups</strong> working on hard-to-replicate, original ideas, with strong technical depth and long-term defensibility.
                            </p>
                            
                            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                              <div className="grid grid-cols-1 gap-2 text-xs">
                                <div>
                                  <span className="text-blue-300 font-medium">📍 Location:</span>
                                  <span className="text-white ml-1">Jayanagar, Bangalore</span>
                                </div>
                                <div>
                                  <span className="text-blue-300 font-medium">📅 Dates:</span>
                                  <span className="text-white ml-1">Between March 26 and April 13, 2026</span>
                                  <span className="text-white/60 block text-xs">(exact date to be confirmed)</span>
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-xs">
                              This is not a symposium or demo day. The format is informal and conversational, focused on direct interaction, idea discussion, and relationship-building with VCs. Where there is strong alignment, conversations may naturally progress toward potential investment.
                            </p>
                            
                            <p className="text-xs">
                              Participation will be selective to ensure meaningful engagement. Startups across institutes and ecosystems are welcome. <strong className="text-white">Shortlisted teams will be contacted with further details.</strong>
                            </p>
                            
                            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                              <p className="text-xs text-blue-200">
                                <strong>Contact for queries:</strong><br/>
                                📞 +91 80906 72982
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 pt-2">
                            <input
                              type="checkbox"
                              id="vcEventInterested"
                              checked={formData.vcEventInterested}
                              onChange={(e) => setFormData(prev => ({ ...prev, vcEventInterested: e.target.checked }))}
                              className="w-4 h-4 rounded border-white/30 bg-white/10 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                            />
                            <label htmlFor="vcEventInterested" className="text-sm text-white font-medium cursor-pointer">
                              Yes, I'm interested
                            </label>
                          </div>
                          
                          {formData.vcEventInterested && (
                            <p className="text-xs text-green-400 text-center">
                              ✓ We'll contact shortlisted teams with details
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Company Name <span className="text-red-400">*</span></label>
                        <Input
                          required
                          value={formData.companyName}
                          onChange={(e) => handleInputChange('companyName', e.target.value)}
                          className="h-14 bg-zinc-900/50 border-white/10 text-white placeholder:text-white/20 focus:border-white/30 transition-colors duration-200 rounded-xl focus:outline-none focus:ring-0"
                          placeholder="e.g., OpenAI"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Website <span className="text-red-400">*</span></label>
                        <Input
                          required
                          type="url"
                          value={formData.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          className="h-14 bg-zinc-900/50 border-white/10 text-white placeholder:text-white/20 focus:border-white/30 transition-colors duration-200 rounded-xl focus:outline-none focus:ring-0"
                          placeholder="https://yourcompany.com"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-medium text-white">LinkedIn Page</label>
                        <Input
                          type="url"
                          value={formData.linkedinPage}
                          onChange={(e) => handleInputChange('linkedinPage', e.target.value)}
                          className="h-14 bg-zinc-900/50 border-white/10 text-white placeholder:text-white/20 focus:border-white/30 transition-colors duration-200 rounded-xl focus:outline-none focus:ring-0"
                          placeholder="https://linkedin.com/company/yourcompany"
                        />
                      </div>
                    </div>

                    {/* Auto-fill Button */}
                    {formData.companyName && formData.website && (
                      <div className="flex flex-col items-center gap-4 pt-4">
                        <Button
                          type="button"
                          onClick={handleAutoFill}
                          disabled={isAutoFilling}
                          className="relative h-14 px-8 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
                          {isAutoFilling ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Analyzing Company Data...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5 mr-2" />
                              Auto-fill with AI
                            </>
                          )}
                        </Button>
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          <span>or</span>
                          <button
                            type="button"
                            onClick={() => changeStep(1)}
                            className="text-zinc-300 hover:text-white font-medium relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-px after:bg-white after:transition-all after:duration-300 hover:after:w-full"
                          >
                            continue manually
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 1: Company Details */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="space-y-8 col-start-1 row-start-1 w-full"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Phone Number</label>
                        <Input
                          type="tel"
                          value={formData.phoneNumber}
                          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                          className="h-14 bg-zinc-900/50 border-white/10 text-white placeholder:text-white/20 focus:border-white/30 transition-colors duration-200 rounded-xl focus:outline-none focus:ring-0"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Email Address <span className="text-red-400">*</span></label>
                        <Input
                          required
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="h-14 bg-zinc-900/50 border-white/10 text-white placeholder:text-white/20 focus:border-white/30 transition-colors duration-200 rounded-xl focus:outline-none focus:ring-0"
                          placeholder="contact@company.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Founded Year</label>
                        <Input
                          value={formData.founded}
                          onChange={(e) => handleInputChange('founded', e.target.value)}
                          className="h-14 bg-zinc-900/50 border-white/10 text-white placeholder:text-white/20 focus:border-white/30 transition-colors duration-200 rounded-xl focus:outline-none focus:ring-0"
                          placeholder="2023"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Headquarters</label>
                        <Input
                          value={formData.headquarters}
                          onChange={(e) => handleInputChange('headquarters', e.target.value)}
                          className="h-14 bg-zinc-900/50 border-white/10 text-white placeholder:text-white/20 focus:border-white/30 transition-colors duration-200 rounded-xl focus:outline-none focus:ring-0"
                          placeholder="San Francisco, CA"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Category <span className="text-red-400">*</span></label>
                        <Input
                          required
                          value={formData.category}
                          onChange={(e) => handleInputChange('category', e.target.value)}
                          className="h-14 bg-zinc-900/50 border-white/10 text-white placeholder:text-white/20 focus:border-white/30 transition-colors duration-200 rounded-xl focus:outline-none focus:ring-0"
                          placeholder="AI Platform, SaaS, etc."
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Employees</label>
                        <Select value={formData.employees} onValueChange={(val) => handleInputChange('employees', val)}>
                          <SelectTrigger className="h-14 bg-zinc-900/50 border-white/10 text-white rounded-xl focus:border-white/30 transition-colors duration-200 focus:outline-none focus:ring-0">
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent className="bg-black/90 border-white/20 text-white backdrop-blur-xl">
                            {employeeOptions.map(opt => (
                              <SelectItem key={opt} value={opt} className="focus:bg-white/10 focus:text-white">{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">
                        Company Tagline
                        <span className="block text-xs text-white/60 font-normal mt-1">A short, catchy phrase describing what you do</span>
                      </label>
                      <Input
                        value={formData.tagline}
                        onChange={(e) => handleInputChange('tagline', e.target.value)}
                        className="h-14 bg-zinc-900/50 border-white/10 text-white placeholder:text-white/20 focus:border-white/30 transition-colors duration-200 rounded-xl focus:outline-none focus:ring-0"
                        placeholder="e.g., 'AI for everyone'"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">
                        USP Tagline
                        <span className="block text-xs text-white/60 font-normal mt-1">What makes you unique?</span>
                      </label>
                      <Input
                        value={formData.uspTagline}
                        onChange={(e) => handleInputChange('uspTagline', e.target.value)}
                        className="h-14 bg-zinc-900/50 border-white/10 text-white placeholder:text-white/20 focus:border-white/30 transition-colors duration-200 rounded-xl focus:outline-none focus:ring-0"
                        placeholder="e.g., 'The fastest AI engine on the market'"
                      />
                    </div>

                    {/* Founders Section */}
                    <div className="space-y-4">
                      <label className="text-sm font-medium text-white">Founders <span className="text-red-400">*</span></label>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          required
                          value={newFounder.name}
                          onChange={(e) => setNewFounder(prev => ({ ...prev, name: e.target.value }))}
                          className="h-14 bg-zinc-900/50 border-white/10 text-white placeholder:text-white/20 focus:border-white/30 transition-colors duration-200 rounded-xl focus:outline-none focus:ring-0"
                          placeholder="Founder name *"
                        />
                        <Input
                          required
                          value={newFounder.phone}
                          onChange={(e) => setNewFounder(prev => ({ ...prev, phone: e.target.value }))}
                          className="h-14 bg-zinc-900/50 border-white/10 text-white placeholder:text-white/20 focus:border-white/30 transition-colors duration-200 rounded-xl focus:outline-none focus:ring-0"
                          placeholder="Phone number *"
                        />
                        <div className="flex gap-3">
                          <Input
                            required
                            value={newFounder.email}
                            onChange={(e) => setNewFounder(prev => ({ ...prev, email: e.target.value }))}
                            className="h-14 bg-zinc-900/50 border-white/10 text-white placeholder:text-white/20 focus:border-white/30 transition-colors duration-200 rounded-xl focus:outline-none focus:ring-0"
                            placeholder="Email address *"
                          />
                          <Button
                            type="button"
                            onClick={addFounder}
                            className="h-14 w-14 bg-white text-black hover:bg-gray-200 rounded-lg flex-shrink-0"
                          >
                            <Plus className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {formData.founders.length === 0 && (
                          <p className="text-red-400 text-sm p-4 bg-red-500/10 rounded-xl border border-red-500/20">Please add at least one founder</p>
                        )}
                        {formData.founders.map((founder, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex-1">
                              <p className="text-white font-medium">{founder.name}</p>
                              <p className="text-white/60 text-sm">{founder.email} • {founder.phone}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFounder(idx)}
                              className="text-white/60 hover:text-white transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pain Point Section */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">
                        What are you looking for? (Biggest pain point currently)
                        <span className="block text-xs text-white/60 font-normal mt-1">Help us understand your current challenges and needs</span>
                      </label>
                      <Textarea
                        value={formData.painPoint}
                        onChange={(e) => handleInputChange('painPoint', e.target.value)}
                        className="min-h-[120px] bg-zinc-900/50 border-white/10 text-white placeholder:text-white/20 focus:border-white/30 transition-colors duration-200 resize-none rounded-xl focus:outline-none focus:ring-0"
                        placeholder="e.g., Looking for funding, need technical co-founder, seeking market validation, scaling challenges, etc."
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Products & Description */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="space-y-8 col-start-1 row-start-1 w-full"
                  >
                    <div className="space-y-4">
                      <label className="text-sm font-medium text-white">Products / Services <span className="text-red-400">*</span></label>
                      <div className="flex gap-3">
                        <Input
                          value={newProduct}
                          onChange={(e) => setNewProduct(e.target.value)}
                          className="h-14 bg-zinc-900/50 border-white/10 text-white placeholder:text-white/20 focus:border-white/30 transition-colors duration-200 rounded-xl focus:outline-none focus:ring-0"
                          placeholder="Add a product..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addItem('products', newProduct);
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={() => addItem('products', newProduct)}
                          className="h-14 w-14 bg-white text-black hover:bg-gray-200 rounded-lg flex-shrink-0"
                        >
                          <Plus className="w-5 h-5" />
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2 min-h-[40px] p-4 bg-white/10 border border-white/20 rounded-xl">
                        {formData.products.length === 0 && (
                          <span className="text-white/50 text-sm italic">No products added yet</span>
                        )}
                        {formData.products.map((item, idx) => (
                          <span key={idx} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0071e3]/20 text-blue-200 text-sm border border-[#0071e3]/30">
                            {item}
                            <button
                              type="button"
                              onClick={() => removeItem('products', idx)}
                              className="hover:text-white transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-white">Description <span className="text-red-400">*</span></label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={enhanceDescription}
                          disabled={isEnhancingDescription || !formData.description}
                          className="relative overflow-hidden group bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 hover:from-indigo-500/20 hover:via-purple-500/20 hover:to-pink-500/20 border border-white/10 hover:border-white/20 transition-all duration-300"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
                          <span className="relative flex items-center gap-2 bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent font-medium">
                            {isEnhancingDescription ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-300" />
                            ) : (
                              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                            )}
                            Enhance with AI
                          </span>
                        </Button>
                      </div>
                      <Textarea
                        required
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className="min-h-[200px] bg-zinc-900/50 border-white/10 text-white placeholder:text-white/20 focus:border-white/30 transition-colors duration-200 resize-none rounded-xl focus:outline-none focus:ring-0"
                        placeholder="Describe your company, mission, and what makes you special..."
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Features & Use Cases */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="space-y-8 col-start-1 row-start-1 w-full"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-white">Key Features</label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => enhanceText(formData.features, 'feature')}
                          disabled={isEnhancing.feature || !formData.features}
                          className="relative overflow-hidden group bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 hover:from-indigo-500/20 hover:via-purple-500/20 hover:to-pink-500/20 border border-white/10 hover:border-white/20 transition-all duration-300"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
                          <span className="relative flex items-center gap-2 bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent font-medium">
                            {isEnhancing.feature ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-300" />
                            ) : (
                              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                            )}
                            Enhance with AI
                          </span>
                        </Button>
                      </div>
                      <div className="flex gap-3">
                        <Input
                          value={newFeature}
                          onChange={(e) => setNewFeature(e.target.value)}
                          className="h-14 bg-zinc-900/50 border-white/10 text-white placeholder:text-white/20 focus:border-white/30 transition-colors duration-200 rounded-xl focus:outline-none focus:ring-0"
                          placeholder="Add a feature..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addItem('features', newFeature);
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={() => addItem('features', newFeature)}
                          className="h-14 w-14 bg-white text-black hover:bg-gray-200 rounded-lg flex-shrink-0"
                        >
                          <Plus className="w-5 h-5" />
                        </Button>
                      </div>

                      <div className="p-4 bg-white/10 border border-white/20 rounded-xl">
                        <Textarea
                          value={formData.features}
                          onChange={(e) => handleInputChange('features', e.target.value)}
                          className="min-h-[100px] bg-transparent border-none text-white placeholder:text-white/50 focus:ring-0 resize-none p-0"
                          placeholder="Or paste a list of features here..."
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-white">Use Cases</label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => enhanceText(formData.useCases, 'useCase')}
                          disabled={isEnhancing.useCase || !formData.useCases}
                          className="relative overflow-hidden group bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 hover:from-indigo-500/20 hover:via-purple-500/20 hover:to-pink-500/20 border border-white/10 hover:border-white/20 transition-all duration-300"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
                          <span className="relative flex items-center gap-2 bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent font-medium">
                            {isEnhancing.useCase ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-300" />
                            ) : (
                              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                            )}
                            Enhance with AI
                          </span>
                        </Button>
                      </div>
                      <div className="flex gap-3">
                        <Input
                          value={newUseCase}
                          onChange={(e) => setNewUseCase(e.target.value)}
                          className="h-14 bg-zinc-900/50 border-white/10 text-white placeholder:text-white/20 focus:border-white/30 transition-colors duration-200 rounded-xl focus:outline-none focus:ring-0"
                          placeholder="Add a use case..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addItem('useCases', newUseCase);
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={() => addItem('useCases', newUseCase)}
                          className="h-14 w-14 bg-white text-black hover:bg-gray-200 rounded-lg flex-shrink-0"
                        >
                          <Plus className="w-5 h-5" />
                        </Button>
                      </div>

                      <div className="p-4 bg-white/10 border border-white/20 rounded-xl">
                        <Textarea
                          value={formData.useCases}
                          onChange={(e) => handleInputChange('useCases', e.target.value)}
                          className="min-h-[100px] bg-transparent border-none text-white placeholder:text-white/50 focus:ring-0 resize-none p-0"
                          placeholder="Or paste a list of use cases here..."
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Business Details */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="space-y-8 col-start-1 row-start-1 w-full"
                  >
                    <div className="space-y-4">
                      <label className="text-sm font-medium text-white">Industries Served</label>
                      <div className="flex flex-wrap gap-2">
                        {industryOptions.map(option => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => formData.industriesServed.includes(option) ? removeIndustry(option) : addIndustry(option)}
                            className={cn(
                              "px-4 py-2 rounded-full text-sm transition-all duration-200 border",
                              formData.industriesServed.includes(option)
                                ? "bg-white border-white text-black shadow-sm"
                                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                            )}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm font-medium text-white">Pricing Model</label>
                      <div className="flex flex-wrap gap-2">
                        {pricingModelOptions.map(option => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => formData.pricingModel.includes(option) ? removePricingModel(option) : addPricingModel(option)}
                            className={cn(
                              "px-4 py-2 rounded-full text-sm transition-all duration-200 border",
                              formData.pricingModel.includes(option)
                                ? "bg-white border-white text-black shadow-sm"
                                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                            )}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm font-medium text-white">Pricing Range</label>
                      <div className="flex flex-wrap gap-2">
                        {pricingOptions.map(option => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => formData.pricingRanges.includes(option) ? removePricingRange(option) : addPricingRange(option)}
                            className={cn(
                              "px-4 py-2 rounded-full text-sm transition-all duration-200 border",
                              formData.pricingRanges.includes(option)
                                ? "bg-white border-white text-black shadow-sm"
                                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                            )}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">Company Stage</label>
                      <Select value={formData.companyStage} onValueChange={(val) => handleInputChange('companyStage', val)}>
                        <SelectTrigger className="h-14 bg-zinc-900/50 border-white/10 text-white rounded-xl focus:border-white/30 transition-colors duration-200 focus:outline-none focus:ring-0">
                          <SelectValue placeholder="Select stage" />
                        </SelectTrigger>
                        <SelectContent className="bg-black/90 border-white/20 text-white backdrop-blur-xl">
                          {companyStageOptions.map(opt => (
                            <SelectItem key={opt} value={opt} className="focus:bg-white/10 focus:text-white">{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </motion.div>
                )}

                {/* Step 5: Market & Deployment */}
                {currentStep === 5 && (
                  <motion.div
                    key="step5"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="space-y-8 col-start-1 row-start-1 w-full"
                  >
                    <div className="space-y-4">
                      <label className="text-sm font-medium text-white">Customer Segments</label>
                      <div className="flex flex-wrap gap-2">
                        {customerSegmentOptions.map(option => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => formData.customerSegments.includes(option) ? removeCustomerSegment(option) : addCustomerSegment(option)}
                            className={cn(
                              "px-4 py-2 rounded-full text-sm transition-all duration-200 border",
                              formData.customerSegments.includes(option)
                                ? "bg-white border-white text-black shadow-sm"
                                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                            )}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm font-medium text-white">Deployment Type</label>
                      <div className="flex flex-wrap gap-2">
                        {deploymentTypeOptions.map(option => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => formData.deploymentType.includes(option) ? removeDeploymentType(option) : addDeploymentType(option)}
                            className={cn(
                              "px-4 py-2 rounded-full text-sm transition-all duration-200 border",
                              formData.deploymentType.includes(option)
                                ? "bg-white border-white text-black shadow-sm"
                                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                            )}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm font-medium text-white">Ideal Scenarios</label>
                      <div className="flex flex-wrap gap-2">
                        {idealScenarioOptions.map(option => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => formData.idealScenarios.includes(option) ? removeIdealScenario(option) : addIdealScenario(option)}
                            className={cn(
                              "px-4 py-2 rounded-full text-sm transition-all duration-200 border",
                              formData.idealScenarios.includes(option)
                                ? "bg-white border-white text-black shadow-sm"
                                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                            )}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-white/10 border border-white/20 rounded-xl">
                      <input
                        type="checkbox"
                        id="trialAvailable"
                        checked={formData.trialAvailable}
                        onChange={(e) => setFormData(prev => ({ ...prev, trialAvailable: e.target.checked }))}
                        className="w-5 h-5 rounded border-white/30 bg-white/10 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                      />
                      <label htmlFor="trialAvailable" className="text-white font-medium cursor-pointer">
                        Free Trial / Demo Available
                      </label>
                    </div>
                  </motion.div>
                )}

                {/* Step 6: Additional Info */}
                {currentStep === 6 && (
                  <motion.div
                    key="step6"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="space-y-8 col-start-1 row-start-1 w-full"
                  >
                    <div className="space-y-4">
                      <label className="text-sm font-medium text-white">Top Clients</label>
                      <div className="flex gap-3">
                        <Input
                          value={newClient}
                          onChange={(e) => setNewClient(e.target.value)}
                          className="h-14 bg-zinc-900/50 border-white/10 text-white placeholder:text-white/20 focus:border-white/30 transition-colors duration-200 rounded-xl focus:outline-none focus:ring-0"
                          placeholder="Add a client..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addItem('topClients', newClient);
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={() => addItem('topClients', newClient)}
                          className="h-14 w-14 bg-white text-black hover:bg-gray-200 rounded-lg flex-shrink-0"
                        >
                          <Plus className="w-5 h-5" />
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2 min-h-[40px] p-4 bg-white/10 border border-white/20 rounded-xl">
                        {formData.topClients.length === 0 && (
                          <span className="text-white/50 text-sm italic">No clients added yet</span>
                        )}
                        {formData.topClients.map((item, idx) => (
                          <span key={idx} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 text-white text-sm border border-white/20">
                            {item}
                            <button
                              type="button"
                              onClick={() => removeItem('topClients', idx)}
                              className="hover:text-white transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">Testimonial Page URL</label>
                      <Input
                        type="url"
                        value={formData.testimonialPage}
                        onChange={(e) => handleInputChange('testimonialPage', e.target.value)}
                        className="h-14 bg-zinc-900/50 border-white/10 text-white placeholder:text-white/20 focus:border-white/30 transition-colors duration-200 rounded-xl focus:outline-none focus:ring-0"
                        placeholder="https://yourcompany.com/testimonials"
                      />
                    </div>



                  </motion.div>
                )}
              </AnimatePresence>

            </form>
          </div>
        </div>

        {/* Fixed Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 lg:relative p-6 lg:px-12 border-t border-white/10 bg-black/80 backdrop-blur-xl z-50">
          {/* Minimalist Section Progress Bar */}
          <div
            className="absolute top-0 left-0 h-[2px] bg-white transition-all duration-500 ease-out z-30"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />

          <div className="max-w-3xl mx-auto flex justify-between items-center">
            <Button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0}
              variant="ghost"
              className="group h-14 px-8 text-zinc-500 hover:text-white hover:bg-white/5 disabled:opacity-30 rounded-2xl transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
              Back
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="group h-14 px-10 bg-white text-black hover:bg-zinc-100 font-semibold tracking-tight rounded-2xl shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                Next Step
                <ChevronRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={(e) => handleSubmit(e)}
                disabled={isSubmitting}
                className="group h-14 px-10 bg-[#0071e3] text-white hover:bg-[#0077ED] font-semibold tracking-tight rounded-2xl shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
              >
                <div className="relative flex items-center">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Company
                      <Check className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:scale-110" />
                    </>
                  )}
                </div>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}