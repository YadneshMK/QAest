import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

interface PermissionRequest {
  id: string;
  testCaseId: string;
  testCaseTitle: string;
  requesterId: string;
  requesterName: string;
  ownerId: string;
  ownerName: string;
  permissionType: 'edit' | 'delete' | 'transfer_ownership';
  status: 'pending' | 'approved' | 'denied' | 'expired';
  reason: string;
  expiresAt: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNote?: string;
}

interface PermissionManagerProps {
  currentUser: any;
  authToken: string;
}

const PermissionManager: React.FC<PermissionManagerProps> = ({ currentUser, authToken }) => {
  const [activeTab, setActiveTab] = useState<'my_requests' | 'pending_approvals'>('my_requests');
  const [myRequests, setMyRequests] = useState<PermissionRequest[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PermissionRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState({
    testCaseId: '',
    permissionType: 'edit' as 'edit' | 'delete' | 'transfer_ownership',
    reason: ''
  });

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch my requests
      const myReqResponse = await fetch(`${API_BASE_URL}/api/permissions/my-requests`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (myReqResponse.ok) {
        const myReqData = await myReqResponse.json();
        setMyRequests(myReqData.data || []);
      }

      // Fetch pending approvals (requests where I'm the owner)
      const pendingResponse = await fetch(`${API_BASE_URL}/api/permissions/pending-approvals`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        setPendingApprovals(pendingData.data || []);
      }
    } catch (err) {
      setError('Failed to fetch permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestForm.testCaseId || !requestForm.reason.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/permissions/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(requestForm)
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchPermissions();
        setShowRequestForm(false);
        setRequestForm({ testCaseId: '', permissionType: 'edit', reason: '' });
        setError(null);
      } else {
        setError(data.message || 'Failed to submit request');
      }
    } catch (err) {
      setError('Failed to submit permission request');
    }
  };

  const handleApproveRequest = async (requestId: string, note?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/permissions/${requestId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ resolutionNote: note })
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchPermissions();
      } else {
        setError(data.message || 'Failed to approve request');
      }
    } catch (err) {
      setError('Failed to approve permission request');
    }
  };

  const handleDenyRequest = async (requestId: string, note?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/permissions/${requestId}/deny`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ resolutionNote: note })
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchPermissions();
      } else {
        setError(data.message || 'Failed to deny request');
      }
    } catch (err) {
      setError('Failed to deny permission request');
    }
  };

  const getPermissionBadgeColor = (type: string) => {
    switch (type) {
      case 'edit': return '#007bff';
      case 'delete': return '#dc3545';
      case 'transfer_ownership': return '#6f42c1';
      default: return '#6c757d';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'approved': return '#28a745';
      case 'denied': return '#dc3545';
      case 'expired': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const formatPermissionType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const tabStyle = {
    padding: '10px 20px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#666',
    borderBottom: '2px solid transparent',
    transition: 'all 0.3s ease'
  };

  const activeTabStyle = {
    ...tabStyle,
    color: '#ff6b35',
    borderBottomColor: '#ff6b35'
  };

  const renderRequestCard = (request: PermissionRequest, isApproval: boolean = false) => (
    <div key={request.id} style={{
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '1rem',
      border: '1px solid #e2e8f0'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#2d3748', fontSize: '1rem' }}>
            {request.testCaseTitle} ({request.testCaseId})
          </h4>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.85rem', color: '#718096' }}>
            {isApproval ? (
              <>
                <span>Requested by: <strong>{request.requesterName}</strong></span>
                <span>•</span>
              </>
            ) : (
              <>
                <span>Owner: <strong>{request.ownerName}</strong></span>
                <span>•</span>
              </>
            )}
            <span>{new Date(request.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span style={{
            backgroundColor: getPermissionBadgeColor(request.permissionType),
            color: 'white',
            padding: '0.25rem 0.75rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: '500'
          }}>
            {formatPermissionType(request.permissionType)}
          </span>
          <span style={{
            backgroundColor: getStatusBadgeColor(request.status),
            color: 'white',
            padding: '0.25rem 0.75rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: '500'
          }}>
            {request.status.toUpperCase()}
          </span>
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <strong style={{ fontSize: '0.85rem', color: '#495057' }}>Reason:</strong>
        <p style={{ margin: '0.5rem 0', fontSize: '0.85rem', color: '#6c757d' }}>
          {request.reason}
        </p>
      </div>

      {request.status === 'pending' && (
        <div style={{ fontSize: '0.8rem', color: '#dc3545', marginBottom: '1rem' }}>
          Expires: {new Date(request.expiresAt).toLocaleDateString()}
        </div>
      )}

      {request.resolutionNote && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.75rem', 
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          fontSize: '0.85rem'
        }}>
          <strong style={{ color: '#495057' }}>Resolution Note:</strong>
          <p style={{ margin: '0.5rem 0 0 0', color: '#6c757d' }}>
            {request.resolutionNote}
          </p>
        </div>
      )}

      {isApproval && request.status === 'pending' && (
        <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
          <button
            onClick={() => {
              const note = prompt('Add a note (optional):');
              handleApproveRequest(request.id, note || undefined);
            }}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '500'
            }}
          >
            Approve
          </button>
          <button
            onClick={() => {
              const note = prompt('Reason for denial (optional):');
              handleDenyRequest(request.id, note || undefined);
            }}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '500'
            }}
          >
            Deny
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h2 style={{ margin: 0, color: '#2d3748' }}>Permission Management</h2>
        <button
          onClick={() => setShowRequestForm(true)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#ff6b35',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}
        >
          + Request Permission
        </button>
      </div>

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#fee',
          color: '#c00',
          borderRadius: '6px',
          marginBottom: '1rem',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid #eee',
        marginBottom: '2rem'
      }}>
        <button
          type="button"
          style={activeTab === 'my_requests' ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab('my_requests')}
        >
          My Requests ({myRequests.length})
        </button>
        <button
          type="button"
          style={activeTab === 'pending_approvals' ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab('pending_approvals')}
        >
          Pending Approvals ({pendingApprovals.filter(r => r.status === 'pending').length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
          Loading permissions...
        </div>
      ) : (
        <>
          {activeTab === 'my_requests' && (
            <div>
              {myRequests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
                  <p>No permission requests found</p>
                  <p style={{ fontSize: '0.9rem' }}>Request permissions to edit or delete test cases you don't own</p>
                </div>
              ) : (
                myRequests.map(request => renderRequestCard(request))
              )}
            </div>
          )}

          {activeTab === 'pending_approvals' && (
            <div>
              {pendingApprovals.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
                  <p>No pending approval requests</p>
                </div>
              ) : (
                pendingApprovals.map(request => renderRequestCard(request, true))
              )}
            </div>
          )}
        </>
      )}

      {/* Request Form Modal */}
      {showRequestForm && (
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
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0' }}>Request Permission</h3>
            
            <form onSubmit={handleSubmitRequest}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Test Case ID <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <input
                  type="text"
                  value={requestForm.testCaseId}
                  onChange={(e) => setRequestForm({ ...requestForm, testCaseId: e.target.value })}
                  placeholder="e.g., TC-000001"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Permission Type
                </label>
                <select
                  value={requestForm.permissionType}
                  onChange={(e) => setRequestForm({ ...requestForm, permissionType: e.target.value as any })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                >
                  <option value="edit">Edit Permission</option>
                  <option value="delete">Delete Permission</option>
                  <option value="transfer_ownership">Transfer Ownership</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Reason <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <textarea
                  value={requestForm.reason}
                  onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                  rows={4}
                  placeholder="Explain why you need this permission..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowRequestForm(false);
                    setRequestForm({ testCaseId: '', permissionType: 'edit', reason: '' });
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#ff6b35',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionManager;