import 'dotenv/config';
import { httpServer } from './app.js';
import { connectDB } from './config/db.js';
import { connectRedis } from './config/redis.js';
import { seedDatabase } from './config/seed.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();

    // Auto seed on startup
    await seedDatabase();

    httpServer.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════╗
║   🌾 KisanMitra AI Server Running   ║
║   Port  : ${PORT}                       ║
║   DB    : MongoDB ✅                 ║
║   Cache : Redis  ✅                  ║
╚══════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

startServer();