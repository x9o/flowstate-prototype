import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI (same API key as monitoring service)
const GEMINI_API_KEY = 'AIzaSyAwd6DjvP0t4J3Q9jXoY-7F8K0L1mN_nP4';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are a strict task validation assistant. Your job is to determine if a task/goal is clear, specific, and represents legitimate work/study activity.

A task should be APPROVED (YES) only if it meets ALL criteria:
- Contains specific, actionable details about what needs to be done
- Represents a legitimate work, study, or productive activity
- Has a clear deliverable or outcome that can be measured
- Is specific enough to determine whether activities are relevant to it
- Contains meaningful content (not random text or gibberish)
- Examples of GOOD tasks: "Finish physics homework chapter 5", "Complete Q3 sales presentation", "Write project proposal for client", "Study for chemistry midterm exam", "Debug authentication flow", "Design new landing page mockups", "Review pull requests", "Prepare meeting agenda"

A task should be REJECTED (NO) if it fails ANY criteria:
- Too vague or ambiguous to determine relevant activities
- Gibberish, random characters, repeated letters, or nonsensical content
- Too broad or generic without specific details
- Does not represent legitimate productive activity
- Contains only laughter, random sounds, or meaningless text
- Examples of BAD tasks: "work", "study", "stuff", "things to do", "afadgag", "do something", "be productive", "hahaha", "lol", "asdfghjkl", "hello", "testing", "abc123", "random text"

CRITICAL: Be extremely strict about rejecting tasks that are:
- Gibberish, random letters, or repeated characters
- Laughter or casual conversation ("hahaha", "lol", "hehe")
- Generic greetings or test text ("hello", "testing", "asdf")
- Anything that doesn't represent actual productive work

Respond with only:
YES - if the task is clear, specific, and represents legitimate productive activity
NO - if the task fails any validation criteria

No explanation needed, just YES or NO.`;

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

    // Clear cache to force fresh validation with new system prompt
    this.clearCache();
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
  async validateTask(task: string): Promise<{ isValid: boolean; reason?: string }> {
    const normalizedTask = task.toLowerCase().trim();
    console.log('🔍 TaskValidationService.validateTask() called with:', task);

    // Check cache first
    if (this.isTaskCached(normalizedTask)) {
      const cachedResult = this.getCachedResult(normalizedTask);
      console.log('📋 Using cached result for task:', task, '=>', cachedResult);
      return {
        isValid: cachedResult === true,
        reason: cachedResult ? 'Task is valid (cached)' : 'Task is too vague (cached)'
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

      // Parse response
      const isValid = text === 'YES';
      console.log('🤖 Parsed AI response:', isValid ? 'VALID (YES)' : 'INVALID (NO)');

      // Cache the result
      this.cacheResult(normalizedTask, isValid);

      return {
        isValid,
        reason: isValid ? 'Task is clear and specific enough' : 'Task is too vague or ambiguous'
      };

    } catch (error) {
      console.error('❌ Error calling AI API for task validation:', error);
      console.error('❌ Error details:', error.message || error);

      // If AI fails, be lenient and approve the task but log the error
      return {
        isValid: true,
        reason: 'Task validation service unavailable - proceeding anyway'
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