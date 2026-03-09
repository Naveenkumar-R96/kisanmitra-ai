// backend/src/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { errorMiddleware } from './middleware/error.middleware.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import advisoryRoutes from './routes/advisory.routes.js';
import pestRoutes from './routes/pest.routes.js';
import marketRoutes from './routes/market.routes.js';
import weatherRoutes from './routes/weather.routes.js';
import schemeRoutes from './routes/scheme.routes.js';
import communityRoutes from './routes/community.routes.js';

const app = express();
const httpServer = createServer(app);

// Socket.IO for real-time market prices
export const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL, methods: ['GET', 'POST'] }
});

// ─── Middleware ───
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───
app.use('/api/auth',      authRoutes);
app.use('/api/advisory',  advisoryRoutes);
app.use('/api/pest',      pestRoutes);
app.use('/api/market',    marketRoutes);
app.use('/api/weather',   weatherRoutes);
app.use('/api/schemes',   schemeRoutes);
app.use('/api/community', communityRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    app: 'KisanMitra AI', 
    version: '1.0.0',
    timestamp: new Date().toISOString() 
  });
});

// Socket.IO events
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('join-market', (crop) => socket.join(`market-${crop}`));
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

// Error handler (must be last)
app.use(errorMiddleware);

export { httpServer };