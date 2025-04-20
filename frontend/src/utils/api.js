import axios from 'axios';

// Determine if we're in development or production
const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';

// Create axios instance with baseURL configuration
const api = axios.create({
  // In development, use relative paths
  // In production, use the full VITE_BACKEND_URL
  baseURL: isDevelopment ? '' : import.meta.env.VITE_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to handle auth
api.interceptors.request.use(config => {
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
    
    // Log the request in development
    if (isDevelopment) {
      console.log(`API Request: ${config.method.toUpperCase()} ${config.baseURL || ''}${config.url}`, config);
    }
  } catch (error) {
    console.error('Error processing auth token:', error);
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Response interceptor for error handling
api.interceptors.response.use(
  response => {
    // Log the response in development
    if (isDevelopment) {
      console.log(`API Response: ${response.status} ${response.config.url}`, response.data);
    }
    return response;
  },
  error => {
    // Log error details in development
    if (isDevelopment) {
      console.error(`API Error: ${error.config?.url || 'unknown'}`, error.response?.data || error.message);
    }
    
    // Handle common errors
    if (error.response) {
      if (error.response.status === 401) {
        // Handle unauthorized
        try {
          localStorage.removeItem('user');
          localStorage.removeItem('selectedBlog');
        } catch (e) {
          console.error('Error clearing localStorage:', e);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api; 