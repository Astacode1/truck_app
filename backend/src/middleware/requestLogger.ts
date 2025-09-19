import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';

// Custom token for user ID
morgan.token('userId', (req: any) => {
  return req.user?.id || 'anonymous';
});

// Custom token for correlation ID
morgan.token('correlationId', (req: any) => {
  return req.correlationId || 'none';
});

// Development format with colors
const developmentFormat = morgan('combined', {
  stream: {
    write: (message: string) => {
      console.log(message.trim());
    },
  },
});

// Production format with JSON structure
const productionFormat = morgan(
  JSON.stringify({
    method: ':method',
    url: ':url',
    status: ':status',
    responseTime: ':response-time ms',
    contentLength: ':res[content-length]',
    userAgent: ':user-agent',
    ip: ':remote-addr',
    userId: ':userId',
    correlationId: ':correlationId',
    timestamp: ':date[iso]',
  }),
  {
    stream: {
      write: (message: string) => {
        console.log(JSON.parse(message));
      },
    },
  }
);

export const requestLogger = process.env.NODE_ENV === 'production' 
  ? productionFormat 
  : developmentFormat;

// Add correlation ID to each request
export const correlationId = (req: any, res: Response, next: NextFunction) => {
  const id = req.headers['x-correlation-id'] || 
             req.headers['x-request-id'] || 
             Math.random().toString(36).substring(2, 15);
  
  req.correlationId = id;
  res.setHeader('X-Correlation-ID', id);
  next();
};
