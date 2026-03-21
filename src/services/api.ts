import axios from 'axios';
import { auth } from '../firebase';

const api = axios.create({
  baseURL: '/api',
});

// Add a request interceptor to include the Firebase ID token
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const initializePayment = async (amount: number, email: string, userId: string) => {
  const response = await api.post('/fund/initialize', { amount, email, userId });
  return response.data;
};

export const buyGiftCard = async (userId: string, giftCardId: string) => {
  const response = await api.post('/buy/buy', { userId, giftCardId });
  return response.data;
};

export default api;
