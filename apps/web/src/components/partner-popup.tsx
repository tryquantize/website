import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Handshake, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PartnerPopupProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
  companyEmail?: string;
  companyWebsite?: string;
  companyLinkedIn?: string;
  searchQuery?: string;
  onSubmit: (formData: { 
    name: string; 
    phone: string; 
    email: string;
    companyEmail?: string;
    companyWebsite?: string;
    companyLinkedIn?: string;
  }) => Promise<void>;
}

export function PartnerPopup({ 
  isOpen, 
  onClose, 
  companyName, 
  companyEmail,
  companyWebsite,
  companyLinkedIn,
  searchQuery, 
  onSubmit 
}: PartnerPopupProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.phone && formData.email && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onSubmit({
          ...formData,
          companyEmail,
          companyWebsite,
          companyLinkedIn
        });
        setFormData({ name: "", phone: "", email: "" });
      } finally {
        setIsSubmitting(false);
      }
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
                <Handshake className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-semibold text-white">Partner Request</h3>
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
              <p className="text-white/80 text-sm">
                Request partnership with <span className="font-semibold text-white">{companyName}</span>
                {searchQuery && (
                  <span className="text-white/60"> for "{searchQuery}"</span>
                )}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Your Name *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your full name"
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
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter your phone number"
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
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email address"
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
                  className="flex-1 bg-white text-black font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
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