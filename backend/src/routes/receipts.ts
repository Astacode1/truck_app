import { Router } from 'express';
import { ReceiptController } from '../controllers/receiptController';
import { authGuard, roleGuard } from '../middleware/authGuard';

const router = Router();

// All receipt routes require authentication
router.use(authGuard);

/**
 * @route   GET /api/receipts/presign
 * @desc    Generate presigned URL for receipt upload
 * @access  Private (authenticated users)
 * @query   filename: string (required) - Original filename
 * @query   tripId: string (optional) - Associated trip ID
 * @query   fileSize: number (optional) - File size in bytes for validation
 */
router.get('/presign', ReceiptController.getPresignedUrl);

/**
 * @route   POST /api/receipts
 * @desc    Create receipt record after S3 upload
 * @access  Private (authenticated users)
 * @body    {
 *            s3Key: string (required) - S3 object key
 *            tripId?: string - Associated trip ID
 *            uploadedBy: string (required) - User ID who uploaded
 *            originalFilename?: string - Original file name
 *            fileSize?: number - File size in bytes
 *            description?: string - Receipt description
 *            amount?: number - Receipt amount
 *            merchant?: string - Merchant/vendor name
 *            receiptDate?: string - Date of receipt (ISO string)
 *          }
 */
router.post('/', ReceiptController.createReceipt);

/**
 * @route   GET /api/receipts
 * @desc    Get receipts with filtering and pagination
 * @access  Private (authenticated users)
 * @query   page?: number - Page number (default: 1)
 * @query   limit?: number - Items per page (default: 20, max: 100)
 * @query   tripId?: string - Filter by trip ID
 * @query   status?: string - Filter by status (PENDING, APPROVED, REJECTED)
 * @query   uploadedBy?: string - Filter by uploader (admin/manager only)
 * @query   startDate?: string - Filter by upload date start (ISO string)
 * @query   endDate?: string - Filter by upload date end (ISO string)
 */
router.get('/', ReceiptController.getReceipts);

/**
 * @route   GET /api/receipts/:id
 * @desc    Get single receipt with download URL
 * @access  Private (receipt owner, trip driver, or admin/manager)
 */
router.get('/:id', ReceiptController.getReceiptById);

/**
 * @route   PUT /api/receipts/:id
 * @desc    Update receipt metadata
 * @access  Private (receipt owner, or admin/manager)
 * @body    {
 *            description?: string
 *            amount?: number
 *            merchant?: string
 *            receiptDate?: string (ISO string)
 *            status?: string (admin/manager only)
 *          }
 */
router.put('/:id', ReceiptController.updateReceipt);

/**
 * @route   DELETE /api/receipts/:id
 * @desc    Delete receipt
 * @access  Private (admin/manager only)
 */
router.delete('/:id', roleGuard(['ADMIN', 'MANAGER']), ReceiptController.deleteReceipt);

export default router;
