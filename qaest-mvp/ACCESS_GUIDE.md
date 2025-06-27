# 🎯 QAest MVP - Access & Testing Guide

## 🚀 Server Status: RUNNING!

Your QAest backend server is now running successfully on:
- **Main URL**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **Demo API**: http://localhost:5000/api/demo

## 📱 How to Access the Application

### 1. **Backend API (Currently Running)**
The backend server is active and ready to handle requests. You can test it using:

#### A. **Web Browser**
Open your browser and visit:
- http://localhost:5000 - Main API info
- http://localhost:5000/health - Health status
- http://localhost:5000/api/demo - Sample test case data

#### B. **Command Line (Terminal)**
```bash
# Test health endpoint
curl http://localhost:5000/health

# Get demo test cases
curl http://localhost:5000/api/demo

# Test demo authentication
curl -X POST http://localhost:5000/api/auth/demo \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'

# Create a demo test case
curl -X POST http://localhost:5000/api/test-cases/demo \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Test Case",
    "description": "Testing the API",
    "priority": "high",
    "category": "API Testing"
  }'
```

### 2. **Frontend (React App)**
To start the frontend interface:

```bash
# From the qaest-mvp directory
cd frontend
npm start
```

This will open http://localhost:3000 in your browser.

## 🧪 Available Functionality to Test

### ✅ **Currently Working (Backend API)**

1. **Health Monitoring**
   - Server status check
   - API availability verification

2. **Demo Data Access**
   - Sample test cases with realistic data
   - User role simulation
   - Permission system preview

3. **Basic Authentication Simulation**
   - Demo login functionality
   - JWT token generation (demo)
   - User profile data

4. **Test Case Management Preview**
   - Create demo test cases
   - View test case structure
   - See data validation

### 🔄 **API Endpoints Available**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |
| GET | `/` | API information |
| GET | `/api/demo` | Sample test cases and user data |
| POST | `/api/auth/demo` | Demo authentication |
| POST | `/api/test-cases/demo` | Create demo test case |

## �� Interactive Testing

### Test 1: Health Check
```bash
curl http://localhost:5000/health
```
**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-06-27T...",
  "version": "1.0.0"
}
```

### Test 2: View Demo Test Cases
```bash
curl http://localhost:5000/api/demo
```
**Expected Response:**
```json
{
  "success": true,
  "message": "QAest API is working!",
  "data": {
    "testCases": [
      {
        "id": "TC-000001",
        "title": "User Login Functionality Test",
        "priority": "high",
        "status": "active",
        ...
      }
    ],
    "currentUser": {
      "username": "demo-user",
      "role": "senior_qa",
      ...
    }
  }
}
```

### Test 3: Demo Authentication
```bash
curl -X POST http://localhost:5000/api/auth/demo \
  -H "Content-Type: application/json" \
  -d '{"username": "qatest", "password": "demo123"}'
```

### Test 4: Create Demo Test Case
```bash
curl -X POST http://localhost:5000/api/test-cases/demo \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Password Reset Functionality",
    "description": "Test password reset flow",
    "priority": "medium",
    "category": "Authentication",
    "module": "User Management",
    "appType": "web",
    "osType": "cross_platform"
  }'
```

## 🌐 Browser Testing

1. **Open your web browser**
2. **Visit**: http://localhost:5000
3. **You should see**: Welcome message with API information
4. **Try these URLs**:
   - http://localhost:5000/health
   - http://localhost:5000/api/demo

## 📊 What You Can Explore

### 1. **Test Case Structure**
The demo API shows the complete test case data model including:
- Test Case ID (auto-generated)
- Title, Description, Priority
- Category, Module, App Type, OS Type
- Status tracking
- User ownership
- Timestamps

### 2. **Role-Based Access**
The demo shows different user roles:
- QA Lead, Senior QA, Junior QA
- Project Manager, Stakeholder
- Different permission levels

### 3. **API Response Format**
Consistent JSON response structure:
```json
{
  "success": true/false,
  "message": "Description",
  "data": { ... }
}
```

## 🔧 Next Steps

### To Start Frontend:
```bash
cd frontend
npm install  # if not already done
npm start    # starts on http://localhost:3000
```

### To Test Full Integration:
1. Keep backend running (already started)
2. Start frontend in another terminal
3. Access http://localhost:3000
4. Test the complete application

## 🆘 Troubleshooting

### If Server Stops:
```bash
cd backend
node server-basic.js &
```

### Check if Server is Running:
```bash
ps aux | grep "server-basic"
# or
curl http://localhost:5000/health
```

### Kill Server if Needed:
```bash
pkill -f "server-basic"
```

## 🎉 Success Indicators

✅ **Server Started**: You see the startup message
✅ **Health Check**: `/health` returns status "healthy"
✅ **Demo Data**: `/api/demo` returns test cases
✅ **API Working**: All curl commands return JSON responses

---

**🚀 Your QAest MVP backend is now running and ready for testing!**

**Next**: Start the frontend with `cd frontend && npm start` to see the complete application.

# 🚀 QAest MVP - Quick Access Guide

## 🔐 Login Information

### Demo Users Available:
| Username | Password | Role | Access Level |
|----------|----------|------|--------------|
| `demo-user` | `password123` | Senior QA | Create, Read, Update test cases |
| `qa-lead` | `lead123` | QA Lead | Full access to all features |
| `junior-qa` | `junior123` | Junior QA | Read and Create test cases |

## 🌐 Application URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Health Check**: http://localhost:8000/health

## 🚀 Quick Start (2 minutes)

### 1. Start Backend Server
```bash
cd qaest-mvp/backend
node server-basic.js
```
✅ Server should show "Ready to accept requests!" message

### 2. Start Frontend Application
```bash
cd qaest-mvp/frontend
npm start
```
✅ Browser should automatically open to http://localhost:3000

### 3. Login & Test
1. **Register a new account** or **Login** with `demo-user` / `password123`
2. **Create a test case** using the "Create Test Case" button
3. **Use the filters** to search and filter test cases by priority, creator, date, etc.
4. **Refresh the page** - your test case should still be there! 🎉
5. **Logout** and login as `qa-lead` to see the same test cases

## ✨ New Features Implemented

### 🔐 Authentication System
- ✅ **Login Screen**: Professional login interface
- ✅ **User Registration**: Self-service account creation with role selection
- ✅ **Session Persistence**: Stay logged in across browser sessions
- ✅ **Multiple User Roles**: Test different permission levels
- ✅ **Secure Logout**: Clean session termination
- ✅ **Registration Validation**: Username/email uniqueness checks

### 💾 Persistent Storage
- ✅ **Data Persistence**: Test cases survive server restarts
- ✅ **Auto-incrementing IDs**: Sequential TC-000001, TC-000002, etc.
- ✅ **Real-time Updates**: See changes immediately
- ✅ **Data Integrity**: Automatic backup and recovery

### 🎨 Enhanced UI
- ✅ **Modern Login/Registration Screen**: Clean, professional design
- ✅ **Advanced Filtering Panel**: Comprehensive search and filter options
- ✅ **User Information**: Display logged-in user details
- ✅ **Role Badges**: Visual role indicators
- ✅ **Better Forms**: Improved validation and placeholders
- ✅ **Logout Button**: Easy session management
- ✅ **Responsive Filter UI**: Collapsible filter panel with grid layout

## 🧪 Testing the Features

### Test Registration:
1. Click "Create New Account" on login screen ✅
2. Fill in all required fields and select a role ✅
3. Try registering with existing username/email (should fail) ❌
4. Register with unique details (should succeed) ✅
5. Automatically logged in after registration ✅

### Test Authentication:
1. Try logging in with wrong credentials ❌
2. Login with correct credentials ✅
3. Refresh page - should stay logged in ✅
4. Logout and verify you're logged out ✅

### Test Persistence:
1. Create a test case with title "My Test Case"
2. Refresh the browser - test case should still be there
3. Restart the backend server: `pkill -f server-basic.js && node server-basic.js`
4. Refresh frontend - test case should STILL be there! 🎉

### Test Filtering:
1. Click "Show Filters" to open the filter panel ✅
2. Try filtering by priority (high, medium, low) ✅
3. Filter by creator (select different users) ✅
4. Filter by status (active, draft, etc.) ✅
5. Use date range filters ✅
6. Search for text in title/description ✅
7. Combine multiple filters ✅
8. Click "Clear All" to reset filters ✅

### Test Multiple Users:
1. Register a new account or login as `demo-user`, create a test case
2. Logout and login as `qa-lead`
3. You should see the test case created by `demo-user`
4. Create another test case as `qa-lead`
5. Both test cases should be visible to both users
6. Use filters to see only your own test cases

## 🔧 Troubleshooting

### Backend Issues:
```bash
# Check if server is running
curl http://localhost:8000/health

# If not running, start it:
cd qaest-mvp/backend
node server-basic.js
```

### Frontend Issues:
```bash
# If frontend won't start:
cd qaest-mvp/frontend
npm install
npm start
```

### Port Conflicts:
- Backend uses port 8000 (changed from 5000 due to macOS AirPlay)
- Frontend uses port 3000
- If ports are busy, kill processes: `lsof -ti:8000 | xargs kill -9`

## 📊 Data Location

- **Persistent Data**: `qaest-mvp/backend/data.json`
- **Server Logs**: `qaest-mvp/backend/server.log`
- **User Sessions**: Browser localStorage

## 🎯 What's Working Now

✅ **Complete Authentication Flow**
✅ **User Registration System**
✅ **Advanced Search & Filtering**
✅ **Persistent Test Case Storage**
✅ **Multi-user Support**
✅ **Real-time UI Updates**
✅ **Form Validation**
✅ **Error Handling**
✅ **Responsive Design**
✅ **Session Management**

## 🚧 Known Limitations

- Simple file-based storage (not database)
- Demo-level security (not production-ready)
- No real-time collaboration between users
- Basic validation only

---

**Ready to test? Start with the Quick Start section above! 🚀**
