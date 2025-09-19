import { Router } from 'express';
import ReportsController from '../controllers/reportsController';
import { authGuard, adminGuard } from '../middleware/authGuard';

const router = Router();

// Apply authentication middleware to all routes
router.use(authGuard);

/**
 * @route   GET /api/reports/expenses-summary
 * @desc    Get aggregated expenses summary grouped by category, truck, or driver
 * @access  Admin only
 * @query   start, end, groupBy (category|truck|driver)
 */
router.get('/expenses-summary', adminGuard, ReportsController.getExpensesSummary);

/**
 * @route   GET /api/reports/dashboard-overview
 * @desc    Get dashboard overview statistics
 * @access  Admin only
 */
router.get('/dashboard-overview', adminGuard, ReportsController.getDashboardOverview);

/**
 * @route   GET /api/reports/expense-details
 * @desc    Get detailed expense report data with pagination and filters
 * @access  Admin only
 * @query   start, end, truck, driver, category, status, page, limit, sortBy, sortOrder
 */
router.get('/expense-details', adminGuard, ReportsController.getExpenseDetails);

/**
 * @route   GET /api/reports/export/csv
 * @desc    Export expenses to CSV format
 * @access  Admin only
 * @query   start, end, truck, driver, category, status
 */
router.get('/export/csv', adminGuard, ReportsController.exportExpensesCSV);

/**
 * @route   GET /api/reports/categories
 * @desc    Get expense categories with counts and totals
 * @access  Admin only
 */
router.get('/categories', adminGuard, ReportsController.getExpenseCategories);

export default router;
