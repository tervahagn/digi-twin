// API configuration for different environments
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://your-backend-api.com' // Replace with your actual backend URL
  : '';

// Mock data for GitHub Pages static deployment
const mockSurveyData = {
  id: 1,
  email: 'demo@example.com',
  responses: [],
  completed: false,
  createdAt: new Date().toISOString()
};

// API wrapper with fallback for static deployment
export const api = {
  async get(endpoint: string) {
    if (import.meta.env.PROD && !API_BASE_URL.startsWith('http')) {
      // Return mock data for GitHub Pages
      return { ok: true, json: () => Promise.resolve(mockSurveyData) };
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    return response;
  },

  async post(endpoint: string, data: any) {
    if (import.meta.env.PROD && !API_BASE_URL.startsWith('http')) {
      // Return mock success for GitHub Pages
      return { 
        ok: true, 
        json: () => Promise.resolve({ success: true, data: mockSurveyData }) 
      };
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response;
  }
};