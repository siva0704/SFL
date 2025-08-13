import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  companyName: string;
  industry: string;
  adminEmail: string;
  adminPassword: string;
  adminFirstName: string;
  adminLastName: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  contact?: {
    phone?: string;
    website?: string;
  };
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

class AuthService {
  // Login
  async login(credentials: LoginCredentials) {
    return api.post('/auth/login', credentials);
  }

  // Register
  async register(data: RegisterData) {
    return api.post('/auth/register', data);
  }

  // Get current user
  async getCurrentUser() {
    return api.get('/auth/me');
  }

  // Logout
  async logout() {
    return api.post('/auth/logout');
  }

  // Change password
  async changePassword(data: ChangePasswordData) {
    return api.post('/auth/change-password', data);
  }

  // Forgot password
  async forgotPassword(data: ForgotPasswordData) {
    return api.post('/auth/forgot-password', data);
  }

  // Reset password
  async resetPassword(data: ResetPasswordData) {
    return api.post('/auth/reset-password', data);
  }

  // Check if token is valid
  isTokenValid(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  // Get token expiration time
  getTokenExpiration(): Date | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      return new Date(decoded.exp * 1000);
    } catch (error) {
      return null;
    }
  }

  // Clear auth data
  clearAuth(): void {
    localStorage.removeItem('token');
  }
}

export const authService = new AuthService(); 