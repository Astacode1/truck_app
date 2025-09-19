import { useState, useEffect } from 'react';

// Simple dashboard without external dependencies for now
const AdminDashboard = () => {
  const [dateRange, setDateRange] = useState({
    start: '2024-01-01',
    end: '2024-01-31',
  });
  const [groupBy, setGroupBy] = React.useState('category');
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  // Fetch data effect
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [overviewRes, summaryRes] = await Promise.all([
          fetch('http://localhost:3001/api/reports/dashboard-overview'),
          fetch(`http://localhost:3001/api/reports/expenses-summary?start=${dateRange.start}&end=${dateRange.end}&groupBy=${groupBy}`)
        ]);

        const overview = await overviewRes.json();
        const summary = await summaryRes.json();

        setData({ overview, summary });
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange.start, dateRange.end, groupBy]);

  // Export handlers
  const handleExportCSV = () => {
    const url = `http://localhost:3001/api/reports/export/csv?start=${dateRange.start}&end=${dateRange.end}&groupBy=${groupBy}`;
    window.open(url, '_blank');
  };

  const handleExportPDF = () => {
    const url = `http://localhost:3001/api/reports/export/pdf?start=${dateRange.start}&end=${dateRange.end}&groupBy=${groupBy}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Comprehensive overview of fleet expenses and operations</p>
      </div>

      {/* Stats Cards */}
      {data?.overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month Expenses</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${data.overview.overview.thisMonth.totalAmount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  {data.overview.overview.thisMonth.totalCount} receipts
                </p>
                <p className="text-sm text-green-600">
                  ↗ {data.overview.overview.thisMonth.growth}% from last month
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Receipts</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {data.overview.overview.pending.receipts}
                </p>
                <p className="text-sm text-gray-500">Awaiting approval</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fleet Utilization</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {data.overview.overview.fleet.utilizationRate}%
                </p>
                <p className="text-sm text-gray-500">
                  {data.overview.overview.fleet.activeTrucks}/{data.overview.overview.fleet.totalTrucks} trucks active
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Drivers</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {data.overview.overview.drivers.total}
                </p>
                <p className="text-sm text-gray-500">Total registered</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            {/* Date Range Picker */}
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Group By Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group By</label>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="category">Category</option>
                <option value="truck">Truck</option>
                <option value="driver">Driver</option>
              </select>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={handleExportCSV}
              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Export CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      {data?.summary && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Expenses Summary - {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}
            </h3>
            <div className="text-sm text-gray-600">
              Total: ${data.summary.summary.totalAmount.toLocaleString()} | 
              {data.summary.summary.totalReceipts} receipts
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{data.summary.summary.approvedReceipts}</p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{data.summary.summary.pendingReceipts}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{data.summary.summary.rejectedReceipts}</p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">${data.summary.summary.averageExpense}</p>
              <p className="text-sm text-gray-600">Average</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">${data.summary.summary.totalAmount.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Breakdown by {groupBy}</h4>
            <div className="space-y-3">
              {data.summary.expenses.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5] }}></div>
                    <div>
                      <p className="font-medium text-gray-900">{item.groupBy}</p>
                      <p className="text-sm text-gray-600">{item.receiptCount} receipts</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${item.totalAmount.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{item.percentage}% | Avg: ${item.averageAmount.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm">
        Admin Dashboard • Last updated: {new Date().toLocaleString()}
      </div>
    </div>
  );
};

export default AdminDashboard;
