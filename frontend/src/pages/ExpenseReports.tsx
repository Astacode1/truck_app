import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { reportsApi } from '../services/api';

// Types for the expense report data
interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  expenseDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  truck?: {
    id: string;
    licensePlate: string;
    make: string;
    model: string;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  currency: string;
  createdAt: string;
}

interface ExpenseFilters {
  startDate: string;
  endDate: string;
  category: string;
  status: string;
  truck: string;
  driver: string;
}

interface SortConfig {
  key: keyof Expense | 'truckInfo' | 'driverName';
  direction: 'asc' | 'desc';
}

// API functions with fallbacks
const fetchExpenseDetails = async (filters: ExpenseFilters, page: number, limit: number) => {
  try {
    const response = await reportsApi.getExpenseDetails({
      start: filters.startDate,
      end: filters.endDate,
      category: filters.category || undefined,
      status: filters.status || undefined,
      truck: filters.truck || undefined,
      driver: filters.driver || undefined,
      page,
      limit,
    });
    return response.data;
  } catch (error) {
    // Fallback to mock data
    const mockExpenses: Expense[] = [
      {
        id: '1',
        amount: 125.50,
        category: 'Fuel',
        description: 'Gas station fill-up',
        expenseDate: '2024-01-15',
        status: 'APPROVED',
        truck: { id: '1', licensePlate: 'ABC-123', make: 'Ford', model: 'F-150' },
        user: { id: '1', firstName: 'John', lastName: 'Doe', email: 'john.doe@company.com' },
        currency: 'USD',
        createdAt: '2024-01-15T10:30:00Z',
      },
      {
        id: '2',
        amount: 420.00,
        category: 'Maintenance',
        description: 'Oil change and inspection',
        expenseDate: '2024-01-14',
        status: 'PENDING',
        truck: { id: '2', licensePlate: 'XYZ-789', make: 'Chevrolet', model: 'Silverado' },
        user: { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@company.com' },
        currency: 'USD',
        createdAt: '2024-01-14T14:20:00Z',
      },
      {
        id: '3',
        amount: 25.00,
        category: 'Tolls',
        description: 'Highway toll',
        expenseDate: '2024-01-13',
        status: 'APPROVED',
        truck: { id: '1', licensePlate: 'ABC-123', make: 'Ford', model: 'F-150' },
        user: { id: '1', firstName: 'John', lastName: 'Doe', email: 'john.doe@company.com' },
        currency: 'USD',
        createdAt: '2024-01-13T16:45:00Z',
      },
    ];

    return {
      expenses: mockExpenses,
      pagination: {
        currentPage: page,
        totalPages: 5,
        totalCount: 150,
        hasNext: page < 5,
        hasPrev: page > 1,
      },
    };
  }
};

const fetchExpenseCategories = async () => {
  try {
    const response = await reportsApi.getExpenseCategories();
    return response.data;
  } catch (error) {
    // Fallback to mock data
    return {
      categories: [
        { name: 'Fuel', count: 87, totalAmount: 12500 },
        { name: 'Maintenance', count: 34, totalAmount: 8200 },
        { name: 'Tolls', count: 28, totalAmount: 3100 },
        { name: 'Food', count: 7, totalAmount: 1620 },
      ],
    };
  }
};

const downloadCSV = async (filters: ExpenseFilters) => {
  try {
    await reportsApi.exportExpensesCSV({
      start: filters.startDate,
      end: filters.endDate,
      category: filters.category || undefined,
      status: filters.status || undefined,
      truck: filters.truck || undefined,
      driver: filters.driver || undefined,
    });
  } catch (error) {
    // Fallback CSV download
    const csvContent = 'ID,Date,Amount,Category,Description,Truck,Driver,Status\n1,2024-01-15,$125.50,Fuel,Gas station fill-up,ABC-123 (Ford F-150),John Doe,APPROVED\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_${filters.startDate}_to_${filters.endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
};

const ExpenseReports = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'desc' });
  const [filters, setFilters] = useState<ExpenseFilters>({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    category: '',
    status: '',
    truck: '',
    driver: '',
  });

  const { data: expenseData, isLoading: expensesLoading } = useQuery({
    queryKey: ['expense-details', filters, currentPage],
    queryFn: () => fetchExpenseDetails(filters, currentPage, 25),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: fetchExpenseCategories,
  });

  const handleFilterChange = (key: keyof ExpenseFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSort = (key: SortConfig['key']) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleExport = async () => {
    await downloadCSV(filters);
  };

  const sortedExpenses = useMemo(() => {
    if (!expenseData?.expenses) return [];

    const sorted = [...expenseData.expenses].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.key) {
        case 'truckInfo':
          aValue = a.truck ? `${a.truck.licensePlate} (${a.truck.make} ${a.truck.model})` : '';
          bValue = b.truck ? `${b.truck.licensePlate} (${b.truck.make} ${b.truck.model})` : '';
          break;
        case 'driverName':
          aValue = `${a.user.firstName} ${a.user.lastName}`;
          bValue = `${b.user.firstName} ${b.user.lastName}`;
          break;
        default:
          aValue = a[sortConfig.key as keyof Expense];
          bValue = b[sortConfig.key as keyof Expense];
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [expenseData?.expenses, sortConfig]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const SortIcon = ({ column }: { column: SortConfig['key'] }) => {
    if (sortConfig.key !== column) {
      return <span className="text-gray-400">↕️</span>;
    }
    return <span>{sortConfig.direction === 'asc' ? '↗️' : '↘️'}</span>;
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)' }}>
      {/* Professional Header */}
      <div style={{ 
        background: 'rgba(15, 23, 42, 0.8)', 
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(34, 211, 238, 0.1)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }} className="mb-8">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">Expense Reports</h1>
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{
                  background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(129, 140, 248, 0.2) 100%)',
                  border: '1px solid rgba(34, 211, 238, 0.3)',
                  color: '#22d3ee',
                  letterSpacing: '0.15em'
                }}>
                  ATONDA
                </span>
              </div>
              <p className="text-sm" style={{ color: 'rgba(148, 163, 184, 0.8)' }}>
                Detailed expense analysis and reporting
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleExport}
                style={{
                  background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
                  boxShadow: '0 4px 15px rgba(129, 140, 248, 0.4)'
                }}
                className="px-6 py-3 rounded-xl text-white font-semibold hover:scale-105 transition-transform"
              >
                📥 Export CSV
              </button>
              <button 
                style={{
                  background: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
                  boxShadow: '0 4px 15px rgba(34, 211, 238, 0.4)'
                }}
                className="px-6 py-3 rounded-xl text-white font-semibold hover:scale-105 transition-transform"
              >
                📊 Generate PDF Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8 space-y-6">
        {/* Filters - Holographic */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(34, 211, 238, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }} className="rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categoriesData?.categories.map((category) => (
                <option key={category.name} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Quick Date Filters */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quick Filters
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  const now = new Date();
                  setFilters(prev => ({
                    ...prev,
                    startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
                    endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
                  }));
                }}
                className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
              >
                This Month
              </button>
              <button
                onClick={() => {
                  const lastMonth = subMonths(new Date(), 1);
                  setFilters(prev => ({
                    ...prev,
                    startDate: format(startOfMonth(lastMonth), 'yyyy-MM-dd'),
                    endDate: format(endOfMonth(lastMonth), 'yyyy-MM-dd'),
                  }));
                }}
                className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
              >
                Last Month
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="card">
          <p className="text-sm font-medium text-gray-600">Total Expenses</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(sortedExpenses.reduce((sum, exp) => sum + exp.amount, 0))}
          </p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-gray-600">Total Receipts</p>
          <p className="text-2xl font-bold text-gray-900">{expenseData?.pagination.totalCount || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-gray-600">Average Amount</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(
              sortedExpenses.length > 0
                ? sortedExpenses.reduce((sum, exp) => sum + exp.amount, 0) / sortedExpenses.length
                : 0
            )}
          </p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-gray-600">Pending Review</p>
          <p className="text-2xl font-bold text-yellow-600">
            {sortedExpenses.filter(exp => exp.status === 'PENDING').length}
          </p>
        </div>
      </div>

      {/* Data Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('expenseDate')}
                >
                  Date <SortIcon column="expenseDate" />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('amount')}
                >
                  Amount <SortIcon column="amount" />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('category')}
                >
                  Category <SortIcon column="category" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('truckInfo')}
                >
                  Truck <SortIcon column="truckInfo" />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('driverName')}
                >
                  Driver <SortIcon column="driverName" />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  Status <SortIcon column="status" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expensesLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                sortedExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(expense.expenseDate), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {expense.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expense.truck ? (
                        <div>
                          <div className="font-medium">{expense.truck.licensePlate}</div>
                          <div className="text-gray-500">{expense.truck.make} {expense.truck.model}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">No truck assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{expense.user.firstName} {expense.user.lastName}</div>
                        <div className="text-gray-500">{expense.user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(expense.status)}`}>
                        {expense.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">View</button>
                        {expense.status === 'PENDING' && (
                          <>
                            <button className="text-green-600 hover:text-green-900">Approve</button>
                            <button className="text-red-600 hover:text-red-900">Reject</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {expenseData?.pagination && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing page {expenseData.pagination.currentPage} of {expenseData.pagination.totalPages}
              ({expenseData.pagination.totalCount} total records)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={!expenseData.pagination.hasPrev}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={!expenseData.pagination.hasNext}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default ExpenseReports;
