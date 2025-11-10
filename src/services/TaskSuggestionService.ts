import { GoogleGenerativeAI } from '@google/generative-ai';
import type { RecentTask } from '../types';

// Configure Gemini - same API key as monitoring service
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('VITE_GEMINI_API_KEY environment variable is required');
}
const ai = new GoogleGenerativeAI(GEMINI_API_KEY);

// Cache for suggested tasks
interface SuggestionCache {
  suggestions: string[];
  timestamp: number;
  tasksChecksum: string;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_KEY_PREFIX = 'suggested-tasks-';

// Random loading messages for better UX
export const LOADING_MESSAGES = [
  'Suggesting tasks for you...',
  'Finding your next productive task...',
  'Analyzing your work patterns...',
  'Discovering focus opportunities...',
  'Generating personalized suggestions...',
  'Crafting your productivity plan...',
  'Mapping out your workflow...',
  'Designing your focus session...'
];

// Simple string hash function for checksum
function createChecksum(tasks: RecentTask[]): string {
  // Handle undefined or null tasks
  if (!tasks || !Array.isArray(tasks)) {
    return 'no-tasks';
  }

  const sortedTexts = tasks
    .map(t => t.title?.toLowerCase().trim() || '') // Use title instead of text, handle undefined
    .filter(t => t.length > 0)
    .sort();

  if (sortedTexts.length === 0) {
    return 'empty-tasks';
  }

  return sortedTexts.join('::');
}

// Get cached suggestions
function getCachedSuggestions(tasksChecksum: string): string[] | null {
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${tasksChecksum}`;
    const cached = localStorage.getItem(cacheKey);

    if (!cached) return null;

    const cache: SuggestionCache = JSON.parse(cached);

    // Check if cache is still valid
    if (Date.now() - cache.timestamp > CACHE_DURATION) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    // Verify the tasks checksum matches
    if (cache.tasksChecksum !== tasksChecksum) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return cache.suggestions;
  } catch (error) {
    console.warn('Error reading cached suggestions:', error);
    return null;
  }
}

// Cache suggestions
function cacheSuggestions(tasksChecksum: string, suggestions: string[]): void {
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${tasksChecksum}`;
    const cache: SuggestionCache = {
      suggestions,
      timestamp: Date.now(),
      tasksChecksum
    };

    localStorage.setItem(cacheKey, JSON.stringify(cache));
  } catch (error) {
    console.warn('Error caching suggestions:', error);
  }
}

// Generate AI suggestions based on recent tasks
async function generateAISuggestions(recentTasks: RecentTask[]): Promise<string[]> {
  console.log('🔍 generateAISuggestions called with:', recentTasks);

  if (!recentTasks || recentTasks.length === 0) {
    console.log('❌ No recent tasks available for AI suggestions');
    return [];
  }

  const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

  // Analyze recent task patterns - use 'title' property
  const taskPatterns = recentTasks.map(task => task.title || 'Unknown task').join('\n');
  console.log('📝 Task patterns for AI:', taskPatterns);

  const prompt = `You are an intelligent task suggestion assistant. Based on the user's recent task history, suggest up to 3 diverse and actionable tasks they might want to work on next.

Recent tasks:
${taskPatterns}

Guidelines:
- Analyze patterns in the user's recent work (categories, frequency, complexity)
- Provide diverse suggestions across different types of productive work
- Keep suggestions specific and actionable
- Avoid generic suggestions like "check email"
- Consider the user's work patterns and preferences
- Each suggestion should be concise (3-8 words)
- Return exactly 3 suggestions or fewer if not enough data

Format: Return only the suggestions, one per line, with no numbering or bullets.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    if (!text) return [];

    // Parse suggestions and filter out empty lines
    const suggestions = text
      .split('\n')
      .map(line => line.trim().replace(/^[-•*]\s*/, '')) // Remove bullet points
      .filter(line => line.length > 0 && line.length <= 100) // Reasonable length
      .slice(0, 3); // Max 3 suggestions

    return suggestions;
  } catch (error) {
    console.warn('Error generating AI suggestions:', error);
    return [];
  }
}

export class TaskSuggestionService {
  /**
   * Get suggested tasks based on recent tasks
   * Uses caching to avoid unnecessary AI calls
   */
  static async getSuggestedTasks(recentTasks?: RecentTask[]): Promise<{
    suggestions: string[];
    fromCache: boolean;
  }> {
    // Handle undefined recentTasks
    if (!recentTasks || !Array.isArray(recentTasks)) {
      return {
        suggestions: [],
        fromCache: false
      };
    }

    // Calculate checksum of recent tasks
    const tasksChecksum = createChecksum(recentTasks);

    // Try to get cached suggestions
    const cached = getCachedSuggestions(tasksChecksum);
    if (cached) {
      return {
        suggestions: cached,
        fromCache: true
      };
    }

    // Generate new suggestions
    const suggestions = await generateAISuggestions(recentTasks);

    // Cache the results
    if (suggestions.length > 0) {
      cacheSuggestions(tasksChecksum, suggestions);
    }

    return {
      suggestions,
      fromCache: false
    };
  }

  /**
   * Force refresh suggestions (ignore cache)
   */
  static async refreshSuggestions(recentTasks?: RecentTask[]): Promise<string[]> {
    // Handle undefined recentTasks
    if (!recentTasks || !Array.isArray(recentTasks)) {
      return [];
    }

    // Clear existing cache for this checksum
    const tasksChecksum = createChecksum(recentTasks);
    const cacheKey = `${CACHE_KEY_PREFIX}${tasksChecksum}`;

    try {
      localStorage.removeItem(cacheKey);
    } catch (error) {
      console.warn('Error clearing cache:', error);
    }

    // Generate fresh suggestions
    const suggestions = await generateAISuggestions(recentTasks);

    // Cache new results
    if (suggestions.length > 0) {
      cacheSuggestions(tasksChecksum, suggestions);
    }

    return suggestions;
  }

  /**
   * Get a random loading message
   */
  static getRandomLoadingMessage(): string {
    const randomIndex = Math.floor(Math.random() * LOADING_MESSAGES.length);
    return LOADING_MESSAGES[randomIndex];
  }
}