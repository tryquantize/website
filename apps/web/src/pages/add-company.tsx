import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { ArrowLeft, Building2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { Component as RaycastAnimatedBackground } from "@/components/ui/raycast-animated-blue-background";

export default function AddCompanyPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    founded: '',
    headquarters: '',
    products: '',
    description: '',
    category: '',
    employees: '',
    pricing: '',
    features: '',
    useCases: '',
    officialPages: '',
    reviewPages: '',
    documentationPages: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await apiRequest('POST', '/api/add-company', formData);
      
      if (response.ok) {
        toast({
          title: 'Success!',
          description: 'Your company has been submitted for review.',
        });
        setLocation('/');
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit company. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative p-4">
      <div className="fixed inset-0">
        <RaycastAnimatedBackground />
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

        <Card className="bg-black/20 backdrop-blur-xl border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Building2 className="w-6 h-6" />
              Add Your Company to Our AI Directory
            </CardTitle>
            <p className="text-white/70">
              Submit your AI company details to be included in our search results
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm mb-2">Company Name *</label>
                  <Input
                    required
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="e.g., OpenAI"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm mb-2">Website *</label>
                  <Input
                    required
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="https://yourcompany.com"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm mb-2">Founded Year</label>
                  <Input
                    value={formData.founded}
                    onChange={(e) => handleInputChange('founded', e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="2023"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm mb-2">Headquarters</label>
                  <Input
                    value={formData.headquarters}
                    onChange={(e) => handleInputChange('headquarters', e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="San Francisco, CA"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm mb-2">Category *</label>
                  <Input
                    required
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="AI Platform, AI Writing, AI Image, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm mb-2">Employees</label>
                  <Input
                    value={formData.employees}
                    onChange={(e) => handleInputChange('employees', e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="50-100, 500+, etc."
                  />
                </div>
              </div>

              {/* Products & Description */}
              <div>
                <label className="block text-white/80 text-sm mb-2">Products/Services *</label>
                <Input
                  required
                  value={formData.products}
                  onChange={(e) => handleInputChange('products', e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="ChatGPT, GPT-4, DALL-E, Whisper"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">Company Description *</label>
                <Textarea
                  required
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="Brief description of your company and what it does"
                  rows={3}
                />
              </div>

              {/* Pricing */}
              <div>
                <label className="block text-white/80 text-sm mb-2">Pricing Information</label>
                <Textarea
                  value={formData.pricing}
                  onChange={(e) => handleInputChange('pricing', e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="Free tier: $0/month&#10;Basic: $20/month&#10;Pro: $50/month"
                  rows={4}
                />
              </div>

              {/* Features */}
              <div>
                <label className="block text-white/80 text-sm mb-2">Key Features</label>
                <Textarea
                  value={formData.features}
                  onChange={(e) => handleInputChange('features', e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="- Natural language processing&#10;- API access&#10;- Custom training"
                  rows={4}
                />
              </div>

              {/* Use Cases */}
              <div>
                <label className="block text-white/80 text-sm mb-2">Use Cases</label>
                <Textarea
                  value={formData.useCases}
                  onChange={(e) => handleInputChange('useCases', e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="Content Creation:&#10;- Blog writing&#10;- Marketing copy&#10;&#10;Development:&#10;- Code generation"
                  rows={5}
                />
              </div>

              {/* URLs for Scraping */}
              <div className="space-y-4">
                <h3 className="text-white font-medium">Additional URLs (Optional)</h3>
                
                <div>
                  <label className="block text-white/80 text-sm mb-2">Official Pages</label>
                  <Textarea
                    value={formData.officialPages}
                    onChange={(e) => handleInputChange('officialPages', e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="https://yourcompany.com/about&#10;https://yourcompany.com/pricing"
                    rows={2}
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm mb-2">Review Pages</label>
                  <Textarea
                    value={formData.reviewPages}
                    onChange={(e) => handleInputChange('reviewPages', e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="https://www.g2.com/products/your-product&#10;https://www.capterra.com/p/your-product"
                    rows={2}
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm mb-2">Documentation</label>
                  <Textarea
                    value={formData.documentationPages}
                    onChange={(e) => handleInputChange('documentationPages', e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="https://docs.yourcompany.com&#10;https://api.yourcompany.com/docs"
                    rows={2}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-white text-black hover:bg-gray-100"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Company'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}