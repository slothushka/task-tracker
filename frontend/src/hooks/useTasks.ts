'use client';

import { useState, useCallback, useOptimistic, useTransition } from 'react';
import { Task, TaskFilters } from '@/types';
import { tasksApi } from '@/lib/api';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const [optimisticTasks, updateOptimisticTasks] = useOptimistic(
    tasks,
    (current: Task[], action: { type: string; payload: Partial<Task> & { id?: string } }) => {
      switch (action.type) {
        case 'delete':
          return current.filter((t) => t.id !== action.payload.id);
        case 'update':
          return current.map((t) =>
            t.id === action.payload.id ? { ...t, ...action.payload } : t
          );
        case 'add':
          return [action.payload as Task, ...current];
        default:
          return current;
      }
    }
  );

  const fetchTasks = useCallback(async (filters: TaskFilters = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await tasksApi.list(filters);
      setTasks(res.tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTask = useCallback(
    async (data: { title: string; description?: string; status?: string; dueDate?: string }) => {
      // Optimistic placeholder
      const tempId = `temp-${Date.now()}`;
      const optimisticTask: Task = {
        id: tempId,
        title: data.title,
        description: data.description,
        status: (data.status as Task['status']) || 'pending',
        dueDate: data.dueDate,
        owner: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      startTransition(() => {
        updateOptimisticTasks({ type: 'add', payload: optimisticTask });
      });

      const res = await tasksApi.create(data);
      // Replace temp with real
      setTasks((prev) => [res.task, ...prev.filter((t) => t.id !== tempId)]);
      return res.task;
    },
    [updateOptimisticTasks]
  );

  const updateTask = useCallback(
    async (id: string, data: Partial<Task>) => {
      startTransition(() => {
        updateOptimisticTasks({ type: 'update', payload: { ...data, id } });
      });

      const res = await tasksApi.update(id, data);
      setTasks((prev) => prev.map((t) => (t.id === id ? res.task : t)));
      return res.task;
    },
    [updateOptimisticTasks]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      startTransition(() => {
        updateOptimisticTasks({ type: 'delete', payload: { id } });
      });

      await tasksApi.delete(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    },
    [updateOptimisticTasks]
  );

  return {
    tasks: optimisticTasks,
    isLoading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
};
