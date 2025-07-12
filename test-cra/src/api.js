import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: "http://localhost:4000/api/v1",
});

// Attach JWT token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Global API error interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401 || status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast('Session expired. Please log in again.', { type: 'error' });
        // Redirect to login if possible
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else if (status === 500) {
        toast('Server error. Please try again later.', { type: 'error' });
      } else {
        toast(error.response.data?.message || 'An error occurred.', { type: 'error' });
      }
    } else if (error.request) {
      toast('Network error. Please check your connection.', { type: 'error' });
    } else {
      toast(error.message, { type: 'error' });
    }
    return Promise.reject(error);
  }
);

export const createRazorpayOrder = (amount, currency, receipt, orderId) => api.post('/payments/orders', { amount, currency, receipt, orderId });
export const verifyRazorpayPayment = (razorpay_order_id, razorpay_payment_id, razorpay_signature) => api.post('/payments/verify-payment', { razorpay_order_id, razorpay_payment_id, razorpay_signature });

export default api; 