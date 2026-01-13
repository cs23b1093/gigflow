import { router, ROUTES } from './utils/router';
import { PageController } from './controllers/pageController';
import { authManager } from './utils/auth';
import { socketClient } from './services/socketClient';

// Main Application Class
class App {
  constructor() {
    this.initializeRoutes();
    this.initializeGlobalEventHandlers();
    this.initializeNotifications();
  }

  private initializeRoutes(): void {
    // Public routes
    router.addRoute({
      path: ROUTES.LOGIN,
      handler: PageController.handleLoginPage
    });

    router.addRoute({
      path: ROUTES.REGISTER,
      handler: PageController.handleRegisterPage
    });

    // Protected routes
    router.addRoute({
      path: ROUTES.DASHBOARD,
      handler: PageController.handleDashboardPage,
      requiresAuth: true
    });

    router.addRoute({
      path: ROUTES.GIGS,
      handler: PageController.handleGigsPage,
      requiresAuth: true
    });

    router.addRoute({
      path: '/gig/:id',
      handler: PageController.handleGigDetailsPage,
      requiresAuth: true
    });

    router.addRoute({
      path: ROUTES.MY_GIGS,
      handler: PageController.handleMyGigsPage,
      requiresAuth: true,
      allowedRoles: ['client']
    });

    router.addRoute({
      path: ROUTES.MY_BIDS,
      handler: PageController.handleMyBidsPage,
      requiresAuth: true,
      allowedRoles: ['freelancer']
    });

    // Default route
    router.addRoute({
      path: '/',
      handler: () => {
        if (authManager.isAuthenticated()) {
          router.navigate(ROUTES.DASHBOARD);
        } else {
          router.navigate(ROUTES.LOGIN);
        }
      }
    });
  }

  private initializeGlobalEventHandlers(): void {
    // Handle authentication state changes
    authManager.onAuthChange((user) => {
      console.log('Auth state changed:', user);
      this.updateUIForAuthState(user);
    });

    // Handle socket connection changes
    socketClient.onConnectionChange((connected) => {
      console.log('Socket connection changed:', connected);
      this.updateUIForConnectionState(connected);
    });

    // Handle global notifications
    socketClient.onNotification((notification) => {
      console.log('Global notification received:', notification);
      // This will be handled by individual page controllers
    });

    // Handle browser events
    window.addEventListener('beforeunload', () => {
      // Cleanup on page unload
      socketClient.disconnect();
    });

    // Handle network status
    window.addEventListener('online', () => {
      console.log('Network connection restored');
      // Reconnect socket if user is authenticated
      const token = localStorage.getItem('token');
      if (token && authManager.isAuthenticated()) {
        socketClient.connect(token);
      }
    });

    window.addEventListener('offline', () => {
      console.log('Network connection lost');
      // Socket will automatically disconnect
    });
  }

  private initializeNotifications(): void {
    // Request notification permission on app start
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }

  private updateUIForAuthState(user: any): void {
    // Update navigation, user info, etc.
    const userInfo = document.getElementById('user-info');
    const authButtons = document.getElementById('auth-buttons');
    const navMenu = document.getElementById('nav-menu');

    if (user) {
      // User is logged in
      if (userInfo) {
        userInfo.innerHTML = `
          <span>Welcome, ${user.name}</span>
          <span class="user-role">(${user.role})</span>
          <button onclick="handleLogout()">Logout</button>
        `;
      }

      if (authButtons) {
        authButtons.style.display = 'none';
      }

      if (navMenu) {
        navMenu.style.display = 'block';
        this.updateNavMenuForRole(user.role);
      }
    } else {
      // User is logged out
      if (userInfo) {
        userInfo.innerHTML = '';
      }

      if (authButtons) {
        authButtons.style.display = 'block';
      }

      if (navMenu) {
        navMenu.style.display = 'none';
      }
    }
  }

  private updateNavMenuForRole(role: 'client' | 'freelancer'): void {
    const navMenu = document.getElementById('nav-menu');
    if (!navMenu) return;

    const commonLinks = `
      <a href="/dashboard">Dashboard</a>
      <a href="/gigs">Browse Gigs</a>
    `;

    const roleSpecificLinks = role === 'client' 
      ? `<a href="/my-gigs">My Gigs</a>
         <a href="/create-gig">Create Gig</a>`
      : `<a href="/my-bids">My Bids</a>`;

    navMenu.innerHTML = commonLinks + roleSpecificLinks;
  }

  private updateUIForConnectionState(connected: boolean): void {
    const connectionStatus = document.getElementById('connection-status');
    if (connectionStatus) {
      connectionStatus.className = connected ? 'connected' : 'disconnected';
      connectionStatus.textContent = connected ? 'Connected' : 'Disconnected';
    }

    // Show/hide real-time features based on connection
    const realtimeFeatures = document.querySelectorAll('.realtime-feature');
    realtimeFeatures.forEach(element => {
      (element as HTMLElement).style.opacity = connected ? '1' : '0.5';
    });
  }
}

// Global functions for HTML event handlers
declare global {
  interface Window {
    handleLogin: (email: string, password: string) => Promise<void>;
    handleRegister: (userData: any) => Promise<void>;
    handleLogout: () => Promise<void>;
    handleSubmitBid: (gigId: string, message: string, price: number) => Promise<void>;
    handleHireFreelancer: (bidId: string) => Promise<void>;
    handleUpdateBid: (bidId: string, message: string, price: number) => Promise<void>;
    handleDeleteBid: (bidId: string) => Promise<void>;
    handleAcceptBid: (bidId: string) => Promise<void>;
    handleRejectBid: (bidId: string, reason?: string) => Promise<void>;
    handleCreateReview: (toUserId: string, rating: number, comment: string, gigId?: string) => Promise<void>;
    handleSendMessage: (recipientId: string, content: string) => Promise<void>;
    handleFileUpload: (file: File, type?: 'file' | 'image') => Promise<void>;
    handleProfileUpdate: (profileData: any) => Promise<void>;
    markNotificationRead: (notificationId: string) => Promise<void>;
    searchGigs: (searchParams: any) => Promise<void>;
    navigateTo: (path: string) => void;
    showBidModal: (gigId: string) => void;
    showReviewModal: (userId: string, gigId?: string) => void;
    showMessageModal: (userId: string) => void;
  }
}

// Expose global functions
window.handleLogin = async (email: string, password: string) => {
  await PageController.handleLogin(email, password);
};

window.handleRegister = async (userData: any) => {
  await PageController.handleRegister(userData);
};

window.handleLogout = async () => {
  await PageController.handleLogout();
};

window.handleSubmitBid = async (gigId: string, message: string, price: number) => {
  await PageController.handleSubmitBid(gigId, message, price);
};

window.handleHireFreelancer = async (bidId: string) => {
  await PageController.handleHireFreelancer(bidId);
};

window.handleUpdateBid = async (bidId: string, message: string, price: number) => {
  await PageController.handleUpdateBid(bidId, { message, price });
};

window.handleDeleteBid = async (bidId: string) => {
  await PageController.handleDeleteBid(bidId);
};

window.handleAcceptBid = async (bidId: string) => {
  await PageController.handleAcceptBid(bidId);
};

window.handleRejectBid = async (bidId: string, reason?: string) => {
  await PageController.handleRejectBid(bidId, reason);
};

window.handleCreateReview = async (toUserId: string, rating: number, comment: string, gigId?: string) => {
  await PageController.handleCreateReview({ toUserId, rating, comment, gigId });
};

window.handleSendMessage = async (recipientId: string, content: string) => {
  await PageController.handleSendMessage({ recipientId, content });
};

window.handleFileUpload = async (file: File, type: 'file' | 'image' = 'file') => {
  await PageController.handleFileUpload(file, type);
};

window.handleProfileUpdate = async (profileData: any) => {
  await PageController.handleProfileUpdate(profileData);
};

window.markNotificationRead = async (notificationId: string) => {
  await PageController.handleMarkNotificationRead(notificationId);
};

window.searchGigs = async (searchParams: any) => {
  await PageController.handleGigSearch(searchParams);
};

window.navigateTo = (path: string) => {
  router.navigate(path);
};

// Modal functions (to be implemented in your UI)
window.showBidModal = (gigId: string) => {
  console.log('Show bid modal for gig:', gigId);
  // Implement modal logic here
};

window.showReviewModal = (userId: string, gigId?: string) => {
  console.log('Show review modal for user:', userId, 'gig:', gigId);
  // Implement modal logic here
};

window.showMessageModal = (userId: string) => {
  console.log('Show message modal for user:', userId);
  // Implement modal logic here
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing Freelance Platform App...');
  new App();
});

// Export for module usage
export default App;