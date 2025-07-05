import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCircle, XCircle, Trash2, FileText, File } from "lucide-react";
import { getUserNotifications, markNotificationAsRead, getUnreadNotificationCount } from "../../services/firebase";

const NotificationDropdown = ({ user }) => {
  const navigate = useNavigate();
  
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Check for unread notifications periodically
  useEffect(() => {
    if (user?.uid) {
      checkUnreadCount();
      const interval = setInterval(checkUnreadCount, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user?.uid]);

  // Get count of unread notifications
  const checkUnreadCount = async () => {
    try {
      const count = await getUnreadNotificationCount(user.uid);
      setUnreadCount(count);
    } catch (error) {
      console.error("Error checking unread notifications:", error);
    }
  };

  // Load all notifications when dropdown opens
  const loadNotifications = async () => {
    if (!user?.uid || loading) return;
    
    setLoading(true);
    try {
      const userNotifications = await getUserNotifications(user.uid);
      setNotifications(userNotifications);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      loadNotifications(); // Load fresh notifications when opening
    }
  };

  // Mark notification as read and remove from list
  const markAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Handle clicking on a notification
  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read if unread
      if (!notification.read) {
        await markAsRead(notification.id);
      }
      
      // Remove from list immediately
      setNotifications(prev => prev.filter(notif => notif.id !== notification.id));
      
      // Navigate based on notification type
      const navigationMap = {
        post_submitted: "/admin?tab=pending",
        post_approved: "/dashboard",
        post_rejected: "/dashboard",
        post_deleted: "/dashboard"
      };
      
      navigate(navigationMap[notification.type] || "/dashboard");
      setIsOpen(false);
      
      // Refresh notifications after a short delay
      setTimeout(() => loadNotifications(), 100);
    } catch (error) {
      console.error("Error handling notification click:", error);
    }
  };

  // Format timestamps for human-readable display
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Get icon for different notification types
  const getNotificationIcon = (type) => {
    const icons = {
      post_approved: <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />,
      post_rejected: <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />,
      post_deleted: <Trash2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />,
      post_submitted: <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
    };

    return icons[type] || <File className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
  };

  // Get background color for different notification types
  const getNotificationColor = (type) => {
    const colors = {
      post_approved: "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700",
      post_rejected: "bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700",
      post_deleted: "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600",
      post_submitted: "bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700"
    };

    return colors[type] || "bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700";
  };

  // Don't render if user is not logged in
  if (!user) return null;

  return (
    <div className="relative">
      {/* Notification bell button */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Background overlay */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          {/* Dropdown menu */}
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-50 max-h-96 overflow-hidden max-w-[calc(100vw-2rem)] sm:max-w-none -translate-x-4 sm:translate-x-0">
            
            {/* Header */}
            <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs font-medium px-2 py-1 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
            </div>
            
            {/* Notification list */}
            <div className="max-h-64 sm:max-h-80 overflow-y-auto">
              {loading ? (
                // Loading state
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Loading...</p>
                </div>
              ) : notifications.length > 0 ? (
                // List of notifications
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                        !notification.read ? getNotificationColor(notification.type) : ""
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-2 sm:space-x-3">
                        {/* Notification icon */}
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        {/* Notification content */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!notification.read ? "font-medium text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"} break-words`}>
                            {notification.message}
                          </p>
                          
                          {/* Rejection reason if present */}
                          {notification.rejectionReason && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1 bg-red-50 dark:bg-red-900 p-2 rounded break-words">
                              <strong>Reason:</strong> {notification.rejectionReason}
                            </p>
                          )}
                          
                          {/* Timestamp */}
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>
                        
                        {/* Unread indicator */}
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full flex-shrink-0 mt-2"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Empty state
                <div className="p-6 sm:p-8 text-center">
                  <Bell className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No notifications yet</p>
                </div>
              )}
            </div>
            
            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;
