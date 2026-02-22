import { Schema, model, Document, Types } from 'mongoose';
import { TaskStatus } from '../types';

export interface ITask extends Document {
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: Date;
  owner: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'completed'],
        message: 'Status must be either pending or completed',
      },
      default: 'pending',
    },
    dueDate: {
      type: Date,
      validate: {
        validator: function (val: Date) {
          // Allow past dates on updates; only restrict on creation
          return true;
        },
        message: 'Invalid due date',
      },
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must belong to a user'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ── Indexes ────────────────────────────────────────────────────────────────
// Primary: list tasks for a specific user (most common query)
taskSchema.index({ owner: 1, createdAt: -1 });
// Filtering by status for a user
taskSchema.index({ owner: 1, status: 1 });
// Filtering by due date for a user
taskSchema.index({ owner: 1, dueDate: 1 });

export const Task = model<ITask>('Task', taskSchema);
