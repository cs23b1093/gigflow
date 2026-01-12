import mongoose, { Document, Schema } from 'mongoose';

export interface IBid extends Document {
  gigId: mongoose.Types.ObjectId;
  freelancerId: mongoose.Types.ObjectId;
  message: string;
  price: number;
  status: 'pending' | 'hired' | 'rejected';
  hiredAt?: Date;
  rejectedAt?: Date;
  rejectedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bidSchema = new Schema<IBid>({
  gigId: {
    type: Schema.Types.ObjectId,
    ref: 'Gig',
    required: [true, 'Gig ID is required']
  },
  freelancerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Freelancer ID is required']
  },
  message: {
    type: String,
    required: [true, 'Bid message is required'],
    trim: true,
    minlength: [10, 'Bid message must be at least 10 characters long'],
    maxlength: [1000, 'Bid message cannot exceed 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Bid price is required'],
    min: [1, 'Bid price must be at least $1'],
    max: [1000000, 'Bid price cannot exceed $1,000,000']
  },
  status: {
    type: String,
    enum: ['pending', 'hired', 'rejected'],
    default: 'pending'
  },
  hiredAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  },
  rejectedReason: {
    type: String,
    maxlength: [200, 'Rejection reason cannot exceed 200 characters']
  }
}, {
  timestamps: true
});

// Prevent duplicate bids from same freelancer on same gig
bidSchema.index({ gigId: 1, freelancerId: 1 }, { unique: true });

// Performance indexes
bidSchema.index({ gigId: 1, status: 1 });
bidSchema.index({ freelancerId: 1 });
bidSchema.index({ createdAt: -1 });

export default mongoose.model<IBid>('Bid', bidSchema);