import axios, { InternalAxiosRequestConfig } from 'axios';

const backendOrigin = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
const apiBase = backendOrigin ? `${backendOrigin}/api` : '/api';

const api = axios.create({
  baseURL: apiBase,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 90000,
});

type AuthKind = 'user' | 'admin';

interface AuthAxiosConfig extends InternalAxiosRequestConfig {
  authKind?: AuthKind;
}

// Use admin token only for /admin/* — user token for wishlist, auth, etc.
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const url = config.url || '';
    const isAdminRoute = url.startsWith('/admin');
    const userToken = localStorage.getItem('collegesathi_token');
    const adminToken = sessionStorage.getItem('collegesathi_admin_token');
    const authConfig = config as AuthAxiosConfig;

    if (isAdminRoute && adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
      authConfig.authKind = 'admin';
    } else if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
      authConfig.authKind = 'user';
    } else if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
      authConfig.authKind = 'admin';
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isAdminAuth = url.includes('/admin/login') || url.includes('/admin/verify-otp');
    const authKind = (error.config as AuthAxiosConfig | undefined)?.authKind;

    if (error.response?.status === 401 && !isAdminAuth && typeof window !== 'undefined') {
      if (authKind === 'user') {
        localStorage.removeItem('collegesathi_token');
        localStorage.removeItem('collegesathi_user');
      } else if (authKind === 'admin') {
        sessionStorage.removeItem('collegesathi_admin_token');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
