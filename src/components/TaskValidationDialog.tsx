import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, AlertCircle, Edit3, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/contexts/ThemeContext';

interface TaskValidationDialogProps {
  isOpen: boolean;
  originalTask: string;
  validationType?: 'client' | 'ai';
  onRetry: (newTask: string) => void;
  onCancel: () => void;
}

const examples = [
  "Finish physics homework chapter 5",
  "Complete Q3 sales presentation",
  "Write project proposal for client",
  "Study for chemistry midterm exam",
];

export const TaskValidationDialog: React.FC<TaskValidationDialogProps> = ({
  isOpen,
  originalTask,
  validationType = 'ai',
  onRetry,
  onCancel
}) => {
  const { theme } = useTheme();
  const [newTask, setNewTask] = useState(originalTask);

  if (!isOpen) return null;

  // Determine the appropriate message based on validation type
  const isClientValidation = validationType === 'client';
  const title = isClientValidation ? "Task Too Short" : "Task Needs More Detail";
  const message = isClientValidation
    ? `"${originalTask}" is too short. Tasks must be at least 3 characters long.`
    : `"${originalTask}" is not specific enough to track your productivity effectively.`;
  const alertIcon = isClientValidation ? "text-red-500" : "text-orange-500";
  const alertBg = isClientValidation ? "bg-red-500/10" : "bg-orange-500/10";

  const examplesTitle = isClientValidation ? "Examples of good tasks:" : "Examples of specific tasks:";

  const handleRetry = () => {
    if (newTask.trim()) {
      onRetry(newTask.trim());
    }
  };

  const handleExampleClick = (example: string) => {
    setNewTask(example);
  };

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
            <div className={`w-10 h-10 rounded-full ${alertBg} flex items-center justify-center flex-shrink-0`}>
              <AlertCircle className={`w-5 h-5 ${alertIcon}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground">
                {message}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className={`p-1 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-muted text-muted-foreground hover:text-foreground'
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              Rewrite your task
            </label>
            <Input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRetry();
                }
              }}
              placeholder="Be specific about what you want to accomplish..."
              className={`w-full h-12 rounded-xl ${
                theme === 'dark'
                  ? 'bg-muted border-border focus:border-mint'
                  : 'bg-gray-50 border-gray-300 focus:border-mint'
              }`}
            />
          </div>
        </div>

        {/* Examples Section */}
        <div className={`rounded-xl p-4 mb-6 ${
          theme === 'dark'
            ? 'bg-muted/30 border border-border'
            : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">{examplesTitle}</span>
          </div>
          <div className="space-y-2">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className={`w-full text-left text-sm p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                    : 'hover:bg-blue-100 text-gray-700 hover:text-gray-900'
                }`}
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 rounded-xl h-11"
          >
            Cancel
          </Button>
          <Button
            onClick={handleRetry}
            disabled={!newTask.trim()}
            className="flex-1 rounded-xl h-11 bg-mint hover:bg-mint/90 font-medium"
          >
            Try Again
          </Button>
        </div>
      </motion.div>
    </div>
  );
};