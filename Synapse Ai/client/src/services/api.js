import axios from 'axios';

const getBaseURL = () => {
  const url = import.meta.env.VITE_API_BASE_URL;
  if (url) return url;
  
  // If in production and no URL provided, we might be in a broken state
  if (import.meta.env.PROD) {
    console.warn('⚠️ Synapse AI: VITE_API_BASE_URL is not defined. Defaulting to localhost which may fail in production.');
  }
  
  return 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatically inject JWT pattern from Neural Vault
api.interceptors.request.use(config => {
  const token = localStorage.getItem('synapse_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authService = {
  login: (c) => api.post('/auth/login', c),
  register: (c) => api.post('/auth/register', c)
};

export const sessionService = {
  generate: (d) => api.post('/session/generate', d),
  history: () => api.get('/session/history'),
  chat: (d) => api.post('/session/chat', d),
  clear: () => api.delete('/session/clear'),
  deleteOne: (id) => api.delete(`/session/${id}`)
};

export default api;
