// backend/src/server.js
import 'dotenv/config';
import { httpServer } from './app.js';
import { connectDB } from './config/db.js';
import { connectRedis } from './config/redis.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();

    httpServer.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════╗
║   🌾 KisanMitra AI Server Running   ║
║   Port  : ${PORT}                       ║
║   DB    : MongoDB ✅                 ║
║   Cache : Redis  ✅                  ║
║   Mode  : ${process.env.NODE_ENV}             ║
╚══════════════════════════════════════╝
      `);
    });

  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

startServer();