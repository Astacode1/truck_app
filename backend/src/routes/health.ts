import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: 'connected' | 'disconnected' | 'error';
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
  };
}

router.get('/', async (req: Request, res: Response) => {
  const startTime = Date.now();
  let dbStatus: 'connected' | 'disconnected' | 'error' = 'disconnected';

  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (error) {
    console.error('Database health check failed:', error);
    dbStatus = 'error';
  }

  // Memory usage
  const memoryUsage = process.memoryUsage();
  const memoryUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
  const memoryTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
  const memoryPercentage = Math.round((memoryUsedMB / memoryTotalMB) * 100);

  const healthStatus: HealthStatus = {
    status: dbStatus === 'connected' ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: dbStatus,
      memory: {
        used: memoryUsedMB,
        total: memoryTotalMB,
        percentage: memoryPercentage,
      },
    },
  };

  const responseTime = Date.now() - startTime;
  
  res.status(healthStatus.status === 'healthy' ? 200 : 503).json({
    ...healthStatus,
    responseTime: `${responseTime}ms`,
  });
});

// Detailed health check for monitoring systems
router.get('/detailed', async (req: Request, res: Response) => {
  const checks = [];
  
  try {
    // Database connectivity check
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.push({
      name: 'database',
      status: 'healthy',
      responseTime: Date.now() - dbStart,
      message: 'Database connection successful',
    });
  } catch (error) {
    checks.push({
      name: 'database',
      status: 'unhealthy',
      responseTime: null,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  // Memory check
  const memoryUsage = process.memoryUsage();
  const memoryUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
  const memoryTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
  const memoryPercentage = Math.round((memoryUsedMB / memoryTotalMB) * 100);
  
  checks.push({
    name: 'memory',
    status: memoryPercentage < 90 ? 'healthy' : 'warning',
    responseTime: null,
    message: `Memory usage: ${memoryUsedMB}MB / ${memoryTotalMB}MB (${memoryPercentage}%)`,
    details: {
      heapUsed: memoryUsedMB,
      heapTotal: memoryTotalMB,
      percentage: memoryPercentage,
    },
  });

  // Disk space check (if needed)
  // CPU usage check (if needed)
  
  const overallStatus = checks.every(check => check.status === 'healthy') 
    ? 'healthy' 
    : checks.some(check => check.status === 'unhealthy') 
      ? 'unhealthy' 
      : 'warning';

  res.status(overallStatus === 'healthy' ? 200 : overallStatus === 'warning' ? 200 : 503).json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks,
  });
});

// Readiness probe (for Kubernetes)
router.get('/ready', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ ready: true });
  } catch (error) {
    res.status(503).json({ ready: false, error: 'Database not ready' });
  }
});

// Liveness probe (for Kubernetes)
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({ alive: true });
});

export { router as healthRouter };
