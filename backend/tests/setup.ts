import { PrismaClient } from '@prisma/client';

// Extend global type
declare global {
  var testUtils: {
    prisma: PrismaClient;
    seedTestData(): Promise<any>;
    cleanupTestData(): Promise<void>;
  };
}

// Global test setup
export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/truck_monitoring_test'
    }
  }
});

// Mock console methods in test environment
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test utilities
global.testUtils = {
  prisma: testPrisma,
  
  // Helper to create test data
  async seedTestData() {
    // Clean existing data
    await this.cleanupTestData();
    
    // Create test users
    const testDriver = await testPrisma.user.create({
      data: {
        email: 'driver@test.com',
        firstName: 'Test',
        lastName: 'Driver',
        role: 'DRIVER',
        password: 'hashedPassword123',
        isActive: true
      }
    });

    const testAdmin = await testPrisma.user.create({
      data: {
        email: 'admin@test.com',
        firstName: 'Test',
        lastName: 'Admin',
        role: 'ADMIN',
        password: 'hashedPassword123',
        isActive: true
      }
    });

    // Create test trip - simplified without truck relations for now
    const testTrip = await testPrisma.trip.create({
      data: {
        driverId: testDriver.id,
        truckId: 'test-truck-id',
        driverProfileId: 'test-profile-id',
        startLocation: 'Test Origin',
        endLocation: 'Test Destination',
        scheduledStartTime: new Date('2025-09-15'),
        scheduledEndTime: new Date('2025-09-20'),
        status: 'IN_PROGRESS'
      }
    });

    return {
      driver: testDriver,
      admin: testAdmin,
      trip: testTrip
    };
  },

  // Helper to cleanup test data
  async cleanupTestData() {
    await testPrisma.anomalyRecord.deleteMany();
    await testPrisma.receipt.deleteMany();
    await testPrisma.trip.deleteMany();
    await testPrisma.user.deleteMany();
  }
};

// Setup before each test
beforeEach(async () => {
  // Clear all mocks
  jest.clearAllMocks();
});

// Global cleanup
afterAll(async () => {
  await global.testUtils.cleanupTestData();
  await testPrisma.$disconnect();
});