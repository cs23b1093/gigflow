# Freelance Platform API - Postman Testing Guide

## 📋 Setup Instructions

### 1. Import Collection and Environment
1. Open Postman
2. Click **Import** button
3. Import both files:
   - `Freelance-Platform-API.postman_collection.json`
   - `Freelance-Platform.postman_environment.json`
4. Select the **Freelance Platform Environment** in the top-right dropdown

### 2. Start the Server
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Server should be running on `http://localhost:5000`

## 🧪 Testing Workflow

### Phase 1: Authentication Testing
1. **Health Check** - Verify server is running
2. **Register User** - Creates first user (Client/Gig Owner)
   - Auto-saves `authToken` and `userId` to environment
3. **Login User** - Test login functionality
4. **Get Current User** - Verify authentication works
5. **Register Second User** - Creates freelancer account
   - Auto-saves `freelancerToken` and `freelancerId`

### Phase 2: Gig Management Testing
1. **Create Gig** - Post a new job (as Client)
   - Auto-saves `gigId` to environment
2. **Browse All Gigs** - Test public gig browsing with pagination
3. **Search Gigs** - Test search functionality
4. **Get Single Gig** - Test individual gig retrieval
5. **Update Gig** - Test gig modification (owner only)
6. **Get My Gigs** - Test user's own gigs

### Phase 3: Bidding System Testing
1. **Submit Bid** - Freelancer bids on gig
   - Auto-saves `bidId` to environment
   - Use `freelancerToken` for authentication
2. **Get Bids for Gig** - Client views all bids (owner only)
   - Use `authToken` (gig owner)
3. **Get My Bids** - Freelancer views their bids
4. **Get Bid Details** - View specific bid details
5. **Hire Freelancer** - Execute race-condition safe hiring

### Phase 4: Advanced Testing
1. **Test Race Conditions** - Run hiring request multiple times quickly
2. **Test Permissions** - Try accessing resources with wrong user
3. **Test Validation** - Send invalid data to endpoints

## 🔧 Environment Variables

The collection automatically manages these variables:

| Variable | Description | Auto-Set |
|----------|-------------|----------|
| `baseUrl` | Server URL | Manual |
| `authToken` | Client JWT token | ✅ |
| `freelancerToken` | Freelancer JWT token | ✅ |
| `userId` | Client user ID | ✅ |
| `freelancerId` | Freelancer user ID | ✅ |
| `gigId` | Created gig ID | ✅ |
| `bidId` | Submitted bid ID | ✅ |

## 📊 Expected Results

### Successful Authentication Flow
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Successful Gig Creation
```json
{
  "success": true,
  "message": "Gig created successfully",
  "data": {
    "gig": {
      "_id": "...",
      "title": "Build React E-commerce Website",
      "description": "...",
      "budget": 2500,
      "status": "open"
    }
  }
}
```

### Successful Hiring (Race-Condition Safe)
```json
{
  "success": true,
  "message": "Freelancer hired successfully",
  "data": {
    "bid": {
      "_id": "...",
      "status": "hired",
      "hiredAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

## 🚨 Testing Race Conditions

To test the race-condition safe hiring:

1. Create multiple bids on the same gig
2. Use Postman's **Runner** feature:
   - Select "Hire Freelancer" request
   - Set iterations to 5-10
   - Run simultaneously
3. Only one should succeed with `200 OK`
4. Others should fail with `409 Conflict`

## 🔍 Common Test Scenarios

### Test Invalid Authentication
- Remove `Authorization` header from protected routes
- Expect: `401 Unauthorized`

### Test Permission Violations
- Use `freelancerToken` to access gig owner endpoints
- Expect: `403 Forbidden`

### Test Validation Errors
- Send incomplete data (missing required fields)
- Expect: `400 Bad Request` with validation details

### Test Race Conditions
- Run hiring request multiple times quickly
- Expect: Only one `200 OK`, others `409 Conflict`

## 📝 Notes

- All requests include proper error handling
- Tokens are automatically managed by test scripts
- Environment variables are set automatically
- Collection includes comprehensive test coverage
- Race-condition testing validates transactional integrity

## 🐛 Troubleshooting

**Server not responding?**
- Check if MongoDB is running
- Verify server started on port 5000
- Check console for error messages

**Authentication failing?**
- Ensure tokens are being saved to environment
- Check if JWT_SECRET is set in .env file
- Verify user registration was successful

**Race condition tests not working?**
- Ensure multiple bids exist on same gig
- Use Postman Runner for concurrent requests
- Check server logs for transaction details