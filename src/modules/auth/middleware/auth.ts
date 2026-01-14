import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import ApiError from '../../../utils/ApiError';
import { AuthenticatedRequest } from '../../../types';
import { asyncHandler } from '../../../utils/errorHandler';

interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
};

export const authenticate = asyncHandler(async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  let token;

  // Check for token in cookies first, then Authorization header
  if (req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw ApiError.unauthorized('Access denied. No token provided.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      throw ApiError.unauthorized('Token is valid but user no longer exists');
    }

    // Add user to request object for downstream middleware
    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw ApiError.unauthorized('Invalid token');
    } else if (error instanceof jwt.TokenExpiredError) {
      throw ApiError.unauthorized('Token expired');
    }
    throw error;
  }
});