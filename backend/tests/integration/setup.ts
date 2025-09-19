import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

export const integrationTestPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/truck_monitoring_test'
    }
  }
});

// Setup before all integration tests
beforeAll(async () => {
  try {
    // Reset database schema
    await integrationTestPrisma.$executeRawUnsafe('DROP SCHEMA public CASCADE');
    await integrationTestPrisma.$executeRawUnsafe('CREATE SCHEMA public');
    
    // Run migrations
    execSync('npx prisma migrate deploy', { 
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
    });
    
    // Seed test data
    await seedIntegrationTestData();
  } catch (error) {
    console.warn('Database setup failed, continuing with existing schema:', error);
  }
});

// Cleanup after all integration tests
afterAll(async () => {
  await cleanupIntegrationTestData();
  await integrationTestPrisma.$disconnect();
});

// Cleanup before each test
beforeEach(async () => {
  // Clear transaction-specific data
  await integrationTestPrisma.anomalyRecord.deleteMany();
  await integrationTestPrisma.receipt.deleteMany();
});

export async function seedIntegrationTestData() {
  // Create test admin user
  const adminUser = await integrationTestPrisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      firstName: 'Test',
      lastName: 'Admin',
      role: 'ADMIN',
      password: '$2b$12$LQv3c1yqBwlI4QR5g0y2a.4H9H9H9H9H9H9H9H9H9H9H9H9H9H9H9', // 'password123'
      isActive: true,
    }
  });

  // Create test driver user  
  const driverUser = await integrationTestPrisma.user.upsert({
    where: { email: 'driver@test.com' },
    update: {},
    create: {
      email: 'driver@test.com',
      firstName: 'Test',
      lastName: 'Driver',
      role: 'DRIVER',
      password: '$2b$12$LQv3c1yqBwlI4QR5g0y2a.4H9H9H9H9H9H9H9H9H9H9H9H9H9H9H9', // 'password123'
      isActive: true,
    }
  });

  // Create test trip
  const testTrip = await integrationTestPrisma.trip.upsert({
    where: { id: 'test-trip-123' },
    update: {},
    create: {
      id: 'test-trip-123',
      driverId: driverUser.id,
      truckId: 'test-truck-123',
      driverProfileId: 'test-profile-123',
      startLocation: 'Test Origin',
      endLocation: 'Test Destination',
      scheduledStartTime: new Date('2025-09-15'),
      scheduledEndTime: new Date('2025-09-25'),
      status: 'IN_PROGRESS'
    }
  });

  return {
    adminUser,
    driverUser,
    testTrip
  };
}

export async function cleanupIntegrationTestData() {
  await integrationTestPrisma.anomalyRecord.deleteMany();
  await integrationTestPrisma.receipt.deleteMany();
  await integrationTestPrisma.trip.deleteMany();
  await integrationTestPrisma.user.deleteMany();
}

export async function createTestJWT(userId: string, role: string): Promise<string> {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
}