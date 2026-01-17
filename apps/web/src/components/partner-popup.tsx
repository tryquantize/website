import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Handshake } from "lucide-react";
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
  }) => void;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.phone && formData.email) {
      onSubmit({
        ...formData,
        companyEmail,
        companyWebsite,
        companyLinkedIn
      });
      setFormData({ name: "", phone: "", email: "" });
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
              <p className="text-white/80 text-sm mb-2">
                Request partnership with <span className="font-semibold text-white">{companyName}</span>
                {searchQuery && (
                  <span className="text-white/60"> for "{searchQuery}"</span>
                )}
              </p>
              
              {/* Show available company contact information */}
              {(companyEmail || companyWebsite || companyLinkedIn) && (
                <div className="bg-white/5 rounded-lg p-3 mt-2">
                  <p className="text-xs text-white/60 mb-2">Company Contact Information:</p>
                  <div className="space-y-1 text-xs">
                    {companyEmail && (
                      <div className="flex items-center gap-2">
                        <span className="text-white/60">Email:</span>
                        <span className="text-white/80">{companyEmail}</span>
                      </div>
                    )}
                    {companyWebsite && (
                      <div className="flex items-center gap-2">
                        <span className="text-white/60">Website:</span>
                        <span className="text-white/80 truncate">{companyWebsite}</span>
                      </div>
                    )}
                    {companyLinkedIn && (
                      <div className="flex items-center gap-2">
                        <span className="text-white/60">LinkedIn:</span>
                        <span className="text-white/80 truncate">{companyLinkedIn}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
                  className="flex-1 bg-white text-black font-medium hover:bg-gray-100"
                >
                  Submit Request
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}