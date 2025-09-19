import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Response Error:', error);
    const message = error.response?.data?.error || error.message || 'An error occurred';
    throw new Error(message);
  }
);

export const analyticsAPI = {
  // Site management
  getSites: async () => {
    const response = await api.get('/api/sites');
    return response.sites || [];
  },

  registerSite: async (siteData) => {
    const response = await api.post('/api/sites', siteData);
    return response.site;
  },

  // Analytics data
  getAnalytics: async (siteId, options = {}) => {
    const params = new URLSearchParams();
    
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);
    if (options.eventType) params.append('eventType', options.eventType);
    if (options.groupBy) params.append('groupBy', options.groupBy);
    
    const response = await api.get(`/api/analytics?siteId=${siteId}&${params.toString()}`);
    return response;
  },

  getSiteStats: async (siteId, options = {}) => {
    const params = new URLSearchParams();
    
    if (options.period) params.append('period', options.period);
    if (options.metric) params.append('metric', options.metric);
    
    const response = await api.get(`/api/sites/${siteId}/stats?${params.toString()}`);
    return response;
  },

  // Event collection (for testing)
  collectEvent: async (eventData) => {
    const response = await api.post('/api/events', eventData);
    return response;
  }
};

export default api;
