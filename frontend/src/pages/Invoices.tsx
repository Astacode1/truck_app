import { useState } from 'react';

export default function Invoices() {
  const [invoices] = useState([
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoice Management</h1>
            <p className="text-gray-600 mt-1">Submit, track, and manage your factoring invoices</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 flex items-center gap-2"
          >
            📄 Submit New Invoice
          </button>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invoice Value</p>
                <p className="text-2xl font-bold text-gray-900">${totalInvoiceAmount.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Advanced Amount</p>
                <p className="text-2xl font-bold text-green-600">${totalAdvanced.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <span className="text-2xl">💸</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Fees</p>
                <p className="text-2xl font-bold text-red-600">${totalFees.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingInvoices}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Invoice List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
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
                    onClick={() => setSelectedInvoice(invoice)}
                    className={`p-6 cursor-pointer transition-colors ${
                      selectedInvoice.id === invoice.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
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
                        <p className="text-xs text-gray-500">Due: {invoice.dueDate}</p>
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
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700">
                      View Documents
                    </button>
                    <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700">
                      Download Invoice
                    </button>
                    {selectedInvoice.status === 'pending_review' && (
                      <button className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-yellow-700">
                        Request Advance
                      </button>
                    )}
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
      </div>
    </div>
  );
}