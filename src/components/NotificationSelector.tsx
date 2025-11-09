import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import {
  Bell,
  BellOff,
  Clock,
  Check,
  X,
  Volume2,
  VolumeX
} from "lucide-react";
import { useTheme } from '@/contexts/ThemeContext';
import { useNotifications } from '@/components/ui/notification';
import { notificationManager } from '@/services/NotificationManager';

interface NotificationInterval {
  id: 'off' | '10min' | '20min' | '30min' | '1hr';
  name: string;
  description: string;
  minutes: number;
  icon: React.ReactNode;
}

const notificationIntervals: NotificationInterval[] = [
  {
    id: 'off',
    name: 'Off',
    description: 'No desktop notifications',
    minutes: 0,
    icon: <BellOff className="w-4 h-4" />
  },
  {
    id: '10min',
    name: '10 minutes',
    description: 'Remind me every 10 minutes',
    minutes: 10,
    icon: <Clock className="w-4 h-4" />
  },
  {
    id: '20min',
    name: '20 minutes',
    description: 'Remind me every 20 minutes',
    minutes: 20,
    icon: <Clock className="w-4 h-4" />
  },
  {
    id: '30min',
    name: '30 minutes',
    description: 'Remind me every 30 minutes',
    minutes: 30,
    icon: <Clock className="w-4 h-4" />
  },
  {
    id: '1hr',
    name: '1 hour',
    description: 'Remind me every hour',
    minutes: 60,
    icon: <Clock className="w-4 h-4" />
  }
];

interface NotificationSelectorProps {
  currentInterval: 'off' | '10min' | '20min' | '30min' | '1hr';
  onIntervalChange: (interval: 'off' | '10min' | '20min' | '30min' | '1hr') => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentGoal?: string;
}

export function NotificationSelector({
  currentInterval,
  onIntervalChange,
  isOpen,
  onOpenChange,
  currentGoal = ''
}: NotificationSelectorProps) {
  const { theme } = useTheme();
  const { addNotification } = useNotifications();
  const [soundEnabled, setSoundEnabled] = useState(() => notificationManager.isSoundEnabled());

  const handleIntervalSelect = (interval: 'off' | '10min' | '20min' | '30min' | '1hr') => {
    onIntervalChange(interval);
    onOpenChange(false);

    // Show notification for the change
    const selectedInterval = notificationIntervals.find(i => i.id === interval);
    if (selectedInterval) {
      addNotification({
        type: interval === 'off' ? 'info' : 'success',
        title: `Notifications ${interval === 'off' ? 'Disabled' : 'Enabled'}`,
        message: selectedInterval.description,
        duration: 3000,
        icon: interval === 'off' ? <BellOff className="w-5 h-5" /> : <Bell className="w-5 h-5" />
      });
    }
  };

  const toggleSound = () => {
    const newSoundState = !soundEnabled;
    setSoundEnabled(newSoundState);
    notificationManager.setSoundEnabled(newSoundState);
    addNotification({
      type: 'info',
      title: `Sound ${newSoundState ? 'Enabled' : 'Disabled'}`,
      message: `Notification sounds are ${newSoundState ? 'now enabled' : 'now disabled'}`,
      duration: 2000,
      icon: newSoundState ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`w-full max-w-md rounded-2xl p-6 shadow-2xl ${
          theme === 'dark' ? 'bg-card border border-border' : 'bg-white border border-gray-200'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-full bg-mint/10 flex items-center justify-center flex-shrink-0`}>
              <Bell className="w-5 h-5 text-mint" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Focus Reminders</h3>
              <p className="text-sm text-muted-foreground">
                Get desktop notifications to stay on track
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className={`p-1 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-muted text-muted-foreground hover:text-foreground'
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Goal Display */}
        {currentGoal && (
          <div className={`mb-6 p-3 rounded-lg ${
            theme === 'dark' ? 'bg-muted/30' : 'bg-mint/5 border border-mint/20'
          }`}>
            <p className="text-xs text-muted-foreground mb-1">Current goal</p>
            <p className="text-sm font-medium text-foreground truncate">{currentGoal}</p>
          </div>
        )}

        {/* Notification Intervals */}
        <div className="space-y-2 mb-6">
          {notificationIntervals.map((interval) => (
            <button
              key={interval.id}
              onClick={() => handleIntervalSelect(interval.id)}
              className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                currentInterval === interval.id
                  ? 'border-mint bg-mint/5'
                  : theme === 'dark'
                    ? 'border-border hover:border-mint/50 hover:bg-muted/30'
                    : 'border-gray-200 hover:border-mint/50 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${
                  currentInterval === interval.id ? 'bg-mint/10' : theme === 'dark' ? 'bg-muted/50' : 'bg-gray-100'
                } flex items-center justify-center flex-shrink-0`}>
                  <div className={currentInterval === interval.id ? 'text-mint' : theme === 'dark' ? 'text-muted-foreground' : 'text-gray-500'}>
                    {interval.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{interval.name}</span>
                    {currentInterval === interval.id && (
                      <span className="text-xs bg-mint text-white px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {interval.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Sound Toggle */}
        <div className={`p-3 rounded-xl border ${
          theme === 'dark' ? 'bg-muted/30 border-border' : 'bg-gray-50 border-gray-200'
        }`}>
          <button
            onClick={toggleSound}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg ${
                theme === 'dark' ? 'bg-muted/50' : 'bg-gray-200'
              } flex items-center justify-center`}>
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <VolumeX className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">Sound Effects</p>
                <p className="text-xs text-muted-foreground">
                  Play sound with notifications
                </p>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors ${
              soundEnabled ? 'bg-mint' : theme === 'dark' ? 'bg-muted' : 'bg-gray-300'
            }`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </div>
          </button>
        </div>

        {/* Info Footer */}
        {currentInterval !== 'off' && (
          <div className={`mt-4 rounded-xl p-3 ${
            theme === 'dark'
              ? 'bg-muted/30 border border-border'
              : 'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex items-start gap-2">
              <Bell className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Desktop notifications will appear to remind you of your goal during focus sessions.
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// Export a trigger button component
interface NotificationTriggerProps {
  onClick: () => void;
  isActive: boolean;
}

export function NotificationTrigger({ onClick, isActive }: NotificationTriggerProps) {
  const { theme } = useTheme();

  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg transition-colors pointer-events-auto z-10 ${
        isActive
          ? 'text-mint bg-mint/10 hover:bg-mint/20'
          : theme === 'dark'
            ? 'hover:bg-accent text-muted-foreground hover:text-foreground'
            : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
      }`}
      title="Focus Reminders"
    >
      {isActive ? (
        <Bell className="w-5 h-5" />
      ) : (
        <BellOff className="w-5 h-5" />
      )}
    </button>
  );
}