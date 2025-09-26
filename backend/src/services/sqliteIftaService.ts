import db from '../config/sqlite';
import { 
  IFTAQuarterlyReport, 
  IFTAJurisdictionData, 
  IFTAFuelPurchase, 
  IFTATripSegment,
  IFTAStateTaxRates,
  IFTA_STATE_TAX_RATES
} from '../models/ifta.models';

// Simplified IFTA Service using direct SQLite queries
class SQLiteIFTAService {
  
  async initializeTables() {
    console.log('IFTA Service initialized - using SQLite database');
  }

  async getStateTaxRates(): Promise<IFTAStateTaxRates[]> {
    return Object.entries(IFTA_STATE_TAX_RATES).map(([state, rate]) => ({
      state,
      rate,
      effectiveDate: '2024-01-01',
      updatedAt: new Date()
    }));
  }

  async getStateTaxRate(state: string): Promise<number> {
    const rates = await this.getStateTaxRates();
    const stateRate = rates.find(r => r.state === state);
    return stateRate?.rate || 0;
  }

  // Simulate trip segments based on trip data
  async getTripSegments(tripId: string): Promise<IFTATripSegment[]> {
    const trip: any = db.prepare(`
      SELECT * FROM trips WHERE id = ?
    `).get(tripId);

    if (!trip || !trip.distance) {
      return [];
    }

    // Simulate segments - in a real system this would come from GPS/ELD data
    const segments: IFTATripSegment[] = [
      {
        id: `${tripId}_segment_1`,
        tripId,
        state: 'GA',
        miles: trip.distance * 0.6,
        startMileage: 0,
        endMileage: trip.distance * 0.6,
        entryPoint: 'Atlanta',
        exitPoint: 'Macon',
        date: new Date(trip.startTime)
      },
      {
        id: `${tripId}_segment_2`,
        tripId,
        state: 'FL',
        miles: trip.distance * 0.4,
        startMileage: trip.distance * 0.6,
        endMileage: trip.distance,
        entryPoint: 'Valdosta',
        exitPoint: 'Jacksonville',
        date: new Date(trip.startTime)
      }
    ];

    return segments;
  }

  async getFuelPurchases(startDate: string, endDate: string, truckId?: string): Promise<IFTAFuelPurchase[]> {
    let query = `
      SELECT e.*, t.truckId FROM expenses e
      LEFT JOIN trips t ON e.tripId = t.id
      WHERE e.category = 'FUEL' 
      AND e.date >= ? AND e.date <= ?
    `;
    const params: any[] = [startDate, endDate];
    
    if (truckId) {
      query += ` AND (t.truckId = ? OR e.description LIKE ?)`;
      params.push(truckId, `%${truckId}%`);
    }

    const expenses = db.prepare(query).all(...params) as any[];

    return expenses.map(expense => ({
      id: expense.id,
      date: new Date(expense.date),
      state: this.extractStateFromDescription(expense.description) || expense.state || 'GA',
      gallons: expense.gallons || this.estimateGallonsFromAmount(expense.amount),
      totalAmount: expense.amount,
      taxPaid: expense.taxPaid || 0,
      vendor: this.extractVendorFromDescription(expense.description) || expense.vendor || 'Unknown',
      location: this.extractLocationFromDescription(expense.description) || expense.location || 'Unknown',
      receiptUrl: expense.receiptUrl,
      truckId: expense.truckId || 'unknown'
    }));
  }

  getCurrentQuarter() {
    const now = new Date();
    const month = now.getMonth();
    
    if (month <= 2) return { quarter: 'Q1', year: now.getFullYear() };
    if (month <= 5) return { quarter: 'Q2', year: now.getFullYear() };
    if (month <= 8) return { quarter: 'Q3', year: now.getFullYear() };
    return { quarter: 'Q4', year: now.getFullYear() };
  }

  getQuarterDates(quarter: string, year: number) {
    const quarters = {
      'Q1': { start: [0, 1], end: [2, 31], due: [4, 31] },  // Jan-Mar, due Apr 30
      'Q2': { start: [3, 1], end: [5, 30], due: [6, 31] },  // Apr-Jun, due Jul 31
      'Q3': { start: [6, 1], end: [8, 30], due: [9, 31] },  // Jul-Sep, due Oct 31
      'Q4': { start: [9, 1], end: [11, 31], due: [0, 31] }  // Oct-Dec, due Jan 31 next year
    };

    const q = quarters[quarter as keyof typeof quarters];
    if (!q) throw new Error('Invalid quarter');

    const startDate = new Date(year, q.start[0], q.start[1]);
    const endDate = new Date(year, q.end[0], q.end[1]);
    const dueDate = new Date(
      quarter === 'Q4' ? year + 1 : year, 
      q.due[0], 
      q.due[1]
    );

    return { startDate, endDate, dueDate };
  }

  async getComplianceStatus(companyId?: string) {
    const currentQuarter = this.getCurrentQuarter();
    
    return {
      currentQuarter: {
        quarter: currentQuarter.quarter,
        year: currentQuarter.year,
        status: 'DRAFT',
        netTaxDue: 0,
        netRefundDue: 0,
        totalMiles: 0
      },
      upcomingDeadline: new Date(),
      daysUntilDeadline: 30,
      complianceScore: 75
    };
  }

  async generateQuarterlyReport(quarter: string, year: number, companyId?: string): Promise<IFTAQuarterlyReport> {
    const reportId = `ifta_${quarter}_${year}_${companyId || 'default'}_${Date.now()}`;
    
    return {
      id: reportId,
      quarter,
      year,
      companyId: companyId || 'default',
      totalMiles: 0,
      totalFuelPurchased: 0,
      totalTaxPaid: 0,
      totalTaxOwed: 0,
      netTaxDue: 0,
      netRefundDue: 0,
      filingStatus: 'DRAFT',
      jurisdictions: [],
      generatedAt: new Date(),
      dueDate: new Date(),
      submittedAt: null
    };
  }

  private estimateGallonsFromAmount(amount: number): number {
    const avgPricePerGallon = 4.50;
    return amount / avgPricePerGallon;
  }

  private extractStateFromDescription(description?: string): string | null {
    if (!description) return null;
    
    const stateRegex = /\b([A-Z]{2})\b/g;
    const matches = description.match(stateRegex);
    
    if (matches) {
      for (const match of matches) {
        if (IFTA_STATE_TAX_RATES[match]) {
          return match;
        }
      }
    }
    
    return null;
  }

  private extractLocationFromDescription(description?: string): string | null {
    if (!description) return null;
    
    const locationRegex = /(?:at|in|@)\s+([A-Za-z\s,]+)/i;
    const match = description.match(locationRegex);
    
    return match ? match[1].trim() : null;
  }

  private extractVendorFromDescription(description?: string): string | null {
    if (!description) return null;
    
    const vendors = ['Shell', 'Exxon', 'BP', 'Chevron', 'Mobil'];
    
    for (const vendor of vendors) {
      if (description.toLowerCase().includes(vendor.toLowerCase())) {
        return vendor;
      }
    }
    
    return null;
  }

  async formatReportForExport(reportId: string): Promise<any> {
    return {
      reportId,
      exportFormat: 'JSON',
      generatedAt: new Date()
    };
  }
}

export default SQLiteIFTAService;
