import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean up existing data (in correct order to avoid FK constraints)
  await prisma.auditLog.deleteMany();
  await prisma.receipt.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.maintenanceRecord.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.driverProfile.deleteMany();
  await prisma.truck.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing data');

  // Hash password for users
  const hashedPassword = await bcrypt.hash('SecurePass123!', 12);

  // Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@truckmonitor.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Admin',
      phone: '+1-555-0100',
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('👤 Created admin user:', adminUser.email);

  // Create Manager User
  const managerUser = await prisma.user.create({
    data: {
      email: 'manager@truckmonitor.com',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Manager',
      phone: '+1-555-0101',
      role: 'MANAGER',
      isActive: true,
    },
  });

  console.log('👤 Created manager user:', managerUser.email);

  // Create Driver User
  const driverUser = await prisma.user.create({
    data: {
      email: 'driver@truckmonitor.com',
      password: hashedPassword,
      firstName: 'Mike',
      lastName: 'Driver',
      phone: '+1-555-0102',
      role: 'DRIVER',
      isActive: true,
    },
  });

  console.log('👤 Created driver user:', driverUser.email);

  // Create Driver Profile
  const driverProfile = await prisma.driverProfile.create({
    data: {
      userId: driverUser.id,
      licenseNumber: 'CDL-123456789',
      licenseExpiry: new Date('2026-12-31'),
      licenseClass: 'Class A',
      contactNumber: '+1-555-0102',
      emergencyContact: '+1-555-0999',
      address: '123 Driver St, City, State 12345',
      dateOfBirth: new Date('1985-06-15'),
      hireDate: new Date('2023-01-15'),
      status: 'ACTIVE',
    },
  });

  console.log('🆔 Created driver profile for:', driverUser.firstName);

  // Create Truck
  const truck = await prisma.truck.create({
    data: {
      licensePlate: 'TRK-2024-001',
      make: 'Freightliner',
      model: 'Cascadia',
      year: 2022,
      vin: '1FUJGHDV8NLAA1234',
      capacity: 26.0, // 26 tons
      fuelType: 'DIESEL',
      mileage: 45000.0,
      status: 'AVAILABLE',
      driverId: driverUser.id,
      ownerId: managerUser.id,
      insuranceInfo: {
        provider: 'TruckSafe Insurance',
        policyNumber: 'POL-7891234',
        expiryDate: '2025-08-15',
        coverage: 'Full Coverage',
      },
    },
  });

  console.log('🚛 Created truck:', truck.licensePlate);

  // Create Trip
  const trip = await prisma.trip.create({
    data: {
      tripNumber: 'TRIP-2024-001',
      truckId: truck.id,
      driverId: driverUser.id,
      driverProfileId: driverProfile.id,
      startLocation: 'Chicago, IL',
      endLocation: 'Denver, CO',
      scheduledStartTime: new Date('2024-09-20T08:00:00Z'),
      actualStartTime: new Date('2024-09-20T08:15:00Z'),
      scheduledEndTime: new Date('2024-09-21T16:00:00Z'),
      actualEndTime: new Date('2024-09-21T15:45:00Z'),
      estimatedDistance: 920.0,
      actualDistance: 925.5,
      status: 'COMPLETED',
      notes: 'Delivery completed successfully. No issues encountered.',
    },
  });

  console.log('🛣️ Created trip:', trip.tripNumber);

  // Create Receipt
  const receipt = await prisma.receipt.create({
    data: {
      fileName: 'fuel_receipt_001.jpg',
      filePath: '/uploads/receipts/2024/09/fuel_receipt_001.jpg',
      fileSize: 256000,
      mimeType: 'image/jpeg',
      amount: 245.67,
      currency: 'USD',
      description: 'Fuel purchase - Shell Station Denver',
      category: 'FUEL',
      receiptDate: new Date('2024-09-21T10:30:00Z'),
      status: 'APPROVED',
      tripId: trip.id,
      uploadedById: driverUser.id,
      approvedById: managerUser.id,
      approvedAt: new Date('2024-09-21T18:00:00Z'),
      truckId: truck.id,
      metadata: {
        ocrText: 'Shell Gas Station - Total: $245.67 - Fuel Type: Diesel',
        location: 'Denver, CO',
        extractedData: {
          gallons: 65.4,
          pricePerGallon: 3.76,
        },
      },
    },
  });

  console.log('🧾 Created receipt:', receipt.fileName);

  // Create Expense
  const expense = await prisma.expense.create({
    data: {
      amount: 245.67,
      currency: 'USD',
      category: 'FUEL',
      description: 'Fuel purchase for trip to Denver',
      expenseDate: new Date('2024-09-21T10:30:00Z'),
      tripId: trip.id,
      truckId: truck.id,
      userId: driverUser.id,
      receiptUrl: '/uploads/receipts/2024/09/fuel_receipt_001.jpg',
      status: 'APPROVED',
      approvedAt: new Date('2024-09-21T18:00:00Z'),
      approvedBy: managerUser.id,
      tags: ['fuel', 'diesel', 'denver'],
      metadata: {
        gallons: 65.4,
        pricePerGallon: 3.76,
        station: 'Shell',
      },
    },
  });

  console.log('💰 Created expense:', expense.description);

  // Create Invoice
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2024-001',
      clientName: 'ABC Logistics Corp',
      clientEmail: 'billing@abclogistics.com',
      amount: 2850.00,
      currency: 'USD',
      description: 'Transportation services - Chicago to Denver route',
      invoiceDate: new Date('2024-09-22T00:00:00Z'),
      dueDate: new Date('2024-10-22T00:00:00Z'),
      status: 'SENT',
      userId: managerUser.id,
      metadata: {
        tripId: trip.id,
        distance: 925.5,
        ratePerMile: 3.08,
        fuelSurcharge: 125.00,
      },
    },
  });

  console.log('📄 Created invoice:', invoice.invoiceNumber);

  // Create Maintenance Record
  const maintenanceRecord = await prisma.maintenanceRecord.create({
    data: {
      truckId: truck.id,
      type: 'ROUTINE',
      description: 'Oil change and tire rotation',
      cost: 350.00,
      currency: 'USD',
      scheduledDate: new Date('2024-09-25T09:00:00Z'),
      completedDate: new Date('2024-09-25T11:30:00Z'),
      status: 'COMPLETED',
      performedBy: 'Mike\'s Truck Service',
      userId: managerUser.id,
      notes: 'All filters replaced. Tires rotated. Next service due at 50,000 miles.',
      nextDueDate: new Date('2024-12-25T00:00:00Z'),
      mileage: 45000.0,
    },
  });

  console.log('🔧 Created maintenance record for truck:', truck.licensePlate);

  // Create Audit Log
  const auditLog = await prisma.auditLog.create({
    data: {
      userId: managerUser.id,
      action: 'APPROVE_RECEIPT',
      entity: 'Receipt',
      entityId: receipt.id,
      oldValues: {
        status: 'PENDING',
        approvedById: null,
        approvedAt: null,
      },
      newValues: {
        status: 'APPROVED',
        approvedById: managerUser.id,
        approvedAt: new Date('2024-09-21T18:00:00Z'),
      },
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });

  console.log('📋 Created audit log entry');

  // Create additional sample data for better testing
  
  // Additional Driver
  const driver2 = await prisma.user.create({
    data: {
      email: 'driver2@truckmonitor.com',
      password: hashedPassword,
      firstName: 'Lisa',
      lastName: 'Rodriguez',
      phone: '+1-555-0103',
      role: 'DRIVER',
      isActive: true,
    },
  });

  const driverProfile2 = await prisma.driverProfile.create({
    data: {
      userId: driver2.id,
      licenseNumber: 'CDL-987654321',
      licenseExpiry: new Date('2027-03-31'),
      licenseClass: 'Class A',
      contactNumber: '+1-555-0103',
      emergencyContact: '+1-555-0888',
      address: '456 Trucker Ave, City, State 54321',
      dateOfBirth: new Date('1990-09-22'),
      hireDate: new Date('2023-03-01'),
      status: 'ACTIVE',
    },
  });

  // Additional Truck
  const truck2 = await prisma.truck.create({
    data: {
      licensePlate: 'TRK-2024-002',
      make: 'Kenworth',
      model: 'T680',
      year: 2023,
      vin: '1XKDD49X0NJ123456',
      capacity: 25.0,
      fuelType: 'DIESEL',
      mileage: 12000.0,
      status: 'IN_USE',
      driverId: driver2.id,
      ownerId: managerUser.id,
      insuranceInfo: {
        provider: 'Fleet Insurance Plus',
        policyNumber: 'POL-1122334',
        expiryDate: '2025-12-31',
        coverage: 'Comprehensive',
      },
    },
  });

  console.log('🚛 Created second truck:', truck2.licensePlate);

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Users: 3 (1 Admin, 1 Manager, 2 Drivers)`);
  console.log(`- Driver Profiles: 2`);
  console.log(`- Trucks: 2`);
  console.log(`- Trips: 1`);
  console.log(`- Receipts: 1`);
  console.log(`- Expenses: 1`);
  console.log(`- Invoices: 1`);
  console.log(`- Maintenance Records: 1`);
  console.log(`- Audit Logs: 1`);
  console.log('\n🔐 Test Credentials:');
  console.log(`Admin: admin@truckmonitor.com / SecurePass123!`);
  console.log(`Manager: manager@truckmonitor.com / SecurePass123!`);
  console.log(`Driver 1: driver@truckmonitor.com / SecurePass123!`);
  console.log(`Driver 2: driver2@truckmonitor.com / SecurePass123!`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
