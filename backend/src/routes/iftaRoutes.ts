import { Router } from 'express';
import { IFTAController } from '../controllers/iftaController';
import { authGuard } from '../middleware/authGuard';

const router = Router();

// Apply authentication middleware to all routes
router.use(authGuard);

// Quarter information
router.get('/current-quarter', IFTAController.getCurrentQuarter);

// Quarterly reports
router.get('/reports/quarterly', IFTAController.generateQuarterlyReport);
router.get('/reports/quarterly/export', IFTAController.exportQuarterlyReport);

// Compliance and status
router.get('/compliance-status', IFTAController.getComplianceStatus);
router.get('/dashboard/summary', IFTAController.getDashboardSummary);

// Tax rates
router.get('/state-tax-rates', IFTAController.getStateTaxRates);

// Trip segments
router.get('/trips/:tripId/segments', IFTAController.getTripSegments);

// Fuel purchases
router.get('/fuel-purchases', IFTAController.getFuelPurchases);

// Calculator
router.get('/calculator/quick', IFTAController.quickCalculation);

export default router;
