import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { reportsApi } from '../services/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Mock API functions - these would be implemented in a separate API service
const fetchDashboardOverview = async () => {
  try {
    const response = await reportsApi.getDashboardOverview();
    return response.data;
  } catch (error) {
    // Fallback to mock data
    return {
      overview: {
        thisMonth: {
          totalAmount: 25420,
          totalCount: 156,
          growth: 12,
        },
        thisYear: {
          totalAmount: 284650,
          totalCount: 1523,
        },
        pending: {
          receipts: 23,
        },
        fleet: {
          totalTrucks: 24,
          activeTrucks: 18,
          utilizationRate: 75,
        },
        drivers: {
          total: 32,
        },
      },
      sparklineData: [
        { date: '2024-01-01', amount: 1200 },
        { date: '2024-01-02', amount: 1800 },
        { date: '2024-01-03', amount: 950 },
        { date: '2024-01-04', amount: 2100 },
        { date: '2024-01-05', amount: 1650 },
        { date: '2024-01-06', amount: 1900 },
        { date: '2024-01-07', amount: 1450 },
      ],
    };
  }
};

const fetchExpensesSummary = async () => {
  try {
    const response = await reportsApi.getExpensesSummary({ groupBy: 'category' });
    return response.data;
  } catch (error) {
    // Fallback to mock data
    return {
      summary: {
        totalAmount: 25420,
        totalReceipts: 156,
        pendingReceipts: 23,
        approvedReceipts: 133,
        rejectedReceipts: 8,
        averageExpense: 163,
      },
      expenses: [
        { groupBy: 'Fuel', totalAmount: 12500, receiptCount: 87, percentage: 49 },
        { groupBy: 'Maintenance', totalAmount: 8200, receiptCount: 34, percentage: 32 },
        { groupBy: 'Tolls', totalAmount: 3100, receiptCount: 28, percentage: 12 },
        { groupBy: 'Food', totalAmount: 1620, receiptCount: 7, percentage: 7 },
      ],
    };
  }
};

// Color scheme for charts
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  growth?: number;
  icon: string;
  color?: 'default' | 'success' | 'warning' | 'danger';
}

function StatCard({ title, value, subtitle, growth, icon, color = 'default' }: StatCardProps) {
  const colorClasses = {
    default: 'bg-blue-50 text-blue-600',
    success: 'bg-green-50 text-green-600',
    warning: 'bg-yellow-50 text-yellow-600',
    danger: 'bg-red-50 text-red-600',
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          )}
          {growth !== undefined && (
            <div className="mt-2 flex items-center">
              <span className={`text-sm font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {growth >= 0 ? '↗' : '↘'} {Math.abs(growth)}%
              </span>
              <span className="ml-1 text-sm text-gray-500">vs last month</span>
            </div>
          )}
        </div>
        <div className={`rounded-lg p-3 ${colorClasses[color]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const currentMonth = format(new Date(), 'MMMM yyyy');

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: fetchDashboardOverview,
  });

  const { data: expensesSummary, isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses-summary', 'category'],
    queryFn: fetchExpensesSummary,
  });

  if (overviewLoading || expensesLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-80 bg-gray-200 rounded"></div>
          <div className="h-80 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white tracking-tight">Admin Dashboard</h1>
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
            Financial overview and fleet management insights for {currentMonth}
          </p>
        </div>
      </div>

      <div className="px-8 pb-8 space-y-6">
        {/* Overview Stats - Holographic */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Monthly Expenses"
          value={formatCurrency(overview?.overview.thisMonth.totalAmount || 0)}
          subtitle={`${overview?.overview.thisMonth.totalCount || 0} receipts`}
          growth={overview?.overview.thisMonth.growth}
          icon="💰"
          color="default"
        />
        
        <StatCard
          title="Pending Reviews"
          value={overview?.overview.pending.receipts || 0}
          subtitle="Awaiting approval"
          icon="⏳"
          color="warning"
        />
        
        <StatCard
          title="Fleet Utilization"
          value={`${overview?.overview.fleet.utilizationRate || 0}%`}
          subtitle={`${overview?.overview.fleet.activeTrucks || 0} of ${overview?.overview.fleet.totalTrucks || 0} active`}
          icon="🚛"
          color="success"
        />
        
        <StatCard
          title="Active Drivers"
          value={overview?.overview.drivers.total || 0}
          subtitle="Ready for dispatch"
          icon="👤"
          color="default"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Expense Trend Chart */}
        <div className="card">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Expense Trend</h3>
            <p className="text-sm text-gray-600">Daily expenses over the last 7 days</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={overview?.sparklineData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                  formatter={(value: number) => [formatCurrency(value), 'Amount']}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Categories Chart - Simple fallback for now */}
        <div className="card">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Expense Categories</h3>
            <p className="text-sm text-gray-600">Breakdown by category this month</p>
          </div>
          <div className="space-y-4">
            {(expensesSummary?.expenses || []).map((entry, index) => (
              <div key={entry.groupBy} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded mr-3"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="font-medium">{entry.groupBy}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatCurrency(entry.totalAmount)}</div>
                  <div className="text-sm text-gray-500">{entry.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top Categories */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Expense Categories</h3>
          <div className="space-y-3">
            {(expensesSummary?.expenses || []).slice(0, 4).map((category, index) => (
              <div key={category.groupBy} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-sm font-medium text-gray-900">{category.groupBy}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatCurrency(category.totalAmount)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {category.receiptCount} receipts
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full btn btn-primary text-left">
              📊 View Detailed Reports
            </button>
            <button className="w-full btn btn-secondary text-left">
              ⏳ Review Pending Receipts
            </button>
            <button className="w-full btn btn-secondary text-left">
              📥 Export Monthly Report
            </button>
            <button className="w-full btn btn-secondary text-left">
              🚛 Manage Fleet Status
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Receipt approved</p>
                <p className="text-xs text-gray-500">Fuel expense - $125.50</p>
                <p className="text-xs text-gray-400">2 minutes ago</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">New receipt uploaded</p>
                <p className="text-xs text-gray-500">Maintenance expense - $420.00</p>
                <p className="text-xs text-gray-400">15 minutes ago</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Trip completed</p>
                <p className="text-xs text-gray-500">Truck ABC-123 returned</p>
                <p className="text-xs text-gray-400">1 hour ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Annual Summary */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Year-to-Date Summary</h3>
            <p className="text-sm text-gray-600">Total expenses and insights for 2024</p>
          </div>
          <button className="btn btn-secondary">
            📊 View Annual Report
          </button>
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(overview?.overview.thisYear.totalAmount || 0)}
            </p>
            <p className="text-sm text-gray-600">Total Expenses</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {overview?.overview.thisYear.totalCount || 0}
            </p>
            <p className="text-sm text-gray-600">Total Receipts</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency((overview?.overview.thisYear.totalAmount || 0) / 12)}
            </p>
            <p className="text-sm text-gray-600">Monthly Average</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
