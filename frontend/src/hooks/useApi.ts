import { useState, useCallback } from 'react';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = useCallback(async <T = any>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      
      const config: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...headers,
        },
      };

      if (data && method !== 'GET') {
        config.body = JSON.stringify(data);
      }

      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}${endpoint}`, config);

      let responseData: ApiResponse<T>;
      
      try {
        responseData = await response.json();
      } catch {
        // If JSON parsing fails, create a basic response
        responseData = {
          success: response.ok,
          message: response.ok ? 'Success' : 'Request failed',
        };
      }

      if (!response.ok) {
        const errorMessage = responseData.message || responseData.error || `HTTP ${response.status}`;
        setError(errorMessage);
        
        // Handle authentication errors
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        
        return {
          success: false,
          message: errorMessage,
        };
      }

      return responseData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error';
      setError(errorMessage);
      
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    apiCall,
    clearError: () => setError(null),
  };
};
