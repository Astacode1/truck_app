import { truckEventEmitter } from '../events/truck.events';
import { NotificationHandlers } from '../handlers/notification.handlers';

// Sample receipt verification service with notification integration
export interface Receipt {
  id: string;
  userId: string;
  driverId: string;
  amount: number;
  description: string;
  imageUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
}

class ReceiptVerificationService {
  private receipts: Map<string, Receipt> = new Map();
  private notificationHandlers: NotificationHandlers;

  constructor() {
    // Initialize notification handlers with mock email config
    this.notificationHandlers = new NotificationHandlers({
      enableEmail: true,
      enableLogging: true,
      emailService: {
        provider: 'sendgrid', // or 'ses'
        config: {
          apiKey: process.env.SENDGRID_API_KEY || 'mock-api-key',
          fromEmail: process.env.FROM_EMAIL || 'noreply@trucking.com',
          fromName: 'Truck Monitoring System',
          rateLimiting: {
            maxEmailsPerSecond: 2,
            maxEmailsPerMinute: 100,
            maxEmailsPerHour: 1000,
            maxEmailsPerDay: 10000,
          },
        },
      },
    });

    // Initialize with some sample receipts
    this.initializeSampleData();
  }

  private initializeSampleData(): void {
    const sampleReceipts: Receipt[] = [
      {
        id: 'receipt-1',
        userId: 'driver-1',
        driverId: 'driver-1',
        amount: 45.67,
        description: 'Fuel - Highway 101',
        imageUrl: '/receipts/receipt-1.jpg',
        status: 'pending',
        submittedAt: new Date(),
      },
      {
        id: 'receipt-2',
        userId: 'driver-1',
        driverId: 'driver-1',
        amount: 15.25,
        description: 'Parking Fee - Downtown',
        imageUrl: '/receipts/receipt-2.jpg',
        status: 'pending',
        submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
    ];

    sampleReceipts.forEach(receipt => {
      this.receipts.set(receipt.id, receipt);
    });
  }

  async approveReceipt(receiptId: string, approvedBy: string): Promise<Receipt | null> {
    const receipt = this.receipts.get(receiptId);
    if (!receipt) {
      throw new Error(`Receipt ${receiptId} not found`);
    }

    if (receipt.status !== 'pending') {
      throw new Error(`Receipt ${receiptId} is not pending approval`);
    }

    // Update receipt status
    receipt.status = 'approved';
    receipt.reviewedAt = new Date();
    receipt.reviewedBy = approvedBy;

    // Emit notification event
    truckEventEmitter.emitReceiptApproved({
      receiptId: receipt.id,
      userId: receipt.userId,
      driverId: receipt.driverId,
      amount: receipt.amount,
      approvedBy,
      timestamp: new Date(),
    });

    console.log(`✅ Receipt ${receiptId} approved by ${approvedBy}`);
    return receipt;
  }

  async rejectReceipt(receiptId: string, rejectedBy: string, reason: string): Promise<Receipt | null> {
    const receipt = this.receipts.get(receiptId);
    if (!receipt) {
      throw new Error(`Receipt ${receiptId} not found`);
    }

    if (receipt.status !== 'pending') {
      throw new Error(`Receipt ${receiptId} is not pending approval`);
    }

    // Update receipt status
    receipt.status = 'rejected';
    receipt.reviewedAt = new Date();
    receipt.reviewedBy = rejectedBy;
    receipt.rejectionReason = reason;

    // Emit notification event
    truckEventEmitter.emitReceiptRejected({
      receiptId: receipt.id,
      userId: receipt.userId,
      driverId: receipt.driverId,
      amount: receipt.amount,
      rejectedBy,
      reason,
      timestamp: new Date(),
    });

    console.log(`❌ Receipt ${receiptId} rejected by ${rejectedBy}: ${reason}`);
    return receipt;
  }

  async getAllReceipts(): Promise<Receipt[]> {
    return Array.from(this.receipts.values());
  }

  async getReceiptById(receiptId: string): Promise<Receipt | null> {
    return this.receipts.get(receiptId) || null;
  }

  async getReceiptsByStatus(status: Receipt['status']): Promise<Receipt[]> {
    return Array.from(this.receipts.values()).filter(receipt => receipt.status === status);
  }

  // Demo function to trigger events for testing
  async demonstrateNotifications(): Promise<void> {
    console.log('\n🚀 Starting notification system demonstration...\n');

    // Approve a receipt
    await this.approveReceipt('receipt-1', 'manager-1');
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reject a receipt
    await this.rejectReceipt('receipt-2', 'manager-1', 'Receipt is not legible. Please resubmit with clearer image.');
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Emit trip assignment
    truckEventEmitter.emitTripAssigned({
      tripId: 'trip-123',
      driverId: 'driver-1',
      vehicleId: 'truck-001',
      assignedBy: 'manager-1',
      route: {
        origin: 'Los Angeles, CA',
        destination: 'San Francisco, CA',
        estimatedDuration: 480, // 8 hours in minutes
      },
      timestamp: new Date(),
    });
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Emit anomaly detection
    truckEventEmitter.emitAnomalyDetected({
      anomalyId: 'anomaly-456',
      type: 'speed_violation',
      severity: 'high',
      driverId: 'driver-1',
      vehicleId: 'truck-001',
      tripId: 'trip-123',
      location: {
        latitude: 34.0522,
        longitude: -118.2437,
        address: 'Interstate 5, Los Angeles, CA',
      },
      details: {
        speedLimit: 65,
        recordedSpeed: 78,
        duration: 300, // 5 minutes
        weather: 'clear',
      },
      timestamp: new Date(),
    });

    console.log('\n✅ Notification demonstration completed!\n');
  }

  // Health check for the entire notification system
  async healthCheck(): Promise<{
    receiptService: boolean;
    notifications: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    let receiptService = false;
    let notifications = false;

    try {
      // Check receipt service
      const receipts = await this.getAllReceipts();
      receiptService = Array.isArray(receipts);
    } catch (error) {
      errors.push(`Receipt service: ${error instanceof Error ? error.message : String(error)}`);
    }

    try {
      // Check notification handlers
      const notificationHealth = await this.notificationHandlers.healthCheck();
      notifications = notificationHealth.handlers;
      errors.push(...notificationHealth.errors);
    } catch (error) {
      errors.push(`Notifications: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { receiptService, notifications, errors };
  }
}

// Demo function to initialize and run the notification system
export async function runNotificationDemo(): Promise<void> {
  console.log('🚛 Truck Monitoring System - Notification Demo\n');

  const receiptService = new ReceiptVerificationService();

  try {
    // Run health check
    console.log('🔍 Running health check...');
    const health = await receiptService.healthCheck();
    console.log('Health Check Results:', health);
    console.log('');

    // Show current receipts
    console.log('📋 Current receipts:');
    const receipts = await receiptService.getAllReceipts();
    receipts.forEach(receipt => {
      console.log(`  - ${receipt.id}: $${receipt.amount} (${receipt.status}) - ${receipt.description}`);
    });
    console.log('');

    // Demonstrate notifications
    await receiptService.demonstrateNotifications();

    // Show updated receipts
    console.log('📋 Updated receipts:');
    const updatedReceipts = await receiptService.getAllReceipts();
    updatedReceipts.forEach(receipt => {
      console.log(`  - ${receipt.id}: $${receipt.amount} (${receipt.status}) - ${receipt.description}`);
      if (receipt.rejectionReason) {
        console.log(`    Rejection reason: ${receipt.rejectionReason}`);
      }
    });

  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Export for use in server or testing
export { ReceiptVerificationService };
