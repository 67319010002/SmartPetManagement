import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { createMedicalRecordSchema } from '../validators/schemas';
import { AuthRequest } from '../types';

// GET /api/medical-records - ดูประวัติการรักษาทั้งหมด (สำหรับ Vet)
export const getAllMedicalRecords = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const records = await prisma.medicalRecord.findMany({
      include: {
        pet: { select: { id: true, name: true, species: true, imageUrl: true } },
        vet: { select: { id: true, name: true } },
      },
      orderBy: { visitDate: 'desc' },
    });

    res.status(200).json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};

// POST /api/medical-records - Vet บันทึกประวัติการรักษา
export const createMedicalRecord = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = createMedicalRecordSchema.parse(req.body);

    // ตรวจสอบว่า Appointment มีอยู่และสถานะ CONFIRMED หรือ COMPLETED
    const appointment = await prisma.appointment.findFirst({
      where: { id: data.appointmentId, status: { in: ['CONFIRMED', 'COMPLETED'] } },
    });

    if (!appointment) {
      res.status(404).json({ success: false, message: 'ไม่พบนัดหมายหรือนัดหมายยังไม่ได้รับการยืนยัน' });
      return;
    }

    // ตรวจสอบว่ายังไม่มี MedicalRecord สำหรับคิวนี้
    const existing = await prisma.medicalRecord.findUnique({
      where: { appointmentId: data.appointmentId },
    });

    if (existing) {
      res.status(409).json({ success: false, message: 'มีประวัติการรักษาสำหรับคิวนี้แล้ว' });
      return;
    }

    const record = await prisma.$transaction(async (tx) => {
      // สร้าง Medical Record
      const medRecord = await tx.medicalRecord.create({
        data: {
          ...data,
          visitDate: new Date(),
          nextVisitDate: data.nextVisitDate ? new Date(data.nextVisitDate) : undefined,
          vetId: req.user!.userId,
        },
        include: {
          pet: { select: { name: true, species: true } },
          vet: { select: { name: true } },
        },
      });

      // อัปเดตสถานะคิวเป็น COMPLETED
      await tx.appointment.update({
        where: { id: data.appointmentId },
        data: { status: 'COMPLETED' },
      });

      return medRecord;
    });

    res.status(201).json({ success: true, message: 'บันทึกประวัติการรักษาสำเร็จ', data: record });
  } catch (error) {
    next(error);
  }
};

// GET /api/medical-records/pet/:petId - ดูประวัติการรักษาของสัตว์เลี้ยง
export const getMedicalRecordsByPet = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const records = await prisma.medicalRecord.findMany({
      where: { petId: req.params.petId as string },
      include: {
        vet: { select: { name: true } },
        appointment: { select: { date: true, reason: true } },
      },
      orderBy: { visitDate: 'desc' },
    });

    res.status(200).json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};

// GET /api/medical-records/:id - ดูรายละเอียดประวัติการรักษา
export const getMedicalRecordById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const record = await prisma.medicalRecord.findUnique({
      where: { id: req.params.id as string },
      include: {
        pet: true,
        vet: { select: { id: true, name: true, email: true } },
        appointment: {
          include: {
            owner: { select: { id: true, name: true, phone: true } }
          }
        },
      },
    });

    if (!record) {
      res.status(404).json({ success: false, message: 'ไม่พบประวัติการรักษา' });
      return;
    }

    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/medical-records/:id - Vet แก้ไขประวัติการรักษา
export const updateMedicalRecord = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const record = await prisma.medicalRecord.update({
      where: { id: req.params.id as string },
      data: req.body,
    });

    res.status(200).json({ success: true, message: 'แก้ไขประวัติการรักษาสำเร็จ', data: record });
  } catch (error) {
    next(error);
  }
};
