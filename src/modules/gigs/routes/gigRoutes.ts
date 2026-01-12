import { Router } from 'express';
import {
  getGigs,
  getGig,
  createGig,
  updateGig,
  deleteGig,
  getMyGigs
} from '../controllers/gigController';
import {
  createGigValidation,
  updateGigValidation,
  searchGigsValidation
} from '../validators/gigValidators';
import { authenticate } from '../../auth/middleware/auth';

const router = Router();

// Public routes
router.get('/', searchGigsValidation, getGigs);
router.get('/:id', getGig);

// Protected routes
router.post('/', authenticate, createGigValidation, createGig);
router.put('/:id', authenticate, updateGigValidation, updateGig);
router.delete('/:id', authenticate, deleteGig);
router.get('/user/my-gigs', authenticate, getMyGigs);

export default router;