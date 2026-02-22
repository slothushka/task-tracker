import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { setRedisClient } from '../../config/db';

// Use ioredis-mock so no real Redis needed in tests
// eslint-disable-next-line @typescript-eslint/no-require-imports
const RedisMock = require('ioredis-mock');

let mongoServer: MongoMemoryServer;

// ── Global setup ──────────────────────────────────────────────────────────
beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Inject Redis mock
  setRedisClient(new RedisMock());

  // Set required env vars for tests
  process.env.JWT_SECRET = 'test-jwt-secret-at-least-32-chars-long';
  process.env.JWT_EXPIRES_IN = '1h';
});

// ── Clear data between tests ──────────────────────────────────────────────
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// ── Global teardown ───────────────────────────────────────────────────────
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
