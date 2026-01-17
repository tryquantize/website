import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Users, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { app } from '@/lib/firebase-init';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { companyLeadsService } from '@/services/company-leads';

interface Company {
  name: string;
  website?: string;
  linkedin_url?: string;
  // Add other company fields as needed
}

interface CompanyOutreachFormProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
  searchQuery: string;
}

export function CompanyOutreachForm({ isOpen, onClose, companies, searchQuery }: CompanyOutreachFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const db = getFirestore(app);
      
      // Extract company information with potential contact details
      const companyList = companies.map(company => ({
        name: company.name,
        website: company.website || null,
        linkedIn: company.linkedin_url || null,
        // Generate potential company email from website
        potentialEmail: company.website ? 
          `contact@${company.website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]}` : 
          null
      }));

      await addDoc(collection(db, 'companyOutreachRequests'), {
        userName: formData.name,
        userEmail: formData.email,
        userPhone: formData.phone,
        searchQuery,
        companies: companyList,
        companiesCount: companies.length,
        timestamp: serverTimestamp(),
        status: 'pending'
      });

      // Also submit to the new company leads system
      await companyLeadsService.submitLead({
        userName: formData.name,
        userEmail: formData.email,
        userPhone: formData.phone,
        searchQuery,
        searchResults: companies.map(company => ({
          name: company.name,
          companyName: company.name
        }))
      });

      console.log('Company outreach request submitted successfully');
      onClose();
      setFormData({ name: '', email: '', phone: '' });
      
      // Show success message
      alert('Request submitted! Companies will be able to reach out to you.');
      
    } catch (error) {
      console.error('Error submitting outreach request:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Company Outreach</h3>
              </div>
              <Button
                onClick={onClose}
                size="sm"
                variant="ghost"
                className="p-1 h-auto text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="mb-4">
              <p className="text-white/80 text-sm mb-2">
                Allow companies from your search results to reach out to you directly.
              </p>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-white/60 mb-1">Search Query: "{searchQuery}"</p>
                <p className="text-xs text-white/60">{companies.length} companies will receive your contact information</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Your Name *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Email Address *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email address"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Phone Number *
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 border-white/20 text-white/80 hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}