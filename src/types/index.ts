import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Gig {
  _id: string;
  title: string;
  description: string;
  budget: number;
  ownerId: string;
  status: 'open' | 'assigned';
  createdAt: Date;
  updatedAt: Date;
}

export interface Bid {
  _id: string;
  gigId: string;
  freelancerId: string;
  message: string;
  price: number;
  status: 'pending' | 'hired' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}