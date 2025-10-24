import { useState } from 'react';

export default function Invoices() {
  const [invoices, setInvoices] = useState([
    {
      id: 'INV-2024-001',
      loadNumber: 'LD-001542',
      customer: 'Walmart Distribution',
      customerContact: 'John Smith - (555) 123-4567',
      amount: 4500.00,
      status: 'submitted',
      submissionDate: '2024-09-20',
      dueDate: '2024-10-20',
      pickupDate: '2024-09-18',
      deliveryDate: '2024-09-19',
      origin: 'Atlanta, GA',
      destination: 'Charlotte, NC',
      bolNumber: 'BOL-789123',
      poNumber: 'PO-WM-445566',
      advanceAmount: 4050.00,
      advanceRate: 90,
      factoringFee: 135.00,
      feeRate: 3.0,
      paymentStatus: 'advanced',
      advanceDate: '2024-09-21',
      documents: ['BOL', 'Rate Confirmation', 'Delivery Receipt']
    },
    {
      id: 'INV-2024-002',
      loadNumber: 'LD-001543',
      customer: 'Home Depot Supply',
      customerContact: 'Sarah Johnson - (555) 987-6543',
      amount: 3200.00,
      status: 'approved',
      submissionDate: '2024-09-21',
      dueDate: '2024-10-21',
      pickupDate: '2024-09-19',
      deliveryDate: '2024-09-20',
      origin: 'Miami, FL',
      destination: 'Tampa, FL',
      bolNumber: 'BOL-789124',
      poNumber: 'PO-HD-778899',
      advanceAmount: 2880.00,
      advanceRate: 90,
      factoringFee: 96.00,
      feeRate: 3.0,
      paymentStatus: 'pending_advance',
      advanceDate: null,
      documents: ['BOL', 'Rate Confirmation']
    },
    {
      id: 'INV-2024-003',
      loadNumber: 'LD-001544',
      customer: 'Amazon Logistics',
      customerContact: 'Mike Wilson - (555) 456-7890',
      amount: 5800.00,
      status: 'pending_review',
      submissionDate: '2024-09-22',
      dueDate: '2024-10-22',
      pickupDate: '2024-09-20',
      deliveryDate: '2024-09-21',
      origin: 'Los Angeles, CA',
      destination: 'Phoenix, AZ',
      bolNumber: 'BOL-789125',
      poNumber: 'PO-AMZ-112233',
      advanceAmount: 0,
      advanceRate: 90,
      factoringFee: 174.00,
      feeRate: 3.0,
      paymentStatus: 'not_advanced',
      advanceDate: null,
      documents: ['BOL']
    }
  ]);

  const [selectedInvoice, setSelectedInvoice] = useState(invoices[0]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [notification, setNotification] = useState(null);

  // Form state for creating/editing invoices
  const [formData, setFormData] = useState({
    loadNumber: '',
    customer: '',
    customerContact: '',
    amount: '',
    pickupDate: '',
    deliveryDate: '',
    origin: '',
    destination: '',
    bolNumber: '',
    poNumber: '',
    advanceRate: 90,
    feeRate: 3.0,
  });

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Create new invoice
  const handleCreateInvoice = (e) => {
    e.preventDefault();
    
    const newInvoice = {
      id: `INV-2024-${String(invoices.length + 1).padStart(3, '0')}`,
      loadNumber: formData.loadNumber,
      customer: formData.customer,
      customerContact: formData.customerContact,
      amount: parseFloat(formData.amount),
      status: 'pending_review',
      submissionDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      pickupDate: formData.pickupDate,
      deliveryDate: formData.deliveryDate,
      origin: formData.origin,
      destination: formData.destination,
      bolNumber: formData.bolNumber,
      poNumber: formData.poNumber,
      advanceAmount: 0,
      advanceRate: parseFloat(formData.advanceRate),
      factoringFee: parseFloat(formData.amount) * (parseFloat(formData.feeRate) / 100),
      feeRate: parseFloat(formData.feeRate),
      paymentStatus: 'not_advanced',
      advanceDate: null,
      documents: ['BOL']
    };

    setInvoices(prev => [newInvoice, ...prev]);
    setSelectedInvoice(newInvoice);
    setShowCreateModal(false);
    showNotification('Invoice created successfully!');
    
    // Reset form
    setFormData({
      loadNumber: '',
      customer: '',
      customerContact: '',
      amount: '',
      pickupDate: '',
      deliveryDate: '',
      origin: '',
      destination: '',
      bolNumber: '',
      poNumber: '',
      advanceRate: 90,
      feeRate: 3.0,
    });
  };

  // Update invoice status
  const updateInvoiceStatus = (invoiceId, newStatus) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === invoiceId ? { ...inv, status: newStatus } : inv
    ));
    if (selectedInvoice.id === invoiceId) {
      setSelectedInvoice(prev => ({ ...prev, status: newStatus }));
    }
    showNotification(`Invoice status updated to ${newStatus.replace('_', ' ')}`);
  };

  // Request advance
  const requestAdvance = (invoiceId) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        const advanceAmount = inv.amount * (inv.advanceRate / 100);
        return {
          ...inv,
          advanceAmount,
          paymentStatus: 'advanced',
          advanceDate: new Date().toISOString().split('T')[0]
        };
      }
      return inv;
    }));
    
    if (selectedInvoice.id === invoiceId) {
      const advanceAmount = selectedInvoice.amount * (selectedInvoice.advanceRate / 100);
      setSelectedInvoice(prev => ({
        ...prev,
        advanceAmount,
        paymentStatus: 'advanced',
        advanceDate: new Date().toISOString().split('T')[0]
      }));
    }
    
    showNotification('Advance payment requested successfully!', 'success');
  };

  // Download invoice as PDF
  const downloadInvoiceAsPDF = (invoice) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download the invoice');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoice.id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Arial', sans-serif;
              padding: 40px;
              color: #333;
              background: white;
            }
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 3px solid #2563eb;
            }
            .company-info h1 {
              color: #2563eb;
              font-size: 32px;
              margin-bottom: 8px;
            }
            .company-info p {
              color: #666;
              font-size: 14px;
              line-height: 1.6;
            }
            .invoice-number {
              text-align: right;
            }
            .invoice-number h2 {
              font-size: 28px;
              color: #1f2937;
              margin-bottom: 8px;
            }
            .invoice-number p {
              color: #666;
              font-size: 14px;
            }
            .status-badge {
              display: inline-block;
              padding: 6px 12px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: bold;
              margin-top: 8px;
            }
            .status-submitted { background: #dbeafe; color: #1e40af; }
            .status-approved { background: #d1fae5; color: #065f46; }
            .status-pending_review { background: #fef3c7; color: #92400e; }
            .status-paid { background: #d1fae5; color: #065f46; }
            .info-section {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin-bottom: 40px;
            }
            .info-block h3 {
              color: #1f2937;
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .info-block p {
              color: #4b5563;
              font-size: 14px;
              line-height: 1.8;
              margin-bottom: 4px;
            }
            .info-block .highlight {
              color: #1f2937;
              font-weight: 600;
            }
            .details-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            .details-table th {
              background: #f3f4f6;
              padding: 12px;
              text-align: left;
              font-size: 13px;
              font-weight: 600;
              color: #374151;
              border-bottom: 2px solid #e5e7eb;
            }
            .details-table td {
              padding: 12px;
              border-bottom: 1px solid #e5e7eb;
              font-size: 14px;
              color: #4b5563;
            }
            .summary-box {
              background: #f9fafb;
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              padding: 24px;
              margin-bottom: 30px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              font-size: 14px;
            }
            .summary-row.total {
              border-top: 2px solid #2563eb;
              margin-top: 12px;
              padding-top: 16px;
              font-size: 18px;
              font-weight: bold;
              color: #1f2937;
            }
            .summary-row .label {
              color: #6b7280;
            }
            .summary-row .value {
              color: #1f2937;
              font-weight: 600;
            }
            .summary-row.total .value {
              color: #2563eb;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
            }
            .payment-info {
              background: #eff6ff;
              border-left: 4px solid #2563eb;
              padding: 16px;
              margin-bottom: 30px;
              border-radius: 4px;
            }
            .payment-info h4 {
              color: #1e40af;
              font-size: 14px;
              margin-bottom: 8px;
            }
            .payment-info p {
              color: #1e40af;
              font-size: 13px;
              line-height: 1.6;
            }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <!-- Header -->
            <div class="header">
              <div class="company-info">
                <h1>🚛 Truck Management</h1>
                <p>Fleet Transportation Services<br>
                123 Logistics Avenue<br>
                Transport City, TC 12345<br>
                Phone: (555) 000-0000<br>
                Email: billing@truckmgmt.com</p>
              </div>
              <div class="invoice-number">
                <h2>${invoice.id}</h2>
                <p>Load: <strong>${invoice.loadNumber}</strong></p>
                <p>BOL: <strong>${invoice.bolNumber}</strong></p>
                <span class="status-badge status-${invoice.status}">
                  ${invoice.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>

            <!-- Bill To & Dates -->
            <div class="info-section">
              <div class="info-block">
                <h3>Bill To</h3>
                <p class="highlight">${invoice.customer}</p>
                <p>${invoice.customerContact}</p>
                <p>PO Number: <strong>${invoice.poNumber}</strong></p>
              </div>
              <div class="info-block">
                <h3>Invoice Details</h3>
                <p>Submission Date: <strong>${invoice.submissionDate}</strong></p>
                <p>Due Date: <strong>${invoice.dueDate}</strong></p>
                <p>Payment Terms: <strong>Net 30</strong></p>
              </div>
            </div>

            <!-- Shipment Details -->
            <table class="details-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Origin</strong></td>
                  <td>${invoice.origin}</td>
                </tr>
                <tr>
                  <td><strong>Destination</strong></td>
                  <td>${invoice.destination}</td>
                </tr>
                <tr>
                  <td><strong>Pickup Date</strong></td>
                  <td>${invoice.pickupDate}</td>
                </tr>
                <tr>
                  <td><strong>Delivery Date</strong></td>
                  <td>${invoice.deliveryDate}</td>
                </tr>
                <tr>
                  <td><strong>BOL Number</strong></td>
                  <td>${invoice.bolNumber}</td>
                </tr>
                <tr>
                  <td><strong>Load Number</strong></td>
                  <td>${invoice.loadNumber}</td>
                </tr>
              </tbody>
            </table>

            <!-- Payment Summary -->
            <div class="summary-box">
              <div class="summary-row">
                <span class="label">Freight Charges:</span>
                <span class="value">$${invoice.amount.toFixed(2)}</span>
              </div>
              <div class="summary-row">
                <span class="label">Factoring Fee (${invoice.feeRate}%):</span>
                <span class="value">-$${invoice.factoringFee.toFixed(2)}</span>
              </div>
              ${invoice.paymentStatus === 'advanced' || invoice.paymentStatus === 'pending_advance' ? `
              <div class="summary-row">
                <span class="label">Advance Rate (${invoice.advanceRate}%):</span>
                <span class="value">$${invoice.advanceAmount.toFixed(2)}</span>
              </div>
              ` : ''}
              <div class="summary-row total">
                <span class="label">Total Amount:</span>
                <span class="value">$${invoice.amount.toFixed(2)}</span>
              </div>
            </div>

            <!-- Payment Status -->
            ${invoice.paymentStatus === 'advanced' ? `
            <div class="payment-info">
              <h4>💰 Payment Status: ADVANCE PAID</h4>
              <p>Advance amount of $${invoice.advanceAmount.toFixed(2)} was paid on ${invoice.advanceDate}</p>
              <p>Remaining balance will be paid upon customer payment receipt.</p>
            </div>
            ` : invoice.paymentStatus === 'pending_advance' ? `
            <div class="payment-info">
              <h4>⏳ Payment Status: ADVANCE PENDING</h4>
              <p>Advance payment of $${invoice.advanceAmount.toFixed(2)} is being processed.</p>
            </div>
            ` : ''}

            <!-- Documents -->
            <div class="info-block">
              <h3>Attached Documents</h3>
              <p>${invoice.documents.join(', ')}</p>
            </div>

            <!-- Footer -->
            <div class="footer">
              <p><strong>Thank you for your business!</strong></p>
              <p>For questions about this invoice, contact us at billing@truckmgmt.com or call (555) 000-0000</p>
              <p style="margin-top: 12px;">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            </div>
          </div>

          <div class="no-print" style="text-align: center; margin-top: 30px;">
            <button onclick="window.print()" style="background: #2563eb; color: white; padding: 12px 24px; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; margin-right: 10px;">
              🖨️ Print / Save as PDF
            </button>
            <button onclick="window.close()" style="background: #6b7280; color: white; padding: 12px 24px; border: none; border-radius: 6px; font-size: 16px; cursor: pointer;">
              ✕ Close
            </button>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Delete invoice
  const deleteInvoice = (invoiceId) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
      if (selectedInvoice.id === invoiceId) {
        setSelectedInvoice(invoices[0]);
      }
      showNotification('Invoice deleted successfully', 'success');
    }
  };

  // Edit invoice
  const handleEditInvoice = (invoice) => {
    setFormData({
      loadNumber: invoice.loadNumber,
      customer: invoice.customer,
      customerContact: invoice.customerContact,
      amount: invoice.amount.toString(),
      pickupDate: invoice.pickupDate,
      deliveryDate: invoice.deliveryDate,
      origin: invoice.origin,
      destination: invoice.destination,
      bolNumber: invoice.bolNumber,
      poNumber: invoice.poNumber,
      advanceRate: invoice.advanceRate,
      feeRate: invoice.feeRate,
    });
    setShowEditModal(true);
  };

  // Save edited invoice
  const handleSaveEdit = (e) => {
    e.preventDefault();
    
    setInvoices(prev => prev.map(inv => {
      if (inv.id === selectedInvoice.id) {
        return {
          ...inv,
          loadNumber: formData.loadNumber,
          customer: formData.customer,
          customerContact: formData.customerContact,
          amount: parseFloat(formData.amount),
          pickupDate: formData.pickupDate,
          deliveryDate: formData.deliveryDate,
          origin: formData.origin,
          destination: formData.destination,
          bolNumber: formData.bolNumber,
          poNumber: formData.poNumber,
          advanceRate: parseFloat(formData.advanceRate),
          feeRate: parseFloat(formData.feeRate),
          factoringFee: parseFloat(formData.amount) * (parseFloat(formData.feeRate) / 100),
        };
      }
      return inv;
    }));

    setSelectedInvoice(prev => ({
      ...prev,
      loadNumber: formData.loadNumber,
      customer: formData.customer,
      customerContact: formData.customerContact,
      amount: parseFloat(formData.amount),
      pickupDate: formData.pickupDate,
      deliveryDate: formData.deliveryDate,
      origin: formData.origin,
      destination: formData.destination,
      bolNumber: formData.bolNumber,
      poNumber: formData.poNumber,
      advanceRate: parseFloat(formData.advanceRate),
      feeRate: parseFloat(formData.feeRate),
      factoringFee: parseFloat(formData.amount) * (parseFloat(formData.feeRate) / 100),
    }));

    setShowEditModal(false);
    showNotification('Invoice updated successfully!');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'approved': return 'bg-green-100 text-green-800 border border-green-200';
      case 'pending_review': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border border-red-200';
      case 'paid': return 'bg-purple-100 text-purple-800 border border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'advanced': return 'bg-green-100 text-green-800';
      case 'pending_advance': return 'bg-yellow-100 text-yellow-800';
      case 'not_advanced': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredInvoices = filterStatus === 'all' 
    ? invoices 
    : invoices.filter(invoice => invoice.status === filterStatus);

  const totalInvoiceAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalAdvanced = invoices.reduce((sum, inv) => sum + inv.advanceAmount, 0);
  const totalFees = invoices.reduce((sum, inv) => sum + inv.factoringFee, 0);
  const pendingInvoices = invoices.filter(inv => inv.status === 'pending_review').length;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)' }}>
      {/* Notification */}
      {notification && (
        <div style={{
          background: notification.type === 'success' 
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(251, 146, 60, 0.95) 0%, rgba(249, 115, 22, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${notification.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(251, 146, 60, 0.3)'}`,
          boxShadow: `0 8px 32px ${notification.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(251, 146, 60, 0.4)'}`
        }} className="fixed top-4 right-4 z-50 px-6 py-3 rounded-xl text-white font-semibold shadow-lg animate-fade-in">
          {notification.message}
        </div>
      )}

      {/* Professional Header */}
      <div style={{ 
        background: 'rgba(15, 23, 42, 0.8)', 
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(34, 211, 238, 0.1)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }} className="mb-8">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">Invoice Management</h1>
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{
                  background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(129, 140, 248, 0.2) 100%)',
                  border: '1px solid rgba(34, 211, 238, 0.3)',
                  color: '#22d3ee',
                  letterSpacing: '0.15em'
                }}>
                  ATONDA
                </span>
              </div>
              <p className="text-sm" style={{ color: 'rgba(148, 163, 184, 0.8)' }}>Submit, track, and manage your factoring invoices</p>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              style={{
                background: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
                boxShadow: '0 4px 15px rgba(34, 211, 238, 0.4)'
              }}
              className="px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2 hover:scale-105 transition-transform"
            >
              📄 Submit New Invoice
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8">
        {/* Dashboard Cards - Holographic */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(34, 211, 238, 0.1) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(34, 211, 238, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
          }} className="p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold mb-2" style={{ color: '#22d3ee' }}>Total Invoice Value</p>
                <p className="text-3xl font-bold text-white">${totalInvoiceAmount.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full" style={{ background: 'rgba(34, 211, 238, 0.2)' }}>
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(16, 185, 129, 0.1) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
          }} className="p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold mb-2" style={{ color: '#10b981' }}>Advanced Amount</p>
                <p className="text-3xl font-bold" style={{ color: '#10b981' }}>${totalAdvanced.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full" style={{ background: 'rgba(16, 185, 129, 0.2)' }}>
                <span className="text-2xl">💸</span>
              </div>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(251, 146, 60, 0.1) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(251, 146, 60, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
          }} className="p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold mb-2" style={{ color: '#fb923c' }}>Total Fees</p>
                <p className="text-3xl font-bold" style={{ color: '#fb923c' }}>${totalFees.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full" style={{ background: 'rgba(251, 146, 60, 0.2)' }}>
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(129, 140, 248, 0.1) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(129, 140, 248, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
          }} className="p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold mb-2" style={{ color: '#818cf8' }}>Pending Review</p>
                <p className="text-3xl font-bold" style={{ color: '#818cf8' }}>{pendingInvoices}</p>
              </div>
              <div className="p-3 rounded-full" style={{ background: 'rgba(129, 140, 248, 0.2)' }}>
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Invoice List */}
          <div className="lg:col-span-2">
            <div style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(34, 211, 238, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            }} className="rounded-2xl">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Invoice List</h2>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending_review">Pending Review</option>
                    <option value="approved">Approved</option>
                    <option value="submitted">Submitted</option>
                    <option value="rejected">Rejected</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className={`p-6 transition-colors ${
                      selectedInvoice.id === invoice.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => setSelectedInvoice(invoice)}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{invoice.id}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                            {invoice.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(invoice.paymentStatus)}`}>
                            {invoice.paymentStatus.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600">{invoice.customer}</p>
                        <p className="text-sm text-gray-600">{invoice.origin} → {invoice.destination}</p>
                        <p className="text-xs text-gray-500 mt-1">Load: {invoice.loadNumber} • BOL: {invoice.bolNumber}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">${invoice.amount.toLocaleString()}</p>
                        {invoice.advanceAmount > 0 && (
                          <p className="text-sm text-green-600">Advanced: ${invoice.advanceAmount.toLocaleString()}</p>
                        )}
                        <p className="text-xs text-gray-500 mb-2">Due: {invoice.dueDate}</p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadInvoiceAsPDF(invoice);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                          title="Download as PDF"
                        >
                          📄 PDF
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Invoice Details</h2>
              
              {selectedInvoice && (
                <div className="space-y-4">
                  {/* Basic Info */}
                  <div className="border-b border-gray-200 pb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{selectedInvoice.id}</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Customer:</span> {selectedInvoice.customer}</p>
                      <p><span className="font-medium">Contact:</span> {selectedInvoice.customerContact}</p>
                      <p><span className="font-medium">Load #:</span> {selectedInvoice.loadNumber}</p>
                      <p><span className="font-medium">BOL #:</span> {selectedInvoice.bolNumber}</p>
                      <p><span className="font-medium">PO #:</span> {selectedInvoice.poNumber}</p>
                    </div>
                  </div>

                  {/* Route Info */}
                  <div className="border-b border-gray-200 pb-4">
                    <h4 className="font-medium text-gray-900 mb-2">📍 Route Details</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Origin:</span> {selectedInvoice.origin}</p>
                      <p><span className="font-medium">Destination:</span> {selectedInvoice.destination}</p>
                      <p><span className="font-medium">Pickup:</span> {selectedInvoice.pickupDate}</p>
                      <p><span className="font-medium">Delivery:</span> {selectedInvoice.deliveryDate}</p>
                    </div>
                  </div>

                  {/* Financial Info */}
                  <div className="border-b border-gray-200 pb-4">
                    <h4 className="font-medium text-gray-900 mb-2">💰 Financial Details</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Invoice Amount:</span> ${selectedInvoice.amount.toLocaleString()}</p>
                      <p><span className="font-medium">Advance Rate:</span> {selectedInvoice.advanceRate}%</p>
                      <p><span className="font-medium">Advance Amount:</span> ${selectedInvoice.advanceAmount.toLocaleString()}</p>
                      <p><span className="font-medium">Factoring Fee:</span> ${selectedInvoice.factoringFee.toLocaleString()} ({selectedInvoice.feeRate}%)</p>
                      {selectedInvoice.advanceDate && (
                        <p><span className="font-medium">Advance Date:</span> {selectedInvoice.advanceDate}</p>
                      )}
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="border-b border-gray-200 pb-4">
                    <h4 className="font-medium text-gray-900 mb-2">📄 Documents</h4>
                    <div className="space-y-2">
                      {selectedInvoice.documents.map((doc, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <span className="text-green-600">✓</span>
                          <span>{doc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <button 
                      onClick={() => setShowDocumentsModal(true)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700"
                    >
                      📎 View Documents
                    </button>
                    <button 
                      type="button"
                      onClick={() => downloadInvoiceAsPDF(selectedInvoice)}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700"
                    >
                      📄 Download as PDF
                    </button>
                    <button 
                      onClick={() => handleEditInvoice(selectedInvoice)}
                      className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-purple-700"
                    >
                      ✏️ Edit Invoice
                    </button>
                    {selectedInvoice.status === 'pending_review' && (
                      <>
                        <button 
                          onClick={() => updateInvoiceStatus(selectedInvoice.id, 'approved')}
                          className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700"
                        >
                          ✅ Approve Invoice
                        </button>
                        <button 
                          onClick={() => updateInvoiceStatus(selectedInvoice.id, 'rejected')}
                          className="w-full bg-red-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-red-700"
                        >
                          ❌ Reject Invoice
                        </button>
                      </>
                    )}
                    {(selectedInvoice.status === 'approved' || selectedInvoice.status === 'submitted') && 
                     selectedInvoice.paymentStatus !== 'advanced' && (
                      <button 
                        onClick={() => requestAdvance(selectedInvoice.id)}
                        className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-yellow-700"
                      >
                        💰 Request Advance
                      </button>
                    )}
                    {selectedInvoice.status !== 'paid' && (
                      <button 
                        onClick={() => updateInvoiceStatus(selectedInvoice.id, 'paid')}
                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-indigo-700"
                      >
                        💳 Mark as Paid
                      </button>
                    )}
                    <button 
                      onClick={() => deleteInvoice(selectedInvoice.id)}
                      className="w-full bg-red-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-red-700"
                    >
                      🗑️ Delete Invoice
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📈 Factoring Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{invoices.length}</p>
              <p className="text-sm text-gray-600">Total Invoices</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {Math.round((totalAdvanced / totalInvoiceAmount) * 100)}%
              </p>
              <p className="text-sm text-gray-600">Average Advance Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {Math.round((totalFees / totalInvoiceAmount) * 100 * 100) / 100}%
              </p>
              <p className="text-sm text-gray-600">Average Fee Rate</p>
            </div>
          </div>
        </div>

        {/* Create Invoice Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                <h2 className="text-2xl font-bold text-gray-900">📄 Create New Invoice</h2>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleCreateInvoice} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Load Information */}
                  <div className="col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">🚛 Load Information</h3>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Load Number *</label>
                    <input
                      type="text"
                      name="loadNumber"
                      value={formData.loadNumber}
                      onChange={handleInputChange}
                      required
                      placeholder="LD-001545"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">BOL Number *</label>
                    <input
                      type="text"
                      name="bolNumber"
                      value={formData.bolNumber}
                      onChange={handleInputChange}
                      required
                      placeholder="BOL-789126"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PO Number</label>
                    <input
                      type="text"
                      name="poNumber"
                      value={formData.poNumber}
                      onChange={handleInputChange}
                      placeholder="PO-123456"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Amount *</label>
                    <input
                      type="number"
                      step="0.01"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      required
                      placeholder="0.00"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Customer Information */}
                  <div className="col-span-2 mt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 Customer Information</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                    <input
                      type="text"
                      name="customer"
                      value={formData.customer}
                      onChange={handleInputChange}
                      required
                      placeholder="Company Name"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Contact</label>
                    <input
                      type="text"
                      name="customerContact"
                      value={formData.customerContact}
                      onChange={handleInputChange}
                      placeholder="Contact Name - (555) 123-4567"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Route Information */}
                  <div className="col-span-2 mt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">📍 Route Information</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Origin *</label>
                    <input
                      type="text"
                      name="origin"
                      value={formData.origin}
                      onChange={handleInputChange}
                      required
                      placeholder="City, State"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Destination *</label>
                    <input
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleInputChange}
                      required
                      placeholder="City, State"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date *</label>
                    <input
                      type="date"
                      name="pickupDate"
                      value={formData.pickupDate}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date *</label>
                    <input
                      type="date"
                      name="deliveryDate"
                      value={formData.deliveryDate}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Financial Information */}
                  <div className="col-span-2 mt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Financial Terms</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Advance Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="advanceRate"
                      value={formData.advanceRate}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Factoring Fee (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="feeRate"
                      value={formData.feeRate}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create Invoice
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Invoice Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                <h2 className="text-2xl font-bold text-gray-900">✏️ Edit Invoice - {selectedInvoice.id}</h2>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSaveEdit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Same form fields as create modal */}
                  <div className="col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">🚛 Load Information</h3>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Load Number *</label>
                    <input
                      type="text"
                      name="loadNumber"
                      value={formData.loadNumber}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">BOL Number *</label>
                    <input
                      type="text"
                      name="bolNumber"
                      value={formData.bolNumber}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PO Number</label>
                    <input
                      type="text"
                      name="poNumber"
                      value={formData.poNumber}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Amount *</label>
                    <input
                      type="number"
                      step="0.01"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-2 mt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 Customer Information</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                    <input
                      type="text"
                      name="customer"
                      value={formData.customer}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Contact</label>
                    <input
                      type="text"
                      name="customerContact"
                      value={formData.customerContact}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-2 mt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">📍 Route Information</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Origin *</label>
                    <input
                      type="text"
                      name="origin"
                      value={formData.origin}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Destination *</label>
                    <input
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date *</label>
                    <input
                      type="date"
                      name="pickupDate"
                      value={formData.pickupDate}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date *</label>
                    <input
                      type="date"
                      name="deliveryDate"
                      value={formData.deliveryDate}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-2 mt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Financial Terms</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Advance Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="advanceRate"
                      value={formData.advanceRate}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Factoring Fee (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="feeRate"
                      value={formData.feeRate}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Documents Modal */}
        {showDocumentsModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                <h2 className="text-2xl font-bold text-gray-900">📄 Documents for {selectedInvoice.id}</h2>
                <button 
                  onClick={() => setShowDocumentsModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6">
                {/* Invoice Details Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border border-blue-100">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Customer</p>
                      <p className="font-semibold text-gray-900">{selectedInvoice.customer}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Load Number</p>
                      <p className="font-semibold text-gray-900">{selectedInvoice.loadNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Amount</p>
                      <p className="font-semibold text-gray-900">${selectedInvoice.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedInvoice.status)}`}>
                        {selectedInvoice.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Documents List */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📎 Attached Documents</h3>
                  <div className="space-y-3">
                    {selectedInvoice.documents.map((doc, index) => (
                      <div 
                        key={index} 
                        className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 rounded-lg p-3">
                              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{doc}</p>
                              <p className="text-sm text-gray-500">PDF Document</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => alert(`Viewing ${doc} for ${selectedInvoice.id}`)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                            >
                              👁️ View
                            </button>
                            <button
                              onClick={() => alert(`Downloading ${doc}`)}
                              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                            >
                              ⬇️ Download
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Document Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">➕ Add New Document</h3>
                  <div className="flex gap-3">
                    <input
                      type="file"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <button
                      onClick={() => showNotification('Document upload feature coming soon!')}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                    >
                      Upload
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Accepted formats: PDF, JPG, PNG (Max 10MB)</p>
                </div>

                {/* Close Button */}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowDocumentsModal(false)}
                    className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}