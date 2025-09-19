import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authGuard, adminGuard } from '../middleware/authGuard';

const router = Router();

// Authentication routes
/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 * @body    { refreshToken: string }
 */
router.post('/refresh', authController.refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (revoke refresh token)
 * @access  Private
 * @body    { refreshToken?: string }
 */
router.post('/logout', authGuard, authController.logout);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authGuard, authController.getProfile);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify access token (health check)
 * @access  Private
 */
router.get('/verify', authGuard, authController.verifyToken);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 * @body    { email: string }
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 * @body    { token: string, newPassword: string }
 */
router.post('/reset-password', authController.resetPassword);

/**
 * @route   POST /api/auth/cleanup-tokens
 * @desc    Clean up expired tokens (admin only)
 * @access  Private (Admin only)
 */
router.post('/cleanup-tokens', authGuard, adminGuard, authController.cleanupTokens);

export default router;
