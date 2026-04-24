import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { supabase } from '../lib/supabase';

export const uploadFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'กรุณาเลือกไฟล์' });
      return;
    }

    const file = req.file;
    const fileExt = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
    const filePath = `pet-images/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('pets') // ต้องสร้าง Bucket ชื่อ 'pets' ใน Supabase
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      console.error('Supabase Upload Error:', error);
      res.status(500).json({ success: false, message: 'ไม่สามารถอัปโหลดไปยัง Supabase ได้' });
      return;
    }

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('pets')
      .getPublicUrl(filePath);

    res.status(200).json({
      success: true,
      message: 'อัปโหลดสำเร็จ',
      url: publicUrl,
    });
  } catch (error) {
    next(error);
  }
};
