import { Link, useLocation } from "wouter";
import { Linkedin, Twitter, Lock } from "lucide-react";
import { QuantizeLogo } from "@/components/quantize-logo";
import { ProductHuntBadge } from "@/components/product-hunt-badge";
import { useAuth } from "@/lib/auth";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { Button } from "@/components/ui/button";


export function Footer() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { currentUser } = useFirebaseAuth();

  const isLoggedIn = currentUser || (isAuthenticated && user);
  return (
    <footer className="bg-black/20 backdrop-blur-md border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company info */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <QuantizeLogo size={70} />
              <h3 className="font-bold text-lg bg-gradient-to-r from-purple-400 via-violet-500 to-indigo-600 bg-clip-text text-transparent">Quantize</h3>
            </div>
            <p className="text-white/120 text-sm">
              An AI Search Engine that Quantizes infinite information.
            </p>
            <div className="flex gap-4 mt-4">
              <a href="https://www.linkedin.com/company/tryquantize/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 hover:border-white/40 transition-all duration-300">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="https://x.com/tryquantize" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 hover:border-white/40 transition-all duration-300">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Navigation</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/home" className="hover:text-white transition-colors">
                  Search
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Company</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/add-company" className="hover:text-white transition-colors font-medium">
                  Add your company
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8">
          {/* Product Hunt Badge */}
          <div className="flex justify-center mb-6">
            <ProductHuntBadge />
          </div>
          
          <div className="text-center text-sm text-white/70 relative">
            <p>&copy; 2026 Quantize. All rights reserved.</p>
            <p className="mt-2">Made by Aditya Surana </p>
            
            {/* Admin Lock Icon - Bottom Right */}
            {isLoggedIn && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute bottom-0 right-0 w-6 h-6 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-full transition-all duration-300"
                onClick={() => setLocation('/admindashboard')}
              >
                <Lock className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
