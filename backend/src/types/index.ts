import { Types } from 'mongoose';

export type TaskStatus = 'pending' | 'completed';

export interface JwtPayload {
  id: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Express.Request {
  userId?: string;
}

// Serialized shapes (safe to send to clients)
export interface UserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface TaskResponse {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: Date;
  owner: Types.ObjectId;
  createdAt: Date;
}
