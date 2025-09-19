import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Grid, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  CircularProgress,
  Divider,
  FormHelperText,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Visibility,
  Edit,
  History,
  Receipt as ReceiptIcon,
  AttachMoney,
  Category,
  CalendarToday,
  Business,
  Note,
  Download,
  Refresh,
} from '@mui/icons-material';
import { useApi } from '../hooks/useApi';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';

interface ReceiptItem {
  description: string;
  amount: number;
  quantity?: number;
}

interface ReceiptData {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  amount: number | null;
  currency: string;
  description: string | null;
  category: string | null;
  receiptDate: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSING';
  uploadedBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  approvedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  trip?: {
    id: string;
    tripNumber: string;
    startLocation: string;
    endLocation: string;
  };
  truck?: {
    id: string;
    licensePlate: string;
    make: string;
    model: string;
  };
  metadata?: {
    parsedData?: {
      merchant?: string;
      items?: ReceiptItem[];
      subtotal?: number;
      tax?: number;
      confidence?: number;
      ocrProvider?: string;
    };
    verifiedData?: any;
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ReceiptReviewPageProps {
  receiptId?: string;
  onClose?: () => void;
  onReceiptVerified?: (receipt: ReceiptData) => void;
}

export const ReceiptReviewPage: React.FC<ReceiptReviewPageProps> = ({
  receiptId,
  onClose,
  onReceiptVerified,
}) => {
  const { apiCall, loading } = useApi();
  
  // State
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [pendingReceipts, setPendingReceipts] = useState<ReceiptData[]>([]);
  const [currentReceiptIndex, setCurrentReceiptIndex] = useState(0);
  const [editedData, setEditedData] = useState({
    amount: 0,
    currency: 'USD',
    description: '',
    category: '',
    receiptDate: '',
    merchant: '',
  });
  const [rejectionReason, setRejectionReason] = useState('');
  const [notes, setNotes] = useState('');
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [verificationHistory, setVerificationHistory] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load receipt data
  const loadReceipt = useCallback(async (id: string) => {
    try {
      setError(null);
      const response = await apiCall(`/api/receipts/${id}`, 'GET');
      if (response.success) {
        const receiptData = response.data.receipt;
        setReceipt(receiptData);
        
        // Initialize editable data
        const metadata = receiptData.metadata?.parsedData || {};
        setEditedData({
          amount: receiptData.amount || metadata.total || 0,
          currency: receiptData.currency || 'USD',
          description: receiptData.description || metadata.merchant || '',
          category: receiptData.category || 'MISC',
          receiptDate: receiptData.receiptDate || '',
          merchant: metadata.merchant || '',
        });
      } else {
        setError('Failed to load receipt');
      }
    } catch (err) {
      setError('Error loading receipt');
      console.error('Error loading receipt:', err);
    }
  }, [apiCall]);

  // Load pending receipts for navigation
  const loadPendingReceipts = useCallback(async () => {
    try {
      const response = await apiCall('/api/receipts/pending-verification', 'GET');
      if (response.success) {
        setPendingReceipts(response.data.receipts);
        
        // Find current receipt index
        if (receiptId && response.data.receipts.length > 0) {
          const index = response.data.receipts.findIndex((r: ReceiptData) => r.id === receiptId);
          setCurrentReceiptIndex(index >= 0 ? index : 0);
        }
      }
    } catch (err) {
      console.error('Error loading pending receipts:', err);
    }
  }, [apiCall, receiptId]);

  // Load verification history
  const loadVerificationHistory = useCallback(async (id: string) => {
    try {
      const response = await apiCall(`/api/receipts/${id}/verification-history`, 'GET');
      if (response.success) {
        setVerificationHistory(response.data.history);
      }
    } catch (err) {
      console.error('Error loading verification history:', err);
    }
  }, [apiCall]);

  // Initialize data
  useEffect(() => {
    if (receiptId) {
      loadReceipt(receiptId);
    } else {
      loadPendingReceipts();
    }
  }, [receiptId, loadReceipt, loadPendingReceipts]);

  // Update receipt when navigating through pending receipts
  useEffect(() => {
    if (!receiptId && pendingReceipts.length > 0 && currentReceiptIndex < pendingReceipts.length) {
      const currentReceipt = pendingReceipts[currentReceiptIndex];
      loadReceipt(currentReceipt.id);
    }
  }, [currentReceiptIndex, pendingReceipts, receiptId, loadReceipt]);

  // Handle verification
  const handleVerification = async (status: 'APPROVED' | 'REJECTED') => {
    if (!receipt) return;

    try {
      setError(null);
      setSuccess(null);

      const requestData: any = {
        status,
      };

      if (status === 'APPROVED') {
        requestData.verifiedData = {
          amount: editedData.amount,
          currency: editedData.currency,
          description: editedData.description,
          category: editedData.category,
          receiptDate: editedData.receiptDate,
          merchant: editedData.merchant,
        };
        requestData.notes = notes;
      } else {
        requestData.rejectionReason = rejectionReason;
        requestData.notes = notes;
      }

      const response = await apiCall(`/api/receipts/${receipt.id}/verify`, 'PATCH', requestData);
      
      if (response.success) {
        setSuccess(`Receipt ${status.toLowerCase()} successfully`);
        
        // Update the receipt data
        const updatedReceipt = response.data.receipt;
        setReceipt(updatedReceipt);
        
        // Call callback if provided
        if (onReceiptVerified) {
          onReceiptVerified(updatedReceipt);
        }

        // Navigate to next receipt if reviewing multiple
        if (!receiptId && pendingReceipts.length > 1) {
          const nextIndex = currentReceiptIndex + 1;
          if (nextIndex < pendingReceipts.length) {
            setCurrentReceiptIndex(nextIndex);
          } else {
            // Refresh the list if we've processed all receipts
            loadPendingReceipts();
          }
        }

        // Reset form
        setRejectionReason('');
        setNotes('');
      } else {
        setError(response.message || 'Verification failed');
      }
    } catch (err) {
      setError('Error during verification');
      console.error('Error during verification:', err);
    }
  };

  // Get S3 presigned URL for image viewing
  const getImageUrl = useCallback(async () => {
    if (!receipt) return null;
    
    try {
      const response = await apiCall('/api/s3/presigned-url', 'POST', {
        operation: 'getObject',
        key: receipt.filePath,
      });
      
      return response.success ? response.data.url : null;
    } catch (err) {
      console.error('Error getting image URL:', err);
      return null;
    }
  }, [receipt, apiCall]);

  // Navigation helpers
  const navigateToPrevious = () => {
    if (currentReceiptIndex > 0) {
      setCurrentReceiptIndex(currentReceiptIndex - 1);
    }
  };

  const navigateToNext = () => {
    if (currentReceiptIndex < pendingReceipts.length - 1) {
      setCurrentReceiptIndex(currentReceiptIndex + 1);
    }
  };

  if (loading && !receipt) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!receipt) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h6" color="textSecondary">
          No receipt found
        </Typography>
      </Box>
    );
  }

  const metadata = receipt.metadata?.parsedData || {};
  const isProcessed = receipt.status === 'APPROVED' || receipt.status === 'REJECTED';

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Receipt Review
        </Typography>
        
        {/* Navigation for pending receipts */}
        {!receiptId && pendingReceipts.length > 1 && (
          <Box display="flex" alignItems="center" gap={2}>
            <Button 
              variant="outlined" 
              onClick={navigateToPrevious}
              disabled={currentReceiptIndex === 0}
            >
              Previous
            </Button>
            <Typography variant="body2">
              {currentReceiptIndex + 1} of {pendingReceipts.length}
            </Typography>
            <Button 
              variant="outlined" 
              onClick={navigateToNext}
              disabled={currentReceiptIndex === pendingReceipts.length - 1}
            >
              Next
            </Button>
          </Box>
        )}

        {onClose && (
          <Button variant="outlined" onClick={onClose}>
            Close
          </Button>
        )}
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Panel - Receipt Details */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" gutterBottom>
                  Receipt Details
                </Typography>
                <Chip 
                  label={receipt.status}
                  color={
                    receipt.status === 'APPROVED' ? 'success' :
                    receipt.status === 'REJECTED' ? 'error' :
                    receipt.status === 'PROCESSING' ? 'warning' : 'default'
                  }
                />
              </Box>

              {/* Basic Information */}
              <Box mb={3}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  <Business sx={{ verticalAlign: 'middle', mr: 1 }} />
                  File Information
                </Typography>
                <Typography variant="body2">
                  <strong>File:</strong> {receipt.fileName}
                </Typography>
                <Typography variant="body2">
                  <strong>Size:</strong> {(receipt.fileSize / 1024).toFixed(1)} KB
                </Typography>
                <Typography variant="body2">
                  <strong>Type:</strong> {receipt.mimeType}
                </Typography>
                <Typography variant="body2">
                  <strong>Uploaded:</strong> {formatDateTime(receipt.createdAt)}
                </Typography>
              </Box>

              {/* Uploader Information */}
              <Box mb={3}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Uploaded By
                </Typography>
                <Typography variant="body2">
                  {receipt.uploadedBy.firstName} {receipt.uploadedBy.lastName}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {receipt.uploadedBy.email}
                </Typography>
              </Box>

              {/* Trip/Truck Information */}
              {(receipt.trip || receipt.truck) && (
                <Box mb={3}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Associated Details
                  </Typography>
                  {receipt.trip && (
                    <Typography variant="body2">
                      <strong>Trip:</strong> {receipt.trip.tripNumber} 
                      ({receipt.trip.startLocation} → {receipt.trip.endLocation})
                    </Typography>
                  )}
                  {receipt.truck && (
                    <Typography variant="body2">
                      <strong>Truck:</strong> {receipt.truck.licensePlate} 
                      ({receipt.truck.make} {receipt.truck.model})
                    </Typography>
                  )}
                </Box>
              )}

              {/* OCR Information */}
              {metadata && Object.keys(metadata).length > 0 && (
                <Box mb={3}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    OCR Extracted Data
                  </Typography>
                  {metadata.merchant && (
                    <Typography variant="body2">
                      <strong>Merchant:</strong> {metadata.merchant}
                    </Typography>
                  )}
                  {metadata.confidence && (
                    <Typography variant="body2">
                      <strong>OCR Confidence:</strong> {(metadata.confidence * 100).toFixed(1)}%
                    </Typography>
                  )}
                  {metadata.ocrProvider && (
                    <Typography variant="body2">
                      <strong>OCR Provider:</strong> {metadata.ocrProvider}
                    </Typography>
                  )}
                </Box>
              )}

              {/* Receipt Items */}
              {metadata.items && metadata.items.length > 0 && (
                <Box mb={3}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Line Items
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Description</TableCell>
                          <TableCell align="right">Qty</TableCell>
                          <TableCell align="right">Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {metadata.items.map((item: ReceiptItem, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{item.description}</TableCell>
                            <TableCell align="right">{item.quantity || 1}</TableCell>
                            <TableCell align="right">
                              {formatCurrency(item.amount, receipt.currency)}
                            </TableCell>
                          </TableRow>
                        ))}
                        {metadata.subtotal && (
                          <TableRow>
                            <TableCell colSpan={2}><strong>Subtotal</strong></TableCell>
                            <TableCell align="right">
                              <strong>{formatCurrency(metadata.subtotal, receipt.currency)}</strong>
                            </TableCell>
                          </TableRow>
                        )}
                        {metadata.tax && (
                          <TableRow>
                            <TableCell colSpan={2}><strong>Tax</strong></TableCell>
                            <TableCell align="right">
                              <strong>{formatCurrency(metadata.tax, receipt.currency)}</strong>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* Action Buttons */}
              <Box display="flex" gap={2} flexWrap="wrap">
                <Button
                  variant="outlined"
                  startIcon={<Visibility />}
                  onClick={() => setShowImageDialog(true)}
                >
                  View Image
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<History />}
                  onClick={() => {
                    loadVerificationHistory(receipt.id);
                    setShowHistoryDialog(true);
                  }}
                >
                  History
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={async () => {
                    const imageUrl = await getImageUrl();
                    if (imageUrl) {
                      window.open(imageUrl, '_blank');
                    }
                  }}
                >
                  Download
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Panel - Verification Form */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {isProcessed ? 'Verification Details' : 'Verify Receipt'}
              </Typography>

              {isProcessed ? (
                // Show verification results
                <Box>
                  <Alert 
                    severity={receipt.status === 'APPROVED' ? 'success' : 'error'}
                    sx={{ mb: 2 }}
                  >
                    This receipt has been {receipt.status.toLowerCase()}
                    {receipt.approvedBy && (
                      <> by {receipt.approvedBy.firstName} {receipt.approvedBy.lastName}</>
                    )}
                    {receipt.approvedAt && (
                      <> on {formatDateTime(receipt.approvedAt)}</>
                    )}
                  </Alert>

                  {receipt.rejectionReason && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <strong>Rejection Reason:</strong> {receipt.rejectionReason}
                    </Alert>
                  )}

                  {receipt.metadata?.verifiedData && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Verified Data
                      </Typography>
                      <pre style={{ fontSize: '0.875rem', background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                        {JSON.stringify(receipt.metadata.verifiedData, null, 2)}
                      </pre>
                    </Box>
                  )}
                </Box>
              ) : (
                // Show verification form
                <Grid container spacing={2}>
                  {/* Editable Fields */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Amount"
                      type="number"
                      value={editedData.amount}
                      onChange={(e) => setEditedData({ ...editedData, amount: parseFloat(e.target.value) || 0 })}
                      InputProps={{
                        startAdornment: <AttachMoney />,
                      }}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel>Currency</InputLabel>
                      <Select
                        value={editedData.currency}
                        onChange={(e) => setEditedData({ ...editedData, currency: e.target.value })}
                      >
                        <MenuItem value="USD">USD</MenuItem>
                        <MenuItem value="CAD">CAD</MenuItem>
                        <MenuItem value="EUR">EUR</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={editedData.category}
                        onChange={(e) => setEditedData({ ...editedData, category: e.target.value })}
                      >
                        <MenuItem value="FUEL">Fuel</MenuItem>
                        <MenuItem value="TOLL">Toll</MenuItem>
                        <MenuItem value="PARKING">Parking</MenuItem>
                        <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
                        <MenuItem value="DELIVERY">Delivery</MenuItem>
                        <MenuItem value="FOOD">Food</MenuItem>
                        <MenuItem value="ACCOMMODATION">Accommodation</MenuItem>
                        <MenuItem value="MISC">Miscellaneous</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      value={editedData.description}
                      onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Merchant"
                      value={editedData.merchant}
                      onChange={(e) => setEditedData({ ...editedData, merchant: e.target.value })}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Receipt Date"
                      type="datetime-local"
                      value={editedData.receiptDate}
                      onChange={(e) => setEditedData({ ...editedData, receiptDate: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Notes (Optional)"
                      multiline
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any additional notes about this receipt..."
                    />
                  </Grid>

                  {/* Rejection Reason (shown when rejecting) */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Rejection Reason"
                      multiline
                      rows={2}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Required when rejecting a receipt..."
                      error={!rejectionReason}
                      helperText="This field is required when rejecting a receipt"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Box display="flex" gap={2} justifyContent="flex-end">
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<Cancel />}
                        onClick={() => handleVerification('REJECTED')}
                        disabled={loading || !rejectionReason.trim()}
                      >
                        Reject
                      </Button>
                      
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() => handleVerification('APPROVED')}
                        disabled={loading}
                      >
                        Approve
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Image Viewer Dialog */}
      <Dialog
        open={showImageDialog}
        onClose={() => setShowImageDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Receipt Image</DialogTitle>
        <DialogContent>
          <ReceiptImageViewer receipt={receipt} getImageUrl={getImageUrl} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowImageDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* History Dialog */}
      <Dialog
        open={showHistoryDialog}
        onClose={() => setShowHistoryDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Verification History</DialogTitle>
        <DialogContent>
          <List>
            {verificationHistory.map((log: any, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={`${log.action.replace('RECEIPT_', '')} by ${log.user?.firstName} ${log.user?.lastName}`}
                  secondary={`${formatDateTime(log.createdAt)}`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHistoryDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Separate component for image viewing
const ReceiptImageViewer: React.FC<{ 
  receipt: ReceiptData; 
  getImageUrl: () => Promise<string | null>; 
}> = ({ receipt, getImageUrl }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      try {
        setLoading(true);
        setError(null);
        const url = await getImageUrl();
        if (url) {
          setImageUrl(url);
        } else {
          setError('Failed to load image');
        }
      } catch (err) {
        setError('Error loading image');
        console.error('Error loading image:', err);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [getImageUrl]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  return (
    <Box textAlign="center">
      {imageUrl && (
        <img
          src={imageUrl}
          alt={receipt.fileName}
          style={{
            maxWidth: '100%',
            maxHeight: '600px',
            objectFit: 'contain',
          }}
        />
      )}
    </Box>
  );
};

export default ReceiptReviewPage;
