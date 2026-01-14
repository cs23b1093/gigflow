import jwt from 'jsonwebtoken';
import { Response } from 'express';

export const generateToken = (userId: string): string => {
  const options = {
    expiresIn: 60 * 60 * 24 * 7
  };

  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET as jwt.Secret,
    options
  );
};

export const setTokenCookie = (res: Response, token: string): void => {
  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const
  };

  res.cookie('token', token, options);
};