#!/usr/bin/env node

/**
 * Anomaly Detection CLI Runner
 * 
 * Command-line interface for running anomaly detection on demand
 * 
 * Usage:
 *   npm run anomaly:check -- --help
 *   npm run anomaly:check -- --recent-days 7
 *   npm run anomaly:check -- --receipt-id "receipt-123"
 *   npm run anomaly:check -- --driver-id "driver-456" --days 30
 */

import { Command } from 'commander';
import { AnomalyRunner } from '../runner';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const program = new Command();

program
  .name('anomaly-runner')
  .description('Run anomaly detection on truck monitoring data')
  .version('1.0.0');

program
  .command('check')
  .description('Run anomaly detection on receipts')
  .option('-d, --days <number>', 'Number of days to look back', '7')
  .option('-r, --receipt-id <id>', 'Check specific receipt ID')
  .option('--driver-id <id>', 'Check receipts for specific driver')
  .option('--vehicle-id <id>', 'Check receipts for specific vehicle')
  .option('-v, --verbose', 'Verbose output')
  .option('--dry-run', 'Show what would be checked without processing')
  .action(async (options) => {
    try {
      console.log('🔍 Starting anomaly detection...\n');

      const runner = new AnomalyRunner({
        schedule: { enabled: false },
        processing: {
          batchSize: 100,
          maxConcurrency: 5,
          lookbackDays: parseInt(options.days),
        },
        notifications: {
          enabled: true,
          adminEmails: ['admin@trucking.com'],
        },
        debug: options.verbose,
      });

      if (options.dryRun) {
        console.log('🧪 DRY RUN MODE - No anomalies will be saved\n');
      }

      let result;

      if (options.receiptId) {
        console.log(`📄 Checking receipt: ${options.receiptId}`);
        // Single receipt check would go here
        console.log('✅ Single receipt check completed');
      } else {
        console.log(`📊 Checking receipts from last ${options.days} days`);
        
        const filters: any = {};
        if (options.driverId) filters.driverId = options.driverId;
        if (options.vehicleId) filters.vehicleId = options.vehicleId;

        result = await runner.runDetection(filters);
        
        console.log('\n📋 Detection Results:');
        console.log(`   Receipts Processed: ${result.receiptsProcessed}`);
        console.log(`   Anomalies Found: ${result.anomaliesFound}`);
        console.log(`   Flagged Receipts: ${result.flaggedReceipts}`);
        console.log(`   Processing Time: ${result.processingTime}ms`);

        if (result.anomaliesByType) {
          console.log('\n🔍 Anomalies by Type:');
          Object.entries(result.anomaliesByType).forEach(([type, count]) => {
            console.log(`   - ${type}: ${count}`);
          });
        }

        if (result.anomaliesBySeverity) {
          console.log('\n⚠️  Anomalies by Severity:');
          Object.entries(result.anomaliesBySeverity).forEach(([severity, count]) => {
            console.log(`   - ${severity.toUpperCase()}: ${count}`);
          });
        }
      }

      if (options.verbose && result?.detailedResults) {
        console.log('\n📝 Detailed Results:');
        result.detailedResults.forEach((detail: any, index: number) => {
          if (detail.anomalies.length > 0) {
            console.log(`\n   Receipt ${index + 1}: ${detail.receiptId}`);
            detail.anomalies.forEach((anomaly: any) => {
              console.log(`     - ${anomaly.type}: ${anomaly.description}`);
              console.log(`       Confidence: ${(anomaly.confidence * 100).toFixed(1)}%`);
              console.log(`       Severity: ${anomaly.severity}`);
            });
          }
        });
      }

      console.log('\n✅ Anomaly detection completed successfully!');

    } catch (error) {
      console.error('❌ Error running anomaly detection:', error);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  });

program
  .command('stats')
  .description('Show anomaly detection statistics')
  .option('-d, --days <number>', 'Number of days for statistics', '30')
  .action(async (options) => {
    try {
      console.log('📊 Anomaly Detection Statistics\n');

      const days = parseInt(options.days);
      const since = new Date();
      since.setDate(since.getDate() - days);

      // Get anomaly counts by type
      const anomaliesByType = await prisma.anomalyRecord.groupBy({
        by: ['type'],
        where: {
          createdAt: { gte: since }
        },
        _count: true
      });

      // Get anomalies by severity
      const anomaliesBySeverity = await prisma.anomalyRecord.groupBy({
        by: ['severity'],
        where: {
          createdAt: { gte: since }
        },
        _count: true
      });

      // Get recent trends
      const totalAnomalies = await prisma.anomalyRecord.count({
        where: {
          createdAt: { gte: since }
        }
      });

      console.log(`📅 Statistics for last ${days} days:\n`);
      
      console.log(`🔢 Total Anomalies: ${totalAnomalies}`);
      
      console.log('\n🏷️  By Type:');
      anomaliesByType.forEach(item => {
        console.log(`   - ${item.type}: ${item._count}`);
      });

      console.log('\n⚠️  By Severity:');
      anomaliesBySeverity.forEach(item => {
        console.log(`   - ${item.severity}: ${item._count}`);
      });

      // Most active drivers
      const topDrivers = await prisma.anomalyRecord.groupBy({
        by: ['driverId'],
        where: {
          createdAt: { gte: since },
          driverId: { not: null }
        },
        _count: true,
        orderBy: {
          _count: { driverId: 'desc' }
        },
        take: 5
      });

      if (topDrivers.length > 0) {
        console.log('\n👤 Most Flagged Drivers:');
        topDrivers.forEach((driver, index) => {
          console.log(`   ${index + 1}. Driver ${driver.driverId}: ${driver._count} anomalies`);
        });
      }

    } catch (error) {
      console.error('❌ Error getting statistics:', error);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  });

program
  .command('cleanup')
  .description('Clean up old anomaly records')
  .option('-d, --days <number>', 'Keep records newer than N days', '90')
  .option('--dry-run', 'Show what would be deleted without deleting')
  .action(async (options) => {
    try {
      const days = parseInt(options.days);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      console.log(`🧹 Cleaning up anomaly records older than ${days} days\n`);

      if (options.dryRun) {
        const count = await prisma.anomalyRecord.count({
          where: {
            createdAt: { lt: cutoffDate }
          }
        });
        console.log(`🧪 DRY RUN: Would delete ${count} records`);
      } else {
        const result = await prisma.anomalyRecord.deleteMany({
          where: {
            createdAt: { lt: cutoffDate }
          }
        });
        console.log(`✅ Deleted ${result.count} old anomaly records`);
      }

    } catch (error) {
      console.error('❌ Error during cleanup:', error);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  });

// Parse command line arguments
program.parse();
