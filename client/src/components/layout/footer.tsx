import { Link } from "wouter";
import { Bot } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-background border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company info */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-lg">AI Discovery</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              The leading platform for discovering and connecting with innovative AI tools for your business needs.
            </p>
          </div>

          {/* For Businesses */}
          <div>
            <h4 className="font-semibold mb-4">For Businesses</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Discover Tools
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-primary transition-colors">
                  Tool Categories
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-primary transition-colors">
                  Pricing Guide
                </Link>
              </li>
              <li>
                <Link href="/success-stories" className="hover:text-primary transition-colors">
                  Success Stories
                </Link>
              </li>
            </ul>
          </div>

          {/* For Startups */}
          <div>
            <h4 className="font-semibold mb-4">For Startups</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/dashboard" className="hover:text-primary transition-colors">
                  List Your Tool
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="hover:text-primary transition-colors">
                  Analytics
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-primary transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 AI Discovery Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
