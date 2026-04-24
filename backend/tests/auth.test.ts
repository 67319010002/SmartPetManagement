import { describe, it, expect, beforeEach, vi } from 'vitest';
import { prisma } from '../src/lib/prisma';
import { register, login } from '../src/controllers/auth.controller';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

vi.mock('../src/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn().mockReturnValue('mock_token'),
  },
}));

describe('Auth Controller', () => {
  const mockRes: any = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };
  const mockNext = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockReq: any = {
        body: {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          role: 'OWNER',
        },
      };

      (prisma.user.findUnique as any).mockResolvedValue(null);
      (prisma.user.create as any).mockResolvedValue({
        id: 'user_1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'OWNER',
      });

      await register(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'สมัครสมาชิกสำเร็จ',
        })
      );
    });

    it('should fail if email already exists', async () => {
      const mockReq: any = {
        body: {
          email: 'existing@example.com',
          password: 'password123',
          name: 'Existing User',
          role: 'OWNER',
        },
      };

      (prisma.user.findUnique as any).mockResolvedValue({ id: 'existing_id' });

      await register(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Email นี้ถูกใช้งานแล้ว',
        })
      );
    });
  });
});
