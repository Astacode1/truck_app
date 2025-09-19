import { 
  ExcessiveAmountRule, 
  DuplicateReceiptRule, 
  OutsideTripDatesRule,
  SuspiciousMerchantRule,
  FrequentSubmissionRule 
} from '../../anomaly/rules';
import { AnomalyContext, Receipt, Driver, Trip } from '../../anomaly/types';

describe('Anomaly Detection Rules', () => {
  let mockContext: AnomalyContext;
  let mockReceipt: Receipt;
  let mockDriver: Driver;
  let mockTrip: Trip;

  beforeEach(() => {
    // Setup mock data
    mockDriver = {
      id: 'driver-123',
      firstName: 'Test',
      lastName: 'Driver',
      email: 'driver@test.com',
      phone: '555-0123',
      licenseNumber: 'CDL123456',
      hireDate: new Date('2023-01-01'),
      isActive: true,
    };

    mockTrip = {
      id: 'trip-123',
      driverId: 'driver-123',
      vehicleId: 'vehicle-123',
      startDate: new Date('2025-09-15'),
      endDate: new Date('2025-09-20'),
      origin: 'Test Origin',
      destination: 'Test Destination',
      status: 'active',
    };

    mockReceipt = {
      id: 'receipt-123',
      userId: 'driver-123',
      driverId: 'driver-123',
      tripId: 'trip-123',
      amount: 50.00,
      merchantName: 'Test Gas Station',
      category: 'fuel',
      description: 'Fuel purchase',
      receiptDate: new Date('2025-09-17'),
      submittedAt: new Date('2025-09-17'),
      imageUrl: '/receipts/test.jpg',
      status: 'pending',
      flagged: false,
    };

    // Create historical receipts for context
    const historicalReceipts: Receipt[] = [];
    for (let i = 1; i <= 10; i++) {
      historicalReceipts.push({
        id: `historical-${i}`,
        userId: 'driver-123',
        driverId: 'driver-123',
        tripId: `trip-${i}`,
        amount: 45 + Math.random() * 10, // $45-55 range
        merchantName: 'Historical Gas Station',
        category: 'fuel',
        description: 'Historical fuel purchase',
        receiptDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        submittedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        imageUrl: `/receipts/historical-${i}.jpg`,
        status: 'approved',
        flagged: false,
      });
    }

    mockContext = {
      receipt: mockReceipt,
      driver: mockDriver,
      vehicle: {
        id: 'vehicle-123',
        licensePlate: 'TEST-001',
        make: 'Test',
        model: 'Truck',
        year: 2023,
        fuelType: 'diesel',
        avgFuelConsumption: 7.5,
      },
      trip: mockTrip,
      historicalReceipts,
      driverStats: {
        totalReceipts: 10,
        avgReceiptAmount: 50.0,
        avgFuelAmount: 50.0,
        commonMerchants: ['Historical Gas Station'],
        recentReceiptCount: 3,
      },
    };
  });

  describe('ExcessiveAmountRule', () => {
    let rule: ExcessiveAmountRule;

    beforeEach(() => {
      rule = new ExcessiveAmountRule({
        multiplier: 3.0,
        minSampleSize: 5,
        fuelCategories: ['fuel', 'gas', 'diesel'],
      });
    });

    it('should detect excessive fuel amounts', async () => {
      // Arrange - receipt amount is 4x the average
      mockContext.receipt.amount = 200.00; // 4x the $50 average
      mockContext.receipt.category = 'fuel';

      // Act
      const result = await rule.detect(mockContext);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('excessive_amount');
      expect(result[0].severity).toBe('high');
      expect(result[0].confidence).toBeGreaterThan(0.8);
      expect(result[0].description).toContain('4.0x');
    });

    it('should not flag normal fuel amounts', async () => {
      // Arrange - receipt amount is within normal range
      mockContext.receipt.amount = 55.00; // Close to $50 average
      mockContext.receipt.category = 'fuel';

      // Act
      const result = await rule.detect(mockContext);

      // Assert
      expect(result).toHaveLength(0);
    });

    it('should only check fuel categories', async () => {
      // Arrange - high amount but not fuel category
      mockContext.receipt.amount = 200.00;
      mockContext.receipt.category = 'meals';

      // Act
      const result = await rule.detect(mockContext);

      // Assert
      expect(result).toHaveLength(0);
    });

    it('should require minimum sample size', async () => {
      // Arrange - insufficient historical data
      mockContext.historicalReceipts = mockContext.historicalReceipts.slice(0, 3); // Only 3 receipts
      mockContext.receipt.amount = 200.00;
      mockContext.receipt.category = 'fuel';

      // Act
      const result = await rule.detect(mockContext);

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe('DuplicateReceiptRule', () => {
    let rule: DuplicateReceiptRule;

    beforeEach(() => {
      rule = new DuplicateReceiptRule({
        timeWindowHours: 24,
        exactAmountMatch: true,
        amountTolerance: 0.01,
      });
    });

    it('should detect duplicate receipts', async () => {
      // Arrange - add a duplicate receipt to historical data
      const duplicateReceipt: Receipt = {
        ...mockReceipt,
        id: 'duplicate-receipt',
        amount: 50.00, // Same amount
        merchantName: 'Test Gas Station', // Same merchant
        receiptDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      };
      
      mockContext.historicalReceipts.unshift(duplicateReceipt);

      // Act
      const result = await rule.detect(mockContext);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('duplicate_receipt');
      expect(result[0].severity).toBe('medium');
      expect(result[0].description).toContain('duplicate');
    });

    it('should not flag similar but different receipts', async () => {
      // Arrange - similar but different amount
      const similarReceipt: Receipt = {
        ...mockReceipt,
        id: 'similar-receipt',
        amount: 52.00, // Different amount
        merchantName: 'Test Gas Station',
        receiptDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
      };
      
      mockContext.historicalReceipts.unshift(similarReceipt);

      // Act
      const result = await rule.detect(mockContext);

      // Assert
      expect(result).toHaveLength(0);
    });

    it('should respect time window', async () => {
      // Arrange - same receipt but outside time window
      const oldReceipt: Receipt = {
        ...mockReceipt,
        id: 'old-receipt',
        amount: 50.00,
        merchantName: 'Test Gas Station',
        receiptDate: new Date(Date.now() - 48 * 60 * 60 * 1000), // 48 hours ago
      };
      
      mockContext.historicalReceipts.unshift(oldReceipt);

      // Act
      const result = await rule.detect(mockContext);

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe('OutsideTripDatesRule', () => {
    let rule: OutsideTripDatesRule;

    beforeEach(() => {
      rule = new OutsideTripDatesRule({
        bufferDays: 1,
        strictMode: false,
      });
    });

    it('should detect receipts outside trip dates', async () => {
      // Arrange - receipt date outside trip period
      mockContext.receipt.receiptDate = new Date('2025-09-10'); // Before trip start
      
      // Act
      const result = await rule.detect(mockContext);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('outside_trip_dates');
      expect(result[0].severity).toBe('high');
      expect(result[0].description).toContain('outside trip period');
    });

    it('should allow receipts within buffer period', async () => {
      // Arrange - receipt date within buffer
      mockContext.receipt.receiptDate = new Date('2025-09-14'); // 1 day before trip start (within buffer)
      
      // Act
      const result = await rule.detect(mockContext);

      // Assert
      expect(result).toHaveLength(0);
    });

    it('should allow receipts within trip dates', async () => {
      // Arrange - receipt date within trip period
      mockContext.receipt.receiptDate = new Date('2025-09-17'); // Within trip dates
      
      // Act
      const result = await rule.detect(mockContext);

      // Assert
      expect(result).toHaveLength(0);
    });

    it('should handle missing trip data', async () => {
      // Arrange - no trip data
      mockContext.trip = undefined;
      
      // Act
      const result = await rule.detect(mockContext);

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe('SuspiciousMerchantRule', () => {
    let rule: SuspiciousMerchantRule;

    beforeEach(() => {
      rule = new SuspiciousMerchantRule({
        blacklistedMerchants: ['casino', 'liquor', 'tobacco'],
        suspiciousCategories: ['entertainment', 'gambling'],
        allowPersonalExpenses: false,
      });
    });

    it('should detect blacklisted merchants', async () => {
      // Arrange
      mockContext.receipt.merchantName = 'Lucky Casino Restaurant';
      mockContext.receipt.category = 'entertainment';

      // Act
      const result = await rule.detect(mockContext);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('suspicious_merchant');
      expect(result[0].severity).toBe('medium');
      expect(result[0].description).toContain('blacklisted');
    });

    it('should detect suspicious categories', async () => {
      // Arrange
      mockContext.receipt.merchantName = 'Entertainment Center';
      mockContext.receipt.category = 'gambling';

      // Act
      const result = await rule.detect(mockContext);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('suspicious_merchant');
      expect(result[0].description).toContain('suspicious category');
    });

    it('should not flag legitimate merchants', async () => {
      // Arrange
      mockContext.receipt.merchantName = 'Shell Gas Station';
      mockContext.receipt.category = 'fuel';

      // Act
      const result = await rule.detect(mockContext);

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe('FrequentSubmissionRule', () => {
    let rule: FrequentSubmissionRule;

    beforeEach(() => {
      rule = new FrequentSubmissionRule({
        maxReceiptsPerDay: 10,
        maxReceiptsPerHour: 5,
        timeWindowDays: 7,
      });
    });

    it('should detect too many receipts per hour', async () => {
      // Arrange - create 6 receipts in the last hour
      const recentReceipts: Receipt[] = [];
      const now = new Date();
      
      for (let i = 0; i < 6; i++) {
        recentReceipts.push({
          ...mockReceipt,
          id: `recent-${i}`,
          submittedAt: new Date(now.getTime() - i * 5 * 60 * 1000), // Every 5 minutes
        });
      }
      
      mockContext.historicalReceipts = recentReceipts;

      // Act
      const result = await rule.detect(mockContext);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('frequent_submission');
      expect(result[0].severity).toBe('low');
      expect(result[0].description).toContain('hourly limit');
    });

    it('should detect too many receipts per day', async () => {
      // Arrange - create 12 receipts today
      const dailyReceipts: Receipt[] = [];
      const today = new Date();
      
      for (let i = 0; i < 12; i++) {
        dailyReceipts.push({
          ...mockReceipt,
          id: `daily-${i}`,
          submittedAt: new Date(today.getTime() - i * 60 * 60 * 1000), // Every hour
        });
      }
      
      mockContext.historicalReceipts = dailyReceipts;

      // Act
      const result = await rule.detect(mockContext);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('frequent_submission');
      expect(result[0].description).toContain('daily limit');
    });

    it('should not flag normal submission patterns', async () => {
      // Arrange - normal submission pattern (3 receipts in last 24 hours)
      const normalReceipts: Receipt[] = [];
      
      for (let i = 0; i < 3; i++) {
        normalReceipts.push({
          ...mockReceipt,
          id: `normal-${i}`,
          submittedAt: new Date(Date.now() - i * 8 * 60 * 60 * 1000), // Every 8 hours
        });
      }
      
      mockContext.historicalReceipts = normalReceipts;

      // Act
      const result = await rule.detect(mockContext);

      // Assert
      expect(result).toHaveLength(0);
    });
  });
});