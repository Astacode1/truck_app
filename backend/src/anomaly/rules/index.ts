import { 
  AnomalyRule, 
  AnomalyContext, 
  AnomalyResult, 
  AnomalyType, 
  AnomalySeverity 
} from '../types';

/**
 * Rule to detect receipts with excessive amounts compared to driver's average fuel expenses
 */
export class ExcessiveAmountRule implements AnomalyRule {
  id = 'excessive-amount';
  name = 'Excessive Amount Detection';
  description = 'Detects receipts with amounts significantly higher than driver average';
  type = AnomalyType.EXCESSIVE_AMOUNT;
  severity = AnomalySeverity.HIGH;
  enabled = true;
  config: {
    multiplier: number; // How many times higher than average
    minSampleSize: number; // Minimum historical receipts needed
    fuelCategories: string[]; // Categories considered as fuel
  };

  constructor(config?: Partial<typeof ExcessiveAmountRule.prototype.config>) {
    this.config = {
      multiplier: 3.0,
      minSampleSize: 5,
      fuelCategories: ['fuel', 'gas', 'gasoline', 'diesel'],
      ...config
    };
  }

  async detect(context: AnomalyContext): Promise<AnomalyResult | null> {
    const { receipt, driverStats, historicalReceipts } = context;

    // Check if this is a fuel-related receipt
    const isFuelReceipt = this.isFuelCategory(receipt.category) || 
                         this.isFuelMerchant(receipt.merchantName);

    if (!isFuelReceipt) {
      return null; // Only check fuel receipts for excessive amounts
    }

    // Need sufficient historical data
    const fuelReceipts = historicalReceipts.filter(r => 
      this.isFuelCategory(r.category) || this.isFuelMerchant(r.merchantName)
    );

    if (fuelReceipts.length < this.config.minSampleSize) {
      return null; // Not enough data to make a determination
    }

    // Calculate average fuel amount
    const avgFuelAmount = fuelReceipts.reduce((sum, r) => sum + r.amount, 0) / fuelReceipts.length;
    
    // Check if current receipt exceeds threshold
    const threshold = avgFuelAmount * this.config.multiplier;
    
    if (receipt.amount > threshold) {
      const confidence = Math.min(0.95, (receipt.amount / threshold - 1) * 0.5 + 0.6);
      
      return {
        ruleId: this.id,
        ruleName: this.name,
        type: this.type,
        severity: this.severity,
        description: `Receipt amount $${receipt.amount.toFixed(2)} is ${this.config.multiplier}x higher than average fuel expense`,
        details: {
          receiptAmount: receipt.amount,
          averageFuelAmount: avgFuelAmount,
          threshold: threshold,
          multiplier: this.config.multiplier,
          historicalSampleSize: fuelReceipts.length
        },
        confidence,
        receiptId: receipt.id,
        timestamp: new Date()
      };
    }

    return null;
  }

  validateConfig(config: Record<string, any>): boolean {
    return typeof config.multiplier === 'number' && 
           config.multiplier > 1 &&
           typeof config.minSampleSize === 'number' && 
           config.minSampleSize > 0 &&
           Array.isArray(config.fuelCategories);
  }

  private isFuelCategory(category: string): boolean {
    return this.config.fuelCategories.some(fuel => 
      category.toLowerCase().includes(fuel.toLowerCase())
    );
  }

  private isFuelMerchant(merchantName: string): boolean {
    const fuelMerchants = ['shell', 'exxon', 'bp', 'chevron', 'mobil', 'texaco', 'gulf'];
    return fuelMerchants.some(merchant => 
      merchantName.toLowerCase().includes(merchant.toLowerCase())
    );
  }
}

/**
 * Rule to detect duplicate receipts (same amount and merchant within short time period)
 */
export class DuplicateReceiptRule implements AnomalyRule {
  id = 'duplicate-receipt';
  name = 'Duplicate Receipt Detection';
  description = 'Detects potential duplicate receipts with same amount and merchant';
  type = AnomalyType.DUPLICATE_RECEIPT;
  severity = AnomalySeverity.MEDIUM;
  enabled = true;
  config: {
    timeWindowHours: number; // Time window to check for duplicates
    exactAmountMatch: boolean; // Require exact amount match or allow small variance
    amountTolerance: number; // Tolerance for amount matching (if not exact)
  };

  constructor(config?: Partial<typeof DuplicateReceiptRule.prototype.config>) {
    this.config = {
      timeWindowHours: 24,
      exactAmountMatch: true,
      amountTolerance: 0.01,
      ...config
    };
  }

  async detect(context: AnomalyContext): Promise<AnomalyResult | null> {
    const { receipt, historicalReceipts } = context;

    const timeWindowMs = this.config.timeWindowHours * 60 * 60 * 1000;
    const windowStart = new Date(receipt.receiptDate.getTime() - timeWindowMs);
    const windowEnd = new Date(receipt.receiptDate.getTime() + timeWindowMs);

    // Find receipts in the time window
    const potentialDuplicates = historicalReceipts.filter(r => {
      if (r.id === receipt.id) return false; // Don't compare with itself
      
      const receiptTime = new Date(r.receiptDate);
      return receiptTime >= windowStart && receiptTime <= windowEnd;
    });

    // Check for duplicates with same merchant and amount
    const duplicates = potentialDuplicates.filter(r => {
      const merchantMatch = this.merchantsMatch(receipt.merchantName, r.merchantName);
      const amountMatch = this.amountsMatch(receipt.amount, r.amount);
      
      return merchantMatch && amountMatch;
    });

    if (duplicates.length > 0) {
      const confidence = Math.min(0.9, 0.5 + (duplicates.length * 0.2));
      
      return {
        ruleId: this.id,
        ruleName: this.name,
        type: this.type,
        severity: this.severity,
        description: `Potential duplicate receipt found: same merchant and amount within ${this.config.timeWindowHours} hours`,
        details: {
          duplicateCount: duplicates.length,
          duplicateReceiptIds: duplicates.map(r => r.id),
          timeWindow: this.config.timeWindowHours,
          merchant: receipt.merchantName,
          amount: receipt.amount,
          duplicates: duplicates.map(r => ({
            id: r.id,
            amount: r.amount,
            merchant: r.merchantName,
            date: r.receiptDate
          }))
        },
        confidence,
        receiptId: receipt.id,
        timestamp: new Date()
      };
    }

    return null;
  }

  validateConfig(config: Record<string, any>): boolean {
    return typeof config.timeWindowHours === 'number' && 
           config.timeWindowHours > 0 &&
           typeof config.exactAmountMatch === 'boolean' &&
           typeof config.amountTolerance === 'number' && 
           config.amountTolerance >= 0;
  }

  private merchantsMatch(merchant1: string, merchant2: string): boolean {
    // Normalize merchant names for comparison
    const normalize = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return normalize(merchant1) === normalize(merchant2);
  }

  private amountsMatch(amount1: number, amount2: number): boolean {
    if (this.config.exactAmountMatch) {
      return Math.abs(amount1 - amount2) < 0.005; // Account for floating point precision
    } else {
      return Math.abs(amount1 - amount2) <= this.config.amountTolerance;
    }
  }
}

/**
 * Rule to detect receipts submitted outside trip dates
 */
export class OutsideTripDatesRule implements AnomalyRule {
  id = 'outside-trip-dates';
  name = 'Outside Trip Dates Detection';
  description = 'Detects receipts with dates outside the associated trip period';
  type = AnomalyType.OUTSIDE_TRIP_DATES;
  severity = AnomalySeverity.HIGH;
  enabled = true;
  config: {
    bufferDays: number; // Days before/after trip to allow receipts
    strictMode: boolean; // If true, no buffer days allowed
  };

  constructor(config?: Partial<typeof OutsideTripDatesRule.prototype.config>) {
    this.config = {
      bufferDays: 1,
      strictMode: false,
      ...config
    };
  }

  async detect(context: AnomalyContext): Promise<AnomalyResult | null> {
    const { receipt, trip } = context;

    // Skip if no trip is associated
    if (!trip) {
      return null;
    }

    const bufferMs = this.config.strictMode ? 0 : this.config.bufferDays * 24 * 60 * 60 * 1000;
    const allowedStart = new Date(trip.startDate.getTime() - bufferMs);
    const allowedEnd = new Date(trip.endDate.getTime() + bufferMs);

    const receiptDate = new Date(receipt.receiptDate);

    if (receiptDate < allowedStart || receiptDate > allowedEnd) {
      const daysBefore = receiptDate < allowedStart ? 
        Math.ceil((allowedStart.getTime() - receiptDate.getTime()) / (24 * 60 * 60 * 1000)) : 0;
      const daysAfter = receiptDate > allowedEnd ? 
        Math.ceil((receiptDate.getTime() - allowedEnd.getTime()) / (24 * 60 * 60 * 1000)) : 0;

      const confidence = Math.min(0.95, 0.6 + Math.max(daysBefore, daysAfter) * 0.1);

      return {
        ruleId: this.id,
        ruleName: this.name,
        type: this.type,
        severity: this.severity,
        description: `Receipt date ${receiptDate.toLocaleDateString()} is outside trip period`,
        details: {
          receiptDate: receiptDate,
          tripStartDate: trip.startDate,
          tripEndDate: trip.endDate,
          allowedStartDate: allowedStart,
          allowedEndDate: allowedEnd,
          daysBefore,
          daysAfter,
          bufferDays: this.config.bufferDays,
          strictMode: this.config.strictMode
        },
        confidence,
        receiptId: receipt.id,
        timestamp: new Date()
      };
    }

    return null;
  }

  validateConfig(config: Record<string, any>): boolean {
    return typeof config.bufferDays === 'number' && 
           config.bufferDays >= 0 &&
           typeof config.strictMode === 'boolean';
  }
}

/**
 * Rule to detect suspicious merchants (blacklisted or non-business related)
 */
export class SuspiciousMerchantRule implements AnomalyRule {
  id = 'suspicious-merchant';
  name = 'Suspicious Merchant Detection';
  description = 'Detects receipts from blacklisted or non-business merchants';
  type = AnomalyType.SUSPICIOUS_MERCHANT;
  severity = AnomalySeverity.MEDIUM;
  enabled = true;
  config: {
    blacklistedMerchants: string[];
    suspiciousCategories: string[];
    allowPersonalExpenses: boolean;
  };

  constructor(config?: Partial<typeof SuspiciousMerchantRule.prototype.config>) {
    this.config = {
      blacklistedMerchants: ['liquor store', 'casino', 'tobacco', 'adult entertainment'],
      suspiciousCategories: ['entertainment', 'gambling', 'alcohol', 'personal care'],
      allowPersonalExpenses: false,
      ...config
    };
  }

  async detect(context: AnomalyContext): Promise<AnomalyResult | null> {
    const { receipt } = context;

    // Check blacklisted merchants
    const isBlacklisted = this.config.blacklistedMerchants.some(merchant =>
      receipt.merchantName.toLowerCase().includes(merchant.toLowerCase())
    );

    // Check suspicious categories
    const isSuspiciousCategory = this.config.suspiciousCategories.some(category =>
      receipt.category.toLowerCase().includes(category.toLowerCase())
    );

    if (isBlacklisted || (isSuspiciousCategory && !this.config.allowPersonalExpenses)) {
      const confidence = isBlacklisted ? 0.9 : 0.7;

      return {
        ruleId: this.id,
        ruleName: this.name,
        type: this.type,
        severity: this.severity,
        description: `Receipt from ${isBlacklisted ? 'blacklisted' : 'suspicious'} merchant/category`,
        details: {
          merchant: receipt.merchantName,
          category: receipt.category,
          isBlacklisted,
          isSuspiciousCategory,
          reason: isBlacklisted ? 'Blacklisted merchant' : 'Suspicious category'
        },
        confidence,
        receiptId: receipt.id,
        timestamp: new Date()
      };
    }

    return null;
  }

  validateConfig(config: Record<string, any>): boolean {
    return Array.isArray(config.blacklistedMerchants) &&
           Array.isArray(config.suspiciousCategories) &&
           typeof config.allowPersonalExpenses === 'boolean';
  }
}

/**
 * Rule to detect frequent receipt submissions (potential fraud pattern)
 */
export class FrequentSubmissionRule implements AnomalyRule {
  id = 'frequent-submission';
  name = 'Frequent Submission Detection';
  description = 'Detects unusually frequent receipt submissions';
  type = AnomalyType.FREQUENT_SUBMISSIONS;
  severity = AnomalySeverity.LOW;
  enabled = true;
  config: {
    maxReceiptsPerDay: number;
    maxReceiptsPerHour: number;
    timeWindowDays: number;
  };

  constructor(config?: Partial<typeof FrequentSubmissionRule.prototype.config>) {
    this.config = {
      maxReceiptsPerDay: 10,
      maxReceiptsPerHour: 5,
      timeWindowDays: 7,
      ...config
    };
  }

  async detect(context: AnomalyContext): Promise<AnomalyResult | null> {
    const { receipt, historicalReceipts } = context;

    const now = receipt.submittedAt;
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Count recent submissions
    const receiptsLastDay = historicalReceipts.filter(r => 
      r.submittedAt >= oneDayAgo && r.submittedAt <= now
    ).length;

    const receiptsLastHour = historicalReceipts.filter(r => 
      r.submittedAt >= oneHourAgo && r.submittedAt <= now
    ).length;

    if (receiptsLastDay > this.config.maxReceiptsPerDay || 
        receiptsLastHour > this.config.maxReceiptsPerHour) {
      
      const confidence = Math.min(0.8, 0.4 + 
        Math.max(
          receiptsLastDay / this.config.maxReceiptsPerDay - 1,
          receiptsLastHour / this.config.maxReceiptsPerHour - 1
        ) * 0.3
      );

      return {
        ruleId: this.id,
        ruleName: this.name,
        type: this.type,
        severity: this.severity,
        description: `Unusually frequent receipt submissions detected`,
        details: {
          receiptsLastDay,
          receiptsLastHour,
          maxPerDay: this.config.maxReceiptsPerDay,
          maxPerHour: this.config.maxReceiptsPerHour,
          exceedsDaily: receiptsLastDay > this.config.maxReceiptsPerDay,
          exceedsHourly: receiptsLastHour > this.config.maxReceiptsPerHour
        },
        confidence,
        receiptId: receipt.id,
        timestamp: new Date()
      };
    }

    return null;
  }

  validateConfig(config: Record<string, any>): boolean {
    return typeof config.maxReceiptsPerDay === 'number' && 
           config.maxReceiptsPerDay > 0 &&
           typeof config.maxReceiptsPerHour === 'number' && 
           config.maxReceiptsPerHour > 0 &&
           typeof config.timeWindowDays === 'number' && 
           config.timeWindowDays > 0;
  }
}
