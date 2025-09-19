import request from 'supertest';
import app from '../src/index';

describe('API Endpoints', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        status: 'OK',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
      });
    });
  });

  describe('Auth Routes', () => {
    it('should respond to auth profile endpoint', async () => {
      const response = await request(app).get('/api/auth/profile');
      
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        message: 'Auth profile endpoint',
      });
    });
  });

  describe('Trucks Routes', () => {
    it('should respond to trucks endpoint', async () => {
      const response = await request(app).get('/api/trucks');
      
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        message: 'Get all trucks',
      });
    });
  });
});
