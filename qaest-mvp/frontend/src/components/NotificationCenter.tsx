import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'approval_pending' | 'permission_request';
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
  actionUrl?: string;
  actionLabel?: string;
}

interface NotificationCenterProps {
  authToken: string;
  currentUser: any;
  onNavigate?: (view: string, params?: any) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  authToken, 
  currentUser,
  onNavigate 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data || []);
        setUnreadCount(data.data?.filter((n: Notification) => !n.isRead).length || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/mark-all-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        const notification = notifications.find(n => n.id === notificationId);
        if (notification && !notification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'approval_pending': return '⏳';
      case 'permission_request': return '🔐';
      default: return 'ℹ️';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return '#28a745';
      case 'warning': return '#ffc107';
      case 'error': return '#dc3545';
      case 'approval_pending': return '#ff6b35';
      case 'permission_request': return '#6f42c1';
      default: return '#17a2b8';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    if (notification.actionUrl && onNavigate) {
      // Parse the action URL to determine navigation
      if (notification.actionUrl.includes('approvals')) {
        onNavigate('approvals');
      } else if (notification.actionUrl.includes('permissions')) {
        onNavigate('permissions');
      } else if (notification.actionUrl.includes('test-case')) {
        const testCaseId = notification.actionUrl.split('/').pop();
        onNavigate('dashboard', { highlightTestCase: testCaseId });
      }
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  return (
    <>
      {/* Notification Bell */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowPanel(!showPanel)}
          style={{
            position: 'relative',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            fontSize: '1.5rem'
          }}
        >
          🔔
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '0',
              right: '0',
              backgroundColor: '#dc3545',
              color: 'white',
              borderRadius: '10px',
              padding: '2px 6px',
              fontSize: '0.7rem',
              fontWeight: 'bold',
              minWidth: '20px'
            }}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notification Panel */}
        {showPanel && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: '0',
            width: '400px',
            maxHeight: '500px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{
              padding: '1rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h4 style={{ margin: 0, color: '#2d3748' }}>Notifications</h4>
              <div style={{ display: 'flex', gap: '10px' }}>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#007bff',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: '500'
                    }}
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setShowPanel(false)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    color: '#718096'
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid #e2e8f0',
              padding: '0 1rem'
            }}>
              <button
                onClick={() => setFilter('all')}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  fontWeight: filter === 'all' ? '600' : '400',
                  color: filter === 'all' ? '#ff6b35' : '#718096',
                  borderBottom: filter === 'all' ? '2px solid #ff6b35' : '2px solid transparent'
                }}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  fontWeight: filter === 'unread' ? '600' : '400',
                  color: filter === 'unread' ? '#ff6b35' : '#718096',
                  borderBottom: filter === 'unread' ? '2px solid #ff6b35' : '2px solid transparent'
                }}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {/* Notifications List */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              maxHeight: '350px'
            }}>
              {filteredNotifications.length === 0 ? (
                <div style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: '#718096'
                }}>
                  <p>No notifications</p>
                </div>
              ) : (
                filteredNotifications.map(notification => (
                  <div
                    key={notification.id}
                    style={{
                      padding: '1rem',
                      borderBottom: '1px solid #e2e8f0',
                      backgroundColor: notification.isRead ? 'white' : '#f7fafc',
                      cursor: notification.actionUrl ? 'pointer' : 'default',
                      transition: 'background-color 0.2s ease'
                    }}
                    onClick={() => notification.actionUrl && handleNotificationClick(notification)}
                    onMouseEnter={(e) => {
                      if (notification.actionUrl) {
                        e.currentTarget.style.backgroundColor = '#e2e8f0';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = notification.isRead ? 'white' : '#f7fafc';
                    }}
                  >
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <span style={{ fontSize: '1.2rem' }}>
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '0.25rem'
                        }}>
                          <h5 style={{
                            margin: 0,
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            color: '#2d3748'
                          }}>
                            {notification.title}
                          </h5>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#718096',
                              fontSize: '0.8rem',
                              padding: '2px'
                            }}
                          >
                            ×
                          </button>
                        </div>
                        <p style={{
                          margin: '0 0 0.5rem 0',
                          fontSize: '0.85rem',
                          color: '#718096',
                          lineHeight: '1.4'
                        }}>
                          {notification.message}
                        </p>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span style={{
                            fontSize: '0.75rem',
                            color: '#a0aec0'
                          }}>
                            {new Date(notification.createdAt).toRelativeTime()}
                          </span>
                          {notification.actionLabel && (
                            <span style={{
                              fontSize: '0.8rem',
                              color: getNotificationColor(notification.type),
                              fontWeight: '500'
                            }}>
                              {notification.actionLabel} →
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// Add this extension to the Date prototype for relative time
declare global {
  interface Date {
    toRelativeTime(): string;
  }
}

Date.prototype.toRelativeTime = function() {
  const seconds = Math.floor((new Date().getTime() - this.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
};

export default NotificationCenter;