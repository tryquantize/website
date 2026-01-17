/**
 * Utility functions for extracting company contact information
 */

interface Company {
  name: string;
  description: string;
  features: string[];
  pricing: string;
  website: string;
  category: string;
  specifications?: string[];
  location?: string;
  about?: string[];
  linkedin_url?: string;
  rating?: {
    rating: number;
    reviews: number;
  };
  // Enhanced fields from RAG
  companyStage?: string;
  industriesServed?: string[];
  pricingRanges?: string[];
  pricingModel?: string[];
  employees?: string;
  productsServices?: string[];
  topClients?: string[];
  logoUrl?: string;
  founded?: string;
  enhancedAbout?: string;
  enhancedUseCases?: string[];
  tagline?: string;
  trialAvailable?: boolean;
  customerSegments?: string[];
  uspTagline?: string;
  deploymentType?: string[];
  idealScenarios?: string[];
}

export interface CompanyContactInfo {
  companyName: string;
  companyEmail?: string;
  companyWebsite?: string;
  companyLinkedIn?: string;
}

/**
 * Extract contact information from a company object
 */
export function extractCompanyContactInfo(company: Company): CompanyContactInfo {
  return {
    companyName: company.name,
    companyEmail: extractCompanyEmail(company),
    companyWebsite: company.website && company.website !== "#" ? company.website : undefined,
    companyLinkedIn: company.linkedin_url || undefined
  };
}

/**
 * Extract company email from various sources
 * This is a placeholder - in a real implementation, you might:
 * 1. Have email stored in company data
 * 2. Extract from website contact pages
 * 3. Use a service to find company emails
 */
function extractCompanyEmail(company: Company): string | undefined {
  // For now, we'll try to construct a generic email based on the website
  if (company.website && company.website !== "#") {
    try {
      const url = new URL(company.website);
      const domain = url.hostname.replace('www.', '');
      
      // Common email patterns for companies
      const commonEmails = [
        `contact@${domain}`,
        `info@${domain}`,
        `hello@${domain}`,
        `support@${domain}`
      ];
      
      // Return the first one as a best guess
      return commonEmails[0];
    } catch (error) {
      console.error('Error parsing company website URL:', error);
    }
  }
  
  return undefined;
}

/**
 * Format company name for display
 */
export function formatCompanyName(name: string): string {
  return name
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()) // Capitalize first letter of each word
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim(); // Remove leading/trailing spaces
}