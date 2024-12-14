import React from "react";

interface Notification {
  message: string;
  timestamp: string;
}

interface NotificationsProps {
  notifications: Notification[];
  handleClearNotifications: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({
  notifications,
  handleClearNotifications,
}) => {
  return (
    <div className="space-y-4 min-w-[20px]">
      {notifications.length > 0 ? (
        <>
          {notifications.map((notification, index) => (
            <div
              key={index}
              className="p-3 bg-gray-50 rounded-lg border border-gray-100"
            >
              <p className="text-sm text-gray-800">{notification.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(notification.timestamp).toLocaleTimeString()}
              </p>
            </div>
          ))}
          <button
            onClick={handleClearNotifications}
            className="w-full px-4 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            Clear All
          </button>
        </>
      ) : (
        <p className="text-sm text-gray-500 p-3">No new notifications</p>
      )}
    </div>
  );
};

export default Notifications;
