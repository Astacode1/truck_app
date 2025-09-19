import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/authGuard';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { S3Service } from '../services/s3Service';

const prisma = new PrismaClient();

export interface CreateReceiptRequest {
  s3Key: string;
  tripId?: string;
  uploadedBy: string;
  originalFilename?: string;
  fileSize?: number;
  description?: string;
  amount?: number;
  merchant?: string;
  receiptDate?: string;
}

export class ReceiptController {
  /**
   * GET /api/receipts/presign
   * Generate presigned URL for receipt upload
   */
  static getPresignedUrl = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { filename, tripId, fileSize } = req.query;
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    if (!filename || typeof filename !== 'string') {
      throw new AppError('Filename is required', 400);
    }

    // Validate file size if provided
    let fileSizeNum: number | undefined;
    if (fileSize) {
      fileSizeNum = parseInt(fileSize as string);
      if (isNaN(fileSizeNum) || fileSizeNum <= 0) {
        throw new AppError('Invalid file size', 400);
      }
    }

    // Validate tripId if provided
    if (tripId && typeof tripId === 'string') {
      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        select: { id: true, driverId: true },
      });

      if (!trip) {
        throw new AppError('Trip not found', 404);
      }

      // Check if user has access to this trip (driver or admin/manager)
      if (req.user?.role !== 'ADMIN' && req.user?.role !== 'MANAGER' && trip.driverId !== userId) {
        throw new AppError('Access denied. You can only upload receipts for your own trips.', 403);
      }
    }

    // Generate presigned URL
    const result = await S3Service.generatePresignedUploadUrl(
      filename,
      userId,
      tripId as string | undefined
    );

    res.json({
      success: true,
      message: 'Presigned URL generated successfully',
      data: {
        presignedUrl: result.presignedUrl,
        s3Key: result.s3Key,
        expiresIn: result.expiresIn,
        uploadInstructions: {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/octet-stream', // Will be overridden by actual file type
          },
          maxFileSize: '10MB',
          allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
        },
      },
    });
  });

  /**
   * POST /api/receipts
   * Create receipt record after successful S3 upload
   */
  static createReceipt = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      s3Key,
      tripId,
      uploadedBy,
      originalFilename,
      fileSize,
      description,
      amount,
      merchant,
      receiptDate,
    }: CreateReceiptRequest = req.body;

    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    // Validate required fields
    if (!s3Key) {
      throw new AppError('S3 key is required', 400);
    }

    if (!uploadedBy) {
      throw new AppError('uploadedBy is required', 400);
    }

    // Ensure user can only create receipts for themselves (unless admin/manager)
    if (req.user?.role !== 'ADMIN' && req.user?.role !== 'MANAGER' && uploadedBy !== userId) {
      throw new AppError('Access denied. You can only create receipts for yourself.', 403);
    }

    // Validate tripId if provided
    let trip = null;
    if (tripId) {
      trip = await prisma.trip.findUnique({
        where: { id: tripId },
        select: { id: true, driverId: true, status: true },
      });

      if (!trip) {
        throw new AppError('Trip not found', 404);
      }

      // Check if user has access to this trip
      if (req.user?.role !== 'ADMIN' && req.user?.role !== 'MANAGER' && trip.driverId !== uploadedBy) {
        throw new AppError('Access denied. Cannot assign receipt to this trip.', 403);
      }
    }

    // Validate amount if provided
    if (amount !== undefined && (isNaN(amount) || amount < 0)) {
      throw new AppError('Amount must be a valid positive number', 400);
    }

    // Validate receipt date if provided
    let parsedReceiptDate: Date | undefined;
    if (receiptDate) {
      parsedReceiptDate = new Date(receiptDate);
      if (isNaN(parsedReceiptDate.getTime())) {
        throw new AppError('Invalid receipt date format', 400);
      }
    }

    // Validate file size if provided
    if (fileSize !== undefined && (isNaN(fileSize) || fileSize <= 0)) {
      throw new AppError('Invalid file size', 400);
    }

    try {
      // Create receipt record
      const receipt = await prisma.receipt.create({
        data: {
          s3Key,
          originalFilename: originalFilename || 'unknown',
          fileSize: fileSize || null,
          uploadedBy,
          tripId: tripId || null,
          status: 'PENDING',
          description: description || null,
          amount: amount || null,
          merchant: merchant || null,
          receiptDate: parsedReceiptDate || null,
          uploadedAt: new Date(),
        },
        include: {
          uploadedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          trip: {
            select: {
              id: true,
              startLocation: true,
              endLocation: true,
              status: true,
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        message: 'Receipt created successfully',
        data: { receipt },
      });
    } catch (error) {
      // If database creation fails, log the orphaned S3 key for cleanup
      console.error('Receipt creation failed for S3 key:', s3Key, error);
      throw new AppError('Failed to create receipt record', 500);
    }
  });

  /**
   * GET /api/receipts
   * Get receipts with filtering and pagination
   */
  static getReceipts = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const {
      page = '1',
      limit = '20',
      tripId,
      status,
      uploadedBy,
      startDate,
      endDate,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    if (isNaN(pageNum) || pageNum < 1) {
      throw new AppError('Invalid page number', 400);
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw new AppError('Invalid limit (must be between 1 and 100)', 400);
    }

    // Build filters
    const where: any = {};

    // Role-based filtering
    if (userRole === 'DRIVER') {
      where.uploadedBy = userId; // Drivers can only see their own receipts
    } else if (uploadedBy && (userRole === 'ADMIN' || userRole === 'MANAGER')) {
      where.uploadedBy = uploadedBy; // Admins/managers can filter by specific user
    }

    if (tripId) {
      where.tripId = tripId;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.uploadedAt = {};
      if (startDate) {
        where.uploadedAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.uploadedAt.lte = new Date(endDate as string);
      }
    }

    const [receipts, total] = await Promise.all([
      prisma.receipt.findMany({
        where,
        include: {
          uploadedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          trip: {
            select: {
              id: true,
              startLocation: true,
              endLocation: true,
              status: true,
            },
          },
        },
        orderBy: { uploadedAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.receipt.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        receipts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  });

  /**
   * GET /api/receipts/:id
   * Get single receipt with download URL
   */
  static getReceiptById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: {
        uploadedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        trip: {
          select: {
            id: true,
            startLocation: true,
            endLocation: true,
            status: true,
            driverId: true,
          },
        },
      },
    });

    if (!receipt) {
      throw new AppError('Receipt not found', 404);
    }

    // Check access permissions
    const hasAccess = 
      userRole === 'ADMIN' || 
      userRole === 'MANAGER' || 
      receipt.uploadedBy === userId ||
      (receipt.trip && receipt.trip.driverId === userId);

    if (!hasAccess) {
      throw new AppError('Access denied', 403);
    }

    // Generate download URL if user has access
    let downloadUrl: string | undefined;
    try {
      downloadUrl = await S3Service.generatePresignedDownloadUrl(receipt.s3Key);
    } catch (error) {
      console.error('Failed to generate download URL for receipt:', id, error);
      // Don't throw error, just log it - user can still see receipt metadata
    }

    res.json({
      success: true,
      data: {
        receipt: {
          ...receipt,
          downloadUrl,
        },
      },
    });
  });

  /**
   * PUT /api/receipts/:id
   * Update receipt metadata
   */
  static updateReceipt = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: { trip: { select: { driverId: true } } },
    });

    if (!receipt) {
      throw new AppError('Receipt not found', 404);
    }

    // Check permissions - only receipt owner or admin/manager can update
    const canUpdate = 
      userRole === 'ADMIN' || 
      userRole === 'MANAGER' || 
      receipt.uploadedBy === userId;

    if (!canUpdate) {
      throw new AppError('Access denied', 403);
    }

    const {
      description,
      amount,
      merchant,
      receiptDate,
      status,
    } = req.body;

    const updateData: any = {};

    if (description !== undefined) updateData.description = description;
    if (amount !== undefined) {
      if (isNaN(amount) || amount < 0) {
        throw new AppError('Amount must be a valid positive number', 400);
      }
      updateData.amount = amount;
    }
    if (merchant !== undefined) updateData.merchant = merchant;
    if (receiptDate !== undefined) {
      const parsedDate = new Date(receiptDate);
      if (isNaN(parsedDate.getTime())) {
        throw new AppError('Invalid receipt date format', 400);
      }
      updateData.receiptDate = parsedDate;
    }
    if (status !== undefined) {
      // Only admin/manager can change status
      if (userRole !== 'ADMIN' && userRole !== 'MANAGER') {
        throw new AppError('Only admins and managers can change receipt status', 403);
      }
      updateData.status = status;
    }

    const updatedReceipt = await prisma.receipt.update({
      where: { id },
      data: updateData,
      include: {
        uploadedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        trip: {
          select: {
            id: true,
            startLocation: true,
            endLocation: true,
            status: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Receipt updated successfully',
      data: { receipt: updatedReceipt },
    });
  });

  /**
   * DELETE /api/receipts/:id
   * Delete receipt (admin/manager only)
   */
  static deleteReceipt = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userRole = req.user?.role;

    // Only admin/manager can delete receipts
    if (userRole !== 'ADMIN' && userRole !== 'MANAGER') {
      throw new AppError('Access denied. Only admins and managers can delete receipts.', 403);
    }

    const receipt = await prisma.receipt.findUnique({
      where: { id },
      select: { id: true, s3Key: true },
    });

    if (!receipt) {
      throw new AppError('Receipt not found', 404);
    }

    await prisma.receipt.delete({
      where: { id },
    });

    // Note: In production, you might want to also delete the S3 object
    // or mark it for deletion in a background job
    console.log('Receipt deleted, S3 key for cleanup:', receipt.s3Key);

    res.json({
      success: true,
      message: 'Receipt deleted successfully',
    });
  });
}
