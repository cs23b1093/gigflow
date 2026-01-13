import SocketManager from '../config/socket';

export interface NotificationData {
  type: 'hire' | 'bid_received' | 'bid_rejected' | 'gig_completed';
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
}

class NotificationService {
  private socketManager: SocketManager | null = null;

  public setSocketManager(socketManager: SocketManager) {
    this.socketManager = socketManager;
  }

  // Send hiring notification to freelancer
  public async sendHiringNotification(
    freelancerId: string,
    projectName: string,
    clientName: string,
    bidAmount: number
  ) {
    if (!this.socketManager) {
      console.warn('Socket manager not initialized');
      return;
    }

    const notification: NotificationData = {
      type: 'hire',
      title: 'Congratulations! You\'ve been hired!',
      message: `You have been hired for "${projectName}"!`,
      data: {
        projectName,
        clientName,
        bidAmount,
        action: 'hired'
      },
      timestamp: new Date()
    };

    this.socketManager.sendNotificationToUser(freelancerId, notification);
  }

  // Send bid received notification to gig owner
  public async sendBidReceivedNotification(
    gigOwnerId: string,
    projectName: string,
    freelancerName: string,
    bidAmount: number
  ) {
    if (!this.socketManager) {
      console.warn('Socket manager not initialized');
      return;
    }

    const notification: NotificationData = {
      type: 'bid_received',
      title: 'New Bid Received',
      message: `${freelancerName} placed a bid of $${bidAmount} on "${projectName}"`,
      data: {
        projectName,
        freelancerName,
        bidAmount,
        action: 'bid_received'
      },
      timestamp: new Date()
    };

    this.socketManager.sendNotificationToUser(gigOwnerId, notification);
  }

  // Send bid rejection notification to freelancer
  public async sendBidRejectionNotification(
    freelancerId: string,
    projectName: string,
    reason?: string
  ) {
    if (!this.socketManager) {
      console.warn('Socket manager not initialized');
      return;
    }

    const notification: NotificationData = {
      type: 'bid_rejected',
      title: 'Bid Update',
      message: `Your bid for "${projectName}" was not selected`,
      data: {
        projectName,
        reason: reason || 'Another freelancer was hired',
        action: 'bid_rejected'
      },
      timestamp: new Date()
    };

    this.socketManager.sendNotificationToUser(freelancerId, notification);
  }

  // Check if user is online
  public isUserOnline(userId: string): boolean {
    return this.socketManager?.isUserOnline(userId) || false;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default NotificationService;