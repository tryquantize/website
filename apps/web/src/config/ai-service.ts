// AI Service Configuration
// This file manages the AI service URL for local development

const AI_SERVICE_CONFIG = {
  // Local development URL
  LOCAL_URL: 'http://localhost:5002',
  
  // Always use local URL
  getServiceUrl: () => {
    return AI_SERVICE_CONFIG.LOCAL_URL;
  },
  
  // Health check endpoint
  getHealthUrl: () => `${AI_SERVICE_CONFIG.getServiceUrl()}/health`,
  
  // Search endpoint
  getSearchUrl: () => `${AI_SERVICE_CONFIG.getServiceUrl()}/search`,
  
  // Suggestions endpoint
  getSuggestionsUrl: () => `${AI_SERVICE_CONFIG.getServiceUrl()}/suggestions`
};

export default AI_SERVICE_CONFIG;