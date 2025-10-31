import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { ArrowLeft, Building2, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocation } from 'wouter';
import { Component as AnimatedBackground } from "@/components/ui/raycast-animated-black-background";
import AI_SERVICE_CONFIG from '@/config/ai-service';


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
    tagline: ''
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
    '0-1',
    '2-10',
    '10-50',
    '50-200',
    '200-500',
    '500-1000',
    '1000-5000',
    '5000-10000',
    '10000+'
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
    'Subscription',
    'Usage-based',
    'Freemium',
    'Custom Quote',
    'One-time Purchase',
    'Tiered Pricing'
  ];

  const companyStageOptions = [
    'Pre-seed',
    'Seed',
    'Series A',
    'Series B',
    'Series C+',
    'Bootstrapped',
    'Public',
    'Acquired'
  ];

  const pricingOptions = [
    '<$100',
    '$100-$500',
    '$500-$1,000',
    '$1,000-$2,500',
    '$2,500-$5,000',
    '$5,000-$10,000',
    '$10,000-$25,000',
    '$25,000-$50,000',
    '$50,000-$100,000',
    '$100,000-$250,000',
    '$250,000-$500,000',
    '$500,000-$1,000,000',
    '$1,000,000-$2,500,000',
    '$2,500,000+',
    'Contact for pricing'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addItem = (type: 'products' | 'features' | 'useCases' | 'topClients', value: string) => {
    if (!value.trim()) return;
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], value.trim()]
    }));
    if (type === 'products') setNewProduct('');
    if (type === 'features') setNewFeature('');
    if (type === 'useCases') setNewUseCase('');
    if (type === 'topClients') setNewClient('');
  };

  const removeItem = (type: 'products' | 'features' | 'useCases' | 'topClients', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
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
      const response = await fetch(AI_SERVICE_CONFIG.getEnhanceTextUrl(), {
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
      const response = await fetch(AI_SERVICE_CONFIG.getEnhanceTextUrl(), {
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
    { title: 'Company Details', fields: ['phoneNumber', 'founded', 'headquarters', 'category', 'employees', 'tagline'] },
    { title: 'Products & Description', fields: ['products', 'description'] },
    { title: 'Features & Use Cases', fields: ['features', 'useCases'] },
    { title: 'Business Details', fields: ['industriesServed', 'pricingRanges', 'pricingModel', 'companyStage'] },
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
      const response = await fetch(AI_SERVICE_CONFIG.getAutoFillUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: formData.companyName,
          website: formData.website,
          linkedinPage: formData.linkedinPage || ''
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Auto-fill response:', result);
      
      if (result.success && result.data) {
        setFormData(prev => ({
          ...prev,
          description: result.data.description || prev.description,
          category: result.data.category || prev.category,
          founded: result.data.founded || prev.founded,
          headquarters: result.data.headquarters || prev.headquarters,
          employees: result.data.employees || prev.employees,
          features: result.data.features || prev.features,
          useCases: result.data.useCases || prev.useCases,
          tagline: result.data.tagline || prev.tagline
        }));
        
        toast({
          title: 'Success!',
          description: 'Company details auto-filled successfully. Please review and modify as needed.',
        });
        
        // Only proceed to next step after successful auto-fill
        setCurrentStep(1);
      } else {
        throw new Error(result.error || result.message || 'Auto-fill returned no data');
      }
    } catch (error) {
      console.error('Auto-fill error:', error);
      toast({
        title: 'Auto-fill Failed',
        description: error instanceof Error ? error.message : 'Please fill the form manually.',
        variant: 'destructive'
      });
      // Don't proceed to next step on failure
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
    
    // Validate required fields
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

    try {
      // Remove logo from submission data (can't serialize File objects)
      const { logo, ...submissionData } = formData;
      
      const response = await fetch(AI_SERVICE_CONFIG.getAddCompanyUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });
      
      if (response.ok) {
        toast({
          title: 'Success!',
          description: 'Your company has been submitted for review.',
        });
        setLocation('/');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Submission failed' }));
        throw new Error(errorData.error || 'Submission failed');
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
    <div className="min-h-screen relative p-4">
      <div className="fixed inset-0 z-0">
        <AnimatedBackground />
      </div>
      <div className="relative z-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation('/')}
            className="text-white hover:text-white/80"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <div className="bg-black/20 backdrop-blur-3xl border border-white/20 rounded-lg shadow-2xl" style={{backdropFilter: 'blur(60px)'}}>
          <div className="w-full p-6">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-full">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-pink-400 via-green-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                🚀 Join the Revolution!
              </h1>
              <p className="text-xl md:text-2xl font-semibold text-white/90 mb-3">
                Get Featured in Our Premium Directory
              </p>
              <p className="text-white/70 max-w-2xl mx-auto leading-relaxed">
                Thousands of businesses discover AI solutions daily. Don't miss out on qualified leads, partnerships, and growth opportunities.
              </p>
            </div>
            
            <div className="grid gap-6">
              <form onSubmit={handleSubmit} className="space-y-6">
              {/* Progress Indicator */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-8 bg-gradient-to-b from-pink-500 to-cyan-500 rounded-full"></span>
                    {steps[currentStep].title}
                  </h2>
                  <div className="text-white/60 text-sm">
                    Step {currentStep + 1} of {steps.length}
                  </div>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-pink-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Step 0: Basic Information */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white font-medium text-sm mb-3">Company Name *</label>
                      <Input
                        required
                        value={formData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                        placeholder="e.g., OpenAI"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium text-sm mb-3">Website *</label>
                      <Input
                        required
                        type="url"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                        placeholder="https://yourcompany.com"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-white font-medium text-sm mb-3">LinkedIn Page</label>
                      <Input
                        type="url"
                        value={formData.linkedinPage}
                        onChange={(e) => handleInputChange('linkedinPage', e.target.value)}
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                        placeholder="https://linkedin.com/company/yourcompany"
                      />
                    </div>
                  </div>

                  {/* Auto-fill Button */}
                  {formData.companyName && formData.website && (
                    <div className="text-center py-6">
                      <Button
                        type="button"
                        onClick={handleAutoFill}
                        disabled={isAutoFilling}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                      >
                        {isAutoFilling ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                            Auto-filling Details...
                          </>
                        ) : (
                          <>
                            ✨ Auto-fill Company Details
                          </>
                        )}
                      </Button>
                      <p className="text-white/60 text-sm mt-3">
                        Automatically populate remaining fields using your website and LinkedIn page
                      </p>
                      <div className="mt-4">
                        <Button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          variant="outline"
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          Skip Auto-fill & Continue Manually
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 1: Company Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                    <div>
                      <label className="block text-white font-medium text-sm mb-3">Phone Number (Sales Team)</label>
                      <Input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium text-sm mb-3">Founded Year</label>
                      <Input
                        value={formData.founded}
                        onChange={(e) => handleInputChange('founded', e.target.value)}
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                        placeholder="2023"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium text-sm mb-3">Headquarters</label>
                      <Input
                        value={formData.headquarters}
                        onChange={(e) => handleInputChange('headquarters', e.target.value)}
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                        placeholder="San Francisco, CA"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium text-sm mb-3">Category *</label>
                      <Input
                        required
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                        placeholder="AI Platform, AI Writing, AI Image, etc."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium text-sm mb-3">Employees</label>
                      <Input
                        value={formData.employees}
                        onChange={(e) => handleInputChange('employees', e.target.value)}
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                        placeholder="50-100, 500+, etc."
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium text-sm mb-3">
                      Company Tagline
                      <span className="block text-xs text-white/60 mt-1">
                        A short, catchy phrase that describes what your company does
                      </span>
                    </label>
                    <Input
                      value={formData.tagline}
                      onChange={(e) => handleInputChange('tagline', e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                      placeholder="e.g., 'AI for everyone', 'Building the future of work'"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Products & Description */}
              {currentStep === 2 && (
                <div className="space-y-6">

                  <div>
                    <label className="block text-white font-medium text-sm mb-3">
                      Products/Services *
                      <span className="block text-xs text-white/60 mt-1">
                        Add detailed information about each product/service you offer
                      </span>
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            value={newProduct}
                            onChange={(e) => setNewProduct(e.target.value)}
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/40 pr-20"
                            placeholder="Enter detailed product/service information..."
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('products', newProduct))}
                          />
                          {newProduct.trim() && (
                            <button
                              type="button"
                              onClick={() => enhanceText(newProduct, 'product')}
                              disabled={isEnhancing.product}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-lg hover:scale-110 transition-transform disabled:opacity-50"
                            >
                              {isEnhancing.product ? '⏳' : '✨'}
                            </button>
                          )}
                        </div>
                        <Button
                          type="button"
                          onClick={() => addItem('products', newProduct)}
                          className="bg-white/10 hover:bg-white/20 text-white"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.products.map((product, index) => (
                          <div key={index} className="bg-white/10 rounded-md px-3 py-1 flex items-center gap-2">
                            <span className="text-white text-sm">{product}</span>
                            <button
                              type="button"
                              onClick={() => removeItem('products', index)}
                              className="text-white/60 hover:text-white"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-medium text-sm mb-3">About Your Company *</label>
                    <div className="relative">
                      <Textarea
                        required
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40 pr-12"
                        placeholder="Provide a comprehensive description of your company, mission, vision, and what makes you unique in the AI space..."
                        rows={4}
                      />
                      {formData.description.trim() && (
                        <button
                          type="button"
                          onClick={enhanceDescription}
                          disabled={isEnhancingDescription}
                          className="absolute right-3 top-3 text-lg hover:scale-110 transition-transform disabled:opacity-50"
                          title="Enhance description with AI"
                        >
                          {isEnhancingDescription ? '⏳' : '✨'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Features & Use Cases */}
              {currentStep === 3 && (
                <div className="space-y-6">

                  <div>
                    <label className="block text-white font-medium text-sm mb-3">
                      Key Features *
                      <span className="block text-xs text-white/60 mt-1">
                        Describe all key features of your products/services in detail
                      </span>
                    </label>
                    <div className="relative">
                      <Textarea
                        value={formData.features}
                        onChange={(e) => handleInputChange('features', e.target.value)}
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40 pr-12"
                        placeholder="Describe your key features and capabilities in detail..."
                        rows={6}
                      />
                      {formData.features.trim() && (
                        <button
                          type="button"
                          onClick={() => enhanceText(formData.features, 'feature')}
                          disabled={isEnhancing.feature}
                          className="absolute right-3 top-3 text-lg hover:scale-110 transition-transform disabled:opacity-50"
                        >
                          {isEnhancing.feature ? '⏳' : '✨'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-medium text-sm mb-3">
                      Use Cases *
                      <span className="block text-xs text-white/60 mt-1">
                        Describe specific use cases and applications for your products/services
                      </span>
                    </label>
                    <div className="relative">
                      <Textarea
                        value={formData.useCases}
                        onChange={(e) => handleInputChange('useCases', e.target.value)}
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40 pr-12"
                        placeholder="Describe your use cases and applications in detail..."
                        rows={6}
                      />
                      {formData.useCases.trim() && (
                        <button
                          type="button"
                          onClick={() => enhanceText(formData.useCases, 'useCase')}
                          disabled={isEnhancing.useCase}
                          className="absolute right-3 top-3 text-lg hover:scale-110 transition-transform disabled:opacity-50"
                        >
                          {isEnhancing.useCase ? '⏳' : '✨'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Business Details */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white font-medium text-sm mb-3">Company Stage</label>
                      <Select value={formData.companyStage} onValueChange={(value) => handleInputChange('companyStage', value)}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue placeholder="Select company stage" />
                        </SelectTrigger>
                        <SelectContent className="bg-black/90 border-white/20">
                          {companyStageOptions.map((option) => (
                            <SelectItem key={option} value={option} className="text-white hover:bg-white/10">
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-white font-medium text-sm mb-3">Industries Served</label>
                      <Select onValueChange={addIndustry}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue placeholder="Select industries" />
                        </SelectTrigger>
                        <SelectContent className="bg-black/90 border-white/20 max-h-60">
                          {industryOptions.filter(option => !formData.industriesServed.includes(option)).map((option) => (
                            <SelectItem key={option} value={option} className="text-white hover:bg-white/10">
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {formData.industriesServed.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.industriesServed.map((industry) => (
                        <div key={industry} className="bg-white/10 rounded-md px-3 py-1 flex items-center gap-2">
                          <span className="text-white text-sm">{industry}</span>
                          <button
                            type="button"
                            onClick={() => removeIndustry(industry)}
                            className="text-white/60 hover:text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white font-medium text-sm mb-3">Pricing Ranges</label>
                      <Select onValueChange={addPricingRange}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue placeholder="Select pricing ranges" />
                        </SelectTrigger>
                        <SelectContent className="bg-black/90 border-white/20">
                          {pricingOptions.filter(option => !formData.pricingRanges.includes(option)).map((option) => (
                            <SelectItem key={option} value={option} className="text-white hover:bg-white/10">
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.pricingRanges.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.pricingRanges.map((range) => (
                            <div key={range} className="bg-white/10 rounded-md px-3 py-1 flex items-center gap-2">
                              <span className="text-white text-sm">{range}</span>
                              <button
                                type="button"
                                onClick={() => removePricingRange(range)}
                                className="text-white/60 hover:text-white"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-white font-medium text-sm mb-3">Pricing Model</label>
                      <Select onValueChange={addPricingModel}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue placeholder="Select pricing model" />
                        </SelectTrigger>
                        <SelectContent className="bg-black/90 border-white/20">
                          {pricingModelOptions.filter(option => !formData.pricingModel.includes(option)).map((option) => (
                            <SelectItem key={option} value={option} className="text-white hover:bg-white/10">
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.pricingModel.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.pricingModel.map((model) => (
                            <div key={model} className="bg-white/10 rounded-md px-3 py-1 flex items-center gap-2">
                              <span className="text-white text-sm">{model}</span>
                              <button
                                type="button"
                                onClick={() => removePricingModel(model)}
                                className="text-white/60 hover:text-white"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Additional Info */}
              {currentStep === 5 && (
                <div className="space-y-6">

                  <div>
                    <label className="block text-white font-medium text-sm mb-3">
                      Top Clients / Partners (Optional)
                      <span className="block text-xs text-white/60 mt-1">
                        Add your notable clients or partners
                      </span>
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={newClient}
                          onChange={(e) => setNewClient(e.target.value)}
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                          placeholder="Enter client/partner information..."
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('topClients', newClient))}
                        />
                        <Button
                          type="button"
                          onClick={() => addItem('topClients', newClient)}
                          className="bg-white/10 hover:bg-white/20 text-white"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.topClients.map((client, index) => (
                          <div key={index} className="bg-white/10 rounded-md px-3 py-1 flex items-center gap-2">
                            <span className="text-white text-sm">{client}</span>
                            <button
                              type="button"
                              onClick={() => removeItem('topClients', index)}
                              className="text-white/60 hover:text-white"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-medium text-sm mb-3">Testimonial Page (Optional)</label>
                    <Input
                      type="url"
                      value={formData.testimonialPage}
                      onChange={(e) => handleInputChange('testimonialPage', e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                      placeholder="https://yourcompany.com/testimonials"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium text-sm mb-3">Company Logo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="bg-white/5 border border-white/20 rounded text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-white/10 file:text-white hover:file:bg-white/20 w-full"
                    />
                    {formData.logo && (
                      <p className="text-white/60 text-sm mt-1">Selected: {formData.logo.name}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              {currentStep > 0 && (
                <div className="flex justify-between items-center pt-6">
                  <Button
                    type="button"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  {currentStep < steps.length - 1 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-white text-black font-bold py-3 px-8 hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
                    >
                      {isSubmitting ? '🚀 Submitting...' : '✨ Submit Application'}
                    </Button>
                  )}
                </div>
              )}
              </form>
            </div>
            
            <div className="z-10 mt-8 flex flex-col items-center text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-white/90 font-medium">
                  ⚡ Fast-Track Review: 24-48 hours
                </p>
                <p className="text-white/70 text-sm mt-1">
                  Join 500+ companies already featured
                </p>
              </div>
            </div>
            
            <div className="absolute inset-0 -z-10 rounded-full bg-background opacity-40 blur-xl" />
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}