import { AuthService } from '../auth.service';
import { prisma } from '../../config/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { mockUser } from '../../__tests__/helpers/mocks';

jest.mock('../../config/database', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerData = {
        email: 'newuser@example.com',
        password: 'SecurePassword123!',
        firstName: 'New',
        lastName: 'User',
        tenantId: 'tenant-123',
      };

      const hashedPassword = 'hashed_password';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        ...mockUser,
        email: registerData.email,
      });

      const result = await authService.register(registerData);

      expect(bcrypt.hash).toHaveBeenCalledWith(registerData.password, 10);
      expect(prisma.user.create).toHaveBeenCalled();
      expect(result.email).toBe(registerData.email);
    });

    it('should throw error if email already exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        authService.register({
          email: 'existing@example.com',
          password: 'password',
          firstName: 'Test',
          lastName: 'User',
          tenantId: 'tenant-123',
        })
      ).rejects.toThrow('User with this email already exists');
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      const userWithPassword = {
        ...mockUser,
        password: 'hashed_password',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(userWithPassword);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mock_token');

      const result = await authService.login(email, password);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          email,
        },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, userWithPassword.password);
      expect(result.token).toBe('mock_token');
    });

    it('should throw error with invalid email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.login('invalid@example.com', 'password')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error with incorrect password', async () => {
      const userWithPassword = {
        ...mockUser,
        password: 'hashed_password',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(userWithPassword);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');
    });
  });
});
