import { 
  AnomalyRule, 
  AnomalyContext, 
  AnomalyResult, 
  DetectionResult,
  BatchDetectionResult,
  AnomalyDetectionConfig,
  Receipt,
  Driver,
  Vehicle,
  Trip,
  AnomalySeverity
} from './types';

export class AnomalyDetector {
  private rules: Map<string, AnomalyRule> = new Map();
  private config: AnomalyDetectionConfig;

  constructor(config: AnomalyDetectionConfig) {
    this.config = config;
    this.registerRules(config.rules);
  }

  /**
   * Register a single rule
   */
  registerRule(rule: AnomalyRule): void {
    if (!rule.validateConfig(rule.config)) {
      throw new Error(`Invalid configuration for rule ${rule.id}`);
    }
    this.rules.set(rule.id, rule);
  }

  /**
   * Register multiple rules
   */
  registerRules(rules: AnomalyRule[]): void {
    rules.forEach(rule => this.registerRule(rule));
  }

  /**
   * Unregister a rule
   */
  unregisterRule(ruleId: string): void {
    this.rules.delete(ruleId);
  }

  /**
   * Get all registered rules
   */
  getRules(): AnomalyRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Get enabled rules only
   */
  getEnabledRules(): AnomalyRule[] {
    return this.getRules().filter(rule => rule.enabled);
  }

  /**
   * Detect anomalies for a single receipt
   */
  async detectAnomalies(context: AnomalyContext): Promise<DetectionResult> {
    const startTime = Date.now();
    const enabledRules = this.getEnabledRules();
    const anomalies: AnomalyResult[] = [];
    const errors: string[] = [];

    for (const rule of enabledRules) {
      try {
        const result = await rule.detect(context);
        if (result && result.confidence >= this.config.minConfidence) {
          anomalies.push(result);
        }
      } catch (error) {
        console.error(`Error running rule ${rule.id}:`, error);
        errors.push(`Rule ${rule.id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    const processingTime = Date.now() - startTime;
    const flagged = anomalies.length > 0;
    const highestSeverity = this.getHighestSeverity(anomalies);

    return {
      receiptId: context.receipt.id,
      anomalies,
      flagged,
      highestSeverity,
      totalAnomalies: anomalies.length,
      processingTime
    };
  }

  /**
   * Detect anomalies for multiple receipts
   */
  async detectBatchAnomalies(contexts: AnomalyContext[]): Promise<BatchDetectionResult> {
    const startTime = Date.now();
    const results: DetectionResult[] = [];
    const errors: string[] = [];
    let totalAnomalies = 0;
    let flaggedReceipts = 0;

    for (const context of contexts) {
      try {
        const result = await this.detectAnomalies(context);
        results.push(result);
        totalAnomalies += result.totalAnomalies;
        if (result.flagged) flaggedReceipts++;
      } catch (error) {
        console.error(`Error processing receipt ${context.receipt.id}:`, error);
        errors.push(`Receipt ${context.receipt.id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    const processingTime = Date.now() - startTime;

    return {
      totalReceipts: contexts.length,
      processedReceipts: results.length,
      totalAnomalies,
      flaggedReceipts,
      results,
      processingTime,
      errors
    };
  }

  /**
   * Get the highest severity from a list of anomalies
   */
  private getHighestSeverity(anomalies: AnomalyResult[]): AnomalySeverity | undefined {
    if (anomalies.length === 0) return undefined;

    const severityOrder = {
      [AnomalySeverity.CRITICAL]: 4,
      [AnomalySeverity.HIGH]: 3,
      [AnomalySeverity.MEDIUM]: 2,
      [AnomalySeverity.LOW]: 1
    };

    let highest = AnomalySeverity.LOW;
    for (const anomaly of anomalies) {
      if (severityOrder[anomaly.severity] > severityOrder[highest]) {
        highest = anomaly.severity;
      }
    }
    return highest;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AnomalyDetectionConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (config.rules) {
      this.rules.clear();
      this.registerRules(config.rules);
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): AnomalyDetectionConfig {
    return { ...this.config };
  }

  /**
   * Health check
   */
  healthCheck(): {
    healthy: boolean;
    rulesRegistered: number;
    enabledRules: number;
    errors: string[];
  } {
    const errors: string[] = [];
    const totalRules = this.rules.size;
    const enabledRules = this.getEnabledRules().length;

    if (totalRules === 0) {
      errors.push('No rules registered');
    }

    if (enabledRules === 0) {
      errors.push('No rules enabled');
    }

    // Validate rule configurations
    for (const rule of this.rules.values()) {
      try {
        if (!rule.validateConfig(rule.config)) {
          errors.push(`Invalid configuration for rule ${rule.id}`);
        }
      } catch (error) {
        errors.push(`Error validating rule ${rule.id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return {
      healthy: errors.length === 0,
      rulesRegistered: totalRules,
      enabledRules,
      errors
    };
  }

  /**
   * Get statistics about rule performance
   */
  getStatistics(): {
    rules: Array<{
      id: string;
      name: string;
      type: string;
      enabled: boolean;
      executionCount: number;
      avgExecutionTime: number;
      anomaliesDetected: number;
    }>;
  } {
    // This would typically track statistics over time
    // For now, return basic rule information
    return {
      rules: this.getRules().map(rule => ({
        id: rule.id,
        name: rule.name,
        type: rule.type,
        enabled: rule.enabled,
        executionCount: 0, // Would track in production
        avgExecutionTime: 0, // Would track in production
        anomaliesDetected: 0 // Would track in production
      }))
    };
  }
}
