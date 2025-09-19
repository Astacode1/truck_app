import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types for API responses
export interface DashboardOverview {
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
  lastUpdated: string;
}

export interface ExpensesSummary {
  summary: {
    totalAmount: number;
    totalReceipts: number;
    pendingReceipts: number;
    approvedReceipts: number;
    rejectedReceipts: number;
    averageExpense: number;
  };
  expenses: Array<{
    groupBy: string;
    totalAmount: number;
    receiptCount: number;
    percentage: number;
    truckId?: string;
    driverId?: string;
  }>;
  dateRange: {
    start: string;
    end: string;
  };
  groupBy: string;
}

export interface ExpenseDetail {
  id: string;
  amount: number;
  category: string;
  description: string;
  expenseDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  currency: string;
  createdAt: string;
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
}

export interface ExpenseDetailsResponse {
  expenses: ExpenseDetail[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ExpenseCategory {
  name: string;
  count: number;
  totalAmount: number;
}

// Reports API functions
export const reportsAPI = {
  // Get dashboard overview stats
  getDashboardOverview: async (): Promise<DashboardOverview> => {
    const response = await api.get('/reports/dashboard-overview');
    return response.data;
  },

  // Get expenses summary with grouping
  getExpensesSummary: async (params: {
    start?: string;
    end?: string;
    groupBy?: 'category' | 'truck' | 'driver';
  }): Promise<ExpensesSummary> => {
    const response = await api.get('/reports/expenses-summary', { params });
    return response.data;
  },

  // Get detailed expense report with pagination and filters
  getExpenseDetails: async (params: {
    start?: string;
    end?: string;
    truck?: string;
    driver?: string;
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ExpenseDetailsResponse> => {
    const response = await api.get('/reports/expense-details', { params });
    return response.data;
  },

  // Get expense categories
  getExpenseCategories: async (): Promise<{ categories: ExpenseCategory[] }> => {
    const response = await api.get('/reports/categories');
    return response.data;
  },

  // Export expenses to CSV
  exportExpensesCSV: async (params: {
    start?: string;
    end?: string;
    truck?: string;
    driver?: string;
    category?: string;
    status?: string;
  }): Promise<void> => {
    const response = await api.get('/reports/export/csv', {
      params,
      responseType: 'blob',
    });

    // Create download link
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename
    const dateRange = params.start && params.end 
      ? `${params.start}_to_${params.end}`
      : new Date().toISOString().split('T')[0];
    link.download = `expenses_${dateRange}.csv`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

// Additional utility functions for API calls
export const createQueryKey = (endpoint: string, params?: Record<string, any>) => {
  return params ? [endpoint, params] : [endpoint];
};

// Error handling utility
export const handleAPIError = (error: any) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export default api;
