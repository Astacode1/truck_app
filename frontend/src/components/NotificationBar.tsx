import { useState, useEffect } from 'react';
import { Bell, Clock, AlertTriangle, FileText, Truck, Calendar, X } from 'lucide-react';
import NotificationService, { NotificationData } from '../services/NotificationService';

export default function NotificationBar() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>([]);

  // Load notifications from service
  useEffect(() => {
    const allNotifications = NotificationService.generateNotifications();
    
    // Filter out dismissed notifications
    const activeNotifications = allNotifications.filter(
      notification => !dismissedNotifications.includes(notification.id)
    );

    setNotifications(activeNotifications);
  }, [dismissedNotifications]);

  // Auto-refresh notifications every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      const allNotifications = NotificationService.generateNotifications();
      const activeNotifications = allNotifications.filter(
        notification => !dismissedNotifications.includes(notification.id)
      );
      setNotifications(activeNotifications);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [dismissedNotifications]);

  const getIcon = (type: NotificationData['type']) => {
    switch (type) {
      case 'license':
        return <FileText size={16} />;
      case 'order':
        return <Calendar size={16} />;
      case 'inspection':
        return <Truck size={16} />;
      case 'insurance':
        return <FileText size={16} />;
      case 'permit':
        return <FileText size={16} />;
      case 'maintenance':
        return <Clock size={16} />;
      default:
        return <Bell size={16} />;
    }
  };

  const getPriorityColor = (priority: NotificationData['priority'], daysUntilExpiry: number) => {
    if (daysUntilExpiry <= 7) return 'text-red-500';
    if (daysUntilExpiry <= 14) return 'text-orange-500';
    if (priority === 'high') return 'text-red-500';
    if (priority === 'medium') return 'text-yellow-500';
    return 'text-blue-500';
  };

  const getPriorityBg = (priority: NotificationData['priority'], daysUntilExpiry: number) => {
    if (daysUntilExpiry <= 7) return 'bg-red-50 border-red-200';
    if (daysUntilExpiry <= 14) return 'bg-orange-50 border-orange-200';
    if (priority === 'high') return 'bg-red-50 border-red-200';
    if (priority === 'medium') return 'bg-yellow-50 border-yellow-200';
    return 'bg-blue-50 border-blue-200';
  };

  const dismissNotification = (id: string) => {
    setDismissedNotifications([...dismissedNotifications, id]);
  };

  const urgentNotifications = notifications.filter(n => n.daysUntilExpiry <= 7);
  const upcomingNotifications = notifications.filter(n => n.daysUntilExpiry > 7 && n.daysUntilExpiry <= 30);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-bar">
      {/* Compact notification bar */}
      <div 
        className="flex items-center justify-between px-4 py-3 cursor-pointer transition-all duration-300"
        style={{ 
          backgroundColor: 'var(--card-bg)', 
          borderBottom: '1px solid var(--border-color)',
          backdropFilter: 'blur(16px)'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Bell size={20} style={{ color: 'var(--text-primary)' }} />
            {urgentNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {urgentNotifications.length}
              </span>
            )}
          </div>
          
          <div>
            <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
              {urgentNotifications.length > 0 
                ? `${urgentNotifications.length} urgent alert${urgentNotifications.length > 1 ? 's' : ''}`
                : `${notifications.length} notification${notifications.length > 1 ? 's' : ''}`
              }
            </span>
            {urgentNotifications.length > 0 && (
              <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                - {urgentNotifications[0].title}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {urgentNotifications.length > 0 && (
            <span className="flex items-center text-red-500 text-xs">
              <AlertTriangle size={14} className="mr-1" />
              Urgent
            </span>
          )}
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {isExpanded ? 'Click to collapse' : 'Click to expand'}
          </span>
        </div>
      </div>

      {/* Expanded notification panel */}
      {isExpanded && (
        <div 
          className="border-t"
          style={{ 
            backgroundColor: 'var(--bg-secondary)', 
            borderColor: 'var(--border-color)'
          }}
        >
          <div className="max-h-96 overflow-y-auto">
            {/* Urgent notifications */}
            {urgentNotifications.length > 0 && (
              <div className="p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
                  <AlertTriangle size={16} className="text-red-500 mr-2" />
                  Urgent (Expires within 7 days)
                </h3>
                <div className="space-y-2">
                  {urgentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border transition-all duration-200 ${getPriorityBg(notification.priority, notification.daysUntilExpiry)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={getPriorityColor(notification.priority, notification.daysUntilExpiry)}>
                            {getIcon(notification.type)}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                              {notification.title}
                            </h4>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                              {notification.message}
                            </p>
                            <div className="flex items-center mt-2 space-x-4">
                              <span className={`text-xs font-medium ${getPriorityColor(notification.priority, notification.daysUntilExpiry)}`}>
                                {notification.daysUntilExpiry} days remaining
                              </span>
                              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                Due: {new Date(notification.expiryDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissNotification(notification.id);
                          }}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                          title="Dismiss notification"
                        >
                          <X size={14} style={{ color: 'var(--text-muted)' }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming notifications */}
            {upcomingNotifications.length > 0 && (
              <div className="p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <h3 className="text-sm font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
                  <Clock size={16} className="text-yellow-500 mr-2" />
                  Upcoming (Next 30 days)
                </h3>
                <div className="space-y-2">
                  {upcomingNotifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border transition-all duration-200 ${getPriorityBg(notification.priority, notification.daysUntilExpiry)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={getPriorityColor(notification.priority, notification.daysUntilExpiry)}>
                            {getIcon(notification.type)}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                              {notification.title}
                            </h4>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                              {notification.message}
                            </p>
                            <div className="flex items-center mt-2 space-x-4">
                              <span className={`text-xs font-medium ${getPriorityColor(notification.priority, notification.daysUntilExpiry)}`}>
                                {notification.daysUntilExpiry} days remaining
                              </span>
                              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                Due: {new Date(notification.expiryDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissNotification(notification.id);
                          }}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Dismiss notification"
                        >
                          <X size={14} style={{ color: 'var(--text-muted)' }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {upcomingNotifications.length > 5 && (
                  <div className="mt-3 text-center">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      +{upcomingNotifications.length - 5} more notifications
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Summary footer */}
            <div 
              className="p-4 border-t text-center"
              style={{ 
                backgroundColor: 'var(--card-bg)', 
                borderColor: 'var(--border-color)' 
              }}
            >
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="font-medium text-red-500">{urgentNotifications.length}</span>
                  <span className="block" style={{ color: 'var(--text-muted)' }}>Urgent</span>
                </div>
                <div>
                  <span className="font-medium text-yellow-500">{upcomingNotifications.length}</span>
                  <span className="block" style={{ color: 'var(--text-muted)' }}>Upcoming</span>
                </div>
                <div>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{notifications.length}</span>
                  <span className="block" style={{ color: 'var(--text-muted)' }}>Total</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}