import express from 'express';
import { getUserProfile, updateUserProfile, updateUserProfileImage } from '../../controllers/userController.js';
import { authenticate } from '../../middleware/auth.js';
import { uploadProfileImage } from '../../utils/s3.js';
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

/**
 * @openapi
 * /users/me/profile-image:
 *   put:
 *     summary: Update user profile image
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: User profile image updated
 */
router.put('/me/profile-image', authenticate, uploadProfileImage.single('profileImage'), updateUserProfileImage); 