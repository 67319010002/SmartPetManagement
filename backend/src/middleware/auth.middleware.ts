import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { AuthRequest, JwtPayload } from '../types';

// ===========================
// Middleware: ตรวจสอบ JWT Token
// ===========================
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'ไม่พบ Token หรือ Token ไม่ถูกต้อง',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET ไม่ได้ตั้งค่าใน Environment Variables');
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token หมดอายุแล้ว กรุณา Login ใหม่',
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: 'Token ไม่ถูกต้อง',
    });
  }
};

// ===========================
// Middleware: ตรวจสอบ Role
// ===========================
export const authorize = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'กรุณา Login ก่อน',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้',
      });
      return;
    }

    next();
  };
};

// ===========================
// Middleware: เฉพาะ Vet เท่านั้น
// ===========================
export const vetOnly = authorize('VET');

// ===========================
// Middleware: เฉพาะ Owner เท่านั้น
// ===========================
export const ownerOnly = authorize('OWNER');
