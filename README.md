# FlowState

FlowState is an **open-source desktop productivity app** built with **Electron + React**, designed to help users achieve deep focus through **AI-powered monitoring, task management, and intelligent distraction blocking**.

Unlike traditional blockers, FlowState understands user **intent** and dynamically manages their digital environment. It's built around the idea that focus should feel natural, not forced.

---

## Current Status

**Development Stage:** Advanced Prototype
**Version:** v0.1 (MVP)
**License:** Open Source (MIT)
**Platform:** Electron (Cross-platform)
**State:** Core monitoring & AI blocking system implemented

---

## Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | React 18 + TypeScript + TailwindCSS + Electron |
| Backend | Node.js (Electron main process) |
| AI Logic | Google Gemini API (2.5 Flash-Lite) |
| UI Components | Radix UI + Lucide React + react-icons |
| State Management | React Context (Theme, Monitoring, Lists) |
| Build System | Vite + Electron Builder |
| Development | ESLint + TypeScript + hot reload |

---

## Core Concept

FlowState helps users enter and maintain a **"flow state"**, a period of deep focus where distractions are intelligently managed.

**Core Loop:**
1. **Set your goal** - Define what you want to accomplish
2. **Start focusing** - Activate monitoring + AI blocking
3. **Stay on track** - AI intelligently blocks distractions
4. **Achieve deep focus** - Get into your productive zone

---

## Key Features

### **Currently Implemented**

**AI-Powered Monitoring**
- Real-time active window detection
- Gemini AI productivity analysis with caching
- Context-aware blocking decisions
- Multi-task support (considers all enabled tasks)

**Smart Blocking System**
- AI-based blocking with intent analysis
- User-defined whitelist/blacklist with pattern matching
- Productivity caching to reduce API calls
- Three AI sensitivity levels (Strict, Balanced, Lenient)

**User Interface**
- Clean, responsive design with light/dark themes
- Non-selectable text for distraction-free experience
- Custom branding and professional UI components
- Settings page with whitelist/blacklist management

**Session Management**
- Goal-based focus sessions
- Real-time monitoring with AI feedback
- Blocking overlay with "Mark as Productive" functionality
- Session statistics and recent blocks tracking

### **Planned Features**

**Enhanced Blocking Methods**
- DNS-level blocking (concept proven)
- Browser extension integration
- Process-based blocking for applications
- Multi-layered blocking approach

**Statistics & Analytics**
- Detailed session analytics
- Productivity trends and insights
- Focus streak tracking
- Export functionality

**User Experience**
- Keyboard shortcuts for common actions
- Enhanced notifications system
- Session completion celebrations
- Cross-platform support improvements

---

## Installation

### Prerequisites
- Node.js 18+ installed
- Git for cloning the repository

### Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/your-username/flowstate-ui.git
cd flowstate-ui
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up AI API key**
Create a `.env` file in the root directory:
```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

4. **Start development server**
```bash
npm run electron:dev
```

**Note:** Requires port 8080 for Vite dev server. Make sure port 8080 is not in use before starting.

---

## Usage

### Basic Usage

1. **Set Your Goal**
   - Enter what you want to accomplish in the goal input
   - Enable multiple goals if needed

2. **Configure Blocking**
   - Go to Settings → Lists to manage whitelist/blacklist
   - Choose your preferred AI sensitivity level
   - Add specific apps/websites to block or allow

3. **Start Focusing**
   - Click "Start Focusing" to activate monitoring
   - FlowState will minimize and begin monitoring
   - AI will intelligently block distractions

4. **During Sessions**
   - If something is blocked, you can "Mark as Productive" to whitelist it
   - Check recent blocks in the session stats
   - Stay focused and let AI handle the distractions

### AI Sensitivity Levels

- **Strict**: Blocks everything except directly productive activities
- **Balanced**: Allows common productivity tools and research materials
- **Lenient**: Only blocks obvious distractions and entertainment

### Configuration

**Whitelist/Blacklist Patterns**
- Use `|` to match multiple patterns: `notion|notes`
- Case-insensitive matching
- Checks window titles, app names, and URLs

**AI Settings**
- Adjust sensitivity levels in Settings
- Configure cache duration for AI decisions
- Choose between different blocking priorities

---

## Architecture

### Three-Process Architecture

1. **Main Process** (`electron.cjs`)
   - Manages app lifecycle and window creation
   - Handles IPC communication between renderer and monitoring
   - Controls monitoring start/stop and passes lists to service

2. **React Renderer** (`src/`)
   - UI built with React 18 + TypeScript + Tailwind CSS
   - Context-based state management (Theme, Monitoring, Lists)
   - Responsive design with mobile-first approach

3. **Monitoring Service** (`monitoring-service.cjs`)
   - Polls active window every 1 second using `get-windows`
   - Implements priority-based checking system
   - AI-powered productivity analysis with caching
   - Spawns blocking overlay as needed

### Blocking Decision Priority

1. **FlowState itself** → Always whitelisted
2. **User Blocklist** → Always blocked (no AI call)
3. **User Whitelist** → Always allowed (no AI call)
4. **"Mark as Productive" cache** → Temporary whitelist
5. **AI Productivity Check** → Gemini API with caching

---

## Development

### Available Scripts

```bash
# Development
npm run dev              # Start Vite dev server only (port 8080)
npm run electron:dev     # Start Electron app with hot reload
npm run electron:pack    # Build and package distributable
npm run electron:dist    # Build without publishing

# Code Quality
npm run lint             # Run ESLint
npm run build            # Build React app for production

# Legacy Scripts (for development)
npm run productivity     # Test AI productivity classifier
npm run productivity:enhanced  # Enhanced AI classifier test
```

### Project Structure

```
flowstate-ui/
├── src/                    # React frontend
│   ├── pages/             # Route pages (Index, Settings, Lists, Stats)
│   ├── components/        # Reusable UI components
│   ├── contexts/          # React contexts (Theme, Monitoring, Lists)
│   └── types/             # TypeScript interfaces
├── overlay/                # Blocking overlay system
├── public/                 # Static assets
├── electron.cjs           # Main process entry point
├── monitoring-service.cjs # AI monitoring logic
├── preload.cjs            # IPC bridge for main window
└── dist/                  # Vite build output
```

### Key Files

- **`monitoring-service.cjs`** - Core AI monitoring and blocking logic
- **`src/contexts/MonitoringContext.tsx`** - React bridge for monitoring state
- **`src/pages/Lists.tsx`** - Whitelist/blacklist management UI
- **`overlay/main.cjs`** - Blocking overlay electron process

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
