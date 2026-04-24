import { Router } from 'express';
import {
  createMedicalRecord,
  getMedicalRecordsByPet,
  getMedicalRecordById,
  updateMedicalRecord,
  getAllMedicalRecords,
} from '../controllers/medical.controller';
import { authenticate, vetOnly } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', vetOnly, getAllMedicalRecords);    // เฉพาะ Vet ดูทั้งหมดได้
router.get('/pet/:petId', getMedicalRecordsByPet);  // Owner + Vet ดูได้
router.get('/:id', getMedicalRecordById);            // Owner + Vet ดูได้
router.post('/', vetOnly, createMedicalRecord);      // เฉพาะ Vet บันทึก
router.patch('/:id', vetOnly, updateMedicalRecord);  // เฉพาะ Vet แก้ไข

export default router;
