import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authGuard';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { PrismaClient, TripStatus, UserRole } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createTripSchema = z.object({
  truckId: z.string().min(1, 'Truck ID is required'),
  driverId: z.string().min(1, 'Driver ID is required'),
  startLocation: z.string().min(1, 'Start location is required'),
  endLocation: z.string().min(1, 'End location is required'),
  scheduledStartTime: z.string().datetime('Invalid start time format'),
  scheduledEndTime: z.string().datetime('Invalid end time format').optional(),
  estimatedDistance: z.number().positive('Distance must be positive').optional(),
  notes: z.string().optional(),
});

const updateTripSchema = z.object({
  truckId: z.string().optional(),
  driverId: z.string().optional(),
  startLocation: z.string().optional(),
  endLocation: z.string().optional(),
  scheduledStartTime: z.string().datetime().optional(),
  scheduledEndTime: z.string().datetime().optional(),
  actualStartTime: z.string().datetime().optional(),
  actualEndTime: z.string().datetime().optional(),
  estimatedDistance: z.number().positive().optional(),
  actualDistance: z.number().positive().optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DELAYED']).optional(),
  notes: z.string().optional(),
});

const assignDriverSchema = z.object({
  driverId: z.string().min(1, 'Driver ID is required'),
  notes: z.string().optional(),
});

export interface CreateTripRequest {
  truckId: string;
  driverId: string;
  startLocation: string;
  endLocation: string;
  scheduledStartTime: string;
  scheduledEndTime?: string;
  estimatedDistance?: number;
  notes?: string;
}

export interface UpdateTripRequest {
  truckId?: string;
  driverId?: string;
  startLocation?: string;
  endLocation?: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  estimatedDistance?: number;
  actualDistance?: number;
  status?: TripStatus;
  notes?: string;
}

export interface AssignDriverRequest {
  driverId: string;
  notes?: string;
}

export class TripController {
  /**
   * POST /api/trips
   * Create a new trip
   */
  static createTrip = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    // Check permissions
    if (!userId || (userRole !== 'ADMIN' && userRole !== 'MANAGER')) {
      throw new AppError('Access denied. Admin or manager role required.', 403);
    }

    // Validate request body
    const validation = createTripSchema.safeParse(req.body);
    if (!validation.success) {
      throw new AppError('Invalid trip data: ' + validation.error.message, 400);
    }

    const tripData = validation.data;

    // Verify truck exists and is available
    const truck = await prisma.truck.findUnique({
      where: { id: tripData.truckId },
      include: {
        trips: {
          where: {
            status: {
              in: ['SCHEDULED', 'IN_PROGRESS', 'DELAYED']
            }
          }
        }
      }
    });

    if (!truck) {
      throw new AppError('Truck not found', 404);
    }

    if (truck.status !== 'AVAILABLE') {
      throw new AppError('Truck is not available for assignment', 400);
    }

    // Check for overlapping trips
    const scheduledStart = new Date(tripData.scheduledStartTime);
    const scheduledEnd = tripData.scheduledEndTime ? new Date(tripData.scheduledEndTime) : null;

    if (scheduledEnd && scheduledStart >= scheduledEnd) {
      throw new AppError('Scheduled end time must be after start time', 400);
    }

    const overlappingTrips = await prisma.trip.findMany({
      where: {
        truckId: tripData.truckId,
        status: {
          in: ['SCHEDULED', 'IN_PROGRESS', 'DELAYED']
        },
        OR: [
          {
            scheduledStartTime: {
              lte: scheduledEnd || scheduledStart,
            },
            scheduledEndTime: {
              gte: scheduledStart,
            }
          },
          {
            scheduledStartTime: {
              lte: scheduledStart,
            },
            scheduledEndTime: null,
          }
        ]
      }
    });

    if (overlappingTrips.length > 0) {
      throw new AppError('Truck has conflicting trips during this time period', 400);
    }

    // Verify driver exists and has valid profile
    const driver = await prisma.user.findUnique({
      where: { id: tripData.driverId },
      include: {
        driverProfile: true,
      }
    });

    if (!driver) {
      throw new AppError('Driver not found', 404);
    }

    if (driver.role !== 'DRIVER') {
      throw new AppError('Selected user is not a driver', 400);
    }

    if (!driver.driverProfile) {
      throw new AppError('Driver profile not found', 404);
    }

    if (driver.driverProfile.status !== 'ACTIVE') {
      throw new AppError('Driver is not active', 400);
    }

    // Create the trip
    const result = await prisma.$transaction(async (tx) => {
      const trip = await tx.trip.create({
        data: {
          truckId: tripData.truckId,
          driverId: tripData.driverId,
          driverProfileId: driver.driverProfile!.id,
          startLocation: tripData.startLocation,
          endLocation: tripData.endLocation,
          scheduledStartTime: scheduledStart,
          scheduledEndTime: scheduledEnd,
          estimatedDistance: tripData.estimatedDistance,
          notes: tripData.notes,
          status: 'SCHEDULED',
        },
        include: {
          truck: true,
          driver: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          driverProfile: true,
        },
      });

      // Update truck status
      await tx.truck.update({
        where: { id: tripData.truckId },
        data: { status: 'IN_USE' },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'TRIP_CREATED',
          entity: 'Trip',
          entityId: trip.id,
          oldValues: undefined,
          newValues: {
            tripNumber: trip.tripNumber,
            truckId: trip.truckId,
            driverId: trip.driverId,
            startLocation: trip.startLocation,
            endLocation: trip.endLocation,
            scheduledStartTime: trip.scheduledStartTime,
          },
          ip: req.ip,
          userAgent: req.get('User-Agent'),
        },
      });

      return trip;
    });

    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      data: { trip: result },
    });
  });

  /**
   * GET /api/trips
   * Get all trips with filtering and pagination
   */
  static getTrips = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    const {
      page = 1,
      limit = 20,
      status,
      truckId,
      driverId,
      dateFrom,
      dateTo,
      search,
      sortBy = 'scheduledStartTime',
      sortOrder = 'desc',
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = {};

    // Role-based filtering
    if (userRole === 'DRIVER') {
      where.driverId = userId;
    }

    if (status) {
      where.status = status;
    }

    if (truckId) {
      where.truckId = truckId;
    }

    if (driverId && (userRole === 'ADMIN' || userRole === 'MANAGER')) {
      where.driverId = driverId;
    }

    if (dateFrom || dateTo) {
      where.scheduledStartTime = {};
      if (dateFrom) where.scheduledStartTime.gte = new Date(dateFrom as string);
      if (dateTo) where.scheduledStartTime.lte = new Date(dateTo as string);
    }

    if (search) {
      where.OR = [
        { tripNumber: { contains: search as string, mode: 'insensitive' } },
        { startLocation: { contains: search as string, mode: 'insensitive' } },
        { endLocation: { contains: search as string, mode: 'insensitive' } },
        { truck: { licensePlate: { contains: search as string, mode: 'insensitive' } } },
        { driver: { firstName: { contains: search as string, mode: 'insensitive' } } },
        { driver: { lastName: { contains: search as string, mode: 'insensitive' } } },
      ];
    }

    // Get trips with pagination
    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        include: {
          truck: {
            select: { id: true, licensePlate: true, make: true, model: true, year: true }
          },
          driver: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          driverProfile: {
            select: { id: true, licenseNumber: true, status: true }
          },
          receipts: {
            select: { id: true, amount: true, status: true }
          },
          expenses: {
            select: { id: true, amount: true, category: true }
          }
        },
        orderBy: { [sortBy as string]: sortOrder },
        skip,
        take: Number(limit),
      }),
      prisma.trip.count({ where })
    ]);

    res.json({
      success: true,
      message: 'Trips retrieved successfully',
      data: {
        trips,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  });

  /**
   * GET /api/trips/:id
   * Get a specific trip by ID
   */
  static getTripById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        truck: true,
        driver: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true }
        },
        driverProfile: true,
        receipts: {
          include: {
            uploadedBy: {
              select: { id: true, firstName: true, lastName: true }
            }
          }
        },
        expenses: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true }
            }
          }
        }
      },
    });

    if (!trip) {
      throw new AppError('Trip not found', 404);
    }

    // Check permissions - drivers can only view their own trips
    if (userRole === 'DRIVER' && trip.driverId !== userId) {
      throw new AppError('Access denied. You can only view your own trips.', 403);
    }

    res.json({
      success: true,
      message: 'Trip retrieved successfully',
      data: { trip },
    });
  });

  /**
   * PATCH /api/trips/:id
   * Update a trip
   */
  static updateTrip = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    // Check permissions
    if (!userId || (userRole !== 'ADMIN' && userRole !== 'MANAGER')) {
      throw new AppError('Access denied. Admin or manager role required.', 403);
    }

    // Validate request body
    const validation = updateTripSchema.safeParse(req.body);
    if (!validation.success) {
      throw new AppError('Invalid trip data: ' + validation.error.message, 400);
    }

    const updateData = validation.data;

    // Get current trip
    const currentTrip = await prisma.trip.findUnique({
      where: { id },
      include: {
        truck: true,
        driver: true,
        driverProfile: true,
      },
    });

    if (!currentTrip) {
      throw new AppError('Trip not found', 404);
    }

    // Validate status transitions
    if (updateData.status) {
      const validTransitions: Record<string, string[]> = {
        SCHEDULED: ['IN_PROGRESS', 'CANCELLED', 'DELAYED'],
        IN_PROGRESS: ['COMPLETED', 'CANCELLED', 'DELAYED'],
        DELAYED: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
        COMPLETED: [], // Cannot change from completed
        CANCELLED: [], // Cannot change from cancelled
      };

      const allowedStatuses = validTransitions[currentTrip.status];
      if (!allowedStatuses.includes(updateData.status)) {
        throw new AppError(`Invalid status transition from ${currentTrip.status} to ${updateData.status}`, 400);
      }
    }

    // Update the trip
    const result = await prisma.$transaction(async (tx) => {
      const updatedTrip = await tx.trip.update({
        where: { id },
        data: {
          ...updateData,
          scheduledStartTime: updateData.scheduledStartTime ? new Date(updateData.scheduledStartTime) : undefined,
          scheduledEndTime: updateData.scheduledEndTime ? new Date(updateData.scheduledEndTime) : undefined,
          actualStartTime: updateData.actualStartTime ? new Date(updateData.actualStartTime) : undefined,
          actualEndTime: updateData.actualEndTime ? new Date(updateData.actualEndTime) : undefined,
        },
        include: {
          truck: true,
          driver: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          driverProfile: true,
        },
      });

      // Update truck status based on trip status
      if (updateData.status) {
        let truckStatus = currentTrip.truck.status;
        
        if (updateData.status === 'IN_PROGRESS') {
          truckStatus = 'IN_USE';
        } else if (updateData.status === 'COMPLETED' || updateData.status === 'CANCELLED') {
          truckStatus = 'AVAILABLE';
        }

        if (truckStatus !== currentTrip.truck.status) {
          await tx.truck.update({
            where: { id: currentTrip.truckId },
            data: { status: truckStatus },
          });
        }
      }

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'TRIP_UPDATED',
          entity: 'Trip',
          entityId: id,
          oldValues: {
            status: currentTrip.status,
            startLocation: currentTrip.startLocation,
            endLocation: currentTrip.endLocation,
            scheduledStartTime: currentTrip.scheduledStartTime,
            scheduledEndTime: currentTrip.scheduledEndTime,
          },
          newValues: updateData,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
        },
      });

      return updatedTrip;
    });

    res.json({
      success: true,
      message: 'Trip updated successfully',
      data: { trip: result },
    });
  });

  /**
   * DELETE /api/trips/:id
   * Delete a trip (only if not started)
   */
  static deleteTrip = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    // Check permissions
    if (!userId || (userRole !== 'ADMIN' && userRole !== 'MANAGER')) {
      throw new AppError('Access denied. Admin or manager role required.', 403);
    }

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: { truck: true },
    });

    if (!trip) {
      throw new AppError('Trip not found', 404);
    }

    // Only allow deletion of scheduled trips
    if (trip.status !== 'SCHEDULED') {
      throw new AppError('Only scheduled trips can be deleted', 400);
    }

    // Delete the trip in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.trip.delete({
        where: { id },
      });

      // Update truck status back to available
      await tx.truck.update({
        where: { id: trip.truckId },
        data: { status: 'AVAILABLE' },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'TRIP_DELETED',
          entity: 'Trip',
          entityId: id,
          oldValues: {
            tripNumber: trip.tripNumber,
            truckId: trip.truckId,
            driverId: trip.driverId,
            status: trip.status,
          },
          newValues: undefined,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
        },
      });
    });

    res.json({
      success: true,
      message: 'Trip deleted successfully',
    });
  });

  /**
   * POST /api/trips/:id/assign-driver
   * Assign or reassign a driver to a trip
   */
  static assignDriver = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    // Check permissions
    if (!userId || (userRole !== 'ADMIN' && userRole !== 'MANAGER')) {
      throw new AppError('Access denied. Admin or manager role required.', 403);
    }

    // Validate request body
    const validation = assignDriverSchema.safeParse(req.body);
    if (!validation.success) {
      throw new AppError('Invalid assignment data: ' + validation.error.message, 400);
    }

    const { driverId, notes } = validation.data;

    // Get current trip
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        driver: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        truck: true,
      },
    });

    if (!trip) {
      throw new AppError('Trip not found', 404);
    }

    // Only allow reassignment for scheduled or delayed trips
    if (!['SCHEDULED', 'DELAYED'].includes(trip.status)) {
      throw new AppError('Driver can only be assigned to scheduled or delayed trips', 400);
    }

    // Verify new driver exists and has valid profile
    const newDriver = await prisma.user.findUnique({
      where: { id: driverId },
      include: {
        driverProfile: true,
      }
    });

    if (!newDriver) {
      throw new AppError('Driver not found', 404);
    }

    if (newDriver.role !== 'DRIVER') {
      throw new AppError('Selected user is not a driver', 400);
    }

    if (!newDriver.driverProfile) {
      throw new AppError('Driver profile not found', 404);
    }

    if (newDriver.driverProfile.status !== 'ACTIVE') {
      throw new AppError('Driver is not active', 400);
    }

    // Check if driver is already assigned to this trip
    if (trip.driverId === driverId) {
      throw new AppError('Driver is already assigned to this trip', 400);
    }

    // Update the trip with new driver
    const result = await prisma.$transaction(async (tx) => {
      const updatedTrip = await tx.trip.update({
        where: { id },
        data: {
          driverId,
          driverProfileId: newDriver.driverProfile!.id,
          notes: notes ? `${trip.notes || ''}\n[Driver Reassignment] ${notes}` : trip.notes,
        },
        include: {
          truck: true,
          driver: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          driverProfile: true,
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'DRIVER_ASSIGNED',
          entity: 'Trip',
          entityId: id,
          oldValues: {
            driverId: trip.driverId,
            driverName: `${trip.driver.firstName} ${trip.driver.lastName}`,
          },
          newValues: {
            driverId,
            driverName: `${newDriver.firstName} ${newDriver.lastName}`,
            notes,
          },
          ip: req.ip,
          userAgent: req.get('User-Agent'),
        },
      });

      return updatedTrip;
    });

    res.json({
      success: true,
      message: 'Driver assigned successfully',
      data: { trip: result },
    });
  });

  /**
   * GET /api/drivers/:id/trips
   * Get trips for a specific driver
   */
  static getDriverTrips = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id: driverId } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    // Check permissions - drivers can only view their own trips
    if (userRole === 'DRIVER' && driverId !== userId) {
      throw new AppError('Access denied. You can only view your own trips.', 403);
    }

    const {
      page = 1,
      limit = 20,
      status,
      dateFrom,
      dateTo,
      sortBy = 'scheduledStartTime',
      sortOrder = 'desc',
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = {
      driverId,
    };

    if (status) {
      where.status = status;
    }

    if (dateFrom || dateTo) {
      where.scheduledStartTime = {};
      if (dateFrom) where.scheduledStartTime.gte = new Date(dateFrom as string);
      if (dateTo) where.scheduledStartTime.lte = new Date(dateTo as string);
    }

    // Get driver trips with pagination
    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        include: {
          truck: {
            select: { id: true, licensePlate: true, make: true, model: true, year: true }
          },
          receipts: {
            select: { id: true, amount: true, status: true, createdAt: true }
          },
          expenses: {
            select: { id: true, amount: true, category: true, createdAt: true }
          }
        },
        orderBy: { [sortBy as string]: sortOrder },
        skip,
        take: Number(limit),
      }),
      prisma.trip.count({ where })
    ]);

    res.json({
      success: true,
      message: 'Driver trips retrieved successfully',
      data: {
        trips,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  });

  /**
   * GET /api/trips/dashboard/stats
   * Get trip statistics for dashboard
   */
  static getTripStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    const { period = '30' } = req.query;
    const daysBack = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Build where clause based on role
    const where: any = {
      createdAt: {
        gte: startDate,
      },
    };

    if (userRole === 'DRIVER') {
      where.driverId = userId;
    }

    // Get trip statistics
    const [
      totalTrips,
      tripsByStatus,
      recentTrips,
      upcomingTrips,
    ] = await Promise.all([
      prisma.trip.count({ where }),
      
      prisma.trip.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),

      prisma.trip.findMany({
        where: {
          ...where,
          status: 'COMPLETED',
        },
        include: {
          truck: {
            select: { licensePlate: true, make: true, model: true }
          },
          driver: {
            select: { firstName: true, lastName: true }
          }
        },
        orderBy: { actualEndTime: 'desc' },
        take: 5,
      }),

      prisma.trip.findMany({
        where: {
          ...where,
          status: 'SCHEDULED',
          scheduledStartTime: {
            gte: new Date(),
          }
        },
        include: {
          truck: {
            select: { licensePlate: true, make: true, model: true }
          },
          driver: {
            select: { firstName: true, lastName: true }
          }
        },
        orderBy: { scheduledStartTime: 'asc' },
        take: 5,
      }),
    ]);

    // Format status statistics
    const statusStats = tripsByStatus.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      success: true,
      message: 'Trip statistics retrieved successfully',
      data: {
        totalTrips,
        statusStats,
        recentTrips,
        upcomingTrips,
        period: daysBack,
      }
    });
  });
}
