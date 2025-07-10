import * as razorpayService from '../services/razorpayService.js';
import * as orderService from '../services/orderService.js';
import crypto from 'crypto';
import * as storeService from '../services/storeService.js';

export const createOrder = async (req, res) => {
  try {
    const { amount, currency, receipt, orderId } = req.body;
    const order = await razorpayService.createRazorpayOrder(amount, currency, receipt);
    // Save Razorpay order ID to your internal order
    await orderService.updateOrder(orderId, { razorpayOrderId: order.id });
    res.json({ status: 'success', message: 'Razorpay order created', data: order });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message, data: null });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const secret = process.env.RAZORPAY_KEY_SECRET; // Use your key secret for verification

    const isValid = razorpayService.verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      secret
    );

    if (isValid) {
      // Payment is successful, update your order status in the database
      await orderService.updateOrder(razorpay_order_id, { status: 'paid', razorpayPaymentId: razorpay_payment_id });
      res.json({ status: 'success', message: 'Payment verified successfully', data: { orderId: razorpay_order_id, paymentId: razorpay_payment_id } });
    } else {
      res.status(400).json({ status: 'error', message: 'Payment verification failed', data: null });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message, data: null });
  }
};

export const handleWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET; // Define a webhook secret in your .env
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest === req.headers['x-razorpay-signature']) {
      console.log('Webhook request is valid');
      // Process the webhook event
      const event = req.body.event;
      const payload = req.body.payload;

      switch (event) {
        case 'payment.captured':
          // Handle successful payment capture
          console.log('Payment Captured:', payload.payment.entity.id);
          await orderService.updateOrder(payload.payment.entity.order_id, { status: 'paid', razorpayPaymentId: payload.payment.entity.id });
          break;
        case 'order.paid':
          // Handle order paid event
          console.log('Order Paid:', payload.order.entity.id);
          await orderService.updateOrder(payload.order.entity.id, { status: 'paid' });
          break;
        case 'payment.failed':
          // Handle failed payment
          console.log('Payment Failed:', payload.payment.entity.id);
          await orderService.updateOrder(payload.payment.entity.order_id, { status: 'failed', razorpayPaymentId: payload.payment.entity.id });
          break;
        case 'account.kyc.verification.completed':
          // Handle KYC verification completed
          try {
            const accountId = payload.account.entity.id;
            console.log('KYC Verification Completed for account:', accountId);
            await storeService.updateStoreKycStatus(accountId, 'approved');
          } catch (err) {
            console.error('Error updating store KYC status (completed):', err);
          }
          break;
        case 'account.kyc.verification.failed':
          // Handle KYC verification failed
          try {
            const accountId = payload.account.entity.id;
            console.log('KYC Verification Failed for account:', accountId);
            await storeService.updateStoreKycStatus(accountId, 'rejected');
          } catch (err) {
            console.error('Error updating store KYC status (failed):', err);
          }
          break;
        // Add more cases for other events as needed
        default:
          console.log('Unhandled webhook event:', event);
      }
      res.json({ status: 'success' });
    } else {
      console.log('Webhook signature mismatch');
      res.status(400).json({ status: 'error', message: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createPaymentTransfer = async (req, res) => {
  try {
    const { paymentId, transfers } = req.body;
    const transfer = await razorpayService.createTransfer(paymentId, transfers);
    res.json({ status: 'success', message: 'Payment transfer created', data: transfer });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message, data: null });
  }
};
