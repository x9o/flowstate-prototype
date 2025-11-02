/**
 * Window monitoring module for FlowState
 * Detects window changes and checks productivity using Gemini AI
 */

// Dynamic import for ESM modules
let activeWin = null;
let GoogleGenAI = null;
let ai = null;

// Monitoring state
let isMonitoring = false;
let isBlocking = false; // Track if blocking screen is active
let monitoringInterval = null;
let currentGoal = null;
let previousWindow = '';
let lastProcessedWindow = ''; // Track the last window we actually processed
let checkCount = 0;
let showBlockingCallback = null; // Callback to show blocking window
let productiveCache = new Map(); // Cache productive results: window -> true
let unproductiveCache = new Map(); // Cache unproductive results: window -> true

// Configuration
const POLL_INTERVAL = 1000; // Check every 1 second
const GEMINI_API_KEY = 'AIzaSyDt7br2YQDhiuXAJd-M2oWit7M_7sKTOgY';

// AI System Prompt
const SYSTEM_PROMPT = `You are a strict and efficient productivity AI. Your only function is to determine if a user's activity is productive based on their stated goal. Your response must be a single word, either YES or NO, with no exceptions.

---
[EXAMPLE 1]
GOAL: "Write a research paper on the migration patterns of birds."
ACTIVITY: "JSTOR | Search for academic journals"
YOUR RESPONSE:
YES
---
[EXAMPLE 2]
GOAL: "Write a research paper on the migration patterns of birds."
ACTIVITY: "Reddit - r/funny"
YOUR RESPONSE:
NO
---
[EXAMPLE 3]
GOAL: "Code a user authentication feature for my web app."
ACTIVITY: "Stack Overflow - 'How to fix Python dictionary error'"
YOUR RESPONSE:
YES
---
[EXAMPLE 4]
GOAL: "Code a user authentication feature for my web app."
ACTIVITY: "YouTube - 'Top 10 Plays of the Week | NBA'"
YOUR RESPONSE:
NO
---`;

/**
 * Initialize the monitoring module
 */
async function initialize() {
  if (activeWin && GoogleGenAI) return; // Already initialized

  try {
    // Dynamic import of ESM modules
    const activeWinModule = await import('active-win');
    activeWin = activeWinModule.default;

    const genaiModule = await import('@google/genai');
    GoogleGenAI = genaiModule.GoogleGenAI;

    // Initialize Gemini AI
    ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    console.log('✅ Monitoring module initialized');
  } catch (error) {
    console.error('❌ Failed to initialize monitoring module:', error);
    throw error;
  }
}

/**
 * Get cached result for window (true=productive, false=unproductive, null=not cached)
 */
function getCachedResult(windowTitle) {
  if (productiveCache.has(windowTitle)) {
    console.log(`✅ Using cached PRODUCTIVE result for "${windowTitle}"`);
    return true;
  }
  if (unproductiveCache.has(windowTitle)) {
    console.log(`🚫 Using cached UNPRODUCTIVE result for "${windowTitle}"`);
    return false;
  }
  return null; // Not cached
}

/**
 * Cache AI result for window
 */
function cacheResult(windowTitle, isProductive) {
  if (isProductive) {
    productiveCache.set(windowTitle, true);
    console.log(`💾 Cached as PRODUCTIVE: "${windowTitle}"`);
  } else {
    unproductiveCache.set(windowTitle, true);
    console.log(`💾 Cached as UNPRODUCTIVE: "${windowTitle}"`);
  }
}

/**
 * Clear cache for window (when marked as productive)
 */
function clearCacheForWindow(windowTitle) {
  unproductiveCache.delete(windowTitle);
  productiveCache.set(windowTitle, true);
  console.log(`🗑️  Cleared cache and marked as PRODUCTIVE: "${windowTitle}"`);
}

/**
 * Check if window title should be skipped from AI detection
 */
function shouldSkipAIDetection(windowTitle) {
  // List of window titles/patterns to skip AI detection for
  const skipList = [
    "[No active window]",
    "[Untitled Window]",
    "[Error detecting window]",
    "[DETECTION_ERROR]",
    "File Explorer",
    "Explorer",
    "This PC",
    "Desktop",
    "Task Manager",
    "Settings",
    "Control Panel",
    "Command Prompt",
    "Windows PowerShell",
    "Terminal",
    "Windows Security",
    "Notification Center",
    "Action Center",
    "Volume Mixer",
    "Run",
    "Program Manager",
    "Start Menu",
    "Search",
    "Task View",
    "Alt+Tab",
    "Productivity App",
    "Focus Protector",
    "gemini_productivity",
    "Node.js",
    "Electron",
    "Blocking Screen",
    "Flowstate",
    "Loading",
    "Loading...",
    "Block Screen",
    "Task Switching"
  ];

  // Check if window title contains any skip patterns
  const lowerTitle = windowTitle.toLowerCase();
  return skipList.some(skip =>
    lowerTitle.includes(skip.toLowerCase()) ||
    lowerTitle.startsWith(skip.toLowerCase()) ||
    lowerTitle.endsWith(skip.toLowerCase())
  );
}

/**
 * Detect the currently active window
 */
async function detectActiveWindow() {
  try {
    const window = await activeWin();

    if (window && window.title) {
      const windowTitle = window.title.trim();
      return windowTitle || '[Untitled Window]';
    } else {
      return '[No active window]';
    }
  } catch (error) {
    // Return a special error placeholder that the monitoring loop can handle
    return '[DETECTION_ERROR]';
  }
}

/**
 * Check if activity is productive using Gemini AI
 */
async function checkProductivity(goal, activity) {
  const prompt = `${SYSTEM_PROMPT}

[USER REQUEST]
GOAL: "${goal}"
ACTIVITY: "${activity}"
YOUR RESPONSE:`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
    });

    const aiResponse = response.text?.trim() || '';
    console.log(`🤖 AI Response for "${activity}": ${aiResponse}`);
    return aiResponse.toUpperCase() === 'YES';
  } catch (error) {
    console.error(`❌ Error calling Gemini API: ${error}`);
    // Default to allowing activity if API fails
    return true;
  }
}

/**
 * Show blocking overlay
 */
async function showBlockingOverlay(goal, activity) {
  console.log(`\n🚫 BLOCKING: ${activity}`);

  if (!showBlockingCallback) {
    console.error('❌ No blocking window callback available');
    return;
  }

  try {
    // Use the callback from main process to create blocking window
    await showBlockingCallback(goal, activity);
    console.log('✅ Blocking dismissed\n');
  } catch (error) {
    console.error('Error showing blocking overlay:', error);
  }
}

/**
 * Monitoring loop
 */
async function monitoringLoop() {
  if (!isMonitoring) return;

  // Skip all monitoring during blocking - this is the key fix
  if (isBlocking) {
    console.log('⏸️  Monitoring paused during blocking...');
    return;
  }

  try {
    // Detect current active window
    const currentWindow = await detectActiveWindow();

    // Skip if we got a detection error
    if (currentWindow === "[DETECTION_ERROR]") {
      console.log('⚠️  Window detection failed, retrying...');
      return;
    }

    // Only process if this is a NEW window that we haven't processed yet
    if (currentWindow !== previousWindow && currentWindow !== lastProcessedWindow) {
      checkCount++;
      console.log(`\n[Window Change #${checkCount}]`);
      console.log(`🔍 Activity: ${currentWindow}`);

      // Check if this window should skip AI detection
      if (shouldSkipAIDetection(currentWindow)) {
        console.log('⏭️  Skipping AI detection for system window\n');
      } else {
        // Check cache first
        const cachedResult = getCachedResult(currentWindow);

        if (cachedResult !== null) {
          // Use cached result - no AI call needed
          if (cachedResult) {
            console.log('✅ Productive activity (from cache) - continuing...\n');
          } else {
            // Unproductive - immediately block without AI
            console.log('🚫 Unproductive activity (from cache) - immediate blocking');

            // Set blocking flag BEFORE showing overlay
            isBlocking = true;
            console.log('🚫 Showing blocking overlay (monitoring paused)');

            // Show blocking overlay (this will wait until dismissed)
            await showBlockingOverlay(currentGoal, currentWindow);

            // Clear blocking flag after overlay is dismissed
            isBlocking = false;
            console.log('✅ Blocking dismissed (monitoring resumed)\n');
          }
        } else {
          // First time seeing this window - need to check with AI
          console.log('🤔 Checking productivity (first time)...');
          const isProductive = await checkProductivity(currentGoal, currentWindow);

          // Cache the result for future use
          cacheResult(currentWindow, isProductive);

          if (isProductive) {
            console.log('✅ Productive activity - continuing...\n');
          } else {
            // Set blocking flag BEFORE showing overlay
            isBlocking = true;
            console.log('🚫 Showing blocking overlay (monitoring paused)');

            // Show blocking overlay (this will wait until dismissed)
            await showBlockingOverlay(currentGoal, currentWindow);

            // Clear blocking flag after overlay is dismissed
            isBlocking = false;
            console.log('✅ Blocking dismissed (monitoring resumed)\n');
          }
        }
      }

      // Update last processed window to avoid reprocessing
      lastProcessedWindow = currentWindow;
    }

    // Update previous window for next iteration
    previousWindow = currentWindow;
  } catch (error) {
    console.error('Error in monitoring loop:', error);
    // Clear blocking flag on error to prevent stuck state
    isBlocking = false;
  }
}

/**
 * Start monitoring
 */
async function startMonitoring(goal, onStatusChange, blockingWindowCallback) {
  if (isMonitoring) {
    console.log('⚠️ Monitoring already active');
    return { success: false, message: 'Already monitoring' };
  }

  try {
    // Initialize if needed
    await initialize();

    // Store the blocking window callback
    showBlockingCallback = blockingWindowCallback;

    currentGoal = goal;
    isMonitoring = true;
    previousWindow = '';
    checkCount = 0;

    // Ensure caches are initialized
    if (!productiveCache) productiveCache = new Map();
    if (!unproductiveCache) unproductiveCache = new Map();

    console.log('\n' + '='.repeat(60));
    console.log('🎯 MONITORING STARTED');
    console.log('='.repeat(60));
    console.log(`Goal: ${goal}`);
    console.log(`Checking every ${POLL_INTERVAL}ms for window changes`);
    console.log('='.repeat(60) + '\n');

    // Start monitoring loop
    monitoringInterval = setInterval(monitoringLoop, POLL_INTERVAL);

    // Also run immediately
    monitoringLoop();

    if (onStatusChange) {
      onStatusChange({ monitoring: true, goal });
    }

    return { success: true, goal };
  } catch (error) {
    console.error('Failed to start monitoring:', error);
    isMonitoring = false;
    showBlockingCallback = null;
    return { success: false, message: error.message };
  }
}

/**
 * Stop monitoring
 */
function stopMonitoring(onStatusChange) {
  if (!isMonitoring) {
    return { success: false, message: 'Not monitoring' };
  }

  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }

  isMonitoring = false;
  isBlocking = false; // Clear blocking flag
  currentGoal = null;
  previousWindow = '';
  lastProcessedWindow = '';
  showBlockingCallback = null; // Clear callback
  productiveCache.clear(); // Clear caches
  unproductiveCache.clear();

  console.log('\n' + '='.repeat(60));
  console.log('🛑 MONITORING STOPPED');
  console.log(`Total window changes detected: ${checkCount}`);
  console.log('='.repeat(60) + '\n');

  if (onStatusChange) {
    onStatusChange({ monitoring: false, goal: null });
  }

  return { success: true };
}

/**
 * Mark a window as productive (clear from unproductive cache, add to productive cache)
 */
function markAsProductive(windowTitle) {
  console.log(`🎯 Marking as productive: "${windowTitle}"`);

  // Remove from unproductive cache if present
  if (unproductiveCache.has(windowTitle)) {
    unproductiveCache.delete(windowTitle);
    console.log(`🗑️  Removed from unproductive cache: "${windowTitle}"`);
  }

  // Add to productive cache
  productiveCache.set(windowTitle, true);
  console.log(`✅ Added to productive cache: "${windowTitle}"`);
}

/**
 * Get monitoring status
 */
function getStatus() {
  return {
    monitoring: isMonitoring,
    goal: currentGoal,
    checkCount: checkCount,
    productiveCacheSize: productiveCache.size,
    unproductiveCacheSize: unproductiveCache.size
  };
}

module.exports = {
  startMonitoring,
  stopMonitoring,
  getStatus,
  markAsProductive
};
