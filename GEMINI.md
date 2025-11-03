# FlowState — AI-Powered Productivity App

## Project Overview

FlowState is a desktop productivity application built with Electron and React. It helps users achieve deep focus through AI-powered monitoring, task management, and intelligent distraction blocking. The application understands user intent and dynamically manages their digital environment to minimize distractions.

**Main Technologies:**

*   **Frontend:** React, TypeScript, Tailwind CSS
*   **Desktop Framework:** Electron
*   **AI:** Google Gemini
*   **Build Tool:** Vite

**Architecture:**

The application consists of a main Electron process and a renderer process. The main process is responsible for creating the browser window, handling IPC communication, and managing the monitoring service. The renderer process is a React application that provides the user interface.

A separate Node.js script, `MonitoringService.js`, runs in a child process and is responsible for monitoring the user's active window, communicating with the Gemini AI to determine if the current activity is productive, and displaying a blocking overlay if it is not.

## Building and Running

**Key Commands:**

*   **`npm install`**: Install dependencies.
*   **`npm run dev`**: Start the development server.
*   **`npm run electron:dev`**: Start the application in development mode with Electron.
*   **`npm run build`**: Build the application for production.
*   **`npm run electron:pack`**: Package the application for distribution.

**Development Workflow:**

1.  Run `npm install` to install the necessary dependencies.
2.  Run `npm run electron:dev` to start the application in development mode. This will open the application in an Electron window with the developer tools enabled.
3.  Make changes to the code in the `src` directory. The application will automatically reload when changes are saved.

## Development Conventions

*   **Code Style:** The project uses ESLint to enforce a consistent code style. Run `npm run lint` to check for linting errors.
*   **Component-Based Architecture:** The UI is built with React components, located in the `src/components` directory.
*   **Styling:** The project uses Tailwind CSS for styling. Utility classes are preferred over custom CSS.
*   **State Management:** Component-level state is managed with React Hooks (`useState`, `useEffect`). For global state, the project uses React Context (`ThemeContext`, `MonitoringContext`).
*   **IPC Communication:** The renderer process communicates with the main process using Electron's IPC modules. The `preload.cjs` script exposes a secure API for this communication.
