# QAest MVP - Test Case Management System

A modern, full-stack test case management application built with React and Node.js.

## 🚀 Features

### ✅ Authentication System
- **Login Screen**: Secure user authentication with role-based access
- **User Roles**: Support for QA Lead, Senior QA, Junior QA, Project Manager, and Stakeholder roles
- **Session Management**: Persistent login sessions with localStorage
- **Multiple Demo Users**: Pre-configured users for testing different roles

### ✅ Persistent Data Storage
- **File-based Storage**: Test cases persist across server restarts
- **Auto-incrementing IDs**: Sequential test case IDs (TC-000001, TC-000002, etc.)
- **Data Integrity**: Automatic data file initialization and error recovery

### ✅ Test Case Management
- **CRUD Operations**: Create, Read, Update, Delete test cases
- **Rich Metadata**: Priority, status, category, module, app type, OS type
- **User Attribution**: Track who created each test case
- **Real-time Updates**: Immediate UI updates after creating test cases

### ✅ Modern UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Material Design**: Clean, professional interface
- **Dashboard Statistics**: Real-time metrics and analytics
- **Form Validation**: Client-side validation with error handling
- **Loading States**: Smooth loading indicators and feedback

## 🔐 Demo Login Credentials

| Role | Username | Password | Permissions |
|------|----------|----------|-------------|
| Senior QA | `demo-user` | `password123` | Read, Create, Update |
| QA Lead | `qa-lead` | `lead123` | Full Access |
| Junior QA | `junior-qa` | `junior123` | Read, Create |

## 🛠️ Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### 1. Start Backend Server
```bash
cd backend
npm install
node server-basic.js
```
Server will start on http://localhost:8000

### 2. Start Frontend Application
```bash
cd frontend
npm install
npm start
```
Application will open at http://localhost:3000

### 3. Login & Test
1. Open http://localhost:3000
2. Use any of the demo credentials above
3. Create test cases and see them persist after refresh!

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /health` - Server health check

### Test Cases
- `GET /api/test-cases` - Get all test cases
- `POST /api/test-cases` - Create new test case

### Legacy/Demo (Backward Compatibility)
- `GET /api/demo` - Demo data endpoint
- `POST /api/test-cases/demo` - Demo test case creation

## 🗂️ Project Structure

```
qaest-mvp/
├── backend/
│   ├── server-basic.js     # Main server with auth & persistence
│   ├── data.json          # Persistent data storage
│   ├── server.log         # Server logs
│   └── package.json       # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── App.tsx        # Main React component with auth
│   │   ├── App.css        # Styling
│   │   └── index.tsx      # React entry point
│   └── package.json       # Frontend dependencies
├── test-auth.sh           # API testing script
└── README.md             # This file
```

## 🧪 Testing

### Manual Testing
1. Login with different user roles
2. Create test cases and verify they appear immediately
3. Refresh the page - test cases should persist
4. Logout and login as different user
5. Test form validation and error handling

### API Testing
```bash
./test-auth.sh
```

## 🔧 Technical Details

### Backend
- **Framework**: Express.js with CORS support
- **Authentication**: Simple username/password with JWT-like tokens
- **Storage**: JSON file-based persistence (easily replaceable with database)
- **Security**: Input validation and error handling

### Frontend
- **Framework**: React 18 with TypeScript
- **State Management**: React hooks with localStorage persistence
- **Styling**: Inline styles with responsive design
- **API Integration**: Fetch API with error handling

### Data Model
```typescript
interface TestCase {
  id: string;           // TC-XXXXXX format
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'active' | 'passed' | 'failed' | 'blocked';
  category: string;
  module: string;
  appType: string;
  osType: string;
  createdBy: string;
  createdAt: string;    // ISO timestamp
}

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'qa_lead' | 'senior_qa' | 'junior_qa' | 'project_manager' | 'stakeholder';
  status: 'active' | 'inactive';
}
```

## 🚧 Known Limitations

1. **Simple Authentication**: Demo-level security (not production-ready)
2. **File Storage**: JSON file storage (should use database for production)
3. **No Real-time Sync**: Multiple users won't see each other's changes live
4. **Limited Validation**: Basic client-side validation only

## 🎯 Next Steps

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Real-time collaboration with WebSockets
- [ ] Advanced search and filtering
- [ ] Test case execution tracking
- [ ] Reporting and analytics
- [ ] File attachments and screenshots
- [ ] Integration with CI/CD pipelines

## 📝 Development Notes

This MVP demonstrates core functionality with:
- ✅ User authentication and authorization
- ✅ Persistent data storage
- ✅ Modern React UI with TypeScript
- ✅ RESTful API design
- ✅ Error handling and validation
- ✅ Responsive design

The application is production-ready for small teams and can be easily extended with additional features.

---

**QAest MVP v1.0** - Built with ❤️ for QA teams 