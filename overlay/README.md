# FlowState Electron UI

Clean, modern Electron-based UI for the FlowState productivity monitoring app.

## File Structure

```
overlay/
├── main-app.cjs          # Main Electron process (goal management)
├── main.cjs              # Blocking overlay Electron process
├── goal-input.html       # Goal input/management UI
├── blocking.html         # Full-screen blocking overlay UI
├── preload-goal.cjs      # Preload script for goal window
└── preload.cjs           # Preload script for blocking window
```

## Architecture

### Main App (`main-app.cjs`)
- Entry point for the Electron application
- Manages the goal input window
- Handles IPC communication between renderer and main process
- Controls window lifecycle (minimize, maximize, close)
- Will coordinate with monitoring logic (to be implemented)

### Goal Input Window (`goal-input.html`)
- **Frameless window** with custom macOS-style titlebar
- Add/remove goals with persistence (localStorage)
- Select active goal to monitor
- Clean, modern UI with gradients and smooth animations
- Start monitoring button (placeholder for future integration)

### Blocking Overlay (`main.cjs` + `blocking.html`)
- Full-screen blocking window shown when off-task
- Always-on-top, frame less design
- Shows current goal and blocked activity
- Dismissible with ESC or button click

## Design System

### Colors
- **Background**: Dark gradient (`#1a1a2e` → `#16213e`)
- **Primary**: Purple gradient (`#667eea` → `#764ba2`)
- **Text**: Light gray (`#e0e0e0`)
- **Accents**: Semi-transparent white overlays

### Typography
- **Font**: System fonts (-apple-system, Segoe UI, etc.)
- **Headers**: Bold, 32px
- **Body**: 15px, 500 weight
- **Labels**: Uppercase, 13px, letterspaced

### Components
- **Buttons**: 12px border-radius, smooth hover effects
- **Cards**: Semi-transparent backgrounds with subtle borders
- **Inputs**: Focus states with color transitions
- **Lists**: Scrollable with custom scrollbar styling

## Usage

### Launch Goal Input UI
```bash
npm run start:ui
```

### Test Blocking Overlay
```bash
npm run test:overlay
```

## IPC Communication

### Main → Renderer
- `blocking-data`: Send goal and activity data to blocking overlay
- `monitoring-started`: Confirm monitoring has started

### Renderer → Main
- `window-minimize`: Minimize window
- `window-maximize`: Toggle maximize/restore
- `window-close`: Close window
- `start-monitoring`: Start monitoring with selected goal
- `stop-monitoring`: Stop monitoring
- `dismiss-overlay`: Dismiss blocking screen

## State Management

### Goal Window
- **State**: Stored in localStorage
  - `tasks`: Array of goal objects
  - `activeTaskId`: Currently selected goal
- **Persistence**: Automatic save on changes
- **Auto-load**: Loads on startup

### Task Object
```javascript
{
  id: number,        // Timestamp-based unique ID
  text: string,      // Goal description
  createdAt: string  // ISO 8601 timestamp
}
```

## Future Integration Points

### Monitoring Integration
The `start-monitoring` IPC handler in `main-app.cjs` is currently a placeholder. To integrate with the actual monitoring logic:

1. Import the monitoring module
2. Spawn monitoring process when `start-monitoring` is called
3. Pass the active goal to the monitoring logic
4. Handle monitoring events (blocking, status updates)
5. Show blocking overlay when unproductive activity detected

### Suggested Flow
```javascript
// In main-app.cjs
ipcMain.on('start-monitoring', async (event, goal) => {
  // 1. Start window monitoring (active-win)
  // 2. Set up periodic checks or window change detection
  // 3. Call Gemini AI for productivity checks
  // 4. Spawn blocking overlay when needed
  // 5. Send status updates back to goal window
});
```

## Customization

### Window Size
Adjust in `main-app.cjs`:
```javascript
width: 600,
height: 700,
```

### Colors
Update CSS custom properties in HTML files:
```css
background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
```

### Titlebar Style
Modify `.titlebar` and `.titlebar-button` styles in `goal-input.html`

## Cross-Platform Notes

- **Windows**: Frameless window works perfectly
- **macOS**: Window drag region (-webkit-app-region) required
- **Linux**: May need additional window manager configuration

## Security

- **Context Isolation**: Enabled for all windows
- **Node Integration**: Disabled in renderer processes
- **Preload Scripts**: Used for safe IPC communication
- **LocalStorage**: Used for non-sensitive data only (goals/tasks)
