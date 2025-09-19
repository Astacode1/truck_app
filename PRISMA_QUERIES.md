# Sample Prisma Aggregation Queries for Expense Reporting

This document provides sample Prisma queries for implementing the admin dashboard aggregation features in a real database environment.

## Database Schema Overview

```prisma
model Expense {
  id          String   @id @default(cuid())
  amount      Decimal  @db.Decimal(10, 2)
  category    String
  description String?
  expenseDate DateTime
  status      ExpenseStatus
  currency    String   @default("USD")
  receiptUrl  String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  truckId     String
  truck       Truck    @relation(fields: [truckId], references: [id])
  userId      String
  user        User     @relation(fields: [userId], references: [id])

  @@map("expenses")
}

model Truck {
  id           String @id @default(cuid())
  licensePlate String @unique
  make         String
  model        String
  year         Int?
  status       TruckStatus @default(ACTIVE)
  
  expenses     Expense[]
  trips        Trip[]
  
  @@map("trucks")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  firstName String
  lastName  String
  role      UserRole @default(DRIVER)
  
  expenses  Expense[]
  trips     Trip[]
  
  @@map("users")
}

enum ExpenseStatus {
  PENDING
  APPROVED
  REJECTED
}

enum TruckStatus {
  ACTIVE
  MAINTENANCE
  INACTIVE
}

enum UserRole {
  ADMIN
  DRIVER
  MANAGER
}
```

## 1. Dashboard Overview Aggregation

```typescript
// Get dashboard overview statistics
async function getDashboardOverview() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  
  // This month expenses
  const thisMonthStats = await prisma.expense.aggregate({
    where: {
      expenseDate: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    _sum: {
      amount: true,
    },
    _count: {
      id: true,
    },
  });

  // This year expenses
  const thisYearStats = await prisma.expense.aggregate({
    where: {
      expenseDate: {
        gte: startOfYear,
        lte: now,
      },
    },
    _sum: {
      amount: true,
    },
    _count: {
      id: true,
    },
  });

  // Pending receipts count
  const pendingCount = await prisma.expense.count({
    where: {
      status: 'PENDING',
    },
  });

  // Fleet statistics
  const fleetStats = await prisma.truck.aggregate({
    _count: {
      id: true,
    },
  });

  const activeTrucksCount = await prisma.truck.count({
    where: {
      status: 'ACTIVE',
    },
  });

  // Driver count
  const driverCount = await prisma.user.count({
    where: {
      role: 'DRIVER',
    },
  });

  return {
    thisMonth: {
      totalAmount: thisMonthStats._sum.amount || 0,
      totalCount: thisMonthStats._count.id,
      growth: 12, // Calculate based on previous month comparison
    },
    thisYear: {
      totalAmount: thisYearStats._sum.amount || 0,
      totalCount: thisYearStats._count.id,
    },
    pending: {
      receipts: pendingCount,
    },
    fleet: {
      totalTrucks: fleetStats._count.id,
      activeTrucks: activeTrucksCount,
      utilizationRate: Math.round((activeTrucksCount / fleetStats._count.id) * 100),
    },
    drivers: {
      total: driverCount,
    },
  };
}
```

## 2. Expenses Summary with Grouping

```typescript
// Get expenses summary grouped by category, truck, or driver
async function getExpensesSummary(
  startDate: Date,
  endDate: Date,
  groupBy: 'category' | 'truck' | 'driver'
) {
  const whereClause = {
    expenseDate: {
      gte: startDate,
      lte: endDate,
    },
  };

  // Overall summary
  const overallStats = await prisma.expense.aggregate({
    where: whereClause,
    _sum: {
      amount: true,
    },
    _count: {
      id: true,
    },
    _avg: {
      amount: true,
    },
  });

  // Status breakdown
  const statusBreakdown = await prisma.expense.groupBy({
    by: ['status'],
    where: whereClause,
    _count: {
      id: true,
    },
  });

  let groupedExpenses;

  switch (groupBy) {
    case 'category':
      groupedExpenses = await prisma.expense.groupBy({
        by: ['category'],
        where: whereClause,
        _sum: {
          amount: true,
        },
        _count: {
          id: true,
        },
        _avg: {
          amount: true,
        },
        orderBy: {
          _sum: {
            amount: 'desc',
          },
        },
      });
      break;

    case 'truck':
      groupedExpenses = await prisma.expense.groupBy({
        by: ['truckId'],
        where: whereClause,
        _sum: {
          amount: true,
        },
        _count: {
          id: true,
        },
        _avg: {
          amount: true,
        },
        orderBy: {
          _sum: {
            amount: 'desc',
          },
        },
      });
      
      // Enhance with truck details
      const truckIds = groupedExpenses.map(e => e.truckId);
      const trucks = await prisma.truck.findMany({
        where: {
          id: {
            in: truckIds,
          },
        },
      });
      
      groupedExpenses = groupedExpenses.map(expense => {
        const truck = trucks.find(t => t.id === expense.truckId);
        return {
          ...expense,
          groupBy: truck ? `${truck.licensePlate} (${truck.make} ${truck.model})` : 'Unknown Truck',
        };
      });
      break;

    case 'driver':
      groupedExpenses = await prisma.expense.groupBy({
        by: ['userId'],
        where: whereClause,
        _sum: {
          amount: true,
        },
        _count: {
          id: true,
        },
        _avg: {
          amount: true,
        },
        orderBy: {
          _sum: {
            amount: 'desc',
          },
        },
      });
      
      // Enhance with user details
      const userIds = groupedExpenses.map(e => e.userId);
      const users = await prisma.user.findMany({
        where: {
          id: {
            in: userIds,
          },
        },
      });
      
      groupedExpenses = groupedExpenses.map(expense => {
        const user = users.find(u => u.id === expense.userId);
        return {
          ...expense,
          groupBy: user ? `${user.firstName} ${user.lastName}` : 'Unknown Driver',
        };
      });
      break;
  }

  const totalAmount = overallStats._sum.amount || 0;

  return {
    summary: {
      totalAmount,
      totalReceipts: overallStats._count.id,
      pendingReceipts: statusBreakdown.find(s => s.status === 'PENDING')?._count.id || 0,
      approvedReceipts: statusBreakdown.find(s => s.status === 'APPROVED')?._count.id || 0,
      rejectedReceipts: statusBreakdown.find(s => s.status === 'REJECTED')?._count.id || 0,
      averageExpense: Math.round(overallStats._avg.amount || 0),
      dateRange: { start: startDate, end: endDate },
      groupBy,
    },
    expenses: groupedExpenses.map(item => ({
      groupBy: item.groupBy || item.category || 'Unknown',
      totalAmount: Number(item._sum.amount || 0),
      receiptCount: item._count.id,
      averageAmount: Number(item._avg.amount || 0),
      percentage: Math.round((Number(item._sum.amount || 0) / Number(totalAmount)) * 100),
    })),
  };
}
```

## 3. Detailed Expense Reports with Pagination

```typescript
// Get detailed expense list with filters and pagination
async function getExpenseDetails(params: {
  startDate?: Date;
  endDate?: Date;
  status?: ExpenseStatus;
  category?: string;
  truckId?: string;
  userId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'expenseDate' | 'amount' | 'category';
  sortOrder?: 'asc' | 'desc';
}) {
  const {
    startDate,
    endDate,
    status,
    category,
    truckId,
    userId,
    page = 1,
    limit = 50,
    sortBy = 'expenseDate',
    sortOrder = 'desc',
  } = params;

  const whereClause: any = {};

  if (startDate && endDate) {
    whereClause.expenseDate = {
      gte: startDate,
      lte: endDate,
    };
  }

  if (status) whereClause.status = status;
  if (category) whereClause.category = category;
  if (truckId) whereClause.truckId = truckId;
  if (userId) whereClause.userId = userId;

  const [expenses, totalCount] = await Promise.all([
    prisma.expense.findMany({
      where: whereClause,
      include: {
        truck: {
          select: {
            id: true,
            licensePlate: true,
            make: true,
            model: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.expense.count({
      where: whereClause,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    expenses,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}
```

## 4. Export Data for CSV/PDF

```typescript
// Get all expense data for export
async function getExpensesForExport(params: {
  startDate?: Date;
  endDate?: Date;
  groupBy?: 'category' | 'truck' | 'driver';
}) {
  const { startDate, endDate } = params;

  const whereClause: any = {};
  if (startDate && endDate) {
    whereClause.expenseDate = {
      gte: startDate,
      lte: endDate,
    };
  }

  const expenses = await prisma.expense.findMany({
    where: whereClause,
    include: {
      truck: {
        select: {
          licensePlate: true,
          make: true,
          model: true,
        },
      },
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: {
      expenseDate: 'desc',
    },
  });

  return expenses.map(expense => ({
    id: expense.id,
    date: expense.expenseDate.toISOString().split('T')[0],
    amount: Number(expense.amount),
    category: expense.category,
    description: expense.description || '',
    status: expense.status,
    truck: `${expense.truck.licensePlate} (${expense.truck.make} ${expense.truck.model})`,
    driver: `${expense.user.firstName} ${expense.user.lastName}`,
    driverEmail: expense.user.email,
    currency: expense.currency,
    createdAt: expense.createdAt.toISOString(),
  }));
}
```

## 5. Performance Optimization Tips

### Database Indexes
```sql
-- Add indexes for better query performance
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_truck_id ON expenses(truck_id);
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_date_status ON expenses(expense_date, status);
```

### Prisma Query Optimization
```typescript
// Use select to only fetch needed fields
const expenseSummary = await prisma.expense.findMany({
  select: {
    id: true,
    amount: true,
    category: true,
    expenseDate: true,
    truck: {
      select: {
        licensePlate: true,
      },
    },
  },
  where: whereClause,
});

// Use raw queries for complex aggregations
const categoryStats = await prisma.$queryRaw`
  SELECT 
    category,
    COUNT(*) as receipt_count,
    SUM(amount) as total_amount,
    AVG(amount) as average_amount,
    ROUND(SUM(amount) * 100.0 / (SELECT SUM(amount) FROM expenses WHERE expense_date BETWEEN ${startDate} AND ${endDate}), 2) as percentage
  FROM expenses 
  WHERE expense_date BETWEEN ${startDate} AND ${endDate}
  GROUP BY category
  ORDER BY total_amount DESC
`;
```

## 6. Usage Examples

```typescript
// Controller implementation
export class ReportsController {
  async getDashboardOverview(req: Request, res: Response) {
    try {
      const overview = await getDashboardOverview();
      res.json({ overview });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch dashboard overview' });
    }
  }

  async getExpensesSummary(req: Request, res: Response) {
    try {
      const { start, end, groupBy = 'category' } = req.query;
      const startDate = new Date(start as string);
      const endDate = new Date(end as string);
      
      const summary = await getExpensesSummary(startDate, endDate, groupBy as any);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch expenses summary' });
    }
  }

  async exportExpensesCSV(req: Request, res: Response) {
    try {
      const { start, end } = req.query;
      const startDate = start ? new Date(start as string) : undefined;
      const endDate = end ? new Date(end as string) : undefined;
      
      const expenses = await getExpensesForExport({ startDate, endDate });
      
      // Convert to CSV format
      const csvHeaders = ['Date', 'Amount', 'Category', 'Description', 'Status', 'Truck', 'Driver'];
      const csvRows = expenses.map(expense => [
        expense.date,
        expense.amount,
        expense.category,
        expense.description,
        expense.status,
        expense.truck,
        expense.driver,
      ]);
      
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="expenses.csv"');
      res.send(csvContent);
    } catch (error) {
      res.status(500).json({ error: 'Failed to export expenses' });
    }
  }
}
```

This comprehensive set of Prisma queries provides the foundation for implementing a robust admin dashboard with expense reporting capabilities. The queries are optimized for performance and include proper error handling and type safety.
