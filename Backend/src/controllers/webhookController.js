import * as webhookService from '../services/webhookService.js';

export const handlePaymentWebhook = async (req, res, next) => {
  try {
    const { event, payload } = req.body;
    await webhookService.createWebhook(event, payload);
    res.json({ status: 'success', message: 'Webhook received' });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message, data: null });
  }
}; 