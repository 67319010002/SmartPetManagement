import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { registerSchema, loginSchema } from '../validators/schemas';
import { AuthRequest } from '../types';

// ===========================
// Register - สมัครสมาชิก
// ===========================
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = registerSchema.parse(req.body);

    // เช็คว่า Email ซ้ำหรือไม่
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'Email นี้ถูกใช้งานแล้ว',
      });
      return;
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // สร้าง User
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        phone: data.phone,
        role: data.role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    // สร้าง Token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
    );

    res.status(201).json({
      success: true,
      message: 'สมัครสมาชิกสำเร็จ',
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
};

// ===========================
// Login - เข้าสู่ระบบ
// ===========================
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = loginSchema.parse(req.body);

    // หา User
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Email หรือรหัสผ่านไม่ถูกต้อง',
      });
      return;
    }

    // ตรวจสอบ Password
    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Email หรือรหัสผ่านไม่ถูกต้อง',
      });
      return;
    }

    // สร้าง Token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
    );

    res.status(200).json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ===========================
// Get Profile - ดูข้อมูลตัวเอง
// ===========================
export const getProfile = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            pets: true,
            appointments: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลผู้ใช้',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// ===========================
// Update Profile - แก้ไขข้อมูลส่วนตัว
// ===========================
export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, phone } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { name, phone },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'อัปเดตโปรไฟล์สำเร็จ',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// ===========================
// Get Vets - รายชื่อสัตวแพทย์ทั้งหมด
// ===========================
export const getVets = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const vets = await prisma.user.findMany({
      where: { role: 'VET' },
      select: {
        id: true,
        name: true,
      },
    });

    res.status(200).json({
      success: true,
      data: vets,
    });
  } catch (error) {
    next(error);
  }
};
