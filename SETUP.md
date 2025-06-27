# QAest MVP - Quick Setup Guide

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Node.js v16+ installed
- PostgreSQL running on localhost:5432

### 1. Database Setup
```bash
# Connect to PostgreSQL and run:
psql -U postgres -f database/setup.sql
```

### 2. Start the Application
```bash
# Make sure you're in the qaest-mvp directory
./start.sh
```

This will:
- Install all dependencies
- Start backend server on port 5000
- Start frontend server on port 3000
- Open your browser automatically

### 3. Test the API (Optional)
```bash
# In a new terminal, test the backend API
./test-api.sh
```

## 📱 Access the Application

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **API Health**: http://localhost:5000/health

## 🎯 First Steps

1. **Register a new account** at http://localhost:3000/register
2. **Choose your role**: qa_lead, senior_qa, junior_qa, project_manager, or stakeholder
3. **Login** and start creating test cases!

## 🔧 Manual Setup (if automatic setup fails)

### Backend
```bash
cd backend
npm install
# Edit .env file with your database credentials
npm run dev
```

### Frontend
```bash
cd frontend
npm install
echo "REACT_APP_API_URL=http://localhost:5000/api/v1" > .env
npm start
```

## 🧪 Test Data

Create a test case with this sample data:

```json
{
  "title": "User Login Test",
  "description": "Test user authentication functionality",
  "priority": "high",
  "status": "active",
  "category": "Authentication",
  "module": "User Management",
  "appType": "web",
  "osType": "cross_platform",
  "testSteps": [
    {
      "stepNumber": 1,
      "action": "Navigate to login page",
      "expectedResult": "Login page loads successfully"
    },
    {
      "stepNumber": 2,
      "action": "Enter valid credentials",
      "expectedResult": "User is authenticated and redirected"
    }
  ],
  "expectedResults": "User successfully logs in to the application",
  "estimatedTime": 5,
  "tags": ["login", "authentication", "critical"]
}
```

## 🆘 Troubleshooting

### Database Issues
- Ensure PostgreSQL is running: `brew services start postgresql` (macOS)
- Check connection: `psql -U postgres -c "SELECT version();"`

### Port Conflicts
- Backend (5000): Change `PORT` in `backend/.env`
- Frontend (3000): Use `PORT=3001 npm start`

### Permission Errors
- Make scripts executable: `chmod +x start.sh test-api.sh`

## 📞 Need Help?

Check the main README.md for detailed documentation and troubleshooting guides.

---

**Happy Testing with QAest! 🎉** 