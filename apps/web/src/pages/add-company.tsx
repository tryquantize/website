import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import '@/styles/custom-input.css';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Building2, Plus, X, ChevronLeft, ChevronRight, Sparkles, Check, Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { Component as RaycastBackground } from "@/components/ui/raycast-animated-background";
import { SectionBadge } from "@/components/ui/section-badge";
import { cn } from "@/lib/utils";

export default function AddCompanyPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isEnhancingDescription, setIsEnhancingDescription] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    linkedinPage: '',
    phoneNumber: '',
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
    idealScenarios: [] as string[]
  });

  const [newProduct, setNewProduct] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [newUseCase, setNewUseCase] = useState('');
  const [newClient, setNewClient] = useState('');
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
    { title: 'Company Details', fields: ['phoneNumber', 'founded', 'headquarters', 'category', 'employees', 'tagline', 'uspTagline'] },
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
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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

  return (
    <div className="relative w-full min-h-screen bg-black overflow-hidden">
      {/* Raycast Animation Background */}
      <div className="fixed inset-0 w-full h-full z-0">
        <RaycastBackground />
      </div>

      <div className="relative z-10 pt-32 pb-24 px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <SectionBadge>PARTNER WITH US</SectionBadge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#f5f5f7] mb-6">
            Add Your Company
          </h1>
          <p className="text-lg text-[#86868b] leading-relaxed max-w-2xl mx-auto">
            Get featured in our directory. Complete the details below to ensure your company is properly represented.
          </p>
        </div>

        {/* Main Card */}
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-12 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">

          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#f5f5f7] flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#0071e3] text-white text-sm">
                  {currentStep + 1}
                </span>
                {steps[currentStep].title}
              </h2>
              <div className="text-[#86868b] text-sm font-medium">
                Step {currentStep + 1} of {steps.length}
              </div>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5">
              <div
                className="bg-[#0071e3] h-1.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 0: Basic Information */}
            {currentStep === 0 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <p className="text-sm text-blue-200 flex gap-2">
                    <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Pro Tip:</strong> Enter your company name and website, then use our AI Auto-fill feature to populate the rest of the form automatically!
                    </span>
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Company Name <span className="text-red-400">*</span></label>
                    <Input
                      required
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/30 transition-all"
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
                      className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/30 transition-all"
                      placeholder="https://yourcompany.com"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-white">LinkedIn Page</label>
                    <Input
                      type="url"
                      value={formData.linkedinPage}
                      onChange={(e) => handleInputChange('linkedinPage', e.target.value)}
                      className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/30 transition-all"
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
                      className="h-14 px-8 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
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
                    <p className="text-[#86868b] text-sm">
                      or <button type="button" onClick={() => setCurrentStep(1)} className="text-[#f5f5f7] hover:underline">continue manually</button>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 1: Company Details */}
            {currentStep === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Phone Number</label>
                    <Input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/30 transition-all"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Founded Year</label>
                    <Input
                      value={formData.founded}
                      onChange={(e) => handleInputChange('founded', e.target.value)}
                      className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/30 transition-all"
                      placeholder="2023"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Headquarters</label>
                    <Input
                      value={formData.headquarters}
                      onChange={(e) => handleInputChange('headquarters', e.target.value)}
                      className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/30 transition-all"
                      placeholder="San Francisco, CA"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Category <span className="text-red-400">*</span></label>
                    <Input
                      required
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/30 transition-all"
                      placeholder="AI Platform, SaaS, etc."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Employees</label>
                    <Select value={formData.employees} onValueChange={(val) => handleInputChange('employees', val)}>
                      <SelectTrigger className="h-12 bg-white/10 border-white/20 text-white">
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
                    className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/30 transition-all"
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
                    className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/30 transition-all"
                    placeholder="e.g., 'The fastest AI engine on the market'"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Products & Description */}
            {currentStep === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-4">
                  <label className="text-sm font-medium text-white">Products / Services <span className="text-red-400">*</span></label>
                  <div className="flex gap-3">
                    <Input
                      value={newProduct}
                      onChange={(e) => setNewProduct(e.target.value)}
                      className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/30 transition-all"
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
                      className="h-12 w-12 bg-white text-black hover:bg-gray-200 rounded-lg flex-shrink-0"
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
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                    >
                      {isEnhancingDescription ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Sparkles className="w-3 h-3 mr-2" />}
                      Enhance with AI
                    </Button>
                  </div>
                  <Textarea
                    required
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="min-h-[200px] bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/30 transition-all resize-none"
                    placeholder="Describe your company, mission, and what makes you special..."
                  />
                </div>
              </div>
            )}

            {/* Step 3: Features & Use Cases */}
            {currentStep === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-4">
                  <label className="text-sm font-medium text-white">Key Features</label>
                  <div className="flex gap-3">
                    <Input
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/30 transition-all"
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
                      className="h-12 w-12 bg-white text-black hover:bg-gray-200 rounded-lg flex-shrink-0"
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
                  <label className="text-sm font-medium text-white">Use Cases</label>
                  <div className="flex gap-3">
                    <Input
                      value={newUseCase}
                      onChange={(e) => setNewUseCase(e.target.value)}
                      className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/30 transition-all"
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
                      className="h-12 w-12 bg-white text-black hover:bg-gray-200 rounded-lg flex-shrink-0"
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
              </div>
            )}

            {/* Step 4: Business Details */}
            {currentStep === 4 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                            ? "bg-[#0071e3] border-[#0071e3] text-white shadow-lg shadow-blue-500/20"
                            : "bg-white/10 border-white/20 text-white/80 hover:bg-white/20 hover:text-white"
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
                            ? "bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-500/20"
                            : "bg-white/10 border-white/20 text-white/80 hover:bg-white/20 hover:text-white"
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
                            ? "bg-green-600 border-green-600 text-white shadow-lg shadow-green-500/20"
                            : "bg-white/10 border-white/20 text-white/80 hover:bg-white/20 hover:text-white"
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
                    <SelectTrigger className="h-12 bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/20 text-white backdrop-blur-xl">
                      {companyStageOptions.map(opt => (
                        <SelectItem key={opt} value={opt} className="focus:bg-white/10 focus:text-white">{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 5: Market & Deployment */}
            {currentStep === 5 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                            ? "bg-pink-600 border-pink-600 text-white shadow-lg shadow-pink-500/20"
                            : "bg-white/10 border-white/20 text-white/80 hover:bg-white/20 hover:text-white"
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
                            ? "bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-500/20"
                            : "bg-white/10 border-white/20 text-white/80 hover:bg-white/20 hover:text-white"
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
                            ? "bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-500/20"
                            : "bg-white/10 border-white/20 text-white/80 hover:bg-white/20 hover:text-white"
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
              </div>
            )}

            {/* Step 6: Additional Info */}
            {currentStep === 6 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-4">
                  <label className="text-sm font-medium text-white">Top Clients</label>
                  <div className="flex gap-3">
                    <Input
                      value={newClient}
                      onChange={(e) => setNewClient(e.target.value)}
                      className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/30 transition-all"
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
                      className="h-12 w-12 bg-white text-black hover:bg-gray-200 rounded-lg flex-shrink-0"
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
                    className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/30 transition-all"
                    placeholder="https://yourcompany.com/testimonials"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Company Logo</label>
                  <div className="p-8 border-2 border-dashed border-white/20 rounded-xl text-center hover:bg-white/10 transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-2">
                        <Plus className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-white font-medium">Click to upload logo</p>
                      <p className="text-white/60 text-sm">SVG, PNG, JPG (max 2MB)</p>
                      {formData.logo && (
                        <p className="text-green-400 text-sm mt-2 font-medium flex items-center gap-1">
                          <Check className="w-4 h-4" /> {formData.logo.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8 border-t border-white/10">
              <Button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 0}
                variant="ghost"
                className="h-12 px-6 text-[#f5f5f7] hover:bg-white/10 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="h-12 px-8 bg-white text-black hover:bg-gray-200 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                  Next Step
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 px-8 bg-[#0071e3] text-white hover:bg-[#0077ED] font-semibold rounded-xl shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Company
                      <Check className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}