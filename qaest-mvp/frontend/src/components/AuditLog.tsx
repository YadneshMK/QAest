import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

interface AuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName?: string;
  performedBy: string;
  performedByName: string;
  targetUser?: string;
  targetUserName?: string;
  details: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

interface AuditLogProps {
  authToken: string;
  currentUser: any;
  filterByEntity?: string;
  filterByEntityId?: string;
}

const AuditLog: React.FC<AuditLogProps> = ({ 
  authToken, 
  currentUser, 
  filterByEntity, 
  filterByEntityId 
}) => {
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    action: '',
    entityType: filterByEntity || '',
    performedBy: '',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    fetchAuditLog();
  }, [filters]);

  const fetchAuditLog = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.action) params.append('action', filters.action);
      if (filters.entityType) params.append('entityType', filters.entityType);
      if (filters.performedBy) params.append('performedBy', filters.performedBy);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filterByEntityId) params.append('entityId', filterByEntityId);

      const response = await fetch(`${API_BASE_URL}/api/audit-log?${params}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAuditEntries(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch audit log:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('approve')) return '#28a745';
    if (action.includes('reject') || action.includes('deny')) return '#dc3545';
    if (action.includes('create')) return '#007bff';
    if (action.includes('update') || action.includes('edit')) return '#ffc107';
    if (action.includes('delete')) return '#dc3545';
    if (action.includes('login')) return '#17a2b8';
    return '#6c757d';
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const renderDetails = (details: any) => {
    if (!details) return null;
    
    if (typeof details === 'string') {
      return <span>{details}</span>;
    }
    
    return (
      <div style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '0.5rem' }}>
        {Object.entries(details).map(([key, value]) => (
          <div key={key}>
            <strong>{key.replace(/_/g, ' ')}:</strong> {JSON.stringify(value)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h3 style={{ margin: '0 0 1rem 0', color: '#2d3748' }}>Audit Trail</h3>
      
      {/* Filters */}
      <div style={{
        backgroundColor: 'white',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: '500' }}>
              Action Type
            </label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.85rem'
              }}
            >
              <option value="">All Actions</option>
              <option value="user_approved">User Approved</option>
              <option value="user_rejected">User Rejected</option>
              <option value="role_changed">Role Changed</option>
              <option value="permission_granted">Permission Granted</option>
              <option value="permission_denied">Permission Denied</option>
              <option value="test_case_created">Test Case Created</option>
              <option value="test_case_updated">Test Case Updated</option>
              <option value="test_case_deleted">Test Case Deleted</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: '500' }}>
              Date From
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.85rem'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: '500' }}>
              Date To
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.85rem'
              }}
            />
          </div>
        </div>
      </div>

      {/* Audit Entries */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>
          Loading audit log...
        </div>
      ) : auditEntries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>
          No audit entries found
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {auditEntries.map(entry => (
            <div
              key={entry.id}
              style={{
                backgroundColor: 'white',
                padding: '1rem',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                borderLeft: `4px solid ${getActionColor(entry.action)}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                    <span style={{
                      backgroundColor: getActionColor(entry.action),
                      color: 'white',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      {formatAction(entry.action)}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                      by <strong>{entry.performedByName}</strong>
                    </span>
                    {entry.targetUserName && (
                      <span style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                        on <strong>{entry.targetUserName}</strong>
                      </span>
                    )}
                  </div>
                  
                  {entry.entityName && (
                    <div style={{ fontSize: '0.85rem', color: '#495057', marginBottom: '0.5rem' }}>
                      {entry.entityType}: <strong>{entry.entityName}</strong> ({entry.entityId})
                    </div>
                  )}
                  
                  {renderDetails(entry.details)}
                </div>
                
                <div style={{ fontSize: '0.8rem', color: '#6c757d', textAlign: 'right' }}>
                  <div>{new Date(entry.createdAt).toLocaleString()}</div>
                  {entry.ipAddress && (
                    <div style={{ marginTop: '0.25rem' }}>IP: {entry.ipAddress}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuditLog;