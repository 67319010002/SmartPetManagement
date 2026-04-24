import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
const mockTransaction = vi.fn();
const mockAppointmentFindFirst = vi.fn();
const mockAppointmentCreate = vi.fn();

vi.mock('../src/lib/prisma', () => ({
  prisma: {
    $transaction: mockTransaction,
    appointment: {
      findFirst: mockAppointmentFindFirst,
      create: mockAppointmentCreate,
    },
  },
}));

// ===========================
// Double Booking Prevention Logic (isolated for testing)
// ===========================
async function checkAndCreateAppointment(
  tx: any,
  startTime: Date,
  endTime: Date,
  vetId: string | undefined,
  appointmentData: any
) {
  const conflicting = await tx.appointment.findFirst({
    where: {
      status: { in: ['PENDING', 'CONFIRMED'] },
      ...(vetId ? { vetId } : {}),
      OR: [{ startTime: { lt: endTime }, endTime: { gt: startTime } }],
    },
  });

  if (conflicting) {
    throw new Error('DOUBLE_BOOKING: ช่วงเวลานี้มีการจองแล้ว กรุณาเลือกเวลาอื่น');
  }

  return tx.appointment.create({ data: appointmentData });
}

// ===========================
// Tests
// ===========================
describe('🐾 Appointment Double Booking Prevention', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('✅ ควรจองคิวสำเร็จเมื่อไม่มีคิวซ้อนทับ', async () => {
    const mockTx = {
      appointment: {
        findFirst: vi.fn().mockResolvedValue(null), // ไม่มีคิวซ้อน
        create: vi.fn().mockResolvedValue({ id: 'appt-1', status: 'PENDING' }),
      },
    };

    const start = new Date('2026-05-01T09:00:00Z');
    const end = new Date('2026-05-01T10:00:00Z');

    const result = await checkAndCreateAppointment(mockTx, start, end, 'vet-1', {
      startTime: start,
      endTime: end,
      ownerId: 'owner-1',
      petId: 'pet-1',
    });

    expect(result).toEqual({ id: 'appt-1', status: 'PENDING' });
    expect(mockTx.appointment.findFirst).toHaveBeenCalledOnce();
    expect(mockTx.appointment.create).toHaveBeenCalledOnce();
  });

  it('❌ ควร Reject เมื่อมีคิวซ้อนทับในเวลาเดียวกัน', async () => {
    const mockTx = {
      appointment: {
        findFirst: vi.fn().mockResolvedValue({
          id: 'existing-appt',
          status: 'CONFIRMED',
          startTime: new Date('2026-05-01T09:00:00Z'),
          endTime: new Date('2026-05-01T10:00:00Z'),
        }),
        create: vi.fn(),
      },
    };

    const start = new Date('2026-05-01T09:30:00Z'); // ซ้อนทับ!
    const end = new Date('2026-05-01T10:30:00Z');

    await expect(
      checkAndCreateAppointment(mockTx, start, end, 'vet-1', {})
    ).rejects.toThrow('DOUBLE_BOOKING');

    expect(mockTx.appointment.create).not.toHaveBeenCalled();
  });

  it('❌ ควร Reject เมื่อคิวใหม่ครอบคลุมคิวเดิมทั้งหมด', async () => {
    const mockTx = {
      appointment: {
        findFirst: vi.fn().mockResolvedValue({
          id: 'existing-appt',
          status: 'PENDING',
          startTime: new Date('2026-05-01T09:30:00Z'),
          endTime: new Date('2026-05-01T10:00:00Z'),
        }),
        create: vi.fn(),
      },
    };

    const start = new Date('2026-05-01T09:00:00Z'); // ครอบคลุมคิวเดิม
    const end = new Date('2026-05-01T11:00:00Z');

    await expect(
      checkAndCreateAppointment(mockTx, start, end, 'vet-1', {})
    ).rejects.toThrow('DOUBLE_BOOKING');
  });

  it('✅ ควรจองได้สำหรับ Vet คนละคน แม้เวลาเดียวกัน', async () => {
    const mockTx = {
      appointment: {
        findFirst: vi.fn().mockResolvedValue(null), // Vet คนละคน → ไม่ชน
        create: vi.fn().mockResolvedValue({ id: 'appt-2', status: 'PENDING' }),
      },
    };

    const start = new Date('2026-05-01T09:00:00Z');
    const end = new Date('2026-05-01T10:00:00Z');

    const result = await checkAndCreateAppointment(mockTx, start, end, 'vet-2', {});

    expect(result).toBeDefined();
    expect(mockTx.appointment.create).toHaveBeenCalledOnce();
  });

  it('✅ ควรจองได้เมื่อเวลาต่อเนื่องกัน (ไม่ทับ)', async () => {
    const mockTx = {
      appointment: {
        findFirst: vi.fn().mockResolvedValue(null), // เวลาติดกันแต่ไม่ทับ
        create: vi.fn().mockResolvedValue({ id: 'appt-3', status: 'PENDING' }),
      },
    };

    const start = new Date('2026-05-01T10:00:00Z'); // เริ่มตอนที่คิวเก่าจบพอดี
    const end = new Date('2026-05-01T11:00:00Z');

    const result = await checkAndCreateAppointment(mockTx, start, end, 'vet-1', {});

    expect(result).toBeDefined();
    expect(mockTx.appointment.create).toHaveBeenCalledOnce();
  });
});
