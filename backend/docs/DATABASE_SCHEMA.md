# Database Schema Documentation

## Overview
The Truck Monitoring System uses PostgreSQL with Prisma ORM. The schema is designed to manage users, trucks, trips, expenses, receipts, invoices, and maintenance records with comprehensive audit trails.

## Core Models

### User
Central user model supporting role-based access control.
- **Roles**: ADMIN, MANAGER, DRIVER
- **Key Fields**: email (unique), password (hashed), firstName, lastName, role, isActive
- **Relations**: Can own trucks, drive trucks, create trips, upload receipts, etc.

### DriverProfile
Extended profile for drivers with licensing and contact information.
- **Key Fields**: licenseNumber (unique), licenseExpiry, licenseClass, contactNumber
- **Relations**: One-to-one with User, one-to-many with Trips

### Truck
Fleet vehicle management with status tracking.
- **Key Fields**: licensePlate (unique), make, model, year, vin, capacity, status
- **Enums**: 
  - FuelType: DIESEL, PETROL, ELECTRIC, HYBRID
  - TruckStatus: AVAILABLE, IN_USE, MAINTENANCE, OUT_OF_SERVICE
- **Relations**: Assigned driver, owner, trips, maintenance records

### Trip
Individual journey tracking with scheduling and completion data.
- **Key Fields**: tripNumber (unique), start/end locations, scheduled/actual times, distances
- **Enums**: TripStatus: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, DELAYED
- **Relations**: Truck, driver, driverProfile, receipts, expenses

### Receipt
Uploaded receipt management with OCR metadata and approval workflow.
- **Key Fields**: fileName, filePath, amount, category, status
- **Enums**: 
  - ReceiptStatus: PENDING, APPROVED, REJECTED, PROCESSING
  - ExpenseCategory: FUEL, TOLL, PARKING, MAINTENANCE, DELIVERY, FOOD, ACCOMMODATION, MISC
- **Relations**: Trip (optional), uploaded by User, approved by User, Truck

### Expense
Categorized expense tracking with approval workflow.
- **Key Fields**: amount, category, description, expenseDate, status
- **Enums**: ExpenseStatus: PENDING, APPROVED, REJECTED, REIMBURSED
- **Relations**: Trip (optional), Truck (optional), User

### Invoice
Client billing and payment tracking.
- **Key Fields**: invoiceNumber (unique), clientName, amount, invoiceDate, dueDate, status
- **Enums**: InvoiceStatus: DRAFT, SENT, PAID, OVERDUE, CANCELLED
- **Relations**: Created by User

### MaintenanceRecord
Vehicle maintenance scheduling and tracking.
- **Key Fields**: type, description, cost, scheduledDate, completedDate, status
- **Enums**: 
  - MaintenanceType: ROUTINE, REPAIR, INSPECTION, EMERGENCY, PREVENTIVE
  - MaintenanceStatus: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, OVERDUE
- **Relations**: Truck, User (who scheduled)

### AuditLog
Comprehensive audit trail for all system changes.
- **Key Fields**: action, entity, entityId, oldValues, newValues, ip, userAgent
- **Relations**: User (who performed action)

## Key Features

### 1. Role-Based Access Control
- **ADMIN**: Full system access
- **MANAGER**: Fleet management, expense approval, reporting
- **DRIVER**: Trip management, receipt upload, expense submission

### 2. Receipt Processing
- File upload with metadata extraction
- OCR data storage in JSON fields
- Approval workflow with rejection reasons
- Integration with expense tracking

### 3. Expense Management
- Categorized expense tracking
- Multi-level approval process
- Trip and truck association
- Tagging system for flexible categorization

### 4. Fleet Management
- Vehicle assignment and tracking
- Maintenance scheduling
- Status management
- Insurance information storage

### 5. Trip Planning & Tracking
- Scheduled vs actual time tracking
- Distance calculation
- Status progression
- Associated expenses and receipts

### 6. Audit Trail
- Complete change tracking
- User action logging
- IP and user agent capture
- JSON storage for flexible data

## Sample Data

The seed script creates:
- **Users**: 1 Admin, 1 Manager, 2 Drivers
- **Trucks**: 2 vehicles with different specifications
- **Trip**: 1 completed trip from Chicago to Denver
- **Receipt**: 1 approved fuel receipt with OCR metadata
- **Expense**: 1 approved fuel expense
- **Invoice**: 1 sent invoice for transportation services
- **Maintenance**: 1 completed routine maintenance record

### Test Credentials
- **Admin**: admin@truckmonitor.com / SecurePass123!
- **Manager**: manager@truckmonitor.com / SecurePass123!
- **Driver 1**: driver@truckmonitor.com / SecurePass123!
- **Driver 2**: driver2@truckmonitor.com / SecurePass123!

## Database Setup

### Using Script (Recommended)
```bash
# Windows
./setup-db.bat

# Linux/macOS
chmod +x setup-db.sh
./setup-db.sh
```

### Manual Setup
```bash
# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
# Then run:

npm install
npx prisma generate
npx prisma migrate dev --name "initial_schema"
npx prisma db seed
```

### Commands
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run migrate

# Seed database
npm run db:seed

# Reset database (WARNING: Deletes all data)
npm run db:reset

# Open Prisma Studio
npm run db:studio
```

## Environment Variables

Required in `.env`:
```
DATABASE_URL="postgresql://username:password@localhost:5432/truck_monitoring?schema=public"
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"
```

## Indexing Strategy

The schema includes strategic indexes for:
- Unique constraints on business keys (email, licensePlate, licenseNumber, etc.)
- Foreign key relationships for optimal join performance
- Composite indexes where needed for query optimization

## Security Considerations

1. **Passwords**: Hashed using bcrypt with salt rounds of 12
2. **Soft Deletes**: Users are marked inactive rather than deleted
3. **Audit Trail**: All significant actions are logged
4. **Role Separation**: Clear separation of duties between roles
5. **Data Validation**: Comprehensive validation at database level

This schema provides a robust foundation for a comprehensive truck monitoring and expense management system.
