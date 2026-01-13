// Simple Node.js script to test Socket.io connection
const io = require('socket.io-client');

// Replace with a valid JWT token from your API
const TEST_TOKEN = 'your-jwt-token-here';

console.log('Testing Socket.io connection...');

const socket = io('http://localhost:5000', {
  auth: {
    token: TEST_TOKEN
  }
});

socket.on('connect', () => {
  console.log('✅ Successfully connected to Socket.io server');
  console.log('Socket ID:', socket.id);
});

socket.on('connect_error', (error) => {
  console.log('❌ Connection failed:', error.message);
});

socket.on('notification', (notification) => {
  console.log('🔔 Received notification:');
  console.log(JSON.stringify(notification, null, 2));
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Disconnected:', reason);
});

// Keep the script running
process.on('SIGINT', () => {
  console.log('\nClosing connection...');
  socket.close();
  process.exit(0);
});

console.log('Attempting to connect... (Press Ctrl+C to exit)');
console.log('Make sure to:');
console.log('1. Replace TEST_TOKEN with a valid JWT token');
console.log('2. Start the server with: npm run dev');
console.log('3. Trigger notifications by hiring freelancers or placing bids');