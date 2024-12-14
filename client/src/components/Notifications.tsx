import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const Notifications: React.FC = () => {
  const notifications = useSelector((state: RootState) => state.chat.notifications);

  return (
    <div className="max-h-40 overflow-y-auto">
      {notifications.map((notification, index) => (
        <div key={index} className="p-2 mb-2 bg-gray-100 rounded">
          <p className="text-sm">{notification.message}</p>
          <p className="text-xs text-gray-500">
            {new Date(notification.timestamp).toLocaleTimeString()}
          </p>
        </div>
      ))}
    </div>
  );
};

export default Notifications;

