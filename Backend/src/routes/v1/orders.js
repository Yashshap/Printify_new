import express from 'express';
import { createOrder, getShopOrders, getUserOrders, deleteOrderPdf, updateOrderStatus } from '../../controllers/orderController.js';
import { authenticate } from '../../middleware/auth.js';
import { upload } from '../../utils/s3.js';
export const router = express.Router();

/**
 * @openapi
 * /orders/create:
 *   post:
 *     summary: Place an order (PDF upload)
 *     tags:
 *       - Order
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               pdf:
 *                 type: string
 *                 format: binary
 *               storeId:
 *                 type: string
 *               colorMode:
 *                 type: string
 *                 enum: [color, black_white]
 *               pageRange:
 *                 type: string
 *               paymentStatus:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *               discount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Order created
 */
router.post('/create', authenticate, upload.single('pdf'), createOrder);

/**
 * @openapi
 * /orders/shop/{storeId}:
 *   get:
 *     summary: List shop's orders (paginated, filterable)
 *     tags:
 *       - Order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of shop's orders
 */
router.get('/shop/:storeId', authenticate, getShopOrders);

/**
 * @openapi
 * /orders/user:
 *   get:
 *     summary: List user's orders (paginated, filterable)
 *     tags:
 *       - Order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of user's orders
 */
router.get('/user', authenticate, getUserOrders);

/**
 * @openapi
 * /orders/{id}/status:
 *   patch:
 *     summary: Update order status
 *     tags:
 *       - Order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated
 */
router.patch('/:id/status', authenticate, updateOrderStatus);

/**
 * @openapi
 * /orders/{id}/pdf:
 *   delete:
 *     summary: Delete order PDF and mark as completed
 *     tags:
 *       - Order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order PDF deleted
 */
router.delete('/:id/pdf', authenticate, deleteOrderPdf); 