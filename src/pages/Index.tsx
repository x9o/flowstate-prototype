import { useState } from "react";
import { Plus, Search, User, Calendar, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskCard } from "@/components/TaskCard";
import { EfficiencyGauge } from "@/components/EfficiencyGauge";
import { WeeklyActivity } from "@/components/WeeklyActivity";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Index = () => {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Check the feedback", tag: "ABUNDO", color: "indigo" as const, enabled: true },
    { id: 2, title: "Discuss a new project with Jimmy", tag: "RIVO", color: "lavender" as const, enabled: true },
    { id: 3, title: "Team standup meeting", tag: "INTERIO", color: "peach" as const, enabled: true },
    { id: 4, title: "Meeting with team leaders and department heads", tag: "LOCAL TASK", color: "peach" as const, enabled: true },
    { id: 5, title: "Code review session", tag: "BRITTS", color: "sky" as const, enabled: true },
    { id: 6, title: "Update documentation", tag: "STREEZE", color: "mint" as const, enabled: true },
    { id: 7, title: "Discuss blockers in the project with Samantha", tag: "ABUNDO", color: "indigo" as const, enabled: true },
    { id: 8, title: "Conduct an interview", tag: "LOCAL TASK", color: "peach" as const, enabled: true },
  ]);

  const [newTask, setNewTask] = useState("");

  const weeklyData = [
    { month: "Jul", value: 85, color: "hsl(var(--sky))" },
    { month: "Aug", value: 75, color: "hsl(var(--peach) / 0.8)" },
    { month: "Sep", value: 90, color: "hsl(var(--lavender))" },
    { month: "Oct", value: 95, color: "hsl(var(--indigo))" },
    { month: "Nov", value: 70, color: "hsl(var(--sky) / 0.7)" },
    { month: "Dec", value: 88, color: "hsl(var(--mint))" },
  ];

  const handleToggleTask = (id: number, enabled: boolean) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, enabled } : task));
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

  const completedTasks = tasks.filter(t => t.enabled).length;
  const completionPercentage = Math.round((completedTasks / tasks.length) * 100);

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-[1440px] mx-auto px-8 h-16 flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-mint to-sky flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-semibold">FlowState</h1>
            </div>
          </div>

          {/* Center: Date & Greeting */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{currentDate}</span>
            <span className="text-foreground font-medium ml-2">• Good day!</span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="rounded-xl">
              Start Focus
            </Button>
            <button className="p-2 hover:bg-secondary rounded-xl transition-colors">
              <Search className="w-4 h-4 text-muted-foreground" />
            </button>
            <button className="w-9 h-9 rounded-full bg-gradient-to-br from-mint to-sky flex items-center justify-center hover:scale-105 transition-transform">
              <User className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Tasks Timeline (65%) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-soft p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold">Tasks</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {currentDate.split(",")[1]}
                  </p>
                </div>
                <button className="w-10 h-10 rounded-full bg-sky flex items-center justify-center hover:scale-105 transition-transform">
                  <Plus className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Add Task Input */}
              <form onSubmit={handleAddTask} className="mb-6">
                <div className="relative">
                  <Input
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add task..."
                    className="rounded-2xl border-muted bg-secondary/50 h-12 pl-4 pr-12 focus:bg-white transition-colors"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-primary flex items-center justify-center hover:scale-105 transition-transform"
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
              </form>

              {/* Tasks Grid - showing time-based layout */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {/* Morning tasks */}
                <div className="text-xs font-medium text-muted-foreground mb-2 ml-1">10 am</div>
                {tasks.slice(0, 3).map((task) => (
                  <TaskCard
                    key={task.id}
                    title={task.title}
                    tag={task.tag}
                    tagColor={task.color}
                    enabled={task.enabled}
                    onToggle={(enabled) => handleToggleTask(task.id, enabled)}
                  />
                ))}

                <div className="text-xs font-medium text-muted-foreground mb-2 ml-1 mt-6">11 am</div>
                {tasks.slice(3, 6).map((task) => (
                  <TaskCard
                    key={task.id}
                    title={task.title}
                    tag={task.tag}
                    tagColor={task.color}
                    enabled={task.enabled}
                    onToggle={(enabled) => handleToggleTask(task.id, enabled)}
                  />
                ))}

                <div className="text-xs font-medium text-muted-foreground mb-2 ml-1 mt-6">12 pm</div>
                {tasks.slice(6).map((task) => (
                  <TaskCard
                    key={task.id}
                    title={task.title}
                    tag={task.tag}
                    tagColor={task.color}
                    enabled={task.enabled}
                    onToggle={(enabled) => handleToggleTask(task.id, enabled)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Efficiency Dashboard (35%) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-soft p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-semibold">My Efficiency</h2>
                <button className="w-10 h-10 rounded-full bg-sky flex items-center justify-center hover:scale-105 transition-transform">
                  <Plus className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Efficiency Gauge */}
              <div className="mb-8">
                <EfficiencyGauge percentage={completionPercentage} />
              </div>

              {/* Weekly Activity */}
              <div className="mb-8">
                <WeeklyActivity data={weeklyData} />
              </div>

              {/* Date Range Selector */}
              <Select defaultValue="january">
                <SelectTrigger className="w-full h-12 rounded-2xl border-sky text-sky hover:bg-sky/5 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="january">for January</SelectItem>
                  <SelectItem value="february">for February</SelectItem>
                  <SelectItem value="march">for March</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>

              {/* Primary Action Button */}
              <Button
                size="lg"
                className="w-full mt-6 h-14 rounded-2xl bg-gradient-to-r from-mint to-sky hover:scale-[1.02] transition-transform shadow-lg shadow-mint/20"
              >
                Start Focus Session
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
