// AI Service Configuration
// This file manages the AI service URL for different environments

const AI_SERVICE_CONFIG = {
  // Local development URL
  LOCAL_URL: 'http://localhost:5002',
  
  // Production Railway URL - UPDATE THIS AFTER DEPLOYMENT
  PRODUCTION_URL: process.env.VITE_AI_SERVICE_URL || 'https://your-railway-url.railway.app',
  
  // Determine which URL to use
  getServiceUrl: () => {
    // Use production URL if explicitly set or in production
    if (process.env.VITE_AI_SERVICE_URL || process.env.NODE_ENV === 'production') {
      return AI_SERVICE_CONFIG.PRODUCTION_URL;
    }
    // Default to local for development
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