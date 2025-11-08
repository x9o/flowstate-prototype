import { useState, useEffect } from "react";
import { Plus, Search, Play, Target, Lightbulb, ArrowRight, Square, Flame, Clock, Shield, FileText, TrendingUp, CheckCircle, Menu, ArrowUp, Shuffle, History, BarChart3, Settings as SettingsIcon, Sparkles, List, Sun, Moon } from "lucide-react";
import { useTheme } from '@/contexts/ThemeContext';
import { useMonitoring } from '@/contexts/MonitoringContext';
import { useLists } from '@/contexts/ListsContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { useRecentTasks } from '@/contexts/RecentTasksContext';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
import { UserDropdown } from "@/components/Dropdown";
import { MonitoringStatus } from "@/components/MonitoringStatus";
import { Sidebar } from "@/components/Sidebar";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { TaskValidationDialog } from "@/components/TaskValidationDialog";
import { taskValidationService } from "@/services/TaskValidationService";
import { quotes } from '@/data/quotes';
import { StrictnessSelector, StrictnessTrigger } from "@/components/StrictnessSelector";
import { RecentTasksModal } from "@/components/RecentTasksModal";
import { SessionStatsModal } from "@/components/SessionStatsModal";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { SuggestedTasks } from "@/components/SuggestedTasks";

// Dashboard Components
import { ActiveSessionHeader, LargeTimerDisplay, SessionActionButton, GoalProgressTracker, RecentlyBlockedList, StayFocusedSection } from "@/components/dashboard";

// Time-based greetings and icons
const getGreetingData = () => {
  const hour = new Date().getHours();

  let greeting;
  let icon: 'sun' | 'moon';

  if (hour >= 5 && hour < 12) {
    greeting = "Good morning";
    icon = 'sun';
  } else if (hour >= 12 && hour < 17) {
    greeting = "Good afternoon";
    icon = 'sun';
  } else if (hour >= 17 && hour < 21) {
    greeting = "Good evening";
    icon = 'sun';
  } else {
    greeting = "Good night";
    icon = 'moon';
  }

  return { text: `${greeting}, Sunny!`, icon };
};

// Random prompts for what the user is working on
const workPrompts = [
  "What are you working on?",
  "What would you like to do today?",
  "What's your focus for today?",
  "What task are you tackling?",
  "What are you building today?",
  "What's on your mind?",
  "What do you want to accomplish?",
  "Ready to get focused?",
  "What's your goal today?",
  "What are you creating?",
  "What challenge are you solving?",
  "What's your mission today?"
];

const getRandomPrompt = () => {
  return workPrompts[Math.floor(Math.random() * workPrompts.length)];
};


// Tips
const tips = [
  "Work until your task is done, then take a well-deserved break.",
  "Focus on one thing at a time for maximum productivity.",
  "Take a 5-minute break every 25 minutes to stay fresh.",
  "Eliminate distractions before you start working.",
  "Set clear goals for each focus session.",
  "Track your progress to stay motivated.",
  "Celebrate small wins along the way.",
  "Stay hydrated and take care of yourself."
];

// Placeholder templates
const placeholderTemplates = [
  "Finish physics homework chapter 5",
  "Complete Q3 sales presentation",
  "Write project proposal for client",
  "Study for chemistry midterm exam",
  "Debug authentication flow",
  "Design new landing page mockups",
  "Review pull requests from team",
  "Prepare meeting agenda for tomorrow",
  "Update portfolio website",
  "Research market competitors analysis",
  "Write blog post on productivity",
  "Fix critical bug in production",
  "Plan content calendar for next month",
  "Learn new framework tutorial",
  "Organize digital files and documents",
  "Design new website layout",
  "Review codebase for bug fixes",
  "Prepare slides for upcoming presentation",
  "Conduct user testing for new features",
  "Analyze data for monthly report",
  "Optimize server performance",
  "Implement new feature for mobile app",
  "Review pull requests from team",
];

const Index = () => {
  console.log('🏠 Index component loaded - task validation should be working');
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();
  const [tasks, setTasks] = useState([]);
  const [currentGoal, setCurrentGoal] = useState("");
  const { startMonitoring, stopMonitoring, pauseMonitoring, resumeMonitoring, monitoringState, isPaused, recentBlockedApps, strictnessLevel, setStrictnessLevel } = useMonitoring();
  const { whitelist, blocklist } = useLists();
  const { addRecentTask } = useRecentTasks();
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Debug: Log lists on every render to see what data we have
  console.log('📋 Current lists state:', {
    whitelistLength: whitelist.length,
    blocklistLength: blocklist.length,
    whitelistItems: whitelist.map(item => ({ name: item.name, pattern: item.pattern })),
    blocklistItems: blocklist.map(item => ({ name: item.name, pattern: item.pattern }))
  });

  // Task validation state
  const [isValidatingTask, setIsValidatingTask] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [originalTask, setOriginalTask] = useState("");
  const [validationType, setValidationType] = useState<'client' | 'ai'>('ai');

  // Session stats modal state
  const [showSessionStats, setShowSessionStats] = useState(false);
  const [sessionStatsData, setSessionStatsData] = useState(null);

  // State for dynamic content
  const [greeting, setGreeting] = useState("");
  const [greetingIcon, setGreetingIcon] = useState<'sun' | 'moon'>('sun');
  const [prompt, setPrompt] = useState("");
  const [currentQuote, setCurrentQuote] = useState(quotes[Math.floor(Math.random() * quotes.length)]);
  const [currentTip, setCurrentTip] = useState(tips[0]);
  const [quoteIndex, setQuoteIndex] = useState(Math.floor(Math.random() * quotes.length));
  const [tipIndex, setTipIndex] = useState(0);
  const [isStrictnessSelectorOpen, setIsStrictnessSelectorOpen] = useState(false);
  const [isRecentTasksModalOpen, setIsRecentTasksModalOpen] = useState(false);

  // Typing animation state
  const [placeholderText, setPlaceholderText] = useState("");
  const [templateIndex, setTemplateIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [charIndex, setCharIndex] = useState(0);

  // Dummy stats data
  const stats = {
    streak: 5,
    totalTime: "2h 15m",
    blocksToday: 12
  };

  // Listen for monitoring state changes
  useEffect(() => {
    setIsMonitoring(monitoringState?.isActive || false);
  }, [monitoringState]);

  // Set greeting and random prompt on mount
  useEffect(() => {
    const greetingData = getGreetingData();
    setGreeting(greetingData.text);
    setGreetingIcon(greetingData.icon);
    setPrompt(getRandomPrompt());
  }, []);

  // Rotate quotes every 15 seconds with transition
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 15000); // Change every 15 seconds

    return () => clearInterval(interval);
  }, []);

  // Update current quote with transition
  useEffect(() => {
    setCurrentQuote(quotes[quoteIndex]);
  }, [quoteIndex]);

  // Rotate tips every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Update current tip
  useEffect(() => {
    setCurrentTip(tips[tipIndex]);
  }, [tipIndex]);

  // Typing animation for placeholder
  useEffect(() => {
    const currentTemplate = placeholderTemplates[templateIndex];

    const typingSpeed = isTyping ? 50 : 30; // Typing speed vs backspace speed

    if (isTyping) {
      if (charIndex < currentTemplate.length) {
        const timeout = setTimeout(() => {
          setPlaceholderText(currentTemplate.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        }, typingSpeed);
        return () => clearTimeout(timeout);
      } else {
        // Finished typing, wait 3 seconds then start backspacing
        const timeout = setTimeout(() => {
          setIsTyping(false);
        }, 3000);
        return () => clearTimeout(timeout);
      }
    } else {
      if (charIndex > 0) {
        const timeout = setTimeout(() => {
          setPlaceholderText(currentTemplate.slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        }, typingSpeed);
        return () => clearTimeout(timeout);
      } else {
        // Finished backspacing, move to next template
        const timeout = setTimeout(() => {
          setTemplateIndex((prev) => (prev + 1) % placeholderTemplates.length);
          setIsTyping(true);
        }, 500); // Brief pause before next template
        return () => clearTimeout(timeout);
      }
    }
  }, [charIndex, isTyping, templateIndex]);

  const handleToggleTask = (id: number, enabled: boolean) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, enabled } : task));
  };

  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleStartFocus = async () => {
    console.log('🚀 handleStartFocus called! currentGoal:', currentGoal);
    if (!currentGoal.trim()) return;

    const trimmedTask = currentGoal.trim();
    console.log('🔍 Starting task validation for:', trimmedTask);

    // Client-side validation: minimum 3 characters
    if (trimmedTask.length < 3) {
      console.log('❌ Client validation failed: task too short');
      setOriginalTask(trimmedTask);
      setValidationType('client');
      setShowValidationDialog(true);
      return;
    }

    console.log('✅ Client validation passed, starting AI validation...');
    setIsValidatingTask(true);

    try {
      // Validate the task using AI
      const validation = await taskValidationService.validateTask(trimmedTask);
      console.log('🤖 AI validation result:', validation);

      if (validation.isValid) {
        // Task is valid, proceed with monitoring
        console.log('✅ Task validation PASSED, proceeding with monitoring for:', trimmedTask);
        proceedWithMonitoring(trimmedTask);
      } else {
        // Task is invalid, show validation dialog
        console.log('❌ Task validation FAILED, showing dialog for:', trimmedTask);
        setOriginalTask(trimmedTask);
        setValidationType('ai');
        setShowValidationDialog(true);
      }
    } catch (error) {
      console.error('❌ ERROR in task validation:', error);
      console.log('⚠️ FALLBACK: Proceeding with monitoring due to validation error');
      // If validation fails, proceed anyway (fallback)
      proceedWithMonitoring(trimmedTask);
    } finally {
      setIsValidatingTask(false);
    }
  };

  const proceedWithMonitoring = (task: string) => {
    // Add current goal as a task
    const colors = ["mint", "indigo", "peach", "sky", "lavender"] as const;
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newTask = {
      id: Date.now(),
      title: task,
      tag: "CURRENT",
      color: randomColor,
      enabled: true,
    };

    setTasks([newTask, ...tasks]);

    // Add task to recent tasks
    addRecentTask({
      title: task,
      color: randomColor,
      category: 'General',
      tags: []
    });

    // Start monitoring with this goal
    startMonitoringForTask(task);
  };

  const startMonitoringForTask = async (task: string) => {
    try {
      console.log('🚀 Starting monitoring with validated task:', task);
      console.log('🚀 Monitoring lists:', {
        whitelist: whitelist,
        blocklist: blocklist,
        whitelistCount: whitelist.length,
        blocklistCount: blocklist.length
      });
      console.log('📋 Whitelist items being passed:', whitelist.map(item => ({ name: item.name, pattern: item.pattern })));
      console.log('🚫 Blocklist items being passed:', blocklist.map(item => ({ name: item.name, pattern: item.pattern })));

      await startMonitoring([task], 25, whitelist, blocklist);
      setIsMonitoring(true);
      setCurrentGoal("");
    } catch (error) {
      console.error('Failed to start monitoring:', error);
    }
  };

  const handleTaskRetry = (newTask: string) => {
    setShowValidationDialog(false);
    setCurrentGoal(newTask);
    setOriginalTask("");

    // Auto-trigger validation for the new task
    setTimeout(() => {
      handleStartFocus();
    }, 100);
  };

  const handleValidationCancel = () => {
    setShowValidationDialog(false);
    setOriginalTask("");
    setValidationType('ai'); // Reset to default
  };

  const handleStopMonitoring = async () => {
    try {
      await stopMonitoring();
      setIsMonitoring(false);
      setCurrentGoal(""); // Clear the goal when stopping
    } catch (error) {
      console.error('Failed to stop monitoring:', error);
    }
  };

  const handlePauseResume = async () => {
    try {
      if (isPaused) {
        await resumeMonitoring();
      } else {
        await pauseMonitoring();
      }
    } catch (error) {
      console.error('Failed to toggle pause state:', error);
    }
  };

  const handleFinishSession = async () => {
    try {
      // Prepare session stats data
      const sessionTime = monitoringState.sessionStats.sessionStartTime
        ? Math.round((Date.now() - monitoringState.sessionStats.sessionStartTime) / 1000)
        : 0;

      const statsData = {
        duration: sessionTime,
        blockedAttempts: monitoringState.sessionStats.blockedAttempts,
        totalChecks: monitoringState.sessionStats.totalChecks,
        goals: monitoringState.currentGoals,
        blockedApps: recentBlockedApps.map(app => ({
          appName: app.appName,
          windowTitle: app.windowTitle,
          count: 1 // For now, each blocked app appears once
        })),
        productiveApps: [] // This would need to be tracked in the monitoring context
      };

      setSessionStatsData(statsData);
      setShowSessionStats(true);

      await stopMonitoring();
      setIsMonitoring(false);
      setCurrentGoal("");
    } catch (error) {
      console.error('Failed to finish session:', error);
    }
  };

  const handleCloseSessionStats = () => {
    setShowSessionStats(false);
    setSessionStatsData(null);
  };

  const handleTaskComplete = async () => {
    // TODO: Implement task complete functionality
    console.log('Task complete functionality to be implemented');
  };

  // Calculate current session time
  const getCurrentSessionTime = () => {
    if (monitoringState.sessionStats.sessionStartTime) {
      return Date.now() - monitoringState.sessionStats.sessionStartTime;
    }
    return 0;
  };

  // Format time for display
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // State for live timer
  const [sessionTime, setSessionTime] = useState(0);

  // Update timer every second when monitoring is active
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isMonitoring && monitoringState.sessionStats.sessionStartTime) {
      interval = setInterval(() => {
        setSessionTime(Date.now() - monitoringState.sessionStats.sessionStartTime);
      }, 1000);
    } else {
      setSessionTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMonitoring, monitoringState.sessionStats.sessionStartTime]);

  const handleQuickStartTask = async (taskTitle: string) => {
    console.log('🔍 Quick start task validation for:', taskTitle);

    // Client-side validation: minimum 3 characters
    if (taskTitle.trim().length < 3) {
      console.log('❌ Quick start task validation failed: task too short');
      return;
    }

    setIsValidatingTask(true);

    try {
      // Validate the task using AI
      const validation = await taskValidationService.validateTask(taskTitle.trim());
      console.log('🤖 Quick start AI validation result:', validation);

      if (validation.isValid) {
        // Task is valid, proceed with monitoring
        console.log('✅ Quick start task validation PASSED, proceeding with monitoring for:', taskTitle);
        await startMonitoring([taskTitle], 25, whitelist, blocklist);
        setIsMonitoring(true);
      } else {
        // Task is invalid, show validation dialog
        console.log('❌ Quick start task validation FAILED, showing dialog for:', taskTitle);
        setOriginalTask(taskTitle);
        setValidationType('ai');
        setShowValidationDialog(true);
      }
    } catch (error) {
      console.error('❌ ERROR in quick start task validation:', error);
      console.log('⚠️ FALLBACK: Proceeding with monitoring due to validation error');
      // If validation fails, proceed anyway (fallback)
      await startMonitoring([taskTitle], 25, whitelist, blocklist);
      setIsMonitoring(true);
    } finally {
      setIsValidatingTask(false);
    }
  };

  const handleRecentTaskSelect = async (recentTask) => {
    console.log('📋 Recent task selected:', recentTask);

    // Set the current goal to the selected recent task
    setCurrentGoal(recentTask.title);

    // Auto-start monitoring with the recent task
    try {
      await handleQuickStartTask(recentTask.title);
    } catch (error) {
      console.error('❌ ERROR starting recent task monitoring:', error);
    }
  };

  const handleSuggestedTaskSelect = async (task: string) => {
    console.log('💡 Suggested task selected:', task);

    // Set the current goal to the selected suggested task
    setCurrentGoal(task);

    // Focus the input field to allow user to review/modify before starting
    const mainInput = document.querySelector('input[placeholder*="working on"]') as HTMLInputElement;
    mainInput?.focus();
  };

  const handleAccountClick = () => {
    console.log("Account clicked");
    // TODO: Implement account functionality
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleStartSession = () => {
    // Scroll to the main input
    const mainInput = document.querySelector('input[placeholder*="working on"]') as HTMLInputElement;
    mainInput?.focus();
  };

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Sidebar */}
      <Sidebar onStartSession={handleStartSession} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-6 z-10">
          {/* Menu Button - Top Left */}
          <button
            onClick={toggleSidebar}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-accent text-foreground'
                : 'hover:bg-gray-100 text-gray-900'
            }`}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Account Icon - Top Right */}
          <UserDropdown
            onAccountClick={handleAccountClick}
            onSettingsClick={handleSettingsClick}
          />
        </div>

        {/* Main Content - Dynamic based on monitoring state */}
        <main className="flex-1 flex items-center justify-center p-8 pb-12">
          <div className="w-full max-w-3xl">
            <div className="text-center space-y-8">
              {isMonitoring ? (
                // Monitoring State UI
                <div className="space-y-8">
                  {/* Session Timer Display */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3">
                      <Clock className="w-12 h-12 text-mint" />
                      <h1 className="text-6xl font-bold text-mint font-mono">
                        {formatTime(sessionTime)}
                      </h1>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-semibold text-foreground">
                        {monitoringState.currentGoals[0] || "Focus Session"}
                      </h2>
                      <p className="text-lg text-muted-foreground">
                        Stay focused! {isPaused ? '(Paused)' : 'Monitoring active'}
                      </p>
                    </div>
                  </div>

                  {/* Session Control Buttons */}
                  <div className="flex justify-center gap-4">
                    <SessionActionButton
                      type="pause"
                      onClick={handlePauseResume}
                      isPaused={isPaused}
                    />
                    <SessionActionButton
                      type="finish"
                      onClick={handleFinishSession}
                    />
                  </div>

                  {/* Session Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className={`p-4 rounded-xl ${
                      theme === 'dark' ? 'bg-card' : 'bg-gray-50'
                    }`}>
                      <div className="text-2xl font-bold text-mint">{monitoringState.sessionStats.blockedAttempts}</div>
                      <div className="text-sm text-muted-foreground">Blocked</div>
                    </div>
                    <div className={`p-4 rounded-xl ${
                      theme === 'dark' ? 'bg-card' : 'bg-gray-50'
                    }`}>
                      <div className="text-2xl font-bold text-mint">{monitoringState.sessionStats.totalChecks}</div>
                      <div className="text-sm text-muted-foreground">Checks</div>
                    </div>
                    <div className={`p-4 rounded-xl ${
                      theme === 'dark' ? 'bg-card' : 'bg-gray-50'
                    }`}>
                      <div className="text-2xl font-bold text-mint">{formatTime(sessionTime)}</div>
                      <div className="text-sm text-muted-foreground">Duration</div>
                    </div>
                  </div>

                  {/* Recent Blocked Apps */}
                  {recentBlockedApps.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-muted-foreground">Recently Blocked</h3>
                      <div className="space-y-2">
                        {recentBlockedApps.map((app, index) => (
                          <div
                            key={`${app.blockedAt}-${index}`}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              theme === 'dark' ? 'bg-card' : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Shield className="w-5 h-5 text-red-500" />
                              <div className="text-left">
                                <div className="font-medium">{app.windowTitle}</div>
                                <div className="text-sm text-muted-foreground">{app.appName}</div>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatTime(Date.now() - app.blockedAt)} ago
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Normal State UI
                <div className="space-y-8">
                  {/* Main Header - Greeting */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      {greetingIcon === 'sun' ? (
                        <Sun className="w-12 h-12 text-amber-500" />
                      ) : (
                        <Moon className="w-12 h-12 text-mint" />
                      )}
                      <h1 className="text-5xl font-bold transition-all duration-500 ease-in-out bg-gradient-to-r from-foreground to-mint bg-clip-text text-transparent">
                        {greeting}
                      </h1>
                    </div>
                    {/* Subheader - Prompt */}
                    <p className="text-xl text-muted-foreground">
                      {prompt}
                    </p>
                  </div>

                  {/* Input with icons inside */}
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none z-10">
                      <button
                        onClick={() => console.log('Plus button clicked!')}
                        className={`p-2 rounded-lg transition-colors pointer-events-auto z-10 ${
                          theme === 'dark'
                            ? 'hover:bg-accent text-muted-foreground hover:text-foreground'
                            : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                        }`}
                        style={{ cursor: 'pointer !important' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.cursor = 'pointer';
                          e.currentTarget.style.setProperty('cursor', 'pointer', 'important');
                        }}
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => console.log('Shuffle button clicked!')}
                        className={`p-2 rounded-lg transition-colors pointer-events-auto z-10 ${
                          theme === 'dark'
                            ? 'hover:bg-accent text-muted-foreground hover:text-foreground'
                            : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                        }`}
                        style={{ cursor: 'pointer !important' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.cursor = 'pointer';
                          e.currentTarget.style.setProperty('cursor', 'pointer', 'important');
                        }}
                      >
                        <Shuffle className="w-5 h-5" />
                      </button>
                      <StrictnessTrigger onClick={() => setIsStrictnessSelectorOpen(true)} />
                    </div>

                    <input
                      type="text"
                      value={currentGoal}
                      onChange={(e) => setCurrentGoal(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleStartFocus();
                        }
                      }}
                      placeholder={placeholderText || "What are you working on?"}
                      className={`w-full h-16 pl-40 pr-20 text-lg rounded-2xl border-2 transition-all relative z-0 ${
                        theme === 'dark'
                          ? 'bg-muted/50 border-border focus:border-mint backdrop-blur-sm'
                          : 'bg-white/80 border-gray-300 focus:border-mint backdrop-blur-sm'
                      }`}
                    />

                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {isValidatingTask ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <button
                          onClick={handleStartFocus}
                          disabled={!currentGoal.trim() || isValidatingTask}
                          className={`p-2 rounded-lg transition-all ${
                            currentGoal.trim() && !isValidatingTask
                              ? 'bg-gradient-to-r from-mint to-sky hover:scale-105 text-white shadow-md'
                              : theme === 'dark'
                                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <ArrowUp className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Placeholder Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                    <button
                      onClick={() => setIsRecentTasksModalOpen(true)}
                      className={`px-4 py-3 rounded-xl border-2 transition-all hover:scale-105 ${
                        theme === 'dark'
                          ? 'bg-card border-border hover:border-mint'
                          : 'bg-white border-gray-200 hover:border-mint'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <History className="w-5 h-5 text-mint" />
                        <span className="text-sm font-medium">Recent</span>
                      </div>
                    </button>

                    <button
                      onClick={() => navigate('/lists')}
                      className={`px-4 py-3 rounded-xl border-2 transition-all hover:scale-105 ${
                        theme === 'dark'
                          ? 'bg-card border-border hover:border-mint'
                          : 'bg-white border-gray-200 hover:border-mint'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <List className="w-5 h-5 text-mint" />
                        <span className="text-sm font-medium">Lists</span>
                      </div>
                    </button>

                    <button
                      onClick={() => console.log('Stats clicked')}
                      className={`px-4 py-3 rounded-xl border-2 transition-all hover:scale-105 ${
                        theme === 'dark'
                          ? 'bg-card border-border hover:border-mint'
                          : 'bg-white border-gray-200 hover:border-mint'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <BarChart3 className="w-5 h-5 text-mint" />
                        <span className="text-sm font-medium">Stats</span>
                      </div>
                    </button>

                    <button
                      onClick={() => console.log('Goals clicked')}
                      className={`px-4 py-3 rounded-xl border-2 transition-all hover:scale-105 ${
                        theme === 'dark'
                          ? 'bg-card border-border hover:border-mint'
                          : 'bg-white border-gray-200 hover:border-mint'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Target className="w-5 h-5 text-mint" />
                        <span className="text-sm font-medium">Goals</span>
                      </div>
                    </button>
                  </div>

                  {/* Suggested Tasks */}
                  <div className="mt-6">
                    <SuggestedTasks onTaskSelect={handleSuggestedTaskSelect} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Monitoring Status Overlay */}
      <MonitoringStatus />

      {/* Task Validation Dialog */}
      <TaskValidationDialog
        isOpen={showValidationDialog}
        originalTask={originalTask}
        validationType={validationType}
        onRetry={handleTaskRetry}
        onCancel={handleValidationCancel}
      />

      {/* Strictness Selector Dialog */}
      <StrictnessSelector
        currentLevel={strictnessLevel}
        onLevelChange={setStrictnessLevel}
        isOpen={isStrictnessSelectorOpen}
        onOpenChange={setIsStrictnessSelectorOpen}
      />

      {/* Recent Tasks Modal */}
      <RecentTasksModal
        isOpen={isRecentTasksModalOpen}
        onClose={() => setIsRecentTasksModalOpen(false)}
        onTaskSelect={handleRecentTaskSelect}
      />

      {/* Session Stats Modal */}
      {sessionStatsData && (
        <SessionStatsModal
          isOpen={showSessionStats}
          onClose={handleCloseSessionStats}
          sessionData={sessionStatsData}
        />
      )}
    </div>
  );
};

export default Index;