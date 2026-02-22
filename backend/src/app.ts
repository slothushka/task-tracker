import express, { Application } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import { errorHandler } from './middleware/errorHandler';

export const createApp = (): Application => {
  const app = express();

  // ── CORS ───────────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    })
  );

  // ── Body parsing ───────────────────────────────────────────────────────
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: false }));

  // ── Health check ───────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ── API routes ─────────────────────────────────────────────────────────
  app.use('/api/auth', authRoutes);
  app.use('/api/tasks', taskRoutes);

  // ── 404 handler ────────────────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found.' });
  });

  // ── Global error handler (must be last) ────────────────────────────────
  app.use(errorHandler);

  return app;
};
