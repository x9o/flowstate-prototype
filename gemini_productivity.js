import { GoogleGenerativeAI } from "@google/generative-ai";
import activeWin from "active-win";
import * as readline from "readline";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createRequire } from "module";
import * as fs from "fs/promises";
import "dotenv/config";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY environment variable is required');
  process.exit(1);
}
const ai = new GoogleGenerativeAI(GEMINI_API_KEY);

// Cache for AI productivity verdicts to avoid repeated API calls
const productivityCache = new Map();

// AI System Prompt (same as gemini_productivity.py)
const SYSTEM_PROMPT = `You are a strict but fair productivity AI. Your only function is to determine if a user's activity is productive based on their stated goal. 
Your response must ALWAYS be a single word: either YES or NO — no punctuation, no explanations.

If the window title is ambiguous, technical, or unclear (e.g. "npm start", "localhost:3000", "New Tab", "Untitled", random characters, file hashes, encrypted names), 
you should assume it *may* be related to the user's work and respond with YES. Only respond with NO if the activity is clearly unrelated or distracting.

Be cautious not to block legitimate tools, terminals, editors, or development environments.

---

[GUIDELINES]
1. Respond YES if the activity reasonably supports or could support the goal.
2. Respond NO only when the activity is obviously unrelated or distracting (e.g. social media, entertainment, memes, unrelated browsing).
3. For system processes, developer tools, or ambiguous titles (e.g. "npm start", "Error", "Explorer", "Visual Studio Code", "Terminal", "Documents"), default to YES.
4. For unclear or random titles, default to YES to avoid false positives.
5. You must never output anything except YES or NO.

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
---

[EXAMPLE 5]
GOAL: "Build a portfolio website."
ACTIVITY: "npm start"
YOUR RESPONSE:
YES
---

[EXAMPLE 6]
GOAL: "Write a math essay."
ACTIVITY: "2h14f98ad1.tmp"
YOUR RESPONSE:
YES
---

[EXAMPLE 7]
GOAL: "Study biology notes."
ACTIVITY: "TikTok - Trending Now"
YOUR RESPONSE:
NO
---`;


/**
 * Check if activity is productive relative to goal using Gemini AI with caching
 */
async function checkProductivity(goal, activity) {
  // Create a cache key combining goal and activity
  const cacheKey = `${goal.toLowerCase().trim()}:::${activity.toLowerCase().trim()}`;

  // Check if we already have a cached verdict
  if (productivityCache.has(cacheKey)) {
    const cachedResult = productivityCache.get(cacheKey);
    console.log(`📋 Using cached verdict: ${cachedResult ? 'YES' : 'NO'}`);
    return cachedResult;
  }

  const prompt = `${SYSTEM_PROMPT}

[USER REQUEST]
GOAL: "${goal}"
ACTIVITY: "${activity}"
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

    return isProductive;
  } catch (error) {
    console.error(`❌ Error calling Gemini API: ${error}`);
    // Default to allowing activity if API fails
    return true;
  }
}

/**
 * Check if user marked activity as productive and update cache accordingly
 */
async function checkWhitelistAndCache(goal, activity) {
  const whitelistFile = join(__dirname, 'whitelist.txt');

  try {
    // Check if whitelist file exists and contains the current activity
    const fileExists = await fs.access(whitelistFile).then(() => true).catch(() => false);

    if (fileExists) {
      const whitelistedActivity = await fs.readFile(whitelistFile, 'utf8');

      // If the activity matches what was whitelisted, update cache to YES
      if (whitelistedActivity.trim() === activity.trim()) {
        const cacheKey = `${goal.toLowerCase().trim()}:::${activity.toLowerCase().trim()}`;
        productivityCache.set(cacheKey, true);
        console.log(`✅ User marked "${activity}" as productive - updated cache to YES`);

        // Clean up whitelist file after processing
        await fs.unlink(whitelistFile);
        console.log(`🗑️ Cleaned up whitelist file`);
      }
    }
  } catch (error) {
    // Ignore errors reading whitelist file (it might not exist or be inaccessible)
    console.log(`ℹ️ No whitelist override found for "${activity}"`);
  }
}

/**
 * Show blocking overlay using Electron
 */
async function simulateBlocking(goal, activity) {
  console.log("\n" + "=".repeat(50));
  console.log("🚫 BLOCKING ACTIVITY - NOT PRODUCTIVE!");
  console.log("=".repeat(50));
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

    // Spawn Electron process with goal and activity as arguments
    const electronProcess = spawn(electronPath, [
      overlayPath,
      '--goal', goal,
      '--activity', activity
    ], {
      stdio: 'ignore',
      detached: false
    });

    electronProcess.on('close', async (code) => {
      console.log("✅ Blocking screen dismissed. Back to monitoring...\n");

      // Check if user marked the activity as productive
      await checkWhitelistAndCache(goal, activity);

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
  console.log("🎯 PRODUCTIVITY APP - FOCUS PROTECTOR");
  console.log("=".repeat(60));

  return new Promise((resolve) => {
    rl.question("What is your current task/goal today?\n➜ ", (answer) => {
      const goal = answer.trim();
      console.log(`\n✅ Goal set: ${goal}`);
      console.log("Starting activity monitoring...\n");
      rl.close();
      resolve(goal);
    });
  });
}

/**
 * Detect the currently active window using active-win
 */
async function detectActiveWindow(silent = false) {
  try {
    const window = await activeWin();

    if (window && window.title) {
      const windowTitle = window.title.trim();
      if (windowTitle) {
        if (!silent) console.log(`🔍 Detected Activity: ${windowTitle}`);
        return windowTitle;
      } else {
        if (!silent) console.log(`🔍 Detected Activity: [Untitled Window]`);
        return "[Untitled Window]";
      }
    } else {
      if (!silent) console.log("🔍 Detected Activity: [No active window]");
      return "[No active window]";
    }
  } catch (error) {
    if (!silent) console.log(`🔍 Detected Activity: [Error detecting window - ${error}]`);
    return "[Error detecting window]";
  }
}

/**
 * Display cache statistics
 */
function displayCacheStats() {
  const cacheSize = productivityCache.size;
  if (cacheSize > 0) {
    console.log(`📊 Cache: ${cacheSize} cached verdict(s) stored`);
  }
}

/**
 * Wait for specified seconds
 */
function sleep(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

/**
 * Main app loop - monitors window changes in real-time
 */
async function main() {
  const goal = await getUserTask();

  console.log("\nMonitoring your activities...\n");
  console.log("🔄 Window changes will be detected instantly\n");
  console.log("Press Ctrl+C to stop\n");

  let checkCount = 0;
  let previousWindow = "";
  const pollInterval = 1000; // Check every 500ms for responsive detection

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n\n👋 Productivity session ended. Stay focused!");
    console.log(`Total window changes detected: ${checkCount}`);
    displayCacheStats();
    process.exit(0);
  });

  try {
    while (true) {
      // Detect current active window (silent polling)
      const currentWindow = await detectActiveWindow(true);

      // Only check productivity if window changed
      if (currentWindow !== previousWindow) {
        checkCount++;
        console.log(`\n[Window Change #${checkCount}]`);
        console.log(`🔍 Detected Activity: ${currentWindow}`);

        // Check with AI
        console.log("🤔 Checking productivity...");
        const isProductive = await checkProductivity(goal, currentWindow);

        // Display cache stats periodically
        if (checkCount % 5 === 0) {
          displayCacheStats();
        }

        if (isProductive) {
          console.log("✅ Productive activity detected - continuing...\n");
        } else {
          await simulateBlocking(goal, currentWindow);
        }

        previousWindow = currentWindow;
      }

      // Short sleep to prevent excessive CPU usage while still being responsive
      await sleep(pollInterval / 1000);
    }
  } catch (error) {
    console.error(`\n❌ Error in main loop: ${error}`);
    process.exit(1);
  }
}

// Run the app
main();
