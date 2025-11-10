import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, X, Check, Timer } from "lucide-react";
import { useTheme } from '@/contexts/ThemeContext';
import { useNotifications } from '@/components/ui/notification';

interface TimePreset {
  id: string;
  name: string;
  minutes: number;
  icon: React.ReactNode;
}

const timePresets: TimePreset[] = [
  {
    id: '15min',
    name: '15 min',
    minutes: 15,
    icon: <Timer className="w-4 h-4" />
  },
  {
    id: '25min',
    name: '25 min',
    minutes: 25,
    icon: <Timer className="w-4 h-4" />
  },
  {
    id: '45min',
    name: '45 min',
    minutes: 45,
    icon: <Timer className="w-4 h-4" />
  },
  {
    id: '60min',
    name: '1 hour',
    minutes: 60,
    icon: <Timer className="w-4 h-4" />
  },
  {
    id: '90min',
    name: '1.5 hours',
    minutes: 90,
    icon: <Timer className="w-4 h-4" />
  },
  {
    id: '120min',
    name: '2 hours',
    minutes: 120,
    icon: <Timer className="w-4 h-4" />
  }
];

interface TimeSelectorModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onTimeSelect: (minutes: number) => void;
}

export function TimeSelectorModal({ isOpen, onOpenChange, onTimeSelect }: TimeSelectorModalProps) {
  const { theme } = useTheme();
  const { addNotification } = useNotifications();
  const [selectedMinutes, setSelectedMinutes] = useState<number>(25);
  const [customHours, setCustomHours] = useState<string>('0');
  const [customMinutes, setCustomMinutes] = useState<string>('0');
  const [useCustom, setUseCustom] = useState<boolean>(false);

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedMinutes(25);
      setCustomHours('0');
      setCustomMinutes('0');
      setUseCustom(false);
    }
  }, [isOpen]);

  const handlePresetSelect = (preset: TimePreset) => {
    setSelectedMinutes(preset.minutes);
    setUseCustom(false);
  };

  const handleCustomChange = () => {
    setUseCustom(true);
    const hours = parseInt(customHours) || 0;
    const minutes = parseInt(customMinutes) || 0;
    setSelectedMinutes(hours * 60 + minutes);
  };

  const handleConfirm = () => {
    if (selectedMinutes > 0) {
      onTimeSelect(selectedMinutes);
      onOpenChange(false);

      // Show notification
      const selectedPreset = timePresets.find(p => p.minutes === selectedMinutes);
      const timeText = selectedPreset ? selectedPreset.name : `${Math.floor(selectedMinutes / 60)}h ${selectedMinutes % 60}min`;

      addNotification({
        type: 'success',
        title: 'Time Selected',
        message: `Session set to ${timeText}`,
        duration: 3000,
        icon: <Clock className="w-5 h-5" />
      });
    }
  };

  const formatTime = (totalMinutes: number): string => {
    if (totalMinutes < 60) {
      return `${totalMinutes} min`;
    }
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (minutes === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    return `${hours}h ${minutes}m`;
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
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Session Duration</h3>
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

        {/* Preset Options */}
        <div className="mb-6">
          <div className={`grid grid-cols-3 gap-2 ${
            theme === 'dark' ? 'bg-muted' : 'bg-gray-100'
          } rounded-lg p-2`}>
            {timePresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset)}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${
                  selectedMinutes === preset.minutes && !useCustom
                    ? 'bg-mint text-white shadow-sm'
                    : theme === 'dark'
                      ? 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                }`}
              >
                {preset.icon}
                <span className="text-xs font-medium">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Time Input */}
        <div className={`mb-6 p-4 rounded-lg ${
          theme === 'dark' ? 'bg-muted/30' : 'bg-gray-50'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-mint" />
            <span className="text-sm font-medium">Custom Duration</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="23"
                value={customHours}
                onChange={(e) => setCustomHours(e.target.value)}
                onFocus={() => setUseCustom(true)}
                className={`w-16 px-2 py-1 rounded border text-center ${
                  theme === 'dark'
                    ? 'bg-background border-border'
                    : 'bg-white border-gray-300'
                } ${useCustom ? 'border-mint' : ''}`}
              />
              <span className="text-sm text-muted-foreground">h</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="59"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
                onFocus={() => setUseCustom(true)}
                className={`w-16 px-2 py-1 rounded border text-center ${
                  theme === 'dark'
                    ? 'bg-background border-border'
                    : 'bg-white border-gray-300'
                } ${useCustom ? 'border-mint' : ''}`}
              />
              <span className="text-sm text-muted-foreground">m</span>
            </div>
          </div>
        </div>

        {/* Selected Time Display */}
        <div className={`mb-6 p-4 rounded-lg ${
          theme === 'dark' ? 'bg-mint/10 border border-mint/20' : 'bg-mint/5 border border-mint/30'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Selected Duration:</span>
            <span className="font-semibold text-mint">{formatTime(selectedMinutes)}</span>
          </div>
        </div>

        {/* Confirm Button */}
        <div className="flex justify-end">
          <button
            onClick={handleConfirm}
            disabled={selectedMinutes === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedMinutes > 0
                ? 'bg-mint text-white hover:bg-mint/90 shadow-sm'
                : theme === 'dark'
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            Confirm
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Export a trigger button component
interface TimeTriggerProps {
  onClick: () => void;
}

export function TimeTrigger({ onClick }: TimeTriggerProps) {
  const { theme } = useTheme();

  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg transition-colors pointer-events-auto z-10 ${
        theme === 'dark'
          ? 'hover:bg-accent text-muted-foreground hover:text-foreground'
          : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
      }`}
      style={{ cursor: 'pointer !important' }}
      title="Set Session Duration"
    >
      <Clock className="w-5 h-5" />
    </button>
  );
}