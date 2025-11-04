import { useState, useEffect } from "react";
import { Plus, Search, Play, Target, Lightbulb, ArrowRight, Square, Flame, Clock, Shield } from "lucide-react";
import { useTheme } from '@/contexts/ThemeContext';
import { useMonitoring } from '@/contexts/MonitoringContext';
import { useLists } from '@/contexts/ListsContext';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserDropdown } from "@/components/Dropdown";
import { MonitoringStatus } from "@/components/MonitoringStatus";
import { Sidebar } from "@/components/Sidebar";
import { quotes } from '@/data/quotes';

// Time-based greetings
const getGreeting = () => {
  const hour = new Date().getHours();
  const emojis = {
    morning: ["🌅", "🌄", "☀️"],
    afternoon: ["🌤️", "☀️", "🌞"],
    evening: ["🌆", "🌇", "🌙"],
    night: ["🌙", "🌜", "⭐"]
  };

  let greeting, emojiSet;
  if (hour >= 5 && hour < 12) {
    greeting = "Good morning";
    emojiSet = emojis.morning;
  } else if (hour >= 12 && hour < 17) {
    greeting = "Good afternoon";
    emojiSet = emojis.afternoon;
  } else if (hour >= 17 && hour < 21) {
    greeting = "Good evening";
    emojiSet = emojis.evening;
  } else {
    greeting = "Good night";
    emojiSet = emojis.night;
  }

  const randomEmoji = emojiSet[Math.floor(Math.random() * emojiSet.length)];
  return `${greeting}, Sunny! ${randomEmoji}`;
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
  "Organize digital files and documents"
];

const Index = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [currentGoal, setCurrentGoal] = useState("");
  const { startMonitoring, stopMonitoring, monitoringState } = useMonitoring();
  const { whitelist, blocklist } = useLists();
  const [isMonitoring, setIsMonitoring] = useState(false);

  // State for dynamic content
  const [greeting, setGreeting] = useState("");
  const [currentQuote, setCurrentQuote] = useState(quotes[Math.floor(Math.random() * quotes.length)]);
  const [currentTip, setCurrentTip] = useState(tips[0]);
  const [quoteIndex, setQuoteIndex] = useState(Math.floor(Math.random() * quotes.length));
  const [tipIndex, setTipIndex] = useState(0);

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

  // Update greeting every minute
  useEffect(() => {
    const updateGreeting = () => setGreeting(getGreeting());
    updateGreeting(); // Initial call
    const interval = setInterval(updateGreeting, 60000); // Update every minute
    return () => clearInterval(interval);
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
      console.log('🚀 Starting monitoring with lists:', {
        whitelist: whitelist,
        blocklist: blocklist,
        whitelistCount: whitelist.length,
        blocklistCount: blocklist.length
      });
      await startMonitoring([currentGoal], 25, whitelist, blocklist);
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
    const mainInput = document.querySelector('input[placeholder*="working on"]') as HTMLInputElement;
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
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8">
            {/* Greeting and Quote Section */}
            <div className="text-center space-y-4 mb-8">
              <h1 className="text-3xl font-bold transition-all duration-500 ease-in-out">
                {greeting}
              </h1>
              <div className="transition-all duration-500 ease-in-out opacity-90">
                <p className="text-lg italic text-muted-foreground">
                  "{currentQuote.text}" — {currentQuote.author}
                </p>
              </div>
            </div>

            {/* Stats Bar */}
            <div className={`rounded-2xl p-6 mb-8 ${
              theme === 'dark'
                ? 'bg-card border border-border'
                : 'bg-white border border-gray-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-center gap-10 text-base">
                <div className="flex items-center gap-3">
                  <Flame className="w-6 h-6 text-orange-500" />
                  <span className="font-semibold text-lg">{stats.streak} day streak</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-blue-500" />
                  <span className="font-semibold text-lg">{stats.totalTime}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-green-500" />
                  <span className="font-semibold text-lg">{stats.blocksToday} blocks today</span>
                </div>
              </div>
            </div>

            {/* Main Focus Section */}
            <div className={`rounded-2xl p-8 mb-8 ${
              theme === 'dark'
                ? 'bg-card border border-border'
                : 'bg-white border border-gray-200 shadow-sm'
            }`}>
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center gap-2">
                  <Target className="w-6 h-6 text-mint" />
                  <h2 className="text-2xl font-semibold">What are you working on?</h2>
                </div>

                <div className="relative max-w-2xl mx-auto">
                  <Input
                    value={currentGoal}
                    onChange={(e) => setCurrentGoal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleStartFocus();
                      }
                    }}
                    placeholder={placeholderText || "What are you working on?"}
                    className={`w-full h-14 px-6 text-lg rounded-xl border-2 transition-all ${
                      theme === 'dark'
                        ? 'bg-muted border-border focus:border-mint'
                        : 'bg-gray-50 border-gray-300 focus:border-mint'
                    }`}
                  />
                </div>

                <div className="flex justify-center">
                  {!isMonitoring ? (
                    <Button
                      onClick={handleStartFocus}
                      disabled={!currentGoal.trim()}
                      size="lg"
                      className="h-12 px-8 rounded-xl bg-gradient-to-r from-mint to-sky hover:scale-[1.02] transition-transform shadow-lg shadow-mint/20 text-base font-semibold"
                    >
                      Start Focusing
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleStopMonitoring}
                      size="lg"
                      className="h-12 px-8 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:scale-[1.02] transition-transform shadow-lg shadow-red-500/30 text-base font-semibold text-white"
                    >
                      Stop Monitoring
                      <Square className="w-5 h-5 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Tasks and Tips Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Tasks */}
              <div className="lg:col-span-2">
                <div className={`rounded-2xl p-6 ${
                  theme === 'dark'
                    ? 'bg-card border border-border'
                    : 'bg-white border border-gray-200 shadow-sm'
                }`}>
                  <h3 className="text-xl font-semibold mb-4">📋 Recent Tasks</h3>
                  <div className="space-y-3">
                    {tasks.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          No recent tasks. Start by adding your first task above.
                        </p>
                      </div>
                    ) : (
                      tasks.slice(0, 5).map((task) => (
                        <div
                          key={task.id}
                          className={`flex items-center justify-between p-3 rounded-lg transition-all hover:shadow-sm ${
                            theme === 'dark'
                              ? 'bg-muted/50 hover:bg-muted'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex-1">
                            <p className="font-medium">{task.title}</p>
                          </div>
                          <Button
                            onClick={() => handleQuickStartTask(task.title)}
                            size="sm"
                            variant="ghost"
                            className="rounded-lg h-8 w-8 p-0"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Tip */}
              <div className={`rounded-2xl p-6 ${
                theme === 'dark'
                  ? 'bg-card border border-border'
                  : 'bg-gradient-to-br from-mint/10 to-sky/10 border border-mint/20'
              }`}>
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-mint" />
                  <h3 className="text-lg font-semibold">💡 Quick Tip</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed transition-all duration-500 ease-in-out">
                  {currentTip}
                </p>
              </div>
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