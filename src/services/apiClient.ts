import {
  AUTH_ENDPOINTS,
  GIG_ENDPOINTS,
  BID_ENDPOINTS,
  USER_ENDPOINTS,
  NOTIFICATION_ENDPOINTS,
  REVIEW_ENDPOINTS,
  MESSAGE_ENDPOINTS,
  UPLOAD_ENDPOINTS,
  ANALYTICS_ENDPOINTS,
  ApiResponse,
  PaginatedResponse,
  getAuthHeaders,
  getDefaultHeaders,
  HTTP_METHODS,
  STATUS_CODES
} from '../config/apiEndpoints';

// Types for API requests and responses
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'client' | 'freelancer';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'client' | 'freelancer';
  };
  token: string;
}

export interface CreateGigRequest {
  title: string;
  description: string;
  budget: number;
}

export interface SubmitBidRequest {
  gigId: string;
  message: string;
  price: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'freelancer';
  createdAt: string;
}

export interface Gig {
  _id: string;
  title: string;
  description: string;
  budget: number;
  ownerId: string;
  status: 'open' | 'assigned';
  hiredAt?: string;
  hiredBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bid {
  _id: string;
  gigId: string;
  freelancerId: string;
  message: string;
  price: number;
  status: 'pending' | 'hired' | 'rejected';
  hiredAt?: string;
  rejectedAt?: string;
  rejectedReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: 'client' | 'freelancer';
  avatar?: string;
  bio?: string;
  skills?: string[];
  location?: string;
  hourlyRate?: number;
  totalEarnings?: number;
  completedProjects?: number;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  type: 'hire' | 'bid_received' | 'bid_rejected' | 'message' | 'review';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

export interface Review {
  _id: string;
  fromUserId: string;
  toUserId: string;
  gigId?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'file' | 'image';
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UploadResponse {
  fileId: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface DashboardStats {
  totalGigs: number;
  totalBids: number;
  activeProjects: number;
  totalEarnings: number;
  completedProjects: number;
  averageRating: number;
  unreadNotifications: number;
  unreadMessages: number;
}

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private async makeRequest<T>(
    url: string,
    method: string = HTTP_METHODS.GET,
    body?: any,
    requiresAuth: boolean = false
  ): Promise<ApiResponse<T>> {
    try {
      const headers = requiresAuth 
        ? getAuthHeaders(this.getToken() || '')
        : getDefaultHeaders();

      const config: RequestInit = {
        method,
        headers,
        credentials: 'include', // Include cookies for session management
      };

      if (body && method !== HTTP_METHODS.GET) {
        config.body = JSON.stringify(body);
      }

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication Methods
  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return this.makeRequest<AuthResponse>(
      AUTH_ENDPOINTS.REGISTER,
      HTTP_METHODS.POST,
      userData
    );
  }

  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.makeRequest<AuthResponse>(
      AUTH_ENDPOINTS.LOGIN,
      HTTP_METHODS.POST,
      credentials
    );

    // Store token in localStorage on successful login
    if (response.success && response.data?.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.makeRequest(
      AUTH_ENDPOINTS.LOGOUT,
      HTTP_METHODS.POST,
      null,
      true
    );

    // Clear stored data on logout
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    return response;
  }

  async getMe(): Promise<ApiResponse<User>> {
    return this.makeRequest<User>(
      AUTH_ENDPOINTS.GET_ME,
      HTTP_METHODS.GET,
      null,
      true
    );
  }

  // Gig Methods
  async getGigs(params?: {
    page?: number;
    limit?: number;
    search?: string;
    minBudget?: number;
    maxBudget?: number;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const url = `${GIG_ENDPOINTS.GET_ALL}?${queryParams.toString()}`;
    return this.makeRequest<any>(url);
  }

  async getGig(id: string): Promise<ApiResponse<Gig>> {
    return this.makeRequest<Gig>(GIG_ENDPOINTS.GET_BY_ID(id));
  }

  async createGig(gigData: CreateGigRequest): Promise<ApiResponse<Gig>> {
    return this.makeRequest<Gig>(
      GIG_ENDPOINTS.CREATE,
      HTTP_METHODS.POST,
      gigData,
      true
    );
  }

  async updateGig(id: string, gigData: Partial<CreateGigRequest>): Promise<ApiResponse<Gig>> {
    return this.makeRequest<Gig>(
      GIG_ENDPOINTS.UPDATE(id),
      HTTP_METHODS.PUT,
      gigData,
      true
    );
  }

  async deleteGig(id: string): Promise<ApiResponse> {
    return this.makeRequest(
      GIG_ENDPOINTS.DELETE(id),
      HTTP_METHODS.DELETE,
      null,
      true
    );
  }

  async getMyGigs(): Promise<ApiResponse<Gig[]>> {
    return this.makeRequest<Gig[]>(
      GIG_ENDPOINTS.GET_MY_GIGS,
      HTTP_METHODS.GET,
      null,
      true
    );
  }

  // Bid Methods
  async submitBid(bidData: SubmitBidRequest): Promise<ApiResponse<Bid>> {
    return this.makeRequest<Bid>(
      BID_ENDPOINTS.SUBMIT,
      HTTP_METHODS.POST,
      bidData,
      true
    );
  }

  async getMyBids(params?: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'hired' | 'rejected';
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const url = `${BID_ENDPOINTS.GET_MY_BIDS}?${queryParams.toString()}`;
    return this.makeRequest<any>(url, HTTP_METHODS.GET, null, true);
  }

  async getBidDetails(bidId: string): Promise<ApiResponse<Bid>> {
    return this.makeRequest<Bid>(
      BID_ENDPOINTS.GET_BID_DETAILS(bidId),
      HTTP_METHODS.GET,
      null,
      true
    );
  }

  async getBidsForGig(gigId: string): Promise<ApiResponse<{ gig: Gig; bids: Bid[]; totalBids: number }>> {
    return this.makeRequest(
      BID_ENDPOINTS.GET_BIDS_FOR_GIG(gigId),
      HTTP_METHODS.GET,
      null,
      true
    );
  }

  async hireFreelancer(bidId: string): Promise<ApiResponse<Bid>> {
    return this.makeRequest<Bid>(
      BID_ENDPOINTS.HIRE_FREELANCER(bidId),
      HTTP_METHODS.PATCH,
      null,
      true
    );
  }

  // Utility Methods
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  clearAuth(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // User/Profile Methods
  async getUserProfile(userId: string): Promise<ApiResponse<UserProfile>> {
    return this.makeRequest<UserProfile>(
      USER_ENDPOINTS.GET_PROFILE(userId),
      HTTP_METHODS.GET,
      null,
      true
    );
  }

  async updateProfile(profileData: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    return this.makeRequest<UserProfile>(
      USER_ENDPOINTS.UPDATE_PROFILE,
      HTTP_METHODS.PUT,
      profileData,
      true
    );
  }

  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse> {
    return this.makeRequest(
      USER_ENDPOINTS.CHANGE_PASSWORD,
      HTTP_METHODS.PUT,
      passwordData,
      true
    );
  }

  async getUserGigs(userId: string): Promise<ApiResponse<Gig[]>> {
    return this.makeRequest<Gig[]>(
      USER_ENDPOINTS.GET_USER_GIGS(userId),
      HTTP_METHODS.GET,
      null,
      true
    );
  }

  async getUserReviews(userId: string): Promise<ApiResponse<Review[]>> {
    return this.makeRequest<Review[]>(
      USER_ENDPOINTS.GET_USER_REVIEWS(userId),
      HTTP_METHODS.GET,
      null,
      true
    );
  }

  // Notification Methods
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const url = `${NOTIFICATION_ENDPOINTS.GET_ALL}?${queryParams.toString()}`;
    return this.makeRequest<any>(url, HTTP_METHODS.GET, null, true);
  }

  async markNotificationRead(notificationId: string): Promise<ApiResponse> {
    return this.makeRequest(
      NOTIFICATION_ENDPOINTS.MARK_READ(notificationId),
      HTTP_METHODS.PATCH,
      null,
      true
    );
  }

  async markAllNotificationsRead(): Promise<ApiResponse> {
    return this.makeRequest(
      NOTIFICATION_ENDPOINTS.MARK_ALL_READ,
      HTTP_METHODS.PATCH,
      null,
      true
    );
  }

  async deleteNotification(notificationId: string): Promise<ApiResponse> {
    return this.makeRequest(
      NOTIFICATION_ENDPOINTS.DELETE(notificationId),
      HTTP_METHODS.DELETE,
      null,
      true
    );
  }

  async getUnreadNotificationCount(): Promise<ApiResponse<{ count: number }>> {
    return this.makeRequest<{ count: number }>(
      NOTIFICATION_ENDPOINTS.GET_UNREAD_COUNT,
      HTTP_METHODS.GET,
      null,
      true
    );
  }

  // Review Methods
  async createReview(reviewData: {
    toUserId: string;
    gigId?: string;
    rating: number;
    comment: string;
  }): Promise<ApiResponse<Review>> {
    return this.makeRequest<Review>(
      REVIEW_ENDPOINTS.CREATE,
      HTTP_METHODS.POST,
      reviewData,
      true
    );
  }

  async getReviewsForUser(userId: string): Promise<ApiResponse<Review[]>> {
    return this.makeRequest<Review[]>(
      REVIEW_ENDPOINTS.GET_FOR_USER(userId),
      HTTP_METHODS.GET,
      null,
      true
    );
  }

  async getReviewsForGig(gigId: string): Promise<ApiResponse<Review[]>> {
    return this.makeRequest<Review[]>(
      REVIEW_ENDPOINTS.GET_FOR_GIG(gigId),
      HTTP_METHODS.GET,
      null,
      true
    );
  }

  async updateReview(reviewId: string, reviewData: {
    rating?: number;
    comment?: string;
  }): Promise<ApiResponse<Review>> {
    return this.makeRequest<Review>(
      REVIEW_ENDPOINTS.UPDATE(reviewId),
      HTTP_METHODS.PUT,
      reviewData,
      true
    );
  }

  async deleteReview(reviewId: string): Promise<ApiResponse> {
    return this.makeRequest(
      REVIEW_ENDPOINTS.DELETE(reviewId),
      HTTP_METHODS.DELETE,
      null,
      true
    );
  }

  // Message/Chat Methods
  async getConversations(): Promise<ApiResponse<Conversation[]>> {
    return this.makeRequest<Conversation[]>(
      MESSAGE_ENDPOINTS.GET_CONVERSATIONS,
      HTTP_METHODS.GET,
      null,
      true
    );
  }

  async getConversation(conversationId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ conversation: Conversation; messages: Message[] }>> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const url = `${MESSAGE_ENDPOINTS.GET_CONVERSATION(conversationId)}?${queryParams.toString()}`;
    return this.makeRequest<{ conversation: Conversation; messages: Message[] }>(
      url,
      HTTP_METHODS.GET,
      null,
      true
    );
  }

  async sendMessage(messageData: {
    conversationId?: string;
    recipientId?: string;
    content: string;
    type?: 'text' | 'file' | 'image';
  }): Promise<ApiResponse<Message>> {
    return this.makeRequest<Message>(
      MESSAGE_ENDPOINTS.SEND_MESSAGE,
      HTTP_METHODS.POST,
      messageData,
      true
    );
  }

  async markConversationRead(conversationId: string): Promise<ApiResponse> {
    return this.makeRequest(
      MESSAGE_ENDPOINTS.MARK_READ(conversationId),
      HTTP_METHODS.PATCH,
      null,
      true
    );
  }

  async createConversation(participantId: string): Promise<ApiResponse<Conversation>> {
    return this.makeRequest<Conversation>(
      MESSAGE_ENDPOINTS.CREATE_CONVERSATION,
      HTTP_METHODS.POST,
      { participantId },
      true
    );
  }

  // File Upload Methods
  async uploadFile(file: File, type: 'file' | 'image' = 'file'): Promise<ApiResponse<UploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);

    const endpoint = type === 'image' ? UPLOAD_ENDPOINTS.UPLOAD_IMAGE : UPLOAD_ENDPOINTS.UPLOAD_FILE;

    try {
      const token = this.getToken();
      const response = await fetch(endpoint, {
        method: HTTP_METHODS.POST,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }

  async deleteFile(fileId: string): Promise<ApiResponse> {
    return this.makeRequest(
      UPLOAD_ENDPOINTS.DELETE_FILE(fileId),
      HTTP_METHODS.DELETE,
      null,
      true
    );
  }

  // Analytics Methods
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.makeRequest<DashboardStats>(
      ANALYTICS_ENDPOINTS.DASHBOARD_STATS,
      HTTP_METHODS.GET,
      null,
      true
    );
  }

  async getGigStats(gigId: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(
      ANALYTICS_ENDPOINTS.GIG_STATS(gigId),
      HTTP_METHODS.GET,
      null,
      true
    );
  }

  async getUserStats(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(
      ANALYTICS_ENDPOINTS.USER_STATS,
      HTTP_METHODS.GET,
      null,
      true
    );
  }

  async getEarnings(params?: {
    startDate?: string;
    endDate?: string;
    period?: 'daily' | 'weekly' | 'monthly';
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const url = `${ANALYTICS_ENDPOINTS.EARNINGS}?${queryParams.toString()}`;
    return this.makeRequest<any>(url, HTTP_METHODS.GET, null, true);
  }

  // Enhanced Bid Methods
  async updateBid(bidId: string, bidData: {
    message?: string;
    price?: number;
  }): Promise<ApiResponse<Bid>> {
    return this.makeRequest<Bid>(
      BID_ENDPOINTS.UPDATE_BID(bidId),
      HTTP_METHODS.PUT,
      bidData,
      true
    );
  }

  async deleteBid(bidId: string): Promise<ApiResponse> {
    return this.makeRequest(
      BID_ENDPOINTS.DELETE_BID(bidId),
      HTTP_METHODS.DELETE,
      null,
      true
    );
  }

  async acceptBid(bidId: string): Promise<ApiResponse<Bid>> {
    return this.makeRequest<Bid>(
      BID_ENDPOINTS.ACCEPT_BID(bidId),
      HTTP_METHODS.PATCH,
      null,
      true
    );
  }

  async rejectBid(bidId: string, reason?: string): Promise<ApiResponse<Bid>> {
    return this.makeRequest<Bid>(
      BID_ENDPOINTS.REJECT_BID(bidId),
      HTTP_METHODS.PATCH,
      { reason },
      true
    );
  }

  // Enhanced Gig Methods
  async searchGigs(params: {
    query?: string;
    category?: string;
    minBudget?: number;
    maxBudget?: number;
    location?: string;
    skills?: string[];
    sortBy?: 'newest' | 'budget_low' | 'budget_high' | 'deadline';
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(item => queryParams.append(key, item.toString()));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    const url = `${GIG_ENDPOINTS.SEARCH}?${queryParams.toString()}`;
    return this.makeRequest<any>(url, HTTP_METHODS.GET, null, true);
  }

  async getGigsByCategory(category: string): Promise<ApiResponse<Gig[]>> {
    return this.makeRequest<Gig[]>(
      GIG_ENDPOINTS.GET_BY_CATEGORY(category),
      HTTP_METHODS.GET,
      null,
      true
    );
  }

  async getFeaturedGigs(): Promise<ApiResponse<Gig[]>> {
    return this.makeRequest<Gig[]>(
      GIG_ENDPOINTS.GET_FEATURED,
      HTTP_METHODS.GET,
      null,
      true
    );
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default ApiClient;