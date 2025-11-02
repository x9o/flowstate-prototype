import { useState, useEffect, useRef } from "react";
import { Plus, Search, Calendar, Play, Pause, RotateCcw, AlertCircle, X } from "lucide-react";
import { useTheme } from '@/contexts/ThemeContext';
import { useMonitoring } from '@/contexts/MonitoringContext';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskCard } from "@/components/TaskCard";
import { UserDropdown } from "@/components/Dropdown";
import { MonitoringStatus } from "@/components/MonitoringStatus";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Task Alert Popup Component
const TaskAlertPopup = ({ isOpen, onClose, onEnableTasks, onCreateTask }: {
  isOpen: boolean;
  onClose: () => void;
  onEnableTasks: () => void;
  onCreateTask: () => void;
}) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-md rounded-2xl shadow-2xl p-6 ${
        theme === 'dark' ? 'bg-card' : 'bg-white'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold">No Active Tasks</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-muted-foreground mb-6">
          You need to enable at least one task before starting the focus timer. This helps the AI understand what you want to focus on.
        </p>

        <div className="flex gap-3">
          <Button
            onClick={onEnableTasks}
            variant="outline"
            className="flex-1"
          >
            Enable Existing Tasks
          </Button>
          <Button
            onClick={onCreateTask}
            className="flex-1"
          >
            Create New Task
          </Button>
        </div>
      </div>
    </div>
  );
};

// Inline FocusTimer Component
const FocusTimer = ({ tasks }: {
  tasks: Array<{ id: number; enabled: boolean; title: string }>;
}) => {
  const { theme } = useTheme();
  const { startMonitoring, stopMonitoring, monitoringState } = useMonitoring();
  const [duration, setDuration] = useState(25 * 60);
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');
  const [showTaskAlert, setShowTaskAlert] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTimeRemaining(duration);
  }, [duration]);

  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((time) => {
          if (time <= 1) {
            // Timer ended - stop monitoring
            setIsActive(false);
            stopMonitoring().catch(error => {
              console.error('Failed to stop monitoring when timer ended:', error);
            });
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateProgress = () => {
    if (duration === 0) return 0;
    return ((duration - timeRemaining) / duration) * 100;
  };

  const handleStart = async () => {
    // Check if there are any enabled tasks
    const hasEnabledTasks = tasks.some(task => task.enabled);

    if (!hasEnabledTasks) {
      setShowTaskAlert(true);
      return;
    }

    // Convert enabled tasks to goals for monitoring
    const enabledTasks = tasks.filter(task => task.enabled);
    const goals = enabledTasks.map(task => task.title);

    if (timeRemaining === 0) {
      setTimeRemaining(duration);
    }

    try {
      setIsActive(true);

      // Start monitoring with enabled tasks as goals and duration in minutes
      await startMonitoring(goals, Math.floor(duration / 60));

      console.log(`Monitoring started with goals: ${goals.join(', ')}`);
    } catch (error) {
      console.error('Failed to start monitoring:', error);
      setIsActive(false);
      // TODO: Show error message to user
    }
  };

  const handleEnableTasks = () => {
    setShowTaskAlert(false);
    // Scroll to tasks section and focus
    const tasksSection = document.querySelector('[data-tasks-section]');
    tasksSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCreateTask = () => {
    setShowTaskAlert(false);
    // Focus on task input
    const taskInput = document.querySelector('input[placeholder="Add task..."]') as HTMLInputElement;
    taskInput?.focus();
  };

  const handlePause = async () => {
    setIsActive(false);

    // Stop monitoring when timer is paused
    try {
      await stopMonitoring();
      console.log('Monitoring stopped due to timer pause');
    } catch (error) {
      console.error('Failed to stop monitoring:', error);
    }
  };

  const handleReset = async () => {
    setIsActive(false);
    setTimeRemaining(duration);

    // Stop monitoring when timer is reset
    try {
      await stopMonitoring();
      console.log('Monitoring stopped due to timer reset');
    } catch (error) {
      console.error('Failed to stop monitoring:', error);
    }
  };

  const handleDurationChange = (value: string) => {
    const minutes = parseInt(value);
    if (!isNaN(minutes) && minutes > 0) {
      setDuration(minutes * 60);
      setIsActive(false);
    }
  };

  const handleCustomDuration = () => {
    const minutes = parseInt(customMinutes);
    if (!isNaN(minutes) && minutes > 0 && minutes <= 180) {
      setDuration(minutes * 60);
      setIsActive(false);
      setCustomMinutes('');
    }
  };

  const progress = calculateProgress();
  const circumference = 2 * Math.PI * 120;

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-soft p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold">Focus Timer</h2>
        <button className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-sky flex items-center justify-center hover:scale-105 transition-transform">
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </button>
      </div>

      <div className="flex flex-col items-center mb-6 sm:mb-8">
        <div className="relative">
          <svg className="w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 transform -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="120"
              stroke={theme === 'dark' ? '#374151' : '#E5E7EB'}
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="50%"
              cy="50%"
              r="120"
              stroke="url(#gradient)"
              strokeWidth="12"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={isActive ? circumference - (progress / 100) * circumference : circumference}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="100%" stopColor="#60A5FA" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${
                timeRemaining === 0
                  ? 'text-red-500'
                  : theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {formatTime(timeRemaining)}
              </div>
              <div className={`text-xs sm:text-sm mt-1 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {isActive ? 'Focus Time' : timeRemaining === duration ? 'Set a duration' : 'Paused'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <Select
            value={String(duration / 60)}
            onValueChange={handleDurationChange}
            disabled={isActive}
          >
            <SelectTrigger className="flex-1 h-10 sm:h-12 rounded-xl sm:rounded-2xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl sm:rounded-2xl">
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="25">25 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="45">45 minutes</SelectItem>
              <SelectItem value="60">60 minutes</SelectItem>
              <SelectItem value="90">90 minutes</SelectItem>
              <SelectItem value="120">120 minutes</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2 items-center">
            <Input
              type="number"
              placeholder="Custom"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
              disabled={isActive}
              className="w-20 h-10 sm:h-12 rounded-xl sm:rounded-2xl text-center"
              min="1"
              max="180"
            />
            <Button
              onClick={handleCustomDuration}
              disabled={isActive || !customMinutes}
              size="sm"
              variant="outline"
              className="h-10 sm:h-12 rounded-xl sm:rounded-2xl px-3"
            >
              Set
            </Button>
          </div>
        </div>

        <p className={`text-xs mt-2 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Monitoring will run until the timer ends.
        </p>
      </div>

      <div className="flex gap-3">
        {!isActive ? (
          <Button
            onClick={handleStart}
            size="lg"
            className="flex-1 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-r from-mint to-sky hover:scale-[1.02] transition-transform shadow-lg shadow-mint/20 text-sm sm:text-base"
            disabled={timeRemaining === 0}
          >
            <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            {timeRemaining === duration ? 'Start Monitoring' : 'Resume'}
          </Button>
        ) : (
          <Button
            onClick={handlePause}
            size="lg"
            className="flex-1 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-r from-orange-400 to-red-500 hover:scale-[1.02] transition-transform shadow-lg shadow-orange-400/20 text-sm sm:text-base"
          >
            <Pause className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Pause
          </Button>
        )}

        <Button
          onClick={handleReset}
          size="lg"
          variant="outline"
          className="h-12 sm:h-14 rounded-xl sm:rounded-2xl text-sm sm:text-base"
        >
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </div>

      <TaskAlertPopup
        isOpen={showTaskAlert}
        onClose={() => setShowTaskAlert(false)}
        onEnableTasks={handleEnableTasks}
        onCreateTask={handleCreateTask}
      />
    </div>
  );
};

const Index = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);

  const [newTask, setNewTask] = useState("");

  const handleToggleTask = (id: number, enabled: boolean) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, enabled } : task));
  };

  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const colors = ["mint", "indigo", "peach", "sky", "lavender"] as const;
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    setTasks([
      ...tasks,
      {
        id: Date.now(),
        title: newTask,
        tag: "NEW TASK",
        color: randomColor,
        enabled: true,
      },
    ]);
    setNewTask("");
  };

  const handleAccountClick = () => {
    console.log("Account clicked");
    // TODO: Implement account functionality
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border">
        <div className="w-full max-w-[1440px] mx-auto px-2 sm:px-4 lg:px-6 h-12 sm:h-14 lg:h-16 flex items-center justify-between">
          {/* Left: Logo */}
          {/* <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <img
                src={theme === 'dark' ? "./flowstate_transparent_dark_resized.png" : "./flowstate_transparent_light_resized.png"}
                alt="FlowState"
                className="w-6 h-6 sm:w-8 sm:h-8 transition-all duration-300"
              />
              <h1 className="text-base sm:text-lg font-semibold hidden sm:block">FlowState</h1>
            </div>
          </div> */}

          {/* Center: Date & Greeting - hidden on small screens */}
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground hidden md:inline">{currentDate}</span>
            <span className="text-muted-foreground md:hidden">{currentDate.split(",")[1]}</span>
            <span className="text-foreground font-medium ml-2 hidden lg:inline">• Good day!</span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="outline" size="sm" className="rounded-xl text-xs sm:text-sm px-2 sm:px-4 hidden sm:inline-flex">
              Start Focus
            </Button>
            <button className="p-1.5 sm:p-2 hover:bg-secondary rounded-lg sm:rounded-xl transition-colors">
              <Search className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
            </button>
            <UserDropdown
              onAccountClick={handleAccountClick}
              onSettingsClick={handleSettingsClick}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {/* Left Column: Tasks Timeline */}
          <div className="sm:col-span-2 lg:col-span-2 order-2 sm:order-1">
            <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-soft p-3 sm:p-4 lg:p-6" data-tasks-section>
              {/* Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold">Tasks</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {currentDate.split(",")[1]}
                  </p>
                </div>
                <button className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-sky flex items-center justify-center hover:scale-105 transition-transform">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>
              </div>

              {/* Add Task Input */}
              <form onSubmit={handleAddTask} className="mb-4 sm:mb-6">
                <div className="relative">
                  <Input
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add task..."
                    className="rounded-xl sm:rounded-2xl border-muted bg-secondary/50 h-10 sm:h-12 pl-3 sm:pl-4 pr-10 sm:pr-12 text-sm focus:bg-white transition-colors"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-primary flex items-center justify-center hover:scale-105 transition-transform"
                  >
                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  </button>
                </div>
              </form>

              {/* Tasks Grid - showing time-based layout */}
              <div className="space-y-1.5 sm:space-y-2 lg:space-y-3 max-h-[300px] sm:max-h-[400px] lg:max-h-[500px] overflow-y-auto pr-1 sm:pr-2">
                {tasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                      <Plus className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">No tasks yet</h3>
                    <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                      Add your first task to start tracking your productivity
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Use the input field above to create a new task
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Current tasks */}
                    <div className="text-xs font-medium text-muted-foreground mb-2 ml-1">Current Tasks</div>
                    {tasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        title={task.title}
                        tag={task.tag}
                        tagColor={task.color}
                        enabled={task.enabled}
                        onToggle={(enabled) => handleToggleTask(task.id, enabled)}
                        onDelete={() => handleDeleteTask(task.id)}
                      />
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Focus Timer */}
          <div className="order-1 sm:order-2">
            <FocusTimer
              tasks={tasks}
            />
          </div>
        </div>
      </main>

    {/* Monitoring Status Overlay */}
    <MonitoringStatus />
    </div>
  );
};

export default Index;
