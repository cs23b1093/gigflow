// API Endpoints Configuration for Client Integration
export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
export const SOCKET_URL = process.env.SOCKET_URL || 'http://localhost:5000';

// Authentication Endpoints
export const AUTH_ENDPOINTS = {
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  GET_ME: `${API_BASE_URL}/auth/me`,
  REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh`,
} as const;

// Gig Endpoints
export const GIG_ENDPOINTS = {
  GET_ALL: `${API_BASE_URL}/gigs`,
  GET_BY_ID: (id: string) => `${API_BASE_URL}/gigs/${id}`,
  CREATE: `${API_BASE_URL}/gigs`,
  UPDATE: (id: string) => `${API_BASE_URL}/gigs/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/gigs/${id}`,
  GET_MY_GIGS: `${API_BASE_URL}/gigs/user/my-gigs`,
  SEARCH: `${API_BASE_URL}/gigs/search`,
  GET_BY_CATEGORY: (category: string) => `${API_BASE_URL}/gigs/category/${category}`,
  GET_FEATURED: `${API_BASE_URL}/gigs/featured`,
} as const;

// Bid Endpoints
export const BID_ENDPOINTS = {
  SUBMIT: `${API_BASE_URL}/bids`,
  GET_MY_BIDS: `${API_BASE_URL}/bids/my-bids`,
  GET_BID_DETAILS: (bidId: string) => `${API_BASE_URL}/bids/bid/${bidId}`,
  GET_BIDS_FOR_GIG: (gigId: string) => `${API_BASE_URL}/bids/${gigId}`,
  HIRE_FREELANCER: (bidId: string) => `${API_BASE_URL}/bids/${bidId}/hire`,
  UPDATE_BID: (bidId: string) => `${API_BASE_URL}/bids/${bidId}`,
  DELETE_BID: (bidId: string) => `${API_BASE_URL}/bids/${bidId}`,
  ACCEPT_BID: (bidId: string) => `${API_BASE_URL}/bids/${bidId}/accept`,
  REJECT_BID: (bidId: string) => `${API_BASE_URL}/bids/${bidId}/reject`,
} as const;

// User/Profile Endpoints
export const USER_ENDPOINTS = {
  GET_PROFILE: (userId: string) => `${API_BASE_URL}/users/${userId}`,
  UPDATE_PROFILE: `${API_BASE_URL}/users/profile`,
  UPLOAD_AVATAR: `${API_BASE_URL}/users/avatar`,
  GET_USER_GIGS: (userId: string) => `${API_BASE_URL}/users/${userId}/gigs`,
  GET_USER_REVIEWS: (userId: string) => `${API_BASE_URL}/users/${userId}/reviews`,
  CHANGE_PASSWORD: `${API_BASE_URL}/users/change-password`,
} as const;

// Notification Endpoints
export const NOTIFICATION_ENDPOINTS = {
  GET_ALL: `${API_BASE_URL}/notifications`,
  MARK_READ: (notificationId: string) => `${API_BASE_URL}/notifications/${notificationId}/read`,
  MARK_ALL_READ: `${API_BASE_URL}/notifications/mark-all-read`,
  DELETE: (notificationId: string) => `${API_BASE_URL}/notifications/${notificationId}`,
  GET_UNREAD_COUNT: `${API_BASE_URL}/notifications/unread-count`,
} as const;

// Review/Rating Endpoints
export const REVIEW_ENDPOINTS = {
  CREATE: `${API_BASE_URL}/reviews`,
  GET_FOR_USER: (userId: string) => `${API_BASE_URL}/reviews/user/${userId}`,
  GET_FOR_GIG: (gigId: string) => `${API_BASE_URL}/reviews/gig/${gigId}`,
  UPDATE: (reviewId: string) => `${API_BASE_URL}/reviews/${reviewId}`,
  DELETE: (reviewId: string) => `${API_BASE_URL}/reviews/${reviewId}`,
} as const;

// Message/Chat Endpoints
export const MESSAGE_ENDPOINTS = {
  GET_CONVERSATIONS: `${API_BASE_URL}/messages/conversations`,
  GET_CONVERSATION: (conversationId: string) => `${API_BASE_URL}/messages/conversations/${conversationId}`,
  SEND_MESSAGE: `${API_BASE_URL}/messages/send`,
  MARK_READ: (conversationId: string) => `${API_BASE_URL}/messages/conversations/${conversationId}/read`,
  CREATE_CONVERSATION: `${API_BASE_URL}/messages/conversations`,
} as const;

// File Upload Endpoints
export const UPLOAD_ENDPOINTS = {
  UPLOAD_FILE: `${API_BASE_URL}/upload/file`,
  UPLOAD_IMAGE: `${API_BASE_URL}/upload/image`,
  DELETE_FILE: (fileId: string) => `${API_BASE_URL}/upload/${fileId}`,
} as const;

// Analytics/Stats Endpoints
export const ANALYTICS_ENDPOINTS = {
  DASHBOARD_STATS: `${API_BASE_URL}/analytics/dashboard`,
  GIG_STATS: (gigId: string) => `${API_BASE_URL}/analytics/gig/${gigId}`,
  USER_STATS: `${API_BASE_URL}/analytics/user`,
  EARNINGS: `${API_BASE_URL}/analytics/earnings`,
} as const;

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

// Response Status Codes
export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  message?: string;
  data: {
    items: T[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      limit: number;
    };
  };
  error?: string;
}

// Request Headers
export const getAuthHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

export const getDefaultHeaders = () => ({
  'Content-Type': 'application/json',
});