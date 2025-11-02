import { GoogleGenerativeAI } from "@google/generative-ai";
import { activeWindow, openWindows } from "get-windows";
import * as readline from "readline";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createRequire } from "module";
import * as fs from "fs/promises";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure Gemini
const GEMINI_API_KEY = "AIzaSyDt7br2YQDhiuXAJd-M2oWit7M_7sKTOgY";
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
}

/**
 * Display detailed session statistics
 */
function displaySessionStats() {
  console.log("\n" + "=".repeat(60));
  console.log("📊 SESSION STATISTICS");
  console.log("=".repeat(60));

  const sessionDuration = sessionStats.sessionStartTime
    ? Math.round((Date.now() - sessionStats.sessionStartTime) / 1000 / 60)
    : 0;

  console.log(`⏱️ Session Duration: ${sessionDuration} minutes`);
  console.log(`🔍 Total Checks: ${sessionStats.totalChecks}`);
  console.log(`🚫 Blocked Attempts: ${sessionStats.blockedAttempts}`);
  console.log(`💾 AI Cache Size: ${productivityCache.size} entries`);

  // Top productive apps
  if (sessionStats.productiveApps.size > 0) {
    console.log("\n✅ Most Productive Apps:");
    const sortedProductive = Array.from(sessionStats.productiveApps.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    sortedProductive.forEach(([app, count], index) => {
      console.log(`   ${index + 1}. ${app} (${count} checks)`);
    });
  }

  // Top distractions
  if (sessionStats.unproductiveApps.size > 0) {
    console.log("\n🚫 Most Blocked Apps:");
    const sortedUnproductive = Array.from(sessionStats.unproductiveApps.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    sortedUnproductive.forEach(([app, count], index) => {
      console.log(`   ${index + 1}. ${app} (${count} blocks)`);
    });
  }

  console.log("=".repeat(60));
}

/**
 * Check if user marked activity as productive and update cache accordingly
 */
async function checkWhitelistAndCache(goals, enhancedInfo) {
  const whitelistFile = join(__dirname, 'whitelist.txt');

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

    const overlayPath = join(__dirname, 'overlay', 'main.cjs');

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
 * Get the user's current task/goal
 */
async function getUserTask() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("\n" + "=".repeat(60));
  console.log("🎯 FLOWSTATE - ADVANCED PRODUCTIVITY MONITOR");
  console.log("Enhanced with get-windows for detailed window analysis");
  console.log("=".repeat(60));

  return new Promise((resolve) => {
    rl.question("What are your current tasks/goals today? (separate with commas)\n➜ ", (answer) => {
      const goals = answer.trim().split(',').map(goal => goal.trim()).filter(goal => goal.length > 0);
      console.log(`\n✅ Tasks set: ${goals.join(', ')}`);
      console.log(`📊 Monitoring ${goals.length} task${goals.length > 1 ? 's' : ''}`);
      console.log("Starting enhanced activity monitoring...\n");
      console.log("🔍 Features: App categorization, memory tracking, URL detection");
      console.log("📊 Features: Detailed analytics");
      console.log("\nMonitoring your activities...\n");
      rl.close();
      resolve(goals);
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
 * Display all open windows (diagnostic feature)
 */
async function displayAllWindows() {
  try {
    const windows = await openWindows();
    console.log("\n📋 All Open Windows:");
    windows.slice(0, 10).forEach((window, index) => {
      console.log(`${index + 1}. ${window.title} (${window.owner.name})`);
    });
    if (windows.length > 10) {
      console.log(`... and ${windows.length - 10} more windows`);
    }
  } catch (error) {
    console.log(`❌ Error getting open windows: ${error}`);
  }
}

/**
 * Wait for specified seconds
 */
function sleep(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

/**
 * Main app loop - monitors window changes in real-time with enhanced features
 */
async function main() {
  const goals = await getUserTask();
  sessionStats.sessionStartTime = Date.now();

  console.log("🔄 Window changes will be detected instantly");
  console.log("📊 Detailed statistics will be shown at the end");
  console.log("Press Ctrl+C to stop or type 'stats' to see current statistics\n");

  let checkCount = 0;
  let previousWindow = null;
  const pollInterval = 1000; // Check every 1 second for responsive detection

  // Handle graceful shutdown and commands
  process.on("SIGINT", () => {
    console.log("\n\n👋 Productivity session ended. Stay focused!");
    displaySessionStats();
    process.exit(0);
  });

  // Handle stdin for commands
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  process.stdin.on('data', (key) => {
    // Ctrl+C
    if (key === '\u0003') {
      console.log("\n\n👋 Productivity session ended. Stay focused!");
      displaySessionStats();
      process.exit(0);
    }
    // 's' key for stats
    if (key === 's') {
      console.log("\n" + "=".repeat(40));
      console.log("📊 CURRENT STATISTICS");
      console.log("=".repeat(40));
      console.log(`⏱️ Session: ${Math.round((Date.now() - sessionStats.sessionStartTime) / 1000 / 60)} minutes`);
      console.log(`🔍 Checks: ${sessionStats.totalChecks}`);
      console.log(`🚫 Blocks: ${sessionStats.blockedAttempts}`);
      console.log(`💾 Cache: ${productivityCache.size} entries`);
      console.log("=".repeat(40) + "\n");
    }
    // 'w' key for windows
    if (key === 'w') {
      displayAllWindows();
    }
    // 'd' key for debug whitelist
    if (key === 'd') {
      (async () => {
        console.log("\n" + "=".repeat(40));
        console.log("🐛 DEBUG WHITELIST");
        console.log("=".repeat(40));

        const whitelistFile = join(__dirname, 'whitelist.txt');
        try {
          const fileExists = await fs.access(whitelistFile).then(() => true).catch(() => false);
          if (fileExists) {
            const content = await fs.readFile(whitelistFile, 'utf8');
            console.log(`📄 Whitelist file exists with content: "${content.trim()}"`);
          } else {
            console.log(`📄 Whitelist file does not exist`);
          }
        } catch (error) {
          console.log(`❌ Error checking whitelist file: ${error.message}`);
        }

        console.log(`💾 Current cache size: ${productivityCache.size} entries`);
        if (productivityCache.size > 0) {
          console.log(`🔑 Recent cache entries:`);
          Array.from(productivityCache.entries()).slice(-5).forEach(([key, value]) => {
            console.log(`   ${value ? '✅' : '❌'} ${key.substring(0, 80)}...`);
          });
        }

        console.log("=".repeat(40) + "\n");
      })();
    }
    // 'h' key for help
    if (key === 'h') {
      console.log("\n" + "=".repeat(40));
      console.log("📖 HELP");
      console.log("=".repeat(40));
      console.log("s - show statistics");
      console.log("w - show all open windows");
      console.log("d - debug whitelist and cache");
      console.log("h - show this help");
      console.log("Ctrl+C - exit session");
      console.log("=".repeat(40) + "\n");
    }
  });

  try {
    while (true) {
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
        const enhancedInfo = getEnhancedActivityDescription(currentWindow);
        const whitelistProcessed = await checkWhitelistAndCache(goal, enhancedInfo);

        if (whitelistProcessed) {
          console.log("✅ Whitelist override applied - activity marked as productive");
          // Update stats for the productive activity
          updateStats(enhancedInfo, true);
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
    console.error(`\n❌ Error in main loop: ${error}`);
    displaySessionStats();
    process.exit(1);
  }
}

// Run the app
main();