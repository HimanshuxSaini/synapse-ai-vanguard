import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
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
