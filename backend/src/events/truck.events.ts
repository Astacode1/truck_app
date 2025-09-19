import { EventEmitter } from 'events';

// Event payload interfaces
export interface ReceiptApprovedEvent {
  receiptId: string;
  userId: string;
  driverId: string;
  amount: number;
  approvedBy: string;
  timestamp: Date;
}

export interface ReceiptRejectedEvent {
  receiptId: string;
  userId: string;
  driverId: string;
  amount: number;
  rejectedBy: string;
  reason: string;
  timestamp: Date;
}

export interface TripAssignedEvent {
  tripId: string;
  driverId: string;
  vehicleId: string;
  assignedBy: string;
  route: {
    origin: string;
    destination: string;
    estimatedDuration: number;
  };
  timestamp: Date;
}

export interface AnomalyDetectedEvent {
  anomalyId: string;
  type: 'speed_violation' | 'route_deviation' | 'fuel_consumption' | 'maintenance_alert' | 'system_error' | 
        'excessive_amount' | 'duplicate_receipt' | 'outside_trip_dates' | 'suspicious_merchant' | 'frequent_submission';
  severity: 'low' | 'medium' | 'high' | 'critical';
  driverId?: string;
  vehicleId?: string;
  tripId?: string;
  receiptId?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  details: Record<string, any>;
  timestamp: Date;
}

// Event types enum
export enum TruckEventType {
  RECEIPT_APPROVED = 'receipt_approved',
  RECEIPT_REJECTED = 'receipt_rejected',
  TRIP_ASSIGNED = 'trip_assigned',
  ANOMALY_DETECTED = 'anomaly_detected',
  SYSTEM_ALERT = 'system_alert',
  MAINTENANCE_DUE = 'maintenance_due',
  FUEL_LOW = 'fuel_low',
  SPEED_VIOLATION = 'speed_violation',
  ROUTE_DEVIATION = 'route_deviation',
}

// Event data union type
export type EventData = 
  | ReceiptApprovedEvent
  | ReceiptRejectedEvent
  | TripAssignedEvent
  | AnomalyDetectedEvent;

// Event handler interface
export interface EventHandler<T = any> {
  handle(event: T): Promise<void>;
}

// Event emitter singleton
class TruckEventEmitter extends EventEmitter {
  private static instance: TruckEventEmitter;

  private constructor() {
    super();
    this.setMaxListeners(50); // Allow multiple listeners
  }

  static getInstance(): TruckEventEmitter {
    if (!TruckEventEmitter.instance) {
      TruckEventEmitter.instance = new TruckEventEmitter();
    }
    return TruckEventEmitter.instance;
  }

  // Emit receipt approved event
  emitReceiptApproved(event: ReceiptApprovedEvent): void {
    this.emit(TruckEventType.RECEIPT_APPROVED, event);
  }

  // Emit receipt rejected event
  emitReceiptRejected(event: ReceiptRejectedEvent): void {
    this.emit(TruckEventType.RECEIPT_REJECTED, event);
  }

  // Emit trip assigned event
  emitTripAssigned(event: TripAssignedEvent): void {
    this.emit(TruckEventType.TRIP_ASSIGNED, event);
  }

  // Emit anomaly detected event
  emitAnomalyDetected(event: AnomalyDetectedEvent): void {
    this.emit(TruckEventType.ANOMALY_DETECTED, event);
  }

  // Register event handlers
  onReceiptApproved(handler: EventHandler<ReceiptApprovedEvent>): void {
    this.on(TruckEventType.RECEIPT_APPROVED, async (event: ReceiptApprovedEvent) => {
      try {
        await handler.handle(event);
      } catch (error) {
        console.error('Error handling receipt approved event:', error);
      }
    });
  }

  onReceiptRejected(handler: EventHandler<ReceiptRejectedEvent>): void {
    this.on(TruckEventType.RECEIPT_REJECTED, async (event: ReceiptRejectedEvent) => {
      try {
        await handler.handle(event);
      } catch (error) {
        console.error('Error handling receipt rejected event:', error);
      }
    });
  }

  onTripAssigned(handler: EventHandler<TripAssignedEvent>): void {
    this.on(TruckEventType.TRIP_ASSIGNED, async (event: TripAssignedEvent) => {
      try {
        await handler.handle(event);
      } catch (error) {
        console.error('Error handling trip assigned event:', error);
      }
    });
  }

  onAnomalyDetected(handler: EventHandler<AnomalyDetectedEvent>): void {
    this.on(TruckEventType.ANOMALY_DETECTED, async (event: AnomalyDetectedEvent) => {
      try {
        await handler.handle(event);
      } catch (error) {
        console.error('Error handling anomaly detected event:', error);
      }
    });
  }

  // Batch event emission with error handling
  async emitBatch(events: Array<{ type: TruckEventType; data: EventData }>): Promise<void> {
    for (const { type, data } of events) {
      try {
        this.emit(type, data);
      } catch (error) {
        console.error(`Error emitting ${type} event:`, error);
      }
    }
  }

  // Get event statistics
  getStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    for (const eventType of Object.values(TruckEventType)) {
      stats[eventType] = this.listenerCount(eventType);
    }
    return stats;
  }

  // Remove all listeners for cleanup
  removeAllHandlers(): void {
    this.removeAllListeners();
  }
}

// Export singleton instance
export const truckEventEmitter = TruckEventEmitter.getInstance();

// Utility function to create event handlers
export function createEventHandler<T>(
  handlerFn: (event: T) => Promise<void>
): EventHandler<T> {
  return {
    handle: handlerFn,
  };
}

// Event logging utility
export class EventLogger {
  private static logs: Array<{
    type: string;
    timestamp: Date;
    data: any;
    processed: boolean;
  }> = [];

  static log(type: string, data: any, processed: boolean = false): void {
    this.logs.push({
      type,
      timestamp: new Date(),
      data,
      processed,
    });

    // Keep only last 1000 logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }

    console.log(`[EVENT] ${type}:`, data);
  }

  static getLogs(limit: number = 100): Array<{
    type: string;
    timestamp: Date;
    data: any;
    processed: boolean;
  }> {
    return this.logs.slice(-limit);
  }

  static getLogsByType(type: string, limit: number = 100): Array<{
    type: string;
    timestamp: Date;
    data: any;
    processed: boolean;
  }> {
    return this.logs
      .filter(log => log.type === type)
      .slice(-limit);
  }

  static clearLogs(): void {
    this.logs = [];
  }
}

// Initialize event logging
truckEventEmitter.on('newListener', (event: string) => {
  EventLogger.log('LISTENER_ADDED', { event });
});

truckEventEmitter.on('removeListener', (event: string) => {
  EventLogger.log('LISTENER_REMOVED', { event });
});
