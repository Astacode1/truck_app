import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authGuard';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import SQLiteIFTAService from '../services/sqliteIftaService';
import { z } from 'zod';

// Validation schemas
const quarterlyReportSchema = z.object({
  quarter: z.enum(['Q1', 'Q2', 'Q3', 'Q4']),
  year: z.number().min(2020).max(2030).optional(),
  companyId: z.string().optional(),
});

const tripSegmentSchema = z.object({
  state: z.string().length(2),
  miles: z.number().positive(),
  startMileage: z.number().min(0),
  endMileage: z.number().min(0),
  entryPoint: z.string().optional(),
  exitPoint: z.string().optional(),
});

const addTripSegmentsSchema = z.object({
  tripId: z.string(),
  segments: z.array(tripSegmentSchema),
});

export class IFTAController {
  private static iftaService = new SQLiteIFTAService();

  /**
   * GET /api/ifta/current-quarter
   * Get current quarter information
   */
  static getCurrentQuarter = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const quarter = IFTAController.iftaService.getCurrentQuarter();
    
    res.json({
      success: true,
      message: 'Current quarter retrieved successfully',
      data: { quarter }
    });
  });

  /**
   * GET /api/ifta/reports/quarterly?quarter=Q3&year=2024
   * Generate quarterly IFTA report
   */
  static generateQuarterlyReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || (userRole !== 'ADMIN' && userRole !== 'MANAGER')) {
      throw new AppError('Access denied. Admin or manager role required.', 403);
    }

    const { quarter, year, companyId } = req.query;

    // Validate query parameters
    const validation = quarterlyReportSchema.safeParse({
      quarter,
      year: year ? parseInt(year as string) : undefined,
      companyId: companyId || undefined
    });

    if (!validation.success) {
      throw new AppError('Invalid parameters: ' + validation.error.message, 400);
    }

    const { quarter: validQuarter, year: validYear, companyId: validCompanyId } = validation.data;

    try {
      const report = await IFTAController.iftaService.generateQuarterlyReport(validQuarter, validYear || new Date().getFullYear(), validCompanyId);

      res.json({
        success: true,
        message: 'Quarterly IFTA report generated successfully',
        data: { report }
      });
    } catch (error) {
      throw new AppError('Failed to generate IFTA report: ' + (error as Error).message, 500);
    }
  });

  /**
   * GET /api/ifta/reports/quarterly/export?quarter=Q3&year=2024&format=txt
   * Export quarterly IFTA report
   */
  static exportQuarterlyReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || (userRole !== 'ADMIN' && userRole !== 'MANAGER')) {
      throw new AppError('Access denied. Admin or manager role required.', 403);
    }

    const { quarter, year, companyId, format = 'txt' } = req.query;

    // Validate query parameters
    const validation = quarterlyReportSchema.safeParse({
      quarter,
      year: year ? parseInt(year as string) : undefined,
      companyId: companyId || undefined
    });

    if (!validation.success) {
      throw new AppError('Invalid parameters: ' + validation.error.message, 400);
    }

    const { quarter: validQuarter, year: validYear, companyId: validCompanyId } = validation.data;

    try {
      const report = await IFTAController.iftaService.generateQuarterlyReport(validQuarter, validYear || new Date().getFullYear(), validCompanyId);
      const formattedReport = IFTAController.iftaService.formatReportForExport(report);

      // Generate filename
      const filename = `IFTA_${validQuarter}_${validYear || new Date().getFullYear()}_${validCompanyId || 'company'}.${format}`;

      // Set response headers
      if (format === 'txt') {
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(formattedReport);
      } else if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.json({
          report,
          formattedReport,
          exportedAt: new Date().toISOString()
        });
      } else {
        throw new AppError('Unsupported export format. Use: txt, json', 400);
      }
    } catch (error) {
      throw new AppError('Failed to export IFTA report: ' + (error as Error).message, 500);
    }
  });

  /**
   * GET /api/ifta/compliance-status
   * Get IFTA compliance status
   */
  static getComplianceStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || (userRole !== 'ADMIN' && userRole !== 'MANAGER')) {
      throw new AppError('Access denied. Admin or manager role required.', 403);
    }

    const { companyId } = req.query;

    try {
      const status = await IFTAController.iftaService.getComplianceStatus(companyId as string);

      res.json({
        success: true,
        message: 'Compliance status retrieved successfully',
        data: { status }
      });
    } catch (error) {
      throw new AppError('Failed to get compliance status: ' + (error as Error).message, 500);
    }
  });

  /**
   * GET /api/ifta/state-tax-rates
   * Get current IFTA state tax rates
   */
  static getStateTaxRates = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { state } = req.query;

    try {
      const taxRates = await IFTAController.iftaService.getStateTaxRates();
      
      if (state) {
        const stateRate = taxRates.find(rate => rate.state === state);
        if (!stateRate) {
          throw new AppError(`Tax rate not found for state: ${state}`, 404);
        }
        
        res.json({
          success: true,
          message: 'State tax rate retrieved successfully',
          data: { 
            state: state as string,
            rate: stateRate.rate,
            effectiveDate: stateRate.effective_date,
            isActive: stateRate.is_active
          }
        });
      } else {
        // Return all rates
        const rates = taxRates.map(rate => ({
          state: rate.state,
          rate: rate.rate,
          effectiveDate: rate.effective_date,
          isActive: rate.is_active
        }));

        res.json({
          success: true,
          message: 'All state tax rates retrieved successfully',
          data: { rates }
        });
      }
    } catch (error) {
      throw new AppError('Failed to get state tax rates: ' + (error as Error).message, 500);
    }
  });

  /**
   * GET /api/ifta/trips/:tripId/segments
   * Get trip segments by state for a specific trip
   */
  static getTripSegments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { tripId } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    try {
      const segments = await IFTAController.iftaService.getTripSegments(tripId);

      res.json({
        success: true,
        message: 'Trip segments retrieved successfully',
        data: { tripId, segments }
      });
    } catch (error) {
      throw new AppError('Failed to get trip segments: ' + (error as Error).message, 500);
    }
  });

  /**
   * GET /api/ifta/fuel-purchases?startDate=2024-07-01&endDate=2024-09-30
   * Get fuel purchases for IFTA reporting
   */
  static getFuelPurchases = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || (userRole !== 'ADMIN' && userRole !== 'MANAGER' && userRole !== 'DRIVER')) {
      throw new AppError('Access denied', 403);
    }

    const { startDate, endDate, truckId } = req.query;

    if (!startDate || !endDate) {
      throw new AppError('Start date and end date are required', 400);
    }

    try {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new AppError('Invalid date format', 400);
      }

      const fuelPurchases = await IFTAController.iftaService.getFuelPurchases(start.toISOString(), end.toISOString(), truckId as string);

      res.json({
        success: true,
        message: 'Fuel purchases retrieved successfully',
        data: { 
          fuelPurchases,
          summary: {
            totalPurchases: fuelPurchases.length,
            totalGallons: fuelPurchases.reduce((sum, p) => sum + p.gallons, 0),
            totalAmount: fuelPurchases.reduce((sum, p) => sum + p.totalAmount, 0),
            totalTaxPaid: fuelPurchases.reduce((sum, p) => sum + p.taxPaid, 0)
          }
        }
      });
    } catch (error) {
      throw new AppError('Failed to get fuel purchases: ' + (error as Error).message, 500);
    }
  });

  /**
   * GET /api/ifta/calculator/quick
   * Quick IFTA tax calculation
   */
  static quickCalculation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { state, miles, fuel } = req.query;

    if (!state || !miles || !fuel) {
      throw new AppError('State, miles, and fuel parameters are required', 400);
    }

    try {
      const { IFTA_STATE_TAX_RATES } = await import('../models/ifta.models');
      const stateRate = IFTA_STATE_TAX_RATES[state as string];

      if (!stateRate) {
        throw new AppError(`Invalid state code: ${state}`, 400);
      }

      const milesNum = parseFloat(miles as string);
      const fuelNum = parseFloat(fuel as string);

      if (isNaN(milesNum) || isNaN(fuelNum) || milesNum < 0 || fuelNum < 0) {
        throw new AppError('Miles and fuel must be valid positive numbers', 400);
      }

      const taxOwed = fuelNum * stateRate.rate;
      const mpg = milesNum / (fuelNum || 1);

      res.json({
        success: true,
        message: 'IFTA tax calculated successfully',
        data: {
          state: state as string,
          miles: milesNum,
          fuel: fuelNum,
          taxRate: stateRate.rate,
          taxOwed: Math.round(taxOwed * 100) / 100,
          mpg: Math.round(mpg * 10) / 10,
          calculation: {
            formula: `${fuelNum} gallons × $${stateRate.rate}/gallon = $${taxOwed.toFixed(2)}`,
            lastUpdated: stateRate.lastUpdated
          }
        }
      });
    } catch (error) {
      throw new AppError('Failed to calculate IFTA tax: ' + (error as Error).message, 500);
    }
  });

  /**
   * GET /api/ifta/dashboard/summary
   * Get IFTA dashboard summary
   */
  static getDashboardSummary = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || (userRole !== 'ADMIN' && userRole !== 'MANAGER')) {
      throw new AppError('Access denied. Admin or manager role required.', 403);
    }

    try {
      const currentQuarter = IFTAController.iftaService.getCurrentQuarter();
      const complianceStatus = await IFTAController.iftaService.getComplianceStatus();
      
      // Get recent fuel purchases for current month
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const recentFuelPurchases = await IFTAController.iftaService.getFuelPurchases(monthStart.toISOString(), monthEnd.toISOString());
      
      // Get quarter dates for due date calculation  
      const quarterDates = (IFTAController.iftaService as any).getQuarterDates(currentQuarter.quarter, currentQuarter.year);
      
      const summary = {
        currentQuarter: {
          quarter: currentQuarter.quarter,
          year: currentQuarter.year,
          startDate: quarterDates.startDate,
          endDate: quarterDates.endDate,
          dueDate: quarterDates.dueDate,
          daysUntilDue: Math.ceil((quarterDates.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        },
        compliance: complianceStatus,
        thisMonthActivity: {
          fuelPurchases: recentFuelPurchases.length,
          totalGallons: recentFuelPurchases.reduce((sum, p) => sum + p.gallons, 0),
          totalSpent: recentFuelPurchases.reduce((sum, p) => sum + p.totalAmount, 0),
          totalTaxPaid: recentFuelPurchases.reduce((sum, p) => sum + p.taxPaid, 0),
          statesCovered: [...new Set(recentFuelPurchases.map(p => p.state))].length
        }
      };

      res.json({
        success: true,
        message: 'IFTA dashboard summary retrieved successfully',
        data: { summary }
      });
    } catch (error) {
      throw new AppError('Failed to get dashboard summary: ' + (error as Error).message, 500);
    }
  });
}

export default IFTAController;
