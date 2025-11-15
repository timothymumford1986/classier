import express from 'express';
import {
  googleCallback,
  microsoftCallback,
  getCurrentUser,
  logout
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// OAuth callbacks
router.post('/google/callback', googleCallback);
router.post('/microsoft/callback', microsoftCallback);

// Protected routes
router.get('/me', authenticate, getCurrentUser);
router.post('/logout', authenticate, logout);

export default router;
