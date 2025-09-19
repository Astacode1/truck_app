import React from 'react';
// import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

// Types
interface DashboardOverview {
  overview: {
    thisMonth: {
      totalAmount: number;
      totalCount: number;
      growth: number;
    };
    thisYear: {
      totalAmount: number;
      totalCount: number;
    };
    pending: {
      receipts: number;
    };
    fleet: {
      totalTrucks: number;
      activeTrucks: number;
      utilizationRate: number;
    };
    drivers: {
      total: number;
    };
  };
  sparklineData: Array<{
    date: string;
    amount: number;
  }>;
}

interface ExpensesSummary {
  summary: {
    totalAmount: number;
    totalReceipts: number;
    pendingReceipts: number;
    approvedReceipts: number;
    rejectedReceipts: number;
    averageExpense: number;
    dateRange: {
      start: string;
      end: string;
    };
    groupBy: string;
  };
  expenses: Array<{
    groupBy: string;
    totalAmount: number;
    receiptCount: number;
    percentage: number;
    averageAmount: number;
  }>;
}

// API functions
const fetchDashboardOverview = async (): Promise<DashboardOverview> => {
  const response = await fetch('http://localhost:3001/api/reports/dashboard-overview');
  if (!response.ok) throw new Error('Failed to fetch dashboard overview');
  return response.json();
};

const fetchExpensesSummary = async (params: {
  start?: string;
  end?: string;
  groupBy?: string;
}): Promise<ExpensesSummary> => {
  const queryParams = new URLSearchParams(params as Record<string, string>);
  const response = await fetch(`http://localhost:3001/api/reports/expenses-summary?${queryParams}`);
  if (!response.ok) throw new Error('Failed to fetch expenses summary');
  return response.json();
};

// Components
const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}> = ({ title, value, subtitle, trend, icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200',
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          {trend !== undefined && (
            <p className={`text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? '↗' : '↘'} {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const DateRangePicker: React.FC<{
  startDate: string;
  endDate: string;
  onDateChange: (start: string, end: string) => void;
}> = ({ startDate, endDate, onDateChange }) => {
  return (
    <div className="flex items-center space-x-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onDateChange(e.target.value, endDate)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onDateChange(startDate, e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

const ExportButtons: React.FC<{
  onExportCSV: () => void;
  onExportPDF: () => void;
}> = ({ onExportCSV, onExportPDF }) => {
  return (
    <div className="flex space-x-2">
      <button
        onClick={onExportCSV}
        className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        Export CSV
      </button>
      <button
        onClick={onExportPDF}
        className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        Export PDF
      </button>
    </div>
  );
};

// Main Dashboard Component
const AdminDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });
  const [groupBy, setGroupBy] = useState<'category' | 'truck' | 'driver'>('category');

  // Queries
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: fetchDashboardOverview,
  });

  const { data: expensesSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['expenses-summary', dateRange.start, dateRange.end, groupBy],
    queryFn: () => fetchExpensesSummary({
      start: dateRange.start,
      end: dateRange.end,
      groupBy,
    }),
  });

  // Export handlers
  const handleExportCSV = () => {
    const url = `http://localhost:3001/api/reports/export/csv?start=${dateRange.start}&end=${dateRange.end}&groupBy=${groupBy}`;
    window.open(url, '_blank');
  };

  const handleExportPDF = () => {
    const url = `http://localhost:3001/api/reports/export/pdf?start=${dateRange.start}&end=${dateRange.end}&groupBy=${groupBy}`;
    window.open(url, '_blank');
  };

  // Chart colors
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (overviewLoading || summaryLoading) {
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
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Comprehensive overview of fleet expenses and operations</p>
        </div>

        {/* Top Stats Cards */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="This Month Expenses"
              value={`$${overview.overview.thisMonth.totalAmount.toLocaleString()}`}
              subtitle={`${overview.overview.thisMonth.totalCount} receipts`}
              trend={overview.overview.thisMonth.growth}
              color="blue"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              }
            />
            <StatCard
              title="Pending Receipts"
              value={overview.overview.pending.receipts}
              subtitle="Awaiting approval"
              color="yellow"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatCard
              title="Fleet Utilization"
              value={`${overview.overview.fleet.utilizationRate}%`}
              subtitle={`${overview.overview.fleet.activeTrucks}/${overview.overview.fleet.totalTrucks} trucks active`}
              color="green"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            />
            <StatCard
              title="Active Drivers"
              value={overview.overview.drivers.total}
              subtitle="Total registered"
              color="blue"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
            />
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <DateRangePicker
                startDate={dateRange.start}
                endDate={dateRange.end}
                onDateChange={(start, end) => setDateRange({ start, end })}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Group By</label>
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value as 'category' | 'truck' | 'driver')}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="category">Category</option>
                  <option value="truck">Truck</option>
                  <option value="driver">Driver</option>
                </select>
              </div>
            </div>
            <ExportButtons onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />
          </div>
        </div>

        {/* Charts Section */}
        {overview && expensesSummary && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Expense Trend Chart */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={overview.sparklineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), 'MM/dd')} />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip
                    labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                    formatter={(value: number) => [`$${value}`, 'Amount']}
                  />
                  <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Expenses by Group Pie Chart */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Expenses by {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expensesSummary.expenses}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ groupBy, percentage }) => `${groupBy} (${percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="totalAmount"
                  >
                    {expensesSummary.expenses.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Detailed Breakdown */}
        {expensesSummary && (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Detailed Breakdown by {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}
              </h3>
              <div className="text-sm text-gray-600">
                Total: ${expensesSummary.summary.totalAmount.toLocaleString()} | 
                {expensesSummary.summary.totalReceipts} receipts
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={expensesSummary.expenses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="groupBy" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']} />
                  <Bar dataKey="totalAmount" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
              
              <div className="space-y-4">
                {expensesSummary.expenses.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.groupBy}</p>
                      <p className="text-sm text-gray-600">{item.receiptCount} receipts</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${item.totalAmount.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Avg: ${item.averageAmount.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
