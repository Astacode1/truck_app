import { Router } from 'express';
import { authGuard } from '../middleware/authGuard';
import { OCRController } from '../controllers/ocrController';

const router = Router();

/**
 * @route   POST /api/ocr/process
 * @desc    Process receipt image using OCR and extract structured data
 * @access  Private (authenticated users)
 * @body    { s3Key: string }
 */
router.post('/process', authGuard, OCRController.processReceipt);

/**
 * @route   GET /api/ocr/health
 * @desc    Check OCR service health and configuration
 * @access  Private (admin/manager only)
 */
router.get('/health', authGuard, OCRController.healthCheck);

/**
 * @route   POST /api/ocr/test
 * @desc    Test OCR processing with a sample image (development only)
 * @access  Private (admin/manager only)
 * @body    { s3Key: string, testProvider?: 'vision' | 'tesseract' }
 */
router.post('/test', authGuard, OCRController.testProcessing);

/**
 * @route   GET /api/ocr/categories
 * @desc    Get list of available receipt categories
 * @access  Public
 */
router.get('/categories', OCRController.getCategories);

/**
 * @route   POST /api/ocr/batch
 * @desc    Process multiple receipts in batch (admin/manager only)
 * @access  Private (admin/manager only)
 * @body    { s3Keys: string[] }
 */
router.post('/batch', authGuard, OCRController.batchProcess);

export default router;
