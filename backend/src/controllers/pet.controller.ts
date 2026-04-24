import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { createPetSchema } from '../validators/schemas';
import { AuthRequest } from '../types';

// GET /api/pets - ดูสัตว์เลี้ยงทั้งหมดของ Owner
export const getMyPets = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const isVet = req.user!.role === 'VET';
    const pets = await prisma.pet.findMany({
      where: isVet ? {} : { ownerId: req.user!.userId },
      include: {
        _count: { select: { appointments: true, medicalRecords: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, data: pets });
  } catch (error) {
    next(error);
  }
};

// GET /api/pets/:id - ดูรายละเอียดสัตว์เลี้ยง
export const getPetById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const isVet = req.user!.role === 'VET';
    const pet = await prisma.pet.findFirst({
      where: { 
        id: req.params.id as string, 
        ...(!isVet ? { ownerId: req.user!.userId } : {}),
      },
      include: {
        appointments: {
          orderBy: { date: 'desc' },
          take: 10,
          include: { vet: { select: { name: true } } }
        },
        medicalRecords: {
          orderBy: { visitDate: 'desc' },
          take: 20,
          include: { vet: { select: { name: true } } }
        },
        owner: { select: { name: true, phone: true, email: true } }
      },
    });

    if (!pet) {
      res.status(404).json({ success: false, message: 'ไม่พบข้อมูลสัตว์เลี้ยง' });
      return;
    }

    res.status(200).json({ success: true, data: pet });
  } catch (error) {
    next(error);
  }
};

// POST /api/pets - เพิ่มสัตว์เลี้ยง
export const createPet = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = createPetSchema.parse(req.body);

    const pet = await prisma.pet.create({
      data: { ...data, ownerId: req.user!.userId },
    });

    res.status(201).json({ success: true, message: 'เพิ่มสัตว์เลี้ยงสำเร็จ', data: pet });
  } catch (error) {
    next(error);
  }
};

// PUT /api/pets/:id - แก้ไขข้อมูลสัตว์เลี้ยง
export const updatePet = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = createPetSchema.partial().parse(req.body);

    const existing = await prisma.pet.findFirst({
      where: { id: req.params.id as string, ownerId: req.user!.userId },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'ไม่พบข้อมูลสัตว์เลี้ยง' });
      return;
    }

    const pet = await prisma.pet.update({
      where: { id: req.params.id as string },
      data,
    });

    res.status(200).json({ success: true, message: 'แก้ไขข้อมูลสำเร็จ', data: pet });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/pets/:id - ลบสัตว์เลี้ยง
export const deletePet = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const existing = await prisma.pet.findFirst({
      where: { id: req.params.id as string, ownerId: req.user!.userId },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'ไม่พบข้อมูลสัตว์เลี้ยง' });
      return;
    }

    await prisma.pet.delete({ where: { id: req.params.id as string } });

    res.status(200).json({ success: true, message: 'ลบสัตว์เลี้ยงสำเร็จ' });
  } catch (error) {
    next(error);
  }
};
