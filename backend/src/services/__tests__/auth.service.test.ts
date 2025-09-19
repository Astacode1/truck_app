import { AuthService } from '../auth.service';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;

// Mock Prisma client
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
} as any;

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('login', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'DRIVER',
      password: 'hashedPassword',
      isActive: true,
    };

    it('should successfully login with valid credentials', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const token = 'jwt-token';

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);
      (mockJwt.sign as jest.Mock).mockReturnValue(token);

      // Act
      const result = await authService.login(email, password);

      // Assert
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          role: mockUser.role,
        },
        token,
      });
    });

    it('should throw error if user not found', async () => {
      // Arrange
      mockPrisma.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login('nonexistent@example.com', 'password'))
        .rejects.toThrow('Invalid credentials');
      
      expect(mockBcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw error if password is invalid', async () => {
      // Arrange
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(authService.login('test@example.com', 'wrongpassword'))
        .rejects.toThrow('Invalid credentials');
    });

    it('should throw error if user is inactive', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, isActive: false };
      mockPrisma.user.findUnique.mockResolvedValue(inactiveUser);

      // Act & Assert
      await expect(authService.login('test@example.com', 'password123'))
        .rejects.toThrow('Account is deactivated');
    });
  });

  describe('register', () => {
    const registerData = {
      email: 'newuser@example.com',
      firstName: 'New',
      lastName: 'User',
      password: 'password123',
      role: 'DRIVER' as const,
    };

    it('should successfully register a new user', async () => {
      // Arrange
      const hashedPassword = 'hashedPassword123';
      const newUser = {
        id: 'new-user-123',
        ...registerData,
        password: hashedPassword,
        isActive: true,
      };
      const token = 'jwt-token';

      mockPrisma.user.findUnique.mockResolvedValue(null);
      (mockBcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrisma.user.create.mockResolvedValue(newUser);
      (mockJwt.sign as jest.Mock).mockReturnValue(token);

      // Act
      const result = await authService.register(registerData);

      // Assert
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerData.email },
      });
      expect(mockBcrypt.hash).toHaveBeenCalledWith(registerData.password, 12);
      expect(result.user.email).toBe(registerData.email);
      expect(result.token).toBe(token);
    });

    it('should throw error if email is already taken', async () => {
      // Arrange
      const existingUser = { id: 'existing', email: registerData.email };
      mockPrisma.user.findUnique.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(authService.register(registerData))
        .rejects.toThrow('Email already registered');
    });

    it('should validate password strength', async () => {
      // Arrange
      const weakPasswordData = { ...registerData, password: '123' };

      // Act & Assert
      await expect(authService.register(weakPasswordData))
        .rejects.toThrow('Password must be at least 8 characters long');
    });
  });

  describe('verifyToken', () => {
    it('should successfully verify valid token', async () => {
      // Arrange
      const token = 'valid-jwt-token';
      const decoded = { userId: 'user-123' };
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'DRIVER',
        isActive: true,
      };

      (mockJwt.verify as jest.Mock).mockReturnValue(decoded);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await authService.verifyToken(token);

      // Assert
      expect(result.id).toBe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
    });

    it('should throw error for invalid token', async () => {
      // Arrange
      (mockJwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      await expect(authService.verifyToken('invalid-token'))
        .rejects.toThrow('Invalid token');
    });
  });
});