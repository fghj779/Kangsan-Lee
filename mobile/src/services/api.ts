/**
 * API service with comprehensive error handling
 */
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const TOKEN_KEY = '@auth_token';
const REFRESH_TOKEN_KEY = '@refresh_token';

/**
 * Custom error class for API errors with detailed messages
 */
export class APIError extends Error {
  statusCode: number;
  type: string;
  details: any;

  constructor(message: string, statusCode: number, type: string = 'APIError', details: any = {}) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.type = type;
    this.details = details;
  }
}

/**
 * API Service class with error handling
 */
class APIService {
  private client: AxiosInstance;
  private isRefreshing: boolean = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000, // 15 second timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        try {
          const token = await AsyncStorage.getItem(TOKEN_KEY);
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        } catch (error) {
          console.error('Error reading auth token:', error);
          return config;
        }
      },
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );

    // Response interceptor for error handling and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Handle token expiration
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Wait for token refresh to complete
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                resolve(this.client(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);

            if (!refreshToken) {
              throw new APIError('No refresh token available', 401, 'AuthenticationError');
            }

            // Attempt to refresh the token
            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refresh_token: refreshToken,
            });

            const { access_token, refresh_token: newRefreshToken } = response.data;

            // Save new tokens
            await AsyncStorage.setItem(TOKEN_KEY, access_token);
            await AsyncStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);

            // Notify all waiting requests
            this.refreshSubscribers.forEach((callback) => callback(access_token));
            this.refreshSubscribers = [];

            // Retry original request
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
            }
            return this.client(originalRequest);

          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            await this.clearTokens();
            return Promise.reject(
              new APIError(
                'Session expired. Please log in again.',
                401,
                'AuthenticationError'
              )
            );
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Handle and transform errors into user-friendly messages
   */
  private handleError(error: any): APIError {
    // Network errors
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      return new APIError(
        'Network connection failed. Please check your internet connection and try again.',
        0,
        'NetworkError'
      );
    }

    // Timeout errors
    if (error.code === 'ECONNABORTED') {
      return new APIError(
        'Request timed out. Please try again.',
        0,
        'TimeoutError'
      );
    }

    // Server responded with error
    if (error.response) {
      const { status, data } = error.response;
      const errorMessage = data?.error?.message || data?.detail || 'An error occurred';
      const errorType = data?.error?.type || 'ServerError';
      const errorDetails = data?.error?.details || {};

      return new APIError(errorMessage, status, errorType, errorDetails);
    }

    // Request was made but no response received
    if (error.request) {
      return new APIError(
        'No response from server. Please try again later.',
        0,
        'NoResponseError'
      );
    }

    // Something else happened
    return new APIError(
      error.message || 'An unexpected error occurred',
      0,
      'UnknownError'
    );
  }

  /**
   * Save authentication tokens
   */
  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, accessToken);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } catch (error) {
      console.error('Error saving tokens:', error);
      throw new APIError(
        'Failed to save authentication data',
        0,
        'StorageError'
      );
    }
  }

  /**
   * Clear authentication tokens
   */
  async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      return !!token;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  /**
   * GET request with error handling
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * POST request with error handling
   */
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * PUT request with error handling
   */
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * DELETE request with error handling
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const apiService = new APIService();
export default apiService;
