
# FlowState — The blocker that actually understands what you're working on.

FlowState is a **desktop productivity app** built with **Electron + React**, designed to help users achieve deep focus through **AI-powered monitoring, task management, and intelligent distraction blocking**.

Unlike traditional blockers, FlowState understands user **intent** and dynamically manages their digital environment.  
It’s built around the idea that focus should feel natural, not forced.

---

## 🚀 Current Status

**Development Stage:** Advanced Prototype
**Version:** v0.1 (MVP)
**Platform:** Electron (Cross-platform)
**State:** ✅ Core UI complete (Home screen + Settings) / ✅ Full monitoring & AI blocking system implemented / ✅ Focus timer integration / ✅ Smart task validation  

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | React + TailwindCSS + Electron |
| Backend | Node.js (Electron main process) |
| Database | Local JSON (lowdb) → Supabase (for cloud accounts in v0.3) |
| Auth | Supabase Auth (planned) |
| AI Logic | Gemini |
| Deployment | Electron Builder |
| Design | Figma / AI Prototyper |
| Version Control | GitHub Private Repository |

---

## 🧩 Core Concept

FlowState helps users enter and maintain a **"flow state"** — a period of deep focus where distractions are intelligently managed.

**Core Loop:**
1. Add and enable tasks.
2. Set focus duration.
3. Start Focus Session (enables monitoring + overlay).
4. FlowState blocks distractions until session ends.

---

## 🧠 Features Overview

### **Core Features**
- [x] **Task Manager** — Add, enable/disable, and delete tasks with color coding
- [x] **Timer / Focus Mode** — Set focus duration with circular progress visualization
- [x] **Monitoring Engine** — Active window detection with AI-powered productivity analysis
- [x] **Smart Task Validation** — Popup alerts when starting timer without enabled tasks

### **Blocking System**
- [x] **AI-Based Blocking** — Dynamic blocking using Gemini AI intent analysis
- [x] **Productivity Caching** — Smart caching system for AI decisions
- [ ] **Whitelist / Blacklist** — Manual app/site rule configuration (in progress)
- [ ] **Built-in Productivity DB** — Predefined safe apps (e.g. VSCode, Notion, Docs, Figma)

### **AI Intelligence**
- [x] **AI Intent Matching** — Uses Gemini-based classifier to judge relevance of current activity
- [x] **Context-Aware Blocking** — Understands user goals vs current activity
- [x] **Multi-Task Support** — AI considers all enabled tasks when making decisions
- [ ] **AI Modes** — "Strict", "Balanced", "Lenient" sensitivity levels
- [ ] **Task Validation** - Ask user/auto generate more details when given ambigious tasks. 

### **User Interface**
- [x] **Responsive Design** — Mobile-first design that scales to desktop
- [x] **Theme System** — Light/Dark mode with smooth transitions
- [x] **Custom Components** — Task cards, focus timer, user dropdown, settings panel
- [x] **Non-Selectable Text** — Clean UI with no text highlighting
- [x] **Gradient Branding** — Dynamic sphere gradient that syncs with theme

### **User Preferences**
- [x] **Settings Page** — Full settings interface with navigation
- [x] **Whitelist/Blacklist UI** — Input fields for custom filtering rules
- [x] **User Dropdown** — Account and settings access with animations
- [x] **Navigation System** — React Router with back navigation support

### **Application Architecture**
- [x] **Electron Integration** — Full desktop app with custom branding
- [x] **Window Monitoring** — Real-time active window detection
- [x] **Overlay System** — Fullscreen blocking overlay with dismissal options
- [x] **Timer Integration** — Focus timer connects to monitoring system

### **Additional Features**
- [x] **Smart Alerts** — Task validation popup with helpful user guidance
- [x] **App Branding** — Custom icon and window title ("FlowState")
- [ ] **Keyboard Shortcuts** — Start/stop session quickly
- [ ] **Smart Notifications** — Alerts for distractions or milestones
- [ ] **Non intrusive block screen** - With a quote or breath reminder, and replace the harsh red screen.

---

## 🧱 App Layout Overview

### 🏠 Home Page
- Add and manage tasks.
- Toggle tasks on/off.
- Set timer duration.
- Start/stop monitoring (activates overlay).

### 📅 Schedule Page
- Daily timeline for planned focus blocks.
- Add new sessions with task, start/end times, repeat toggle.
- Option to auto-start monitoring during session.

### ⚙️ Preferences Page
- Manage whitelist / blacklist.
- Edit default focus duration.
- Set AI mode (Strict / Balanced / Lenient).
- Customize theme and notifications.
- (Future) Account management + cloud sync options.

### 🔻 Bottom Navigation Bar
Persistent across all pages:
> 🏠 Home | 📅 Schedule | ⚙️ Preferences

---

## 💰 Monetization Strategy

FlowState follows a **Freemium SaaS model** with optional subscriptions for advanced features.

| Tier | Price | Features |
|------|--------|-----------|
| **Free** | $0 | 3 sessions/day |
| **Lite** | $3/mo | 10 sessions/day  |
| **Pro** | $5/mo | 25 sessions/day  |


### Future Add-ons
- “Flow Sounds” (ambient focus audio pack)
- “AI Schedule Advisor” (suggests ideal focus hours)

---

## 🧩 AI Logic Overview

### Classification Flow:
1. Read window title from OS.
2. Check against:
   - Local whitelist (immediate allow)
   - Local blacklist (immediate block)
3. If unknown:
   - Send to LLM with goal context.
   - Return YES/NO (based on productivity).
4. Adjust behavior based on AI mode sensitivity.

**Example Prompt Behavior**
```text
GOAL: "Finish math essay"
ACTIVITY: "YouTube - LoFi Study Beats"
STRICT → NO
BALANCED → YES
LENIENT → YES
````

### AI Sensitivity Prompts

Here are the design system prompts for the three AI sensitivity levels.

#### Strict Sensitivity Prompt

> You are an extremely strict productivity AI. Your only function is to determine if a user's activity is **directly and explicitly** productive for their stated goal. There is no room for interpretation.
> Your response must ALWAYS be a single word: either YES or NO.
>
> **Guidelines:**
> 1.  **Direct Relevance Only:** Respond YES only if the activity is a primary tool or resource for the goal. Any activity that is not 100% related, even if helpful (like music or general browsing), is NO.
> 2.  **No Ambiguity:** If the window title is ambiguous, generic, or unclear (e.g., "New Tab", "Untitled", "localhost:3000"), respond NO. The user must be specific.
> 3.  **Block Distractions:** Social media, entertainment, news, and any non-work-related browsing are always NO.
>
> **Example:**
> *   **GOAL:** "Code a Python script."
> *   **ACTIVITY:** "Stack Overflow" -> **YES**
> *   **ACTIVITY:** "YouTube - 'Python Tutorial'" -> **YES**
> *   **ACTIVITY:** "YouTube - 'Focus Music'" -> **NO**
> *   **ACTIVITY:** "Spotify" -> **NO**

#### Balanced Sensitivity Prompt

> You are a balanced productivity AI. Your function is to determine if a user's activity is **reasonably productive** for their stated goal.
> Your response must ALWAYS be a single word: either YES or NO.
>
> **Guidelines:**
> 1.  **Reasonable Support:** Respond YES if the activity directly supports the goal OR is a common secondary tool that aids focus (e.g., instrumental music, documentation).
> 2.  **Assume Good Intent:** If the window title is ambiguous or technical (e.g., "npm start", "localhost:3000", "Untitled"), assume it is work-related and respond YES.
> 3.  **Block Obvious Distractions:** Social media, entertainment sites, and clearly unrelated content are NO.
>
> **Example:**
> *   **GOAL:** "Write a research paper."
> *   **ACTIVITY:** "JSTOR" -> **YES**
> *   **ACTIVITY:** "YouTube - 'Ambient Study Music'" -> **YES**
> *   **ACTIVITY:** "Reddit - r/askscience" -> **YES**
> *   **ACTIVITY:** "Reddit - r/funny" -> **NO**

#### Lenient Sensitivity Prompt

> You are a lenient productivity AI. Your function is to block only **obvious and high-distraction activities**, allowing the user maximum flexibility.
> Your response must ALWAYS be a single word: either YES or NO.
>
> **Guidelines:**
> 1.  **Allow Most Activities:** Respond YES for almost everything, including general browsing, music, and news. Your job is to prevent major distractions only.
> 2.  **Block High-Distraction Content:** Respond NO only for activities that are almost never productive, such as social media feeds, video streaming sites (non-educational), and games.
> 3.  **Trust the User:** If an activity could even remotely be considered productive or helpful for focus, respond YES.
>
> **Example:**
> *   **GOAL:** "Finish a design mockup."
> *   **ACTIVITY:** "Figma" -> **YES**
> *   **ACTIVITY:** "YouTube - 'Design Trends 2024'" -> **YES**
> *   **ACTIVITY:** "Twitter / X" -> **NO**
> *   **ACTIVITY:** "Netflix" -> **NO**
> *   **ACTIVITY:** "Coolors.co" -> **YES**

---

## 🧭 Feature Checklist (Milestone Plan)

### ✅ **v0.1 – Prototype (Complete)**

* [x] Task manager (add/remove/toggle with color coding)
* [x] Timer UI & logic (circular progress, duration selection)
* [x] Monitoring system (active window detection + AI analysis)
* [x] Overlay activation (fullscreen blocking with dismissal)
* [x] Basic Electron setup (custom branding, window configuration)
* [x] Core design built (responsive, theme-aware, non-selectable text)
* [x] Smart task validation (popup alerts for timer start requirements)
* [x] Settings page (whitelist/blacklist configuration UI)
* [x] User dropdown (account/settings navigation)
* [x] Multi-task AI support (considers all enabled tasks in decisions)
* [x] Productivity caching system (reduces AI API calls)
* [x] Theme switching (light/dark mode with smooth transitions)

### 🧩 **v0.2 – Preferences + Whitelist (In Progress)**

* [x] Preferences page layout (fully functional settings page)
* [x] User-defined whitelist/blacklist system (UI complete, backend integration needed)
* [ ] Built-in DB of productive apps
* [ ] Local saving of user preferences
* [x] Integration with AI model (basic relevance check implemented)

### 🕒 **v0.3 – Scheduling + Cloud Sync**

* [ ] Schedule page (daily timeline)
* [ ] Add/edit recurring focus blocks
* [ ] Auto-start focus sessions
* [ ] User account system (Supabase Auth)
* [ ] Cloud sync for tasks & preferences

### 📈 **v0.4 – Monetization & Analytics**

* [ ] Tiered subscription system
* [ ] Paywall integration (LemonSqueezy / Stripe)
* [ ] Session logging
* [ ] Analytics dashboard
* [ ] Export session data (CSV)

### 🧠 **v1.0 – Smart Focus AI**

* [ ] AI pattern learning (adaptive blocking)
* [ ] Contextual focus suggestions
* [ ] AI daily summary reports
* [ ] Cross-device sync
* [ ] Desktop + mobile parity

---

## 🧩 Folder Structure (Planned)

```
flowstate/
├─ main.js              # Electron entry
├─ preload.js           # Context bridge for secure FS
├─ src/
│  ├─ App.tsx
│  ├─ pages/
│  │   ├─ Home.tsx
│  │   ├─ Schedule.tsx
│  │   └─ Preferences.tsx
│  ├─ components/
│  │   ├─ TaskList.tsx
│  │   ├─ TimerCard.tsx
│  │   ├─ ScheduleBlock.tsx
│  │   └─ SettingsCard.tsx
│  ├─ hooks/
│  │   └─ useMonitoring.ts
│  ├─ utils/
│  │   ├─ aiClassifier.ts
│  │   ├─ storage.ts
│  │   └─ timer.ts
│  ├─ data/
│  │   ├─ whitelist.json
│  │   ├─ blacklist.json
│  │   └─ tasks.json
│  └─ styles/
│      ├─ globals.css
│      └─ theme.css
└─ package.json
```

---

## 📘 AI Reference Notes (for Claude Code / Codex)

* Always use **whole-script replacement** when editing via MCP server.
* Core modules to reference:

  * `mcp__RobloxStudio__run_code` (for test logic placeholder)
  * `monitoring` (for checking active window titles)
  * `aiClassifier` (for GPT-based relevance checks)
* Respect local caching (`tasks.json`, `prefs.json`) before hitting APIs.
* Use **incremental commits**; summarize logic changes clearly in commit message.
* Avoid modifying overlay visuals — they’re handled externally.

---

## 🔧 Current Technical Implementation

### **Frontend Architecture**
- **React 18** with TypeScript and functional components
- **Tailwind CSS** with custom design system (mint, indigo, peach, sky, lavender colors)
- **Radix UI** components for accessible UI primitives
- **React Router** for navigation and settings page
- **Custom Context** for theme management (light/dark mode)
- **Lucide React** for consistent iconography

### **Key Components**
- **TaskCard**: Individual task display with toggle functionality
- **FocusTimer**: Circular progress timer with duration selection and validation
- **UserDropdown**: Animated dropdown with account/settings navigation
- **TaskAlertPopup**: Smart validation popup for timer start requirements
- **Settings Page**: Full preferences interface with whitelist/blacklist management

### **State Management**
- **React Hooks**: useState, useEffect, useRef for component state
- **Task State**: Array of task objects with id, title, tag, color, enabled properties
- **Timer State**: Duration, time remaining, active status, custom input
- **Theme State**: Global theme context with smooth transitions

### **Styling System**
- **Non-Selectable Text**: Global user-select: none with input exceptions
- **Responsive Design**: Mobile-first breakpoints (sm, md, lg, xl)
- **Custom Gradients**: Dynamic sphere gradients that sync with theme
- **Smooth Animations**: CSS transitions for hover states and theme changes
- **Shadow System**: Soft shadows with theme-aware colors

### **Electron Integration**
- **Window Configuration**: Custom title ("FlowState") and icon
- **Build System**: Electron Builder with cross-platform support
- **Monitoring System**: Active window detection via active-win module
- **Overlay System**: Fullscreen blocking window with dismissal options

### **AI System**
- **Gemini API**: AI-based productivity analysis with caching
- **Multi-Task Support**: Considers all enabled tasks in blocking decisions
- **Smart Caching**: Reduces API calls by caching productive/unproductive decisions
- **System Window Filtering**: Skips system windows to reduce noise

---

## 🧩 Future Considerations

* Cross-platform support (Mac/Linux)
* Browser extension for Chrome/Edge integration
* Mobile companion app (for notification blocking)
* AI summarization of weekly productivity
* Cloud analytics dashboard

---

## 🧠 Vision

> *“FlowState is the AI that guards your focus — silently, intelligently, and on your side.”*


