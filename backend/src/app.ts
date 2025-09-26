import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger, correlationId } from './middleware/requestLogger';
import { rateLimiter } from './middleware/rateLimiter';
import { healthRouter } from './routes/health';
import authRouter from './routes/auth';
import trucksRouter from './routes/trucks';
import tripsRouter from './routes/tripRoutes';
import usersRouter from './routes/users';
import maintenanceRouter from './routes/maintenance';
import ocrRouter from './routes/ocrRoutes';
import receiptsRouter from './routes/receipts';
import receiptVerificationRouter from './routes/receiptVerificationRoutes';
import reportsRouter from './routes/reportsRoutes';
import iftaRouter from './routes/iftaRoutes';

const app = express();

// Security middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Basic middlewares
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Custom middlewares
app.use(correlationId);
app.use(requestLogger);
app.use(rateLimiter);

// Routes
app.use('/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/trucks', trucksRouter);
app.use('/api/trips', tripsRouter);
app.use('/api/users', usersRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/ocr', ocrRouter);
app.use('/api/receipts', receiptsRouter);
app.use('/api/receipts/verification', receiptVerificationRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/ifta', iftaRouter);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export { app };
