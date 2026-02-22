import '../setup';
import mongoose from 'mongoose';
import { Task } from '../../../models/Task';
import { User } from '../../../models/User';

describe('Task Model — Unit Tests', () => {
  let ownerId: mongoose.Types.ObjectId;

  beforeEach(async () => {
    const user = await User.create({
      name: 'Owner',
      email: 'owner@example.com',
      password: 'pass123',
    });
    ownerId = user._id as mongoose.Types.ObjectId;
  });

  describe('Schema validation', () => {
    it('should create a task with minimal valid data', async () => {
      const task = await Task.create({ title: 'Buy milk', owner: ownerId });

      expect(task._id).toBeDefined();
      expect(task.title).toBe('Buy milk');
      expect(task.status).toBe('pending'); // default
      expect(task.owner.toString()).toBe(ownerId.toString());
      expect(task.createdAt).toBeInstanceOf(Date);
    });

    it('should create a task with all fields', async () => {
      const dueDate = new Date('2025-12-31');
      const task = await Task.create({
        title: 'Full task',
        description: 'A detailed description',
        status: 'completed',
        dueDate,
        owner: ownerId,
      });

      expect(task.description).toBe('A detailed description');
      expect(task.status).toBe('completed');
      expect(task.dueDate).toEqual(dueDate);
    });

    it('should reject missing title', async () => {
      await expect(Task.create({ owner: ownerId })).rejects.toThrow();
    });

    it('should reject missing owner', async () => {
      await expect(Task.create({ title: 'No owner' })).rejects.toThrow();
    });

    it('should reject invalid status', async () => {
      await expect(
        Task.create({ title: 'Bad status', status: 'invalid_status', owner: ownerId })
      ).rejects.toThrow();
    });

    it('should reject title exceeding max length', async () => {
      await expect(
        Task.create({ title: 'x'.repeat(201), owner: ownerId })
      ).rejects.toThrow();
    });

    it('should trim whitespace from title', async () => {
      const task = await Task.create({ title: '  Trimmed  ', owner: ownerId });
      expect(task.title).toBe('Trimmed');
    });
  });

  describe('Indexes', () => {
    it('should have indexes on owner and status', async () => {
      const indexes = await Task.collection.indexes();
      const indexFields = indexes.map((idx) => Object.keys(idx.key).join(','));

      // Compound index owner+createdAt
      expect(indexFields).toContain('owner,createdAt');
      // Compound index owner+status
      expect(indexFields).toContain('owner,status');
    });
  });
});
