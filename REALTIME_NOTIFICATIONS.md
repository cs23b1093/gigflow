# Real-time Notifications with Socket.io

This document explains how the real-time notification system works in the Freelance Platform API.

## Overview

The system uses Socket.io to provide instant notifications to users when important events occur, such as:
- **Hiring notifications**: When a client hires a freelancer
- **Bid notifications**: When someone places a bid on your gig
- **Rejection notifications**: When your bid is not selected

## Architecture

### Backend Components

1. **Socket Manager** (`src/config/socket.ts`)
   - Handles Socket.io server setup and user authentication
   - Manages user connections and rooms
   - Provides methods to send notifications to specific users

2. **Notification Service** (`src/services/notificationService.ts`)
   - High-level service for sending different types of notifications
   - Integrates with the Socket Manager
   - Provides typed notification interfaces

3. **Integration Points**
   - **Bid Controller**: Sends notifications when bids are placed, accepted, or rejected
   - **Server Setup**: Initializes Socket.io with HTTP server

### Key Features

- **Authentication**: Socket connections require valid JWT tokens
- **User Rooms**: Each user joins a personal room for targeted notifications
- **Real-time Delivery**: Notifications are delivered instantly to connected users
- **Offline Handling**: System gracefully handles offline users

## Frontend Integration

### Basic Connection

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token-here'
  }
});

socket.on('connect', () => {
  console.log('Connected to notification server');
});

socket.on('notification', (notification) => {
  console.log('Received notification:', notification);
  // Handle the notification in your UI
});
```

### Notification Structure

```typescript
interface NotificationData {
  type: 'hire' | 'bid_received' | 'bid_rejected';
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
}
```

### Example Notifications

**Hiring Notification (to Freelancer):**
```json
{
  "type": "hire",
  "title": "Congratulations! You've been hired!",
  "message": "You have been hired for \"Build a React App\"!",
  "data": {
    "projectName": "Build a React App",
    "clientName": "John Doe",
    "bidAmount": 500,
    "action": "hired"
  },
  "timestamp": "2024-01-13T10:30:00.000Z"
}
```

**Bid Received Notification (to Gig Owner):**
```json
{
  "type": "bid_received",
  "title": "New Bid Received",
  "message": "Jane Smith placed a bid of $450 on \"Build a React App\"",
  "data": {
    "projectName": "Build a React App",
    "freelancerName": "Jane Smith",
    "bidAmount": 450,
    "action": "bid_received"
  },
  "timestamp": "2024-01-13T10:25:00.000Z"
}
```

## Testing the System

### Using the Demo Page

1. Open `frontend-example.html` in your browser
2. Get your JWT token by logging into the API
3. Paste the token and click "Connect"
4. Perform actions that trigger notifications (hiring, bidding)
5. Watch for real-time notifications

### Manual Testing Steps

1. **Start the server**: `npm run dev`
2. **Login as Client**: Create account and login
3. **Login as Freelancer**: Create another account
4. **Create a Gig**: Client creates a gig
5. **Place a Bid**: Freelancer bids on the gig
6. **Hire Freelancer**: Client accepts the bid
7. **Observe Notifications**: Both users should receive real-time notifications

## API Endpoints Integration

The notification system is automatically integrated with these endpoints:

- `POST /api/bids` - Triggers bid received notification
- `PUT /api/bids/:bidId/hire` - Triggers hiring and rejection notifications

## Environment Setup

Make sure your `.env` file includes:
```
JWT_SECRET=your-secret-key
PORT=5000
```

## Frontend Framework Examples

### React Hook

```javascript
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export const useNotifications = (token) => {
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token) return;

    const newSocket = io('http://localhost:5000', {
      auth: { token }
    });

    newSocket.on('notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, [token]);

  return { notifications, socket };
};
```

### Vue.js Composition API

```javascript
import { ref, onMounted, onUnmounted } from 'vue';
import io from 'socket.io-client';

export function useNotifications(token) {
  const notifications = ref([]);
  let socket = null;

  onMounted(() => {
    if (!token.value) return;

    socket = io('http://localhost:5000', {
      auth: { token: token.value }
    });

    socket.on('notification', (notification) => {
      notifications.value.unshift(notification);
    });
  });

  onUnmounted(() => {
    if (socket) socket.close();
  });

  return { notifications };
}
```

## Security Considerations

- Socket connections require valid JWT authentication
- Users can only receive notifications intended for them
- All notifications are sent to user-specific rooms
- Connection attempts with invalid tokens are rejected

## Performance Notes

- The system uses efficient user-room mapping
- Offline users don't receive notifications (consider implementing a notification queue for production)
- Socket connections are automatically cleaned up on disconnect

## Troubleshooting

### Common Issues

1. **Connection Refused**: Check if server is running on correct port
2. **Authentication Failed**: Verify JWT token is valid and not expired
3. **No Notifications**: Ensure user is connected and events are being triggered
4. **CORS Issues**: Check CORS configuration in server setup

### Debug Mode

Enable debug logging by setting:
```javascript
localStorage.debug = 'socket.io-client:socket';
```

This will show detailed Socket.io connection logs in browser console.