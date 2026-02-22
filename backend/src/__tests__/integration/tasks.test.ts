import '../setup';
import request from 'supertest';
import { createApp } from '../../../app';

const app = createApp();

// Helper: signup and return JWT token
const getAuthToken = async (suffix = ''): Promise<string> => {
  const res = await request(app)
    .post('/api/auth/signup')
    .send({
      name: `User${suffix}`,
      email: `user${suffix}@example.com`,
      password: 'password123',
    });
  return res.body.token as string;
};

describe('Task Endpoints — Integration Tests', () => {
  let token: string;

  beforeEach(async () => {
    token = await getAuthToken(Date.now().toString());
  });

  // ── GET /api/tasks ───────────────────────────────────────────────────────
  describe('GET /api/tasks', () => {
    it('should return empty array for new user', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.tasks).toEqual([]);
      expect(res.body.count).toBe(0);
    });

    it('should require authentication', async () => {
      const res = await request(app).get('/api/tasks');
      expect(res.status).toBe(401);
    });

    it('should return 401 for invalid token', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', 'Bearer invalidtoken');
      expect(res.status).toBe(401);
    });

    it('should serve from cache on second request', async () => {
      // Create a task first
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Cache test task' });

      // First request — hits DB
      const first = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${token}`);
      expect(first.body.source).toBe('db');

      // Second request — hits cache
      const second = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${token}`);
      expect(second.body.source).toBe('cache');
      expect(second.body.tasks).toHaveLength(1);
    });

    it('should filter tasks by status', async () => {
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Pending task', status: 'pending' });

      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Completed task', status: 'completed' });

      const res = await request(app)
        .get('/api/tasks?status=pending')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.tasks).toHaveLength(1);
      expect(res.body.tasks[0].status).toBe('pending');
    });

    it('should only return tasks belonging to the logged-in user', async () => {
      // Create task for user A
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'User A task' });

      // Create user B and their task
      const tokenB = await getAuthToken('B' + Date.now());
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ title: 'User B task' });

      // User A should only see their own task
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${token}`);

      expect(res.body.tasks).toHaveLength(1);
      expect(res.body.tasks[0].title).toBe('User A task');
    });
  });

  // ── POST /api/tasks ──────────────────────────────────────────────────────
  describe('POST /api/tasks', () => {
    it('should create a task with required fields only', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'New task' });

      expect(res.status).toBe(201);
      expect(res.body.task.title).toBe('New task');
      expect(res.body.task.status).toBe('pending');
    });

    it('should create a task with all fields', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Full task',
          description: 'A description',
          status: 'completed',
          dueDate: '2025-12-31',
        });

      expect(res.status).toBe(201);
      expect(res.body.task.description).toBe('A description');
      expect(res.body.task.status).toBe('completed');
    });

    it('should invalidate cache after creating a task', async () => {
      // Warm the cache
      await request(app).get('/api/tasks').set('Authorization', `Bearer ${token}`);

      // Create task (should bust cache)
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Cache buster' });

      // Next GET should hit DB and include the new task
      const res = await request(app).get('/api/tasks').set('Authorization', `Bearer ${token}`);
      expect(res.body.source).toBe('db');
      expect(res.body.tasks).toHaveLength(1);
    });

    it('should return 400 when title is missing', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'No title' });
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid status', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Bad task', status: 'in-progress' });
      expect(res.status).toBe(400);
    });
  });

  // ── PUT /api/tasks/:id ───────────────────────────────────────────────────
  describe('PUT /api/tasks/:id', () => {
    let taskId: string;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updatable task' });
      taskId = res.body.task.id as string;
    });

    it('should update a task', async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated title', status: 'completed' });

      expect(res.status).toBe(200);
      expect(res.body.task.title).toBe('Updated title');
      expect(res.body.task.status).toBe('completed');
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .put(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'X' });
      expect(res.status).toBe(404);
    });

    it('should not allow updating another user\'s task', async () => {
      const otherToken = await getAuthToken('Other' + Date.now());
      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Stolen' });
      expect(res.status).toBe(404); // not found from their perspective
    });

    it('should invalidate cache after update', async () => {
      // Warm cache
      await request(app).get('/api/tasks').set('Authorization', `Bearer ${token}`);

      await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'completed' });

      const res = await request(app).get('/api/tasks').set('Authorization', `Bearer ${token}`);
      expect(res.body.source).toBe('db');
    });
  });

  // ── DELETE /api/tasks/:id ────────────────────────────────────────────────
  describe('DELETE /api/tasks/:id', () => {
    let taskId: string;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Deletable task' });
      taskId = res.body.task.id as string;
    });

    it('should delete a task', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify it's gone
      const check = await request(app).get('/api/tasks').set('Authorization', `Bearer ${token}`);
      expect(check.body.tasks).toHaveLength(0);
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .delete(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });

    it('should not allow deleting another user\'s task', async () => {
      const otherToken = await getAuthToken('Del' + Date.now());
      const res = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${otherToken}`);
      expect(res.status).toBe(404);
    });

    it('should invalidate cache after delete', async () => {
      await request(app).get('/api/tasks').set('Authorization', `Bearer ${token}`);

      await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`);

      const res = await request(app).get('/api/tasks').set('Authorization', `Bearer ${token}`);
      expect(res.body.source).toBe('db');
    });
  });
});
