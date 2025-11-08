import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useTheme } from './ThemeContext';

export interface RecentTask {
  id: string;
  title: string;
  color: 'mint' | 'indigo' | 'peach' | 'sky' | 'lavender';
  lastUsed: number;
  usageCount: number;
  estimatedTime?: number; // in minutes
  category?: string;
  tags?: string[];
}

interface RecentTasksContextType {
  recentTasks: RecentTask[];
  addRecentTask: (task: Omit<RecentTask, 'id' | 'lastUsed' | 'usageCount'>) => void;
  removeRecentTask: (taskId: string) => void;
  clearRecentTasks: () => void;
  incrementUsageCount: (taskId: string) => void;
  updateEstimatedTime: (taskId: string, timeInMinutes: number) => void;
  getTaskById: (taskId: string) => RecentTask | undefined;
}

const RecentTasksContext = createContext<RecentTasksContextType | undefined>(undefined);

const MAX_RECENT_TASKS = 20;
const STORAGE_KEY = 'flowstate-recent-tasks';

export function RecentTasksProvider({ children }: { children: ReactNode }) {
  const [recentTasks, setRecentTasks] = useState<RecentTask[]>([]);
  const { theme } = useTheme();

  // Load recent tasks from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedTasks = JSON.parse(stored);
        // Sort by last used (most recent first)
        const sortedTasks = parsedTasks.sort((a: RecentTask, b: RecentTask) => b.lastUsed - a.lastUsed);
        setRecentTasks(sortedTasks);
        console.log('📋 Loaded recent tasks from localStorage:', sortedTasks.length, 'tasks');
      }
    } catch (error) {
      console.error('Error loading recent tasks:', error);
      setRecentTasks([]);
    }
  }, []);

  // Save recent tasks to localStorage whenever they change
  useEffect(() => {
    if (recentTasks.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(recentTasks));
        console.log('💾 Saved recent tasks to localStorage:', recentTasks.length, 'tasks');
      } catch (error) {
        console.error('Error saving recent tasks:', error);
      }
    }
  }, [recentTasks]);

  const addRecentTask = (task: Omit<RecentTask, 'id' | 'lastUsed' | 'usageCount'>) => {
    const now = Date.now();

    // Check if task already exists (case-insensitive comparison)
    const existingTaskIndex = recentTasks.findIndex(
      t => t.title.toLowerCase() === task.title.toLowerCase()
    );

    if (existingTaskIndex !== -1) {
      // Update existing task
      const updatedTasks = [...recentTasks];
      updatedTasks[existingTaskIndex] = {
        ...updatedTasks[existingTaskIndex],
        lastUsed: now,
        usageCount: updatedTasks[existingTaskIndex].usageCount + 1,
        // Update other properties if provided
        color: task.color || updatedTasks[existingTaskIndex].color,
        estimatedTime: task.estimatedTime || updatedTasks[existingTaskIndex].estimatedTime,
        category: task.category || updatedTasks[existingTaskIndex].category,
        tags: task.tags || updatedTasks[existingTaskIndex].tags
      };

      // Sort by last used and limit to max
      const sortedTasks = updatedTasks.sort((a, b) => b.lastUsed - a.lastUsed);
      const limitedTasks = sortedTasks.slice(0, MAX_RECENT_TASKS);

      setRecentTasks(limitedTasks);
      console.log('📝 Updated existing recent task:', task.title);
    } else {
      // Add new task
      const newTask: RecentTask = {
        ...task,
        id: `task-${now}-${Math.random().toString(36).substr(2, 9)}`,
        lastUsed: now,
        usageCount: 1
      };

      const updatedTasks = [newTask, ...recentTasks];
      const limitedTasks = updatedTasks.slice(0, MAX_RECENT_TASKS);

      setRecentTasks(limitedTasks);
      console.log('➕ Added new recent task:', task.title);
    }
  };

  const removeRecentTask = (taskId: string) => {
    setRecentTasks(prev => prev.filter(task => task.id !== taskId));
    console.log('🗑️ Removed recent task:', taskId);
  };

  const clearRecentTasks = () => {
    setRecentTasks([]);
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ Cleared all recent tasks');
  };

  const incrementUsageCount = (taskId: string) => {
    setRecentTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, usageCount: task.usageCount + 1, lastUsed: Date.now() }
        : task
    ).sort((a, b) => b.lastUsed - a.lastUsed));
  };

  const updateEstimatedTime = (taskId: string, timeInMinutes: number) => {
    setRecentTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, estimatedTime: timeInMinutes }
        : task
    ));
  };

  const getTaskById = (taskId: string): RecentTask | undefined => {
    return recentTasks.find(task => task.id === taskId);
  };

  return (
    <RecentTasksContext.Provider value={{
      recentTasks,
      addRecentTask,
      removeRecentTask,
      clearRecentTasks,
      incrementUsageCount,
      updateEstimatedTime,
      getTaskById
    }}>
      {children}
    </RecentTasksContext.Provider>
  );
}

export function useRecentTasks() {
  const context = useContext(RecentTasksContext);
  if (context === undefined) {
    throw new Error('useRecentTasks must be used within a RecentTasksProvider');
  }
  return context;
}

// Helper function to format time
export function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// Helper function to format estimated time
export function formatEstimatedTime(minutes?: number): string {
  if (!minutes) return '';
  if (minutes < 60) return `~${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `~${hours}h`;
  return `~${hours}h ${remainingMinutes}m`;
}