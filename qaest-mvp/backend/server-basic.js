const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'https://coruscating-custard-0291e7.netlify.app',
      /\.netlify\.app$/  // Allow any Netlify subdomain
    ];
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Basic middleware
app.use(cors(corsOptions));
app.use(express.json());

// Simple file-based storage for demo
const dataFile = path.join(__dirname, 'data.json');

// Initialize data file if it doesn't exist
const initializeData = () => {
  const defaultData = {
    users: [
      {
        id: 'user-001',
        username: 'demo-user',
        password: 'password123', // In real app, this would be hashed
        email: 'demo@qaest.com',
        firstName: 'Demo',
        lastName: 'User',
        role: 'senior_qa',
        status: 'active',
        approvalStatus: 'approved',
        approvedBy: 'system',
        approvedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 'user-002',
        username: 'qa-lead',
        password: 'lead123',
        email: 'lead@qaest.com',
        firstName: 'QA',
        lastName: 'Lead',
        role: 'qa_lead',
        status: 'active',
        approvalStatus: 'approved',
        approvedBy: 'system',
        approvedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 'user-003',
        username: 'junior-qa',
        password: 'junior123',
        email: 'junior@qaest.com',
        firstName: 'Junior',
        lastName: 'QA',
        role: 'junior_qa',
        status: 'active',
        approvalStatus: 'approved',
        approvedBy: 'system',
        approvedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 'user-004',
        username: 'project-manager',
        password: 'pm123',
        email: 'pm@qaest.com',
        firstName: 'Project',
        lastName: 'Manager',
        role: 'project_manager',
        status: 'active',
        approvalStatus: 'approved',
        approvedBy: 'system',
        approvedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }
    ],
      testCases: [
        {
          id: 'TC-000001',
          title: 'User Login Functionality Test',
          description: 'Test user login with valid credentials',
          priority: 'high',
          status: 'active',
          category: 'Authentication',
          module: 'User Management',
          appType: 'web',
          osType: 'cross_platform',
          createdBy: 'demo-user',
          createdAt: new Date().toISOString()
        },
        {
          id: 'TC-000002',
          title: 'Test Case Creation Test',
          description: 'Verify test case creation functionality',
          priority: 'medium',
          status: 'draft',
          category: 'Test Management',
          module: 'Test Cases',
          appType: 'web',
          osType: 'cross_platform',
          createdBy: 'qa-lead',
          createdAt: new Date().toISOString()
        }
      ],
    approvalRequests: []
  };

  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify(defaultData, null, 2));
  }
};

// Read data from file
const readData = () => {
  try {
    const data = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data file:', error);
    initializeData();
    return readData();
  }
};

// Write data to file
const writeData = (data) => {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing data file:', error);
    return false;
  }
};

// Utility function to generate user ID
const generateUserId = (data) => {
  const existingIds = data.users.map(u => parseInt(u.id.replace('user-', ''))).sort((a, b) => b - a);
  const nextId = existingIds.length > 0 ? existingIds[0] + 1 : 5;
  return 'user-' + String(nextId).padStart(3, '0');
};

// Utility function to generate approval request ID
const generateApprovalRequestId = (data) => {
  const existingIds = data.approvalRequests.map(r => parseInt(r.id.replace('req-', ''))).sort((a, b) => b - a);
  const nextId = existingIds.length > 0 ? existingIds[0] + 1 : 1;
  return 'req-' + String(nextId).padStart(3, '0');
};

// Check if user has approval permissions
const hasApprovalPermissions = (user) => {
  return user && (user.role === 'qa_lead' || user.role === 'project_manager');
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  // Simple token validation (in real app, verify JWT)
  if (!token.startsWith('demo-jwt-token-')) {
    return res.status(403).json({
      success: false,
      message: 'Invalid token'
    });
  }

  // For demo purposes, we'll extract user info from token
  // In real app, decode JWT and get user info
  req.user = { token }; // Placeholder
  next();
};

// Get user from token
const getUserFromToken = (token, data) => {
  // In real app, decode JWT to get user ID
  // For demo, we'll find the user by checking recent logins
  // This is a simplified approach for demo purposes
  return data.users.find(u => u.status === 'active');
};

// Initialize data on startup
initializeData();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to QAest API - Basic Version',
    version: '1.0.0',
    status: 'Server is running successfully!',
    endpoints: [
      'GET /health - Health check',
      'POST /api/auth/login - User login',
      'POST /api/auth/register - User registration',
      'GET /api/users/pending - Get pending user approvals',
      'PUT /api/users/:id/approve - Approve user',
      'PUT /api/users/:id/reject - Reject user',
      'PUT /api/users/:id/role - Update user role',
      'GET /api/users - Get all users (admin)',
      'GET /api/demo - Demo data',
      'GET /api/test-cases - Get all test cases (with filters)',
      'POST /api/test-cases - Create test case'
    ]
  });
});

// User registration endpoint
app.post('/api/auth/register', (req, res) => {
  const { username, password, email, firstName, lastName, role } = req.body;
  
  // Validation
  if (!username || !password || !email || !firstName || !lastName) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required: username, password, email, firstName, lastName'
    });
  }

  // Validate role
  const validRoles = ['qa_lead', 'senior_qa', 'junior_qa', 'project_manager', 'stakeholder'];
  const userRole = role && validRoles.includes(role) ? role : 'junior_qa';

  const data = readData();
  
  // Check if username already exists
  const existingUser = data.users.find(u => u.username === username);
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'Username already exists'
    });
  }

  // Check if email already exists
  const existingEmail = data.users.find(u => u.email === email);
  if (existingEmail) {
    return res.status(409).json({
      success: false,
      message: 'Email already exists'
    });
  }

  // Create new user with pending approval
  const newUser = {
    id: generateUserId(data),
    username,
    password, // In real app, this would be hashed
    email,
    firstName,
    lastName,
    role: userRole,
    status: 'pending_approval',
    approvalStatus: 'pending',
    approvedBy: null,
    approvedAt: null,
    createdAt: new Date().toISOString()
  };

  // Create approval request
  const approvalRequest = {
    id: generateApprovalRequestId(data),
    userId: newUser.id,
    requestType: 'registration',
    requestedRole: userRole,
    currentRole: null,
    requestedBy: newUser.id,
    status: 'pending',
    createdAt: new Date().toISOString(),
    approvedBy: null,
    approvedAt: null,
    rejectedBy: null,
    rejectedAt: null,
    rejectionReason: null
  };

  data.users.push(newUser);
  data.approvalRequests.push(approvalRequest);

  if (writeData(data)) {
    res.status(201).json({
      success: true,
      message: 'Registration successful. Your account is pending approval by a Lead or Project Manager.',
      data: {
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          status: newUser.status,
          approvalStatus: newUser.approvalStatus
        },
        requiresApproval: true
      }
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Failed to register user'
    });
  }
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required'
    });
  }
  
  const data = readData();
  const user = data.users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid username or password'
    });
  }

  // Check if user is approved
  if (user.approvalStatus !== 'approved') {
    return res.status(403).json({
      success: false,
      message: 'Your account is pending approval. Please contact a Lead or Project Manager.',
      data: {
        approvalStatus: user.approvalStatus,
        requiresApproval: true
      }
    });
  }

  // Check if user is active
  if (user.status !== 'active') {
    return res.status(403).json({
      success: false,
      message: 'Your account has been deactivated. Please contact an administrator.'
    });
  }

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;
  
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: userWithoutPassword,
      token: 'demo-jwt-token-' + Date.now() + '-' + user.id // Include user ID in token
    }
  });
});

// Get pending user approvals (for Leads and Project Managers)
app.get('/api/users/pending', authenticateToken, (req, res) => {
  const data = readData();
  
  // Get current user from token (simplified for demo)
  const authHeader = req.headers['authorization'];
  const token = authHeader.split(' ')[1];
  const tokenParts = token.split('-');
  const userId = tokenParts.slice(-2).join('-'); // Extract user-XXX from demo-jwt-token-timestamp-user-XXX
  const currentUser = data.users.find(u => u.id === userId);

  if (!hasApprovalPermissions(currentUser)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only Leads and Project Managers can view pending approvals.'
    });
  }

  // Get pending users and approval requests
  const pendingUsers = data.users.filter(u => u.approvalStatus === 'pending');
  const pendingRequests = data.approvalRequests.filter(r => r.status === 'pending');

  // Combine user data with request data
  const pendingApprovals = pendingUsers.map(user => {
    const request = pendingRequests.find(r => r.userId === user.id);
    return {
      ...user,
      requestId: request?.id,
      requestType: request?.requestType,
      requestedRole: request?.requestedRole
    };
  });

  res.json({
    success: true,
    data: {
      pendingApprovals,
      totalCount: pendingApprovals.length
    }
  });
});

// Get all users (for admin management)
app.get('/api/users', authenticateToken, (req, res) => {
  const data = readData();
  
  // Get current user from token
  const authHeader = req.headers['authorization'];
  const token = authHeader.split(' ')[1];
  const tokenParts = token.split('-');
  const userId = tokenParts.slice(-2).join('-'); // Extract user-XXX from demo-jwt-token-timestamp-user-XXX
  const currentUser = data.users.find(u => u.id === userId);

  if (!hasApprovalPermissions(currentUser)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only Leads and Project Managers can view all users.'
    });
  }

  // Remove passwords from response
  const users = data.users.map(({ password, ...user }) => user);

  res.json({
    success: true,
    data: {
      users,
      totalCount: users.length
    }
  });
});

// Approve user
app.put('/api/users/:id/approve', authenticateToken, (req, res) => {
  const { id } = req.params;
  const data = readData();
  
  // Get current user from token
  const authHeader = req.headers['authorization'];
  const token = authHeader.split(' ')[1];
  const tokenParts = token.split('-');
  const userId = tokenParts.slice(-2).join('-'); // Extract user-XXX from demo-jwt-token-timestamp-user-XXX
  const currentUser = data.users.find(u => u.id === userId);

  if (!hasApprovalPermissions(currentUser)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only Leads and Project Managers can approve users.'
    });
  }

  const user = data.users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  if (user.approvalStatus === 'approved') {
    return res.status(400).json({
      success: false,
      message: 'User is already approved'
    });
  }

  // Update user status
  user.approvalStatus = 'approved';
  user.status = 'active';
  user.approvedBy = currentUser.id;
  user.approvedAt = new Date().toISOString();

  // Update approval request
  const request = data.approvalRequests.find(r => r.userId === id && r.status === 'pending');
  if (request) {
    request.status = 'approved';
    request.approvedBy = currentUser.id;
    request.approvedAt = new Date().toISOString();
  }

  if (writeData(data)) {
    res.json({
      success: true,
      message: `User ${user.firstName} ${user.lastName} has been approved`,
      data: {
        user: { ...user, password: undefined }
      }
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Failed to approve user'
    });
  }
});

// Reject user
app.put('/api/users/:id/reject', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const data = readData();
  
  // Get current user from token
  const authHeader = req.headers['authorization'];
  const token = authHeader.split(' ')[1];
  const tokenParts = token.split('-');
  const userId = tokenParts.slice(-2).join('-'); // Extract user-XXX from demo-jwt-token-timestamp-user-XXX
  const currentUser = data.users.find(u => u.id === userId);

  if (!hasApprovalPermissions(currentUser)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only Leads and Project Managers can reject users.'
    });
  }

  const user = data.users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  if (user.approvalStatus === 'approved') {
    return res.status(400).json({
      success: false,
      message: 'Cannot reject an already approved user'
    });
  }

  // Update user status
  user.approvalStatus = 'rejected';
  user.status = 'rejected';

  // Update approval request
  const request = data.approvalRequests.find(r => r.userId === id && r.status === 'pending');
  if (request) {
    request.status = 'rejected';
    request.rejectedBy = currentUser.id;
    request.rejectedAt = new Date().toISOString();
    request.rejectionReason = reason || 'No reason provided';
  }

  if (writeData(data)) {
    res.json({
      success: true,
      message: `User ${user.firstName} ${user.lastName} has been rejected`,
      data: {
        user: { ...user, password: undefined }
      }
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Failed to reject user'
    });
  }
});

// Update user role
app.put('/api/users/:id/role', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { newRole, reason } = req.body;
  const data = readData();
  
  // Get current user from token
  const authHeader = req.headers['authorization'];
  const token = authHeader.split(' ')[1];
  const tokenParts = token.split('-');
  const userId = tokenParts.slice(-2).join('-'); // Extract user-XXX from demo-jwt-token-timestamp-user-XXX
  const currentUser = data.users.find(u => u.id === userId);

  if (!hasApprovalPermissions(currentUser)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only Leads and Project Managers can update user roles.'
    });
  }

  const validRoles = ['qa_lead', 'senior_qa', 'junior_qa', 'project_manager', 'stakeholder'];
  if (!validRoles.includes(newRole)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role specified'
    });
  }

  const user = data.users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  if (user.approvalStatus !== 'approved') {
    return res.status(400).json({
      success: false,
      message: 'Cannot update role for unapproved users'
    });
  }

  if (user.role === newRole) {
    return res.status(400).json({
      success: false,
      message: 'User already has this role'
    });
  }

  const oldRole = user.role;
  user.role = newRole;

  // Create approval request for role change
  const approvalRequest = {
    id: generateApprovalRequestId(data),
    userId: user.id,
    requestType: 'role_change',
    requestedRole: newRole,
    currentRole: oldRole,
    requestedBy: currentUser.id,
    status: 'approved', // Auto-approved since it's done by admin
    createdAt: new Date().toISOString(),
    approvedBy: currentUser.id,
    approvedAt: new Date().toISOString(),
    rejectedBy: null,
    rejectedAt: null,
    rejectionReason: null,
    changeReason: reason || 'Role updated by administrator'
  };

  data.approvalRequests.push(approvalRequest);

  if (writeData(data)) {
    res.json({
      success: true,
      message: `User ${user.firstName} ${user.lastName} role updated from ${oldRole} to ${newRole}`,
      data: {
        user: { ...user, password: undefined },
        oldRole,
        newRole
      }
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Failed to update user role'
    });
  }
});

// Get all test cases with filtering
app.get('/api/test-cases', (req, res) => {
  const data = readData();
  let testCases = [...data.testCases];

  // Apply filters
  const { 
    priority, 
    createdBy, 
    dateFrom, 
    dateTo, 
    status, 
    category,
    search 
  } = req.query;

  // Filter by priority
  if (priority) {
    testCases = testCases.filter(tc => tc.priority === priority);
  }

  // Filter by creator
  if (createdBy) {
    testCases = testCases.filter(tc => tc.createdBy === createdBy);
  }

  // Filter by status
  if (status) {
    testCases = testCases.filter(tc => tc.status === status);
  }

  // Filter by category
  if (category) {
    testCases = testCases.filter(tc => tc.category.toLowerCase().includes(category.toLowerCase()));
  }

  // Filter by date range
  if (dateFrom) {
    const fromDate = new Date(dateFrom);
    testCases = testCases.filter(tc => new Date(tc.createdAt) >= fromDate);
  }

  if (dateTo) {
    const toDate = new Date(dateTo);
    toDate.setHours(23, 59, 59, 999); // End of day
    testCases = testCases.filter(tc => new Date(tc.createdAt) <= toDate);
  }

  // Search in title and description
  if (search) {
    const searchTerm = search.toLowerCase();
    testCases = testCases.filter(tc => 
      tc.title.toLowerCase().includes(searchTerm) ||
      tc.description.toLowerCase().includes(searchTerm)
    );
  }

  // Sort by creation date (newest first)
  testCases.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({
    success: true,
    message: 'Test cases retrieved successfully',
    data: {
      testCases,
      totalCount: testCases.length,
      filters: {
        priority: priority || null,
        createdBy: createdBy || null,
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
        status: status || null,
        category: category || null,
        search: search || null
      }
    }
  });
});

// Get unique filter values for dropdowns
app.get('/api/test-cases/filters', (req, res) => {
  const data = readData();
  
  const priorities = [...new Set(data.testCases.map(tc => tc.priority))];
  const creators = [...new Set(data.testCases.map(tc => tc.createdBy))];
  const statuses = [...new Set(data.testCases.map(tc => tc.status))];
  const categories = [...new Set(data.testCases.map(tc => tc.category))];

  res.json({
    success: true,
    data: {
      priorities: priorities.sort(),
      creators: creators.sort(),
      statuses: statuses.sort(),
      categories: categories.sort()
    }
  });
});

// Create test case
app.post('/api/test-cases', (req, res) => {
  const data = readData();
  
  // Generate new test case ID
  const existingIds = data.testCases.map(tc => parseInt(tc.id.replace('TC-', ''))).sort((a, b) => b - a);
  const nextId = existingIds.length > 0 ? existingIds[0] + 1 : 1;
  const testCaseId = 'TC-' + String(nextId).padStart(6, '0');
  
  const newTestCase = {
    id: testCaseId,
    title: req.body.title || 'Untitled Test Case',
    description: req.body.description || '',
    priority: req.body.priority || 'medium',
    status: req.body.status || 'draft',
    category: req.body.category || 'General',
    module: req.body.module || 'Unknown',
    appType: req.body.appType || 'web',
    osType: req.body.osType || 'cross_platform',
    createdBy: req.body.createdBy || 'unknown',
    createdAt: new Date().toISOString()
  };
  
  data.testCases.push(newTestCase);
  
  if (writeData(data)) {
    res.json({
      success: true,
      message: 'Test case created successfully',
      data: { testCase: newTestCase }
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Failed to save test case'
    });
  }
});

// Demo API endpoint (for backward compatibility)
app.get('/api/demo', (req, res) => {
  const data = readData();
  res.json({
    success: true,
    message: 'QAest API is working!',
    data: {
      testCases: data.testCases,
      totalCount: data.testCases.length,
      currentUser: {
        id: 'user-001',
        username: 'demo-user',
        role: 'senior_qa',
        permissions: ['read', 'create', 'update']
      }
    }
  });
});

// Demo test case creation (for backward compatibility)
app.post('/api/test-cases/demo', (req, res) => {
  const data = readData();
  
  const existingIds = data.testCases.map(tc => parseInt(tc.id.replace('TC-', ''))).sort((a, b) => b - a);
  const nextId = existingIds.length > 0 ? existingIds[0] + 1 : 1;
  const testCaseId = 'TC-' + String(nextId).padStart(6, '0');
  
  const testCase = {
    id: testCaseId,
    ...req.body,
    module: req.body.module || 'Test Cases',
    appType: req.body.appType || 'web',
    osType: req.body.osType || 'cross_platform',
    createdBy: 'demo-user',
    createdAt: new Date().toISOString(),
    status: req.body.status || 'draft'
  };
  
  data.testCases.push(testCase);
  
  if (writeData(data)) {
  res.json({
    success: true,
    message: 'Demo test case created successfully',
    data: { testCase }
  });
  } else {
    res.status(500).json({
      success: false,
      message: 'Failed to save test case'
    });
  }
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log('🚀 QAest Basic Server Started!');
  console.log('================================');
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log(`🏠 Home page: http://localhost:${PORT}/`);
  console.log(`📊 Demo API: http://localhost:${PORT}/api/demo`);
  console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`👤 Register: POST http://localhost:${PORT}/api/auth/register`);
  console.log(`🔍 Filters: GET http://localhost:${PORT}/api/test-cases/filters`);
  console.log(`👥 Pending Users: GET http://localhost:${PORT}/api/users/pending`);
  console.log(`✅ Approve User: PUT http://localhost:${PORT}/api/users/:id/approve`);
  console.log(`❌ Reject User: PUT http://localhost:${PORT}/api/users/:id/reject`);
  console.log(`🔄 Update Role: PUT http://localhost:${PORT}/api/users/:id/role`);
  console.log('================================');
  console.log('✅ Ready to accept requests!');
  console.log('');
  console.log('Demo Login Credentials (Pre-approved):');
  console.log('- Username: demo-user, Password: password123 (Senior QA)');
  console.log('- Username: qa-lead, Password: lead123 (QA Lead)');
  console.log('- Username: junior-qa, Password: junior123 (Junior QA)');
  console.log('- Username: project-manager, Password: pm123 (Project Manager)');
  console.log('');
  console.log('🔐 User Approval System:');
  console.log('- New registrations require approval by QA Lead or Project Manager');
  console.log('- Leads and Project Managers can approve/reject users');
  console.log('- Role changes can be made by Leads and Project Managers');
  console.log('- Approval workflow tracks all changes with audit trail');
});
