import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { createAppointmentSchema } from '../validators/schemas';
import { AuthRequest } from '../types';

// ===========================
// No Double Booking Logic
// ใช้ Prisma Transaction เพื่อป้องกันการจองซ้อน
// ===========================
export const createAppointment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = createAppointmentSchema.parse(req.body);

    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    if (endTime <= startTime) {
      res.status(400).json({ success: false, message: 'เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น' });
      return;
    }

    // ===== TRANSACTION: Lock and Check =====
    const appointment = await prisma.$transaction(async (tx) => {
      // ตรวจสอบการจองซ้อนในช่วงเวลาเดียวกัน
      const conflicting = await tx.appointment.findFirst({
        where: {
          status: { in: ['PENDING', 'CONFIRMED'] },
          // ถ้า vetId ระบุมา ให้ตรวจสอบเฉพาะสัตวแพทย์คนนั้น
          ...(data.vetId ? { vetId: data.vetId } : {}),
          OR: [
            // กรณี A: startTime ของคิวใหม่ตกอยู่ในช่วงของคิวเดิม
            { startTime: { lt: endTime }, endTime: { gt: startTime } },
          ],
        },
      });

      if (conflicting) {
        throw new Error('DOUBLE_BOOKING: ช่วงเวลานี้มีการจองแล้ว กรุณาเลือกเวลาอื่น');
      }

      // สร้างคิวนัดหมาย
      return tx.appointment.create({
        data: {
          date: new Date(data.date),
          startTime,
          endTime,
          reason: data.reason,
          note: data.note,
          ownerId: req.user!.userId,
          petId: data.petId,
          ...(data.vetId ? { vetId: data.vetId } : {}),
        },
        include: {
          pet: { select: { name: true, species: true } },
          owner: { select: { name: true, phone: true } },
        },
      });
    });

    res.status(201).json({ success: true, message: 'จองคิวนัดหมายสำเร็จ', data: appointment });
  } catch (error: any) {
    if (error.message?.startsWith('DOUBLE_BOOKING:')) {
      res.status(409).json({ success: false, message: error.message.replace('DOUBLE_BOOKING: ', '') });
      return;
    }
    next(error);
  }
};

// GET /api/appointments - ดูคิวของตัวเอง (Owner) หรือทั้งหมด (Vet)
export const getAppointments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { date, status } = req.query;
    const isVet = req.user!.role === 'VET';

    const where: any = {};
    if (!isVet) where.ownerId = req.user!.userId;
    if (status) where.status = status;
    if (date) {
      const start = new Date(date as string);
      const end = new Date(date as string);
      end.setDate(end.getDate() + 1);
      where.date = { gte: start, lt: end };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        pet: { select: { id: true, name: true, species: true, breed: true, imageUrl: true } },
        owner: { select: { id: true, name: true, phone: true, email: true } },
        vet: { select: { id: true, name: true } },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    next(error);
  }
};

// GET /api/appointments/:id
export const getAppointmentById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const isVet = req.user!.role === 'VET';

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: req.params.id as string,
        ...(!isVet ? { ownerId: req.user!.userId } : {}),
      },
      include: {
        pet: true,
        owner: { select: { id: true, name: true, email: true, phone: true } },
        vet: { select: { id: true, name: true } },
        medicalRecord: true,
      },
    });

    if (!appointment) {
      res.status(404).json({ success: false, message: 'ไม่พบข้อมูลนัดหมาย' });
      return;
    }

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/appointments/:id/status - Vet อัปเดตสถานะ
export const updateAppointmentStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.body;
    const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: 'สถานะไม่ถูกต้อง' });
      return;
    }

    const appointment = await prisma.appointment.update({
      where: { id: req.params.id as string },
      data: { status, ...(status === 'CONFIRMED' ? { vetId: req.user!.userId } : {}) },
    });

    res.status(200).json({ success: true, message: 'อัปเดตสถานะสำเร็จ', data: appointment });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/appointments/:id - ยกเลิกคิว (Owner เท่านั้น)
export const cancelAppointment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appointment = await prisma.appointment.findFirst({
      where: { id: req.params.id as string, ownerId: req.user!.userId },
    });

    if (!appointment) {
      res.status(404).json({ success: false, message: 'ไม่พบข้อมูลนัดหมาย' });
      return;
    }

    if (appointment.status === 'COMPLETED') {
      res.status(400).json({ success: false, message: 'ไม่สามารถยกเลิกนัดหมายที่เสร็จสิ้นแล้วได้' });
      return;
    }

    await prisma.appointment.update({
      where: { id: req.params.id as string },
      data: { status: 'CANCELLED' },
    });

    res.status(200).json({ success: true, message: 'ยกเลิกนัดหมายสำเร็จ' });
  } catch (error) {
    next(error);
  }
};

// GET /api/appointments/availability - เช็คคิวว่างรายวัน
export const getAvailability = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { date } = req.query;
    if (!date) {
      res.status(400).json({ success: false, message: 'กรุณาระบุวันที่' });
      return;
    }

    const start = new Date(date as string);
    const end = new Date(date as string);
    end.setDate(end.getDate() + 1);

    const appointments = await prisma.appointment.findMany({
      where: {
        date: { gte: start, lt: end },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      select: {
        startTime: true,
        endTime: true,
        vetId: true,
      },
    });

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    next(error);
  }
};
