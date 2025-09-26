import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'truck_system.db');

// Ensure the data directory exists
import fs from 'fs';
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new Database(dbPath);

// Initialize the database tables
export function initializeDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      phone TEXT,
      avatar TEXT,
      role TEXT DEFAULT 'DRIVER',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Trucks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS trucks (
      id TEXT PRIMARY KEY,
      truckNumber TEXT UNIQUE NOT NULL,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER NOT NULL,
      vin TEXT UNIQUE NOT NULL,
      licensePlate TEXT UNIQUE NOT NULL,
      fuelType TEXT DEFAULT 'DIESEL',
      status TEXT DEFAULT 'AVAILABLE',
      ownerId TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ownerId) REFERENCES users (id)
    )
  `);

  // Trips table
  db.exec(`
    CREATE TABLE IF NOT EXISTS trips (
      id TEXT PRIMARY KEY,
      startLocation TEXT NOT NULL,
      endLocation TEXT NOT NULL,
      startTime DATETIME NOT NULL,
      endTime DATETIME,
      distance REAL,
      miles REAL,
      status TEXT DEFAULT 'SCHEDULED',
      truckId TEXT NOT NULL,
      driverId TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (truckId) REFERENCES trucks (id),
      FOREIGN KEY (driverId) REFERENCES users (id)
    )
  `);

  // Expenses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      date DATETIME NOT NULL,
      location TEXT,
      vendor TEXT,
      status TEXT DEFAULT 'PENDING',
      tripId TEXT,
      userId TEXT NOT NULL,
      receiptUrl TEXT,
      gallons REAL,
      state TEXT,
      taxPaid REAL DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tripId) REFERENCES trips (id),
      FOREIGN KEY (userId) REFERENCES users (id)
    )
  `);

  // IFTA reports table
  db.exec(`
    CREATE TABLE IF NOT EXISTS ifta_reports (
      id TEXT PRIMARY KEY,
      quarter TEXT NOT NULL,
      year INTEGER NOT NULL,
      totalMiles REAL DEFAULT 0,
      totalFuelPurchased REAL DEFAULT 0,
      netTaxDue REAL DEFAULT 0,
      netRefundDue REAL DEFAULT 0,
      filingStatus TEXT DEFAULT 'DRAFT',
      companyId TEXT,
      generatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      submittedAt DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed some basic data
  const userCheck = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCheck.count === 0) {
    // Create a default admin user
    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    
    db.prepare(`
      INSERT INTO users (id, email, password, firstName, lastName, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('admin-1', 'admin@truck.com', hashedPassword, 'Admin', 'User', 'ADMIN');

    // Create a test driver
    db.prepare(`
      INSERT INTO users (id, email, password, firstName, lastName, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('driver-1', 'driver@truck.com', bcrypt.hashSync('driver123', 10), 'Test', 'Driver', 'DRIVER');

    // Create a test truck
    db.prepare(`
      INSERT INTO trucks (id, truckNumber, make, model, year, vin, licensePlate, ownerId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run('truck-1', 'TRK001', 'Freightliner', 'Cascadia', 2020, 'VIN123456789', 'ABC123', 'admin-1');

    console.log('✅ Database initialized with seed data');
  }
}

export default db;
