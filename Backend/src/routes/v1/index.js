import express from 'express';
import { router as authRouter } from './auth.js';
import { router as storeRouter } from './stores.js';
import { router as orderRouter } from './orders.js';
import { router as usersRouter } from './users.js';
import { router as webhooksRouter } from './webhooks.js';

export const router = express.Router();

router.use('/auth', authRouter);
router.use('/stores', storeRouter);
router.use('/orders', orderRouter);
router.use('/users', usersRouter);
router.use('/webhooks', webhooksRouter); 