import { PrismaClient } from '@prisma/client';
import { AnomalyDetector } from './detector';
import { AnomalyRecordService } from './anomaly-record.service';
import { 
  ExcessiveAmountRule, 
  DuplicateReceiptRule, 
  OutsideTripDatesRule,
  SuspiciousMerchantRule,
  FrequentSubmissionRule
} from './rules';
import { 
  AnomalyContext, 
  AnomalyDetectionConfig, 
  Receipt, 
  Driver, 
  Vehicle, 
  Trip,
  DetectionResult,
  BatchDetectionResult,
  AnomalySeverity
} from './types';
import { truckEventEmitter } from '../events/truck.events';
import { EventLogger } from '../events/truck.events';

export interface AnomalyRunnerConfig {
  enableScheduling: boolean;
  scheduleInterval: number; // minutes
  batchSize: number;
  maxConcurrency: number;
  enableNotifications: boolean;
  notificationThresholds: {
    [severity in AnomalySeverity]: {
      immediate: boolean;
      batchSize: number;
    };
  };
}

export interface RunOptions {
  receiptIds?: string[];
  driverIds?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  forceRerun?: boolean;
  rules?: string[]; // specific rule IDs to run
}

export class AnomalyRunner {
  private detector: AnomalyDetector;
  private recordService: AnomalyRecordService;
  private prisma: PrismaClient;
  private config: AnomalyRunnerConfig;
  private isRunning: boolean = false;
  private scheduleTimer?: NodeJS.Timeout;

  constructor(
    prisma: PrismaClient,
    detectionConfig: AnomalyDetectionConfig,
    runnerConfig?: Partial<AnomalyRunnerConfig>
  ) {
    this.prisma = prisma;
    this.recordService = new AnomalyRecordService(prisma);
    
    // Initialize detector with default rules
    this.detector = new AnomalyDetector(detectionConfig);
    this.registerDefaultRules();

    this.config = {
      enableScheduling: false,
      scheduleInterval: 60, // 1 hour
      batchSize: 100,
      maxConcurrency: 5,
      enableNotifications: true,
      notificationThresholds: {
        [AnomalySeverity.CRITICAL]: { immediate: true, batchSize: 1 },
        [AnomalySeverity.HIGH]: { immediate: true, batchSize: 1 },
        [AnomalySeverity.MEDIUM]: { immediate: false, batchSize: 5 },
        [AnomalySeverity.LOW]: { immediate: false, batchSize: 10 },
      },
      ...runnerConfig,
    };
  }

  /**
   * Register default anomaly detection rules
   */
  private registerDefaultRules(): void {
    const rules = [
      new ExcessiveAmountRule(),
      new DuplicateReceiptRule(),
      new OutsideTripDatesRule(),
      new SuspiciousMerchantRule(),
      new FrequentSubmissionRule(),
    ];

    rules.forEach(rule => this.detector.registerRule(rule));
  }

  /**
   * Start scheduled anomaly detection
   */
  startSchedule(): void {
    if (this.config.enableScheduling && !this.scheduleTimer) {
      console.log(`🔄 Starting anomaly detection schedule (every ${this.config.scheduleInterval} minutes)`);
      
      this.scheduleTimer = setInterval(async () => {
        try {
          await this.runScheduledDetection();
        } catch (error) {
          console.error('Scheduled anomaly detection error:', error);
          EventLogger.log('ANOMALY_SCHEDULE_ERROR', { error: error instanceof Error ? error.message : String(error) });
        }
      }, this.config.scheduleInterval * 60 * 1000);

      // Run immediately on start
      this.runScheduledDetection().catch(error => {
        console.error('Initial anomaly detection error:', error);
      });
    }
  }

  /**
   * Stop scheduled anomaly detection
   */
  stopSchedule(): void {
    if (this.scheduleTimer) {
      clearInterval(this.scheduleTimer);
      this.scheduleTimer = undefined;
      console.log('🛑 Stopped anomaly detection schedule');
    }
  }

  /**
   * Run anomaly detection for specific receipts
   */
  async runDetection(options: RunOptions = {}): Promise<BatchDetectionResult> {
    if (this.isRunning) {
      throw new Error('Anomaly detection is already running');
    }

    this.isRunning = true;
    console.log('🔍 Starting anomaly detection...');
    EventLogger.log('ANOMALY_DETECTION_START', options);

    try {
      // Get receipts to analyze
      const receipts = await this.getReceiptsForAnalysis(options);
      console.log(`📋 Found ${receipts.length} receipts to analyze`);

      if (receipts.length === 0) {
        return {
          totalReceipts: 0,
          processedReceipts: 0,
          totalAnomalies: 0,
          flaggedReceipts: 0,
          results: [],
          processingTime: 0,
          errors: [],
        };
      }

      // Build contexts for analysis
      const contexts = await this.buildContexts(receipts);
      console.log(`🔧 Built ${contexts.length} analysis contexts`);

      // Run detection
      const result = await this.detector.detectBatchAnomalies(contexts);

      // Process results
      await this.processDetectionResults(result);

      console.log(`✅ Anomaly detection completed: ${result.totalAnomalies} anomalies found`);
      EventLogger.log('ANOMALY_DETECTION_COMPLETE', {
        totalReceipts: result.totalReceipts,
        totalAnomalies: result.totalAnomalies,
        flaggedReceipts: result.flaggedReceipts,
      });

      return result;

    } catch (error) {
      console.error('Anomaly detection error:', error);
      EventLogger.log('ANOMALY_DETECTION_ERROR', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Run detection for a single receipt (e.g., on upload)
   */
  async runSingleReceiptDetection(receiptId: string): Promise<DetectionResult> {
    console.log(`🔍 Running anomaly detection for receipt ${receiptId}`);
    
    const receipts = await this.getReceiptsForAnalysis({ receiptIds: [receiptId] });
    if (receipts.length === 0) {
      throw new Error(`Receipt ${receiptId} not found`);
    }

    const contexts = await this.buildContexts(receipts);
    if (contexts.length === 0) {
      throw new Error(`Could not build context for receipt ${receiptId}`);
    }

    const result = await this.detector.detectAnomalies(contexts[0]);

    // Process results for single receipt
    if (result.anomalies.length > 0) {
      await this.recordService.createAnomalyRecordsFromResults(result.anomalies);
      
      if (result.flagged) {
        await this.recordService.flagReceipt(
          receiptId, 
          `Flagged due to ${result.totalAnomalies} anomaly(ies) detected`
        );
      }

      // Send notifications for high priority anomalies
      await this.sendNotifications([result]);
    }

    return result;
  }

  /**
   * Get receipts for analysis based on options
   */
  private async getReceiptsForAnalysis(options: RunOptions): Promise<Receipt[]> {
    const where: any = {};

    if (options.receiptIds) {
      where.id = { in: options.receiptIds };
    }

    if (options.driverIds) {
      where.uploadedById = { in: options.driverIds };
    }

    if (options.dateFrom || options.dateTo) {
      where.createdAt = {};
      if (options.dateFrom) where.createdAt.gte = options.dateFrom;
      if (options.dateTo) where.createdAt.lte = options.dateTo;
    }

    // Only analyze pending receipts unless forced
    if (!options.forceRerun) {
      where.status = 'PENDING';
    }

    const receipts = await this.prisma.receipt.findMany({
      where,
      include: {
        uploadedBy: true,
        trip: true,
        truck: true,
      },
      orderBy: { createdAt: 'desc' },
      take: this.config.batchSize,
    });

    // Transform to our Receipt type
    return receipts.map(r => ({
      id: r.id,
      userId: r.uploadedById,
      driverId: r.uploadedById,
      tripId: r.tripId,
      amount: r.amount || 0,
      merchantName: r.description || 'Unknown Merchant',
      category: r.category || 'FUEL',
      description: r.description || '',
      receiptDate: r.receiptDate || r.createdAt,
      submittedAt: r.createdAt,
      imageUrl: r.filePath,
      status: r.status,
      flagged: r.status === 'REJECTED',
      flagReason: r.rejectionReason,
    }));
  }

  /**
   * Build analysis contexts for receipts
   */
  private async buildContexts(receipts: Receipt[]): Promise<AnomalyContext[]> {
    const contexts: AnomalyContext[] = [];

    for (const receipt of receipts) {
      try {
        // Get driver info
        const driver = await this.getDriverInfo(receipt.driverId);
        if (!driver) continue;

        // Get vehicle info
        const vehicle = receipt.tripId ? await this.getVehicleInfo(receipt.tripId) : undefined;

        // Get trip info
        const trip = receipt.tripId ? await this.getTripInfo(receipt.tripId) : undefined;

        // Get historical receipts for this driver
        const historicalReceipts = await this.getHistoricalReceipts(receipt.driverId, 90); // 90 days

        // Calculate driver stats
        const driverStats = this.calculateDriverStats(historicalReceipts);

        contexts.push({
          receipt,
          driver,
          vehicle,
          trip,
          historicalReceipts,
          driverStats,
        });

      } catch (error) {
        console.error(`Error building context for receipt ${receipt.id}:`, error);
      }
    }

    return contexts;
  }

  /**
   * Get driver information
   */
  private async getDriverInfo(driverId: string): Promise<Driver | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: driverId },
        include: { driverProfile: true },
      });

      if (!user) return null;

      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        licenseNumber: user.driverProfile?.licenseNumber || '',
        hireDate: user.driverProfile?.hireDate || user.createdAt,
        isActive: user.isActive,
      };
    } catch (error) {
      console.error('Error getting driver info:', error);
      return null;
    }
  }

  /**
   * Get vehicle information
   */
  private async getVehicleInfo(tripId: string): Promise<Vehicle | null> {
    try {
      const trip = await this.prisma.trip.findUnique({
        where: { id: tripId },
        include: { truck: true },
      });

      if (!trip?.truck) return null;

      return {
        id: trip.truck.id,
        licensePlate: trip.truck.licensePlate,
        make: trip.truck.make,
        model: trip.truck.model,
        year: trip.truck.year,
        fuelType: trip.truck.fuelType,
        avgFuelConsumption: 25, // Default MPG - would be calculated from historical data
      };
    } catch (error) {
      console.error('Error getting vehicle info:', error);
      return null;
    }
  }

  /**
   * Get trip information
   */
  private async getTripInfo(tripId: string): Promise<Trip | null> {
    try {
      const trip = await this.prisma.trip.findUnique({
        where: { id: tripId },
      });

      if (!trip) return null;

      return {
        id: trip.id,
        driverId: trip.driverId,
        vehicleId: trip.truckId,
        startDate: trip.startDate,
        endDate: trip.endDate,
        origin: trip.origin,
        destination: trip.destination,
        status: trip.status,
      };
    } catch (error) {
      console.error('Error getting trip info:', error);
      return null;
    }
  }

  /**
   * Get historical receipts for a driver
   */
  private async getHistoricalReceipts(driverId: string, days: number): Promise<Receipt[]> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const receipts = await this.prisma.receipt.findMany({
        where: {
          uploadedById: driverId,
          createdAt: { gte: cutoffDate },
          status: { in: ['APPROVED', 'PENDING'] },
        },
        orderBy: { createdAt: 'desc' },
        take: 200, // Limit for performance
      });

      return receipts.map(r => ({
        id: r.id,
        userId: r.uploadedById,
        driverId: r.uploadedById,
        tripId: r.tripId,
        amount: r.amount || 0,
        merchantName: r.description || 'Unknown Merchant',
        category: r.category || 'FUEL',
        description: r.description || '',
        receiptDate: r.receiptDate || r.createdAt,
        submittedAt: r.createdAt,
        imageUrl: r.filePath,
        status: r.status,
        flagged: r.status === 'REJECTED',
        flagReason: r.rejectionReason,
      }));
    } catch (error) {
      console.error('Error getting historical receipts:', error);
      return [];
    }
  }

  /**
   * Calculate driver statistics
   */
  private calculateDriverStats(receipts: Receipt[]) {
    const fuelReceipts = receipts.filter(r => 
      r.category.toLowerCase().includes('fuel') || 
      r.description.toLowerCase().includes('fuel') ||
      r.description.toLowerCase().includes('gas')
    );

    const totalAmount = receipts.reduce((sum, r) => sum + r.amount, 0);
    const avgReceiptAmount = receipts.length > 0 ? totalAmount / receipts.length : 0;
    
    const fuelAmount = fuelReceipts.reduce((sum, r) => sum + r.amount, 0);
    const avgFuelAmount = fuelReceipts.length > 0 ? fuelAmount / fuelReceipts.length : 0;

    const merchantCounts = receipts.reduce((acc, r) => {
      acc[r.merchantName] = (acc[r.merchantName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const commonMerchants = Object.entries(merchantCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([merchant]) => merchant);

    const recentCutoff = new Date();
    recentCutoff.setDate(recentCutoff.getDate() - 7);
    const recentReceiptCount = receipts.filter(r => r.submittedAt >= recentCutoff).length;

    return {
      totalReceipts: receipts.length,
      avgReceiptAmount,
      avgFuelAmount,
      commonMerchants,
      recentReceiptCount,
    };
  }

  /**
   * Process detection results
   */
  private async processDetectionResults(result: BatchDetectionResult): Promise<void> {
    const allAnomalies = result.results.flatMap(r => r.anomalies);
    
    if (allAnomalies.length > 0) {
      // Store anomaly records
      await this.recordService.createAnomalyRecordsFromResults(allAnomalies);

      // Flag receipts with anomalies
      for (const detectionResult of result.results) {
        if (detectionResult.flagged) {
          await this.recordService.flagReceipt(
            detectionResult.receiptId,
            `Flagged due to ${detectionResult.totalAnomalies} anomaly(ies) detected`
          );
        }
      }

      // Send notifications
      await this.sendNotifications(result.results);
    }
  }

  /**
   * Send notifications for detected anomalies
   */
  private async sendNotifications(results: DetectionResult[]): Promise<void> {
    if (!this.config.enableNotifications) return;

    for (const result of results) {
      if (result.anomalies.length === 0) continue;

      const highestSeverity = result.highestSeverity!;
      const threshold = this.config.notificationThresholds[highestSeverity];

      if (threshold.immediate || result.anomalies.length >= threshold.batchSize) {
        // Emit anomaly detected event
        truckEventEmitter.emitAnomalyDetected({
          anomalyId: `batch-${Date.now()}`,
          type: result.anomalies[0].type,
          severity: highestSeverity,
          receiptId: result.receiptId,
          details: {
            anomalyCount: result.totalAnomalies,
            rules: result.anomalies.map(a => a.ruleName),
            confidence: Math.max(...result.anomalies.map(a => a.confidence)),
          },
          timestamp: new Date(),
        });
      }
    }
  }

  /**
   * Run scheduled detection for recent receipts
   */
  private async runScheduledDetection(): Promise<void> {
    console.log('⏰ Running scheduled anomaly detection...');
    
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    await this.runDetection({
      dateFrom: oneDayAgo,
      forceRerun: false,
    });
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    isRunning: boolean;
    isScheduled: boolean;
    detector: any;
    recordService: any;
    errors: string[];
  }> {
    const errors: string[] = [];

    // Check detector health
    const detectorHealth = this.detector.healthCheck();
    if (!detectorHealth.healthy) {
      errors.push(...detectorHealth.errors);
    }

    // Check record service health
    const recordServiceHealth = await this.recordService.healthCheck();
    if (!recordServiceHealth.healthy) {
      errors.push(...recordServiceHealth.errors);
    }

    return {
      healthy: errors.length === 0,
      isRunning: this.isRunning,
      isScheduled: !!this.scheduleTimer,
      detector: detectorHealth,
      recordService: recordServiceHealth,
      errors,
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopSchedule();
    console.log('🧹 Anomaly runner destroyed');
  }
}
