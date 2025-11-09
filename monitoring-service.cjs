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
  productiveChecks: 0,
  sessionStartTime: null,
  recentBlocks: [], // Array of {app, title, timestamp}
  totalBlockedTime: 0, // Total time blocked in milliseconds
  blockedAppsCount: 0, // Number of unique apps blocked
  blockedAppsSet: new Set(), // Set to track unique blocked apps
};

// Stats update interval
let statsUpdateInterval = null;

// AI System Prompts for different strictness levels
const SYSTEM_PROMPTS = {
  lenient: `
You are a lenient productivity AI. Your function is to determine if a user's activity is reasonably productive for their stated goal. Your response must ALWAYS be a single word: either YES or NO.

Guidelines:

Very Permissive: Allow most activities unless they are clearly entertainment or completely unrelated.
Assume Good Intent: Always give the benefit of doubt. If there's any chance it could be work-related, respond YES.
Educational Content: All learning, research, news, and industry content should be YES.
Tools & Utilities: Development tools, system utilities, reference sites are always YES.
Only Block: Pure entertainment (games, streaming, social media scrolling) when clearly non-work-related.

Examples:
GOAL: "Write a research paper"
ACTIVITY: "JSTOR" -> YES (supports research)
ACTIVITY: "YouTube - Educational Tutorial" -> YES (learning)
ACTIVITY: "Reddit - r/programming" -> YES (industry discussion)
ACTIVITY: "Netflix" -> NO (entertainment)
ACTIVITY: "Instagram" -> NO (social media)
`,
  balanced: `
You are a balanced productivity AI. Your function is to determine if a user's activity is reasonably productive for their stated goal. Your response must ALWAYS be a single word: either YES or NO.

Guidelines:

Reasonable Support: Respond YES if the activity directly supports the goal OR is a common secondary tool that aids focus (e.g., instrumental music, documentation).
Assume Good Intent: If the window title is ambiguous or technical (e.g., "npm start", "localhost:3000", "Untitled"), assume it is work-related and respond YES.
Block Obvious Distractions: Social media, entertainment sites, and clearly unrelated content are NO.
Consider Context: General browsing, news, and non-specific content should be questioned.

Examples:
GOAL: "Write a research paper"
ACTIVITY: "JSTOR" -> YES (supports research paper)
ACTIVITY: "Google Docs - Research Paper Draft" -> YES (supports goal)
ACTIVITY: "Reddit - r/askscience" -> YES (potentially supports goal)
ACTIVITY: "Reddit - r/funny" -> NO (does not support goal)
`,
  strict: `
You are a strict productivity AI. Your function is to determine if a user's activity is productive for their stated goal. Your response must ALWAYS be a single word: either YES or NO.

Guidelines:

High Standards: Only allow activities that are clearly and directly productive for the stated goal.
Question Everything: If there's any doubt about productivity, respond NO.
Direct Tools Only: Code editors, work documents, direct research related to goal are YES.
Block General Browsing: News, social media, general research, tutorials (unless directly goal-related) are NO.
No Ambiguity: Technical terms, localhost, or unclear activities should be NO unless explicitly work-related.

Examples:
GOAL: "Write a research paper"
ACTIVITY: "JSTOR - Research Database" -> YES (direct research)
ACTIVITY: "Google Docs - Paper Draft" -> YES (direct work)
ACTIVITY: "Stack Overflow - Programming Question" -> NO (off-topic)
ACTIVITY: "News Website" -> NO (general browsing)
ACTIVITY: "YouTube Tutorial" -> NO (learning, not doing)
`
};

// Default to balanced for backward compatibility
let currentStrictnessLevel = 'balanced';

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

    // Track unique blocked apps
    if (!sessionStats.blockedAppsSet.has(appName)) {
      sessionStats.blockedAppsSet.add(appName);
      sessionStats.blockedAppsCount = sessionStats.blockedAppsSet.size;
    }

    // Increment blocked time - assume minimum 30 seconds per block
    // This is a conservative estimate since the user was distracted long enough
    // to trigger a block and will have to dismiss the overlay
    sessionStats.totalBlockedTime += 30000; // 30 seconds in milliseconds

    // Add to recent blocks (keep last 10)
    sessionStats.recentBlocks.unshift({
      app: appName,
      title: windowInfo.title,
      timestamp: Date.now(),
    });

    if (sessionStats.recentBlocks.length > 10) {
      sessionStats.recentBlocks = sessionStats.recentBlocks.slice(0, 10);
    }
  } else {
    sessionStats.productiveChecks++;
  }
}

/**
 * Serialize session stats for IPC (convert Maps to Arrays)
 */
function serializeStats() {
  const topProductiveApps = Array.from(sessionStats.productiveApps.entries())
    .map(([app, count]) => ({ app, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topBlockedApps = Array.from(sessionStats.unproductiveApps.entries())
    .map(([app, count]) => ({ app, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalChecks: sessionStats.totalChecks,
    blockedAttempts: sessionStats.blockedAttempts,
    productiveChecks: sessionStats.productiveChecks,
    sessionStartTime: sessionStats.sessionStartTime,
    topProductiveApps,
    topBlockedApps,
    recentBlocks: sessionStats.recentBlocks,
    totalBlockedTime: sessionStats.totalBlockedTime,
    blockedAppsCount: sessionStats.blockedAppsCount,
  };
}

/**
 * Check if activity is productive using Gemini AI with caching
 */
async function checkProductivity(goal, windowInfo, sendToRenderer) {
  const enhancedInfo = getEnhancedActivityDescription(windowInfo);

  // Create cache key
  const goalString = goal.toLowerCase().trim();
  const cacheKey = `${goalString}:::${enhancedInfo.formattedInfo.toLowerCase().trim()}`;

  // Check cache first
  if (productivityCache.has(cacheKey)) {
    const cachedResult = productivityCache.get(cacheKey);
    console.log(`📋 ${enhancedInfo.title} - CACHE: ${cachedResult ? 'YES' : 'NO'}`);
    updateStats(enhancedInfo, cachedResult);
    return cachedResult;
  }

  const systemPrompt = SYSTEM_PROMPTS[currentStrictnessLevel] || SYSTEM_PROMPTS.balanced;

  const prompt = `${systemPrompt}

[USER REQUEST]
GOAL: "${goal}"
${enhancedInfo.formattedInfo}
YOUR RESPONSE:`;

  try {
    console.log(`📋 ${enhancedInfo.title} - AI: Checking...`);
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const response = await model.generateContent(prompt);

    const aiResponse = response.response.text()?.trim() || "";
    const isProductive = aiResponse.toUpperCase() === "YES";

    // Cache the result
    productivityCache.set(cacheKey, isProductive);
    console.log(`📋 ${enhancedInfo.title} - AI: ${isProductive ? 'YES' : 'NO'}`);

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
// Extract domain from URL
function extractDomain(url) {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    let domain = urlObj.hostname;
    // Remove www. prefix if present
    if (domain.startsWith('www.')) {
      domain = domain.substring(4);
    }
    return domain;
  } catch (error) {
    console.log('Could not parse URL:', url, error);
    return null;
  }
}

async function checkWhitelistAndCache(goal, enhancedInfo, __dirname) {
  const whitelistFile = join(__dirname, 'whitelist.txt');

  try {
    // Check if whitelist file exists and contains the current activity
    const fileExists = await fs.access(whitelistFile).then(() => true).catch(() => false);

    if (fileExists) {
      const whitelistedActivity = await fs.readFile(whitelistFile, 'utf8');

      // Extract domain for potential domain-based caching
      const domain = extractDomain(enhancedInfo.url);
      const windowTitle = enhancedInfo.title.trim().toLowerCase();
      const whitelistContent = whitelistedActivity.trim().toLowerCase();
      const appName = enhancedInfo.owner.name.trim().toLowerCase();

      // Enhanced matching - check for exact matches, partial matches, and domain matches
      let isMatch = false;
      let cacheType = '';

      if (domain && whitelistContent === domain) {
        // Domain-level whitelisting (new feature)
        isMatch = true;
        cacheType = 'domain';
      } else if (enhancedInfo.url && whitelistContent === enhancedInfo.url) {
        // Page-level whitelisting (specific URL match)
        isMatch = true;
        cacheType = 'page';
      } else if (
        windowTitle === whitelistContent || // Exact match
        windowTitle.includes(whitelistContent) || // Whitelist content is part of window title
        whitelistContent.includes(windowTitle) || // Window title is part of whitelist content
        appName === whitelistContent || // App name matches
        whitelistContent.includes(appName) // Whitelist includes app name
      ) {
        // Title-level whitelisting (existing functionality)
        isMatch = true;
        cacheType = 'title';
      }

      if (isMatch) {
        const goalString = goal.toLowerCase().trim();

        // Create cache keys for both title and domain
        const titleCacheKey = `${goalString}:::${enhancedInfo.formattedInfo.toLowerCase().trim()}`;

        // Always cache the specific window title
        productivityCache.set(titleCacheKey, true);

        // If it's a domain match, also cache all potential variations of this domain
        if (cacheType === 'domain' && domain) {
          // Create patterns that would match different pages from the same domain
          const domainPatterns = [
            `${goalString}:::*${domain.toLowerCase()}*`, // Domain anywhere in the activity
            `${goalString}:::*www.${domain.toLowerCase()}*`, // Domain with www prefix
          ];

          domainPatterns.forEach(pattern => {
            productivityCache.set(pattern, true);
          });
        } else if (cacheType === 'page' && enhancedInfo.url) {
          // For page-level whitelisting, cache the specific URL and title
          const urlCacheKey = `${goalString}:::*${enhancedInfo.url.toLowerCase()}*`;
          productivityCache.set(urlCacheKey, true);
        }

        // Clean up whitelist file after processing
        await fs.unlink(whitelistFile);

        return true; // Indicate that whitelist was processed
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
async function showBlockingOverlay(goal, windowInfo, __dirname, blockReason = 'ai') {
  return new Promise((resolve) => {
    const overlayPath = join(__dirname, 'overlay', 'main.cjs');
    const electronPath = process.execPath;

    const electronProcess = spawn(electronPath, [overlayPath], {
      stdio: 'ignore',
      detached: false,
      env: {
        ...process.env,
        BLOCK_GOAL: goal,
        BLOCK_ACTIVITY: windowInfo.title,
        BLOCK_APP: windowInfo.owner.name,
        BLOCK_CATEGORY: windowInfo.appCategory || 'Unknown',
        BLOCK_URL: windowInfo.url || '',
        BLOCK_REASON: blockReason,
        BLOCK_STATS_JSON: JSON.stringify({
          blocksStopped: sessionStats.blockedAttempts,
          sessionStartTime: sessionStats.sessionStartTime,
          totalBlockedTime: sessionStats.totalBlockedTime,
          blockedAppsCount: sessionStats.blockedAppsCount
        })
      },
      windowsHide: false
    });

    electronProcess.on('close', async () => {
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
    for (const pattern of patterns) {
      const trimmedPattern = pattern.trim();
      if (lowerTitle.includes(trimmedPattern) ||
          lowerApp.includes(trimmedPattern) ||
          lowerUrl.includes(trimmedPattern)) {
        return { type: 'whitelisted', item };
      }
    }
  }

  return { type: 'none' };
}

/**
 * Main monitoring loop
 */
async function startMonitoring(goals, duration, sendToRenderer, __dirname, whitelist = [], blocklist = [], strictnessLevel = 'balanced') {
  const goal = goals[0]; // Use first goal
  sessionStats.sessionStartTime = Date.now();

  // Set the strictness level for this session
  currentStrictnessLevel = strictnessLevel;

  console.log(`🎯 Monitoring started: "${goal}" (${strictnessLevel} mode)`);

  // Start periodic stats updates to renderer (every 5 seconds)
  if (sendToRenderer) {
    statsUpdateInterval = setInterval(() => {
      sendToRenderer('monitoring-stats-update', serializeStats());
    }, 5000);
  }

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
            await new Promise(resolve => setTimeout(resolve, pollInterval));
            continue;
          }

          // Only check productivity if window changed
          if (!previousWindow ||
              currentWindow.title !== previousWindow.title ||
              currentWindow.owner.name !== previousWindow.owner.name) {

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
              console.log(`📋 ${currentWindow.title} - BLOCKLIST: NO`);
              updateStats(enhancedInfo, false);

              // Send block event to renderer
              if (sendToRenderer) {
                sendToRenderer('activity-blocked', {
                  window: currentWindow.title,
                  app: currentWindow.owner.name,
                  category: enhancedInfo.appCategory,
                });
              }

              await showBlockingOverlay(goal, currentWindow, __dirname, 'blocklist');
            } else if (listCheck.type === 'whitelisted') {
              console.log(`📋 ${currentWindow.title} - WHITELIST: YES`);
              updateStats(enhancedInfo, true);
            } else {
              // Check whitelist file override (from "mark as productive" button)
              const whitelistProcessed = await checkWhitelistAndCache(goal, enhancedInfo, __dirname);

              if (whitelistProcessed) {
                console.log(`📋 ${currentWindow.title} - WHITELIST: YES (user override)`);
                updateStats(enhancedInfo, true);
              } else {
                // Check with AI
                const isProductive = await checkProductivity(goal, currentWindow, sendToRenderer);

                if (!isProductive) {
                  // Send block event to renderer
                  if (sendToRenderer) {
                    sendToRenderer('activity-blocked', {
                      window: currentWindow.title,
                      app: currentWindow.owner.name,
                      category: enhancedInfo.appCategory,
                    });
                  }

                  await showBlockingOverlay(goal, currentWindow, __dirname, 'ai');
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

      // Clear stats update interval
      if (statsUpdateInterval) {
        clearInterval(statsUpdateInterval);
        statsUpdateInterval = null;
      }

      console.log('🛑 Monitoring stopped');

      // Return final stats for analytics persistence
      return serializeStats();
    },
    getStats: () => serializeStats(),
  };
}

module.exports = {
  startMonitoring,
  sessionStats,
  serializeStats,
};
