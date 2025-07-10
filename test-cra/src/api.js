import axios from 'axios';

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

export const createRazorpayOrder = (amount, currency, receipt, orderId) => api.post('/payments/orders', { amount, currency, receipt, orderId });
export const verifyRazorpayPayment = (razorpay_order_id, razorpay_payment_id, razorpay_signature) => api.post('/payments/verify-payment', { razorpay_order_id, razorpay_payment_id, razorpay_signature });

export default api; 