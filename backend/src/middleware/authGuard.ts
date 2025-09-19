import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { AppError } from './errorHandler';

// Extended Request interface for authenticated requests
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    userId: string;
    email: string;
    role: string;
  };
}

/**
 * Authentication Guard Middleware
 * Verifies JWT access token and adds user info to request
 */
export const authGuard = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Access token is required', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      throw new AppError('Access token is required', 401);
    }

    // Verify the token and get user info
    const decoded = await AuthService.verifyAccessToken(token);

    // Add user info to request object
    req.user = {
      id: decoded.userId,
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Invalid or expired access token', 401));
    }
  }
};

/**
 * Role-based Authorization Guard
 * Checks if authenticated user has required role(s)
 */
export const roleGuard = (allowedRoles: string | string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const userRole = req.user.role;
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      if (!roles.includes(userRole)) {
        throw new AppError(
          `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${userRole}`,
          403
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Optional Authentication Guard
 * Adds user info to request if token is provided, but doesn't require it
 */
export const optionalAuthGuard = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      if (token) {
        try {
          const decoded = await AuthService.verifyAccessToken(token);
          req.user = {
            id: decoded.userId,
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
          };
        } catch (error) {
          // Silently ignore token errors for optional auth
          // req.user will remain undefined
        }
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Admin Only Guard
 * Shorthand for roleGuard(['ADMIN'])
 */
export const adminGuard = roleGuard(['ADMIN']);

/**
 * Manager or Admin Guard
 * Shorthand for roleGuard(['ADMIN', 'MANAGER'])
 */
export const managerGuard = roleGuard(['ADMIN', 'MANAGER']);

/**
 * Resource Owner Guard
 * Checks if user owns the resource or has admin/manager privileges
 */
export const resourceOwnerGuard = (resourceUserIdParam: string = 'userId') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const currentUserId = req.user.userId;
      const resourceUserId = req.params[resourceUserIdParam];
      const userRole = req.user.role;

      // Allow if user is admin or manager
      if (userRole === 'ADMIN' || userRole === 'MANAGER') {
        return next();
      }

      // Allow if user owns the resource
      if (currentUserId === resourceUserId) {
        return next();
      }

      throw new AppError('Access denied. You can only access your own resources.', 403);
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Active User Guard
 * Ensures the authenticated user account is active
 */
export const activeUserGuard = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    // Get fresh user data to check if account is still active
    const user = await AuthService.getUserProfile(req.user.userId);

    if (!user.isActive) {
      throw new AppError('Account is disabled. Please contact administrator.', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Role constants for easier usage
export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  DRIVER: 'DRIVER',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

// Combined guards for common use cases
export const authAndActiveGuard = [authGuard, activeUserGuard];
export const adminAndActiveGuard = [authGuard, activeUserGuard, adminGuard];
export const managerAndActiveGuard = [authGuard, activeUserGuard, managerGuard];
