import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('รูปแบบ Email ไม่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
  name: z.string().min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร'),
  phone: z.string().optional(),
  role: z.enum(['OWNER', 'VET']).default('OWNER'),
});

export const loginSchema = z.object({
  email: z.string().email('รูปแบบ Email ไม่ถูกต้อง'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
});

export const createPetSchema = z.object({
  name: z.string().min(1, 'กรุณาระบุชื่อสัตว์เลี้ยง'),
  species: z.string().min(1, 'กรุณาระบุประเภทสัตว์เลี้ยง'),
  breed: z.string().optional(),
  imageUrl: z.string().optional().or(z.literal('')),
  age: z.number().int().min(0).default(0),
  ageMonths: z.number().int().min(0).max(11).default(0),
  ageDays: z.number().int().min(0).max(30).default(0),
  weight: z.number().min(0).optional(),
});

export const createAppointmentSchema = z.object({
  date: z.string().datetime('รูปแบบวันที่ไม่ถูกต้อง'),
  startTime: z.string().datetime('รูปแบบเวลาไม่ถูกต้อง'),
  endTime: z.string().datetime('รูปแบบเวลาไม่ถูกต้อง'),
  reason: z.string().min(1, 'กรุณาระบุเหตุผลที่มาพบ'),
  note: z.string().optional(),
  petId: z.string().uuid('petId ไม่ถูกต้อง'),
  vetId: z.string().uuid('vetId ไม่ถูกต้อง').optional(),
});

export const createMedicalRecordSchema = z.object({
  diagnosis: z.string().min(1, 'กรุณาระบุการวินิจฉัย'),
  treatment: z.string().min(1, 'กรุณาระบุการรักษา'),
  prescription: z.string().optional(),
  notes: z.string().optional(),
  nextVisitDate: z.string().datetime().optional(),
  appointmentId: z.string().uuid('appointmentId ไม่ถูกต้อง'),
  petId: z.string().uuid('petId ไม่ถูกต้อง'),
});
