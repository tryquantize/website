/**
 * Prompt Enhancement Utility
 * Transforms basic user queries into detailed, comprehensive search prompts
 */

interface EnhancementPattern {
  pattern: RegExp;
  template: string;
  category: 'industry' | 'function' | 'integration' | 'usecase';
}

interface PromptContext {
  userRole?: string;
  industry?: string;
  companySize?: string;
  techStack?: string[];
}

/**
 * Predefined enhancement patterns for common search queries
 */
const ENHANCEMENT_PATTERNS: EnhancementPattern[] = [
  // Industry-specific enhancements
  {
    pattern: /\b(e-?commerce|online store|shop)\b/i,
    template: "AI tools for e-commerce businesses that help with product catalog management, customer service automation, personalized recommendations, inventory optimization, and sales analytics. Looking for solutions that integrate with Shopify, WooCommerce, or custom platforms.",
    category: 'industry'
  },
  
  {
    pattern: /\b(healthcare|medical|clinic|hospital)\b/i,
    template: "Healthcare AI solutions for medical practices including patient scheduling automation, clinical documentation assistance, diagnostic support tools, and patient communication systems. Need HIPAA-compliant tools that integrate with electronic health records (EHR).",
    category: 'industry'
  },
  
  {
    pattern: /\b(real estate|property|realtor)\b/i,
    template: "Real estate AI tools for property professionals including lead generation automation, property valuation assistance, client communication management, market analysis tools, and listing optimization.",
    category: 'industry'
  },
  
  // Function-specific enhancements
  {
    pattern: /\b(chatbot|customer service|support)\b/i,
    template: "Customer service AI chatbot solutions that provide 24/7 automated support, handle common inquiries, integrate with existing help desk systems, support multiple languages, and can escalate complex issues to human agents.",
    category: 'function'
  },
  
  {
    pattern: /\b(content|writing|blog|social media)\b/i,
    template: "AI content creation tools for generating blog posts, social media content, marketing copy, and website text. Looking for solutions that maintain brand voice consistency, support SEO optimization, and integrate with content management systems.",
    category: 'function'
  },
  
  {
    pattern: /\b(analytics|data|insights|reporting)\b/i,
    template: "Business intelligence and data analytics AI tools that provide automated reporting, predictive insights, data visualization, and performance tracking. Need solutions that integrate with existing databases and support custom dashboards.",
    category: 'function'
  },
  
  // Integration-specific enhancements
  {
    pattern: /\b(slack|teams|microsoft|google workspace)\b/i,
    template: "Workplace productivity AI tools that integrate seamlessly with team collaboration platforms like Slack, Microsoft Teams, or Google Workspace. Looking for solutions that enhance team communication and automate routine tasks.",
    category: 'integration'
  },
  
  {
    pattern: /\b(salesforce|crm|sales)\b/i,
    template: "Sales AI tools that integrate with CRM systems like Salesforce to automate lead scoring, enhance customer relationship management, provide sales forecasting, and streamline the sales pipeline.",
    category: 'integration'
  },
  
  // Use case specific enhancements
  {
    pattern: /\b(automat|workflow|process)\b/i,
    template: "Business process automation AI tools that streamline repetitive tasks, create intelligent workflows, and reduce manual work across departments. Looking for solutions with workflow builders and integration capabilities.",
    category: 'usecase'
  },
  
  {
    pattern: /\b(email|marketing|campaign)\b/i,
    template: "Email marketing AI tools that create personalized campaigns, optimize send times, generate compelling subject lines, and provide advanced segmentation. Need solutions with A/B testing capabilities and automated drip campaigns.",
    category: 'usecase'
  }
];

/**
 * Enhances a basic search query into a detailed, comprehensive prompt
 */
export async function enhancePrompt(
  originalQuery: string,
  context?: PromptContext
): Promise<string> {
  try {
    const cleanQuery = originalQuery.trim().toLowerCase();
    
    if (!cleanQuery || cleanQuery.length < 3) {
      throw new Error('Query too short for enhancement');
    }
    
    // Try pattern-based enhancement first
    const patternMatch = findMatchingPattern(cleanQuery);
    if (patternMatch) {
      return contextualizePrompt(patternMatch.template, context, originalQuery);
    }
    
    // Fallback enhancement for unique queries
    return `AI tools and software solutions related to "${originalQuery}". Looking for comprehensive options that include features, pricing details, integration capabilities, user reviews, and implementation guidance. Please provide both established and emerging solutions with clear comparisons.`;
    
  } catch (error) {
    console.error('Prompt enhancement failed:', error);
    return `AI tools and solutions for: ${originalQuery}. Please provide detailed options with features, pricing, and integration capabilities.`;
  }
}

/**
 * Finds the best matching enhancement pattern for a query
 */
function findMatchingPattern(query: string): EnhancementPattern | null {
  const sortedPatterns = [...ENHANCEMENT_PATTERNS].sort((a, b) => 
    b.pattern.source.length - a.pattern.source.length
  );
  
  for (const pattern of sortedPatterns) {
    if (pattern.pattern.test(query)) {
      return pattern;
    }
  }
  
  return null;
}

/**
 * Adds user context to enhancement templates for personalization
 */
function contextualizePrompt(
  template: string,
  context?: PromptContext,
  originalQuery?: string
): string {
  let enhancedPrompt = template;
  
  if (context?.industry) {
    enhancedPrompt += ` Specifically for the ${context.industry} industry.`;
  }
  
  if (context?.companySize) {
    enhancedPrompt += ` Suitable for ${context.companySize} businesses.`;
  }
  
  if (context?.techStack && context.techStack.length > 0) {
    enhancedPrompt += ` Must integrate with: ${context.techStack.join(', ')}.`;
  }
  
  enhancedPrompt += ` Please include both free/low-cost options and premium solutions, with clear pricing information and implementation complexity levels.`;
  
  return enhancedPrompt;
}