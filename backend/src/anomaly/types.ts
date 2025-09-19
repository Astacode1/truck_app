export interface Receipt {
  id: string;
  userId: string;
  driverId: string;
  tripId?: string;
  amount: number;
  merchantName: string;
  category: string;
  description: string;
  receiptDate: Date;
  submittedAt: Date;
  imageUrl: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  flagged: boolean;
  flagReason?: string;
}

export interface Trip {
  id: string;
  driverId: string;
  vehicleId: string;
  startDate: Date;
  endDate: Date;
  origin: string;
  destination: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
}

export interface Vehicle {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  avgFuelConsumption: number; // MPG or equivalent
}

export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  licenseNumber: string;
  hireDate: Date;
  isActive: boolean;
}

export enum AnomalySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum AnomalyType {
  EXCESSIVE_AMOUNT = 'excessive_amount',
  DUPLICATE_RECEIPT = 'duplicate_receipt',
  OUTSIDE_TRIP_DATES = 'outside_trip_dates',
  SUSPICIOUS_MERCHANT = 'suspicious_merchant',
  FREQUENT_SUBMISSIONS = 'frequent_submissions',
  INVALID_CATEGORY = 'invalid_category',
  UNUSUAL_TIMING = 'unusual_timing'
}

export interface AnomalyResult {
  ruleId: string;
  ruleName: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  description: string;
  details: Record<string, any>;
  confidence: number; // 0-1 score
  receiptId: string;
  timestamp: Date;
}

export interface AnomalyContext {
  receipt: Receipt;
  driver: Driver;
  vehicle?: Vehicle;
  trip?: Trip;
  historicalReceipts: Receipt[];
  driverStats: {
    totalReceipts: number;
    avgReceiptAmount: number;
    avgFuelAmount: number;
    commonMerchants: string[];
    recentReceiptCount: number;
  };
}

export interface AnomalyRule {
  id: string;
  name: string;
  description: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  enabled: boolean;
  config: Record<string, any>;
  
  // Rule execution method
  detect(context: AnomalyContext): Promise<AnomalyResult | null>;
  
  // Rule validation
  validateConfig(config: Record<string, any>): boolean;
}

export interface AnomalyRecord {
  id: string;
  receiptId: string;
  ruleId: string;
  ruleName: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  description: string;
  details: string; // JSON serialized
  confidence: number;
  status: 'detected' | 'reviewed' | 'resolved' | 'false_positive';
  reviewedBy?: string;
  reviewedAt?: Date;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnomalyDetectionConfig {
  enabled: boolean;
  rules: AnomalyRule[];
  alertThresholds: {
    [severity in AnomalySeverity]: {
      immediate: boolean;
      batchSize: number;
      batchInterval: number; // minutes
    };
  };
  lookbackPeriod: number; // days
  minConfidence: number; // 0-1
}

export interface DetectionResult {
  receiptId: string;
  anomalies: AnomalyResult[];
  flagged: boolean;
  highestSeverity?: AnomalySeverity;
  totalAnomalies: number;
  processingTime: number;
}

export interface BatchDetectionResult {
  totalReceipts: number;
  processedReceipts: number;
  totalAnomalies: number;
  flaggedReceipts: number;
  results: DetectionResult[];
  processingTime: number;
  errors: string[];
}
