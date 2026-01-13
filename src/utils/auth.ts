import { apiClient } from '../services/apiClient';
import { socketClient } from '../services/socketClient';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'freelancer';
}

// Authentication state management
export class AuthManager {
  private static instance: AuthManager;
  private currentUser: User | null = null;
  private authListeners: ((user: User | null) => void)[] = [];

  private constructor() {
    this.initializeAuth();
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  private initializeAuth(): void {
    // Check if user is already logged in
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        this.currentUser = JSON.parse(userStr);
        this.connectSocket(token);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.clearAuth();
      }
    }
  }

  private connectSocket(token: string): void {
    socketClient.connect(token);
  }

  private notifyAuthListeners(): void {
    this.authListeners.forEach(listener => {
      try {
        listener(this.currentUser);
      } catch (error) {
        console.error('Error in auth listener:', error);
      }
    });
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiClient.login({ email, password });
      
      if (response.success && response.data) {
        this.currentUser = response.data.user;
        this.connectSocket(response.data.token);
        this.notifyAuthListeners();
        return { success: true };
      } else {
        return { success: false, error: response.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
    }
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    role: 'client' | 'freelancer';
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiClient.register(userData);
      
      if (response.success && response.data) {
        this.currentUser = response.data.user;
        this.connectSocket(response.data.token);
        this.notifyAuthListeners();
        return { success: true };
      } else {
        return { success: false, error: response.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Registration failed' };
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
    }
  }

  private clearAuth(): void {
    this.currentUser = null;
    apiClient.clearAuth();
    socketClient.disconnect();
    this.notifyAuthListeners();
  }

  // Getters
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return !!this.currentUser && apiClient.isAuthenticated();
  }

  isClient(): boolean {
    return this.currentUser?.role === 'client';
  }

  isFreelancer(): boolean {
    return this.currentUser?.role === 'freelancer';
  }

  // Event listeners
  onAuthChange(listener: (user: User | null) => void): () => void {
    this.authListeners.push(listener);
    
    // Call immediately with current state
    listener(this.currentUser);
    
    // Return unsubscribe function
    return () => {
      const index = this.authListeners.indexOf(listener);
      if (index > -1) {
        this.authListeners.splice(index, 1);
      }
    };
  }

  // Token refresh (for future implementation)
  async refreshToken(): Promise<boolean> {
    try {
      const response = await apiClient.getMe();
      if (response.success && response.data) {
        this.currentUser = response.data;
        this.notifyAuthListeners();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearAuth();
      return false;
    }
  }
}

// Export singleton instance
export const authManager = AuthManager.getInstance();

// Route protection utilities
export const requireAuth = (redirectTo: string = '/login') => {
  if (typeof window === 'undefined') return false;
  
  if (!authManager.isAuthenticated()) {
    window.location.href = redirectTo;
    return false;
  }
  return true;
};

export const requireRole = (role: 'client' | 'freelancer', redirectTo: string = '/dashboard') => {
  if (typeof window === 'undefined') return false;
  
  if (!authManager.isAuthenticated()) {
    window.location.href = '/login';
    return false;
  }
  
  const user = authManager.getCurrentUser();
  if (user?.role !== role) {
    window.location.href = redirectTo;
    return false;
  }
  
  return true;
};

export const redirectIfAuthenticated = (redirectTo: string = '/dashboard') => {
  if (typeof window === 'undefined') return false;
  
  if (authManager.isAuthenticated()) {
    window.location.href = redirectTo;
    return true;
  }
  return false;
};