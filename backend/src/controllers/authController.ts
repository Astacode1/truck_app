import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/rbac';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthService } from '../services/authService';

export const authController = {
  // Register a new user
  register: asyncHandler(async (req: Request, res: Response) => {
    const { email, password, firstName, lastName, role = 'DRIVER', phone } = req.body;

    // Basic validation
    if (!email || !password || !firstName || !lastName) {
      throw new AppError('Email, password, first name, and last name are required', 400);
    }

    const result = await AuthService.register({
      email,
      password,
      firstName,
      lastName,
      role,
      phone,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: result.user,
        tokens: result.tokens,
      },
    });
  }),

  // Login user
  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const result = await AuthService.login({ email, password });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        tokens: result.tokens,
      },
    });
  }),

  // Refresh access token
  refreshToken: asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    const result = await AuthService.refreshAccessToken(refreshToken);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        tokens: result,
      },
    });
  }),

  // Logout user
  logout: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { refreshToken } = req.body;
    const userId = req.user?.id;

    if (userId) {
      await AuthService.logout(userId, refreshToken);
    }

    res.json({
      success: true,
      message: 'Logout successful',
    });
  }),

  // Get current user profile
  getProfile: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('User not found', 404);
    }

    const user = await AuthService.getUserProfile(userId);

    res.json({
      success: true,
      data: { user },
    });
  }),

  // Forgot password
  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    // Basic validation
    if (!email) {
      throw new AppError('Email is required', 400);
    }

    const result = await AuthService.forgotPassword(email);

    const response: any = {
      success: true,
      message: result.message,
    };

    // Note: In production, never return the actual reset token
    if (result.resetToken) {
      response.data = { resetToken: result.resetToken };
    }

    res.json(response);
  }),

  // Reset password with token
  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    // Basic validation
    if (!token || !newPassword) {
      throw new AppError('Token and new password are required', 400);
    }

    await AuthService.resetPassword(token, newPassword);

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  }),

  // Verify token
  verifyToken: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        user: {
          id: req.user?.id,
          email: req.user?.email,
          role: req.user?.role,
        },
      },
    });
  }),

  // Clean up expired tokens (admin only)
  cleanupTokens: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (req.user?.role !== 'ADMIN') {
      throw new AppError('Access denied. Admin role required.', 403);
    }

    await AuthService.cleanupExpiredTokens();

    res.json({
      success: true,
      message: 'Expired tokens cleaned up successfully',
    });
  }),
};
