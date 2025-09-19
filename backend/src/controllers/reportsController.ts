import { Request, Response } from 'express';
import { PrismaClient, ExpenseStatus, ReceiptStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Simple date utility functions
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const startOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

const endOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

const startOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const endOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
};

const startOfYear = (date: Date): Date => {
  return new Date(date.getFullYear(), 0, 1);
};

const endOfYear = (date: Date): Date => {
  return new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
};

const subDays = (date: Date, days: number): Date => {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() - days);
  return newDate;
};

const subMonths = (date: Date, months: number): Date => {
  const newDate = new Date(date);
  newDate.setMonth(date.getMonth() - months);
  return newDate;
};

export class ReportsController {
  /**
   * Get aggregated expenses summary
   * GET /reports/expenses-summary?start=2023-01-01&end=2023-12-31&groupBy=category|truck|driver
   */
  static async getExpensesSummary(req: Request, res: Response) {
    try {
      const { start, end, groupBy = 'category' } = req.query;
      
      // Parse and validate date range
      let startDate: Date;
      let endDate: Date;
      
      if (start && end) {
        startDate = startOfDay(new Date(start as string));
        endDate = endOfDay(new Date(end as string));
      } else {
        // Default to current month
        const now = new Date();
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
      }

      let expenses: any[] = [];
      let totalAmount = 0;
      let totalReceipts = 0;

      // Base query conditions
      const whereCondition = {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: ExpenseStatus.APPROVED,
      };

      switch (groupBy) {
        case 'category':
          // Get category breakdown
          const categoryBreakdown = await prisma.expense.findMany({
            where: whereCondition,
            select: {
              category: true,
              amount: true,
            },
          });

          // Group by category manually
          const categoryMap = new Map();
          categoryBreakdown.forEach(expense => {
            const category = expense.category;
            if (!categoryMap.has(category)) {
              categoryMap.set(category, { totalAmount: 0, count: 0 });
            }
            const current = categoryMap.get(category);
            current.totalAmount += expense.amount;
            current.count += 1;
          });

          expenses = Array.from(categoryMap.entries()).map(([category, data]) => ({
            groupBy: category,
            totalAmount: data.totalAmount,
            receiptCount: data.count,
            percentage: 0,
          }));
          break;

        case 'truck':
          // Get truck breakdown
          const truckBreakdown = await prisma.expense.findMany({
            where: {
              ...whereCondition,
              truckId: { not: null },
            },
            select: {
              truckId: true,
              amount: true,
              truck: {
                select: {
                  licensePlate: true,
                  make: true,
                  model: true,
                },
              },
            },
          });

          const truckMap = new Map();
          truckBreakdown.forEach(expense => {
            const key = expense.truckId;
            if (!truckMap.has(key)) {
              const truck = expense.truck;
              truckMap.set(key, {
                totalAmount: 0,
                count: 0,
                truckInfo: truck ? `${truck.licensePlate} (${truck.make} ${truck.model})` : 'Unknown Truck',
              });
            }
            const current = truckMap.get(key);
            current.totalAmount += expense.amount;
            current.count += 1;
          });

          expenses = Array.from(truckMap.entries()).map(([truckId, data]) => ({
            groupBy: data.truckInfo,
            truckId,
            totalAmount: data.totalAmount,
            receiptCount: data.count,
            percentage: 0,
          }));
          break;

        case 'driver':
          // Get driver breakdown
          const driverBreakdown = await prisma.expense.findMany({
            where: whereCondition,
            select: {
              userId: true,
              amount: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          });

          const driverMap = new Map();
          driverBreakdown.forEach(expense => {
            const key = expense.userId;
            if (!driverMap.has(key)) {
              const user = expense.user;
              driverMap.set(key, {
                totalAmount: 0,
                count: 0,
                driverInfo: `${user.firstName} ${user.lastName}`,
              });
            }
            const current = driverMap.get(key);
            current.totalAmount += expense.amount;
            current.count += 1;
          });

          expenses = Array.from(driverMap.entries()).map(([userId, data]) => ({
            groupBy: data.driverInfo,
            driverId: userId,
            totalAmount: data.totalAmount,
            receiptCount: data.count,
            percentage: 0,
          }));
          break;

        default:
          return res.status(400).json({ error: 'Invalid groupBy parameter. Use: category, truck, or driver' });
      }

      // Calculate totals and percentages
      totalAmount = expenses.reduce((sum, expense) => sum + expense.totalAmount, 0);
      totalReceipts = expenses.reduce((sum, expense) => sum + expense.receiptCount, 0);

      expenses = expenses.map(expense => ({
        ...expense,
        percentage: totalAmount > 0 ? Math.round((expense.totalAmount / totalAmount) * 100) : 0,
      })).sort((a, b) => b.totalAmount - a.totalAmount);

      // Get additional stats
      const [pendingReceipts, approvedReceipts, rejectedReceipts] = await Promise.all([
        prisma.receipt.count({
          where: {
            status: ReceiptStatus.PENDING,
            createdAt: { gte: startDate, lte: endDate },
          },
        }),
        prisma.receipt.count({
          where: {
            status: ReceiptStatus.APPROVED,
            createdAt: { gte: startDate, lte: endDate },
          },
        }),
        prisma.receipt.count({
          where: {
            status: ReceiptStatus.REJECTED,
            createdAt: { gte: startDate, lte: endDate },
          },
        }),
      ]);

      res.json({
        summary: {
          totalAmount,
          totalReceipts,
          pendingReceipts,
          approvedReceipts,
          rejectedReceipts,
          averageExpense: totalReceipts > 0 ? Math.round(totalAmount / totalReceipts) : 0,
        },
        expenses,
        dateRange: {
          start: formatDate(startDate),
          end: formatDate(endDate),
        },
        groupBy,
      });
    } catch (error) {
      console.error('Error fetching expenses summary:', error);
      res.status(500).json({ error: 'Failed to fetch expenses summary' });
    }
  }

  /**
   * Get dashboard overview stats
   * GET /reports/dashboard-overview
   */
  static async getDashboardOverview(req: Request, res: Response) {
    try {
      const now = new Date();
      const thisMonth = {
        start: startOfMonth(now),
        end: endOfMonth(now),
      };
      const lastMonth = {
        start: startOfMonth(subMonths(now, 1)),
        end: endOfMonth(subMonths(now, 1)),
      };
      const thisYear = {
        start: startOfYear(now),
        end: endOfYear(now),
      };

      // Current month stats
      const [
        thisMonthResult,
        lastMonthResult,
        thisYearResult,
        pendingReceipts,
        totalTrucks,
        activeTrucks,
        totalDrivers,
        recentExpenses,
      ] = await Promise.all([
        // This month expenses
        prisma.expense.aggregate({
          where: {
            createdAt: { gte: thisMonth.start, lte: thisMonth.end },
            status: ExpenseStatus.APPROVED,
          },
          _sum: { amount: true },
          _count: { id: true },
        }),
        
        // Last month expenses
        prisma.expense.aggregate({
          where: {
            createdAt: { gte: lastMonth.start, lte: lastMonth.end },
            status: ExpenseStatus.APPROVED,
          },
          _sum: { amount: true },
          _count: { id: true },
        }),

        // This year expenses
        prisma.expense.aggregate({
          where: {
            createdAt: { gte: thisYear.start, lte: thisYear.end },
            status: ExpenseStatus.APPROVED,
          },
          _sum: { amount: true },
          _count: { id: true },
        }),

        // Pending receipts
        prisma.receipt.count({
          where: { status: ReceiptStatus.PENDING },
        }),

        // Total trucks
        prisma.truck.count(),

        // Active trucks
        prisma.truck.count({
          where: { status: 'IN_USE' },
        }),

        // Total drivers
        prisma.user.count({
          where: { role: 'DRIVER' },
        }),

        // Recent expenses for trend (last 30 days)
        prisma.expense.findMany({
          where: {
            createdAt: { gte: subDays(now, 30) },
            status: ExpenseStatus.APPROVED,
          },
          select: {
            amount: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        }),
      ]);

      // Calculate month-over-month growth
      const thisMonthTotal = thisMonthResult._sum.amount || 0;
      const lastMonthTotal = lastMonthResult._sum.amount || 0;
      const monthGrowth = lastMonthTotal > 0 
        ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)
        : 0;

      // Calculate daily expenses for last 30 days (for sparkline)
      const dailyExpenses = new Map<string, number>();
      for (let i = 29; i >= 0; i--) {
        const date = formatDate(subDays(now, i));
        dailyExpenses.set(date, 0);
      }

      recentExpenses.forEach(expense => {
        const date = formatDate(expense.createdAt);
        if (dailyExpenses.has(date)) {
          dailyExpenses.set(date, dailyExpenses.get(date)! + expense.amount);
        }
      });

      const sparklineData = Array.from(dailyExpenses.entries()).map(([date, amount]) => ({
        date,
        amount,
      }));

      res.json({
        overview: {
          thisMonth: {
            totalAmount: thisMonthTotal,
            totalCount: thisMonthResult._count.id,
            growth: monthGrowth,
          },
          thisYear: {
            totalAmount: thisYearResult._sum.amount || 0,
            totalCount: thisYearResult._count.id,
          },
          pending: {
            receipts: pendingReceipts,
          },
          fleet: {
            totalTrucks,
            activeTrucks,
            utilizationRate: totalTrucks > 0 ? Math.round((activeTrucks / totalTrucks) * 100) : 0,
          },
          drivers: {
            total: totalDrivers,
          },
        },
        sparklineData,
        lastUpdated: now.toISOString(),
      });
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard overview' });
    }
  }

  /**
   * Get detailed expense report data
   * GET /reports/expense-details?start=&end=&truck=&driver=&category=&status=
   */
  static async getExpenseDetails(req: Request, res: Response) {
    try {
      const {
        start,
        end,
        truck,
        driver,
        category,
        status,
        page = '1',
        limit = '50',
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const offset = (pageNum - 1) * limitNum;

      // Build where condition
      const whereCondition: any = {};

      if (start && end) {
        whereCondition.createdAt = {
          gte: startOfDay(new Date(start as string)),
          lte: endOfDay(new Date(end as string)),
        };
      }

      if (truck) {
        whereCondition.truckId = truck;
      }

      if (driver) {
        whereCondition.userId = driver;
      }

      if (category) {
        whereCondition.category = category;
      }

      if (status) {
        whereCondition.status = status;
      }

      // Get expenses with related data
      const [expenses, totalCount] = await Promise.all([
        prisma.expense.findMany({
          where: whereCondition,
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
            [sortBy as string]: sortOrder,
          },
          skip: offset,
          take: limitNum,
        }),
        
        prisma.expense.count({ where: whereCondition }),
      ]);

      const totalPages = Math.ceil(totalCount / limitNum);

      res.json({
        expenses,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1,
        },
      });
    } catch (error) {
      console.error('Error fetching expense details:', error);
      res.status(500).json({ error: 'Failed to fetch expense details' });
    }
  }

  /**
   * Export expenses to CSV
   * GET /reports/export/csv?start=&end=&truck=&driver=&category=&status=
   */
  static async exportExpensesCSV(req: Request, res: Response) {
    try {
      const { start, end, truck, driver, category, status } = req.query;

      // Build where condition (same as getExpenseDetails)
      const whereCondition: any = {};

      if (start && end) {
        whereCondition.createdAt = {
          gte: startOfDay(new Date(start as string)),
          lte: endOfDay(new Date(end as string)),
        };
      }

      if (truck) whereCondition.truckId = truck;
      if (driver) whereCondition.userId = driver;
      if (category) whereCondition.category = category;
      if (status) whereCondition.status = status;

      // Get all matching expenses
      const expenses = await prisma.expense.findMany({
        where: whereCondition,
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
        orderBy: { createdAt: 'desc' },
      });

      // Generate filename
      const dateRange = start && end 
        ? `${formatDate(new Date(start as string))}_to_${formatDate(new Date(end as string))}`
        : formatDate(new Date());
      const filename = `expenses_${dateRange}.csv`;

      // Set response headers
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      // Create CSV header
      const headers = [
        'ID', 'Date', 'Amount', 'Category', 'Description', 'Truck', 'Driver', 
        'Driver Email', 'Status', 'Currency', 'Expense Date'
      ];

      let csvContent = headers.join(',') + '\n';

      // Add data rows
      expenses.forEach(expense => {
        const values = [
          expense.id,
          expense.createdAt.toISOString().split('T')[0],
          expense.amount,
          `"${expense.category}"`,
          `"${expense.description || ''}"`,
          expense.truck ? `"${expense.truck.licensePlate} (${expense.truck.make} ${expense.truck.model})"` : '""',
          `"${expense.user.firstName} ${expense.user.lastName}"`,
          expense.user.email,
          expense.status,
          expense.currency,
          expense.expenseDate.toISOString().split('T')[0]
        ];
        csvContent += values.join(',') + '\n';
      });

      res.send(csvContent);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      res.status(500).json({ error: 'Failed to export CSV' });
    }
  }

  /**
   * Get expense categories with counts
   * GET /reports/categories
   */
  static async getExpenseCategories(req: Request, res: Response) {
    try {
      // Get all expenses to calculate categories manually
      const expenses = await prisma.expense.findMany({
        select: {
          category: true,
          amount: true,
        },
      });

      const categoryMap = new Map();
      expenses.forEach(expense => {
        const category = expense.category;
        if (!categoryMap.has(category)) {
          categoryMap.set(category, { count: 0, totalAmount: 0 });
        }
        const current = categoryMap.get(category);
        current.count += 1;
        current.totalAmount += expense.amount;
      });

      const categories = Array.from(categoryMap.entries())
        .map(([name, data]) => ({
          name,
          count: data.count,
          totalAmount: data.totalAmount,
        }))
        .sort((a, b) => b.totalAmount - a.totalAmount);

      res.json({ categories });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  }
}

export default ReportsController;
