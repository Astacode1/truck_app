import { useState, useEffect } from 'react';
import NotificationsIcon from '@mui/icons-material/Notifications'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import WarningIcon from '@mui/icons-material/Warning'
import DescriptionIcon from '@mui/icons-material/Description'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import EventIcon from '@mui/icons-material/Event'
import CloseIcon from '@mui/icons-material/Close'
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
        return <DescriptionIcon sx={{ fontSize: 16 }} />;
      case 'order':
        return <EventIcon sx={{ fontSize: 16 }} />;
      case 'inspection':
        return <LocalShippingIcon sx={{ fontSize: 16 }} />;
      case 'insurance':
        return <DescriptionIcon sx={{ fontSize: 16 }} />;
      case 'permit':
        return <DescriptionIcon sx={{ fontSize: 16 }} />;
      case 'maintenance':
        return <AccessTimeIcon sx={{ fontSize: 16 }} />;
      default:
        return <NotificationsIcon sx={{ fontSize: 16 }} />;
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
      {/* Compact notification bar - HOLOGRAPHIC DESIGN */}
      <div 
        className="flex items-center justify-between px-6 py-4 cursor-pointer transition-all duration-300 hover:shadow-lg"
        style={{ 
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.95) 100%)',
          borderBottom: '1px solid rgba(34, 211, 238, 0.2)',
          backdropFilter: 'blur(20px)',
          boxShadow: urgentNotifications.length > 0 
            ? '0 4px 20px rgba(239, 68, 68, 0.2)' 
            : '0 2px 10px rgba(0, 0, 0, 0.1)'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="p-2 rounded-xl" style={{
              background: urgentNotifications.length > 0 
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)'
                : 'linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(129, 140, 248, 0.2) 100%)',
              border: urgentNotifications.length > 0
                ? '1px solid rgba(239, 68, 68, 0.3)'
                : '1px solid rgba(34, 211, 238, 0.3)'
            }}>
              <NotificationsIcon sx={{ 
                fontSize: 20, 
                color: urgentNotifications.length > 0 ? '#ef4444' : '#22d3ee'
              }} />
            </div>
            {urgentNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse" style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                boxShadow: '0 0 15px rgba(239, 68, 68, 0.6)'
              }}>
                {urgentNotifications.length}
              </span>
            )}
          </div>
          
          <div>
            <span className="font-bold text-sm text-white">
              {urgentNotifications.length > 0 
                ? `${urgentNotifications.length} urgent alert${urgentNotifications.length > 1 ? 's' : ''}`
                : `${notifications.length} notification${notifications.length > 1 ? 's' : ''}`
              }
            </span>
            {urgentNotifications.length > 0 && (
              <span className="ml-2 text-xs" style={{ color: 'rgba(148, 163, 184, 0.9)' }}>
                - {urgentNotifications[0].title}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {urgentNotifications.length > 0 && (
            <span className="flex items-center text-xs font-semibold px-3 py-1 rounded-full" style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5'
            }}>
              <WarningIcon sx={{ fontSize: 14, marginRight: '4px' }} />
              Urgent
            </span>
          )}
          <span className="text-xs" style={{ color: 'rgba(148, 163, 184, 0.7)' }}>
            {isExpanded ? '▲ Collapse' : '▼ Expand'}
          </span>
        </div>
      </div>

      {/* Expanded notification panel - HOLOGRAPHIC GLASSMORPHISM */}
      {isExpanded && (
        <div 
          className="border-t"
          style={{ 
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)',
            borderColor: 'rgba(34, 211, 238, 0.2)',
            backdropFilter: 'blur(20px)'
          }}
        >
          <div className="max-h-96 overflow-y-auto">
            {/* Urgent notifications */}
            {urgentNotifications.length > 0 && (
              <div className="p-6">
                <h3 className="text-sm font-black mb-4 flex items-center" style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  <WarningIcon sx={{ fontSize: 18, color: '#ef4444', marginRight: '8px' }} />
                  URGENT - EXPIRES WITHIN 7 DAYS
                </h3>
                <div className="space-y-3">
                  {urgentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 rounded-xl border transition-all duration-300 hover:shadow-lg"
                      style={{
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="p-2 rounded-lg" style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid rgba(239, 68, 68, 0.3)'
                          }}>
                            <div style={{ color: '#fca5a5' }}>
                              {getIcon(notification.type)}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-white mb-1">
                              {notification.title}
                            </h4>
                            <p className="text-xs mb-2" style={{ color: 'rgba(203, 213, 225, 0.9)' }}>
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-4">
                              <span className="text-xs font-bold px-2 py-1 rounded" style={{
                                background: 'rgba(239, 68, 68, 0.2)',
                                color: '#fca5a5'
                              }}>
                                ⚠️ {notification.daysUntilExpiry} days left
                              </span>
                              <span className="text-xs" style={{ color: 'rgba(148, 163, 184, 0.8)' }}>
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
                          className="p-1.5 rounded-lg transition-all duration-200"
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                          }}
                          title="Dismiss notification"
                        >
                          <CloseIcon sx={{ fontSize: 14, color: '#fca5a5' }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming notifications */}
            {upcomingNotifications.length > 0 && (
              <div className="p-6 border-t" style={{ borderColor: 'rgba(34, 211, 238, 0.2)' }}>
                <h3 className="text-sm font-black mb-4 flex items-center" style={{
                  background: 'linear-gradient(135deg, #22d3ee 0%, #818cf8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  <AccessTimeIcon sx={{ fontSize: 18, color: '#22d3ee', marginRight: '8px' }} />
                  UPCOMING - NEXT 30 DAYS
                </h3>
                <div className="space-y-3">
                  {upcomingNotifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 rounded-xl border transition-all duration-300 hover:shadow-lg"
                      style={{
                        background: notification.daysUntilExpiry <= 14
                          ? 'linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(249, 115, 22, 0.1) 100%)'
                          : 'linear-gradient(135deg, rgba(34, 211, 238, 0.15) 0%, rgba(129, 140, 248, 0.1) 100%)',
                        border: notification.daysUntilExpiry <= 14
                          ? '1px solid rgba(251, 146, 60, 0.3)'
                          : '1px solid rgba(34, 211, 238, 0.3)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="p-2 rounded-lg" style={{
                            background: notification.daysUntilExpiry <= 14
                              ? 'rgba(251, 146, 60, 0.2)'
                              : 'rgba(34, 211, 238, 0.2)',
                            border: notification.daysUntilExpiry <= 14
                              ? '1px solid rgba(251, 146, 60, 0.3)'
                              : '1px solid rgba(34, 211, 238, 0.3)'
                          }}>
                            <div style={{ 
                              color: notification.daysUntilExpiry <= 14 ? '#fdba74' : '#67e8f9'
                            }}>
                              {getIcon(notification.type)}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-white mb-1">
                              {notification.title}
                            </h4>
                            <p className="text-xs mb-2" style={{ color: 'rgba(203, 213, 225, 0.9)' }}>
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-4">
                              <span className="text-xs font-bold px-2 py-1 rounded" style={{
                                background: notification.daysUntilExpiry <= 14
                                  ? 'rgba(251, 146, 60, 0.2)'
                                  : 'rgba(34, 211, 238, 0.2)',
                                color: notification.daysUntilExpiry <= 14 ? '#fdba74' : '#67e8f9'
                              }}>
                                {notification.daysUntilExpiry} days left
                              </span>
                              <span className="text-xs" style={{ color: 'rgba(148, 163, 184, 0.8)' }}>
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
                          className="p-1.5 rounded-lg transition-all duration-200"
                          style={{
                            background: 'rgba(148, 163, 184, 0.1)',
                            border: '1px solid rgba(148, 163, 184, 0.2)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(148, 163, 184, 0.2)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(148, 163, 184, 0.1)'
                          }}
                          title="Dismiss notification"
                        >
                          <CloseIcon sx={{ fontSize: 14, color: 'rgba(148, 163, 184, 0.8)' }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {upcomingNotifications.length > 5 && (
                  <div className="mt-4 text-center">
                    <span className="text-xs font-semibold px-4 py-2 rounded-full inline-block" style={{
                      background: 'rgba(34, 211, 238, 0.1)',
                      border: '1px solid rgba(34, 211, 238, 0.2)',
                      color: '#67e8f9'
                    }}>
                      +{upcomingNotifications.length - 5} more notifications
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Summary footer - HOLOGRAPHIC STATS */}
            <div 
              className="p-6 border-t text-center"
              style={{ 
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.95) 100%)',
                borderColor: 'rgba(34, 211, 238, 0.2)',
                backdropFilter: 'blur(20px)'
              }}
            >
              <div className="grid grid-cols-3 gap-6 text-xs">
                <div className="p-3 rounded-xl" style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}>
                  <span className="font-black text-2xl block mb-1" style={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>{urgentNotifications.length}</span>
                  <span className="block font-semibold" style={{ color: '#fca5a5' }}>Urgent</span>
                </div>
                <div className="p-3 rounded-xl" style={{
                  background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(249, 115, 22, 0.1) 100%)',
                  border: '1px solid rgba(251, 146, 60, 0.3)'
                }}>
                  <span className="font-black text-2xl block mb-1" style={{
                    background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>{upcomingNotifications.length}</span>
                  <span className="block font-semibold" style={{ color: '#fdba74' }}>Upcoming</span>
                </div>
                <div className="p-3 rounded-xl" style={{
                  background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.15) 0%, rgba(129, 140, 248, 0.1) 100%)',
                  border: '1px solid rgba(34, 211, 238, 0.3)'
                }}>
                  <span className="font-black text-2xl block mb-1" style={{
                    background: 'linear-gradient(135deg, #22d3ee 0%, #818cf8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>{notifications.length}</span>
                  <span className="block font-semibold" style={{ color: '#67e8f9' }}>Total</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}