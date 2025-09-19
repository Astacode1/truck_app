import React, { useState, useEffect, useCallback } from 'react';

// Simple interfaces for TypeScript
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

// Simple API hook
const useApi = () => {
  const [loading, setLoading] = useState(false);

  const apiCall = useCallback(async (endpoint: string, method: string = 'GET', data?: any) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const config: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      };

      if (data && method !== 'GET') {
        config.body = JSON.stringify(data);
      }

      const baseUrl = 'http://localhost:3001'; // Hardcoded for simplicity
      const response = await fetch(`${baseUrl}${endpoint}`, config);
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Request failed');
      }

      return responseData;
    } finally {
      setLoading(false);
    }
  }, []);

  return { apiCall, loading };
};

// Utility functions
const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

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
  const [imageUrl, setImageUrl] = useState<string | null>(null);
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
      }
    } catch (err) {
      setError('Error loading receipt');
      console.error('Error loading receipt:', err);
    }
  }, [apiCall]);

  // Load pending receipts
  const loadPendingReceipts = useCallback(async () => {
    try {
      const response = await apiCall('/api/receipts/pending-verification', 'GET');
      if (response.success) {
        setPendingReceipts(response.data.receipts);
        
        if (receiptId && response.data.receipts.length > 0) {
          const index = response.data.receipts.findIndex((r: ReceiptData) => r.id === receiptId);
          setCurrentReceiptIndex(index >= 0 ? index : 0);
        }
      }
    } catch (err) {
      console.error('Error loading pending receipts:', err);
    }
  }, [apiCall, receiptId]);

  // Initialize data
  useEffect(() => {
    if (receiptId) {
      loadReceipt(receiptId);
    } else {
      loadPendingReceipts();
    }
  }, [receiptId, loadReceipt, loadPendingReceipts]);

  // Update receipt when navigating
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

      const requestData: any = { status };

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
        if (!rejectionReason.trim()) {
          setError('Rejection reason is required');
          return;
        }
        requestData.rejectionReason = rejectionReason;
        requestData.notes = notes;
      }

      const response = await apiCall(`/api/receipts/${receipt.id}/verify`, 'PATCH', requestData);
      
      if (response.success) {
        setSuccess(`Receipt ${status.toLowerCase()} successfully`);
        
        const updatedReceipt = response.data.receipt;
        setReceipt(updatedReceipt);
        
        if (onReceiptVerified) {
          onReceiptVerified(updatedReceipt);
        }

        // Navigate to next receipt if reviewing multiple
        if (!receiptId && pendingReceipts.length > 1) {
          const nextIndex = currentReceiptIndex + 1;
          if (nextIndex < pendingReceipts.length) {
            setCurrentReceiptIndex(nextIndex);
          } else {
            loadPendingReceipts();
          }
        }

        setRejectionReason('');
        setNotes('');
      }
    } catch (err) {
      setError('Error during verification');
      console.error('Error during verification:', err);
    }
  };

  // Get image URL
  const getImageUrl = useCallback(async () => {
    if (!receipt) return;
    
    try {
      const response = await apiCall('/api/s3/presigned-url', 'POST', {
        operation: 'getObject',
        key: receipt.filePath,
      });
      
      if (response.success) {
        setImageUrl(response.data.url);
        setShowImageDialog(true);
      }
    } catch (err) {
      console.error('Error getting image URL:', err);
    }
  }, [receipt, apiCall]);

  if (loading && !receipt) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h3>No receipt found</h3>
      </div>
    );
  }

  const metadata = receipt.metadata?.parsedData || {};
  const isProcessed = receipt.status === 'APPROVED' || receipt.status === 'REJECTED';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      <style>{`
        .receipt-review-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e0e0e0;
        }
        .navigation {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .btn {
          padding: 0.5rem 1rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          font-size: 0.875rem;
        }
        .btn:hover {
          background: #f5f5f5;
        }
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn-primary {
          background: #1976d2;
          color: white;
          border-color: #1976d2;
        }
        .btn-primary:hover {
          background: #1565c0;
        }
        .btn-success {
          background: #2e7d32;
          color: white;
          border-color: #2e7d32;
        }
        .btn-success:hover {
          background: #1b5e20;
        }
        .btn-danger {
          background: #d32f2f;
          color: white;
          border-color: #d32f2f;
        }
        .btn-danger:hover {
          background: #c62828;
        }
        .alert {
          padding: 1rem;
          margin-bottom: 1rem;
          border-radius: 4px;
          border: 1px solid transparent;
        }
        .alert-error {
          color: #721c24;
          background-color: #f8d7da;
          border-color: #f5c6cb;
        }
        .alert-success {
          color: #155724;
          background-color: #d4edda;
          border-color: #c3e6cb;
        }
        .alert-info {
          color: #0c5460;
          background-color: #d1ecf1;
          border-color: #bee5eb;
        }
        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }
        @media (max-width: 768px) {
          .grid {
            grid-template-columns: 1fr;
          }
        }
        .card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 1.5rem;
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .card h3 {
          margin-top: 0;
          margin-bottom: 1rem;
          color: #333;
        }
        .status-chip {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
        }
        .status-approved {
          background: #e8f5e8;
          color: #2e7d32;
        }
        .status-rejected {
          background: #ffebee;
          color: #d32f2f;
        }
        .status-pending {
          background: #fff3e0;
          color: #f57c00;
        }
        .status-processing {
          background: #e3f2fd;
          color: #1976d2;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333;
        }
        .form-control {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.875rem;
          box-sizing: border-box;
        }
        .form-control:focus {
          outline: none;
          border-color: #1976d2;
          box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 0.5rem;
        }
        .table th,
        .table td {
          padding: 0.5rem;
          text-align: left;
          border-bottom: 1px solid #e0e0e0;
        }
        .table th {
          font-weight: 500;
          background: #f5f5f5;
        }
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          border-radius: 8px;
          padding: 2rem;
          max-width: 90%;
          max-height: 90%;
          overflow: auto;
        }
        .modal-content img {
          max-width: 100%;
          height: auto;
        }
        .info-section {
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #f0f0f0;
        }
        .info-section:last-child {
          border-bottom: none;
        }
        .info-label {
          font-weight: 500;
          color: #666;
          margin-bottom: 0.5rem;
        }
        .actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid #e0e0e0;
        }
      `}</style>

      <div className="receipt-review-container">
        {/* Header */}
        <div className="header">
          <h1>Receipt Review</h1>
          
          {/* Navigation for pending receipts */}
          {!receiptId && pendingReceipts.length > 1 && (
            <div className="navigation">
              <button 
                className="btn"
                onClick={() => setCurrentReceiptIndex(currentReceiptIndex - 1)}
                disabled={currentReceiptIndex === 0}
              >
                Previous
              </button>
              <span>{currentReceiptIndex + 1} of {pendingReceipts.length}</span>
              <button 
                className="btn"
                onClick={() => setCurrentReceiptIndex(currentReceiptIndex + 1)}
                disabled={currentReceiptIndex === pendingReceipts.length - 1}
              >
                Next
              </button>
            </div>
          )}

          {onClose && (
            <button className="btn" onClick={onClose}>
              Close
            </button>
          )}
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert alert-error">
            {error}
            <button 
              style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => setError(null)}
            >
              ×
            </button>
          </div>
        )}
        
        {success && (
          <div className="alert alert-success">
            {success}
            <button 
              style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => setSuccess(null)}
            >
              ×
            </button>
          </div>
        )}

        <div className="grid">
          {/* Left Panel - Receipt Details */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Receipt Details</h3>
              <span className={`status-chip status-${receipt.status.toLowerCase()}`}>
                {receipt.status}
              </span>
            </div>

            {/* Basic Information */}
            <div className="info-section">
              <div className="info-label">File Information</div>
              <p><strong>File:</strong> {receipt.fileName}</p>
              <p><strong>Size:</strong> {(receipt.fileSize / 1024).toFixed(1)} KB</p>
              <p><strong>Type:</strong> {receipt.mimeType}</p>
              <p><strong>Uploaded:</strong> {formatDateTime(receipt.createdAt)}</p>
            </div>

            {/* Uploader Information */}
            <div className="info-section">
              <div className="info-label">Uploaded By</div>
              <p>{receipt.uploadedBy.firstName} {receipt.uploadedBy.lastName}</p>
              <p style={{ color: '#666' }}>{receipt.uploadedBy.email}</p>
            </div>

            {/* Trip/Truck Information */}
            {(receipt.trip || receipt.truck) && (
              <div className="info-section">
                <div className="info-label">Associated Details</div>
                {receipt.trip && (
                  <p><strong>Trip:</strong> {receipt.trip.tripNumber} ({receipt.trip.startLocation} → {receipt.trip.endLocation})</p>
                )}
                {receipt.truck && (
                  <p><strong>Truck:</strong> {receipt.truck.licensePlate} ({receipt.truck.make} {receipt.truck.model})</p>
                )}
              </div>
            )}

            {/* OCR Information */}
            {metadata && Object.keys(metadata).length > 0 && (
              <div className="info-section">
                <div className="info-label">OCR Extracted Data</div>
                {metadata.merchant && <p><strong>Merchant:</strong> {metadata.merchant}</p>}
                {metadata.confidence && <p><strong>OCR Confidence:</strong> {(metadata.confidence * 100).toFixed(1)}%</p>}
                {metadata.ocrProvider && <p><strong>OCR Provider:</strong> {metadata.ocrProvider}</p>}
              </div>
            )}

            {/* Receipt Items */}
            {metadata.items && metadata.items.length > 0 && (
              <div className="info-section">
                <div className="info-label">Line Items</div>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Qty</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metadata.items.map((item: ReceiptItem, index: number) => (
                      <tr key={index}>
                        <td>{item.description}</td>
                        <td>{item.quantity || 1}</td>
                        <td>{formatCurrency(item.amount, receipt.currency)}</td>
                      </tr>
                    ))}
                    {metadata.subtotal && (
                      <tr>
                        <td colSpan={2}><strong>Subtotal</strong></td>
                        <td><strong>{formatCurrency(metadata.subtotal, receipt.currency)}</strong></td>
                      </tr>
                    )}
                    {metadata.tax && (
                      <tr>
                        <td colSpan={2}><strong>Tax</strong></td>
                        <td><strong>{formatCurrency(metadata.tax, receipt.currency)}</strong></td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={getImageUrl}>
                View Image
              </button>
              
              <button 
                className="btn"
                onClick={async () => {
                  const imageUrl = await apiCall('/api/s3/presigned-url', 'POST', {
                    operation: 'getObject',
                    key: receipt.filePath,
                  });
                  if (imageUrl.success) {
                    window.open(imageUrl.data.url, '_blank');
                  }
                }}
              >
                Download
              </button>
            </div>
          </div>

          {/* Right Panel - Verification Form */}
          <div className="card">
            <h3>{isProcessed ? 'Verification Details' : 'Verify Receipt'}</h3>

            {isProcessed ? (
              // Show verification results
              <div>
                <div className={`alert ${receipt.status === 'APPROVED' ? 'alert-success' : 'alert-error'}`}>
                  This receipt has been {receipt.status.toLowerCase()}
                  {receipt.approvedBy && (
                    <> by {receipt.approvedBy.firstName} {receipt.approvedBy.lastName}</>
                  )}
                  {receipt.approvedAt && (
                    <> on {formatDateTime(receipt.approvedAt)}</>
                  )}
                </div>

                {receipt.rejectionReason && (
                  <div className="alert alert-info">
                    <strong>Rejection Reason:</strong> {receipt.rejectionReason}
                  </div>
                )}

                {receipt.metadata?.verifiedData && (
                  <div>
                    <div className="info-label">Verified Data</div>
                    <pre style={{ fontSize: '0.875rem', background: '#f5f5f5', padding: '8px', borderRadius: '4px', overflow: 'auto' }}>
                      {JSON.stringify(receipt.metadata.verifiedData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              // Show verification form
              <div>
                <div className="form-group">
                  <label className="form-label">Amount</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editedData.amount}
                    onChange={(e) => setEditedData({ ...editedData, amount: parseFloat(e.target.value) || 0 })}
                    step="0.01"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Currency</label>
                    <select
                      className="form-control"
                      value={editedData.currency}
                      onChange={(e) => setEditedData({ ...editedData, currency: e.target.value })}
                    >
                      <option value="USD">USD</option>
                      <option value="CAD">CAD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-control"
                      value={editedData.category}
                      onChange={(e) => setEditedData({ ...editedData, category: e.target.value })}
                    >
                      <option value="FUEL">Fuel</option>
                      <option value="TOLL">Toll</option>
                      <option value="PARKING">Parking</option>
                      <option value="MAINTENANCE">Maintenance</option>
                      <option value="DELIVERY">Delivery</option>
                      <option value="FOOD">Food</option>
                      <option value="ACCOMMODATION">Accommodation</option>
                      <option value="MISC">Miscellaneous</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editedData.description}
                    onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Merchant</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editedData.merchant}
                    onChange={(e) => setEditedData({ ...editedData, merchant: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Receipt Date</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={editedData.receiptDate}
                    onChange={(e) => setEditedData({ ...editedData, receiptDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Notes (Optional)</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any additional notes about this receipt..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Rejection Reason</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Required when rejecting a receipt..."
                  />
                  <small style={{ color: '#666' }}>This field is required when rejecting a receipt</small>
                </div>

                <div className="actions">
                  <button
                    className="btn btn-danger"
                    onClick={() => handleVerification('REJECTED')}
                    disabled={loading}
                  >
                    Reject
                  </button>
                  
                  <button
                    className="btn btn-success"
                    onClick={() => handleVerification('APPROVED')}
                    disabled={loading}
                  >
                    Approve
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Image Viewer Modal */}
        {showImageDialog && (
          <div className="modal" onClick={() => setShowImageDialog(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>Receipt Image</h3>
                <button className="btn" onClick={() => setShowImageDialog(false)}>Close</button>
              </div>
              
              {imageUrl ? (
                <img src={imageUrl} alt={receipt.fileName} />
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  Loading image...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptReviewPage;
