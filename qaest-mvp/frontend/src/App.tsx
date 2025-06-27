import React, { useState, useEffect } from 'react';
import './App.css';
import './modern-design.css';
import UserApprovalPanel from './components/UserApprovalPanel';
import TestCaseForm from './components/TestCaseForm';
import TestCaseCard from './components/TestCaseCard';
import PermissionManager from './components/PermissionManager';
import NotificationCenter from './components/NotificationCenter';
import { API_ENDPOINTS } from './config';

interface TestStep {
  stepNumber: number;
  action: string;
  expectedResult: string;
}

interface TestCase {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  category: string;
  module: string;
  appType: string;
  osType: string;
  prerequisites?: string;
  testSteps?: TestStep[];
  expectedResults?: string;
  testDataRequirements?: string;
  environmentRequirements?: string;
  estimatedTime?: number;
  tags?: string[];
  epicId?: string;
  prdLink?: string;
  relatedRequirements?: string;
  createdBy: string;
  createdAt: string;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
  version?: number;
}

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
}

interface AuthData {
  user: User;
  token: string;
}

interface FilterOptions {
  priorities: string[];
  creators: string[];
  statuses: string[];
  categories: string[];
}

interface Filters {
  priority: string;
  createdBy: string;
  dateFrom: string;
  dateTo: string;
  status: string;
  category: string;
  search: string;
}

const App: React.FC = () => {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'approvals' | 'permissions'>('dashboard');
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });
  const [registerForm, setRegisterForm] = useState({
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'junior_qa'
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    priorities: [],
    creators: [],
    statuses: [],
    categories: []
  });
  const [filters, setFilters] = useState<Filters>({
    priority: '',
    createdBy: '',
    dateFrom: '',
    dateTo: '',
    status: '',
    category: '',
    search: ''
  });

  // Check for existing auth on component mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('qaest_auth');
    if (savedAuth) {
      try {
        const authData: AuthData = JSON.parse(savedAuth);
        if (authData && authData.user && authData.token) {
          setCurrentUser(authData.user);
          setAuthToken(authData.token);
          setIsLoggedIn(true);
          fetchTestCases();
          fetchFilterOptions();
        } else {
          throw new Error('Invalid auth data structure');
        }
      } catch (error) {
        console.error('Error parsing saved auth:', error);
        localStorage.removeItem('qaest_auth');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();

      if (data.success) {
        const authData: AuthData = data.data;
        setCurrentUser(authData.user);
        setAuthToken(authData.token);
        setIsLoggedIn(true);
        
        // Save auth data to localStorage
        localStorage.setItem('qaest_auth', JSON.stringify(authData));
        
        // Fetch test cases and filter options after successful login
        await fetchTestCases();
        await fetchFilterOptions();
        
        // Reset login form
        setLoginForm({ username: '', password: '' });
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Backend server not available. Make sure it is running on port 8000.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.register, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerForm),
      });

      const data = await response.json();

      if (data.success) {
        // Check if the user requires approval
        if (data.data.requiresApproval) {
          // Show success message but don't log them in
          alert(`Registration successful! Your account is pending approval by a Lead or Project Manager. You will be able to login once approved.`);
          
          // Reset register form and go back to login
          setRegisterForm({
            username: '',
            password: '',
            email: '',
            firstName: '',
            lastName: '',
            role: 'junior_qa'
          });
          setShowRegister(false);
        } else {
          // If no approval required, proceed with normal login
          const authData: AuthData = data.data;
          setCurrentUser(authData.user);
          setAuthToken(authData.token);
          setIsLoggedIn(true);
          
          // Save auth data to localStorage
          localStorage.setItem('qaest_auth', JSON.stringify(authData));
          
          // Fetch test cases and filter options after successful registration
          await fetchTestCases();
          await fetchFilterOptions();
          
          // Reset register form
          setRegisterForm({
            username: '',
            password: '',
            email: '',
            firstName: '',
            lastName: '',
            role: 'junior_qa'
          });
          setShowRegister(false);
        }
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Backend server not available. Make sure it is running on port 8000.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    setIsLoggedIn(false);
    setTestCases([]);
    localStorage.removeItem('qaest_auth');
    setLoginForm({ username: '', password: '' });
    setFilters({
      priority: '',
      createdBy: '',
      dateFrom: '',
      dateTo: '',
      status: '',
      category: '',
      search: ''
    });
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.filters);
      const data = await response.json();
      
      if (data.success) {
        setFilterOptions(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch filter options:', err);
    }
  };

  const buildFilterQuery = () => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        params.append(key, value);
      }
    });
    
    return params.toString();
  };

  const fetchTestCases = async () => {
    try {
      setLoading(true);
      const queryString = buildFilterQuery();
      const url = `${API_ENDPOINTS.testCases}${queryString ? '?' + queryString : ''}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setTestCases(data.data.testCases);
        setError(null);
      } else {
        setError('Failed to load test cases');
      }
    } catch (err) {
      setError('Backend server not available. Make sure it is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestCase = async (formData: any) => {
    try {
      const testCaseData = {
        ...formData,
        createdBy: currentUser?.username || 'unknown',
        lastModifiedBy: currentUser?.username || 'unknown',
        lastModifiedAt: new Date().toISOString(),
        version: 1
      };

      const response = await fetch(API_ENDPOINTS.testCases, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(testCaseData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchTestCases(); // Refresh the list
        await fetchFilterOptions(); // Update filter options
        setShowCreateForm(false);
        setError(null);
      } else {
        setError(data.message || 'Failed to create test case');
      }
    } catch (err) {
      setError('Failed to create test case');
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchTestCases();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      priority: '',
      createdBy: '',
      dateFrom: '',
      dateTo: '',
      status: '',
      category: '',
      search: ''
    });
    // Fetch without filters
    setTimeout(() => fetchTestCases(), 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Login/Register Screen
  if (!isLoggedIn) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background shapes */}
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          borderRadius: '50%',
          top: '-200px',
          right: '-100px',
          opacity: 0.5,
          animation: 'pulse 4s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          borderRadius: '50%',
          bottom: '-150px',
          left: '-100px',
          opacity: 0.5,
          animation: 'pulse 4s ease-in-out infinite 2s'
        }} />
        
        <div className="card-glass animate-fadeIn" style={{
          padding: window.innerWidth < 640 ? '2rem' : '3rem',
          width: '100%',
          maxWidth: '450px',
          margin: '1rem'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: '2.5rem',
              boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)',
              transform: 'rotate(-10deg)'
            }}>
              🚀
            </div>
            <h1 className="text-gradient" style={{ 
              margin: '0 0 0.5rem 0',
              fontSize: '2.5rem',
              fontWeight: '800',
              letterSpacing: '-0.025em'
            }}>
              QAest
            </h1>
            <p style={{ color: '#4b5563', margin: 0, fontSize: '1rem', fontWeight: '500' }}>
              Modern Test Case Management System
            </p>
          </div>

          {error && (
            <div style={{ 
              backgroundColor: '#fff3f0', 
              color: '#d73502', 
              padding: '1rem', 
              borderRadius: '8px',
              marginBottom: '1.5rem',
              textAlign: 'center',
              border: '1px solid #ffb3a6'
            }}>
              {error}
            </div>
          )}

          {!showRegister ? (
            // Login Form
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '0.875rem',
                  letterSpacing: '0.025em'
                }}>
                  Username
                </label>
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  placeholder="Enter your username"
                  required
                  className="input-modern"
                  style={{
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '0.875rem',
                  letterSpacing: '0.025em'
                }}>
                  Password
                </label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                  className="input-modern"
                  style={{
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <button 
                type="submit"
                disabled={loginLoading}
                style={{
                  width: '100%',
                  backgroundColor: loginLoading ? '#cbd5e0' : '#ff6b35',
                  color: 'white',
                  border: 'none',
                  padding: '1rem',
                  borderRadius: '8px',
                  cursor: loginLoading ? 'not-allowed' : 'pointer',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  transition: 'background-color 0.3s',
                  marginBottom: '1rem'
                }}
              >
                {loginLoading ? 'Logging in...' : 'Login'}
              </button>

              <button 
                type="button"
                onClick={() => setShowRegister(true)}
                style={{
                  width: '100%',
                  backgroundColor: 'transparent',
                  color: '#ff6b35',
                  border: '2px solid #ff6b35',
                  padding: '1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  transition: 'all 0.3s'
                }}
              >
                Create New Account
              </button>
            </form>
          ) : (
            // Register Form
            <form onSubmit={handleRegister}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#2d3748' }}>
                    First Name:
                  </label>
                  <input
                    type="text"
                    value={registerForm.firstName}
                    onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                    placeholder="First name"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#2d3748' }}>
                    Last Name:
                  </label>
                  <input
                    type="text"
                    value={registerForm.lastName}
                    onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                    placeholder="Last name"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#2d3748' }}>
                  Username:
                </label>
                <input
                  type="text"
                  value={registerForm.username}
                  onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                  placeholder="Choose a username"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#2d3748' }}>
                  Email:
                </label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  placeholder="Enter your email"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#2d3748' }}>
                  Password:
                </label>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  placeholder="Choose a password"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#2d3748' }}>
                  Role:
                </label>
                <select
                  value={registerForm.role}
                  onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="junior_qa">Junior QA</option>
                  <option value="senior_qa">Senior QA</option>
                  <option value="qa_lead">QA Lead</option>
                  <option value="project_manager">Project Manager</option>
                  <option value="stakeholder">Stakeholder</option>
                </select>
              </div>

              <button 
                type="submit"
                disabled={registerLoading}
                style={{
                  width: '100%',
                  backgroundColor: registerLoading ? '#cbd5e0' : '#ff6b35',
                  color: 'white',
                  border: 'none',
                  padding: '1rem',
                  borderRadius: '8px',
                  cursor: registerLoading ? 'not-allowed' : 'pointer',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  transition: 'background-color 0.3s',
                  marginBottom: '1rem'
                }}
              >
                {registerLoading ? 'Creating Account...' : 'Create Account'}
              </button>

              <button 
                type="button"
                onClick={() => setShowRegister(false)}
                style={{
                  width: '100%',
                  backgroundColor: 'transparent',
                  color: '#718096',
                  border: '2px solid #e2e8f0',
                  padding: '1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  transition: 'all 0.3s'
                }}
              >
                Back to Login
              </button>
            </form>
          )}

          {/* Demo Credentials */}
          {!showRegister && (
            <div style={{ 
              marginTop: '2rem', 
              padding: '1rem', 
              backgroundColor: '#f7fafc', 
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#2d3748', fontSize: '0.9rem' }}>Demo Credentials:</h4>
              <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                <p style={{ margin: '0.25rem 0' }}>
                  <strong>QA Lead:</strong> qa-lead / lead123
                </p>
                <p style={{ margin: '0.25rem 0' }}>
                  <strong>Project Manager:</strong> project-manager / pm123
                </p>
                <p style={{ margin: '0.25rem 0' }}>
                  <strong>Junior QA:</strong> junior-qa / junior123
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Loading Screen
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ 
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #ff6b35',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          animation: 'spin 2s linear infinite'
        }}></div>
        <h3 style={{ marginTop: '20px', color: '#ff6b35', fontWeight: '600' }}>Loading QAest...</h3>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <header style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        color: 'white', 
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '45px',
              height: '45px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              🚀
            </div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
              QAest
            </h1>
          </div>
          
          {/* Navigation */}
          <nav style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setCurrentView('dashboard')}
              style={{
                backgroundColor: currentView === 'dashboard' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                boxShadow: currentView === 'dashboard' ? '0 4px 6px rgba(0,0,0,0.1)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (currentView !== 'dashboard') {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentView !== 'dashboard') {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                }
              }}
            >
              📊 Dashboard
            </button>
            
            {/* Permissions button - visible to all users */}
            <button
              onClick={() => setCurrentView('permissions')}
              style={{
                backgroundColor: currentView === 'permissions' ? 'rgba(255,255,255,0.2)' : 'transparent',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease'
              }}
            >
              Permissions
            </button>
            
            {/* Show User Management only for QA Leads and Project Managers */}
            {currentUser && (currentUser.role === 'qa_lead' || currentUser.role === 'project_manager') && (
              <button
                onClick={() => setCurrentView('approvals')}
                style={{
                  backgroundColor: currentView === 'approvals' ? 'rgba(255,255,255,0.2)' : 'transparent',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease'
                }}
              >
                User Management
              </button>
            )}
          </nav>
        </div>
        
        {currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>Welcome, {currentUser.firstName} {currentUser.lastName}</span>
            <span style={{ 
              backgroundColor: '#e55d2b', 
              padding: '0.25rem 0.5rem', 
              borderRadius: '4px',
              fontSize: '0.8rem'
            }}>
              {currentUser.role.replace('_', ' ').toUpperCase()}
            </span>
            <NotificationCenter 
              authToken={authToken!} 
              currentUser={currentUser}
              onNavigate={(view, params) => {
                setCurrentView(view as any);
                // Handle additional params if needed
              }}
            />
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: 'transparent',
                color: 'white',
                border: '1px solid white',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease'
              }}
            >
              Logout
            </button>
          </div>
        )}
      </header>

      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {error && (
          <div style={{ 
            backgroundColor: '#fff3f0', 
            color: '#d73502', 
            padding: '1rem', 
            borderRadius: '8px',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: '1px solid #ffb3a6'
          }}>
            <span>{error}</span>
            <button onClick={() => setError(null)} style={{
              backgroundColor: 'transparent',
              color: '#d73502',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.2rem'
            }}>
              ×
            </button>
          </div>
        )}

        {/* Conditional rendering based on current view */}
        {currentView === 'approvals' ? (
          <UserApprovalPanel authToken={authToken!} currentUser={currentUser} />
        ) : currentView === 'permissions' ? (
          <PermissionManager authToken={authToken!} currentUser={currentUser} />
        ) : (
          <>
        {/* Dashboard Header */}
        <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ margin: '0 0 0.5rem 0', color: '#2d3748' }}>Test Case Dashboard</h2>
              <p style={{ color: '#718096', margin: '0 0 1rem 0' }}>
            Manage and track your test cases efficiently
          </p>
          
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setShowCreateForm(true)}
              style={{
                    backgroundColor: '#ff6b35',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(255, 107, 53, 0.2)'
              }}
            >
              Create Test Case
            </button>
            <button 
                  onClick={() => setShowFilters(!showFilters)}
              style={{
                backgroundColor: 'transparent',
                    color: '#ff6b35',
                    border: '2px solid #ff6b35',
                padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
                <button 
                  onClick={fetchTestCases}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#38a169',
                    border: '2px solid #38a169',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
              }}
            >
              Refresh Data
            </button>
          </div>
        </div>

            {/* Filters Panel */}
            {showFilters && (
              <div style={{ 
                backgroundColor: 'white', 
                padding: '1.5rem', 
                borderRadius: '12px', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                marginBottom: '2rem',
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#2d3748' }}>Filter Test Cases</h3>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: window.innerWidth < 640 ? '1fr' : 'repeat(auto-fill, minmax(250px, 1fr))', 
                  gap: window.innerWidth < 640 ? '1rem' : '1.5rem', 
                  marginBottom: '1.5rem' 
                }}>
                  <div style={{ minWidth: 0 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#4a5568', fontSize: '0.875rem' }}>Search:</label>
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      placeholder="Search in title/description"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        transition: 'border-color 0.2s ease',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#4a5568', fontSize: '0.875rem' }}>Priority:</label>
                    <select
                      value={filters.priority}
                      onChange={(e) => handleFilterChange('priority', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        backgroundColor: 'white',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="">All Priorities</option>
                      {filterOptions.priorities.map(priority => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#4a5568', fontSize: '0.875rem' }}>Status:</label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        backgroundColor: 'white',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="">All Statuses</option>
                      {filterOptions.statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#4a5568', fontSize: '0.875rem' }}>Created By:</label>
                    <select
                      value={filters.createdBy}
                      onChange={(e) => handleFilterChange('createdBy', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        backgroundColor: 'white',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="">All Creators</option>
                      {filterOptions.creators.map(creator => (
                        <option key={creator} value={creator}>{creator}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#4a5568', fontSize: '0.875rem' }}>Date From:</label>
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#4a5568', fontSize: '0.875rem' }}>Date To:</label>
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    onClick={applyFilters}
                    style={{
                      backgroundColor: '#ff6b35',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Apply Filters
                  </button>
                  <button 
                    onClick={clearFilters}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#718096',
                      border: '1px solid #e2e8f0',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}

        {/* Statistics */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: window.innerWidth < 640 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
              <div style={{ 
                backgroundColor: 'white', 
                padding: '1.5rem', 
                borderRadius: '12px', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                border: '1px solid #e2e8f0'
              }}>
                <p style={{ margin: '0 0 0.5rem 0', color: '#718096', fontSize: '0.9rem' }}>Total Test Cases</p>
                <h3 style={{ margin: 0, fontSize: '2rem', color: '#ff6b35', fontWeight: '600' }}>{testCases.length}</h3>
          </div>
              <div style={{ 
                backgroundColor: 'white', 
                padding: '1.5rem', 
                borderRadius: '12px', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                border: '1px solid #e2e8f0'
              }}>
                <p style={{ margin: '0 0 0.5rem 0', color: '#718096', fontSize: '0.9rem' }}>Active Cases</p>
                <h3 style={{ margin: 0, fontSize: '2rem', color: '#38a169', fontWeight: '600' }}>
              {testCases.filter(tc => tc.status === 'active').length}
            </h3>
          </div>
              <div style={{ 
                backgroundColor: 'white', 
                padding: '1.5rem', 
                borderRadius: '12px', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                border: '1px solid #e2e8f0'
              }}>
                <p style={{ margin: '0 0 0.5rem 0', color: '#718096', fontSize: '0.9rem' }}>High Priority</p>
                <h3 style={{ margin: 0, fontSize: '2rem', color: '#ed8936', fontWeight: '600' }}>
              {testCases.filter(tc => tc.priority === 'high').length}
            </h3>
          </div>
              <div style={{ 
                backgroundColor: 'white', 
                padding: '1.5rem', 
                borderRadius: '12px', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                border: '1px solid #e2e8f0'
              }}>
                <p style={{ margin: '0 0 0.5rem 0', color: '#718096', fontSize: '0.9rem' }}>Your Role</p>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#e55d2b', fontWeight: '600' }}>
              {currentUser?.role.replace('_', ' ').toUpperCase()}
            </h3>
          </div>
        </div>

        {/* Test Cases List */}
            <h3 style={{ marginBottom: '1rem', color: '#2d3748' }}>Test Cases</h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '1rem'
        }}>
          {testCases.map((testCase) => (
            <TestCaseCard
              key={testCase.id}
              testCase={testCase}
              currentUser={currentUser}
              onEdit={(tc) => {
                // TODO: Implement edit functionality
                console.log('Edit test case:', tc);
              }}
              onDelete={async (id) => {
                // TODO: Implement delete functionality
                console.log('Delete test case:', id);
              }}
              onExecute={(tc) => {
                // TODO: Implement execute functionality
                console.log('Execute test case:', tc);
              }}
            />
          ))}
        </div>

        {testCases.length === 0 && !loading && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
                <h3 style={{ color: '#2d3748' }}>No test cases found</h3>
                <p>Create your first test case or adjust your filters</p>
          </div>
            )}
          </>
        )}

        {/* Create Test Case Form */}
        {showCreateForm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px',
            overflow: 'auto'
          }}>
            <div style={{
              width: window.innerWidth < 768 ? '95%' : '90%',
              maxWidth: window.innerWidth < 768 ? '100%' : '1000px',
              maxHeight: '90vh',
              overflow: 'auto',
              borderRadius: '8px'
            }}>
              <TestCaseForm
                onSubmit={handleCreateTestCase}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
