import express from 'express';
import multer from 'multer';
import { signup, login, getMe, updateProfile, uploadProfileImage } from '../../controllers/authController.js';
import { authenticate } from '../../middleware/auth.js';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profile-images/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.round(Math.random() * 1E9));
    cb(null, 'profile-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

export const router = express.Router();

/**
 * @openapi
 * /auth/signup:
 *   post:
 *     summary: User signup
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               mobile:
 *                 type: string
 *     responses:
 *       201:
 *         description: Signup successful
 */
router.post('/signup', signup);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', login);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get current user data
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data retrieved successfully
 */
router.get('/me', authenticate, getMe);

/**
 * @openapi
 * /auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags:
 *       - Auth
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
 *               email:
 *                 type: string
 *               mobile:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/profile', authenticate, updateProfile);

/**
 * @openapi
 * /auth/profile-image:
 *   post:
 *     summary: Upload profile image
 *     tags:
 *       - Auth
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
 *         description: Profile image uploaded successfully
 */
router.post('/profile-image', authenticate, upload.single('profileImage'), uploadProfileImage); 