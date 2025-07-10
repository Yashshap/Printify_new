import express from 'express';
import * as razorpayController from '../../controllers/razorpayController.js';
import { authenticate as protect } from '../../middleware/auth.js';

const router = express.Router();

// Route to create a Razorpay order
router.post('/orders', protect, razorpayController.createOrder);

// Route to verify payment signature
router.post('/verify-payment', protect, razorpayController.verifyPayment);

// Route to handle Razorpay webhooks (no authentication needed for webhooks)
router.post('/webhook', razorpayController.handleWebhook);

// Route to create transfers (for Razorpay Route)
router.post('/transfers', protect, razorpayController.createPaymentTransfer);

export default router;
