import { GoogleGenerativeAI } from "@google/generative-ai";
import { activeWindow, openWindows } from "get-windows";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createRequire } from "module";
import * as fs from "fs/promises";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure Gemini
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('VITE_GEMINI_API_KEY environment variable is required');
}
const ai = new GoogleGenerativeAI(GEMINI_API_KEY);

// Enhanced cache for AI productivity verdicts with detailed window info
const productivityCache = new Map();

// Session statistics
let sessionStats = {
  totalChecks: 0,
  productiveApps: new Map(),
  unproductiveApps: new Map(),
  timeByApp: new Map(),
  blockedAttempts: 0,
  sessionStartTime: null
};

// Global state
let currentGoals = [];
let sessionDuration = 0;
let isRunning = false;

// AI System Prompt (enhanced for better window analysis with multiple tasks)
const SYSTEM_PROMPT = `

You are a balanced productivity AI. Your function is to determine if a user's activity is reasonably productive for ANY of their stated goals. Your response must ALWAYS be a single word: either YES or NO.

Multi-Task Rule: If the activity supports AT LEAST ONE of the user's goals, respond YES. Only respond NO if the activity is unproductive for ALL goals.

Guidelines:

Reasonable Support: Respond YES if the activity directly supports ANY goal OR is a common secondary tool that aids focus (e.g., instrumental music, documentation).
Assume Good Intent: If the window title is ambiguous or technical (e.g., "npm start", "localhost:3000", "Untitled"), assume it is work-related and respond YES.
Block Obvious Distractions: Social media, entertainment sites, and clearly unrelated content are NO.
Example:

GOALS: ["Write a research paper", "Study for biology exam"]
ACTIVITY: "JSTOR" -> YES (supports research paper)
ACTIVITY: "YouTube - 'Biology Lecture Notes'" -> YES (supports biology exam)
ACTIVITY: "Reddit - r/askscience" -> YES (supports either goal)
ACTIVITY: "Reddit - r/funny" -> NO (supports neither goal)


`;

/**
 * Send message to parent process
 */
function sendMessage(type, data) {
  console.log(JSON.stringify({ type, data }));
}

/**
 * Format window information for AI analysis
 */
function formatWindowInfo(windowInfo) {
  let formatted = `ACTIVITY: "${windowInfo.title}" in "${windowInfo.owner.name}"`;

  if (windowInfo.url) {
    formatted += ` (URL: ${windowInfo.url})`;
  }

  if (windowInfo.owner.path) {
    formatted += ` (Path: ${windowInfo.owner.path})`;
  }

  return formatted;
}

/**
 * Get enhanced activity description for better AI context
 */
function getEnhancedActivityDescription(windowInfo) {
  const { title, owner, url, memoryUsage } = windowInfo;

  // Detect common productive patterns
  const productivePatterns = [
    /localhost:\d+/, // Local development
    /npm|yarn|pnpm/, // Package managers
    /git|github|gitlab/, // Version control
    /stack overflow|stackoverflow/, // Programming help
    /docs|documentation/, // Documentation
    /vs code|visual studio|sublime|atom/, // Editors
    /terminal|console|cmd|powershell/, // Development terminals
    /node|python|java|javascript|react|vue/, // Development keywords
  ];

  const unproductivePatterns = [
    /youtube|tiktok|instagram|facebook|twitter/, // Social media
    /reddit.*r\/(funny|memes|gaming|videos)/, // Entertainment subreddits
    /netflix|hbo|hulu|disney\+/, // Streaming
    /spotify|soundcloud/, // Music (potentially distracting)
    /games|gaming|steam|epic/, // Gaming
  ];

  const titleLower = title.toLowerCase();
  const ownerLower = owner.name.toLowerCase();
  const combinedText = `${titleLower} ${ownerLower} ${url || ''}`.toLowerCase();

  // Check patterns
  const isProductivePattern = productivePatterns.some(pattern => pattern.test(combinedText));
  const isUnproductivePattern = unproductivePatterns.some(pattern => pattern.test(combinedText));

  // Determine app category
  let appCategory = "Unknown";
  if (ownerLower.includes("chrome") || ownerLower.includes("firefox") || ownerLower.includes("safari")) {
    appCategory = "Browser";
  } else if (ownerLower.includes("code") || ownerLower.includes("sublime") || ownerLower.includes("atom")) {
    appCategory = "Code Editor";
  } else if (ownerLower.includes("terminal") || ownerLower.includes("console") || ownerLower.includes("powershell")) {
    appCategory = "Terminal";
  } else if (ownerLower.includes("visual studio") || ownerLower.includes("intellij") || ownerLower.includes("eclipse")) {
    appCategory = "IDE";
  } else if (ownerLower.includes("office") || ownerLower.includes("word") || ownerLower.includes("powerpoint")) {
    appCategory = "Productivity";
  } else if (ownerLower.includes("slack") || ownerLower.includes("discord") || ownerLower.includes("teams")) {
    appCategory = "Communication";
  }

  return {
    ...windowInfo,
    appCategory,
    memoryUsageMB: Math.round(memoryUsage / 1024 / 1024),
    isProductivePattern,
    isUnproductivePattern,
    formattedInfo: formatWindowInfo(windowInfo)
  };
}

/**
 * Check if activity is productive relative to goals using Gemini AI with enhanced caching
 */
async function checkProductivity(goals, windowInfo) {
  const enhancedInfo = getEnhancedActivityDescription(windowInfo);

  // Create a comprehensive cache key
  const goalsString = goals.map(g => g.toLowerCase().trim()).sort().join(':::');
  const cacheKey = `${goalsString}:::${enhancedInfo.formattedInfo.toLowerCase().trim()}`;

  // Check if we already have a cached verdict
  if (productivityCache.has(cacheKey)) {
    const cachedResult = productivityCache.get(cacheKey);
    console.log(`📋 Using cached verdict: ${cachedResult ? 'YES' : 'NO'}`);
    updateStats(enhancedInfo, cachedResult);
    return cachedResult;
  }


  const prompt = `${SYSTEM_PROMPT}

[USER REQUEST]
GOALS: [${goals.map(g => `"${g}"`).join(', ')}]
${enhancedInfo.formattedInfo}
YOUR RESPONSE:`;

  try {
    console.log("🤖 Calling AI API for new verdict...");
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const response = await model.generateContent(prompt);

    const aiResponse = response.response.text()?.trim() || "";
    console.log(`🤖 AI Response: ${aiResponse}`);

    const isProductive = aiResponse.toUpperCase() === "YES";

    // Cache the result for future use
    productivityCache.set(cacheKey, isProductive);
    console.log(`💾 Cached verdict for future reference`);

    updateStats(enhancedInfo, isProductive);
    return isProductive;
  } catch (error) {
    console.error(`❌ Error calling Gemini API: ${error}`);
    // Default to allowing activity if API fails
    updateStats(enhancedInfo, true);
    return true;
  }
}

/**
 * Update session statistics
 */
function updateStats(windowInfo, isProductive) {
  sessionStats.totalChecks++;

  const appName = windowInfo.owner.name;
  const appStats = isProductive ? sessionStats.productiveApps : sessionStats.unproductiveApps;

  appStats.set(appName, (appStats.get(appName) || 0) + 1);

  // Track time spent in each app (simplified - just increment count)
  sessionStats.timeByApp.set(appName, (sessionStats.timeByApp.get(appName) || 0) + 1);

  if (!isProductive) {
    sessionStats.blockedAttempts++;
  }

  // Send stats update to parent process
  sendMessage('stats-update', sessionStats);
}

/**
 * Check if user marked activity as productive and update cache accordingly
 */
async function checkWhitelistAndCache(goals, enhancedInfo) {
  const whitelistFile = join(__dirname, '..', '..', 'whitelist.txt');

  try {
    // Check if whitelist file exists and contains the current activity
    const fileExists = await fs.access(whitelistFile).then(() => true).catch(() => false);

    if (fileExists) {
      const whitelistedActivity = await fs.readFile(whitelistFile, 'utf8');
      console.log(`🔍 Found whitelist file with content: "${whitelistedActivity.trim()}"`);
      console.log(`🔍 Comparing with current window: "${enhancedInfo.title.trim()}"`);

      // More flexible matching - check if the whitelist content is contained in the window title
      // or if they match exactly, or if the app name matches
      const windowTitle = enhancedInfo.title.trim().toLowerCase();
      const whitelistContent = whitelistedActivity.trim().toLowerCase();
      const appName = enhancedInfo.owner.name.trim().toLowerCase();

      const isMatch =
        windowTitle === whitelistContent || // Exact match
        windowTitle.includes(whitelistContent) || // Whitelist content is part of window title
        whitelistContent.includes(windowTitle) || // Window title is part of whitelist content
        appName === whitelistContent || // App name matches
        windowTitle.includes(appName); // Window title includes app name

      if (isMatch) {
        // Create the same cache key format as in checkProductivity
        const goalsString = goals.map(g => g.toLowerCase().trim()).sort().join(':::');
        const cacheKey = `${goalsString}:::${enhancedInfo.formattedInfo.toLowerCase().trim()}`;

        // Force update cache to YES
        productivityCache.set(cacheKey, true);
        console.log(`✅ User marked "${enhancedInfo.title}" in ${enhancedInfo.owner.name} as productive - updated cache to YES`);
        console.log(`🔑 Cache key: ${cacheKey}`);


        // Clean up whitelist file after processing
        await fs.unlink(whitelistFile);
        console.log(`🗑️ Cleaned up whitelist file`);

        return true; // Indicate that whitelist was processed
      } else {
        console.log(`❌ No match found between whitelist and current window`);
      }
    }
  } catch (error) {
    console.log(`ℹ️ No whitelist override found or error reading whitelist file: ${error.message}`);
  }

  return false; // No whitelist processed
}

/**
 * Show enhanced blocking overlay using Electron
 */
async function simulateBlocking(goals, windowInfo) {
  console.log("\n" + "=".repeat(50));
  console.log("🚫 BLOCKING ACTIVITY - NOT PRODUCTIVE!");
  console.log("=".repeat(50));
  console.log(`Window: ${windowInfo.title}`);
  console.log(`App: ${windowInfo.owner.name}`);
  console.log(`Category: ${windowInfo.appCategory || 'Unknown'}`);
  if (windowInfo.memoryUsageMB) {
    console.log(`Memory Usage: ${windowInfo.memoryUsageMB}MB`);
  }
  console.log(`Goals: ${goals.join(', ')}`);
  console.log("You're off task. Showing blocking screen...");
  console.log("=".repeat(50) + "\n");

  // Send blocked activity notification to parent
  sendMessage('activity-blocked', {
    window: windowInfo.title,
    app: windowInfo.owner.name,
    category: windowInfo.appCategory
  });

  return new Promise((resolve, reject) => {
    // Get Electron executable path (cross-platform)
    let electronPath;
    try {
      // Check if we have an electron path from the UI process
      if (process.env.ELECTRON_PATH) {
        electronPath = process.env.ELECTRON_PATH;
        console.log(`Using electron path from environment: ${electronPath}`);
      } else {
        // Try to get electron from the installed package
        const electron = require('electron');
        electronPath = electron;
      }
    } catch (error) {
      console.error("❌ Electron not found. Please run: npm install");
      resolve();
      return;
    }

    const overlayPath = join(__dirname, '..', '..', 'overlay', 'main.cjs');

    // Spawn Electron process with enhanced information
    const electronProcess = spawn(electronPath, [
      overlayPath,
      '--goal', goals.join(', '),
      '--activity', windowInfo.title,
      '--app', windowInfo.owner.name,
      '--category', windowInfo.appCategory || 'Unknown'
    ], {
      stdio: 'ignore',
      detached: false
    });

    electronProcess.on('close', async (code) => {
      console.log("✅ Blocking screen dismissed. Back to monitoring...\n");

      // Check if user marked the activity as productive
      await checkWhitelistAndCache(goals, windowInfo);

      resolve();
    });

    electronProcess.on('error', (error) => {
      console.error(`❌ Failed to show blocking screen: ${error.message}`);
      console.log("Falling back to console notification...\n");
      resolve(); // Continue anyway
    });
  });
}

/**
 * Detect the currently active window using get-windows with enhanced information
 */
async function detectActiveWindow(silent = false) {
  try {
    const window = await activeWindow();

    if (window) {
      const enhancedInfo = getEnhancedActivityDescription(window);

      // Check if this is the FlowState app itself (auto-whitelist)
      const isFlowStateApp = enhancedInfo.owner.name.toLowerCase().includes('flowstate') ||
                           enhancedInfo.title.toLowerCase().includes('flowstate');

      if (isFlowStateApp) {
        console.log(`🔄 Detected FlowState app - skipping monitoring check`);
        return null; // Skip monitoring for FlowState app itself
      }

      if (!silent) {
        console.log(`🔍 Active Window: ${enhancedInfo.title}`);
        console.log(`📱 App: ${enhancedInfo.owner.name} (${enhancedInfo.appCategory})`);
        if (enhancedInfo.url) {
          console.log(`🌐 URL: ${enhancedInfo.url}`);
        }
        if (enhancedInfo.memoryUsageMB) {
          console.log(`💾 Memory: ${enhancedInfo.memoryUsageMB}MB`);
        }
        if (enhancedInfo.bounds) {
          console.log(`📐 Size: ${enhancedInfo.bounds.width}x${enhancedInfo.bounds.height}`);
        }
      }

      // Send window detection to parent process
      sendMessage('window-detected', {
        title: enhancedInfo.title,
        app: enhancedInfo.owner.name,
        category: enhancedInfo.appCategory,
        url: enhancedInfo.url,
        memoryUsage: enhancedInfo.memoryUsageMB
      });

      return enhancedInfo;
    } else {
      if (!silent) console.log("🔍 No active window detected");
      return null;
    }
  } catch (error) {
    if (!silent) console.log(`🔍 Error detecting window: ${error}`);
    return null;
  }
}

/**
 * Wait for specified seconds
 */
function sleep(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

/**
 * Main monitoring loop - monitors window changes in real-time with enhanced features
 */
async function startMonitoring(goals, duration) {
  currentGoals = goals;
  sessionDuration = duration;
  isRunning = true;
  sessionStats.sessionStartTime = Date.now();

  console.log("🔄 Starting enhanced monitoring service");
  console.log(`📊 Goals: ${goals.join(', ')}`);
  console.log(`⏱️ Duration: ${duration} minutes`);
  console.log("🔍 Enhanced window detection active...");

  let checkCount = 0;
  let previousWindow = null;
  const pollInterval = 1000; // Check every 1 second for responsive detection

  // Graceful shutdown handlers
  const shutdown = () => {
    console.log("👋 Monitoring service shutting down...");
    isRunning = false;
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  try {
    while (isRunning) {
      // Detect current active window (silent polling)
      const currentWindow = await detectActiveWindow(true);

      // Only check productivity if window changed and we have a valid window
      if (currentWindow && (!previousWindow ||
          currentWindow.title !== previousWindow.title ||
          currentWindow.owner.name !== previousWindow.owner.name)) {

        checkCount++;
        console.log(`\n[Window Change #${checkCount}]`);
        console.log(`🔍 ${currentWindow.title} (${currentWindow.owner.name})`);
        if (currentWindow.url) {
          console.log(`🌐 URL: ${currentWindow.url}`);
        }

        // Check whitelist immediately before AI
        console.log("🔍 Checking whitelist override...");
        const whitelistProcessed = await checkWhitelistAndCache(goals, currentWindow);

        if (whitelistProcessed) {
          console.log("✅ Whitelist override applied - activity marked as productive");
          // Update stats for the productive activity
          updateStats(currentWindow, true);
          console.log("✅ Productive activity (whitelisted) - continuing...\n");
        } else {
          // Check with AI
          console.log("🤔 Checking productivity with AI...");
          const isProductive = await checkProductivity(goals, currentWindow);

          if (isProductive) {
            console.log("✅ Productive activity - continuing...\n");
          } else {
            await simulateBlocking(goals, currentWindow);
          }
        }

        // Display cache stats periodically
        if (checkCount % 5 === 0) {
          console.log(`📊 Cache: ${productivityCache.size} entries`);
        }

        previousWindow = currentWindow;
      }

      // Short sleep to prevent excessive CPU usage while still being responsive
      await sleep(pollInterval / 1000);
    }
  } catch (error) {
    console.error(`\n❌ Error in monitoring loop: ${error}`);
    isRunning = false;
    process.exit(1);
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node MonitoringService.js <goals_json> <duration_minutes>');
    process.exit(1);
  }

  try {
    const goals = JSON.parse(args[0]);
    const duration = parseInt(args[1]);

    if (!Array.isArray(goals) || goals.length === 0) {
      console.error('Invalid goals format. Expected non-empty array.');
      process.exit(1);
    }

    if (isNaN(duration) || duration <= 0) {
      console.error('Invalid duration. Expected positive number.');
      process.exit(1);
    }

    startMonitoring(goals, duration);
  } catch (error) {
    console.error('Failed to parse arguments:', error.message);
    process.exit(1);
  }
}

export { startMonitoring };