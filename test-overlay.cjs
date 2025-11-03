const { spawn } = require('child_process');
const path = require('path');

// Test script to show only the blocking overlay
console.log('🎭 Testing FlowState Overlay Only');
console.log('=====================================');

// Get the electron executable path - on Windows it's in node_modules/electron/dist/
const electronPath = path.join(__dirname, 'node_modules', 'electron', 'dist', 'electron.exe');
console.log('Electron path:', electronPath);
const overlayPath = path.join(__dirname, 'overlay', 'main.cjs');

// Test data for the overlay
const testData = {
  goal: 'Test presentation deck',
  activity: 'Reddit - r/funny memes',
  app: 'Chrome',
  category: 'Social Media',
  blocksStopped: 3,
  sessionStartTime: Date.now() - (15 * 60 * 1000) // 15 minutes ago
};

console.log('📊 Test Data:');
console.log('Goal:', testData.goal);
console.log('Activity:', testData.activity);
console.log('App:', testData.app);
console.log('Blocks Stopped:', testData.blocksStopped);
console.log('Session Start Time:', new Date(testData.sessionStartTime).toLocaleTimeString());

// Spawn the overlay process
const overlayProcess = spawn(electronPath, [overlayPath], {
  stdio: 'inherit',
  detached: false,
  env: {
    ...process.env,
    BLOCK_GOAL: testData.goal,
    BLOCK_ACTIVITY: testData.activity,
    BLOCK_APP: testData.app,
    BLOCK_CATEGORY: testData.category,
    BLOCK_STATS_JSON: JSON.stringify({
      blocksStopped: testData.blocksStopped,
      sessionStartTime: testData.sessionStartTime
    })
  },
  windowsHide: false
});

overlayProcess.on('close', (code) => {
  console.log(`\n✅ Overlay test completed with code: ${code}`);
  process.exit(0);
});

overlayProcess.on('error', (error) => {
  console.error(`❌ Failed to start overlay: ${error.message}`);
  process.exit(1);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted by user');
  overlayProcess.kill();
  process.exit(0);
});

console.log('\n🚀 Starting overlay test...');
console.log('💡 Press ESC or click "Back to Work" to close the overlay');
console.log('💡 Press Ctrl+C to kill the test process');