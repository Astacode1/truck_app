import { PrismaClient } from '@prisma/client';
import {
  IFTAQuarter,
  IFTAQuarterlyReport,
  IFTAJurisdictionData,
  IFTATripSegment,
  IFTAFuelPurchase,
  IFTA_STATE_TAX_RATES,
  IFTA_QUARTERS
} from '../models/ifta.models';

const prisma = new PrismaClient();

export class IFTAService {
  /**
   * Get the current quarter information
   */
  static getCurrentQuarter(): IFTAQuarter {
    const now = new Date();
    const month = now.getMonth();
    
    if (month <= 2) return IFTA_QUARTERS.Q1;
    if (month <= 5) return IFTA_QUARTERS.Q2;
    if (month <= 8) return IFTA_QUARTERS.Q3;
    return IFTA_QUARTERS.Q4;
  }

  /**
   * Get quarter information by quarter and year
   */
  static getQuarter(quarter: string, year?: number): IFTAQuarter {
    const quarterYear = year || new Date().getFullYear();
    const baseQuarter = IFTA_QUARTERS[quarter];
    
    return {
      ...baseQuarter,
      year: quarterYear,
      startDate: new Date(quarterYear, baseQuarter.startDate.getMonth(), baseQuarter.startDate.getDate()),
      endDate: new Date(quarterYear, baseQuarter.endDate.getMonth(), baseQuarter.endDate.getDate()),
      dueDate: quarter === 'Q4' 
        ? new Date(quarterYear + 1, 0, 31) 
        : new Date(quarterYear, baseQuarter.dueDate.getMonth(), baseQuarter.dueDate.getDate()),
    };
  }

  /**
   * Extract trip segments by state from trip data
   * This would be enhanced with actual GPS tracking or manual entry
   */
  static async extractTripSegments(tripId: string): Promise<IFTATripSegment[]> {
    // For now, this is a placeholder that would be enhanced with:
    // 1. GPS tracking integration
    // 2. ELD (Electronic Logging Device) integration
    // 3. Manual state entry by drivers
    // 4. Route calculation based on start/end locations
    
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        truck: true
      }
    });

    if (!trip || !trip.actualDistance) {
      return [];
    }

    // Placeholder logic - in a real system, this would come from GPS/ELD data
    // For demonstration, we'll simulate some trip segments
    const segments: IFTATripSegment[] = [
      {
        id: `${tripId}_segment_1`,
        tripId,
        state: 'GA',
        miles: trip.actualDistance * 0.4,
        startMileage: trip.truck?.mileage || 0,
        endMileage: (trip.truck?.mileage || 0) + (trip.actualDistance * 0.4),
        entryPoint: 'Atlanta',
        exitPoint: 'Macon',
        createdAt: new Date()
      },
      {
        id: `${tripId}_segment_2`,
        tripId,
        state: 'FL',
        miles: trip.actualDistance * 0.6,
        startMileage: (trip.truck?.mileage || 0) + (trip.actualDistance * 0.4),
        endMileage: (trip.truck?.mileage || 0) + trip.actualDistance,
        entryPoint: 'Valdosta',
        exitPoint: 'Jacksonville',
        createdAt: new Date()
      }
    ];

    return segments;
  }

  /**
   * Extract fuel purchase data from receipts
   */
  static async extractFuelPurchases(startDate: Date, endDate: Date, truckId?: string): Promise<IFTAFuelPurchase[]> {
    const whereClause: any = {
      createdAt: {
        gte: startDate,
        lte: endDate
      },
      category: 'FUEL',
      status: 'APPROVED'
    };

    if (truckId) {
      whereClause.truckId = truckId;
    }

    const fuelExpenses = await prisma.expense.findMany({
      where: whereClause,
      include: {
        truck: true,
        trip: true
      }
    });

    const fuelPurchases: IFTAFuelPurchase[] = fuelExpenses.map(expense => {
      // Extract gallons and location from description or use default calculations
      const gallons = this.estimateGallonsFromAmount(expense.amount);
      const pricePerGallon = gallons > 0 ? expense.amount / gallons : 0;
      const state = this.extractStateFromDescription(expense.description) || 'GA';
      const taxRate = IFTA_STATE_TAX_RATES[state]?.rate || 0;
      const taxPaid = gallons * taxRate;

      return {
        id: `fuel_${expense.id}`,
        receiptId: expense.id,
        tripId: expense.tripId || undefined,
        truckId: expense.truckId || '',
        state,
        gallons,
        pricePerGallon,
        totalAmount: expense.amount,
        taxPaid,
        purchaseDate: expense.expenseDate,
        location: this.extractLocationFromDescription(expense.description) || 'Unknown',
        vendor: this.extractVendorFromDescription(expense.description) || undefined
      };
    });

    return fuelPurchases;
  }

  /**
   * Generate quarterly IFTA report
   */
  static async generateQuarterlyReport(quarter: string, year?: number, companyId?: string): Promise<IFTAQuarterlyReport> {
    const quarterInfo = this.getQuarter(quarter, year);
    const { startDate, endDate } = quarterInfo;

    // Get all trips in the quarter
    const trips = await prisma.trip.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: 'COMPLETED'
      },
      include: {
        truck: true,
        expenses: {
          where: {
            category: 'FUEL',
            status: 'APPROVED'
          }
        }
      }
    });

    // Get all fuel purchases for the quarter
    const fuelPurchases = await this.extractFuelPurchases(startDate, endDate);

    // Calculate jurisdiction data by state
    const jurisdictionMap = new Map<string, IFTAJurisdictionData>();

    // Initialize all IFTA states
    Object.keys(IFTA_STATE_TAX_RATES).forEach(state => {
      jurisdictionMap.set(state, {
        state,
        totalMiles: 0,
        taxPaidGallons: 0,
        taxFreeGallons: 0,
        computedGallons: 0,
        averageMPG: 6.5, // Default average
        taxRate: IFTA_STATE_TAX_RATES[state].rate,
        grossTax: 0,
        netTax: 0,
        fuelTaxPaid: 0,
        taxDue: 0,
        refundDue: 0
      });
    });

    // Process trips to calculate miles by state
    for (const trip of trips) {
      if (!trip.actualDistance) continue;

      // For demo purposes, distribute miles across states
      // In real implementation, this would come from GPS/ELD data
      const segments = await this.extractTripSegments(trip.id);
      
      segments.forEach(segment => {
        const jurisdiction = jurisdictionMap.get(segment.state);
        if (jurisdiction) {
          jurisdiction.totalMiles += segment.miles;
        }
      });
    }

    // Process fuel purchases
    fuelPurchases.forEach(purchase => {
      const jurisdiction = jurisdictionMap.get(purchase.state);
      if (jurisdiction) {
        jurisdiction.taxPaidGallons += purchase.gallons;
        jurisdiction.fuelTaxPaid += purchase.taxPaid;
      }
    });

    // Calculate computed gallons, taxes, and due/refund amounts
    const jurisdictionData: IFTAJurisdictionData[] = Array.from(jurisdictionMap.values())
      .map(jurisdiction => {
        // Calculate computed gallons based on miles and MPG
        jurisdiction.computedGallons = jurisdiction.totalMiles / jurisdiction.averageMPG;
        
        // Calculate gross tax
        jurisdiction.grossTax = jurisdiction.computedGallons * jurisdiction.taxRate;
        jurisdiction.netTax = jurisdiction.grossTax;
        
        // Calculate tax due or refund
        const difference = jurisdiction.grossTax - jurisdiction.fuelTaxPaid;
        if (difference > 0) {
          jurisdiction.taxDue = difference;
          jurisdiction.refundDue = 0;
        } else {
          jurisdiction.taxDue = 0;
          jurisdiction.refundDue = Math.abs(difference);
        }

        return jurisdiction;
      })
      .filter(jurisdiction => jurisdiction.totalMiles > 0 || jurisdiction.taxPaidGallons > 0);

    // Calculate totals
    const totalMiles = jurisdictionData.reduce((sum, j) => sum + j.totalMiles, 0);
    const totalGallons = jurisdictionData.reduce((sum, j) => sum + j.taxPaidGallons, 0);
    const netTaxDue = jurisdictionData.reduce((sum, j) => sum + j.taxDue, 0);
    const netRefundDue = jurisdictionData.reduce((sum, j) => sum + j.refundDue, 0);

    const report: IFTAQuarterlyReport = {
      id: `ifta_${quarter.toLowerCase()}_${year || quarterInfo.year}_${Date.now()}`,
      companyId: companyId || 'default_company',
      year: year || quarterInfo.year,
      quarter: quarterInfo.quarter,
      totalMiles,
      totalGallons,
      jurisdictionData,
      netTaxDue,
      netRefundDue,
      filingStatus: 'DRAFT',
      dueDate: quarterInfo.dueDate,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return report;
  }

  /**
   * Get formatted IFTA report for export
   */
  static formatReportForExport(report: IFTAQuarterlyReport): string {
    const reportText = `
INTERNATIONAL FUEL TAX AGREEMENT
QUARTERLY FUEL TAX RETURN
===============================================

REPORTING PERIOD: ${report.quarter} ${report.year}
DUE DATE: ${report.dueDate.toLocaleDateString()}

FLEET SUMMARY:
Total Miles: ${report.totalMiles.toLocaleString()}
Total Fuel: ${report.totalGallons.toLocaleString()} gallons
Average MPG: ${(report.totalMiles / report.totalGallons).toFixed(1)}

JURISDICTION DETAILS:
===============================================
State | Miles    | Fuel(gal) | Tax Rate | Gross Tax | Tax Paid | Tax Due | Refund
------|----------|-----------|----------|-----------|----------|---------|--------
${report.jurisdictionData.map(j => 
  `${j.state.padEnd(5)} | ${j.totalMiles.toLocaleString().padEnd(8)} | ${j.computedGallons.toFixed(0).padEnd(9)} | $${j.taxRate.toFixed(3).padEnd(7)} | $${j.grossTax.toFixed(2).padEnd(8)} | $${j.fuelTaxPaid.toFixed(2).padEnd(7)} | $${j.taxDue.toFixed(2).padEnd(6)} | $${j.refundDue.toFixed(2)}`
).join('\n')}

SUMMARY:
===============================================
Total Gross Tax: $${report.jurisdictionData.reduce((sum, j) => sum + j.grossTax, 0).toFixed(2)}
Total Tax Paid: $${report.jurisdictionData.reduce((sum, j) => sum + j.fuelTaxPaid, 0).toFixed(2)}
Total Tax Due: $${report.netTaxDue.toFixed(2)}
Total Refund Due: $${report.netRefundDue.toFixed(2)}
Net Balance: $${(report.netTaxDue - report.netRefundDue).toFixed(2)} ${(report.netTaxDue - report.netRefundDue) >= 0 ? '(DUE)' : '(REFUND)'}

Generated on: ${new Date().toLocaleDateString()}
`;

    return reportText.trim();
  }

  /**
   * Get IFTA compliance status for fleet
   */
  static async getComplianceStatus(companyId?: string) {
    const currentQuarter = this.getCurrentQuarter();
    const previousQuarter = this.getPreviousQuarter();

    const [currentReport, previousReport] = await Promise.all([
      this.generateQuarterlyReport(currentQuarter.quarter, currentQuarter.year, companyId),
      this.generateQuarterlyReport(previousQuarter.quarter, previousQuarter.year, companyId)
    ]);

    const upcomingDeadline = this.getNextFilingDeadline();
    const daysUntilDeadline = Math.ceil((upcomingDeadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    return {
      currentQuarter: {
        quarter: currentReport.quarter,
        year: currentReport.year,
        status: currentReport.filingStatus,
        netTaxDue: currentReport.netTaxDue,
        netRefundDue: currentReport.netRefundDue,
        totalMiles: currentReport.totalMiles
      },
      previousQuarter: {
        quarter: previousReport.quarter,
        year: previousReport.year,
        status: previousReport.filingStatus,
        netTaxDue: previousReport.netTaxDue,
        netRefundDue: previousReport.netRefundDue,
        totalMiles: previousReport.totalMiles
      },
      upcomingDeadline,
      daysUntilDeadline,
      complianceScore: this.calculateComplianceScore(currentReport, previousReport)
    };
  }

  // Helper methods
  private static estimateGallonsFromAmount(amount: number): number {
    // Estimate based on average fuel price (this would be more sophisticated in real system)
    const avgPricePerGallon = 4.50; // This would come from market data
    return amount / avgPricePerGallon;
  }

  private static extractStateFromDescription(description?: string): string | null {
    if (!description) return null;
    
    // Look for state codes in the description
    const stateRegex = /\b([A-Z]{2})\b/g;
    const matches = description.match(stateRegex);
    
    if (matches) {
      // Return first valid state found
      for (const match of matches) {
        if (IFTA_STATE_TAX_RATES[match]) {
          return match;
        }
      }
    }
    
    return null;
  }

  private static extractLocationFromDescription(description?: string): string | null {
    if (!description) return null;
    
    // Basic location extraction - would be more sophisticated in real system
    const locationRegex = /(?:at|in|@)\s+([A-Za-z\s,]+)/i;
    const match = description.match(locationRegex);
    
    return match ? match[1].trim() : null;
  }

  private static extractVendorFromDescription(description?: string): string | null {
    if (!description) return null;
    
    // Common fuel vendors
    const vendors = ['Shell', 'Exxon', 'BP', 'Chevron', 'Mobil', 'Citgo', 'Phillips 66', 'Speedway', 'Pilot', 'Flying J', 'TA', 'Love\'s'];
    
    for (const vendor of vendors) {
      if (description.toLowerCase().includes(vendor.toLowerCase())) {
        return vendor;
      }
    }
    
    return null;
  }

  private static getPreviousQuarter(): IFTAQuarter {
    const current = this.getCurrentQuarter();
    const quarters = ['Q4', 'Q1', 'Q2', 'Q3'];
    const currentIndex = quarters.indexOf(current.quarter);
    const prevQuarter = quarters[currentIndex];
    const year = prevQuarter === 'Q4' ? current.year - 1 : current.year;
    
    return this.getQuarter(prevQuarter, year);
  }

  private static getNextFilingDeadline(): Date {
    const current = this.getCurrentQuarter();
    return current.dueDate;
  }

  private static calculateComplianceScore(current: IFTAQuarterlyReport, previous: IFTAQuarterlyReport): number {
    // Simple compliance scoring based on various factors
    let score = 100;
    
    // Deduct points for missing data
    if (current.totalMiles === 0) score -= 30;
    if (current.totalGallons === 0) score -= 20;
    if (current.jurisdictionData.length === 0) score -= 25;
    
    // Deduct points for inconsistent data
    const avgMPG = current.totalMiles / (current.totalGallons || 1);
    if (avgMPG < 4 || avgMPG > 12) score -= 15; // Unrealistic MPG
    
    return Math.max(0, score);
  }
}
