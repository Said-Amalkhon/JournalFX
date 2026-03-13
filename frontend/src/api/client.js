import axios from 'axios';

const isProd = import.meta.env.PROD;
const baseURL = isProd
  ? 'https://api.amalkhon.tech/journalfx'
  : '/api';

const client = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

export const api = {
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
