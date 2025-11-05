const { GoogleGenerativeAI } = require("@google/generative-ai");
const { activeWindow } = require("get-windows");
const { spawn } = require("child_process");
const { join } = require("path");
const fs = require("fs/promises");

// Configure Gemini
const GEMINI_API_KEY = "AIzaSyDt7br2YQDhiuXAJd-M2oWit7M_7sKTOgY";
const ai = new GoogleGenerativeAI(GEMINI_API_KEY);

// Enhanced cache for AI productivity verdicts
const productivityCache = new Map();

// Session statistics
let sessionStats = {
  totalChecks: 0,
  productiveApps: new Map(),
  unproductiveApps: new Map(),
  timeByApp: new Map(),
  blockedAttempts: 0,
  sessionStartTime: null,
};

// AI System Prompt
const SYSTEM_PROMPT = `
You are a balanced productivity AI. Your function is to determine if a user's activity is reasonably productive for their stated goal. Your response must ALWAYS be a single word: either YES or NO.

Guidelines:

Reasonable Support: Respond YES if the activity directly supports the goal OR is a common secondary tool that aids focus (e.g., instrumental music, documentation).
Assume Good Intent: If the window title is ambiguous or technical (e.g., "npm start", "localhost:3000", "Untitled"), assume it is work-related and respond YES.
Block Obvious Distractions: Social media, entertainment sites, and clearly unrelated content are NO.
Example:

GOAL: "Write a research paper"
ACTIVITY: "JSTOR" -> YES (supports research paper)
ACTIVITY: "Google Docs - Research Paper Draft" -> YES (supports goal)
ACTIVITY: "Reddit - r/askscience" -> YES (potentially supports goal)
ACTIVITY: "Reddit - r/funny" -> NO (does not support goal)
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
 * Get enhanced activity description
 */
function getEnhancedActivityDescription(windowInfo) {
  const { title, owner, url, memoryUsage } = windowInfo;

  // Determine app category
  let appCategory = "Unknown";
  const ownerLower = owner.name.toLowerCase();

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
    formattedInfo: formatWindowInfo(windowInfo),
  };
}

/**
 * Update session statistics
 */
function updateStats(windowInfo, isProductive) {
  sessionStats.totalChecks++;

  const appName = windowInfo.owner.name;
  const appStats = isProductive ? sessionStats.productiveApps : sessionStats.unproductiveApps;

  appStats.set(appName, (appStats.get(appName) || 0) + 1);
  sessionStats.timeByApp.set(appName, (sessionStats.timeByApp.get(appName) || 0) + 1);

  if (!isProductive) {
    sessionStats.blockedAttempts++;
  }
}

/**
 * Check if activity is productive using Gemini AI with caching
 */
async function checkProductivity(goal, windowInfo, sendToRenderer) {
  const enhancedInfo = getEnhancedActivityDescription(windowInfo);

  // Create cache key
  const goalString = goal.toLowerCase().trim();
  const cacheKey = `${goalString}:::${enhancedInfo.formattedInfo.toLowerCase().trim()}`;
  console.log(`CACHE KEY: Generated cache key: "${cacheKey}"`);
  console.log(`CACHE: Current cache size: ${productivityCache.size} entries`);

  // Check cache first
  if (productivityCache.has(cacheKey)) {
    const cachedResult = productivityCache.get(cacheKey);
    console.log(`CACHE: HIT - Using cached verdict: ${cachedResult ? 'YES' : 'NO'} for key: ${cacheKey}`);
    updateStats(enhancedInfo, cachedResult);
    return cachedResult;
  } else {
    console.log(`CACHE: MISS - No cached result for key: ${cacheKey}`);
    console.log(`CACHE: Current cache entries:`, Array.from(productivityCache.entries()));
  }

  const prompt = `${SYSTEM_PROMPT}

[USER REQUEST]
GOAL: "${goal}"
${enhancedInfo.formattedInfo}
YOUR RESPONSE:`;

  try {
    console.log("AI: Calling AI API for new verdict...");
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const response = await model.generateContent(prompt);

    const aiResponse = response.response.text()?.trim() || "";
    console.log(`AI: Response: ${aiResponse}`);

    const isProductive = aiResponse.toUpperCase() === "YES";

    // Cache the result
    productivityCache.set(cacheKey, isProductive);
    console.log(`CACHE: Cached verdict for future reference: ${isProductive ? 'YES' : 'NO'} for key: ${cacheKey}`);

    updateStats(enhancedInfo, isProductive);

    // Send to renderer
    if (sendToRenderer) {
      sendToRenderer('monitoring-status-change', {
        isActive: true,
        currentWindow: {
          title: enhancedInfo.title,
          app: enhancedInfo.owner.name,
          category: enhancedInfo.appCategory,
          url: enhancedInfo.url,
        },
        sessionStats: {
          totalChecks: sessionStats.totalChecks,
          blockedAttempts: sessionStats.blockedAttempts,
          sessionStartTime: sessionStats.sessionStartTime,
        },
      });
    }

    return isProductive;
  } catch (error) {
    console.error(`ERROR: Failed to call Gemini API: ${error}`);
    updateStats(enhancedInfo, true);
    return true;
  }
}

/**
 * Check if user marked activity as productive and update cache accordingly
 */
async function checkWhitelistAndCache(goal, enhancedInfo, __dirname) {
  const whitelistFile = join(__dirname, 'whitelist.txt');

  try {
    // Check if whitelist file exists and contains the current activity
    const fileExists = await fs.access(whitelistFile).then(() => true).catch(() => false);

    if (fileExists) {
      const whitelistedActivity = await fs.readFile(whitelistFile, 'utf8');
      console.log(`CHECK: Found whitelist file with content: "${whitelistedActivity.trim()}"`);
      console.log(`CHECK: Comparing with current window: "${enhancedInfo.title.trim()}"`);

      // Flexible matching - check if the whitelist content matches the window
      const windowTitle = enhancedInfo.title.trim().toLowerCase();
      const whitelistContent = whitelistedActivity.trim().toLowerCase();
      const appName = enhancedInfo.owner.name.trim().toLowerCase();

      const isMatch =
        windowTitle === whitelistContent || // Exact match
        windowTitle.includes(whitelistContent) || // Whitelist content is part of window title
        whitelistContent.includes(windowTitle) || // Window title is part of whitelist content
        appName === whitelistContent || // App name matches
        whitelistContent.includes(appName); // Whitelist includes app name

      if (isMatch) {
        // Create the same cache key format as in checkProductivity
        const goalString = goal.toLowerCase().trim();
        const cacheKey = `${goalString}:::${enhancedInfo.formattedInfo.toLowerCase().trim()}`;

        // Force update cache to YES
        productivityCache.set(cacheKey, true);
        console.log(`SUCCESS: User marked "${enhancedInfo.title}" in ${enhancedInfo.owner.name} as productive - updated cache to YES`);
        console.log(`CACHE KEY: ${cacheKey}`);

        // Clean up whitelist file after processing
        await fs.unlink(whitelistFile);
        console.log(`CLEANUP: Removed whitelist file`);

        return true; // Indicate that whitelist was processed
      } else {
        console.log(`CHECK: No match found between whitelist and current window`);
      }
    }
  } catch (error) {
    console.log(`INFO: No whitelist override found or error reading whitelist file: ${error.message}`);
  }

  return false; // No whitelist processed
}

/**
 * Show blocking overlay
 */
async function showBlockingOverlay(goal, windowInfo, __dirname) {
  console.log("\n" + "=".repeat(50));
  console.log("BLOCKED: Activity not productive - showing blocking overlay!");
  console.log("=".repeat(50));
  console.log(`Window: ${windowInfo.title}`);
  console.log(`App: ${windowInfo.owner.name}`);
  console.log(`Goal: ${goal}`);
  console.log("=".repeat(50) + "\n");

  return new Promise((resolve) => {
    const overlayPath = join(__dirname, 'overlay', 'main.cjs');

    // Use process.execPath which gives us the electron executable path
    const electronPath = process.execPath;

    console.log(`Using electron path: ${electronPath}`);

    const electronProcess = spawn(electronPath, [overlayPath], {
      stdio: 'ignore',
      detached: false,
      env: {
        ...process.env,
        BLOCK_GOAL: goal,
        BLOCK_ACTIVITY: windowInfo.title,
        BLOCK_APP: windowInfo.owner.name,
        BLOCK_CATEGORY: windowInfo.appCategory || 'Unknown',
        BLOCK_STATS_JSON: JSON.stringify({
          blocksStopped: sessionStats.blockedAttempts,
          sessionStartTime: sessionStats.sessionStartTime
        })
      },
      windowsHide: false
    });

    electronProcess.on('close', async () => {
      console.log("SUCCESS: Blocking screen dismissed\n");

      // Check if user marked the activity as productive
      const enhancedInfo = getEnhancedActivityDescription(windowInfo);
      await checkWhitelistAndCache(goal, enhancedInfo, __dirname);

      resolve();
    });

    electronProcess.on('error', (error) => {
      console.error(`ERROR: Failed to show blocking screen: ${error.message}`);
      resolve();
    });
  });
}

/**
 * Check if window matches whitelist or blocklist
 */
function checkLists(windowTitle, appName, url, whitelist, blocklist) {
  const lowerTitle = windowTitle.toLowerCase();
  const lowerApp = appName.toLowerCase();
  const lowerUrl = url?.toLowerCase() || '';

  console.log(`CHECK: Checking lists for: "${lowerTitle}" (${lowerApp})`);
  console.log(`LIST: Whitelist has ${whitelist.length} items:`, whitelist.map(w => ({name: w.name, pattern: w.pattern})));
  console.log(`LIST: Blocklist has ${blocklist.length} items:`, blocklist.map(b => ({name: b.name, pattern: b.pattern})));

  // Check blocklist first - if blocked, always block
  for (const item of blocklist) {
    const patterns = item.pattern.toLowerCase().split('|');
    for (const pattern of patterns) {
      const trimmedPattern = pattern.trim();
      if (lowerTitle.includes(trimmedPattern) ||
          lowerApp.includes(trimmedPattern) ||
          lowerUrl.includes(trimmedPattern)) {
        return { type: 'blocked', item };
      }
    }
  }

  // Check whitelist - if whitelisted, always allow
  for (const item of whitelist) {
    const patterns = item.pattern.toLowerCase().split('|');
    console.log(`CHECK: Testing whitelist item: ${item.name} with patterns:`, patterns);
    for (const pattern of patterns) {
      const trimmedPattern = pattern.trim();
      console.log(`CHECK: Testing pattern "${trimmedPattern}" against app "${lowerApp}" and title "${lowerTitle}"`);
      if (lowerTitle.includes(trimmedPattern) ||
          lowerApp.includes(trimmedPattern) ||
          lowerUrl.includes(trimmedPattern)) {
        console.log(`ALLOWED: WHITELISTED - Matched pattern "${trimmedPattern}" in ${item.name}`);
        return { type: 'whitelisted', item };
      }
    }
  }

  return { type: 'none' };
}

/**
 * Main monitoring loop
 */
async function startMonitoring(goals, duration, sendToRenderer, __dirname, whitelist = [], blocklist = []) {
  const goal = goals[0]; // Use first goal
  sessionStats.sessionStartTime = Date.now();

  console.log(`GOAL: Starting monitoring for goal: ${goal}`);
  console.log(`DURATION: ${duration} minutes`);
  console.log(`LIST: Whitelist: ${whitelist.length} items`);
  console.log(`LIST: Blocklist: ${blocklist.length} items`);

  let previousWindow = null;
  const pollInterval = 1000; // Check every second
  let isRunning = true;

  const monitoringLoop = async () => {
    while (isRunning) {
      try {
        const currentWindow = await activeWindow();

        if (currentWindow) {
          // Check if window is FlowState itself - always whitelist
          if (currentWindow.owner.name.toLowerCase().includes('flowstate') ||
              currentWindow.title.toLowerCase().includes('flowstate')) {
            console.log('ALLOWED: FlowState detected - whitelisted');
            await new Promise(resolve => setTimeout(resolve, pollInterval));
            continue;
          }

          // Only check productivity if window changed
          if (!previousWindow ||
              currentWindow.title !== previousWindow.title ||
              currentWindow.owner.name !== previousWindow.owner.name) {

            console.log(`\nCHECK: Window: ${currentWindow.title} (${currentWindow.owner.name})`);

            // Check whitelist/blocklist first
            const listCheck = checkLists(
              currentWindow.title,
              currentWindow.owner.name,
              currentWindow.url,
              whitelist,
              blocklist
            );

            const enhancedInfo = getEnhancedActivityDescription(currentWindow);

            if (listCheck.type === 'blocked') {
              console.log(`BLOCKED: BLOCKLISTED - ${listCheck.item.name} - always blocked`);
              updateStats(enhancedInfo, false);

              // Send block event to renderer
              if (sendToRenderer) {
                sendToRenderer('activity-blocked', {
                  window: currentWindow.title,
                  app: currentWindow.owner.name,
                  category: enhancedInfo.appCategory,
                });
              }

              await showBlockingOverlay(goal, currentWindow, __dirname);
            } else if (listCheck.type === 'whitelisted') {
              console.log(`ALLOWED: WHITELISTED - ${listCheck.item.name} - always allowed`);
              updateStats(enhancedInfo, true);
              console.log("SUCCESS: Productive activity (whitelisted) - continuing...\n");
            } else {
              // Check whitelist file override (from "mark as productive" button)
              console.log("CHECK: Checking whitelist file override...");
              const whitelistProcessed = await checkWhitelistAndCache(goal, enhancedInfo, __dirname);

              if (whitelistProcessed) {
                console.log("SUCCESS: Whitelist override applied - activity marked as productive");
                updateStats(enhancedInfo, true);
                console.log("SUCCESS: Productive activity (whitelisted) - continuing...\n");
              } else {
                // Check with AI
                console.log("AI CHECK: Checking productivity with AI...");
                const isProductive = await checkProductivity(goal, currentWindow, sendToRenderer);

                if (isProductive) {
                  console.log("SUCCESS: Productive activity\n");
                } else {
                  // Send block event to renderer
                  if (sendToRenderer) {
                    sendToRenderer('activity-blocked', {
                      window: currentWindow.title,
                      app: currentWindow.owner.name,
                      category: enhancedInfo.appCategory,
                    });
                  }

                  await showBlockingOverlay(goal, currentWindow, __dirname);
                }
              }
            }

            previousWindow = currentWindow;
          }
        }

        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (error) {
        console.error(`ERROR: Error in monitoring loop: ${error}`);
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }
  };

  // Start the loop
  monitoringLoop();

  return {
    stop: () => {
      isRunning = false;
      console.log('STOP: Monitoring stopped');
    },
    getStats: () => sessionStats,
  };
}

module.exports = {
  startMonitoring,
  sessionStats,
};
