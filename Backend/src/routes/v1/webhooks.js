import express from 'express';
import { handlePaymentWebhook } from '../../controllers/webhookController.js';
export const router = express.Router();

/**
 * @openapi
 * /webhooks/payment:
 *   post:
 *     summary: Payment webhook endpoint
 *     tags:
 *       - Webhook
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *               payload:
 *                 type: object
 *     responses:
 *       200:
 *         description: Webhook received
 */
router.post('/payment', handlePaymentWebhook); 