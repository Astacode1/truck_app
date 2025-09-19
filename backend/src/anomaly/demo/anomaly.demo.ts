#!/usr/bin/env node

/**
 * Anomaly Detection Demo Script
 * 
 * This script demonstrates the complete functionality of the pluggable anomaly detection system.
 * Run this script to see all anomaly detection rules in action with sample data.
 * 
 * Usage:
 *   npm run anomaly-demo
 *   or
 *   node dist/anomaly/demo/anomaly.demo.js
 */

import { runAnomalyDetectionDemo } from '../test/anomaly.test';

async function main() {
  try {
    await runAnomalyDetectionDemo();
    process.exit(0);
  } catch (error) {
    console.error('Demo failed:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down anomaly detection demo...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down anomaly detection demo...');
  process.exit(0);
});

// Run the demo
if (require.main === module) {
  main();
}
