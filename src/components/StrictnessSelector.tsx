import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Shield, AlertTriangle, CheckCircle, X, Check, Ban, HelpCircle, Check as CheckIcon } from "lucide-react";
import { useTheme } from '@/contexts/ThemeContext';
import { useNotifications } from '@/components/ui/notification';

interface StrictnessExample {
  type: 'allow' | 'block' | 'question';
  text: string;
}

interface StrictnessLevel {
  id: 'lenient' | 'balanced' | 'strict';
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  iconBg: string;
  examples: StrictnessExample[];
}

const strictnessLevels: StrictnessLevel[] = [
  {
    id: 'lenient',
    name: 'Lenient',
    description: 'Allows most activities, blocks only obvious distractions',
    icon: <Shield className="w-5 h-5" />,
    color: 'text-green-500',
    iconBg: 'bg-green-500/10',
    examples: [
      { type: 'allow', text: 'Research sites, documentation, work tools' },
      { type: 'allow', text: 'Educational content, industry news' },
      { type: 'block', text: 'Social media, entertainment sites, games' }
    ]
  },
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'Smart filtering with focus on work-related activities',
    icon: <CheckCircle className="w-5 h-5" />,
    color: 'text-blue-500',
    iconBg: 'bg-blue-500/10',
    examples: [
      { type: 'allow', text: 'Direct work tools, essential research' },
      { type: 'question', text: 'News sites, general browsing' },
      { type: 'block', text: 'Social media, videos, entertainment' }
    ]
  },
  {
    id: 'strict',
    name: 'Strict',
    description: 'Maximum focus mode - only essential work tools allowed',
    icon: <AlertTriangle className="w-5 h-5" />,
    color: 'text-red-500',
    iconBg: 'bg-red-500/10',
    examples: [
      { type: 'allow', text: 'Code editors, work documents, essential tools' },
      { type: 'block', text: 'News, social media, entertainment, general browsing' }
    ]
  }
];

interface StrictnessSelectorProps {
  currentLevel: 'lenient' | 'balanced' | 'strict';
  onLevelChange: (level: 'lenient' | 'balanced' | 'strict') => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StrictnessSelector({ currentLevel, onLevelChange, isOpen, onOpenChange }: StrictnessSelectorProps) {
  const { theme } = useTheme();
  const { addNotification } = useNotifications();
  const [previewLevel, setPreviewLevel] = useState<'lenient' | 'balanced' | 'strict'>(currentLevel);

  // Reset preview when the modal opens
  React.useEffect(() => {
    if (isOpen) {
      setPreviewLevel(currentLevel);
    }
  }, [isOpen, currentLevel]);

  const handleLevelSelect = (level: 'lenient' | 'balanced' | 'strict') => {
    setPreviewLevel(level);
  };

  const handleConfirm = () => {
    if (previewLevel !== currentLevel) {
      onLevelChange(previewLevel);

      // Show notification for the change
      const selectedLevel = strictnessLevels.find(l => l.id === previewLevel);
      if (selectedLevel) {
        addNotification({
          type: 'success',
          title: `AI Strictness Changed`,
          message: `Switched to ${selectedLevel.name} mode - ${selectedLevel.description.toLowerCase()}`,
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
          <h3 className="text-lg font-semibold">AI Strictness Level</h3>
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

        {/* Horizontal Strictness Selector */}
        <div className="mb-6">
          <div className={`flex rounded-lg p-1 ${
            theme === 'dark' ? 'bg-muted' : 'bg-gray-100'
          }`}>
            {strictnessLevels.map((level) => (
              <button
                key={level.id}
                onClick={() => handleLevelSelect(level.id)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  previewLevel === level.id
                    ? 'bg-mint text-white shadow-sm'
                    : theme === 'dark'
                      ? 'text-muted-foreground hover:text-foreground'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {level.name}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Level Description */}
        <div className="mb-6">
          {(() => {
            const selectedLevel = strictnessLevels.find(l => l.id === previewLevel);
            return selectedLevel ? (
              <div className={`p-4 rounded-lg ${
                theme === 'dark' ? 'bg-muted/30' : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg ${selectedLevel.iconBg} flex items-center justify-center`}>
                    <div className={selectedLevel.color}>
                      {selectedLevel.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{selectedLevel.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedLevel.description}
                    </p>
                  </div>
                </div>

                {/* Examples */}
                <div className={`p-3 rounded-lg text-xs space-y-2 ${
                  theme === 'dark' ? 'bg-muted/50' : 'bg-white'
                }`}>
                  {selectedLevel.examples.map((example, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {example.type === 'allow' && (
                        <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                      )}
                      {example.type === 'block' && (
                        <Ban className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                      )}
                      {example.type === 'question' && (
                        <HelpCircle className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
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
              previewLevel !== currentLevel
                ? 'bg-mint text-white hover:bg-mint/90 shadow-sm'
                : theme === 'dark'
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            disabled={previewLevel === currentLevel}
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
interface StrictnessTriggerProps {
  onClick: () => void;
}

export function StrictnessTrigger({ onClick }: StrictnessTriggerProps) {
  const { theme } = useTheme();

  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg transition-colors pointer-events-auto z-10 ${
        theme === 'dark'
          ? 'hover:bg-accent text-muted-foreground hover:text-foreground'
          : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
      }`}
      title="AI Strictness Level"
    >
      <Settings className="w-5 h-5" />
    </button>
  );
}