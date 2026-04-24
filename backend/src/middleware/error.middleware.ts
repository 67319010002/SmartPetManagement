import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

// ===========================
// Middleware: Error Handler กลาง
// ===========================
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(`[Error] ${req.method} ${req.path}:`, err.message);

  // Zod Validation Error
  if (err instanceof ZodError) {
    const zodError = err as ZodError;
    res.status(400).json({
      success: false,
      message: 'ข้อมูลไม่ถูกต้อง',
      errors: zodError.issues.map((e: any) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Prisma unique constraint error
  if ((err as any).code === 'P2002') {
    res.status(409).json({
      success: false,
      message: 'ข้อมูลนี้มีอยู่แล้วในระบบ',
    });
    return;
  }

  // Prisma not found error
  if ((err as any).code === 'P2025') {
    res.status(404).json({
      success: false,
      message: 'ไม่พบข้อมูลที่ต้องการ',
    });
    return;
  }

  // Default error
  res.status(500).json({
    success: false,
    message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
  });
};

// ===========================
// Middleware: 404 Not Found
// ===========================
export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `ไม่พบ Route: ${req.method} ${req.originalUrl}`,
  });
};
