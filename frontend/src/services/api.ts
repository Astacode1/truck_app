import axios from 'axios';

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Trip API methods
export const tripApi = {
  // Get all trips with filters
  getTrips: (params?: Record<string, any>) => 
    api.get('/trips', { params }),

  // Get trip by ID
  getTripById: (id: string) => 
    api.get(`/trips/${id}`),

  // Create new trip
  createTrip: (tripData: any) => 
    api.post('/trips', tripData),

  // Update trip
  updateTrip: (id: string, tripData: any) => 
    api.patch(`/trips/${id}`, tripData),

  // Delete trip
  deleteTrip: (id: string) => 
    api.delete(`/trips/${id}`),

  // Assign driver to trip
  assignDriver: (tripId: string, driverId: string, notes?: string) => 
    api.post(`/trips/${tripId}/assign-driver`, { driverId, notes }),

  // Get trips for a specific driver
  getDriverTrips: (driverId: string, params?: Record<string, any>) => 
    api.get(`/drivers/${driverId}/trips`, { params }),

  // Get trip statistics
  getTripStats: (period?: string) => 
    api.get('/trips/dashboard/stats', { params: { period } }),
};

// User API methods
export const userApi = {
  // Get all users with filters
  getUsers: (params?: Record<string, any>) => 
    api.get('/users', { params }),

  // Get user by ID
  getUserById: (id: string) => 
    api.get(`/users/${id}`),

  // Create new user
  createUser: (userData: any) => 
    api.post('/users', userData),

  // Update user
  updateUser: (id: string, userData: any) => 
    api.patch(`/users/${id}`, userData),

  // Delete user
  deleteUser: (id: string) => 
    api.delete(`/users/${id}`),
};

// Truck API methods
export const truckApi = {
  // Get all trucks
  getTrucks: (params?: Record<string, any>) => 
    api.get('/trucks', { params }),

  // Get truck by ID
  getTruckById: (id: string) => 
    api.get(`/trucks/${id}`),

  // Create new truck
  createTruck: (truckData: any) => 
    api.post('/trucks', truckData),

  // Update truck
  updateTruck: (id: string, truckData: any) => 
    api.patch(`/trucks/${id}`, truckData),

  // Delete truck
  deleteTruck: (id: string) => 
    api.delete(`/trucks/${id}`),
};

// Auth API methods
export const authApi = {
  // Login
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),

  // Register
  register: (userData: any) => 
    api.post('/auth/register', userData),

  // Logout
  logout: () => 
    api.post('/auth/logout'),

  // Refresh token
  refreshToken: () => 
    api.post('/auth/refresh'),

  // Get current user profile
  getProfile: () => 
    api.get('/auth/me'),
};

// Receipt API methods
export const receiptApi = {
  // Upload receipt
  uploadReceipt: (formData: FormData) => 
    api.post('/receipts/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  // Get receipts
  getReceipts: (params?: Record<string, any>) => 
    api.get('/receipts', { params }),

  // Verify receipt
  verifyReceipt: (receiptId: string, verificationData: any) => 
    api.post(`/receipts/${receiptId}/verify`, verificationData),

  // Get pending receipts for verification
  getPendingReceipts: (params?: Record<string, any>) => 
    api.get('/receipts/pending', { params }),
};

// OCR API methods
export const ocrApi = {
  // Process image with OCR
  processImage: (formData: FormData) => 
    api.post('/ocr/process', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};

// Reports API methods
export const reportsApi = {
  // Get dashboard overview stats
  getDashboardOverview: () => 
    api.get('/reports/dashboard-overview'),

  // Get expenses summary with grouping
  getExpensesSummary: (params?: { start?: string; end?: string; groupBy?: string }) => 
    api.get('/reports/expenses-summary', { params }),

  // Get detailed expense report with pagination and filters
  getExpenseDetails: (params?: Record<string, any>) => 
    api.get('/reports/expense-details', { params }),

  // Get expense categories
  getExpenseCategories: () => 
    api.get('/reports/categories'),

  // Export expenses to CSV
  exportExpensesCSV: (params?: Record<string, any>) => 
    api.get('/reports/export/csv', { 
      params,
      responseType: 'blob',
    }),
};

// Export default api instance for backward compatibility
export default api;
