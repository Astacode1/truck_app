import { Router } from 'express';
import { authGuard } from '../middleware/authGuard';
import { ReceiptVerificationController } from '../controllers/receiptVerificationController';

const router = Router();

/**
 * @route   PATCH /api/receipts/:id/verify
 * @desc    Verify (approve or reject) a receipt with audit logging
 * @access  Private (admin/manager only)
 * @body    { status: 'APPROVED'|'REJECTED', verifiedData?, rejectionReason?, notes? }
 */
router.patch('/:id/verify', authGuard, ReceiptVerificationController.verifyReceipt);

/**
 * @route   GET /api/receipts/:id/verification-history
 * @desc    Get verification history and audit logs for a receipt
 * @access  Private (admin/manager only)
 */
router.get('/:id/verification-history', authGuard, ReceiptVerificationController.getVerificationHistory);

/**
 * @route   GET /api/receipts/pending-verification
 * @desc    Get all receipts pending verification
 * @access  Private (admin/manager only)
 * @query   page?, limit?, category?, dateFrom?, dateTo?
 */
router.get('/pending-verification', authGuard, ReceiptVerificationController.getPendingReceipts);

/**
 * @route   PATCH /api/receipts/bulk-verify
 * @desc    Bulk verify multiple receipts
 * @access  Private (admin/manager only)
 * @body    { receiptIds: string[], action: 'APPROVED'|'REJECTED', rejectionReason? }
 */
router.patch('/bulk-verify', authGuard, ReceiptVerificationController.bulkVerifyReceipts);

export default router;
