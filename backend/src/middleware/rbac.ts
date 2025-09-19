import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'ADMIN' | 'DRIVER' | 'MANAGER';
    permissions?: string[];
  };
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'ADMIN' | 'DRIVER' | 'MANAGER';
  iat?: number;
  exp?: number;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    
    // Optionally verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as 'ADMIN' | 'DRIVER' | 'MANAGER',
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
};

export const requireRole = (allowedRoles: ('ADMIN' | 'DRIVER' | 'MANAGER')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role,
      });
    }

    next();
  };
};

export const requirePermissions = (requiredPermissions: string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    try {
      // Fetch user permissions from database
      const userWithPermissions = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          role: {
            include: {
              permissions: true,
            },
          },
        },
      });

      if (!userWithPermissions) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }

      const userPermissions = userWithPermissions.role?.permissions?.map(p => p.name) || [];

      const hasAllPermissions = requiredPermissions.every(permission =>
        userPermissions.includes(permission)
      );

      if (!hasAllPermissions) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          required: requiredPermissions,
          current: userPermissions,
        });
      }

      req.user.permissions = userPermissions;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Permission check error',
      });
    }
  };
};

// Role-specific middleware shortcuts
export const requireAdmin = requireRole(['ADMIN']);
export const requireManager = requireRole(['ADMIN', 'MANAGER']);
export const requireDriver = requireRole(['DRIVER']);
export const requireAnyRole = requireRole(['ADMIN', 'MANAGER', 'DRIVER']);
