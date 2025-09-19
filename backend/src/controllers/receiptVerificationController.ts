import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authGuard';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { PrismaClient, ReceiptStatus, UserRole } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for receipt verification
const verifyReceiptSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  verifiedData: z.object({
    amount: z.number().min(0).optional(),
    currency: z.string().default('USD').optional(),
    description: z.string().optional(),
    category: z.enum(['FUEL', 'TOLL', 'PARKING', 'MAINTENANCE', 'DELIVERY', 'MISC']).optional(),
    receiptDate: z.string().datetime().optional(),
    merchant: z.string().optional(),
    items: z.array(z.object({
      description: z.string(),
      amount: z.number(),
      quantity: z.number().optional(),
    })).optional(),
  }).optional(),
  rejectionReason: z.string().optional(),
  notes: z.string().optional(),
});

export interface VerifyReceiptRequest {
  status: 'APPROVED' | 'REJECTED';
  verifiedData?: {
    amount?: number;
    currency?: string;
    description?: string;
    category?: string;
    receiptDate?: string;
    merchant?: string;
    items?: Array<{
      description: string;
      amount: number;
      quantity?: number;
    }>;
  };
  rejectionReason?: string;
  notes?: string;
}

export interface VerifyReceiptResponse {
  success: boolean;
  message: string;
  data: {
    receipt: any;
    auditLogId: string;
    linkedExpense?: any;
  };
}

export class ReceiptVerificationController {
  /**
   * PATCH /api/receipts/:id/verify
   * Verify (approve or reject) a receipt with audit logging
   */
  static verifyReceipt = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id: receiptId } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    
    // Validate user permissions
    if (!userId || (userRole !== 'ADMIN' && userRole !== 'MANAGER')) {
      throw new AppError('Access denied. Admin or manager role required.', 403);
    }

    // Validate request body
    const validation = verifyReceiptSchema.safeParse(req.body);
    if (!validation.success) {
      throw new AppError('Invalid request data: ' + validation.error.message, 400);
    }

    const { status, verifiedData, rejectionReason, notes } = validation.data;

    // Validate rejection reason for rejected receipts
    if (status === 'REJECTED' && !rejectionReason) {
      throw new AppError('Rejection reason is required when rejecting a receipt', 400);
    }

    // Get the receipt
    const receipt = await prisma.receipt.findUnique({
      where: { id: receiptId },
      include: {
        uploadedBy: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        trip: true,
        truck: true,
      },
    });

    if (!receipt) {
      throw new AppError('Receipt not found', 404);
    }

    // Check if receipt is already processed
    if (receipt.status === 'APPROVED' || receipt.status === 'REJECTED') {
      throw new AppError(`Receipt has already been ${receipt.status.toLowerCase()}`, 400);
    }

    // Prepare update data
    const updateData: any = {
      status: status as ReceiptStatus,
      approvedById: userId,
      approvedAt: new Date(),
    };

    // Add verified data if provided (for approved receipts)
    if (status === 'APPROVED' && verifiedData) {
      if (verifiedData.amount !== undefined) updateData.amount = verifiedData.amount;
      if (verifiedData.currency) updateData.currency = verifiedData.currency;
      if (verifiedData.description) updateData.description = verifiedData.description;
      if (verifiedData.category) updateData.category = verifiedData.category;
      if (verifiedData.receiptDate) updateData.receiptDate = new Date(verifiedData.receiptDate);
      
      // Update metadata with verified data
      const currentMetadata = receipt.metadata as any || {};
      updateData.metadata = {
        ...currentMetadata,
        verifiedData: {
          ...verifiedData,
          verifiedBy: userId,
          verifiedAt: new Date().toISOString(),
        },
        notes,
      };
    }

    // Add rejection reason for rejected receipts
    if (status === 'REJECTED') {
      updateData.rejectionReason = rejectionReason;
      updateData.metadata = {
        ...((receipt.metadata as any) || {}),
        rejectionReason,
        rejectedBy: userId,
        rejectedAt: new Date().toISOString(),
        notes,
      };
    }

    // Perform the update and create audit log in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the receipt
      const updatedReceipt = await tx.receipt.update({
        where: { id: receiptId },
        data: updateData,
        include: {
          uploadedBy: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          approvedBy: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          trip: true,
          truck: true,
        },
      });

      // Create audit log entry
      const auditLog = await tx.auditLog.create({
        data: {
          userId,
          action: `RECEIPT_${status}`,
          entity: 'Receipt',
          entityId: receiptId,
          oldValues: {
            status: receipt.status,
            amount: receipt.amount,
            description: receipt.description,
            category: receipt.category,
            receiptDate: receipt.receiptDate,
          },
          newValues: {
            status: updateData.status,
            amount: updateData.amount || receipt.amount,
            description: updateData.description || receipt.description,
            category: updateData.category || receipt.category,
            receiptDate: updateData.receiptDate || receipt.receiptDate,
            verifiedData,
            rejectionReason,
            notes,
          },
          ip: req.ip,
          userAgent: req.get('User-Agent'),
        },
      });

      // If approved, create or link expense record
      let linkedExpense: any = null;
      if (status === 'APPROVED' && (verifiedData?.amount || receipt.amount)) {
        linkedExpense = await tx.expense.create({
          data: {
            amount: verifiedData?.amount || receipt.amount || 0,
            currency: verifiedData?.currency || receipt.currency,
            category: (verifiedData?.category as any) || receipt.category || 'MISC',
            description: verifiedData?.description || receipt.description || 'Receipt expense',
            expenseDate: verifiedData?.receiptDate ? new Date(verifiedData.receiptDate) : receipt.receiptDate || new Date(),
            tripId: receipt.tripId,
            truckId: receipt.truckId,
            userId: receipt.uploadedById,
            receiptUrl: receipt.filePath,
            status: 'APPROVED',
            approvedAt: new Date(),
            approvedBy: userId,
            tags: [],
            metadata: {
              sourceReceiptId: receiptId,
              autoCreatedFromReceipt: true,
            },
          },
        });

        // Log expense creation
        if (linkedExpense) {
          await tx.auditLog.create({
            data: {
              userId,
              action: 'EXPENSE_CREATED_FROM_RECEIPT',
              entity: 'Expense',
              entityId: linkedExpense.id,
              oldValues: undefined,
              newValues: {
                amount: linkedExpense.amount,
                category: linkedExpense.category,
                description: linkedExpense.description,
                sourceReceiptId: receiptId,
              },
              ip: req.ip,
              userAgent: req.get('User-Agent'),
            },
          });
        }
      }

      return { updatedReceipt, auditLog, linkedExpense };
    });

    // Send notification to driver (async, don't wait)
    ReceiptVerificationController.sendDriverNotification(
      result.updatedReceipt,
      status,
      rejectionReason,
      notes
    ).catch(error => {
      console.error('Failed to send driver notification:', error);
    });

    const response: VerifyReceiptResponse = {
      success: true,
      message: `Receipt ${status.toLowerCase()} successfully`,
      data: {
        receipt: result.updatedReceipt,
        auditLogId: result.auditLog.id,
        linkedExpense: result.linkedExpense,
      },
    };

    res.json(response);
  });

  /**
   * GET /api/receipts/:id/verification-history
   * Get verification history and audit logs for a receipt
   */
  static getVerificationHistory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id: receiptId } = req.params;
    const userRole = req.user?.role;

    // Check permissions
    if (userRole !== 'ADMIN' && userRole !== 'MANAGER') {
      throw new AppError('Access denied. Admin or manager role required.', 403);
    }

    // Get receipt verification history
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        entity: 'Receipt',
        entityId: receiptId,
        action: {
          in: ['RECEIPT_APPROVED', 'RECEIPT_REJECTED', 'RECEIPT_UPDATED']
        }
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      message: 'Verification history retrieved successfully',
      data: { history: auditLogs }
    });
  });

  /**
   * GET /api/receipts/pending-verification
   * Get all receipts pending verification
   */
  static getPendingReceipts = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userRole = req.user?.role;
    const { page = 1, limit = 20, category, dateFrom, dateTo } = req.query;

    // Check permissions
    if (userRole !== 'ADMIN' && userRole !== 'MANAGER') {
      throw new AppError('Access denied. Admin or manager role required.', 403);
    }

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = {
      status: 'PENDING'
    };

    if (category) {
      where.category = category;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom as string);
      if (dateTo) where.createdAt.lte = new Date(dateTo as string);
    }

    // Get pending receipts with pagination
    const [receipts, total] = await Promise.all([
      prisma.receipt.findMany({
        where,
        include: {
          uploadedBy: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          trip: {
            select: { id: true, tripNumber: true, startLocation: true, endLocation: true }
          },
          truck: {
            select: { id: true, licensePlate: true, make: true, model: true }
          }
        },
        orderBy: { createdAt: 'asc' }, // Oldest first for FIFO processing
        skip,
        take: Number(limit),
      }),
      prisma.receipt.count({ where })
    ]);

    res.json({
      success: true,
      message: 'Pending receipts retrieved successfully',
      data: {
        receipts,
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
   * PATCH /api/receipts/:id/bulk-verify
   * Bulk verify multiple receipts
   */
  static bulkVerifyReceipts = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || (userRole !== 'ADMIN' && userRole !== 'MANAGER')) {
      throw new AppError('Access denied. Admin or manager role required.', 403);
    }

    const { receiptIds, action, rejectionReason } = req.body;

    if (!Array.isArray(receiptIds) || receiptIds.length === 0) {
      throw new AppError('receiptIds must be a non-empty array', 400);
    }

    if (!['APPROVED', 'REJECTED'].includes(action)) {
      throw new AppError('action must be APPROVED or REJECTED', 400);
    }

    if (action === 'REJECTED' && !rejectionReason) {
      throw new AppError('rejectionReason is required for bulk rejection', 400);
    }

    // Limit bulk operations
    if (receiptIds.length > 50) {
      throw new AppError('Maximum 50 receipts can be processed in one bulk operation', 400);
    }

    const results = await prisma.$transaction(async (tx) => {
      const results: Array<{
        receiptId: string;
        success: boolean;
        error?: string;
        receipt?: any;
      }> = [];

      for (const receiptId of receiptIds) {
        try {
          const receipt = await tx.receipt.findUnique({
            where: { id: receiptId },
            include: { uploadedBy: true }
          });

          if (!receipt) {
            results.push({ receiptId, success: false, error: 'Receipt not found' });
            continue;
          }

          if (receipt.status !== 'PENDING') {
            results.push({ 
              receiptId, 
              success: false, 
              error: `Receipt already ${receipt.status.toLowerCase()}` 
            });
            continue;
          }

          // Update receipt
          const updatedReceipt = await tx.receipt.update({
            where: { id: receiptId },
            data: {
              status: action as ReceiptStatus,
              approvedById: userId,
              approvedAt: new Date(),
              rejectionReason: action === 'REJECTED' ? rejectionReason : undefined,
            },
          });

          // Create audit log
          await tx.auditLog.create({
            data: {
              userId,
              action: `RECEIPT_${action}_BULK`,
              entity: 'Receipt',
              entityId: receiptId,
              oldValues: { status: receipt.status },
              newValues: { 
                status: action,
                rejectionReason: action === 'REJECTED' ? rejectionReason : undefined,
                bulkOperation: true,
              },
              ip: req.ip,
              userAgent: req.get('User-Agent'),
            },
          });

          results.push({ receiptId, success: true, receipt: updatedReceipt });
        } catch (error) {
          results.push({ 
            receiptId, 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }

      return results;
    });

    const successCount = results.filter(r => r.success).length;

    res.json({
      success: true,
      message: `Bulk verification completed. ${successCount}/${receiptIds.length} receipts processed successfully.`,
      data: { results }
    });
  });

  /**
   * Private method to send notification to driver
   */
  private static async sendDriverNotification(
    receipt: any,
    status: string,
    rejectionReason?: string,
    notes?: string
  ): Promise<void> {
    try {
      // In a real application, this would integrate with your notification service
      // For now, we'll just log the notification
      
      const notification = {
        userId: receipt.uploadedBy.id,
        type: `RECEIPT_${status}`,
        title: `Receipt ${status.toLowerCase()}`,
        message: status === 'APPROVED' 
          ? `Your receipt for $${receipt.amount} has been approved and processed.`
          : `Your receipt for $${receipt.amount} was rejected. Reason: ${rejectionReason}`,
        data: {
          receiptId: receipt.id,
          status,
          rejectionReason,
          notes,
          amount: receipt.amount,
          description: receipt.description,
        },
        createdAt: new Date(),
      };

      console.log('Driver notification:', notification);

      // TODO: Implement actual notification service integration
      // Examples:
      // - Email notification
      // - Push notification
      // - In-app notification
      // - SMS notification
      
    } catch (error) {
      console.error('Error sending driver notification:', error);
      throw error;
    }
  }
}
