import axios from 'axios';

// Create axios instance with baseURL configuration
const api = axios.create({
  baseURL: window.location.hostname === 'localhost' ? '' : import.meta.env.VITE_BACKEND_URL,
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
  } catch (error) {
    console.error('Error processing auth token:', error);
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
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