import { Router } from 'express';
import {
  submitBid,
  getBidsForGig,
  hireBid,
  getMyBids,
  getBidDetails
} from '../controllers/bidController';
import {
  createBidValidation,
  gigIdValidation,
  bidIdValidation
} from '../validators/bidValidators';
import { authenticate } from '../../auth/middleware/auth';

const router = Router();

// All bid routes require authentication
router.use(authenticate);

// Bid management routes
router.post('/', createBidValidation, submitBid);
router.get('/my-bids', getMyBids);
router.get('/bid/:bidId', bidIdValidation, getBidDetails);

// Gig-specific bid routes
router.get('/:gigId', gigIdValidation, getBidsForGig);

// Hiring route (the crucial hiring logic)
router.patch('/:bidId/hire', bidIdValidation, hireBid);

export default router;