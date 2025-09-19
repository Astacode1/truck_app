import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Basic middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    message: 'Truck Monitoring API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mock reports endpoints for testing
app.get('/api/reports/dashboard-overview', (req: Request, res: Response) => {
  res.json({
    overview: {
      thisMonth: {
        totalAmount: 25420,
        totalCount: 156,
        growth: 12,
      },
      thisYear: {
        totalAmount: 284650,
        totalCount: 1523,
      },
      pending: {
        receipts: 23,
      },
      fleet: {
        totalTrucks: 24,
        activeTrucks: 18,
        utilizationRate: 75,
      },
      drivers: {
        total: 32,
      },
    },
    sparklineData: [
      { date: '2024-01-01', amount: 1200 },
      { date: '2024-01-02', amount: 1800 },
      { date: '2024-01-03', amount: 950 },
      { date: '2024-01-04', amount: 2100 },
      { date: '2024-01-05', amount: 1650 },
      { date: '2024-01-06', amount: 1900 },
      { date: '2024-01-07', amount: 1450 },
    ],
  });
});

app.get('/api/reports/expenses-summary', (req: Request, res: Response) => {
  const { start, end, groupBy = 'category' } = req.query;
  
  // Mock data based on groupBy parameter
  const mockData = {
    category: [
      { groupBy: 'Fuel', totalAmount: 12500, receiptCount: 87, percentage: 49, averageAmount: 143.68 },
      { groupBy: 'Maintenance', totalAmount: 8200, receiptCount: 34, percentage: 32, averageAmount: 241.18 },
      { groupBy: 'Tolls', totalAmount: 3100, receiptCount: 28, percentage: 12, averageAmount: 110.71 },
      { groupBy: 'Food', totalAmount: 1620, receiptCount: 7, percentage: 7, averageAmount: 231.43 },
    ],
    truck: [
      { groupBy: 'ABC-123 (Ford F-150)', totalAmount: 8500, receiptCount: 45, percentage: 33, averageAmount: 188.89 },
      { groupBy: 'XYZ-789 (Chevrolet Silverado)', totalAmount: 6200, receiptCount: 32, percentage: 24, averageAmount: 193.75 },
      { groupBy: 'DEF-456 (RAM 1500)', totalAmount: 5800, receiptCount: 38, percentage: 23, averageAmount: 152.63 },
      { groupBy: 'GHI-012 (Ford Transit)', totalAmount: 4920, receiptCount: 41, percentage: 20, averageAmount: 120.00 },
    ],
    driver: [
      { groupBy: 'John Doe', totalAmount: 9800, receiptCount: 52, percentage: 39, averageAmount: 188.46 },
      { groupBy: 'Jane Smith', totalAmount: 7200, receiptCount: 38, percentage: 28, averageAmount: 189.47 },
      { groupBy: 'Mike Johnson', totalAmount: 5420, receiptCount: 35, percentage: 21, averageAmount: 154.86 },
      { groupBy: 'Sarah Wilson', totalAmount: 3000, receiptCount: 31, percentage: 12, averageAmount: 96.77 },
    ],
  };

  const expenses = mockData[groupBy as keyof typeof mockData] || mockData.category;
  const totalAmount = expenses.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalReceipts = expenses.reduce((sum, item) => sum + item.receiptCount, 0);

  res.json({
    summary: {
      totalAmount,
      totalReceipts,
      pendingReceipts: Math.floor(totalReceipts * 0.15),
      approvedReceipts: Math.floor(totalReceipts * 0.8),
      rejectedReceipts: Math.floor(totalReceipts * 0.05),
      averageExpense: Math.round(totalAmount / totalReceipts),
      dateRange: { start: start || '2024-01-01', end: end || '2024-12-31' },
      groupBy,
    },
    expenses,
  });
});

app.get('/api/reports/expense-details', (req: Request, res: Response) => {
  const mockExpenses = [
    {
      id: '1',
      amount: 125.50,
      category: 'Fuel',
      description: 'Gas station fill-up',
      expenseDate: '2024-01-15',
      status: 'APPROVED',
      truck: { id: '1', licensePlate: 'ABC-123', make: 'Ford', model: 'F-150' },
      user: { id: '1', firstName: 'John', lastName: 'Doe', email: 'john.doe@company.com' },
      currency: 'USD',
      createdAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      amount: 420.00,
      category: 'Maintenance',
      description: 'Oil change and inspection',
      expenseDate: '2024-01-14',
      status: 'PENDING',
      truck: { id: '2', licensePlate: 'XYZ-789', make: 'Chevrolet', model: 'Silverado' },
      user: { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@company.com' },
      currency: 'USD',
      createdAt: '2024-01-14T14:20:00Z',
    },
  ];

  res.json({
    expenses: mockExpenses,
    pagination: {
      currentPage: 1,
      totalPages: 5,
      totalCount: 150,
      hasNext: true,
      hasPrev: false,
    },
  });
});

app.get('/api/reports/categories', (req: Request, res: Response) => {
  res.json({
    categories: [
      { name: 'Fuel', count: 87, totalAmount: 12500 },
      { name: 'Maintenance', count: 34, totalAmount: 8200 },
      { name: 'Tolls', count: 28, totalAmount: 3100 },
      { name: 'Food', count: 7, totalAmount: 1620 },
    ],
  });
});

// CSV Export endpoint
app.get('/api/reports/export/csv', (req: Request, res: Response) => {
  const { start, end, groupBy = 'category' } = req.query;
  
  // Generate CSV content
  const csvHeader = 'Date,Amount,Category,Description,Status,Truck,Driver\n';
  const csvRows = [
    '2024-01-15,125.50,Fuel,"Gas station fill-up",APPROVED,ABC-123,John Doe',
    '2024-01-14,420.00,Maintenance,"Oil change and inspection",PENDING,XYZ-789,Jane Smith',
    '2024-01-13,75.25,Tolls,"Highway toll payment",APPROVED,ABC-123,John Doe',
    '2024-01-12,45.00,Food,"Lunch during delivery",APPROVED,DEF-456,Mike Johnson',
    '2024-01-11,890.00,Maintenance,"Brake pad replacement",APPROVED,GHI-012,Sarah Wilson',
  ].join('\n');
  
  const csvContent = csvHeader + csvRows;
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="expense-report-${start || 'all'}-to-${end || 'all'}.csv"`);
  res.send(csvContent);
});

// PDF Export endpoint  
app.get('/api/reports/export/pdf', (req: Request, res: Response) => {
  const { start, end, groupBy = 'category' } = req.query;
  
  // Mock PDF generation - in real implementation, use libraries like puppeteer or pdfkit
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Expense Report - Mock PDF) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
300
%%EOF`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="expense-report-${start || 'all'}-to-${end || 'all'}.pdf"`);
  res.send(pdfContent);
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handling
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock Backend Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Dashboard API: http://localhost:${PORT}/api/reports/dashboard-overview`);
});

export { app };
