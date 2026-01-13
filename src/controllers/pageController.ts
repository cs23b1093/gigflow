import { authManager } from '../utils/auth';
import { apiClient } from '../services/apiClient';
import { socketClient, NotificationData } from '../services/socketClient';
import SocketClient from '../services/socketClient';
import { router, ROUTES } from '../utils/router';

// Page Controllers for Client-Side Application
export class PageController {
  
  // Login Page Controller
  static async handleLoginPage(): Promise<void> {
    console.log('Loading login page...');
    
    // Redirect if already authenticated
    if (authManager.isAuthenticated()) {
      router.navigate(ROUTES.DASHBOARD);
      return;
    }

    // Request notification permission
    await SocketClient.requestNotificationPermission();
    
    // You can add DOM manipulation here for login form
    document.title = 'Login - Freelance Platform';
  }

  // Register Page Controller
  static async handleRegisterPage(): Promise<void> {
    console.log('Loading register page...');
    
    // Redirect if already authenticated
    if (authManager.isAuthenticated()) {
      router.navigate(ROUTES.DASHBOARD);
      return;
    }

    document.title = 'Register - Freelance Platform';
  }

  // Dashboard Page Controller
  static async handleDashboardPage(): Promise<void> {
    console.log('Loading dashboard page...');
    
    const user = authManager.getCurrentUser();
    if (!user) {
      router.navigate(ROUTES.LOGIN);
      return;
    }

    document.title = `Dashboard - ${user.name}`;

    try {
      // Load dashboard stats
      const statsResponse = await apiClient.getDashboardStats();
      if (statsResponse.success && statsResponse.data) {
        console.log('Dashboard stats:', statsResponse.data);
        PageController.updateDashboardStats(statsResponse.data);
      }

      // Load notifications
      const notificationsResponse = await apiClient.getNotifications({ limit: 5 });
      if (notificationsResponse.success && notificationsResponse.data) {
        console.log('Recent notifications:', notificationsResponse.data);
        PageController.updateNotificationsList(notificationsResponse.data);
      }

      if (user.role === 'client') {
        await PageController.loadClientDashboard();
      } else {
        await PageController.loadFreelancerDashboard();
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  }

  // Client Dashboard
  private static async loadClientDashboard(): Promise<void> {
    console.log('Loading client dashboard...');
    
    try {
      // Load client's gigs
      const gigsResponse = await apiClient.getMyGigs();
      if (gigsResponse.success && gigsResponse.data) {
        console.log('My gigs:', gigsResponse.data);
        // Update UI with gigs data
      }

      // Set up notification handlers for clients
      socketClient.onNotification((notification: NotificationData) => {
        if (notification.type === 'bid_received') {
          console.log('New bid received!', notification);
          // Show notification in UI
          PageController.showNotification(notification);
        }
      });

    } catch (error) {
      console.error('Error loading client dashboard:', error);
    }
  }

  // Freelancer Dashboard
  private static async loadFreelancerDashboard(): Promise<void> {
    console.log('Loading freelancer dashboard...');
    
    try {
      // Load freelancer's bids
      const bidsResponse = await apiClient.getMyBids();
      if (bidsResponse.success && bidsResponse.data) {
        console.log('My bids:', bidsResponse.data);
        // Update UI with bids data
      }

      // Load available gigs
      const gigsResponse = await apiClient.getGigs({ limit: 10 });
      if (gigsResponse.success && gigsResponse.data) {
        console.log('Available gigs:', gigsResponse.data);
        // Update UI with available gigs
      }

      // Set up notification handlers for freelancers
      socketClient.onNotification((notification: NotificationData) => {
        if (notification.type === 'hire') {
          console.log('🎉 You got hired!', notification);
          PageController.showHiringNotification(notification);
        } else if (notification.type === 'bid_rejected') {
          console.log('Bid rejected:', notification);
          PageController.showNotification(notification);
        }
      });

    } catch (error) {
      console.error('Error loading freelancer dashboard:', error);
    }
  }

  // Enhanced Gigs List Page Controller
  static async handleGigsPage(): Promise<void> {
    console.log('Loading gigs page...');
    
    document.title = 'Browse Gigs - Freelance Platform';

    try {
      // Load featured gigs first
      const featuredResponse = await apiClient.getFeaturedGigs();
      if (featuredResponse.success && featuredResponse.data) {
        console.log('Featured gigs:', featuredResponse.data);
        PageController.updateFeaturedGigs(featuredResponse.data);
      }

      // Load all gigs with pagination
      const response = await apiClient.getGigs({ limit: 20 });
      if (response.success && response.data) {
        console.log('Available gigs:', response.data);
        PageController.updateGigsList(response.data);
      }
    } catch (error) {
      console.error('Error loading gigs:', error);
    }
  }

  // Search Gigs
  static async handleGigSearch(searchParams: {
    query?: string;
    category?: string;
    minBudget?: number;
    maxBudget?: number;
    skills?: string[];
  }): Promise<void> {
    try {
      const response = await apiClient.searchGigs(searchParams);
      if (response.success && response.data) {
        console.log('Search results:', response.data);
        PageController.updateGigsList(response.data);
      }
    } catch (error) {
      console.error('Error searching gigs:', error);
    }
  }

  // Gig Details Page Controller
  static async handleGigDetailsPage(): Promise<void> {
    console.log('Loading gig details page...');
    
    const params = router.getPathParams('/gig/:id');
    const gigId = params.id;

    if (!gigId) {
      router.navigate(ROUTES.GIGS);
      return;
    }

    try {
      // Load gig details
      const gigResponse = await apiClient.getGig(gigId);
      if (gigResponse.success && gigResponse.data) {
        const gig = gigResponse.data;
        document.title = `${gig.title} - Freelance Platform`;
        console.log('Gig details:', gig);

        // If user is the gig owner, load bids
        const user = authManager.getCurrentUser();
        if (user && gig.ownerId === user.id) {
          const bidsResponse = await apiClient.getBidsForGig(gigId);
          if (bidsResponse.success && bidsResponse.data) {
            console.log('Bids for this gig:', bidsResponse.data.bids);
          }
        }
      }
    } catch (error) {
      console.error('Error loading gig details:', error);
    }
  }

  // My Gigs Page Controller (for clients)
  static async handleMyGigsPage(): Promise<void> {
    console.log('Loading my gigs page...');
    
    const user = authManager.getCurrentUser();
    if (!user || user.role !== 'client') {
      router.navigate(ROUTES.DASHBOARD);
      return;
    }

    document.title = 'My Gigs - Freelance Platform';

    try {
      const response = await apiClient.getMyGigs();
      if (response.success && response.data) {
        console.log('My gigs:', response.data);
        // Update UI with user's gigs
      }
    } catch (error) {
      console.error('Error loading my gigs:', error);
    }
  }

  // My Bids Page Controller (for freelancers)
  static async handleMyBidsPage(): Promise<void> {
    console.log('Loading my bids page...');
    
    const user = authManager.getCurrentUser();
    if (!user || user.role !== 'freelancer') {
      router.navigate(ROUTES.DASHBOARD);
      return;
    }

    document.title = 'My Bids - Freelance Platform';

    try {
      const response = await apiClient.getMyBids();
      if (response.success && response.data) {
        console.log('My bids:', response.data);
        // Update UI with user's bids
      }
    } catch (error) {
      console.error('Error loading my bids:', error);
    }
  }

  // Utility Methods for UI Updates
  static showNotification(notification: NotificationData): void {
    // Create a notification element in the UI
    const notificationElement = document.createElement('div');
    notificationElement.className = `notification notification-${notification.type}`;
    notificationElement.innerHTML = `
      <div class="notification-header">
        <strong>${notification.title}</strong>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
      <div class="notification-body">${notification.message}</div>
      <div class="notification-time">${new Date(notification.timestamp).toLocaleTimeString()}</div>
    `;

    // Add to notifications container (create if doesn't exist)
    let container = document.getElementById('notifications-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'notifications-container';
      container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        max-width: 400px;
      `;
      document.body.appendChild(container);
    }

    container.insertBefore(notificationElement, container.firstChild);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notificationElement.parentNode) {
        notificationElement.remove();
      }
    }, 5000);
  }

  static showHiringNotification(notification: NotificationData): void {
    // Special handling for hiring notifications
    PageController.showNotification(notification);
    
    // You could also show a modal or special celebration animation
    console.log('🎉 CONGRATULATIONS! You have been hired!');
    
    // Play celebration sound or show confetti animation
    // This is where you'd add special UI effects for hiring
  }

  // Form Handlers
  static async handleLogin(email: string, password: string): Promise<boolean> {
    try {
      const result = await authManager.login(email, password);
      if (result.success) {
        router.navigate(ROUTES.DASHBOARD);
        return true;
      } else {
        console.error('Login failed:', result.error);
        // Show error message in UI
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  static async handleRegister(userData: {
    name: string;
    email: string;
    password: string;
    role: 'client' | 'freelancer';
  }): Promise<boolean> {
    try {
      const result = await authManager.register(userData);
      if (result.success) {
        router.navigate(ROUTES.DASHBOARD);
        return true;
      } else {
        console.error('Registration failed:', result.error);
        // Show error message in UI
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  }

  static async handleLogout(): Promise<void> {
    await authManager.logout();
    router.navigate(ROUTES.LOGIN);
  }

  static async handleSubmitBid(gigId: string, message: string, price: number): Promise<boolean> {
    try {
      const response = await apiClient.submitBid({ gigId, message, price });
      if (response.success) {
        console.log('Bid submitted successfully');
        // Show success message and refresh bids
        return true;
      } else {
        console.error('Bid submission failed:', response.message);
        return false;
      }
    } catch (error) {
      console.error('Bid submission error:', error);
      return false;
    }
  }

  static async handleHireFreelancer(bidId: string): Promise<boolean> {
    try {
      const response = await apiClient.hireFreelancer(bidId);
      if (response.success) {
        console.log('Freelancer hired successfully');
        // Show success message and refresh UI
        return true;
      } else {
        console.error('Hiring failed:', response.message);
        return false;
      }
    } catch (error) {
      console.error('Hiring error:', error);
      return false;
    }
  }

  // New utility methods for UI updates
  static updateDashboardStats(stats: any): void {
    const elements = {
      totalGigs: document.getElementById('total-gigs'),
      totalBids: document.getElementById('total-bids'),
      activeProjects: document.getElementById('active-projects'),
      totalEarnings: document.getElementById('total-earnings'),
      completedProjects: document.getElementById('completed-projects'),
      averageRating: document.getElementById('average-rating'),
    };

    Object.entries(elements).forEach(([key, element]) => {
      if (element && stats[key] !== undefined) {
        element.textContent = stats[key].toString();
      }
    });
  }

  static updateNotificationsList(notifications: any[]): void {
    const container = document.getElementById('notifications-list');
    if (!container) return;

    container.innerHTML = notifications.map(notification => `
      <div class="notification-item ${notification.read ? 'read' : 'unread'}" data-id="${notification._id}">
        <div class="notification-title">${notification.title}</div>
        <div class="notification-message">${notification.message}</div>
        <div class="notification-time">${new Date(notification.createdAt).toLocaleString()}</div>
        ${!notification.read ? '<button onclick="markNotificationRead(\'' + notification._id + '\')">Mark Read</button>' : ''}
      </div>
    `).join('');
  }

  static updateFeaturedGigs(gigs: any[]): void {
    const container = document.getElementById('featured-gigs');
    if (!container) return;

    container.innerHTML = gigs.map(gig => `
      <div class="gig-card featured" data-id="${gig._id}">
        <div class="gig-title">${gig.title}</div>
        <div class="gig-description">${gig.description.substring(0, 100)}...</div>
        <div class="gig-budget">Budget: $${gig.budget}</div>
        <div class="gig-status">Status: ${gig.status}</div>
        <button onclick="navigateTo('/gig/${gig._id}')">View Details</button>
      </div>
    `).join('');
  }

  static updateGigsList(gigsData: any): void {
    const container = document.getElementById('gigs-list');
    if (!container) return;

    const gigs = gigsData.items || gigsData;
    
    container.innerHTML = gigs.map((gig: any) => `
      <div class="gig-card" data-id="${gig._id}">
        <div class="gig-title">${gig.title}</div>
        <div class="gig-description">${gig.description.substring(0, 150)}...</div>
        <div class="gig-budget">Budget: $${gig.budget}</div>
        <div class="gig-status">Status: ${gig.status}</div>
        <div class="gig-meta">
          <span>Posted: ${new Date(gig.createdAt).toLocaleDateString()}</span>
        </div>
        <div class="gig-actions">
          <button onclick="navigateTo('/gig/${gig._id}')">View Details</button>
          ${authManager.isFreelancer() && gig.status === 'open' ? 
            `<button onclick="showBidModal('${gig._id}')">Place Bid</button>` : ''}
        </div>
      </div>
    `).join('');
  }

  // Profile Management
  static async handleProfileUpdate(profileData: any): Promise<boolean> {
    try {
      const response = await apiClient.updateProfile(profileData);
      if (response.success) {
        console.log('Profile updated successfully');
        return true;
      } else {
        console.error('Profile update failed:', response.message);
        return false;
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    }
  }

  // Notification Management
  static async handleMarkNotificationRead(notificationId: string): Promise<void> {
    try {
      await apiClient.markNotificationRead(notificationId);
      // Update UI to mark as read
      const element = document.querySelector(`[data-id="${notificationId}"]`);
      if (element) {
        element.classList.remove('unread');
        element.classList.add('read');
        const button = element.querySelector('button');
        if (button) button.remove();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // File Upload Handler
  static async handleFileUpload(file: File, type: 'file' | 'image' = 'file'): Promise<string | null> {
    try {
      const response = await apiClient.uploadFile(file, type);
      if (response.success && response.data) {
        console.log('File uploaded successfully:', response.data);
        return response.data.url;
      } else {
        console.error('File upload failed:', response.message);
        return null;
      }
    } catch (error) {
      console.error('File upload error:', error);
      return null;
    }
  }

  // Review Management
  static async handleCreateReview(reviewData: {
    toUserId: string;
    gigId?: string;
    rating: number;
    comment: string;
  }): Promise<boolean> {
    try {
      const response = await apiClient.createReview(reviewData);
      if (response.success) {
        console.log('Review created successfully');
        return true;
      } else {
        console.error('Review creation failed:', response.message);
        return false;
      }
    } catch (error) {
      console.error('Review creation error:', error);
      return false;
    }
  }

  // Message/Chat Management
  static async handleSendMessage(messageData: {
    conversationId?: string;
    recipientId?: string;
    content: string;
  }): Promise<boolean> {
    try {
      const response = await apiClient.sendMessage(messageData);
      if (response.success) {
        console.log('Message sent successfully');
        return true;
      } else {
        console.error('Message sending failed:', response.message);
        return false;
      }
    } catch (error) {
      console.error('Message sending error:', error);
      return false;
    }
  }

  // Enhanced Bid Management
  static async handleUpdateBid(bidId: string, bidData: {
    message?: string;
    price?: number;
  }): Promise<boolean> {
    try {
      const response = await apiClient.updateBid(bidId, bidData);
      if (response.success) {
        console.log('Bid updated successfully');
        return true;
      } else {
        console.error('Bid update failed:', response.message);
        return false;
      }
    } catch (error) {
      console.error('Bid update error:', error);
      return false;
    }
  }

  static async handleDeleteBid(bidId: string): Promise<boolean> {
    try {
      const response = await apiClient.deleteBid(bidId);
      if (response.success) {
        console.log('Bid deleted successfully');
        return true;
      } else {
        console.error('Bid deletion failed:', response.message);
        return false;
      }
    } catch (error) {
      console.error('Bid deletion error:', error);
      return false;
    }
  }

  static async handleAcceptBid(bidId: string): Promise<boolean> {
    try {
      const response = await apiClient.acceptBid(bidId);
      if (response.success) {
        console.log('Bid accepted successfully');
        return true;
      } else {
        console.error('Bid acceptance failed:', response.message);
        return false;
      }
    } catch (error) {
      console.error('Bid acceptance error:', error);
      return false;
    }
  }

  static async handleRejectBid(bidId: string, reason?: string): Promise<boolean> {
    try {
      const response = await apiClient.rejectBid(bidId, reason);
      if (response.success) {
        console.log('Bid rejected successfully');
        return true;
      } else {
        console.error('Bid rejection failed:', response.message);
        return false;
      }
    } catch (error) {
      console.error('Bid rejection error:', error);
      return false;
    }
  }
}