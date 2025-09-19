import { AnomalyDetector } from '../detector';
import { 
  ExcessiveAmountRule, 
  DuplicateReceiptRule, 
  OutsideTripDatesRule,
  SuspiciousMerchantRule,
  FrequentSubmissionRule
} from '../rules';
import { 
  AnomalyContext, 
  Receipt, 
  Driver, 
  Vehicle, 
  Trip, 
  AnomalySeverity,
  AnomalyType
} from '../types';
import { truckEventEmitter } from '../../events/truck.events';

// Mock data for testing
export class AnomalyTestData {
  static createMockDriver(): Driver {
    return {
      id: 'driver-123',
      firstName: 'John',
      lastName: 'Driver',
      email: 'john.driver@trucking.com',
      phone: '555-0123',
      licenseNumber: 'CDL123456',
      hireDate: new Date('2023-01-01'),
      isActive: true,
    };
  }

  static createMockVehicle(): Vehicle {
    return {
      id: 'truck-456',
      licensePlate: 'TRK-001',
      make: 'Freightliner',
      model: 'Cascadia',
      year: 2022,
      fuelType: 'diesel',
      avgFuelConsumption: 7.5, // MPG
    };
  }

  static createMockTrip(): Trip {
    const now = new Date();
    const startDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
    const endDate = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000); // 1 day from now

    return {
      id: 'trip-789',
      driverId: 'driver-123',
      vehicleId: 'truck-456',
      startDate,
      endDate,
      origin: 'Los Angeles, CA',
      destination: 'San Francisco, CA',
      status: 'active',
    };
  }

  static createNormalReceipt(overrides: Partial<Receipt> = {}): Receipt {
    return {
      id: 'receipt-normal',
      userId: 'driver-123',
      driverId: 'driver-123',
      tripId: 'trip-789',
      amount: 45.67,
      merchantName: 'Shell Gas Station',
      category: 'fuel',
      description: 'Fuel purchase',
      receiptDate: new Date(), // today
      submittedAt: new Date(),
      imageUrl: '/receipts/normal.jpg',
      status: 'pending',
      flagged: false,
      ...overrides,
    };
  }

  static createExcessiveAmountReceipt(): Receipt {
    return this.createNormalReceipt({
      id: 'receipt-excessive',
      amount: 350.00, // Very high fuel amount
      description: 'Excessive fuel purchase',
    });
  }

  static createDuplicateReceipt(): Receipt {
    return this.createNormalReceipt({
      id: 'receipt-duplicate',
      amount: 45.67, // Same amount as normal receipt
      merchantName: 'Shell Gas Station', // Same merchant
      receiptDate: new Date(), // Same date
      description: 'Duplicate fuel purchase',
    });
  }

  static createOutsideTripReceipt(): Receipt {
    const outsideDate = new Date();
    outsideDate.setDate(outsideDate.getDate() - 10); // 10 days ago, outside trip

    return this.createNormalReceipt({
      id: 'receipt-outside-trip',
      receiptDate: outsideDate,
      description: 'Fuel purchase outside trip dates',
    });
  }

  static createSuspiciousMerchantReceipt(): Receipt {
    return this.createNormalReceipt({
      id: 'receipt-suspicious',
      merchantName: 'Casino Restaurant',
      category: 'entertainment',
      amount: 75.00,
      description: 'Entertainment expense',
    });
  }

  static createHistoricalReceipts(): Receipt[] {
    const receipts: Receipt[] = [];
    const baseDate = new Date();

    // Create 30 days of normal fuel receipts (average $50)
    for (let i = 1; i <= 30; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() - i);

      receipts.push({
        id: `historical-${i}`,
        userId: 'driver-123',
        driverId: 'driver-123',
        tripId: `trip-${i}`,
        amount: 45 + Math.random() * 10, // $45-55 range
        merchantName: i % 3 === 0 ? 'Shell Gas Station' : i % 3 === 1 ? 'Exxon' : 'BP',
        category: 'fuel',
        description: 'Regular fuel purchase',
        receiptDate: date,
        submittedAt: date,
        imageUrl: `/receipts/historical-${i}.jpg`,
        status: 'approved',
        flagged: false,
      });
    }

    return receipts;
  }

  static createDriverStats() {
    const historicalReceipts = this.createHistoricalReceipts();
    const totalAmount = historicalReceipts.reduce((sum, r) => sum + r.amount, 0);
    
    return {
      totalReceipts: historicalReceipts.length,
      avgReceiptAmount: totalAmount / historicalReceipts.length,
      avgFuelAmount: totalAmount / historicalReceipts.length, // All are fuel
      commonMerchants: ['Shell Gas Station', 'Exxon', 'BP'],
      recentReceiptCount: 7, // 7 in last week
    };
  }

  static createContext(receipt: Receipt): AnomalyContext {
    return {
      receipt,
      driver: this.createMockDriver(),
      vehicle: this.createMockVehicle(),
      trip: this.createMockTrip(),
      historicalReceipts: this.createHistoricalReceipts(),
      driverStats: this.createDriverStats(),
    };
  }
}

export class AnomalyTestRunner {
  private detector: AnomalyDetector;

  constructor() {
    // Initialize detector with test configuration
    this.detector = new AnomalyDetector({
      enabled: true,
      rules: [],
      alertThresholds: {
        [AnomalySeverity.CRITICAL]: { immediate: true, batchSize: 1, batchInterval: 0 },
        [AnomalySeverity.HIGH]: { immediate: true, batchSize: 1, batchInterval: 0 },
        [AnomalySeverity.MEDIUM]: { immediate: false, batchSize: 5, batchInterval: 30 },
        [AnomalySeverity.LOW]: { immediate: false, batchSize: 10, batchInterval: 60 },
      },
      lookbackPeriod: 30,
      minConfidence: 0.5,
    });

    this.registerTestRules();
  }

  private registerTestRules(): void {
    // Register all rules with test configurations
    this.detector.registerRule(new ExcessiveAmountRule({
      multiplier: 3.0,
      minSampleSize: 5,
      fuelCategories: ['fuel', 'gas', 'gasoline', 'diesel'],
    }));

    this.detector.registerRule(new DuplicateReceiptRule({
      timeWindowHours: 24,
      exactAmountMatch: true,
      amountTolerance: 0.01,
    }));

    this.detector.registerRule(new OutsideTripDatesRule({
      bufferDays: 1,
      strictMode: false,
    }));

    this.detector.registerRule(new SuspiciousMerchantRule({
      blacklistedMerchants: ['casino', 'liquor', 'tobacco', 'adult entertainment'],
      suspiciousCategories: ['entertainment', 'gambling', 'alcohol'],
      allowPersonalExpenses: false,
    }));

    this.detector.registerRule(new FrequentSubmissionRule({
      maxReceiptsPerDay: 10,
      maxReceiptsPerHour: 5,
      timeWindowDays: 7,
    }));
  }

  async runAllTests(): Promise<void> {
    console.log('🧪 Running Anomaly Detection Tests\n');

    await this.testNormalReceipt();
    await this.testExcessiveAmount();
    await this.testDuplicateReceipt();
    await this.testOutsideTripDates();
    await this.testSuspiciousMerchant();
    await this.testMultipleAnomalies();
    await this.testBatchDetection();

    console.log('\n✅ All anomaly detection tests completed!');
  }

  private async testNormalReceipt(): Promise<void> {
    console.log('📋 Test 1: Normal Receipt (should pass)');
    
    const receipt = AnomalyTestData.createNormalReceipt();
    const context = AnomalyTestData.createContext(receipt);
    
    const result = await this.detector.detectAnomalies(context);
    
    console.log(`   Result: ${result.anomalies.length} anomalies found`);
    console.log(`   Flagged: ${result.flagged}`);
    
    if (result.anomalies.length === 0) {
      console.log('   ✅ PASS: Normal receipt correctly identified as clean\n');
    } else {
      console.log('   ❌ FAIL: Normal receipt incorrectly flagged\n');
      result.anomalies.forEach(a => console.log(`      - ${a.description}`));
    }
  }

  private async testExcessiveAmount(): Promise<void> {
    console.log('📋 Test 2: Excessive Amount Detection');
    
    const receipt = AnomalyTestData.createExcessiveAmountReceipt();
    const context = AnomalyTestData.createContext(receipt);
    
    const result = await this.detector.detectAnomalies(context);
    
    console.log(`   Receipt Amount: $${receipt.amount}`);
    console.log(`   Average Fuel Amount: $${context.driverStats.avgFuelAmount.toFixed(2)}`);
    console.log(`   Result: ${result.anomalies.length} anomalies found`);
    
    const excessiveAnomaly = result.anomalies.find(a => a.type === AnomalyType.EXCESSIVE_AMOUNT);
    if (excessiveAnomaly) {
      console.log('   ✅ PASS: Excessive amount correctly detected');
      console.log(`   Confidence: ${(excessiveAnomaly.confidence * 100).toFixed(1)}%`);
      console.log(`   Details: ${excessiveAnomaly.description}\n`);
    } else {
      console.log('   ❌ FAIL: Excessive amount not detected\n');
    }
  }

  private async testDuplicateReceipt(): Promise<void> {
    console.log('📋 Test 3: Duplicate Receipt Detection');
    
    const normalReceipt = AnomalyTestData.createNormalReceipt();
    const duplicateReceipt = AnomalyTestData.createDuplicateReceipt();
    
    // Add normal receipt to historical data
    const historicalReceipts = AnomalyTestData.createHistoricalReceipts();
    historicalReceipts.unshift(normalReceipt); // Add as most recent
    
    const context = AnomalyTestData.createContext(duplicateReceipt);
    context.historicalReceipts = historicalReceipts;
    
    const result = await this.detector.detectAnomalies(context);
    
    console.log(`   Duplicate Amount: $${duplicateReceipt.amount}`);
    console.log(`   Duplicate Merchant: ${duplicateReceipt.merchantName}`);
    console.log(`   Result: ${result.anomalies.length} anomalies found`);
    
    const duplicateAnomaly = result.anomalies.find(a => a.type === AnomalyType.DUPLICATE_RECEIPT);
    if (duplicateAnomaly) {
      console.log('   ✅ PASS: Duplicate receipt correctly detected');
      console.log(`   Confidence: ${(duplicateAnomaly.confidence * 100).toFixed(1)}%`);
      console.log(`   Details: ${duplicateAnomaly.description}\n`);
    } else {
      console.log('   ❌ FAIL: Duplicate receipt not detected\n');
    }
  }

  private async testOutsideTripDates(): Promise<void> {
    console.log('📋 Test 4: Outside Trip Dates Detection');
    
    const receipt = AnomalyTestData.createOutsideTripReceipt();
    const context = AnomalyTestData.createContext(receipt);
    
    const result = await this.detector.detectAnomalies(context);
    
    console.log(`   Receipt Date: ${receipt.receiptDate.toLocaleDateString()}`);
    console.log(`   Trip Start: ${context.trip!.startDate.toLocaleDateString()}`);
    console.log(`   Trip End: ${context.trip!.endDate.toLocaleDateString()}`);
    console.log(`   Result: ${result.anomalies.length} anomalies found`);
    
    const outsideAnomaly = result.anomalies.find(a => a.type === AnomalyType.OUTSIDE_TRIP_DATES);
    if (outsideAnomaly) {
      console.log('   ✅ PASS: Outside trip dates correctly detected');
      console.log(`   Confidence: ${(outsideAnomaly.confidence * 100).toFixed(1)}%`);
      console.log(`   Details: ${outsideAnomaly.description}\n`);
    } else {
      console.log('   ❌ FAIL: Outside trip dates not detected\n');
    }
  }

  private async testSuspiciousMerchant(): Promise<void> {
    console.log('📋 Test 5: Suspicious Merchant Detection');
    
    const receipt = AnomalyTestData.createSuspiciousMerchantReceipt();
    const context = AnomalyTestData.createContext(receipt);
    
    const result = await this.detector.detectAnomalies(context);
    
    console.log(`   Merchant: ${receipt.merchantName}`);
    console.log(`   Category: ${receipt.category}`);
    console.log(`   Result: ${result.anomalies.length} anomalies found`);
    
    const suspiciousAnomaly = result.anomalies.find(a => a.type === AnomalyType.SUSPICIOUS_MERCHANT);
    if (suspiciousAnomaly) {
      console.log('   ✅ PASS: Suspicious merchant correctly detected');
      console.log(`   Confidence: ${(suspiciousAnomaly.confidence * 100).toFixed(1)}%`);
      console.log(`   Details: ${suspiciousAnomaly.description}\n`);
    } else {
      console.log('   ❌ FAIL: Suspicious merchant not detected\n');
    }
  }

  private async testMultipleAnomalies(): Promise<void> {
    console.log('📋 Test 6: Multiple Anomalies Detection');
    
    // Create a receipt with multiple issues
    const receipt = AnomalyTestData.createNormalReceipt({
      id: 'receipt-multiple-issues',
      amount: 400.00, // Excessive amount
      merchantName: 'Casino Gas Station', // Suspicious merchant
      category: 'entertainment', // Suspicious category
      receiptDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // Outside trip dates
    });
    
    const context = AnomalyTestData.createContext(receipt);
    const result = await this.detector.detectAnomalies(context);
    
    console.log(`   Receipt with multiple issues:`);
    console.log(`   - Amount: $${receipt.amount} (excessive)`);
    console.log(`   - Merchant: ${receipt.merchantName} (suspicious)`);
    console.log(`   - Date: ${receipt.receiptDate.toLocaleDateString()} (outside trip)`);
    console.log(`   Result: ${result.anomalies.length} anomalies found`);
    console.log(`   Highest Severity: ${result.highestSeverity}`);
    
    if (result.anomalies.length >= 2) {
      console.log('   ✅ PASS: Multiple anomalies correctly detected');
      result.anomalies.forEach(a => {
        console.log(`   - ${a.type}: ${a.description} (${(a.confidence * 100).toFixed(1)}%)`);
      });
      console.log('');
    } else {
      console.log('   ❌ FAIL: Not all anomalies detected\n');
    }
  }

  private async testBatchDetection(): Promise<void> {
    console.log('📋 Test 7: Batch Detection');
    
    const receipts = [
      AnomalyTestData.createNormalReceipt({ id: 'batch-1' }),
      AnomalyTestData.createExcessiveAmountReceipt(),
      AnomalyTestData.createSuspiciousMerchantReceipt(),
      AnomalyTestData.createNormalReceipt({ id: 'batch-4' }),
    ];
    
    const contexts = receipts.map(receipt => AnomalyTestData.createContext(receipt));
    const result = await this.detector.detectBatchAnomalies(contexts);
    
    console.log(`   Processed: ${result.processedReceipts}/${result.totalReceipts} receipts`);
    console.log(`   Total Anomalies: ${result.totalAnomalies}`);
    console.log(`   Flagged Receipts: ${result.flaggedReceipts}`);
    console.log(`   Processing Time: ${result.processingTime}ms`);
    
    if (result.flaggedReceipts >= 2) {
      console.log('   ✅ PASS: Batch detection working correctly');
      result.results.forEach(r => {
        if (r.flagged) {
          console.log(`   - ${r.receiptId}: ${r.totalAnomalies} anomalies (${r.highestSeverity})`);
        }
      });
      console.log('');
    } else {
      console.log('   ❌ FAIL: Batch detection not working correctly\n');
    }
  }

  async demonstrateNotificationIntegration(): Promise<void> {
    console.log('🔔 Demonstrating Notification Integration\n');

    // Set up event listeners
    truckEventEmitter.onAnomalyDetected({
      handle: async (event) => {
        console.log(`📢 NOTIFICATION: ${event.severity.toUpperCase()} anomaly detected!`);
        console.log(`   Type: ${event.type}`);
        console.log(`   Receipt ID: ${event.receiptId || 'N/A'}`);
        console.log(`   Driver ID: ${event.driverId || 'N/A'}`);
        console.log(`   Details: ${JSON.stringify(event.details, null, 2)}`);
        console.log('   📧 Email would be sent to administrators\n');
      }
    });

    // Trigger high severity anomaly
    const excessiveReceipt = AnomalyTestData.createExcessiveAmountReceipt();
    const context = AnomalyTestData.createContext(excessiveReceipt);
    const result = await this.detector.detectAnomalies(context);

    if (result.anomalies.length > 0) {
      // Simulate emitting the anomaly event
      truckEventEmitter.emitAnomalyDetected({
        anomalyId: 'demo-anomaly-123',
        type: 'excessive_amount',
        severity: 'high',
        receiptId: excessiveReceipt.id,
        driverId: excessiveReceipt.driverId,
        details: {
          receiptAmount: excessiveReceipt.amount,
          averageAmount: context.driverStats.avgFuelAmount,
          confidence: result.anomalies[0].confidence,
        },
        timestamp: new Date(),
      });
    }
  }

  getDetectorStatistics() {
    return this.detector.getStatistics();
  }

  getDetectorHealth() {
    return this.detector.healthCheck();
  }
}

// Demo function to run all tests
export async function runAnomalyDetectionDemo(): Promise<void> {
  console.log('🚛 Truck Monitoring System - Anomaly Detection Demo\n');
  console.log('=' .repeat(60) + '\n');

  const testRunner = new AnomalyTestRunner();

  try {
    // Run all tests
    await testRunner.runAllTests();

    // Show detector statistics
    console.log('📊 Detector Statistics:');
    const stats = testRunner.getDetectorStatistics();
    stats.rules.forEach(rule => {
      console.log(`   - ${rule.name}: ${rule.enabled ? 'Enabled' : 'Disabled'}`);
    });
    console.log('');

    // Show health check
    console.log('🏥 Health Check:');
    const health = testRunner.getDetectorHealth();
    console.log(`   Healthy: ${health.healthy}`);
    console.log(`   Rules Registered: ${health.rulesRegistered}`);
    console.log(`   Enabled Rules: ${health.enabledRules}`);
    if (health.errors.length > 0) {
      console.log(`   Errors: ${health.errors.join(', ')}`);
    }
    console.log('');

    // Demonstrate notification integration
    await testRunner.demonstrateNotificationIntegration();

    console.log('✨ Demo completed successfully!');

  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}
