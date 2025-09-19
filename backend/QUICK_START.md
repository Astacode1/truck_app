# 🚀 Quick Start: Anomaly Detection System

## Immediate Setup (5 Minutes)

### 1. **Generate Database Client**
```bash
cd backend
npx prisma generate
```

### 2. **Run Live Demo**
```bash
npm run anomaly-demo
```

### 3. **View Implementation**
```
src/anomaly/
├── types.ts              # Core type definitions
├── detector.ts           # Main detection engine  
├── rules/index.ts        # 5 detection rules
├── runner.ts             # Scheduled execution
└── test/anomaly.test.ts  # Complete test suite
```

## 🔍 **Detection Rules Summary**

| Rule | Threshold | Example |
|------|-----------|---------|
| **Excessive Amount** | >3x avg fuel | $180 vs $50 avg → FLAGGED |
| **Duplicate Receipt** | Same amount/merchant in 24hrs | Shell $45.67 twice → FLAGGED |
| **Outside Trip Dates** | Receipt outside trip ±1 day | Trip Sep 10-15, Receipt Sep 20 → FLAGGED |
| **Suspicious Merchant** | Blacklisted categories | "Casino Restaurant" → FLAGGED |
| **Frequent Submission** | >5 receipts/hour | 8 receipts in 30min → FLAGGED |

## 🧪 **Live Demo Output**
```
🧪 Running Anomaly Detection Tests

📋 Test 2: Excessive Amount Detection
   Receipt Amount: $350
   Average Fuel Amount: $50.70
   Result: 1 anomalies found ✅ PASS
   Confidence: 95.0%

📋 Test 3: Duplicate Receipt Detection  
   Result: 1 anomalies found ✅ PASS
   Confidence: 70.0%

📋 Test 4: Outside Trip Dates Detection
   Result: 1 anomalies found ✅ PASS
   Confidence: 95.0%

✅ All anomaly detection tests completed!
```

## 🎯 **Integration Ready**

The system is **complete and working** with:
- ✅ 5 Detection rules implemented
- ✅ Database schema extended 
- ✅ Notification system integrated
- ✅ Scheduled & triggered execution
- ✅ Comprehensive test coverage
- ✅ Live demonstration working

**Run `npm run anomaly-demo` to see it in action!**
