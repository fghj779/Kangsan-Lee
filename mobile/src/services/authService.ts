/**
 * Authentication service with comprehensive error handling
 */
import apiService, { APIError } from './api';

export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  role: string;
  is_active: boolean;
  contribution_score: number;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

/**
 * Authentication Service
 */
class AuthService {
  /**
   * Register a new user
   *
   * @param data Registration data
   * @returns Auth response with tokens and user data
   * @throws APIError with detailed error messages
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Validate input before sending
      this.validateRegistrationData(data);

      const response = await apiService.post<AuthResponse>('/auth/register', data);

      // Save tokens
      await apiService.saveTokens(response.access_token, response.refresh_token);

      return response;

    } catch (error) {
      if (error instanceof APIError) {
        // Handle specific error types
        if (error.statusCode === 409) {
          // Conflict - email or username already exists
          throw new APIError(
            error.message || 'An account with this email or username already exists',
            409,
            'ConflictError',
            error.details
          );
        } else if (error.statusCode === 422) {
          // Validation error
          throw new APIError(
            'Please check your input and try again',
            422,
            'ValidationError',
            error.details
          );
        }
      }
      throw error;
    }
  }

  /**
   * Login user
   *
   * @param credentials Login credentials
   * @returns Auth response with tokens and user data
   * @throws APIError with detailed error messages
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Validate input
      this.validateLoginCredentials(credentials);

      const response = await apiService.post<AuthResponse>('/auth/login', credentials);

      // Save tokens
      await apiService.saveTokens(response.access_token, response.refresh_token);

      return response;

    } catch (error) {
      if (error instanceof APIError) {
        // Handle authentication errors
        if (error.statusCode === 401) {
          throw new APIError(
            'Invalid email or password. Please try again.',
            401,
            'AuthenticationError'
          );
        }
      }
      throw error;
    }
  }

  /**
   * Logout user
   *
   * @throws APIError if logout fails
   */
  async logout(): Promise<void> {
    try {
      await apiService.clearTokens();
    } catch (error) {
      console.error('Logout error:', error);
      throw new APIError(
        'Failed to logout. Please try again.',
        0,
        'LogoutError'
      );
    }
  }

  /**
   * Get current user profile
   *
   * @returns Current user data
   * @throws APIError if request fails
   */
  async getCurrentUser(): Promise<User> {
    try {
      return await apiService.get<User>('/users/me');
    } catch (error) {
      if (error instanceof APIError && error.statusCode === 401) {
        // Not authenticated, clear tokens
        await apiService.clearTokens();
      }
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   *
   * @returns True if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    return await apiService.isAuthenticated();
  }

  /**
   * Validate registration data
   *
   * @param data Registration data
   * @throws APIError if validation fails
   */
  private validateRegistrationData(data: RegisterData): void {
    const errors: string[] = [];

    // Email validation
    if (!data.email) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(data.email)) {
      errors.push('Please enter a valid email address');
    }

    // Username validation
    if (!data.username) {
      errors.push('Username is required');
    } else if (data.username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    } else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
      errors.push('Username can only contain letters, numbers, and underscores');
    }

    // Password validation
    if (!data.password) {
      errors.push('Password is required');
    } else if (data.password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    } else if (!/[a-zA-Z]/.test(data.password)) {
      errors.push('Password must contain at least one letter');
    } else if (!/\d/.test(data.password)) {
      errors.push('Password must contain at least one number');
    }

    if (errors.length > 0) {
      throw new APIError(
        errors.join('. '),
        400,
        'ValidationError',
        { errors }
      );
    }
  }

  /**
   * Validate login credentials
   *
   * @param credentials Login credentials
   * @throws APIError if validation fails
   */
  private validateLoginCredentials(credentials: LoginCredentials): void {
    const errors: string[] = [];

    if (!credentials.email) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(credentials.email)) {
      errors.push('Please enter a valid email address');
    }

    if (!credentials.password) {
      errors.push('Password is required');
    }

    if (errors.length > 0) {
      throw new APIError(
        errors.join('. '),
        400,
        'ValidationError',
        { errors }
      );
    }
  }

  /**
   * Validate email format
   *
   * @param email Email address
   * @returns True if email is valid
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
