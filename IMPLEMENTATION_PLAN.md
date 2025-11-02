# FlowState Electron UI - Productivity Backend Integration Plan

## Overview
This document outlines the detailed implementation plan for integrating the Gemini AI productivity monitoring backend (`gemini_productivity.js`) into the FlowState Electron application UI.

## Current System Architecture

### Backend Components
- **gemini_productivity.js**: Main backend logic with active window monitoring
- **overlay.html**: Overlay UI for notifications
- **Dependencies**: `@google/generative-ai`, `active-win`, `fs`

### Frontend Components
- **Electron Main Process**: Window management and IPC handlers
- **Electron Renderer**: React-based UI with theme system
- **Components**: TitleBar, Task management, Efficiency tracking

## Integration Architecture

### 1. IPC Communication System

#### Main Process Enhancements
- **New IPC Handlers**:
  - `start-productivity-monitoring` - Initialize active window monitoring
  - `stop-productivity-monitoring` - Stop monitoring
  - `set-current-task` - Update current user task
  - `get-productivity-status` - Retrieve current productivity state
  - `productivity-alert` - Handle AI blocking decisions

#### Renderer Process Integration
- **New Context**: ProductivityContext for state management
- **API Layer**: Electron API wrappers for backend communication

### 2. State Management System

#### ProductivityContext Structure
```typescript
interface ProductivityState {
  isMonitoring: boolean;
  currentTask: string;
  currentWindow: string;
  productivityStatus: 'productive' | 'distracted' | 'blocked';
  alerts: Alert[];
  settings: ProductivitySettings;
}
```

#### Settings Structure
```typescript
interface ProductivitySettings {
  apiKey: string;
  blockDistracting: boolean;
  notifications: boolean;
  monitoringInterval: number;
  cacheDuration: number;
}
```

### 3. UI Components Integration

#### New Components Required
1. **TaskInput.tsx** - User task input interface
2. **ProductivityStatus.tsx** - Real-time status display
3. **SettingsPanel.tsx** - Configuration for AI settings
4. **AlertSystem.tsx** - Notification overlay system
5. **WindowBlocking.tsx** - Blocking screen for distracting windows

#### Enhanced Existing Components
1. **Index.tsx** - Integrate productivity dashboard
2. **TitleBar.tsx** - Add productivity status indicator
3. **ThemeContext.tsx** - Extend theme for productivity states

## Implementation Steps

### Phase 1: Backend Integration Foundation
1. **Modify electron.cjs**:
   - Import and initialize productivity monitoring
   - Add IPC handlers for productivity system
   - Handle AI responses and window blocking

2. **Create ProductivityContext**:
   - Set up React context for productivity state
   - Implement localStorage persistence for settings
   - Add hooks for backend communication

3. **Enhance Preload Script**:
   - Add productivity API methods to electronAPI
   - Implement secure API key handling
   - Add event listeners for real-time updates

### Phase 2: Core UI Implementation
1. **TaskInput Component**:
   - Create task input interface with validation
   - Add task history and suggestions
   - Implement quick task switching

2. **ProductivityStatus Component**:
   - Real-time window and task display
   - Visual indicators for productivity state
   - Time tracking and statistics

3. **SettingsPanel Component**:
   - API key configuration
   - Monitoring preferences
   - Block list management
   - Notification settings

### Phase 3: Advanced Features
1. **AlertSystem Integration**:
   - Desktop notifications for block decisions
   - In-app alerts and warnings
   - Sound effects and visual feedback

2. **WindowBlocking Implementation**:
   - Electron window management for blocking
   - Custom blocking screens
   - Override mechanisms

3. **Data Persistence**:
   - Task history database
   - Productivity analytics
   - Export functionality

## Technical Implementation Details

### File Structure Additions
```
src/
├── contexts/
│   └── ProductivityContext.tsx
├── components/
│   ├── productivity/
│   │   ├── TaskInput.tsx
│   │   ├── ProductivityStatus.tsx
│   │   ├── SettingsPanel.tsx
│   │   ├── AlertSystem.tsx
│   │   └── WindowBlocking.tsx
├── hooks/
│   ├── useProductivity.ts
│   └── useSettings.ts
└── utils/
    ├── productivityAPI.ts
    └── storage.ts
```

### IPC Communication Schema
```typescript
// Main Process -> Renderer
interface ProductivityEvents {
  'window-detected': { window: string; title: string };
  'task-updated': { task: string };
  'productivity-status': { status: 'productive' | 'distracted' | 'blocked' };
  'alert-fired': { type: string; message: string };
}

// Renderer -> Main
interface ProductivityCommands {
  'start-monitoring': { task: string };
  'stop-monitoring': {};
  'update-settings': { settings: ProductivitySettings };
  'override-block': {};
}
```

### Integration Points

#### 1. Index.tsx Modifications
- Add productivity dashboard section
- Integrate TaskInput and ProductivityStatus
- Update responsive layout for new components

#### 2. electron.cjs Enhancements
```javascript
// Example IPC handler
ipcMain.handle('start-productivity-monitoring', async (event, { task }) => {
  // Start monitoring with current task
  // Initialize active-win monitoring
  // Set up AI analysis interval
});
```

#### 3. Theme Integration
- New color schemes for productivity states
- Alert and notification styling
- Dark/light mode compatibility

## Security Considerations

1. **API Key Protection**:
   - Secure storage using Electron's safeStorage
   - Environment variable support
   - User-controlled key management

2. **Window Monitoring**:
   - Privacy controls and permissions
   - Data anonymization options
   - User consent for monitoring

3. **Data Handling**:
   - Local storage encryption
   - Secure AI communication
   - Cache management

## User Experience Flow

1. **Initial Setup**:
   - User configures API key
   - Sets monitoring preferences
   - Defines blocking rules

2. **Daily Workflow**:
   - User inputs current task
   - System monitors active windows
   - AI analyzes productivity
   - Blocks distractions if configured

3. **Monitoring Interface**:
   - Real-time status display
   - Task progress tracking
   - Productivity analytics

## Testing Strategy

1. **Unit Tests**:
   - ProductivityContext functionality
   - Component rendering and interaction
   - IPC communication

2. **Integration Tests**:
   - Backend-frontend communication
   - Settings persistence
   - Real-time monitoring accuracy

3. **User Testing**:
   - Workflow usability
   - Performance impact
   - Notification effectiveness

## Performance Considerations

1. **Monitoring Optimization**:
   - Configurable check intervals
   - Efficient caching strategies
   - Background processing

2. **Resource Management**:
   - Memory usage monitoring
   - CPU impact minimization
   - Network request optimization

## Deployment Considerations

1. **Build Configuration**:
   - Include productivity modules in Electron build
   - Configure auto-updater for AI models
   - Optimize bundle size

2. **Cross-Platform Compatibility**:
   - Window monitoring differences
   - Notification system variations
   - Storage path handling

## Future Enhancements

1. **Advanced AI Features**:
   - Custom AI model training
   - Enhanced pattern recognition
   - Predictive blocking

2. **Team Features**:
   - Shared productivity goals
   - Team analytics
   - Collaborative blocking

3. **Integration Ecosystem**:
   - Calendar integration
   - Project management tools
   - Browser extensions

## Conclusion

This integration plan provides a comprehensive roadmap for incorporating the Gemini AI productivity monitoring backend into the FlowState Electron application. The phased approach ensures systematic development while maintaining application stability and user experience quality.

Key success factors include:
- Proper IPC communication architecture
- Intuitive user interface design
- Secure API key handling
- Efficient background monitoring
- Seamless theme integration

The implementation will transform FlowState from a simple task management app into a comprehensive productivity platform with AI-powered distraction blocking.