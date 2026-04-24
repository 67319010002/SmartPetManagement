import { Request, Response, NextFunction } from 'express';
import path from 'path';

export const uploadFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'กรุณาเลือกไฟล์' });
      return;
    }

    const fileUrl = `${process.env.BACKEND_URL || 'http://localhost:4000'}/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'อัปโหลดสำเร็จ',
      url: fileUrl,
    });
  } catch (error) {
    next(error);
  }
};
