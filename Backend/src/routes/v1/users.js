import express from 'express';
import { getUserProfile, updateUserProfile } from '../../controllers/userController.js';
import { authenticate } from '../../middleware/auth.js';
export const router = express.Router();

/**
 * @openapi
 * /users/me:
 *   get:
 *     summary: Get user profile
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 */
router.get('/me', authenticate, getUserProfile);

/**
 * @openapi
 * /users/me:
 *   patch:
 *     summary: Update user profile
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               mobile:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User profile updated
 */
router.patch('/me', authenticate, updateUserProfile); 