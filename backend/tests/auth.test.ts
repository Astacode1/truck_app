import request from 'supertest';
import { app } from '../src/app';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '../src/services/authService';

const prisma = new PrismaClient();

describe('Authentication System', () => {
  beforeAll(async () => {
    // Clean up database before tests
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    // Clean up after tests
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('AuthService', () => {
    describe('Password validation', () => {
      it('should validate strong passwords', () => {
        const result = AuthService.validatePassword('TestPassword123!');
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject weak passwords', () => {
        const result = AuthService.validatePassword('weak');
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });

      it('should require minimum length', () => {
        const result = AuthService.validatePassword('Abc1!');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password must be at least 8 characters long');
      });

      it('should require uppercase letter', () => {
        const result = AuthService.validatePassword('testpassword123!');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password must contain at least one uppercase letter');
      });

      it('should require lowercase letter', () => {
        const result = AuthService.validatePassword('TESTPASSWORD123!');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password must contain at least one lowercase letter');
      });

      it('should require number', () => {
        const result = AuthService.validatePassword('TestPassword!');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password must contain at least one number');
      });

      it('should require special character', () => {
        const result = AuthService.validatePassword('TestPassword123');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password must contain at least one special character (@$!%*?&)');
      });
    });

    describe('Token generation', () => {
      it('should generate valid tokens', () => {
        const tokens = AuthService.generateTokens('user123', 'test@example.com', 'DRIVER');
        
        expect(tokens.accessToken).toBeDefined();
        expect(tokens.refreshToken).toBeDefined();
        expect(typeof tokens.accessToken).toBe('string');
        expect(typeof tokens.refreshToken).toBe('string');
      });
    });

    describe('Password hashing', () => {
      it('should hash passwords correctly', async () => {
        const password = 'TestPassword123!';
        const hashed = await AuthService.hashPassword(password);
        
        expect(hashed).toBeDefined();
        expect(hashed).not.toBe(password);
        expect(hashed.length).toBeGreaterThan(50);
      });

      it('should verify passwords correctly', async () => {
        const password = 'TestPassword123!';
        const hashed = await AuthService.hashPassword(password);
        
        const isValid = await AuthService.comparePassword(password, hashed);
        const isInvalid = await AuthService.comparePassword('wrongpassword', hashed);
        
        expect(isValid).toBe(true);
        expect(isInvalid).toBe(false);
      });
    });

    describe('User registration', () => {
      it('should register a new user successfully', async () => {
        const userData = {
          email: 'test@example.com',
          password: 'TestPassword123!',
          firstName: 'Test',
          lastName: 'User',
          role: 'DRIVER' as const,
        };

        const result = await AuthService.register(userData);

        expect(result.user).toBeDefined();
        expect(result.tokens).toBeDefined();
        expect(result.user.email).toBe(userData.email.toLowerCase());
        expect(result.user.firstName).toBe(userData.firstName);
        expect(result.user.lastName).toBe(userData.lastName);
        expect(result.user.role).toBe(userData.role);
        expect(result.user.isActive).toBe(true);
      });

      it('should reject duplicate email', async () => {
        const userData = {
          email: 'duplicate@example.com',
          password: 'TestPassword123!',
          firstName: 'Test',
          lastName: 'User',
          role: 'DRIVER' as const,
        };

        // First registration should succeed
        await AuthService.register(userData);

        // Second registration should fail
        await expect(AuthService.register(userData)).rejects.toThrow(
          'User with this email already exists'
        );
      });

      it('should reject weak passwords', async () => {
        const userData = {
          email: 'weakpass@example.com',
          password: 'weak',
          firstName: 'Test',
          lastName: 'User',
          role: 'DRIVER' as const,
        };

        await expect(AuthService.register(userData)).rejects.toThrow(
          'Password validation failed'
        );
      });
    });

    describe('User login', () => {
      beforeEach(async () => {
        // Create test user
        await AuthService.register({
          email: 'login@example.com',
          password: 'TestPassword123!',
          firstName: 'Login',
          lastName: 'Test',
          role: 'DRIVER',
        });
      });

      it('should login with valid credentials', async () => {
        const result = await AuthService.login({
          email: 'login@example.com',
          password: 'TestPassword123!',
        });

        expect(result.user).toBeDefined();
        expect(result.tokens).toBeDefined();
        expect(result.user.email).toBe('login@example.com');
      });

      it('should reject invalid email', async () => {
        await expect(
          AuthService.login({
            email: 'nonexistent@example.com',
            password: 'TestPassword123!',
          })
        ).rejects.toThrow('Invalid credentials');
      });

      it('should reject invalid password', async () => {
        await expect(
          AuthService.login({
            email: 'login@example.com',
            password: 'wrongpassword',
          })
        ).rejects.toThrow('Invalid credentials');
      });
    });

    describe('Token refresh', () => {
      let refreshToken: string;
      let userId: string;

      beforeEach(async () => {
        const result = await AuthService.register({
          email: 'refresh@example.com',
          password: 'TestPassword123!',
          firstName: 'Refresh',
          lastName: 'Test',
          role: 'DRIVER',
        });

        refreshToken = result.tokens.refreshToken;
        userId = result.user.id;
      });

      it('should refresh tokens with valid refresh token', async () => {
        const newTokens = await AuthService.refreshAccessToken(refreshToken);

        expect(newTokens.accessToken).toBeDefined();
        expect(newTokens.refreshToken).toBeDefined();
        expect(newTokens.accessToken).not.toBe(refreshToken);
      });

      it('should reject invalid refresh token', async () => {
        await expect(
          AuthService.refreshAccessToken('invalid.token.here')
        ).rejects.toThrow('Invalid refresh token');
      });

      it('should reject revoked refresh token', async () => {
        // First refresh should work
        await AuthService.refreshAccessToken(refreshToken);

        // Original token should now be revoked and shouldn't work
        await expect(
          AuthService.refreshAccessToken(refreshToken)
        ).rejects.toThrow('Invalid or expired refresh token');
      });
    });

    describe('Password reset', () => {
      beforeEach(async () => {
        await AuthService.register({
          email: 'reset@example.com',
          password: 'TestPassword123!',
          firstName: 'Reset',
          lastName: 'Test',
          role: 'DRIVER',
        });
      });

      it('should generate reset token for valid email', async () => {
        const result = await AuthService.forgotPassword('reset@example.com');

        expect(result.message).toBeDefined();
        expect(result.resetToken).toBeDefined();
      });

      it('should not reveal if email does not exist', async () => {
        const result = await AuthService.forgotPassword('nonexistent@example.com');

        expect(result.message).toBe('If the email exists, a password reset link has been sent.');
        expect(result.resetToken).toBeUndefined();
      });

      it('should reset password with valid token', async () => {
        const { resetToken } = await AuthService.forgotPassword('reset@example.com');

        if (resetToken) {
          await expect(
            AuthService.resetPassword(resetToken, 'NewPassword123!')
          ).resolves.not.toThrow();

          // Should be able to login with new password
          const result = await AuthService.login({
            email: 'reset@example.com',
            password: 'NewPassword123!',
          });

          expect(result.user).toBeDefined();
        }
      });

      it('should reject invalid reset token', async () => {
        await expect(
          AuthService.resetPassword('invalid.token.here', 'NewPassword123!')
        ).rejects.toThrow('Invalid or expired reset token');
      });
    });

    describe('Logout', () => {
      let refreshToken: string;
      let userId: string;

      beforeEach(async () => {
        const result = await AuthService.register({
          email: 'logout@example.com',
          password: 'TestPassword123!',
          firstName: 'Logout',
          lastName: 'Test',
          role: 'DRIVER',
        });

        refreshToken = result.tokens.refreshToken;
        userId = result.user.id;
      });

      it('should revoke specific refresh token', async () => {
        await AuthService.logout(userId, refreshToken);

        // Token should now be invalid
        await expect(
          AuthService.refreshAccessToken(refreshToken)
        ).rejects.toThrow('Invalid or expired refresh token');
      });

      it('should revoke all user tokens', async () => {
        // Create another token
        const result = await AuthService.login({
          email: 'logout@example.com',
          password: 'TestPassword123!',
        });

        const secondToken = result.tokens.refreshToken;

        // Logout from all devices
        await AuthService.logout(userId);

        // Both tokens should be invalid
        await expect(
          AuthService.refreshAccessToken(refreshToken)
        ).rejects.toThrow('Invalid or expired refresh token');

        await expect(
          AuthService.refreshAccessToken(secondToken)
        ).rejects.toThrow('Invalid or expired refresh token');
      });
    });
  });

  describe('Authentication API Endpoints', () => {
    describe('POST /api/auth/register', () => {
      it('should register a new user', async () => {
        const userData = {
          email: 'apitest@example.com',
          password: 'TestPassword123!',
          firstName: 'API',
          lastName: 'Test',
          role: 'DRIVER',
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.user.email).toBe(userData.email.toLowerCase());
        expect(response.body.data.tokens.accessToken).toBeDefined();
        expect(response.body.data.tokens.refreshToken).toBeDefined();
      });

      it('should reject invalid data', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: 'invalid-email',
            password: 'weak',
          })
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });

    describe('POST /api/auth/login', () => {
      beforeEach(async () => {
        await AuthService.register({
          email: 'apilogin@example.com',
          password: 'TestPassword123!',
          firstName: 'API',
          lastName: 'Login',
          role: 'DRIVER',
        });
      });

      it('should login with valid credentials', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'apilogin@example.com',
            password: 'TestPassword123!',
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.user.email).toBe('apilogin@example.com');
        expect(response.body.data.tokens.accessToken).toBeDefined();
      });

      it('should reject invalid credentials', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'apilogin@example.com',
            password: 'wrongpassword',
          })
          .expect(401);

        expect(response.body.success).toBe(false);
      });
    });

    describe('GET /api/auth/profile', () => {
      let accessToken: string;

      beforeEach(async () => {
        const result = await AuthService.register({
          email: 'profile@example.com',
          password: 'TestPassword123!',
          firstName: 'Profile',
          lastName: 'Test',
          role: 'DRIVER',
        });

        accessToken = result.tokens.accessToken;
      });

      it('should get user profile with valid token', async () => {
        const response = await request(app)
          .get('/api/auth/profile')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.user.email).toBe('profile@example.com');
      });

      it('should reject request without token', async () => {
        const response = await request(app)
          .get('/api/auth/profile')
          .expect(401);

        expect(response.body.success).toBe(false);
      });

      it('should reject request with invalid token', async () => {
        const response = await request(app)
          .get('/api/auth/profile')
          .set('Authorization', 'Bearer invalid.token.here')
          .expect(401);

        expect(response.body.success).toBe(false);
      });
    });

    describe('POST /api/auth/refresh', () => {
      let refreshToken: string;

      beforeEach(async () => {
        const result = await AuthService.register({
          email: 'apirefresh@example.com',
          password: 'TestPassword123!',
          firstName: 'API',
          lastName: 'Refresh',
          role: 'DRIVER',
        });

        refreshToken = result.tokens.refreshToken;
      });

      it('should refresh tokens with valid refresh token', async () => {
        const response = await request(app)
          .post('/api/auth/refresh')
          .send({ refreshToken })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.tokens.accessToken).toBeDefined();
        expect(response.body.data.tokens.refreshToken).toBeDefined();
      });

      it('should reject invalid refresh token', async () => {
        const response = await request(app)
          .post('/api/auth/refresh')
          .send({ refreshToken: 'invalid.token.here' })
          .expect(401);

        expect(response.body.success).toBe(false);
      });
    });

    describe('POST /api/auth/logout', () => {
      let accessToken: string;
      let refreshToken: string;

      beforeEach(async () => {
        const result = await AuthService.register({
          email: 'apilogout@example.com',
          password: 'TestPassword123!',
          firstName: 'API',
          lastName: 'Logout',
          role: 'DRIVER',
        });

        accessToken = result.tokens.accessToken;
        refreshToken = result.tokens.refreshToken;
      });

      it('should logout successfully', async () => {
        const response = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ refreshToken })
          .expect(200);

        expect(response.body.success).toBe(true);

        // Refresh token should now be invalid
        await request(app)
          .post('/api/auth/refresh')
          .send({ refreshToken })
          .expect(401);
      });

      it('should reject logout without authentication', async () => {
        const response = await request(app)
          .post('/api/auth/logout')
          .send({ refreshToken })
          .expect(401);

        expect(response.body.success).toBe(false);
      });
    });
  });
});
