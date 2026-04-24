import { Router } from 'express';
import { getMyPets, getPetById, createPet, updatePet, deletePet } from '../controllers/pet.controller';
import { authenticate, ownerOnly } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate); // ทุก route ต้อง login

router.get('/', getMyPets);
router.get('/:id', getPetById);
router.post('/', ownerOnly, createPet);
router.put('/:id', ownerOnly, updatePet);
router.delete('/:id', ownerOnly, deletePet);

export default router;
