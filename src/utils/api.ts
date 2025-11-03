import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const storage = localStorage.getItem('tock-auth-storage');
    if (storage) {
      try {
        const { state } = JSON.parse(storage);
        if (state.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch (e) {
        console.error('Error parsing auth storage:', e);
      }
    }
  }
  return config;
});

export interface RegisterData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  login: string;
  password: string;
}

export const authAPI = {
  register: (data: RegisterData) => api.post('/api/auth/register', data),
  login: (data: LoginData) => api.post('/api/auth/login', data),
  verifyEmail: (token: string) => api.get(`/api/auth/verify-email?token=${token}`),
  getMe: () => api.get('/api/auth/me'),
  resendVerification: (email: string) => api.post('/api/auth/resend-verification', { email }),
};

