import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";

interface PartnerSuccessNotificationProps {
  isVisible: boolean;
  companyName: string;
}

export function PartnerSuccessNotification({ isVisible, companyName }: PartnerSuccessNotificationProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-lg shadow-lg border border-white/20 max-w-sm"
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-white" />
            <div>
              <p className="font-medium text-sm">Partnership Request Sent!</p>
              <p className="text-xs text-white/90">
                {companyName} will reach out to you soon.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}