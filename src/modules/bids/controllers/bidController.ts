import { Response } from 'express';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Bid from '../models/Bid';
import Gig from '../../gigs/models/Gig';
import ApiError from '../../../utils/ApiError';
import { asyncHandler } from '../../../utils/errorHandler';
import { AuthenticatedRequest } from '../../../types';
import logger from '../../../config/logger';
import { notificationService } from '../../../services/notificationService';

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

  // Send real-time notification to gig owner
  const populatedBid = bid as any;
  await notificationService.sendBidReceivedNotification(
    gig.ownerId.toString(),
    gig.title,
    populatedBid.freelancerId.name,
    price
  );

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

// race condition safe hiring
export const hireBid = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.badRequest('Validation failed: ' + errors.array().map(err => err.msg).join(', '));
  }

  const { bidId } = req.params;

  // Use MongoDB transaction with retry logic for race conditions
  const session = await mongoose.startSession();
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const result = await session.withTransaction(async () => {
        // Find bid with gig info within transaction
        const bid = await Bid.findById(bidId)
          .populate('gigId')
          .populate('freelancerId', 'name email')
          .session(session);

        if (!bid) {
          throw ApiError.notFound('Bid not found');
        }

        const gig = bid.gigId as any;

        // Verify ownership
        if (gig.ownerId.toString() !== req.user?.id) {
          throw ApiError.forbidden('You can only hire for your own gigs');
        }

        // Atomic gig status update with condition (prevents race conditions)
        const gigUpdateResult = await Gig.findOneAndUpdate(
          { 
            _id: gig._id,
            status: 'open' // Critical: Only proceed if gig is still open
          },
          { 
            status: 'assigned',
            hiredAt: new Date(),
            hiredBy: req.user?.id
          },
          { 
            session,
            new: true,
            runValidators: true
          }
        );

        // RACE CONDITION CHECK: If gig update failed, someone else hired first
        if (!gigUpdateResult) {
          throw ApiError.conflict('This gig has already been assigned to another freelancer');
        }

        // Atomic bid status update with condition check
        const bidUpdateResult = await Bid.findOneAndUpdate(
          {
            _id: bidId,
            status: 'pending' // Only update if still pending
          },
          { 
            status: 'hired',
            hiredAt: new Date()
          },
          { 
            session,
            new: true
          }
        );

        // Double-check bid was successfully updated
        if (!bidUpdateResult) {
          throw ApiError.conflict('This bid is no longer available for hiring');
        }

        // Get rejected bids for notifications, then reject them atomically
        const rejectedBids = await Bid.find({
          gigId: gig._id,
          _id: { $ne: bidId },
          status: 'pending'
        }).populate('freelancerId', '_id name').session(session);

        const rejectionResult = await Bid.updateMany(
          {
            gigId: gig._id,
            _id: { $ne: bidId },
            status: 'pending'
          },
          { 
            status: 'rejected',
            rejectedAt: new Date(),
            rejectedReason: 'Another freelancer was hired'
          },
          { session }
        );

        logger.info(`Hiring completed: ${bid.freelancerId} hired for gig "${gig.title}" at $${bid.price}. Rejected ${rejectionResult.modifiedCount} other bids.`);

        return { bid: bidUpdateResult, gig: gigUpdateResult, rejectedBids };
      }, {
        // Transaction options for better race condition handling
        readPreference: 'primary',
        readConcern: { level: 'majority' },
        writeConcern: { w: 'majority', j: true }
      });

      // Success - fetch final updated data
      const updatedBid = await Bid.findById(bidId)
        .populate('freelancerId', 'name email')
        .populate('gigId', 'title status');

      // Send real-time hiring notification to freelancer
      const freelancer = updatedBid?.freelancerId as any;
      const gig = updatedBid?.gigId as any;
      
      if (freelancer && gig) {
        await notificationService.sendHiringNotification(
          freelancer._id.toString(),
          gig.title,
          req.user?.name || 'Client',
          updatedBid?.price || 0
        );

        // Send rejection notifications to other freelancers
        if (result?.rejectedBids && result?.rejectedBids.length > 0) {
          for (const rejectedBid of result?.rejectedBids) {
            const rejectedFreelancer = rejectedBid.freelancerId as any;
            if (rejectedFreelancer) {
              await notificationService.sendBidRejectionNotification(
                rejectedFreelancer._id.toString(),
                gig.title,
                'Another freelancer was hired'
              );
            }
          }
        }
      }

      res.json({
        success: true,
        message: 'Freelancer hired successfully',
        data: { bid: updatedBid }
      });

      return; // Exit retry loop on success

    } catch (error) {
      retryCount++;
      
      // Handle specific race condition errors with retry
      if (error instanceof ApiError && error.statusCode === 409 && retryCount < maxRetries) {
        logger.warn(`Race condition detected on hiring attempt ${retryCount}/${maxRetries}. Retrying...`);
        // Small delay before retry to reduce collision probability
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
        continue;
      }
      
      // Re-throw error if not retryable or max retries reached
      throw error;
    } finally {
      if (retryCount >= maxRetries || session.hasEnded) {
        await session.endSession();
      }
    }
  }

  // If we reach here, all retries failed
  throw ApiError.conflict('Unable to complete hiring due to concurrent modifications. Please try again.');
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