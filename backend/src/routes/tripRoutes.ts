import { Router } from 'express';
import { authGuard } from '../middleware/authGuard';
import { TripController } from '../controllers/tripController';

const router = Router();

/**
 * @route   POST /api/trips
 * @desc    Create a new trip
 * @access  Private (admin/manager only)
 * @body    { truckId, driverId, startLocation, endLocation, scheduledStartTime, scheduledEndTime?, estimatedDistance?, notes? }
 */
router.post('/', authGuard, TripController.createTrip);

/**
 * @route   GET /api/trips
 * @desc    Get all trips with filtering and pagination
 * @access  Private (role-based access)
 * @query   page?, limit?, status?, truckId?, driverId?, dateFrom?, dateTo?, search?, sortBy?, sortOrder?
 */
router.get('/', authGuard, TripController.getTrips);

/**
 * @route   GET /api/trips/dashboard/stats
 * @desc    Get trip statistics for dashboard
 * @access  Private (role-based access)
 * @query   period?
 */
router.get('/dashboard/stats', authGuard, TripController.getTripStats);

/**
 * @route   GET /api/trips/:id
 * @desc    Get a specific trip by ID
 * @access  Private (role-based access)
 */
router.get('/:id', authGuard, TripController.getTripById);

/**
 * @route   PATCH /api/trips/:id
 * @desc    Update a trip
 * @access  Private (admin/manager only)
 * @body    { truckId?, driverId?, startLocation?, endLocation?, scheduledStartTime?, scheduledEndTime?, actualStartTime?, actualEndTime?, estimatedDistance?, actualDistance?, status?, notes? }
 */
router.patch('/:id', authGuard, TripController.updateTrip);

/**
 * @route   DELETE /api/trips/:id
 * @desc    Delete a trip (only if not started)
 * @access  Private (admin/manager only)
 */
router.delete('/:id', authGuard, TripController.deleteTrip);

/**
 * @route   POST /api/trips/:id/assign-driver
 * @desc    Assign or reassign a driver to a trip
 * @access  Private (admin/manager only)
 * @body    { driverId, notes? }
 */
router.post('/:id/assign-driver', authGuard, TripController.assignDriver);

/**
 * @route   GET /api/drivers/:id/trips
 * @desc    Get trips for a specific driver
 * @access  Private (role-based access)
 * @query   page?, limit?, status?, dateFrom?, dateTo?, sortBy?, sortOrder?
 */
router.get('/drivers/:id/trips', authGuard, TripController.getDriverTrips);

export default router;
