import request from 'supertest';
import { Express } from 'express';
import { integrationTestPrisma, createTestJWT } from './setup';

// Mock Express app for testing
const createTestApp = (): Express => {
  const express = require('express');
  const app = express();
  
  app.use(express.json());
  
  // Auth middleware mock
  app.use('/api/protected', async (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  // Auth endpoints
  app.post('/api/auth/login', async (req: any, res: any) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    try {
      const user = await integrationTestPrisma.user.findUnique({
        where: { email }
      });

      if (!user || !user.isActive) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // In real app, would verify password hash
      if (password !== 'password123') {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = await createTestJWT(user.id, user.role);
      
      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        token
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.post('/api/auth/register', async (req: any, res: any) => {
    const { email, firstName, lastName, password, role } = req.body;
    
    if (!email || !firstName || !lastName || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }

    try {
      const existingUser = await integrationTestPrisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const user = await integrationTestPrisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          password: 'hashed-password', // In real app, would hash
          role: role || 'DRIVER'
        }
      });

      const token = await createTestJWT(user.id, user.role);

      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        token
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Receipt endpoints
  app.post('/api/protected/receipts', async (req: any, res: any) => {
    const { amount, merchantName, category, description, receiptDate } = req.body;
    
    if (!amount || !merchantName || !category) {
      return res.status(400).json({ error: 'Amount, merchant name, and category required' });
    }

    try {
      const receipt = await integrationTestPrisma.receipt.create({
        data: {
          uploadedById: req.user.userId,
          tripId: 'test-trip-123',
          fileName: 'test-receipt.jpg',
          filePath: '/uploads/receipt.jpg',
          fileSize: 1024,
          mimeType: 'image/jpeg',
          amount: parseFloat(amount),
          currency: 'USD',
          description: description || '',
          category: category.toUpperCase(),
          receiptDate: receiptDate ? new Date(receiptDate) : new Date(),
          status: 'PENDING'
        }
      });

      res.status(201).json(receipt);
    } catch (error) {
      console.error('Receipt creation error:', error);
      res.status(500).json({ error: 'Failed to create receipt' });
    }
  });

  app.get('/api/protected/receipts', async (req: any, res: any) => {
    try {
      const receipts = await integrationTestPrisma.receipt.findMany({
        where: req.user.role === 'ADMIN' ? {} : { uploadedById: req.user.userId },
        orderBy: { createdAt: 'desc' }
      });

      res.json(receipts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch receipts' });
    }
  });

  app.get('/api/protected/receipts/:id', async (req: any, res: any) => {
    try {
      const receipt = await integrationTestPrisma.receipt.findUnique({
        where: { id: req.params.id }
      });

      if (!receipt) {
        return res.status(404).json({ error: 'Receipt not found' });
      }

      // Check access permissions
      if (req.user.role !== 'ADMIN' && receipt.uploadedById !== req.user.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(receipt);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch receipt' });
    }
  });

  app.put('/api/protected/receipts/:id', async (req: any, res: any) => {
    const { status, rejectionReason } = req.body;
    
    try {
      const receipt = await integrationTestPrisma.receipt.findUnique({
        where: { id: req.params.id }
      });

      if (!receipt) {
        return res.status(404).json({ error: 'Receipt not found' });
      }

      // Only admins can update receipt status
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const updatedReceipt = await integrationTestPrisma.receipt.update({
        where: { id: req.params.id },
        data: {
          status: status?.toUpperCase(),
          rejectionReason: rejectionReason || null,
          approvedById: status?.toUpperCase() === 'APPROVED' ? req.user.userId : null,
          approvedAt: status?.toUpperCase() === 'APPROVED' ? new Date() : null
        }
      });

      res.json(updatedReceipt);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update receipt' });
    }
  });

  // Anomaly endpoints
  app.get('/api/protected/anomalies', async (req: any, res: any) => {
    // Only admins can view anomalies
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    try {
      const anomalies = await integrationTestPrisma.anomalyRecord.findMany({
        orderBy: { createdAt: 'desc' }
      });

      res.json(anomalies);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch anomalies' });
    }
  });

  app.post('/api/protected/anomalies/detect', async (req: any, res: any) => {
    // Only admins can trigger anomaly detection
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    try {
      // Simulate anomaly detection
      const receipts = await integrationTestPrisma.receipt.findMany({
        where: { status: 'PENDING' }
      });

      let anomaliesFound = 0;

      // Simple anomaly detection logic for testing
      for (const receipt of receipts) {
        if (receipt.amount && receipt.amount > 200) { // Excessive amount
          await integrationTestPrisma.anomalyRecord.create({
            data: {
              receiptId: receipt.id,
              ruleId: 'excessive-amount-rule',
              ruleName: 'Excessive Amount Rule',
              type: 'EXCESSIVE_AMOUNT',
              severity: 'HIGH',
              description: `Excessive amount: $${receipt.amount}`,
              details: JSON.stringify({ amount: receipt.amount, threshold: 200 }),
              confidence: 0.95,
              status: 'DETECTED'
            }
          });
          anomaliesFound++;
        }
      }

      res.json({
        message: 'Anomaly detection completed',
        receiptsChecked: receipts.length,
        anomaliesFound
      });
    } catch (error) {
      res.status(500).json({ error: 'Anomaly detection failed' });
    }
  });

  return app;
};

describe('API Integration Tests', () => {
  let app: Express;
  let adminToken: string;
  let driverToken: string;

  beforeAll(async () => {
    app = createTestApp();
    
    // Create test tokens
    const adminUser = await integrationTestPrisma.user.findUnique({
      where: { email: 'admin@test.com' }
    });
    const driverUser = await integrationTestPrisma.user.findUnique({
      where: { email: 'driver@test.com' }
    });

    if (adminUser) adminToken = await createTestJWT(adminUser.id, 'ADMIN');
    if (driverUser) driverToken = await createTestJWT(driverUser.id, 'DRIVER');
  });

  describe('Authentication Endpoints', () => {
    describe('POST /api/auth/login', () => {
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
        expect(response.body.user.role).toBe('ADMIN');
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

    describe('POST /api/auth/register', () => {
      it('should register new user', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: 'newdriver@test.com',
            firstName: 'New',
            lastName: 'Driver',
            password: 'password123',
            role: 'DRIVER'
          });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('user');
        expect(response.body).toHaveProperty('token');
        expect(response.body.user.email).toBe('newdriver@test.com');
      });

      it('should reject duplicate email', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: 'admin@test.com', // Already exists
            firstName: 'Duplicate',
            lastName: 'User',
            password: 'password123'
          });

        expect(response.status).toBe(409);
        expect(response.body.error).toContain('already registered');
      });
    });
  });

  describe('Receipt Endpoints', () => {
    describe('POST /api/protected/receipts', () => {
      it('should create receipt with valid data', async () => {
        const response = await request(app)
          .post('/api/protected/receipts')
          .set('Authorization', `Bearer ${driverToken}`)
          .send({
            amount: 45.67,
            merchantName: 'Shell Gas Station',
            category: 'fuel',
            description: 'Fuel purchase',
            receiptDate: '2025-09-17'
          });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.amount).toBe(45.67);
        expect(response.body.category).toBe('FUEL');
        expect(response.body.status).toBe('PENDING');
      });

      it('should reject receipt without authentication', async () => {
        const response = await request(app)
          .post('/api/protected/receipts')
          .send({
            amount: 45.67,
            merchantName: 'Shell Gas Station',
            category: 'fuel'
          });

        expect(response.status).toBe(401);
      });

      it('should reject receipt with missing required fields', async () => {
        const response = await request(app)
          .post('/api/protected/receipts')
          .set('Authorization', `Bearer ${driverToken}`)
          .send({
            amount: 45.67
            // Missing merchantName and category
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('required');
      });
    });

    describe('GET /api/protected/receipts', () => {
      it('should fetch receipts for authenticated user', async () => {
        // First create a receipt
        await request(app)
          .post('/api/protected/receipts')
          .set('Authorization', `Bearer ${driverToken}`)
          .send({
            amount: 25.50,
            merchantName: 'Test Restaurant',
            category: 'meals'
          });

        const response = await request(app)
          .get('/api/protected/receipts')
          .set('Authorization', `Bearer ${driverToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
      });

      it('should allow admin to see all receipts', async () => {
        const response = await request(app)
          .get('/api/protected/receipts')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
      });
    });

    describe('PUT /api/protected/receipts/:id', () => {
      it('should allow admin to update receipt status', async () => {
        // Create a receipt first
        const createResponse = await request(app)
          .post('/api/protected/receipts')
          .set('Authorization', `Bearer ${driverToken}`)
          .send({
            amount: 75.00,
            merchantName: 'Expensive Restaurant',
            category: 'meals'
          });

        const receiptId = createResponse.body.id;

        // Update as admin
        const response = await request(app)
          .put(`/api/protected/receipts/${receiptId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            status: 'approved'
          });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('APPROVED');
      });

      it('should reject driver updating receipt status', async () => {
        // Create a receipt first
        const createResponse = await request(app)
          .post('/api/protected/receipts')
          .set('Authorization', `Bearer ${driverToken}`)
          .send({
            amount: 30.00,
            merchantName: 'Coffee Shop',
            category: 'meals'
          });

        const receiptId = createResponse.body.id;

        // Try to update as driver
        const response = await request(app)
          .put(`/api/protected/receipts/${receiptId}`)
          .set('Authorization', `Bearer ${driverToken}`)
          .send({
            status: 'approved'
          });

        expect(response.status).toBe(403);
      });
    });
  });

  describe('Anomaly Detection Endpoints', () => {
    describe('GET /api/protected/anomalies', () => {
      it('should allow admin to fetch anomalies', async () => {
        const response = await request(app)
          .get('/api/protected/anomalies')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
      });

      it('should reject driver access to anomalies', async () => {
        const response = await request(app)
          .get('/api/protected/anomalies')
          .set('Authorization', `Bearer ${driverToken}`);

        expect(response.status).toBe(403);
      });
    });

    describe('POST /api/protected/anomalies/detect', () => {
      it('should detect anomalies in pending receipts', async () => {
        // Create an excessive amount receipt
        await request(app)
          .post('/api/protected/receipts')
          .set('Authorization', `Bearer ${driverToken}`)
          .send({
            amount: 250.00, // Over threshold
            merchantName: 'Expensive Gas Station',
            category: 'fuel'
          });

        // Trigger anomaly detection
        const response = await request(app)
          .post('/api/protected/anomalies/detect')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.anomaliesFound).toBeGreaterThan(0);
        expect(response.body).toHaveProperty('receiptsChecked');
      });

      it('should reject driver triggering anomaly detection', async () => {
        const response = await request(app)
          .post('/api/protected/anomalies/detect')
          .set('Authorization', `Bearer ${driverToken}`);

        expect(response.status).toBe(403);
      });
    });
  });
});