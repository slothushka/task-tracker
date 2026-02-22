import '../setup';
import request from 'supertest';
import { createApp } from '../../../app';

const app = createApp();

describe('Auth Endpoints — Integration Tests', () => {
  const validUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  };

  // ── POST /api/auth/signup ────────────────────────────────────────────────
  describe('POST /api/auth/signup', () => {
    it('should create a user and return a JWT', async () => {
      const res = await request(app).post('/api/auth/signup').send(validUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toMatchObject({
        name: validUser.name,
        email: validUser.email,
      });
      expect(res.body.user.password).toBeUndefined(); // password must not be leaked
    });

    it('should return 400 when name is missing', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'a@b.com', password: 'pass123' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when email is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ name: 'X', email: 'not-an-email', password: 'pass123' });
      expect(res.status).toBe(400);
    });

    it('should return 400 when password is too short', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ name: 'X', email: 'x@x.com', password: '123' });
      expect(res.status).toBe(400);
    });

    it('should return 409 for duplicate email', async () => {
      await request(app).post('/api/auth/signup').send(validUser);
      const res = await request(app).post('/api/auth/signup').send(validUser);
      expect(res.status).toBe(409);
    });
  });

  // ── POST /api/auth/login ─────────────────────────────────────────────────
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Pre-create the user
      await request(app).post('/api/auth/signup').send(validUser);
    });

    it('should authenticate and return a JWT', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: validUser.email, password: validUser.password });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(validUser.email);
    });

    it('should return 401 for wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: validUser.email, password: 'wrongpassword' });
      expect(res.status).toBe(401);
    });

    it('should return 401 for non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'ghost@example.com', password: 'pass123' });
      expect(res.status).toBe(401);
    });

    it('should return 400 when email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'pass123' });
      expect(res.status).toBe(400);
    });
  });
});
