import 'dotenv/config';
import { createApp } from './app';
import { connectDB, getRedisClient } from './config/db';

const PORT = process.env.PORT || 4000;

const start = async (): Promise<void> => {
  await connectDB();

  // Eagerly connect Redis (lazy connect is set, so this won't throw)
  try {
    await getRedisClient().connect();
  } catch {
    console.warn('⚠️  Redis not available — caching disabled');
  }

  const app = createApp();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

start().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
