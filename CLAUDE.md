# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FlowState is an **Electron-based productivity application** that uses **AI-powered monitoring** to help users maintain focus by intelligently blocking distractions. Unlike traditional blockers, it understands user intent through Gemini AI and adapts blocking behavior to the user's stated goals.

**Core Concept**: Users enter a goal/task → FlowState monitors active windows → AI determines if activity is productive → Blocks unproductive apps with a fullscreen overlay.

## Essential Commands

### Development
```bash
npm run electron:dev    # Start Electron app with hot reload (requires port 8080)
npm run dev            # Start Vite dev server only (port 8080)
npm run build          # Build React app for production
npm run lint           # Run ESLint
```

### Production Build
```bash
npm run electron:pack  # Build and package distributable (auto-runs build first)
npm run electron:dist  # Build without publishing
```

### Important Notes
- **Port 8080 is required** - Vite config uses `strictPort: true`, so dev server will fail if 8080 is in use
- Always close other dev servers on 8080 before running `electron:dev`
- The app uses `concurrently` to run both Vite and Electron simultaneously

## Architecture Overview

### Three-Process Architecture

1. **Electron Main Process** (`electron.cjs`)
   - Manages app lifecycle and window creation
   - Handles IPC communication between renderer and monitoring service
   - Controls monitoring start/stop and passes whitelist/blocklist to service
   - Minimizes FlowState window when monitoring starts

2. **React Renderer Process** (`src/`)
   - UI built with React 18 + TypeScript + Tailwind CSS
   - Uses React Router for navigation (HashRouter for Electron compatibility)
   - Context-based state management (Theme, Monitoring, Lists)

3. **Monitoring Service** (`monitoring-service.cjs`)
   - Runs in main process, called by `electron.cjs`
   - Polls active window every 1 second using `get-windows` package
   - Implements priority-based checking system (see below)
   - Spawns blocking overlay as separate Electron process

### Blocking Decision Priority (Monitoring Service)

The monitoring service checks windows in this order:

1. **FlowState itself** → Always whitelisted (never checked)
2. **User Blocklist** → If matched, always blocked (no AI call)
3. **User Whitelist** → If matched, always allowed (no AI call)
4. **"Mark as Productive" cache** → Temporary whitelist from overlay button
5. **AI Productivity Check** → Gemini API with caching

### Data Flow for Monitoring Session

```
User clicks "Start Focusing" in UI
  ↓
Index.tsx calls startMonitoring(goals, duration, whitelist, blocklist)
  ↓
MonitoringContext sends IPC to electron.cjs
  ↓
electron.cjs calls startMonitoringService() from monitoring-service.cjs
  ↓
monitoring-service.cjs polls active window every 1 second
  ↓
For each window change:
  - Check priority list (FlowState → Blocklist → Whitelist → Cache → AI)
  - If unproductive: spawn overlay/main.cjs as new Electron window
  - Overlay reads data from ENVIRONMENT VARIABLES (not args - Unicode support)
```

### Key Files

**Main Process:**
- `electron.cjs` - Electron main process entry point
- `monitoring-service.cjs` - Core monitoring logic with AI integration
- `preload.cjs` - Context bridge for secure IPC

**Overlay System:**
- `overlay/main.cjs` - Blocking overlay Electron process
- `overlay/blocking.html` - Overlay UI
- `overlay/preload.cjs` - Overlay IPC bridge

**React App:**
- `src/App.tsx` - App root with providers (Theme, Monitoring, Lists)
- `src/pages/Index.tsx` - Main dashboard with goal input and task list
- `src/pages/Lists.tsx` - Combined whitelist/blocklist management
- `src/pages/Settings.tsx` - Settings page
- `src/contexts/` - React contexts for global state
  - `ThemeContext.tsx` - Light/dark mode
  - `MonitoringContext.tsx` - Monitoring session state + IPC bridge
  - `ListsContext.tsx` - Whitelist/blocklist with localStorage persistence

## Critical Implementation Details

### Unicode/Emoji Support in Overlay

**Important**: Window titles are passed to the blocking overlay via **environment variables**, NOT command-line arguments.

```javascript
// ✅ Correct (in monitoring-service.cjs)
spawn(electronPath, [overlayPath], {
  env: {
    BLOCK_GOAL: goal,
    BLOCK_ACTIVITY: windowInfo.title,  // Handles Unicode properly
    BLOCK_APP: windowInfo.owner.name
  }
})

// ❌ Wrong (causes garbled text on Windows)
spawn(electronPath, [overlayPath, '--activity', windowInfo.title])
```

In `overlay/main.cjs`, read from `process.env.BLOCK_*` variables, not `process.argv`.

### Whitelist/Blocklist Pattern Matching

Patterns support **OR logic** with `|` separator:
```javascript
pattern: "notion|notes"  // Matches "notion" OR "notes" in title/app/URL
```

Matching is case-insensitive and checks:
- Window title
- App name
- URL (for browsers)

### AI Caching System

The monitoring service caches AI verdicts using this key format:
```javascript
const cacheKey = `${goal.toLowerCase()}:::${windowInfo.formattedInfo.toLowerCase()}`
productivityCache.set(cacheKey, isProductive)  // true/false
```

Cache persists for the entire session and reduces Gemini API calls significantly.

### "Mark as Productive" Button

When user clicks "Mark as Productive" in overlay:
1. Overlay writes window title to `whitelist.txt`
2. Overlay closes
3. Monitoring service reads `whitelist.txt` on overlay close
4. Matches content with current window
5. Updates AI cache to `YES` for that goal+window combination
6. Deletes `whitelist.txt`

This provides **session-scoped whitelisting** - cache persists until monitoring stops.

## State Management

### Context Architecture

**ThemeContext** (`src/contexts/ThemeContext.tsx`)
- Manages light/dark theme with localStorage persistence
- Notifies Electron main process of theme changes via IPC

**MonitoringContext** (`src/contexts/MonitoringContext.tsx`)
- Bridge between React and Electron IPC
- Exposes: `startMonitoring()`, `stopMonitoring()`, `monitoringState`
- Listens for IPC events: `monitoring-status-change`, `activity-blocked`, `monitoring-error`

**ListsContext** (`src/contexts/ListsContext.tsx`)
- Manages whitelist/blocklist with localStorage
- Default entries loaded on first run
- Exposes: `whitelist`, `blocklist`, `addToWhitelist()`, `removeFromWhitelist()`, etc.
- Helper functions: `isWhitelisted()`, `isBlocklisted()` for pattern matching

### IPC Communication

**Renderer → Main:**
```javascript
window.electronAPI.startMonitoring(goals, duration, whitelist, blocklist)
window.electronAPI.stopMonitoring()
```

**Main → Renderer:**
```javascript
mainWindow.webContents.send('monitoring-status-change', data)
mainWindow.webContents.send('activity-blocked', data)
```

## Styling System

### Design Tokens
- Primary colors: `mint`, `indigo`, `peach`, `sky`, `lavender`
- Defined in `tailwind.config.ts` and `src/index.css`
- Theme-aware with HSL color variables

### Key Patterns
- **Non-selectable text**: Global `user-select: none` with input exceptions
- **Responsive design**: Mobile-first with `sm:`, `md:`, `lg:` breakpoints
- **Radix UI**: All interactive components use Radix primitives for accessibility
- **react-icons**: Brand icons from Simple Icons (imported from `react-icons/si`)

### Icons
- **Lucide React** for general UI icons (Play, Square, List, etc.)
- **Simple Icons** (`react-icons/si`) for brand/app icons in Lists page
  - Example: `SiNotion`, `SiSlack`, `SiInstagram`
  - Dynamically loaded: `const IconComponent = SimpleIcons[iconName]`

## Common Development Patterns

### Adding a New Page
1. Create page in `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx`:
   ```tsx
   <Route path="/newpage" element={<NewPage />} />
   ```
3. Add navigation in `src/components/Sidebar.tsx`

### Modifying Monitoring Logic
- **Always update** `monitoring-service.cjs` (NOT `gemini_productivity_enhanced.js`)
- `gemini_productivity_enhanced.js` is the old CLI version - NOT used by Electron app
- Test with real window switching to verify AI calls and caching

### Adding Default Whitelist/Blocklist Entry
Edit `DEFAULT_WHITELIST` or `DEFAULT_BLOCKLIST` in `src/contexts/ListsContext.tsx`:
```typescript
{ name: 'App Name', type: 'app', pattern: 'pattern|alternate', icon: 'SiIconName' }
```

Users must clear localStorage to see new defaults (or migration logic needed).

## Known Issues & Quirks

### Port Conflicts
- Vite uses port 8080 with `strictPort: true`
- If port is in use, dev server fails instead of trying next port
- **Solution**: Kill processes on 8080 before running `electron:dev`

### FlowState Window Minimization
- Window automatically minimizes when monitoring starts
- This is intentional - prevents FlowState from being the "active window"
- FlowState is always whitelisted from its own detection

### Overlay Unicode
- Must use environment variables, not command-line args
- Affects: goal, activity title, app name, category
- See "Unicode/Emoji Support" section above

## File Organization

```
flowstate-ui/
├── electron.cjs              # Main process entry
├── monitoring-service.cjs    # AI monitoring logic (USED)
├── gemini_productivity_enhanced.js  # Old CLI version (NOT USED)
├── preload.cjs              # Main window IPC bridge
├── overlay/                 # Blocking overlay system
│   ├── main.cjs            # Overlay Electron process
│   ├── blocking.html       # Overlay UI
│   └── preload.cjs         # Overlay IPC bridge
├── src/
│   ├── App.tsx             # Root with providers
│   ├── contexts/           # React contexts (Theme, Monitoring, Lists)
│   ├── pages/              # Route pages (Index, Lists, Settings)
│   ├── components/         # Reusable components
│   │   ├── Sidebar.tsx    # Navigation sidebar
│   │   └── ui/            # Radix UI wrappers (48+ components)
│   ├── types/             # TypeScript interfaces
│   └── index.css          # Global styles + design tokens
├── public/                # Static assets
└── dist/                  # Vite build output
```

## Testing Monitoring System

### Quick Test Checklist
1. Start app: `npm run electron:dev`
2. Enter goal: "test goal"
3. Click "Start Focusing" → Window minimizes
4. Switch to blocked app (YouTube, Instagram, etc.)
5. Verify overlay appears
6. Test "Mark as Productive" button
7. Switch back to same app → Should NOT block again
8. Check terminal for logs:
   - "✅ WHITELISTED" or "🚫 BLOCKLISTED" for list matches
   - "🤖 Calling AI API" for new AI checks
   - "📋 Using cached verdict" for repeated windows

## AI System Configuration

**Current Model**: `gemini-2.5-flash-lite`
**API Key**: Stored in `monitoring-service.cjs` (line 8)

**System Prompt**: "Balanced" mode is currently active
- Located in `monitoring-service.cjs` lines 24-40
- Assumes good intent for ambiguous windows
- Blocks obvious distractions

To change AI sensitivity, modify `SYSTEM_PROMPT` in `monitoring-service.cjs`.

## Build & Distribution

**Build Output**: `release/` directory (gitignored)
**Supported Platforms**: Windows (NSIS), macOS (DMG), Linux (AppImage)

The build includes:
- `dist/` (React build)
- `electron.cjs`, `preload.cjs`, `monitoring-service.cjs`
- `overlay/` directory
- `node_modules/` (pruned)

## Future Considerations

When implementing these features from README.md:
- **Pomodoro Mode**: Timer component exists but needs Pomodoro logic
- **Session Stats**: Data structures exist in monitoring service, need UI
- **Streak System**: Will require persistent storage beyond localStorage
- **Cloud Sync**: Currently all data is local (tasks, lists, preferences)
