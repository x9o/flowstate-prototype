import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Minimize2, XOctagon, AlertTriangle, CheckCircle, X, Check, Ban, HelpCircle, Check as CheckIcon } from "lucide-react";
import { useTheme } from '@/contexts/ThemeContext';
import { useNotifications } from '@/components/ui/notification';

interface BlockingModeExample {
  type: 'feature' | 'warning';
  text: string;
}

interface BlockingModeLevel {
  id: 'gentle' | 'hard';
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  iconBg: string;
  examples: BlockingModeExample[];
}

const blockingModeLevels: BlockingModeLevel[] = [
  {
    id: 'gentle',
    name: 'Gentle Mode',
    description: 'Minimizes and hides blocked apps without closing them',
    icon: <Minimize2 className="w-5 h-5" />,
    color: 'text-blue-500',
    iconBg: 'bg-blue-500/10',
    examples: [
      { type: 'feature', text: 'Apps stay running in background' },
      { type: 'feature', text: 'No work lost, apps just minimized' },
      { type: 'feature', text: 'Less disruptive, easier to resume' },
      { type: 'warning', text: 'User can bring apps back easily' }
    ]
  },
  {
    id: 'hard',
    name: 'Hard Mode',
    description: 'Terminates blocked apps completely for maximum focus',
    icon: <XOctagon className="w-5 h-5" />,
    color: 'text-red-500',
    iconBg: 'bg-red-500/10',
    examples: [
      { type: 'feature', text: 'Apps are completely closed/killed' },
      { type: 'feature', text: 'Maximum focus, hard to bypass' },
      { type: 'warning', text: 'May lose unsaved work in blocked apps' },
      { type: 'warning', text: 'Apps must be restarted after session' }
    ]
  }
];

interface BlockingModeSelectorProps {
  currentMode: 'gentle' | 'hard';
  onModeChange: (mode: 'gentle' | 'hard') => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BlockingModeSelector({ currentMode, onModeChange, isOpen, onOpenChange }: BlockingModeSelectorProps) {
  const { theme } = useTheme();
  const { addNotification } = useNotifications();
  const [previewMode, setPreviewMode] = useState<'gentle' | 'hard'>(currentMode);

  // Reset preview when the modal opens
  React.useEffect(() => {
    if (isOpen) {
      setPreviewMode(currentMode);
    }
  }, [isOpen, currentMode]);

  const handleModeSelect = (mode: 'gentle' | 'hard') => {
    setPreviewMode(mode);
  };

  const handleConfirm = () => {
    if (previewMode !== currentMode) {
      onModeChange(previewMode);

      // Show notification for the change
      const selectedMode = blockingModeLevels.find(m => m.id === previewMode);
      if (selectedMode) {
        addNotification({
          type: 'success',
          title: `Blocking Mode Changed`,
          message: `Switched to ${selectedMode.name} - ${selectedMode.description.toLowerCase()}`,
          duration: 4000,
          icon: <Check className="w-5 h-5" />
        });
      }
    }
    onOpenChange(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`w-full max-w-lg rounded-2xl p-6 shadow-2xl ${
          theme === 'dark' ? 'bg-card border border-border' : 'bg-white border border-gray-200'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Blocking Mode</h3>
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

        {/* Horizontal Mode Selector */}
        <div className="mb-6">
          <div className={`flex rounded-lg p-1 ${
            theme === 'dark' ? 'bg-muted' : 'bg-gray-100'
          }`}>
            {blockingModeLevels.map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleModeSelect(mode.id)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  previewMode === mode.id
                    ? 'bg-mint text-white shadow-sm'
                    : theme === 'dark'
                      ? 'text-muted-foreground hover:text-foreground'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {mode.name}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Mode Description */}
        <div className="mb-6">
          {(() => {
            const selectedMode = blockingModeLevels.find(m => m.id === previewMode);
            return selectedMode ? (
              <div className={`p-4 rounded-lg ${
                theme === 'dark' ? 'bg-muted/30' : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg ${selectedMode.iconBg} flex items-center justify-center`}>
                    <div className={selectedMode.color}>
                      {selectedMode.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{selectedMode.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedMode.description}
                    </p>
                  </div>
                </div>

                {/* Examples */}
                <div className={`p-3 rounded-lg text-xs space-y-2 ${
                  theme === 'dark' ? 'bg-muted/50' : 'bg-white'
                }`}>
                  {selectedMode.examples.map((example, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {example.type === 'feature' && (
                        <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                      )}
                      {example.type === 'warning' && (
                        <AlertTriangle className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                      )}
                      <span className="text-muted-foreground">{example.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null;
          })()}
        </div>

        {/* Confirm Button */}
        <div className="flex justify-end">
          <button
            onClick={handleConfirm}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              previewMode !== currentMode
                ? 'bg-mint text-white hover:bg-mint/90 shadow-sm'
                : theme === 'dark'
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            disabled={previewMode === currentMode}
          >
            <CheckIcon className="w-4 h-4" />
            Confirm
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Export a trigger button component
interface BlockingModeTriggerProps {
  onClick: () => void;
  currentMode?: 'gentle' | 'hard';
}

export function BlockingModeTrigger({ onClick, currentMode }: BlockingModeTriggerProps) {
  const { theme } = useTheme();

  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg transition-colors pointer-events-auto z-10 ${
        theme === 'dark'
          ? 'hover:bg-accent text-muted-foreground hover:text-foreground'
          : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
      }`}
      title={`Blocking Mode: ${currentMode === 'hard' ? 'Hard' : 'Gentle'}`}
    >
      {currentMode === 'hard' ? (
        <XOctagon className="w-5 h-5" />
      ) : (
        <Minimize2 className="w-5 h-5" />
      )}
    </button>
  );
}
