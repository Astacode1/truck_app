import request from 'supertest';
import express from 'express';

describe('Simple API Integration Tests', () => {
  let app: any;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Simple health check endpoint
    app.get('/health', (req: any, res: any) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Simple auth endpoint mock
    app.post('/api/auth/login', (req: any, res: any) => {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      if (email === 'admin@test.com' && password === 'password123') {
        res.json({
          user: { id: '1', email, role: 'ADMIN' },
          token: 'fake-jwt-token'
        });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    });

    // Protected endpoint mock
    app.get('/api/protected/data', (req: any, res: any) => {
      const token = req.headers.authorization;
      
      if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }

      if (token === 'Bearer fake-jwt-token') {
        res.json({ data: 'Protected data accessed successfully' });
      } else {
        res.status(401).json({ error: 'Invalid token' });
      }
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Authentication', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('admin@test.com');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('required');
    });
  });

  describe('Protected Routes', () => {
    it('should access protected data with valid token', async () => {
      const response = await request(app)
        .get('/api/protected/data')
        .set('Authorization', 'Bearer fake-jwt-token');

      expect(response.status).toBe(200);
      expect(response.body.data).toBe('Protected data accessed successfully');
    });

    it('should reject access without token', async () => {
      const response = await request(app)
        .get('/api/protected/data');

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('No token provided');
    });

    it('should reject access with invalid token', async () => {
      const response = await request(app)
        .get('/api/protected/data')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid token');
    });
  });
});