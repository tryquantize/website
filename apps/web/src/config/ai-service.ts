// AI Service Configuration
// This file manages the AI service URL for local development and production

const AI_SERVICE_CONFIG = {
  // Local development URL
  LOCAL_URL: 'http://localhost:5002',
  
  // Production URL
  PRODUCTION_URL: 'https://website-ocrz.onrender.com',
  
  // Get service URL based on environment with fallback
  getServiceUrl: () => {
    // Always try production URL first for reliability
    return AI_SERVICE_CONFIG.PRODUCTION_URL;
  },
  
  // Get local service URL for development
  getLocalServiceUrl: () => {
    return AI_SERVICE_CONFIG.LOCAL_URL;
  },
  
  // Health check endpoint
  getHealthUrl: () => `${AI_SERVICE_CONFIG.getServiceUrl()}/health`,
  
  // Search endpoint
  getSearchUrl: () => `${AI_SERVICE_CONFIG.getServiceUrl()}/search`,
  
  // Suggestions endpoint
  getSuggestionsUrl: () => `${AI_SERVICE_CONFIG.getServiceUrl()}/suggestions`,
  
  // Auto-fill endpoint
  getAutoFillUrl: () => `${AI_SERVICE_CONFIG.getServiceUrl()}/auto-fill-company`,
  
  // Add company endpoint
  getAddCompanyUrl: () => `${AI_SERVICE_CONFIG.getServiceUrl()}/add-company`,
  
  // Enhance text endpoint
  getEnhanceTextUrl: () => `${AI_SERVICE_CONFIG.getServiceUrl()}/enhance-text`
};

export default AI_SERVICE_CONFIG;