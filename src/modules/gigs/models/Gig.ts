import mongoose, { Document, Schema } from 'mongoose';

export interface IGig extends Document {
  title: string;
  description: string;
  budget: number;
  ownerId: mongoose.Types.ObjectId;
  status: 'open' | 'assigned';
  hiredAt?: Date;
  hiredBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const gigSchema = new Schema<IGig>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters long'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [20, 'Description must be at least 20 characters long'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  budget: {
    type: Number,
    required: [true, 'Budget is required'],
    min: [1, 'Budget must be at least $1'],
    max: [1000000, 'Budget cannot exceed $1,000,000']
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner ID is required']
  },
  status: {
    type: String,
    enum: ['open', 'assigned'],
    default: 'open'
  },
  hiredAt: {
    type: Date
  },
  hiredBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for better search performance
gigSchema.index({ title: 'text', description: 'text' });
gigSchema.index({ status: 1 });
gigSchema.index({ createdAt: -1 });
gigSchema.index({ ownerId: 1 });

export default mongoose.model<IGig>('Gig', gigSchema);