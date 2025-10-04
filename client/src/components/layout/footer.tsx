/* File Overview
  Path: client/src/components/layout/footer.tsx
  Purpose: Layout UI components (shared page structure like header and footer).

  Reading tip for newcomers:
  - Scan the exports at the bottom to see what the rest of the app imports from here
  - Follow the data flow via function parameters and return values
*/

import { Link } from "wouter";
import { Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigation } from "@/hooks/use-navigation";


export function Footer({ showJoinUs = false }: { showJoinUs?: boolean }) {
  const { navigateWithLoading } = useNavigation();
  return (
    <>
      {/* Join Us Section - only on home page */}
      {showJoinUs && (
        <div className="bg-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-black/40 rounded-2xl p-8 border border-white/20 backdrop-blur-sm">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Business?
            </h2>
            <p className="text-white text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of startups, companies, and freelancers discovering the perfect AI solutions to accelerate growth and innovation.
            </p>
            <Button 
              size="lg" 
              className="bg-white hover:bg-gray-100 text-black px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-white/40 transition-all duration-300 transform hover:scale-105"
              onClick={() => navigateWithLoading('/onboarding')}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Enterprise Login
            </Button>
          </div>
        </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-transparent border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Company info */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
        <h3 className="font-bold text-lg bg-gradient-to-r from-purple-400 via-violet-500 to-indigo-600 bg-clip-text text-transparent">Quantize</h3>
              </div>
              <p className="text-white/80 text-sm">
                The intelligent AI search engine that understands your questions and delivers precise answers.
              </p>
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
                  <a href="mailto:info@quantize.site" className="hover:text-white transition-colors">
                    Contact: info@quantize.site
                  </a>
                </li>
                <li>
                  <a href="https://www.linkedin.com/company/tryquantize/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    LinkedIn
                  </a>
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
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-white/70">
            <p>&copy; 2025 Quantize. All rights reserved.</p>
            <p className="mt-2">Made by Aditya Surana</p>
          </div>
        </div>
      </footer>
    </>
  );
}
