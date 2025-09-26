// IFTA (International Fuel Tax Agreement) Data Models
// These extend the existing Prisma schema with IFTA-specific functionality

export interface IFTAJurisdiction {
  state: string;
  stateCode: string;
  taxRate: number; // cents per gallon
  isIFTAMember: boolean;
}

export interface IFTAQuarter {
  year: number;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  startDate: Date;
  endDate: Date;
  dueDate: Date;
}

export interface IFTATripSegment {
  id: string;
  tripId: string;
  state: string;
  miles: number;
  startMileage: number;
  endMileage: number;
  entryPoint?: string;
  exitPoint?: string;
  createdAt: Date;
}

export interface IFTAFuelPurchase {
  id: string;
  receiptId: string;
  tripId?: string;
  truckId: string;
  state: string;
  gallons: number;
  pricePerGallon: number;
  totalAmount: number;
  taxPaid: number;
  purchaseDate: Date;
  location: string;
  vendor?: string;
}

export interface IFTAQuarterlyReport {
  id: string;
  companyId: string;
  year: number;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  totalMiles: number;
  totalGallons: number;
  jurisdictionData: IFTAJurisdictionData[];
  netTaxDue: number;
  netRefundDue: number;
  filingStatus: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  submittedDate?: Date;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFTAJurisdictionData {
  state: string;
  totalMiles: number;
  taxPaidGallons: number;
  taxFreeGallons: number;
  computedGallons: number;
  averageMPG: number;
  taxRate: number;
  grossTax: number;
  netTax: number;
  fuelTaxPaid: number;
  taxDue: number;
  refundDue: number;
}

export interface IFTAStateTaxRates {
  [state: string]: {
    rate: number; // per gallon
    effectiveDate: Date;
    lastUpdated: Date;
  };
}

// Default IFTA state tax rates (as of 2024)
export const IFTA_STATE_TAX_RATES: IFTAStateTaxRates = {
  'AL': { rate: 0.19, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'AK': { rate: 0.14, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'AZ': { rate: 0.19, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'AR': { rate: 0.2225, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'CA': { rate: 0.40, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'CO': { rate: 0.2025, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'CT': { rate: 0.40, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'DE': { rate: 0.22, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'FL': { rate: 0.14, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'GA': { rate: 0.326, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'HI': { rate: 0.19, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'ID': { rate: 0.33, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'IL': { rate: 0.454, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'IN': { rate: 0.54, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'IA': { rate: 0.315, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'KS': { rate: 0.27, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'KY': { rate: 0.236, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'LA': { rate: 0.20, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'ME': { rate: 0.316, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'MD': { rate: 0.36, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'MA': { rate: 0.26, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'MI': { rate: 0.316, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'MN': { rate: 0.286, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'MS': { rate: 0.18, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'MO': { rate: 0.17, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'MT': { rate: 0.2775, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'NE': { rate: 0.265, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'NV': { rate: 0.27, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'NH': { rate: 0.262, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'NJ': { rate: 0.415, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'NM': { rate: 0.21, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'NY': { rate: 0.456, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'NC': { rate: 0.38, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'ND': { rate: 0.23, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'OH': { rate: 0.47, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'OK': { rate: 0.19, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'OR': { rate: 0.36, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'PA': { rate: 0.613, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'RI': { rate: 0.35, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'SC': { rate: 0.22, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'SD': { rate: 0.30, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'TN': { rate: 0.27, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'TX': { rate: 0.20, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'UT': { rate: 0.315, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'VT': { rate: 0.31, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'VA': { rate: 0.262, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'WA': { rate: 0.494, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'WV': { rate: 0.355, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'WI': { rate: 0.329, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'WY': { rate: 0.24, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') },
  'DC': { rate: 0.235, effectiveDate: new Date('2024-01-01'), lastUpdated: new Date('2024-01-01') }
};

export const IFTA_QUARTERS: { [key: string]: IFTAQuarter } = {
  'Q1': {
    year: new Date().getFullYear(),
    quarter: 'Q1',
    startDate: new Date(new Date().getFullYear(), 0, 1), // Jan 1
    endDate: new Date(new Date().getFullYear(), 2, 31), // Mar 31
    dueDate: new Date(new Date().getFullYear(), 3, 30), // Apr 30
  },
  'Q2': {
    year: new Date().getFullYear(),
    quarter: 'Q2',
    startDate: new Date(new Date().getFullYear(), 3, 1), // Apr 1
    endDate: new Date(new Date().getFullYear(), 5, 30), // Jun 30
    dueDate: new Date(new Date().getFullYear(), 6, 31), // Jul 31
  },
  'Q3': {
    year: new Date().getFullYear(),
    quarter: 'Q3',
    startDate: new Date(new Date().getFullYear(), 6, 1), // Jul 1
    endDate: new Date(new Date().getFullYear(), 8, 30), // Sep 30
    dueDate: new Date(new Date().getFullYear(), 9, 31), // Oct 31
  },
  'Q4': {
    year: new Date().getFullYear(),
    quarter: 'Q4',
    startDate: new Date(new Date().getFullYear(), 9, 1), // Oct 1
    endDate: new Date(new Date().getFullYear(), 11, 31), // Dec 31
    dueDate: new Date(new Date().getFullYear() + 1, 0, 31), // Jan 31 next year
  }
};
