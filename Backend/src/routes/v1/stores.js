import express from 'express';
import { registerStore, getPendingStores, approveStore, getAllApprovedStores, getStoreByOwner, updateStoreProfile, updateStorePricing } from '../../controllers/storeController.js';
import { authenticate, authorizeRoles } from '../../middleware/auth.js';

export const router = express.Router();

/**
 * @openapi
 * /stores/register:
 *   post:
 *     summary: Register a store
 *     tags:
 *       - Store
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               storeName:
 *                 type: string
 *               shopAddress:
 *                 type: string
 *               supportPhone:
 *                 type: string
 *               businessName:
 *                 type: string
 *               gstNumber:
 *                 type: string
 *               bankAccount:
 *                 type: string
 *               billingAddress:
 *                 type: string
 *     responses:
 *       201:
 *         description: Store registered
 */
router.post('/register', authenticate, registerStore);

/**
 * @openapi
 * /stores/pending:
 *   get:
 *     summary: List pending stores (admin only)
 *     tags:
 *       - Store
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending stores
 */
router.get('/pending', authenticate, authorizeRoles('admin'), getPendingStores);

/**
 * @openapi
 * /stores/{id}/approve:
 *   post:
 *     summary: Approve a store (admin only)
 *     tags:
 *       - Store
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
 *         description: Store approved
 */
router.post('/:id/approve', authenticate, authorizeRoles('admin'), approveStore);

/**
 * @openapi
 * /stores/all-approved:
 *   get:
 *     summary: List all approved stores (public, paginated, filterable)
 *     tags:
 *       - Store
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
 *         description: List of approved stores
 */
router.get('/all-approved', getAllApprovedStores);

/**
 * @openapi
 * /stores/me:
 *   get:
 *     summary: Get own store profile
 *     tags:
 *       - Store
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Store profile
 */
router.get('/me', authenticate, getStoreByOwner);

/**
 * @openapi
 * /stores/{id}:
 *   patch:
 *     summary: Update store profile
 *     tags:
 *       - Store
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
 *               storeName:
 *                 type: string
 *               shopAddress:
 *                 type: string
 *               supportPhone:
 *                 type: string
 *               billingAddress:
 *                 type: string
 *     responses:
 *       200:
 *         description: Store profile updated
 */
router.patch('/:id', authenticate, updateStoreProfile);

/**
 * @openapi
 * /stores/{id}/pricing:
 *   patch:
 *     summary: Update store print prices
 *     tags:
 *       - Store
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
 *               blackWhitePrice:
 *                 type: number
 *               colorPrice:
 *                 type: number
 *     responses:
 *       200:
 *         description: Store pricing updated
 */
router.patch('/:id/pricing', authenticate, updateStorePricing); 