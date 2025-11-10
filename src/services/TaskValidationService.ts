import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI (same API key as monitoring service)
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('VITE_GEMINI_API_KEY environment variable is required');
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are a balanced task validation assistant. Your job is to determine if a task/goal represents legitimate work, study, or productive activity.

A task should be APPROVED (YES) if it meets AT LEAST ONE criteria:
- Represents a legitimate work, study, or productive activity
- Contains a clear domain/topic area (even if not super specific)
- Has a clear type of work or activity
- Contains meaningful content (not random text or gibberish)
- Is reasonable for a work/study session

Examples of GOOD tasks: "work on ai saas", "study math", "code project", "write essay", "research topic", "design website", "analyze data", "prepare presentation", "debug code", "plan meeting", "review documents"

A task should be REJECTED (NO) if it meets ANY criteria:
- Gibberish, random characters, repeated letters, or nonsensical content
- Only laughter, random sounds, or meaningless text
- Generic greetings or test text with no productive intent
- Extremely vague with no indication of productive activity
- Examples of BAD tasks: "afadgag", "hahaha", "lol", "asdfghjkl", "hello", "testing", "abc123", "blablablabla", "do nothing"

BE REASONABLE about approving tasks that:
- Mention a work/study area (even if not super detailed)
- Include a type of activity or project
- Are reasonable for a productivity session
- Show genuine intent to do productive work

CRITICAL: Respond with ONLY ONE WORD:
YES or NO

No additional text, no explanations, no punctuation. Just YES or NO.`;

interface TaskValidationCache {
  [task: string]: boolean; // true = approved, false = rejected
}

export class TaskValidationService {
  private cache: TaskValidationCache = {};
  private model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  constructor() {
    this.loadCacheFromStorage();
    // Clear cache on startup to ensure new system prompt takes effect
    console.log('🔄 TaskValidationService constructor - checking cache...');
    const stats = this.getCacheStats();
    console.log('📊 Cache stats on startup:', stats);

    // Clear cache to force fresh validation with new, more lenient system prompt
    this.clearCache();
    console.log('🆕 TaskValidationService initialized with more lenient validation criteria');
  }

  // Load cache from localStorage for session persistence
  private loadCacheFromStorage(): void {
    try {
      const savedCache = localStorage.getItem('flowstate-task-validation-cache');
      if (savedCache) {
        this.cache = JSON.parse(savedCache);
        console.log('📋 Loaded task validation cache from localStorage:', Object.keys(this.cache).length, 'entries');
      }
    } catch (error) {
      console.error('Error loading task validation cache:', error);
      this.cache = {};
    }
  }

  // Save cache to localStorage
  private saveCacheToStorage(): void {
    try {
      localStorage.setItem('flowstate-task-validation-cache', JSON.stringify(this.cache));
      console.log('💾 Saved task validation cache to localStorage:', Object.keys(this.cache).length, 'entries');
    } catch (error) {
      console.error('Error saving task validation cache:', error);
    }
  }

  // Check if task is cached
  private isTaskCached(task: string): boolean {
    const normalizedTask = task.toLowerCase().trim();
    return this.cache.hasOwnProperty(normalizedTask);
  }

  // Get cached result
  private getCachedResult(task: string): boolean | null {
    const normalizedTask = task.toLowerCase().trim();
    if (this.cache.hasOwnProperty(normalizedTask)) {
      console.log('📋 Using cached task validation result for:', task);
      return this.cache[normalizedTask];
    }
    return null;
  }

  // Cache the result
  private cacheResult(task: string, isValid: boolean): void {
    const normalizedTask = task.toLowerCase().trim();
    this.cache[normalizedTask] = isValid;
    this.saveCacheToStorage();
    console.log('💾 Cached task validation result:', task, '=>', isValid ? 'VALID' : 'INVALID');
  }

  // Generate cache key for a task
  private getCacheKey(task: string): string {
    return task.toLowerCase().trim();
  }

  // Validate task using AI
  async validateTask(task: string): Promise<{ isValid: boolean }> {
    const normalizedTask = task.toLowerCase().trim();
    console.log('🔍 TaskValidationService.validateTask() called with:', task);

    // Check cache first
    if (this.isTaskCached(normalizedTask)) {
      const cachedResult = this.getCachedResult(normalizedTask);
      console.log('📋 Using cached result for task:', task, '=>', cachedResult);
      return {
        isValid: cachedResult === true
      };
    }

    try {
      console.log('🤖 Calling AI API to validate task:', task);

      const prompt = `${SYSTEM_PROMPT}\n\nTask: "${task}"`;
      console.log('📝 Sending prompt to AI (length:', prompt.length, 'characters)');

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim().toUpperCase();

      console.log('🤖 AI raw response for task validation:', `"${text}"`);
      console.log('🤖 Response length:', text.length);
      console.log('🤖 Full response object:', response);

      // Parse response
      const isValid = text === 'YES';
      console.log('🤖 Parsed AI response:', isValid ? 'VALID (YES)' : 'INVALID (NO)');

      if (text !== 'YES' && text !== 'NO') {
        console.warn('⚠️ Unexpected AI response format:', `"${text}"`);
      }

      // Cache the result
      this.cacheResult(normalizedTask, isValid);

      return {
        isValid
      };

    } catch (error) {
      console.error('❌ Error calling AI API for task validation:', error);
      console.error('❌ Error details:', error.message || error);
      console.error('❌ Stack trace:', error.stack);

      // For debugging: If AI fails, reject tasks that are clearly invalid
      const clearlyInvalid = /^[a-z]+$/i.test(task) && task.length < 8 && !/[aeiou]/i.test(task);
      const isGibberish = /^(.)\1+$/i.test(task) || task.replace(/(.)\1+/gi, '$1').length < 5;

      if (clearlyInvalid || isGibberish || task.toLowerCase().includes('blablab')) {
        console.log('🚫 Task rejected by fallback validation:', task);
        return {
          isValid: false
        };
      }

      // If AI fails, be lenient and approve the task but log the error
      return {
        isValid: true
      };
    }
  }

  // Clear cache (for testing or user preference)
  clearCache(): void {
    this.cache = {};
    this.saveCacheToStorage();
    console.log('🗑️ Task validation cache cleared');
  }

  // Clear specific entries (useful after system prompt updates)
  clearSpecificEntries(tasks: string[]): void {
    tasks.forEach(task => {
      const normalizedTask = task.toLowerCase().trim();
      delete this.cache[normalizedTask];
    });
    this.saveCacheToStorage();
    console.log('🗑️ Cleared specific cache entries for:', tasks);
  }

  // Get cache stats
  getCacheStats(): { size: number; entries: TaskValidationCache } {
    return {
      size: Object.keys(this.cache).length,
      entries: { ...this.cache }
    };
  }
}

// Export singleton instance
export const taskValidationService = new TaskValidationService();