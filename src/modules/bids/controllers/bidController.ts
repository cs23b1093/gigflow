import { Response } from 'express';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Bid from '../models/Bid';
import Gig from '../../gigs/models/Gig';
import ApiError from '../../../utils/ApiError';
import { asyncHandler } from '../../../utils/errorHandler';
import { AuthenticatedRequest } from '../../../types';
import logger from '../../../config/logger';

export const submitBid = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.badRequest('Validation failed: ' + errors.array().map(err => err.msg).join(', '));
  }

  const { gigId, message, price } = req.body;

  const gig = await Gig.findById(gigId);
  if (!gig) {
    throw ApiError.notFound('Gig not found');
  }

  if (gig.status !== 'open') {
    throw ApiError.badRequest('Cannot bid on assigned gigs');
  }

  // Users cannot bid on their own gigs
  if (gig.ownerId.toString() === req.user?.id) {
    throw ApiError.badRequest('You cannot bid on your own gig');
  }

  // Check for existing bid from same user
  const existingBid = await Bid.findOne({
    gigId,
    freelancerId: req.user?.id
  });

  if (existingBid) {
    throw ApiError.conflict('You have already submitted a bid for this gig');
  }

  const bid = await Bid.create({
    gigId,
    freelancerId: req.user?.id,
    message,
    price
  });

  await bid.populate([
    { path: 'freelancerId', select: 'name email' },
    { path: 'gigId', select: 'title budget' }
  ]);

  logger.info(`New bid submitted: $${price} on gig ${gig.title} by user ${req.user?.email}`);

  res.status(201).json({
    success: true,
    message: 'Bid submitted successfully',
    data: { bid }
  });
});

export const getBidsForGig = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.badRequest('Validation failed: ' + errors.array().map(err => err.msg).join(', '));
  }

  const { gigId } = req.params;

  const gig = await Gig.findById(gigId);
  if (!gig) {
    throw ApiError.notFound('Gig not found');
  }

  // Only gig owner can view bids
  if (gig.ownerId.toString() !== req.user?.id) {
    throw ApiError.forbidden('You can only view bids for your own gigs');
  }

  const bids = await Bid.find({ gigId })
    .populate('freelancerId', 'name email createdAt')
    .sort({ createdAt: -1 });

  logger.info(`Bids retrieved for gig ${gig.title}: ${bids.length} bids`);

  res.json({
    success: true,
    data: {
      gig: {
        id: gig._id,
        title: gig.title,
        status: gig.status
      },
      bids,
      totalBids: bids.length
    }
  });
});

// @desc    Hire a freelancer (Accept a bid)
// @route   PATCH /api/bids/:bidId/hire
// @access  Private (Gig owner only)
export const hireBid = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.badRequest('Validation failed: ' + errors.array().map(err => err.msg).join(', '));
  }

  const { bidId } = req.params;

  // Start a MongoDB session for transaction
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // Find the bid with gig info
      const bid = await Bid.findById(bidId)
        .populate('gigId')
        .populate('freelancerId', 'name email')
        .session(session);

      if (!bid) {
        throw ApiError.notFound('Bid not found');
      }

      const gig = bid.gigId as any;

      // Check if user is the gig owner
      if (gig.ownerId.toString() !== req.user?.id) {
        throw ApiError.forbidden('You can only hire for your own gigs');
      }

      // Check if gig is still open
      if (gig.status !== 'open') {
        throw ApiError.badRequest('This gig is no longer available for hiring');
      }

      // Check if bid is still pending
      if (bid.status !== 'pending') {
        throw ApiError.badRequest('This bid is no longer available');
      }

      // ATOMIC OPERATIONS:
      // 1. Update the chosen bid status to 'hired'
      await Bid.findByIdAndUpdate(
        bidId,
        { status: 'hired' },
        { session }
      );

      // 2. Update all other bids for this gig to 'rejected'
      await Bid.updateMany(
        {
          gigId: gig._id,
          _id: { $ne: bidId },
          status: 'pending'
        },
        { status: 'rejected' },
        { session }
      );

      // 3. Update the gig status to 'assigned'
      await Gig.findByIdAndUpdate(
        gig._id,
        { status: 'assigned' },
        { session }
      );

      logger.info(`Bid hired: ${bid.freelancerId} hired for gig ${gig.title} at $${bid.price}`);
    });

    // Fetch updated data after transaction
    const updatedBid = await Bid.findById(bidId)
      .populate('freelancerId', 'name email')
      .populate('gigId', 'title status');

    res.json({
      success: true,
      message: 'Freelancer hired successfully',
      data: { bid: updatedBid }
    });

  } catch (error) {
    throw error;
  } finally {
    await session.endSession();
  }
});

export const getMyBids = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    page = 1,
    limit = 10,
    status
  } = req.query;

  let query: any = { freelancerId: req.user?.id };

  if (status && ['pending', 'hired', 'rejected'].includes(status as string)) {
    query.status = status;
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [bids, total] = await Promise.all([
    Bid.find(query)
      .populate('gigId', 'title budget status ownerId')
      .populate({
        path: 'gigId',
        populate: {
          path: 'ownerId',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Bid.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / limitNum);

  res.json({
    success: true,
    data: {
      bids,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalBids: total,
        limit: limitNum
      }
    }
  });
});

export const getBidDetails = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { bidId } = req.params;

  const bid = await Bid.findById(bidId)
    .populate('freelancerId', 'name email createdAt')
    .populate('gigId', 'title description budget status ownerId');

  if (!bid) {
    throw ApiError.notFound('Bid not found');
  }

  const gig = bid.gigId as any;

  // Only bid owner or gig owner can view bid details
  if (bid.freelancerId._id.toString() !== req.user?.id && gig.ownerId.toString() !== req.user?.id) {
    throw ApiError.forbidden('You can only view your own bids or bids on your gigs');
  }

  res.json({
    success: true,
    data: { bid }
  });
});