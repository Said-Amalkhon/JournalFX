import axios from 'axios';

const isProd = import.meta.env.PROD;
const baseURL = isProd
  ? 'https://api.amalkhon.tech/journalfx'
  : '/api';

const client = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT from localStorage on every request
client.interceptors.request.use(config => {
  const token = localStorage.getItem('jfx_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
client.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('jfx_token');
      localStorage.removeItem('jfx_username');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const api = {
  // Auth
  register: (username, email, password) => client.post('/auth/register', { username, email, password }).then(r => r.data),
  login: (login, password) => client.post('/auth/login', { login, password }).then(r => r.data),
  forgotPassword: (login) => client.post('/auth/forgot-password', { login }).then(r => r.data),
  verifyCode: (login, code) => client.post('/auth/verify-code', { login, code }).then(r => r.data),
  resetPassword: (resetToken, password) => client.post('/auth/reset-password', { resetToken, password }).then(r => r.data),
  getProfile: () => client.get('/auth/profile').then(r => r.data),
  updateProfile: (data) => client.put('/auth/profile', data).then(r => r.data),
  changePassword: (currentPassword, newPassword) => client.put('/auth/change-password', { currentPassword, newPassword }).then(r => r.data),

  // Dashboard
  getDashboard: () => client.get('/dashboard').then(r => r.data),

  // Trades
  getTrades: (filter) => client.get('/trades', { params: filter ? { filter } : {} }).then(r => r.data),
  getTrade: (id) => client.get(`/trades/${id}`).then(r => r.data),
  createTrade: (data) => client.post('/trades', data).then(r => r.data),
  updateTrade: (id, data) => client.put(`/trades/${id}`, data).then(r => r.data),
  deleteTrade: (id) => client.delete(`/trades/${id}`).then(r => r.data),

  // Targets
  getCurrentTarget: () => client.get('/targets/current').then(r => r.data),
  setTarget: (data) => client.post('/targets', data).then(r => r.data),
  getTargetHistory: () => client.get('/targets').then(r => r.data),
};

export default client;
