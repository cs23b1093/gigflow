import { Response } from 'express';
import { validationResult } from 'express-validator';
import Gig from '../models/Gig';
import User from '../../auth/models/User';
import ApiError from '../../../utils/ApiError';
import { asyncHandler } from '../../../utils/errorHandler';
import { AuthenticatedRequest } from '../../../types';
import logger from '../../../config/logger';

export const getGigs = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.badRequest('Validation failed: ' + errors.array().map(err => err.msg).join(', '));
  }

  const {
    search,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build query - only show open gigs
  let query: any = { status: 'open' };

  // Add search functionality for title and description
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const sortObj: any = {};
  sortObj[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

  const [gigs, total] = await Promise.all([
    Gig.find(query)
      .populate('ownerId', 'name email')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Gig.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / limitNum);
  const hasNextPage = pageNum < totalPages;
  const hasPrevPage = pageNum > 1;

  logger.info(`Gigs fetched: ${gigs.length} results, page ${pageNum}/${totalPages}`);

  res.json({
    success: true,
    data: {
      gigs,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalGigs: total,
        hasNextPage,
        hasPrevPage,
        limit: limitNum
      }
    }
  });
});

export const getGig = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const gig = await Gig.findById(req.params.id).populate('ownerId', 'name email createdAt');

  if (!gig) {
    throw ApiError.notFound('Gig not found');
  }

  res.json({
    success: true,
    data: { gig }
  });
});

export const createGig = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.badRequest('Validation failed: ' + errors.array().map(err => err.msg).join(', '));
  }

  const { title, description, budget } = req.body;

  const gig = await Gig.create({
    title,
    description,
    budget,
    ownerId: req.user?.id
  });

  await gig.populate('ownerId', 'name email');

  logger.info(`New gig created: ${title} by user ${req.user?.email}`);

  res.status(201).json({
    success: true,
    message: 'Gig created successfully',
    data: { gig }
  });
});

export const updateGig = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.badRequest('Validation failed: ' + errors.array().map(err => err.msg).join(', '));
  }

  let gig = await Gig.findById(req.params.id);

  if (!gig) {
    throw ApiError.notFound('Gig not found');
  }

  // Only owner can update their gig
  if (gig.ownerId.toString() !== req.user?.id) {
    throw ApiError.forbidden('You can only update your own gigs');
  }

  // Cannot update assigned gigs
  if (gig.status !== 'open') {
    throw ApiError.badRequest('Cannot update assigned gigs');
  }

  gig = await Gig.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate('ownerId', 'name email');

  logger.info(`Gig updated: ${gig?.title} by user ${req.user?.email}`);

  res.json({
    success: true,
    message: 'Gig updated successfully',
    data: { gig }
  });
});

export const deleteGig = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const gig = await Gig.findById(req.params.id);

  if (!gig) {
    throw ApiError.notFound('Gig not found');
  }

  // Only owner can delete their gig
  if (gig.ownerId.toString() !== req.user?.id) {
    throw ApiError.forbidden('You can only delete your own gigs');
  }

  // Cannot delete assigned gigs
  if (gig.status !== 'open') {
    throw ApiError.badRequest('Cannot delete assigned gigs');
  }

  await Gig.findByIdAndDelete(req.params.id);

  logger.info(`Gig deleted: ${gig.title} by user ${req.user?.email}`);

  res.json({
    success: true,
    message: 'Gig deleted successfully'
  });
});

export const getMyGigs = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    page = 1,
    limit = 10,
    status
  } = req.query;

  let query: any = { ownerId: req.user?.id };

  if (status && ['open', 'assigned'].includes(status as string)) {
    query.status = status;
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [gigs, total] = await Promise.all([
    Gig.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Gig.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / limitNum);

  res.json({
    success: true,
    data: {
      gigs,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalGigs: total,
        limit: limitNum
      }
    }
  });
});