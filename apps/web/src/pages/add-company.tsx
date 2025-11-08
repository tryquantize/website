import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import '@/styles/custom-input.css';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { ArrowLeft, Building2, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocation } from 'wouter';
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

  const customerSegmentOptions = [
    'B2B',
    'B2C',
    'D2C',
    'B2B2C'
  ];

  const deploymentTypeOptions = [
    'Cloud',
    'On-premise',
    'Hybrid',
    'SaaS',
    'API'
  ];

  const idealScenarioOptions = [
    'SMBs',
    'Enterprises',
    'Startups',
    'Mid-market',
    'Fortune 500',
    'Government',
    'Non-profit',
    'Educational'
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
      // Use production service directly for reliability
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
      // Use production service directly for reliability
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
      console.log('Starting auto-fill for:', formData.companyName, formData.website);
      
      // Use production service directly for reliability
      const response = await fetch('https://website-ocrz.onrender.com/auto-fill-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: formData.companyName,
          website: formData.website,
          linkedinPage: formData.linkedinPage || ''
        })
      });
      
      console.log('Auto-fill response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Auto-fill error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Auto-fill response:', result);
      
      if (result.success && result.data) {
        console.log('Processing auto-fill data:', result.data);
        setFormData(prev => {
          // Handle products array - convert from objects to strings if needed
          let productsArray = prev.products;
          if (result.data.products && Array.isArray(result.data.products)) {
            productsArray = result.data.products.map(product => 
              typeof product === 'string' ? product : 
              (product.name && product.description ? `${product.name}: ${product.description}` : 
               product.name || product.description || product)
            );
          } else if (result.data.productsServices && Array.isArray(result.data.productsServices)) {
            productsArray = result.data.productsServices;
          }
          
          // Handle features - convert array to string if needed
          let featuresText = prev.features;
          if (result.data.features) {
            if (Array.isArray(result.data.features)) {
              featuresText = result.data.features.join(', ');
            } else if (typeof result.data.features === 'string') {
              featuresText = result.data.features;
            }
          }
          
          // Handle use cases - convert array to string if needed
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
      
      console.log('Submitting company data:', submissionData);
      
      // Use production service directly for reliability
      const response = await fetch('https://website-ocrz.onrender.com/add-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Submission result:', result);
        toast({
          title: 'Success!',
          description: 'Your company has been submitted for review.',
        });
        setLocation('/');
      } else {
        const errorText = await response.text();
        console.error('Submission error:', errorText);
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
    <div className="min-h-screen bg-black p-4">
      <div className="relative z-10">
      <div className="max-w-4xl mx-auto">
        <div>
          <Button
            variant="ghost"
            onClick={() => setLocation('/')}
            className="text-white hover:text-gray-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="w-full p-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="p-3 bg-black rounded-full">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-black mb-4">
                Add Your Company
              </h1>
              <p className="text-lg font-medium text-black mb-3">
                Get Featured in Our Directory
              </p>
              <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Complete all sections carefully to ensure your company is properly represented in our directory.
              </p>
            </div>
            
            <div className="grid gap-6">
              <form onSubmit={handleSubmit} className="space-y-6">
              {/* Progress Indicator */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-black flex items-center gap-2">
                    <span className="w-2 h-8 bg-black rounded-full"></span>
                    {steps[currentStep].title}
                  </h2>
                  <div className="text-gray-600 text-sm">
                    Step {currentStep + 1} of {steps.length}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-black h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Step 0: Basic Information */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="p-3 bg-gray-50 rounded border">
                    <p className="text-xs text-gray-700">
                      <strong>Instructions:</strong> Enter your company's basic information accurately. This data will be used to auto-populate other fields and ensure proper listing in our directory.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="input-group">
                      <label className="label">Company Name *</label>
                      <Input
                        required
                        value={formData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        className="input"
                        placeholder="e.g., OpenAI"
                      />
                    </div>
                    
                    <div className="input-group">
                      <label className="label">Website *</label>
                      <Input
                        required
                        type="url"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        className="input"
                        placeholder="https://yourcompany.com"
                      />
                    </div>
                    
                    <div className="md:col-span-2 input-group">
                      <label className="label">LinkedIn Page</label>
                      <Input
                        type="url"
                        value={formData.linkedinPage}
                        onChange={(e) => handleInputChange('linkedinPage', e.target.value)}
                        className="input"
                        placeholder="https://linkedin.com/company/yourcompany"
                      />
                    </div>
                  </div>

                  {/* Auto-fill Button */}
                  {formData.companyName && formData.website && (
                    <div className="text-center py-6">
                      <div className="flex gap-4 justify-center">
                        <Button
                          type="button"
                          onClick={handleAutoFill}
                          disabled={isAutoFilling}
                          className="bg-black hover:bg-gray-800 text-white font-medium px-6 py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isAutoFilling ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Auto-filling...
                            </>
                          ) : (
                            "Auto-fill Company Details"
                          )}
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          variant="outline"
                          className="bg-white border-gray-300 text-black hover:bg-gray-50 px-6 py-3"
                        >
                          Skip & Continue Manually
                        </Button>
                      </div>
                      <p className="text-gray-600 text-sm mt-3">
                        Automatically populate remaining fields using your website and LinkedIn page
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 1: Company Details */}
              {currentStep === 1 && (
                <div className="flex-1 flex flex-col justify-center space-y-6">
                  <div className="mb-4 p-3 bg-gray-50 rounded border">
                    <p className="text-xs text-gray-700">
                      <strong>Instructions:</strong> Provide detailed company information. Fill in all available fields to improve your listing's visibility and credibility.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                    <div className="input-group">
                      <label className="label">Phone Number (Sales Team)</label>
                      <Input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        className="input"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    
                    <div className="input-group">
                      <label className="label">Founded Year</label>
                      <Input
                        value={formData.founded}
                        onChange={(e) => handleInputChange('founded', e.target.value)}
                        className="input"
                        placeholder="2023"
                      />
                    </div>
                    
                    <div className="input-group">
                      <label className="label">Headquarters</label>
                      <Input
                        value={formData.headquarters}
                        onChange={(e) => handleInputChange('headquarters', e.target.value)}
                        className="input"
                        placeholder="San Francisco, CA"
                      />
                    </div>
                    
                    <div className="input-group">
                      <label className="label">Category *</label>
                      <Input
                        required
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="input"
                        placeholder="AI Platform, AI Writing, AI Image, etc."
                      />
                    </div>
                    
                    <div className="input-group">
                      <label className="label">Employees</label>
                      <Input
                        value={formData.employees}
                        onChange={(e) => handleInputChange('employees', e.target.value)}
                        className="input"
                        placeholder="50-100, 500+, etc."
                      />
                    </div>
                  </div>
                  
                  <div className="input-group">
                    <label className="label">
                      Company Tagline
                      <span className="block text-xs text-gray-600 mt-1">
                        A short, catchy phrase that describes what your company does
                      </span>
                    </label>
                    <Input
                      value={formData.tagline}
                      onChange={(e) => handleInputChange('tagline', e.target.value)}
                      className="input"
                      placeholder="e.g., 'AI for everyone', 'Building the future of work'"
                    />
                  </div>
                  
                  <div className="input-group">
                    <label className="label">
                      USP / Differentiator Tagline
                      <span className="block text-xs text-gray-600 mt-1">
                        What makes you unique? (e.g., "Fastest API for Voice AI")
                      </span>
                    </label>
                    <Input
                      value={formData.uspTagline}
                      onChange={(e) => handleInputChange('uspTagline', e.target.value)}
                      className="input"
                      placeholder="e.g., 'Fastest API for Voice AI', '10x faster than competitors'"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Products & Description */}
              {currentStep === 2 && (
                <div className="flex-1 flex flex-col justify-center space-y-6">
                  <div className="mb-4 p-3 bg-gray-50 rounded border">
                    <p className="text-xs text-gray-700">
                      <strong>Instructions:</strong> Describe your products/services and company in detail. Be specific about features, benefits, and what makes your offerings unique.
                    </p>
                  </div>

                  <div>
                    <label className="block text-black font-medium text-sm mb-3">
                      Products/Services *
                      <span className="block text-xs text-gray-600 mt-1">
                        Add detailed information about each product/service you offer
                      </span>
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="relative flex-1 input-group">
                          <Input
                            value={newProduct}
                            onChange={(e) => setNewProduct(e.target.value)}
                            className="input pr-20"
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
                          className="bg-black hover:bg-gray-800 text-white"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.products.map((product, index) => (
                          <div key={index} className="bg-gray-100 rounded-md px-3 py-1 flex items-center gap-2">
                            <span className="text-black text-sm">{product}</span>
                            <button
                              type="button"
                              onClick={() => removeItem('products', index)}
                              className="text-gray-600 hover:text-black"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="label">About Your Company *</label>
                    <div className="relative">
                      <Textarea
                        required
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className="input textarea pr-12"
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
                <div className="flex-1 flex flex-col justify-center space-y-6">
                  <div className="mb-4 p-3 bg-gray-50 rounded border">
                    <p className="text-xs text-gray-700">
                      <strong>Instructions:</strong> Detail your key features and use cases. Focus on specific capabilities and real-world applications that demonstrate value to potential customers.
                    </p>
                  </div>

                  <div className="input-group">
                    <label className="label">
                      Key Features *
                      <span className="block text-xs text-gray-600 mt-1">
                        Describe all key features of your products/services in detail
                      </span>
                    </label>
                    <div className="relative">
                      <Textarea
                        value={formData.features}
                        onChange={(e) => handleInputChange('features', e.target.value)}
                        className="input textarea pr-12"
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

                  <div className="input-group">
                    <label className="label">
                      Use Cases *
                      <span className="block text-xs text-gray-600 mt-1">
                        Describe specific use cases and applications for your products/services
                      </span>
                    </label>
                    <div className="relative">
                      <Textarea
                        value={formData.useCases}
                        onChange={(e) => handleInputChange('useCases', e.target.value)}
                        className="input textarea pr-12"
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
                <div className="flex-1 flex flex-col justify-center space-y-6">
                  <div className="mb-4 p-3 bg-gray-50 rounded border">
                    <p className="text-xs text-gray-700">
                      <strong>Instructions:</strong> Select your business model details carefully. Choose all applicable industries, pricing ranges, and models to help customers find you more easily.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-black font-medium text-sm mb-3">Company Stage</label>
                      <Select value={formData.companyStage} onValueChange={(value) => handleInputChange('companyStage', value)}>
                        <SelectTrigger className="bg-white border-gray-300 text-black">
                          <SelectValue placeholder="Select company stage" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300">
                          {companyStageOptions.map((option) => (
                            <SelectItem key={option} value={option} className="text-black hover:bg-gray-100">
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-black font-medium text-sm mb-3">Industries Served</label>
                      <Select onValueChange={addIndustry}>
                        <SelectTrigger className="bg-white border-gray-300 text-black">
                          <SelectValue placeholder="Select industries" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300 max-h-60">
                          {industryOptions.filter(option => !formData.industriesServed.includes(option)).map((option) => (
                            <SelectItem key={option} value={option} className="text-black hover:bg-gray-100">
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
                        <div key={industry} className="bg-gray-100 rounded-md px-3 py-1 flex items-center gap-2">
                          <span className="text-black text-sm">{industry}</span>
                          <button
                            type="button"
                            onClick={() => removeIndustry(industry)}
                            className="text-gray-600 hover:text-black"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-black font-medium text-sm mb-3">Pricing Ranges</label>
                      <Select onValueChange={addPricingRange}>
                        <SelectTrigger className="bg-white border-gray-300 text-black">
                          <SelectValue placeholder="Select pricing ranges" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300">
                          {pricingOptions.filter(option => !formData.pricingRanges.includes(option)).map((option) => (
                            <SelectItem key={option} value={option} className="text-black hover:bg-gray-100">
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.pricingRanges.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.pricingRanges.map((range) => (
                            <div key={range} className="bg-gray-100 rounded-md px-3 py-1 flex items-center gap-2">
                              <span className="text-black text-sm">{range}</span>
                              <button
                                type="button"
                                onClick={() => removePricingRange(range)}
                                className="text-gray-600 hover:text-black"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-black font-medium text-sm mb-3">Pricing Model</label>
                      <Select onValueChange={addPricingModel}>
                        <SelectTrigger className="bg-white border-gray-300 text-black">
                          <SelectValue placeholder="Select pricing model" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300">
                          {pricingModelOptions.filter(option => !formData.pricingModel.includes(option)).map((option) => (
                            <SelectItem key={option} value={option} className="text-black hover:bg-gray-100">
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.pricingModel.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.pricingModel.map((model) => (
                            <div key={model} className="bg-gray-100 rounded-md px-3 py-1 flex items-center gap-2">
                              <span className="text-black text-sm">{model}</span>
                              <button
                                type="button"
                                onClick={() => removePricingModel(model)}
                                className="text-gray-600 hover:text-black"
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

              {/* Step 5: Market & Deployment */}
              {currentStep === 5 && (
                <div className="flex-1 flex flex-col justify-center space-y-6">
                  <div className="mb-4 p-3 bg-gray-50 rounded border">
                    <p className="text-xs text-gray-700">
                      <strong>Instructions:</strong> Define your target market and deployment options. This helps potential customers understand if your solution fits their needs and technical requirements.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-black font-medium text-sm mb-3">Customer Segments</label>
                      <Select onValueChange={addCustomerSegment}>
                        <SelectTrigger className="bg-white border-gray-300 text-black">
                          <SelectValue placeholder="Select customer segments" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300">
                          {customerSegmentOptions.filter(option => !formData.customerSegments.includes(option)).map((option) => (
                            <SelectItem key={option} value={option} className="text-black hover:bg-gray-100">
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.customerSegments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.customerSegments.map((segment) => (
                            <div key={segment} className="bg-gray-100 rounded-md px-3 py-1 flex items-center gap-2">
                              <span className="text-black text-sm">{segment}</span>
                              <button
                                type="button"
                                onClick={() => removeCustomerSegment(segment)}
                                className="text-gray-600 hover:text-black"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-black font-medium text-sm mb-3">Deployment Type</label>
                      <Select onValueChange={addDeploymentType}>
                        <SelectTrigger className="bg-white border-gray-300 text-black">
                          <SelectValue placeholder="Select deployment types" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300">
                          {deploymentTypeOptions.filter(option => !formData.deploymentType.includes(option)).map((option) => (
                            <SelectItem key={option} value={option} className="text-black hover:bg-gray-100">
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.deploymentType.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.deploymentType.map((type) => (
                            <div key={type} className="bg-gray-100 rounded-md px-3 py-1 flex items-center gap-2">
                              <span className="text-black text-sm">{type}</span>
                              <button
                                type="button"
                                onClick={() => removeDeploymentType(type)}
                                className="text-gray-600 hover:text-black"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-black font-medium text-sm mb-3">Ideal Scenarios</label>
                    <Select onValueChange={addIdealScenario}>
                      <SelectTrigger className="bg-white border-gray-300 text-black">
                        <SelectValue placeholder="Select ideal customer scenarios" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-300">
                        {idealScenarioOptions.filter(option => !formData.idealScenarios.includes(option)).map((option) => (
                          <SelectItem key={option} value={option} className="text-black hover:bg-gray-100">
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.idealScenarios.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.idealScenarios.map((scenario) => (
                          <div key={scenario} className="bg-gray-100 rounded-md px-3 py-1 flex items-center gap-2">
                            <span className="text-black text-sm">{scenario}</span>
                            <button
                              type="button"
                              onClick={() => removeIdealScenario(scenario)}
                              className="text-gray-600 hover:text-black"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-3 text-black font-medium text-sm">
                      <input
                        type="checkbox"
                        checked={formData.trialAvailable}
                        onChange={(e) => setFormData(prev => ({ ...prev, trialAvailable: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span>Trial / Demo Available</span>
                    </label>
                    <p className="text-xs text-gray-600 mt-1 ml-7">
                      Check this if you offer a free trial, demo, or freemium version
                    </p>
                  </div>
                </div>
              )}

              {/* Step 6: Additional Info */}
              {currentStep === 6 && (
                <div className="flex-1 flex flex-col justify-center space-y-6">
                  <div className="mb-4 p-3 bg-gray-50 rounded border">
                    <p className="text-xs text-gray-700">
                      <strong>Instructions:</strong> Add supporting information to build credibility. Include notable clients, testimonials, and your company logo to enhance your listing's professional appearance.
                    </p>
                  </div>

                  <div>
                    <label className="block text-black font-medium text-sm mb-3">
                      Top Clients / Partners (Optional)
                      <span className="block text-xs text-gray-600 mt-1">
                        Add your notable clients or partners
                      </span>
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={newClient}
                          onChange={(e) => setNewClient(e.target.value)}
                          className="input"
                          placeholder="Enter client/partner information..."
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('topClients', newClient))}
                        />
                        <Button
                          type="button"
                          onClick={() => addItem('topClients', newClient)}
                          className="bg-black hover:bg-gray-800 text-white"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.topClients.map((client, index) => (
                          <div key={index} className="bg-gray-100 rounded-md px-3 py-1 flex items-center gap-2">
                            <span className="text-black text-sm">{client}</span>
                            <button
                              type="button"
                              onClick={() => removeItem('topClients', index)}
                              className="text-gray-600 hover:text-black"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="label">Testimonial Page (Optional)</label>
                    <Input
                      type="url"
                      value={formData.testimonialPage}
                      onChange={(e) => handleInputChange('testimonialPage', e.target.value)}
                      className="input"
                      placeholder="https://yourcompany.com/testimonials"
                    />
                  </div>

                  <div>
                    <label className="block text-black font-medium text-sm mb-3">Company Logo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="bg-white border border-gray-300 rounded text-black file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-100 file:text-black hover:file:bg-gray-200 w-full"
                    />
                    {formData.logo && (
                      <p className="text-gray-600 text-sm mt-1">Selected: {formData.logo.name}</p>
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
                    className="bg-white border-gray-300 text-black hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  {currentStep < steps.length - 1 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="bg-black hover:bg-gray-800 text-white"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-black text-white font-bold py-3 px-8 hover:bg-gray-800 transition-all duration-300"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  )}
                </div>
              )}
              </form>
            </div>
            

          </div>
        </div>
      </div>
      </div>
    </div>
  );
}