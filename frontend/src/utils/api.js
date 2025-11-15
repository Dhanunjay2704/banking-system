import axios from 'axios';

// Determine API base URL:
// - Prefer the build-time env var `REACT_APP_API_URL`.
// - If not provided but we're running on Render's domain, fall back to the known backend URL.
// - Otherwise default to local development URL.
const API_BASE_URL = process.env.REACT_APP_API_URL
  || (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')
    ? 'https://banking-system-backend-y0fu.onrender.com/api'
    : 'http://localhost:5000/api');

// Helpful debug log (will appear in browser console)
console.log('API base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
