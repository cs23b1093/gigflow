import { body, param } from 'express-validator';

export const createBidValidation = [
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Bid message must be between 10 and 1000 characters'),

  body('price')
    .isNumeric()
    .withMessage('Price must be a number')
    .isFloat({ min: 1, max: 1000000 })
    .withMessage('Price must be between $1 and $1,000,000')
];

export const gigIdValidation = [
  param('gigId')
    .isMongoId()
    .withMessage('Invalid gig ID format')
];

export const bidIdValidation = [
  param('bidId')
    .isMongoId()
    .withMessage('Invalid bid ID format')
];