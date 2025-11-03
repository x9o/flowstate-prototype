import { useState, useEffect } from "react";
import { Plus, Search, Play, Target, Lightbulb, ArrowRight, Square } from "lucide-react";
import { useTheme } from '@/contexts/ThemeContext';
import { useMonitoring } from '@/contexts/MonitoringContext';
import { useLists } from '@/contexts/ListsContext';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserDropdown } from "@/components/Dropdown";
import { MonitoringStatus } from "@/components/MonitoringStatus";
import { Sidebar } from "@/components/Sidebar";

const Index = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [currentGoal, setCurrentGoal] = useState("");
  const { startMonitoring, stopMonitoring, monitoringState } = useMonitoring();
  const { whitelist, blocklist } = useLists();
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Listen for monitoring state changes
  useEffect(() => {
    setIsMonitoring(monitoringState?.isActive || false);
  }, [monitoringState]);

  const handleToggleTask = (id: number, enabled: boolean) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, enabled } : task));
  };

  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleStartFocus = async () => {
    if (!currentGoal.trim()) return;

    // Add current goal as a task
    const colors = ["mint", "indigo", "peach", "sky", "lavender"] as const;
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newTask = {
      id: Date.now(),
      title: currentGoal,
      tag: "CURRENT",
      color: randomColor,
      enabled: true,
    };

    setTasks([newTask, ...tasks]);

    // Start monitoring with this goal
    try {
      await startMonitoring([currentGoal], 25, whitelist, blocklist); // Default 25 minutes
      setIsMonitoring(true);
      setCurrentGoal("");
    } catch (error) {
      console.error('Failed to start monitoring:', error);
    }
  };

  const handleStopMonitoring = async () => {
    try {
      await stopMonitoring();
      setIsMonitoring(false);
    } catch (error) {
      console.error('Failed to stop monitoring:', error);
    }
  };

  const handleQuickStartTask = async (taskTitle: string) => {
    try {
      await startMonitoring([taskTitle], 25, whitelist, blocklist);
      setIsMonitoring(true);
    } catch (error) {
      console.error('Failed to start monitoring:', error);
    }
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
    const mainInput = document.querySelector('input[placeholder="Finish physics homework chapter 5"]') as HTMLInputElement;
    mainInput?.focus();
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar onStartSession={handleStartSession} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className={`h-16 border-b flex items-center justify-between px-6 ${
          theme === 'dark' ? 'bg-card border-border' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <img
              src={theme === 'dark' ? "./flowstate_transparent_dark_resized.png" : "./flowstate_transparent_light_resized.png"}
              alt="FlowState"
              className="w-8 h-8 transition-all duration-300"
            />
            <h1 className="text-lg font-semibold">FlowState</h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-secondary rounded-xl transition-colors">
              <Search className="w-5 h-5 text-muted-foreground" />
            </button>
            <UserDropdown
              onAccountClick={handleAccountClick}
              onSettingsClick={handleSettingsClick}
            />
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Main Focus Input */}
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Target className="w-8 h-8 text-mint" />
                <h2 className="text-3xl font-bold">What are you working on?</h2>
              </div>

              <div className="relative">
                <Input
                  value={currentGoal}
                  onChange={(e) => setCurrentGoal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleStartFocus();
                    }
                  }}
                  placeholder="Finish physics homework chapter 5"
                  className={`w-full h-16 px-6 text-lg rounded-2xl border-2 transition-all ${
                    theme === 'dark'
                      ? 'bg-card border-border focus:border-mint'
                      : 'bg-white border-gray-300 focus:border-mint'
                  }`}
                />
              </div>

              {!isMonitoring ? (
                <Button
                  onClick={handleStartFocus}
                  disabled={!currentGoal.trim()}
                  size="lg"
                  className="h-14 px-8 rounded-2xl bg-gradient-to-r from-mint to-sky hover:scale-[1.02] transition-transform shadow-lg shadow-mint/20 text-base font-semibold"
                >
                  Start Focusing
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleStopMonitoring}
                  size="lg"
                  className="h-14 px-8 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:scale-[1.02] transition-transform shadow-lg shadow-red-500/30 text-base font-semibold text-white"
                >
                  Stop Monitoring
                  <Square className="w-5 h-5 ml-2" />
                </Button>
              )}
            </div>

            {/* Divider */}
            <div className={`h-px ${theme === 'dark' ? 'bg-border' : 'bg-gray-200'}`} />

            {/* Recent Tasks */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Recent Tasks</h3>
              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <div className={`p-8 rounded-2xl text-center ${
                    theme === 'dark' ? 'bg-card' : 'bg-gray-50'
                  }`}>
                    <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                      <Plus className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">
                      No recent tasks. Start by adding your first task above.
                    </p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:shadow-md ${
                        theme === 'dark'
                          ? 'bg-card border-border hover:border-mint/50'
                          : 'bg-white border-gray-200 hover:border-mint/50'
                      }`}
                    >
                      <div className="flex-1">
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {task.enabled ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleQuickStartTask(task.title)}
                        size="sm"
                        variant="outline"
                        className="rounded-xl"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Divider */}
            <div className={`h-px ${theme === 'dark' ? 'bg-border' : 'bg-gray-200'}`} />

            {/* Tips Section */}
            <div className={`p-6 rounded-2xl ${
              theme === 'dark' ? 'bg-card border border-border' : 'bg-gradient-to-br from-mint/10 to-sky/10'
            }`}>
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-6 h-6 text-mint" />
                <h3 className="text-lg font-semibold">Tips</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-mint mt-1">•</span>
                  <span>Work until your task is done</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-mint mt-1">•</span>
                  <span>Take breaks when you need them</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-mint mt-1">•</span>
                  <span>Enable Pomodoro for structured sessions</span>
                </li>
              </ul>
            </div>
          </div>
        </main>
      </div>

      {/* Monitoring Status Overlay */}
      <MonitoringStatus />
    </div>
  );
};

export default Index;
