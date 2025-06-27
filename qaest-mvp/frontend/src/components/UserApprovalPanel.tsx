import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS, API_BASE_URL } from '../config';
import AuditLog from './AuditLog';

interface PendingUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  approvalStatus: string;
  createdAt: string;
  requestId: string;
  requestType: string;
  requestedRole: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  approvalStatus: string;
  createdAt: string;
}

interface UserApprovalPanelProps {
  authToken: string;
  currentUser: any;
}

const UserApprovalPanel: React.FC<UserApprovalPanelProps> = ({ authToken, currentUser }) => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'audit'>('pending');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState('');
  const [roleChangeReason, setRoleChangeReason] = useState('');

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingUsers();
    } else if (activeTab === 'all') {
      fetchAllUsers();
    }
    // For 'audit' tab, the AuditLog component handles its own data fetching
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.pendingUsers, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPendingUsers(data.data.pendingApprovals);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch pending users');
      }
    } catch (err) {
      setError('Failed to fetch pending users');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAllUsers(data.data.users);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.approveUser(userId), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setError(null);
        fetchPendingUsers(); // Refresh the list
        alert(`User approved successfully: ${data.message}`);
      } else {
        setError(data.message || 'Failed to approve user');
      }
    } catch (err) {
      setError('Failed to approve user');
    }
  };

  const handleRejectUser = async (userId: string, reason: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.rejectUser(userId), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setError(null);
        fetchPendingUsers(); // Refresh the list
        alert(`User rejected: ${data.message}`);
      } else {
        setError(data.message || 'Failed to reject user');
      }
    } catch (err) {
      setError('Failed to reject user');
    }
  };

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;

    try {
      const response = await fetch(API_ENDPOINTS.updateRole(selectedUser.id), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          newRole,
          reason: roleChangeReason 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setError(null);
        setShowRoleModal(false);
        setSelectedUser(null);
        setNewRole('');
        setRoleChangeReason('');
        fetchAllUsers(); // Refresh the list
        alert(`Role updated successfully: ${data.message}`);
      } else {
        setError(data.message || 'Failed to update role');
      }
    } catch (err) {
      setError('Failed to update role');
    }
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'qa_lead': return '#ff6b35';
      case 'project_manager': return '#9c27b0';
      case 'senior_qa': return '#38a169';
      case 'junior_qa': return '#ed8936';
      case 'stakeholder': return '#e53e3e';
      default: return '#718096';
    }
  };

  const formatRole = (role: string) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Check if current user has approval permissions
  const hasApprovalPermissions = currentUser && (currentUser.role === 'qa_lead' || currentUser.role === 'project_manager');

  if (!hasApprovalPermissions) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h3 style={{ color: '#2d3748' }}>Access Denied</h3>
        <p style={{ color: '#718096' }}>Only QA Leads and Project Managers can access user management.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ margin: '0 0 1rem 0', color: '#2d3748' }}>User Management</h2>
      
      {error && (
        <div style={{ 
          backgroundColor: '#fff3f0', 
          color: '#d73502', 
          padding: '1rem', 
          borderRadius: '8px',
          marginBottom: '1rem',
          border: '1px solid #ffb3a6'
        }}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            backgroundColor: activeTab === 'pending' ? '#ff6b35' : 'transparent',
            color: activeTab === 'pending' ? 'white' : '#ff6b35',
            border: '2px solid #ff6b35',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px 0 0 8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
        >
          Pending Approvals ({pendingUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          style={{
            backgroundColor: activeTab === 'all' ? '#ff6b35' : 'transparent',
            color: activeTab === 'all' ? 'white' : '#ff6b35',
            border: '2px solid #ff6b35',
            borderLeft: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: activeTab === 'audit' ? '0' : '0 8px 8px 0',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
        >
          All Users ({allUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          style={{
            backgroundColor: activeTab === 'audit' ? '#ff6b35' : 'transparent',
            color: activeTab === 'audit' ? 'white' : '#ff6b35',
            border: '2px solid #ff6b35',
            borderLeft: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '0 8px 8px 0',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
        >
          Audit Trail
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ 
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #ff6b35',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 2s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '1rem', color: '#718096' }}>Loading...</p>
        </div>
      ) : (
        <>
          {/* Pending Users Tab */}
          {activeTab === 'pending' && (
            <div>
              {pendingUsers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
                  <h3 style={{ color: '#2d3748' }}>No Pending Approvals</h3>
                  <p>All users have been processed.</p>
                </div>
              ) : (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
                  gap: '1rem'
                }}>
                  {pendingUsers.map((user) => (
                    <div key={user.id} style={{ 
                      backgroundColor: 'white', 
                      padding: '1.5rem', 
                      borderRadius: '12px', 
                      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.2s ease'
                    }}>
                      <div style={{ marginBottom: '1rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#2d3748', fontWeight: '600' }}>
                          {user.firstName} {user.lastName}
                        </h4>
                        <p style={{ margin: '0', color: '#718096', fontSize: '0.9rem' }}>
                          @{user.username} • {user.email}
                        </p>
                      </div>
                      
                      <div style={{ marginBottom: '1rem' }}>
                        <span style={{ 
                          backgroundColor: getRoleColor(user.requestedRole), 
                          color: 'white',
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          marginRight: '0.5rem',
                          fontWeight: '500'
                        }}>
                          {formatRole(user.requestedRole)}
                        </span>
                        <span style={{ 
                          backgroundColor: '#f7fafc', 
                          color: '#718096',
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          border: '1px solid #e2e8f0'
                        }}>
                          Registered: {formatDate(user.createdAt)}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => handleApproveUser(user.id)}
                          style={{
                            backgroundColor: '#38a169',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 1rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            flex: 1,
                            fontWeight: '500',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => {
                            const reason = prompt('Reason for rejection (optional):');
                            if (reason !== null) {
                              handleRejectUser(user.id, reason);
                            }
                          }}
                          style={{
                            backgroundColor: '#e53e3e',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 1rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            flex: 1,
                            fontWeight: '500',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* All Users Tab */}
          {activeTab === 'all' && (
            <div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
                gap: '1rem'
              }}>
                {allUsers.map((user) => (
                  <div key={user.id} style={{ 
                    backgroundColor: 'white', 
                    padding: '1.5rem', 
                    borderRadius: '12px', 
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#2d3748', fontWeight: '600' }}>
                          {user.firstName} {user.lastName}
                        </h4>
                        <p style={{ margin: '0', color: '#718096', fontSize: '0.9rem' }}>
                          @{user.username}
                        </p>
                      </div>
                      <span style={{ 
                        backgroundColor: user.status === 'active' ? '#38a169' : '#718096', 
                        color: 'white',
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        height: 'fit-content',
                        fontWeight: '500'
                      }}>
                        {user.status}
                      </span>
                    </div>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <span style={{ 
                        backgroundColor: getRoleColor(user.role), 
                        color: 'white',
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        marginRight: '0.5rem',
                        fontWeight: '500'
                      }}>
                        {formatRole(user.role)}
                      </span>
                      <span style={{ 
                        backgroundColor: user.approvalStatus === 'approved' ? '#e6fffa' : '#fff3e0', 
                        color: user.approvalStatus === 'approved' ? '#38a169' : '#ed8936',
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        border: `1px solid ${user.approvalStatus === 'approved' ? '#38a169' : '#ed8936'}`
                      }}>
                        {user.approvalStatus}
                      </span>
                    </div>
                    
                    <div style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '1rem', lineHeight: '1.4' }}>
                      <p style={{ margin: '0.25rem 0' }}>Email: {user.email}</p>
                      <p style={{ margin: '0.25rem 0' }}>Joined: {formatDate(user.createdAt)}</p>
                    </div>
                    
                    {user.status === 'active' && user.id !== currentUser?.id && (
                      <button 
                        onClick={() => openRoleModal(user)}
                        style={{
                          backgroundColor: 'transparent',
                          color: '#ff6b35',
                          border: '2px solid #ff6b35',
                          padding: '0.75rem 1rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          width: '100%',
                          fontWeight: '500',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Change Role
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audit Trail Tab */}
          {activeTab === 'audit' && (
            <AuditLog 
              authToken={authToken} 
              currentUser={currentUser}
              filterByEntity="user"
            />
          )}
        </>
      )}

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
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
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '400px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#2d3748', fontWeight: '600' }}>
              Change Role for {selectedUser.firstName} {selectedUser.lastName}
            </h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#4a5568' }}>
                Current Role: {formatRole(selectedUser.role)}
              </label>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#4a5568' }}>
                New Role:
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
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
            
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#4a5568' }}>
                Reason for Change:
              </label>
              <textarea
                value={roleChangeReason}
                onChange={(e) => setRoleChangeReason(e.target.value)}
                placeholder="Enter reason for role change..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                  setNewRole('');
                  setRoleChangeReason('');
                }}
                style={{
                  backgroundColor: 'transparent',
                  color: '#718096',
                  border: '2px solid #e2e8f0',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleRoleChange}
                style={{
                  backgroundColor: '#ff6b35',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
              >
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserApprovalPanel; 