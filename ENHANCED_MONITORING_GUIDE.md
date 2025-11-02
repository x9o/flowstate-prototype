# Enhanced FlowState Monitoring with get-windows

## Overview

The enhanced monitoring script (`gemini_productivity_enhanced.js`) uses the `get-windows` package to provide superior window detection and analysis capabilities compared to the original `active-win` package.

## Key Enhancements

### 🔍 **Enhanced Window Detection**
- **Detailed Window Information**: Captures title, app name, process ID, memory usage, window bounds, and URL (when available)
- **App Categorization**: Automatically categorizes apps (Browser, Code Editor, IDE, Terminal, Productivity, Communication)
- **URL Detection**: Captures URLs from supported browsers for more accurate productivity analysis
- **Memory Tracking**: Monitors memory usage by application

### 🧠 **Advanced AI Intelligence**
- **Enhanced Context**: Provides AI with app name, URL, and other metadata for better decisions
- **Pattern Recognition**: Detects common productive/unproductive patterns in window titles
- **Multi-level Caching**: Both specific window-level and app-level learning
- **Smart Learning**: Remembers app behavior patterns over time

### 📊 **Detailed Analytics**
- **Session Statistics**: Tracks time spent, most productive apps, and blocked attempts
- **App Behavior Learning**: Learns which apps are typically productive for your goals
- **Real-time Monitoring**: Interactive commands during monitoring sessions
- **Comprehensive Reporting**: End-of-session analytics

## Installation & Setup

The `get-windows` package is already installed in your project. The enhanced script is ready to use.

## Running the Enhanced Monitor

### Basic Usage
```bash
npm run productivity:enhanced
```

### Development Mode (with Electron integration)
```bash
npm run productivity:enhanced:dev
```

### Switching Between Versions
```bash
# Original version
npm run productivity

# Enhanced version
npm run productivity:enhanced
```

## Interactive Commands

During monitoring, you can use these keyboard shortcuts:

- **`s`** - Show current statistics
- **`w`** - List all open windows (diagnostic)
- **`h`** - Show help
- **`Ctrl+C`** - Exit session

## Enhanced Features Breakdown

### 1. **App Categorization**
Automatically identifies app types:
- **Browser**: Chrome, Firefox, Safari, Edge
- **Code Editor**: VS Code, Sublime, Atom
- **IDE**: Visual Studio, IntelliJ, Eclipse
- **Terminal**: Windows Terminal, PowerShell, CMD
- **Productivity**: Office apps, Notepad, etc.
- **Communication**: Slack, Discord, Teams

### 2. **URL Detection**
Captures URLs from supported browsers:
- Chrome (including Beta, Dev, Canary)
- Firefox
- Safari (macOS)
- Edge (including Beta, Dev, Canary)
- Brave, Opera, Vivaldi

### 3. **Memory Usage Tracking**
Monitors memory consumption by application to help identify resource-heavy apps.

### 4. **Smart Caching System**
- **Window-level Cache**: Remembers decisions for specific window titles
- **App-level Learning**: Learns patterns for entire applications
- **Confidence Scoring**: Uses app history when confidence > 80%

### 5. **Enhanced Statistics**
```
📊 SESSION STATISTICS
⏱️ Session Duration: 45 minutes
🔍 Total Checks: 127
🚫 Blocked Attempts: 8
💾 AI Cache Size: 45 entries
🧠 App Learning Cache: 12 apps learned

✅ Most Productive Apps:
   1. Visual Studio Code (45 checks)
   2. Google Chrome (23 checks)
   3. Windows Terminal (12 checks)

🚫 Most Blocked Apps:
   1. YouTube (4 blocks)
   2. Reddit (3 blocks)
   3. TikTok (1 block)
```

## New Features for FlowState Integration

### 1. **Enhanced Task Management**
- **App-Specific Rules**: Set different rules for different apps
- **Time-based Rules**: Block apps during certain hours
- **Project-based Rules**: Different blocking rules per project/task

### 2. **Advanced Analytics Dashboard**
- **Productivity Heatmap**: Visual representation of productive vs unproductive time
- **App Usage Timeline**: Timeline showing which apps were used when
- **Focus Score**: Quantitative measure of focus quality
- **Trend Analysis**: Weekly/monthly productivity trends

### 3. **Smart Notification System**
- **Proactive Warnings**: Alert before switching to distracting apps
- **Motivational Messages**: Encouragement during productive periods
- **Break Reminders**: Suggest breaks after extended focus periods

### 4. **URL-Based Filtering**
- **Domain Whitelisting**: Allow specific productive websites
- **Category Blocking**: Block entire categories (social media, entertainment)
- **Time-limited Browsing**: Allow short breaks on certain sites

### 5. **Window Management Features**
- **App Window Organization**: Automatically arrange windows for better focus
- **Distraction Window Hiding**: Temporarily hide distracting app windows
- **Focus Mode**: Minimize all non-essential windows

### 6. **Multi-Monitor Support**
- **Monitor-specific Rules**: Different rules for different monitors
- **Window Location Tracking**: Know which monitor apps are on
- **Workspace Management**: Organize apps across virtual desktops

### 7. **Integration with Task Manager**
- **Task-App Associations**: Associate specific apps with specific tasks
- **Automatic Task Switching**: Suggest task changes based on app usage
- **Progress Tracking**: Track progress on tasks based on active apps

### 8. **Advanced AI Features**
- **Contextual Blocking**: More sophisticated understanding of work context
- **Learning Mode**: AI learns user patterns and adapts accordingly
- **Productivity Predictions**: Suggest optimal work times based on history

### 9. **Collaboration Features**
- **Team Focus Sessions**: Shared focus sessions with team members
- **Productivity Sharing**: Share productivity stats with team
- **Accountability Partners**: Get notifications when team members are focused

### 10. **Cross-Platform Sync**
- **Multi-device Support**: Sync settings and data across devices
- **Cloud-based Learning**: Share AI learning across devices
- **Remote Management**: Control settings from web interface

## Integration with Existing FlowState

### UI Enhancements
1. **Enhanced Settings Page**: Add options for new features
2. **Analytics Dashboard**: New page for detailed statistics
3. **URL Management**: Interface for managing URL rules
4. **App Rules Panel**: Advanced app-specific configuration

### Backend Enhancements
1. **Enhanced Monitoring**: Replace current monitoring with enhanced version
2. **Data Storage**: Store detailed analytics and learning data
3. **API Integration**: Connect to cloud services for sync
4. **Real-time Updates**: Push updates to UI in real-time

### Configuration Options
```javascript
// Example configuration for enhanced features
{
  "monitoring": {
    "enableURLDetection": true,
    "enableMemoryTracking": true,
    "enableAppLearning": true,
    "confidenceThreshold": 0.8,
    "checkInterval": 1000
  },
  "analytics": {
    "enableDetailedStats": true,
    "retainHistoryDays": 30,
    "enableTrendAnalysis": true
  },
  "notifications": {
    "enableWarnings": true,
    "enableBreakReminders": true,
    "breakInterval": 60 // minutes
  }
}
```

## Performance Considerations

- **Memory Usage**: Enhanced script uses more memory for caching and analytics
- **CPU Usage**: Slightly higher due to additional processing
- **Network Usage**: May make more AI calls initially, but reduces over time due to caching
- **Storage**: Requires space for analytics and learning data

## Troubleshooting

### Common Issues
1. **Permission Errors**: Ensure app has accessibility/screen recording permissions
2. **URL Detection Not Working**: May require additional permissions on macOS
3. **High Memory Usage**: Adjust cache size and retention settings
4. **Slow Performance**: Increase check interval or disable some features

### Debug Mode
Add debug logging by setting environment variable:
```bash
DEBUG=true npm run productivity:enhanced
```

## Future Development

The enhanced monitoring system provides a foundation for:
- **Machine Learning Integration**: Replace rule-based with ML models
- **Biometric Integration**: Connect with wearables for focus tracking
- **Environmental Sensors**: Monitor environmental factors affecting focus
- **Voice Assistant Integration**: Voice commands and feedback
- **Augmented Reality**: Visual focus indicators in AR

This enhanced system positions FlowState as a leading productivity tool with enterprise-grade analytics and AI-powered focus management.