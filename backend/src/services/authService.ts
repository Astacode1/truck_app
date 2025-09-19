import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { config } from '../config/database';

const prisma = new PrismaClient();

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'ADMIN' | 'DRIVER' | 'MANAGER';
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
  };
  tokens: UserTokens;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  type: 'access' | 'refresh';
}

export class AuthService {
  // Generate JWT tokens
  static generateTokens(userId: string, email: string, role: string): UserTokens {
    const accessToken = jwt.sign(
      { userId, email, role, type: 'access' },
      config.jwt.secret,
      { expiresIn: config.jwt.accessTokenExpiry }
    );

    const refreshToken = jwt.sign(
      { userId, email, role, type: 'refresh' },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshTokenExpiry }
    );

    return { accessToken, refreshToken };
  }

  // Hash password
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  // Compare password
  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Validate password strength
  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    }

    return { isValid: errors.length === 0, errors };
  }

  // Store refresh token in database
  static async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as any;
      const expiresAt = new Date(decoded.exp * 1000);

      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId,
          expiresAt,
        },
      });
    } catch (error) {
      throw new AppError('Invalid refresh token format', 400);
    }
  }

  // Remove refresh token from database
  static async revokeRefreshToken(refreshToken: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { isRevoked: true },
    });
  }

  // Remove all refresh tokens for a user
  static async revokeAllUserTokens(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
  }

  // Verify refresh token exists and is valid
  static async verifyRefreshToken(refreshToken: string): Promise<boolean> {
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    return tokenRecord !== null && 
           !tokenRecord.isRevoked && 
           tokenRecord.expiresAt > new Date();
  }

  // Clean up expired tokens
  static async cleanupExpiredTokens(): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { isRevoked: true },
        ],
      },
    });
  }

  // Register new user
  static async register(data: RegisterData): Promise<AuthResult> {
    // Validate password
    const passwordValidation = this.validatePassword(data.password);
    if (!passwordValidation.isValid) {
      throw new AppError(`Password validation failed: ${passwordValidation.errors.join(', ')}`, 400);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Hash password
    const hashedPassword = await this.hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: hashedPassword,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        role: data.role || 'DRIVER',
        phone: data.phone?.trim() || null,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email, user.role);

    // Store refresh token
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return { user, tokens };
  }

  // Login user
  static async login(data: LoginData): Promise<AuthResult> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify password
    const isPasswordValid = await this.comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email, user.role);

    // Store refresh token
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, tokens };
  }

  // Refresh access token
  static async refreshAccessToken(refreshToken: string): Promise<UserTokens> {
    try {
      // Verify token signature
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as JWTPayload;

      if (decoded.type !== 'refresh') {
        throw new AppError('Invalid token type', 401);
      }

      // Check if token exists in database and is valid
      const isValidToken = await this.verifyRefreshToken(refreshToken);
      if (!isValidToken) {
        throw new AppError('Invalid or expired refresh token', 401);
      }

      // Verify user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, role: true, isActive: true },
      });

      if (!user || !user.isActive) {
        throw new AppError('User not found or inactive', 401);
      }

      // Generate new tokens
      const newTokens = this.generateTokens(user.id, user.email, user.role);

      // Revoke old refresh token
      await this.revokeRefreshToken(refreshToken);

      // Store new refresh token
      await this.storeRefreshToken(user.id, newTokens.refreshToken);

      return newTokens;
    } catch (error) {
      if (error instanceof Error && error.name === 'JsonWebTokenError') {
        throw new AppError('Invalid refresh token', 401);
      }
      throw error;
    }
  }

  // Logout user
  static async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      // Revoke specific refresh token
      await this.revokeRefreshToken(refreshToken);
    } else {
      // Revoke all refresh tokens for user
      await this.revokeAllUserTokens(userId);
    }
  }

  // Get user profile
  static async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  // Verify JWT token
  static async verifyAccessToken(accessToken: string): Promise<JWTPayload> {
    try {
      const decoded = jwt.verify(accessToken, config.jwt.secret) as JWTPayload;
      
      if (decoded.type !== 'access') {
        throw new AppError('Invalid token type', 401);
      }

      // Optionally verify user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, isActive: true },
      });

      if (!user || !user.isActive) {
        throw new AppError('User not found or inactive', 401);
      }

      return decoded;
    } catch (error) {
      if (error instanceof Error && error.name === 'JsonWebTokenError') {
        throw new AppError('Invalid access token', 401);
      }
      throw error;
    }
  }

  // Forgot password (generate reset token)
  static async forgotPassword(email: string): Promise<{ resetToken?: string; message: string }> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, isActive: true },
    });

    // Don't reveal if user exists for security
    if (!user || !user.isActive) {
      return { message: 'If the email exists, a password reset link has been sent.' };
    }

    // Generate reset token (short-lived, 1 hour)
    const resetToken = jwt.sign(
      { userId: user.id, email: user.email, type: 'password_reset' },
      config.jwt.secret,
      { expiresIn: '1h' }
    );

    // In production, you would send this via email
    // For now, we'll return it (remove this in production)
    return { 
      resetToken, 
      message: 'If the email exists, a password reset link has been sent.' 
    };
  }

  // Reset password with token
  static async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    try {
      const decoded = jwt.verify(resetToken, config.jwt.secret) as any;
      
      if (decoded.type !== 'password_reset') {
        throw new AppError('Invalid token type', 400);
      }

      // Validate new password
      const passwordValidation = this.validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        throw new AppError(`Password validation failed: ${passwordValidation.errors.join(', ')}`, 400);
      }

      // Hash new password
      const hashedPassword = await this.hashPassword(newPassword);

      // Update password
      await prisma.user.update({
        where: { id: decoded.userId },
        data: { password: hashedPassword },
      });

      // Revoke all refresh tokens for security
      await this.revokeAllUserTokens(decoded.userId);
    } catch (error) {
      if (error instanceof Error && error.name === 'JsonWebTokenError') {
        throw new AppError('Invalid or expired reset token', 400);
      }
      throw error;
    }
  }
}
