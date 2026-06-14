import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 90000, // Render free tier cold starts can take 30–60s
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('collegesathi_token');
    const adminToken = sessionStorage.getItem('collegesathi_admin_token');
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 responses (skip for admin login attempts)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isAdminAuth = url.includes('/admin/login') || url.includes('/admin/verify-otp');

    if (error.response?.status === 401 && !isAdminAuth) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('collegesathi_token');
        localStorage.removeItem('collegesathi_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
