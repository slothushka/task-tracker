import { Response, NextFunction } from 'express';
import { Task } from '../models/Task';
import { AuthRequest } from '../middleware/auth';
import { cacheGet, cacheSet, cacheDel } from '../utils/cache';
import { tasksCacheKey } from '../config/db';
import { TaskStatus } from '../types';

// ── GET /api/tasks ─────────────────────────────────────────────────────────
export const getTasks = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { status, dueBefore, dueAfter, sort = 'createdAt_desc' } = req.query;

    // Build query filter
    const filter: Record<string, unknown> = { owner: userId };
    if (status && ['pending', 'completed'].includes(status as string)) {
      filter.status = status as TaskStatus;
    }
    if (dueBefore || dueAfter) {
      filter.dueDate = {};
      if (dueAfter) (filter.dueDate as Record<string, unknown>).$gte = new Date(dueAfter as string);
      if (dueBefore) (filter.dueDate as Record<string, unknown>).$lte = new Date(dueBefore as string);
    }

    // Only cache unfiltered results per user (filters are dynamic)
    const isFiltered = status || dueBefore || dueAfter;
    const cacheKey = isFiltered ? null : tasksCacheKey(userId);

    if (cacheKey) {
      const cached = await cacheGet<unknown[]>(cacheKey);
      if (cached) {
        res.status(200).json({ success: true, count: cached.length, source: 'cache', tasks: cached });
        return;
      }
    }

    // Build sort
    const [sortField, sortDir] = (sort as string).split('_');
    const sortQuery: Record<string, 1 | -1> = {
      [sortField || 'createdAt']: sortDir === 'asc' ? 1 : -1,
    };

    const tasks = await Task.find(filter).sort(sortQuery).lean();

    // Cache unfiltered results
    if (cacheKey) {
      await cacheSet(cacheKey, tasks);
    }

    res.status(200).json({ success: true, count: tasks.length, source: 'db', tasks });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/tasks ────────────────────────────────────────────────────────
export const createTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, description, status, dueDate } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      owner: req.userId,
    });

    // Invalidate user's task cache
    await cacheDel(tasksCacheKey(req.userId!));

    res.status(201).json({ success: true, task });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/tasks/:id ─────────────────────────────────────────────────────
export const updateTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, description, status, dueDate } = req.body;

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId }, // owner check prevents cross-user access
      updateData,
      { new: true, runValidators: true }
    );

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found.' });
      return;
    }

    // Invalidate user's task cache
    await cacheDel(tasksCacheKey(req.userId!));

    res.status(200).json({ success: true, task });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/tasks/:id ──────────────────────────────────────────────────
export const deleteTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.userId,
    });

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found.' });
      return;
    }

    // Invalidate user's task cache
    await cacheDel(tasksCacheKey(req.userId!));

    res.status(200).json({ success: true, message: 'Task deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
