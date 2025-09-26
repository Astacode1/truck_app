-- SQLite-compatible schema for IFTA functionality
-- This will be applied as a migration to add IFTA support

-- IFTA Trip Segments - tracks miles driven in each state
CREATE TABLE IF NOT EXISTS ifta_trip_segments (
    id TEXT PRIMARY KEY,
    trip_id TEXT NOT NULL,
    state TEXT NOT NULL,
    miles REAL NOT NULL DEFAULT 0,
    start_mileage REAL NOT NULL DEFAULT 0,
    end_mileage REAL NOT NULL DEFAULT 0,
    entry_point TEXT,
    exit_point TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

-- IFTA Fuel Purchases - enhanced fuel expense tracking
CREATE TABLE IF NOT EXISTS ifta_fuel_purchases (
    id TEXT PRIMARY KEY,
    receipt_id TEXT UNIQUE NOT NULL,
    trip_id TEXT,
    truck_id TEXT NOT NULL,
    state TEXT NOT NULL,
    gallons REAL NOT NULL DEFAULT 0,
    price_per_gallon REAL NOT NULL DEFAULT 0,
    total_amount REAL NOT NULL DEFAULT 0,
    tax_paid REAL NOT NULL DEFAULT 0,
    purchase_date DATETIME NOT NULL,
    location TEXT NOT NULL,
    vendor TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (receipt_id) REFERENCES receipts(id) ON DELETE CASCADE,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL,
    FOREIGN KEY (truck_id) REFERENCES trucks(id)
);

-- IFTA Quarterly Reports
CREATE TABLE IF NOT EXISTS ifta_quarterly_reports (
    id TEXT PRIMARY KEY,
    company_id TEXT,
    year INTEGER NOT NULL,
    quarter TEXT NOT NULL, -- Q1, Q2, Q3, Q4
    total_miles REAL DEFAULT 0,
    total_gallons REAL DEFAULT 0,
    net_tax_due REAL DEFAULT 0,
    net_refund_due REAL DEFAULT 0,
    filing_status TEXT DEFAULT 'DRAFT', -- DRAFT, SUBMITTED, APPROVED, REJECTED, AMENDED
    submitted_date DATETIME,
    due_date DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, year, quarter)
);

-- IFTA Jurisdiction Data - detailed breakdown by state
CREATE TABLE IF NOT EXISTS ifta_jurisdiction_data (
    id TEXT PRIMARY KEY,
    report_id TEXT NOT NULL,
    state TEXT NOT NULL,
    total_miles REAL DEFAULT 0,
    tax_paid_gallons REAL DEFAULT 0,
    tax_free_gallons REAL DEFAULT 0,
    computed_gallons REAL DEFAULT 0,
    average_mpg REAL DEFAULT 6.5,
    tax_rate REAL NOT NULL,
    gross_tax REAL DEFAULT 0,
    net_tax REAL DEFAULT 0,
    fuel_tax_paid REAL DEFAULT 0,
    tax_due REAL DEFAULT 0,
    refund_due REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES ifta_quarterly_reports(id) ON DELETE CASCADE,
    UNIQUE(report_id, state)
);

-- IFTA State Tax Rates - historical tracking of tax rates
CREATE TABLE IF NOT EXISTS ifta_state_tax_rates (
    id TEXT PRIMARY KEY,
    state TEXT NOT NULL,
    rate REAL NOT NULL,
    effective_date DATETIME NOT NULL,
    end_date DATETIME,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(state, effective_date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ifta_trip_segments_trip_id ON ifta_trip_segments(trip_id);
CREATE INDEX IF NOT EXISTS idx_ifta_trip_segments_state ON ifta_trip_segments(state);
CREATE INDEX IF NOT EXISTS idx_ifta_trip_segments_created_at ON ifta_trip_segments(created_at);

CREATE INDEX IF NOT EXISTS idx_ifta_fuel_purchases_receipt_id ON ifta_fuel_purchases(receipt_id);
CREATE INDEX IF NOT EXISTS idx_ifta_fuel_purchases_trip_id ON ifta_fuel_purchases(trip_id);
CREATE INDEX IF NOT EXISTS idx_ifta_fuel_purchases_truck_id ON ifta_fuel_purchases(truck_id);
CREATE INDEX IF NOT EXISTS idx_ifta_fuel_purchases_state ON ifta_fuel_purchases(state);
CREATE INDEX IF NOT EXISTS idx_ifta_fuel_purchases_purchase_date ON ifta_fuel_purchases(purchase_date);

CREATE INDEX IF NOT EXISTS idx_ifta_quarterly_reports_year_quarter ON ifta_quarterly_reports(year, quarter);
CREATE INDEX IF NOT EXISTS idx_ifta_quarterly_reports_filing_status ON ifta_quarterly_reports(filing_status);
CREATE INDEX IF NOT EXISTS idx_ifta_quarterly_reports_due_date ON ifta_quarterly_reports(due_date);

CREATE INDEX IF NOT EXISTS idx_ifta_jurisdiction_data_report_id ON ifta_jurisdiction_data(report_id);
CREATE INDEX IF NOT EXISTS idx_ifta_jurisdiction_data_state ON ifta_jurisdiction_data(state);

CREATE INDEX IF NOT EXISTS idx_ifta_state_tax_rates_state_active ON ifta_state_tax_rates(state, is_active);
CREATE INDEX IF NOT EXISTS idx_ifta_state_tax_rates_effective_date ON ifta_state_tax_rates(effective_date);

-- Insert current IFTA state tax rates (2024)
INSERT OR REPLACE INTO ifta_state_tax_rates (id, state, rate, effective_date, is_active) VALUES
('rate_AL_2024', 'AL', 0.19, '2024-01-01', 1),
('rate_AK_2024', 'AK', 0.14, '2024-01-01', 1),
('rate_AZ_2024', 'AZ', 0.19, '2024-01-01', 1),
('rate_AR_2024', 'AR', 0.2225, '2024-01-01', 1),
('rate_CA_2024', 'CA', 0.40, '2024-01-01', 1),
('rate_CO_2024', 'CO', 0.2025, '2024-01-01', 1),
('rate_CT_2024', 'CT', 0.40, '2024-01-01', 1),
('rate_DE_2024', 'DE', 0.22, '2024-01-01', 1),
('rate_FL_2024', 'FL', 0.14, '2024-01-01', 1),
('rate_GA_2024', 'GA', 0.326, '2024-01-01', 1),
('rate_HI_2024', 'HI', 0.19, '2024-01-01', 1),
('rate_ID_2024', 'ID', 0.33, '2024-01-01', 1),
('rate_IL_2024', 'IL', 0.454, '2024-01-01', 1),
('rate_IN_2024', 'IN', 0.54, '2024-01-01', 1),
('rate_IA_2024', 'IA', 0.315, '2024-01-01', 1),
('rate_KS_2024', 'KS', 0.27, '2024-01-01', 1),
('rate_KY_2024', 'KY', 0.236, '2024-01-01', 1),
('rate_LA_2024', 'LA', 0.20, '2024-01-01', 1),
('rate_ME_2024', 'ME', 0.316, '2024-01-01', 1),
('rate_MD_2024', 'MD', 0.36, '2024-01-01', 1),
('rate_MA_2024', 'MA', 0.26, '2024-01-01', 1),
('rate_MI_2024', 'MI', 0.316, '2024-01-01', 1),
('rate_MN_2024', 'MN', 0.286, '2024-01-01', 1),
('rate_MS_2024', 'MS', 0.18, '2024-01-01', 1),
('rate_MO_2024', 'MO', 0.17, '2024-01-01', 1),
('rate_MT_2024', 'MT', 0.2775, '2024-01-01', 1),
('rate_NE_2024', 'NE', 0.265, '2024-01-01', 1),
('rate_NV_2024', 'NV', 0.27, '2024-01-01', 1),
('rate_NH_2024', 'NH', 0.262, '2024-01-01', 1),
('rate_NJ_2024', 'NJ', 0.415, '2024-01-01', 1),
('rate_NM_2024', 'NM', 0.21, '2024-01-01', 1),
('rate_NY_2024', 'NY', 0.456, '2024-01-01', 1),
('rate_NC_2024', 'NC', 0.38, '2024-01-01', 1),
('rate_ND_2024', 'ND', 0.23, '2024-01-01', 1),
('rate_OH_2024', 'OH', 0.47, '2024-01-01', 1),
('rate_OK_2024', 'OK', 0.19, '2024-01-01', 1),
('rate_OR_2024', 'OR', 0.36, '2024-01-01', 1),
('rate_PA_2024', 'PA', 0.613, '2024-01-01', 1),
('rate_RI_2024', 'RI', 0.35, '2024-01-01', 1),
('rate_SC_2024', 'SC', 0.22, '2024-01-01', 1),
('rate_SD_2024', 'SD', 0.30, '2024-01-01', 1),
('rate_TN_2024', 'TN', 0.27, '2024-01-01', 1),
('rate_TX_2024', 'TX', 0.20, '2024-01-01', 1),
('rate_UT_2024', 'UT', 0.315, '2024-01-01', 1),
('rate_VT_2024', 'VT', 0.31, '2024-01-01', 1),
('rate_VA_2024', 'VA', 0.262, '2024-01-01', 1),
('rate_WA_2024', 'WA', 0.494, '2024-01-01', 1),
('rate_WV_2024', 'WV', 0.355, '2024-01-01', 1),
('rate_WI_2024', 'WI', 0.329, '2024-01-01', 1),
('rate_WY_2024', 'WY', 0.24, '2024-01-01', 1),
('rate_DC_2024', 'DC', 0.235, '2024-01-01', 1);
