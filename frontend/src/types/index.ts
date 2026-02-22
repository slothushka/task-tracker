export type TaskStatus = 'pending' | 'completed';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface TasksResponse {
  success: boolean;
  count: number;
  source: 'cache' | 'db';
  tasks: Task[];
}

export interface TaskResponse {
  success: boolean;
  task: Task;
}

export interface ApiError {
  success: false;
  message: string;
}

export interface TaskFilters {
  status?: TaskStatus | '';
  sort?: string;
}
