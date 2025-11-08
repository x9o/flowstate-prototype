import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Info, AlertTriangle, Settings } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  icon?: React.ReactNode;
}

interface NotificationItemProps {
  notification: Notification;
  onRemove: (id: string) => void;
}

function NotificationItem({ notification, onRemove }: NotificationItemProps) {
  const { theme } = useTheme();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const duration = notification.duration || 3000;
    const interval = 50;
    const decrement = (100 * interval) / duration;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev <= decrement) {
          onRemove(notification.id);
          return 0;
        }
        return prev - decrement;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [notification.id, notification.duration, onRemove]);

  const getNotificationStyles = () => {
    switch (notification.type) {
      case 'success':
        return {
          bgColor: theme === 'dark' ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-200',
          textColor: 'text-green-600',
          iconColor: 'text-green-500',
          progressColor: 'bg-green-500'
        };
      case 'error':
        return {
          bgColor: theme === 'dark' ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200',
          textColor: 'text-red-600',
          iconColor: 'text-red-500',
          progressColor: 'bg-red-500'
        };
      case 'warning':
        return {
          bgColor: theme === 'dark' ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-yellow-50 border-yellow-200',
          textColor: 'text-yellow-600',
          iconColor: 'text-yellow-500',
          progressColor: 'bg-yellow-500'
        };
      default:
        return {
          bgColor: theme === 'dark' ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200',
          textColor: 'text-blue-600',
          iconColor: 'text-blue-500',
          progressColor: 'bg-blue-500'
        };
    }
  };

  const getDefaultIcon = () => {
    switch (notification.type) {
      case 'success':
        return <Check className="w-5 h-5" />;
      case 'error':
        return <X className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const styles = getNotificationStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`
        relative flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm
        min-w-[320px] max-w-[400px]
        ${styles.bgColor} ${styles.textColor}
      `}
    >
      {/* Progress Bar */}
      <div
        className="absolute bottom-0 left-0 h-1 rounded-b-xl transition-all duration-75 ease-linear"
        style={{
          width: `${progress}%`,
        }}
      >
        <div
          className={`h-full rounded-b-xl ${styles.progressColor}`}
        />
      </div>

      {/* Icon */}
      <div className={`flex-shrink-0 ${styles.iconColor}`}>
        {notification.icon || getDefaultIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm">{notification.title}</h4>
        {notification.message && (
          <p className="text-xs opacity-80 mt-1">{notification.message}</p>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={() => onRemove(notification.id)}
        className={`flex-shrink-0 p-1 rounded-lg transition-colors opacity-60 hover:opacity-100 ${
          theme === 'dark' ? 'hover:bg-black/20' : 'hover:bg-white/50'
        }`}
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

interface NotificationContainerProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

export function NotificationContainer({ notifications, onRemove }: NotificationContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <NotificationItem
              notification={notification}
              onRemove={onRemove}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Context for managing notifications
interface NotificationContextType {
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

export const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = React.useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = { ...notification, id };
    setNotifications(prev => [...prev, newNotification]);
  }, []);

  const removeNotification = React.useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = React.useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{
      addNotification,
      removeNotification,
      clearAllNotifications
    }}>
      {children}
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
    </NotificationContext.Provider>
  );
}