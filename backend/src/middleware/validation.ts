import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { AppError } from './errorHandler';

// Validation error handler
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages,
    });
  }
  
  next();
};

// Common validation rules
export const validateEmail = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Please provide a valid email address');

export const validatePassword = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');

export const validateId = param('id')
  .isUUID()
  .withMessage('Invalid ID format');

export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

// User validation
export const validateUserRegistration = [
  validateEmail,
  validatePassword,
  body('firstName')
    .notEmpty()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .notEmpty()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('role')
    .optional()
    .isIn(['ADMIN', 'DRIVER', 'MANAGER'])
    .withMessage('Role must be ADMIN, DRIVER, or MANAGER'),
  handleValidationErrors,
];

export const validateUserLogin = [
  validateEmail,
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors,
];

// Truck validation
export const validateTruckCreation = [
  body('licensePlate')
    .notEmpty()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('License plate must be between 2 and 20 characters'),
  body('make')
    .notEmpty()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Make must be between 2 and 50 characters'),
  body('model')
    .notEmpty()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Model must be between 2 and 50 characters'),
  body('year')
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Year must be a valid year'),
  body('capacity')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Capacity must be a positive number'),
  handleValidationErrors,
];

// Trip validation
export const validateTripCreation = [
  body('truckId')
    .isUUID()
    .withMessage('Invalid truck ID'),
  body('driverId')
    .isUUID()
    .withMessage('Invalid driver ID'),
  body('startLocation')
    .notEmpty()
    .trim()
    .withMessage('Start location is required'),
  body('endLocation')
    .notEmpty()
    .trim()
    .withMessage('End location is required'),
  body('scheduledStartTime')
    .isISO8601()
    .withMessage('Invalid start time format'),
  body('estimatedDistance')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Distance must be a positive number'),
  handleValidationErrors,
];

// Maintenance validation
export const validateMaintenanceCreation = [
  body('truckId')
    .isUUID()
    .withMessage('Invalid truck ID'),
  body('type')
    .isIn(['ROUTINE', 'REPAIR', 'INSPECTION', 'EMERGENCY'])
    .withMessage('Invalid maintenance type'),
  body('description')
    .notEmpty()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('scheduledDate')
    .isISO8601()
    .withMessage('Invalid scheduled date format'),
  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost must be a positive number'),
  handleValidationErrors,
];
