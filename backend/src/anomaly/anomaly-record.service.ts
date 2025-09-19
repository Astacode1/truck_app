import { PrismaClient, AnomalyRecord, AnomalyStatus, AnomalyType, AnomalySeverity } from '@prisma/client';
import { AnomalyResult } from './types';

export interface CreateAnomalyRecordData {
  receiptId: string;
  ruleId: string;
  ruleName: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  description: string;
  details: Record<string, any>;
  confidence: number;
}

export interface UpdateAnomalyRecordData {
  status?: AnomalyStatus;
  reviewedBy?: string;
  resolution?: string;
}

export interface AnomalyRecordFilters {
  receiptId?: string;
  type?: AnomalyType;
  severity?: AnomalySeverity;
  status?: AnomalyStatus;
  dateFrom?: Date;
  dateTo?: Date;
  reviewedBy?: string;
  minConfidence?: number;
}

export class AnomalyRecordService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new anomaly record
   */
  async createAnomalyRecord(data: CreateAnomalyRecordData): Promise<AnomalyRecord> {
    return this.prisma.anomalyRecord.create({
      data: {
        receiptId: data.receiptId,
        ruleId: data.ruleId,
        ruleName: data.ruleName,
        type: data.type,
        severity: data.severity,
        description: data.description,
        details: JSON.stringify(data.details),
        confidence: data.confidence,
        status: AnomalyStatus.DETECTED,
      },
    });
  }

  /**
   * Create multiple anomaly records from detection results
   */
  async createAnomalyRecordsFromResults(anomalies: AnomalyResult[]): Promise<AnomalyRecord[]> {
    const records = await Promise.all(
      anomalies.map(anomaly =>
        this.createAnomalyRecord({
          receiptId: anomaly.receiptId,
          ruleId: anomaly.ruleId,
          ruleName: anomaly.ruleName,
          type: anomaly.type,
          severity: anomaly.severity,
          description: anomaly.description,
          details: anomaly.details,
          confidence: anomaly.confidence,
        })
      )
    );

    return records;
  }

  /**
   * Update an anomaly record
   */
  async updateAnomalyRecord(
    id: string,
    data: UpdateAnomalyRecordData
  ): Promise<AnomalyRecord | null> {
    try {
      const updateData: any = { ...data };
      
      if (data.status && ['REVIEWED', 'RESOLVED', 'FALSE_POSITIVE'].includes(data.status)) {
        updateData.reviewedAt = new Date();
      }

      return await this.prisma.anomalyRecord.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      console.error('Error updating anomaly record:', error);
      return null;
    }
  }

  /**
   * Get anomaly record by ID
   */
  async getAnomalyRecord(id: string): Promise<AnomalyRecord | null> {
    return this.prisma.anomalyRecord.findUnique({
      where: { id },
      include: {
        receipt: {
          include: {
            uploadedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            trip: {
              select: {
                id: true,
                startDate: true,
                endDate: true,
                origin: true,
                destination: true,
              },
            },
          },
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Get anomaly records with filters
   */
  async getAnomalyRecords(
    filters: AnomalyRecordFilters = {},
    limit: number = 50,
    offset: number = 0
  ): Promise<{ records: AnomalyRecord[]; total: number }> {
    const where: any = {};

    if (filters.receiptId) where.receiptId = filters.receiptId;
    if (filters.type) where.type = filters.type;
    if (filters.severity) where.severity = filters.severity;
    if (filters.status) where.status = filters.status;
    if (filters.reviewedBy) where.reviewedBy = filters.reviewedBy;
    if (filters.minConfidence) where.confidence = { gte: filters.minConfidence };

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
      if (filters.dateTo) where.createdAt.lte = filters.dateTo;
    }

    const [records, total] = await Promise.all([
      this.prisma.anomalyRecord.findMany({
        where,
        include: {
          receipt: {
            include: {
              uploadedBy: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: [
          { severity: 'desc' },
          { createdAt: 'desc' },
        ],
        take: limit,
        skip: offset,
      }),
      this.prisma.anomalyRecord.count({ where }),
    ]);

    return { records, total };
  }

  /**
   * Get anomaly records for a specific receipt
   */
  async getAnomaliesForReceipt(receiptId: string): Promise<AnomalyRecord[]> {
    return this.prisma.anomalyRecord.findMany({
      where: { receiptId },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Flag a receipt based on anomaly detection
   */
  async flagReceipt(receiptId: string, flagReason: string): Promise<boolean> {
    try {
      await this.prisma.receipt.update({
        where: { id: receiptId },
        data: {
          status: 'REJECTED', // or create a new status 'FLAGGED'
          rejectionReason: flagReason,
        },
      });
      return true;
    } catch (error) {
      console.error('Error flagging receipt:', error);
      return false;
    }
  }

  /**
   * Get anomaly statistics
   */
  async getAnomalyStatistics(
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<{
    totalAnomalies: number;
    byType: Record<AnomalyType, number>;
    bySeverity: Record<AnomalySeverity, number>;
    byStatus: Record<AnomalyStatus, number>;
    avgConfidence: number;
    topRules: Array<{ ruleId: string; ruleName: string; count: number }>;
  }> {
    const where: any = {};
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    const [totalCount, byType, bySeverity, byStatus, avgConfidenceResult, topRulesResult] = await Promise.all([
      // Total count
      this.prisma.anomalyRecord.count({ where }),
      
      // By type
      this.prisma.anomalyRecord.groupBy({
        by: ['type'],
        where,
        _count: { type: true },
      }),
      
      // By severity
      this.prisma.anomalyRecord.groupBy({
        by: ['severity'],
        where,
        _count: { severity: true },
      }),
      
      // By status
      this.prisma.anomalyRecord.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
      }),
      
      // Average confidence
      this.prisma.anomalyRecord.aggregate({
        where,
        _avg: { confidence: true },
      }),
      
      // Top rules
      this.prisma.anomalyRecord.groupBy({
        by: ['ruleId', 'ruleName'],
        where,
        _count: { ruleId: true },
        orderBy: { _count: { ruleId: 'desc' } },
        take: 10,
      }),
    ]);

    // Transform results
    const byTypeMap = {} as Record<AnomalyType, number>;
    Object.values(AnomalyType).forEach(type => byTypeMap[type] = 0);
    byType.forEach(item => byTypeMap[item.type] = item._count.type);

    const bySeverityMap = {} as Record<AnomalySeverity, number>;
    Object.values(AnomalySeverity).forEach(severity => bySeverityMap[severity] = 0);
    bySeverity.forEach(item => bySeverityMap[item.severity] = item._count.severity);

    const byStatusMap = {} as Record<AnomalyStatus, number>;
    Object.values(AnomalyStatus).forEach(status => byStatusMap[status] = 0);
    byStatus.forEach(item => byStatusMap[item.status] = item._count.status);

    const topRules = topRulesResult.map(rule => ({
      ruleId: rule.ruleId,
      ruleName: rule.ruleName,
      count: rule._count.ruleId,
    }));

    return {
      totalAnomalies: totalCount,
      byType: byTypeMap,
      bySeverity: bySeverityMap,
      byStatus: byStatusMap,
      avgConfidence: avgConfidenceResult._avg.confidence || 0,
      topRules,
    };
  }

  /**
   * Resolve multiple anomalies
   */
  async resolveAnomalies(
    anomalyIds: string[],
    reviewedBy: string,
    resolution: string,
    status: AnomalyStatus = AnomalyStatus.RESOLVED
  ): Promise<number> {
    try {
      const result = await this.prisma.anomalyRecord.updateMany({
        where: {
          id: { in: anomalyIds },
        },
        data: {
          status,
          reviewedBy,
          reviewedAt: new Date(),
          resolution,
        },
      });
      
      return result.count;
    } catch (error) {
      console.error('Error resolving anomalies:', error);
      return 0;
    }
  }

  /**
   * Delete old anomaly records (cleanup)
   */
  async cleanupOldRecords(daysOld: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await this.prisma.anomalyRecord.deleteMany({
        where: {
          createdAt: { lt: cutoffDate },
          status: { in: [AnomalyStatus.RESOLVED, AnomalyStatus.FALSE_POSITIVE] },
        },
      });

      return result.count;
    } catch (error) {
      console.error('Error cleaning up old records:', error);
      return 0;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    totalRecords: number;
    pendingReview: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let totalRecords = 0;
    let pendingReview = 0;

    try {
      totalRecords = await this.prisma.anomalyRecord.count();
      pendingReview = await this.prisma.anomalyRecord.count({
        where: { status: AnomalyStatus.DETECTED },
      });
    } catch (error) {
      errors.push(`Database error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return {
      healthy: errors.length === 0,
      totalRecords,
      pendingReview,
      errors,
    };
  }
}
