import axios from 'axios';

const getBaseURL = () => {
  const url = import.meta.env.VITE_API_BASE_URL;
  
  if (url) {
    console.log('🚀 Synapse AI: Connecting to Neural Backend at:', url);
    return url;
  }

  // For production builds, we need the URL to be baked in
  if (import.meta.env.PROD) {
    console.error('❌ Synapse AI Error: VITE_API_BASE_URL is not defined! API calls will fail on the live site.');
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
