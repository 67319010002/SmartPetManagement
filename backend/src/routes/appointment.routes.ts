import { Router } from 'express';
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
  getAvailability,
} from '../controllers/appointment.controller';
import { authenticate, authorize, vetOnly } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/availability', getAvailability);
router.get('/', getAppointments);                              // Owner เห็นของตัวเอง, Vet เห็นทั้งหมด
router.get('/:id', getAppointmentById);
router.post('/', authorize('OWNER'), createAppointment);       // เฉพาะ Owner จองคิว
router.patch('/:id/status', vetOnly, updateAppointmentStatus); // เฉพาะ Vet อัปเดตสถานะ
router.patch('/:id/cancel', authorize('OWNER'), cancelAppointment); // Owner ยกเลิก

export default router;
