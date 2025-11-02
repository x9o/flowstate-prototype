import { useEffect, useState } from 'react';
import { Minus, Square, Copy, X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

const TitleBar = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isElectron, setIsElectron] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    // Check if we're running in Electron
    setIsElectron(window.electronAPI !== undefined);

    // Check window state and listen for changes
    const checkMaximized = async () => {
      if (window.electronAPI?.isMaximized) {
        const maximized = await window.electronAPI.isMaximized();
        setIsMaximized(maximized);
      }
    };

    const setupListeners = () => {
      if (window.electronAPI) {
        // Listen for window state changes
        window.electronAPI.onWindowMaximize(() => setIsMaximized(true));
        window.electronAPI.onWindowUnmaximize(() => setIsMaximized(false));
      }
    };

    checkMaximized();
    setupListeners();

    // Cleanup listeners on unmount
    return () => {
      if (window.electronAPI?.removeAllListeners) {
        window.electronAPI.removeAllListeners('window-maximized');
        window.electronAPI.removeAllListeners('window-unmaximized');
      }
    };
  }, []);

  const handleMinimize = () => {
    if (window.electronAPI?.minimize) {
      window.electronAPI.minimize();
    }
  };

  const handleMaximize = async () => {
    if (window.electronAPI) {
      const currentlyMaximized = await window.electronAPI.isMaximized();
      if (currentlyMaximized) {
        window.electronAPI.unmaximize();
      } else {
        window.electronAPI.maximize();
      }
    }
  };

  const handleClose = () => {
    if (window.electronAPI?.close) {
      window.electronAPI.close();
    }
  };

  // Don't render if not in Electron
  if (!isElectron) {
    return null;
  }

  return (
    <div
      className={`flex items-center justify-between h-8 select-none transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-purple-950 border-purple-900'
          : 'bg-white border-gray-200'
      } border-b`}
      style={{ WebkitAppRegion: 'drag' }}
    >
      {/* Logo and Title */}
      <div className="flex items-center px-4">
        <div className="flex items-center space-x-2">
          <img
            src={theme === 'dark' ? "./flowstate_transparent_dark_resized.png" : "./flowstate_transparent_light_resized.png"}
            alt="FlowState"
            className="w-4 h-4 transition-all duration-300"
          />
          <span className={`text-sm font-medium transition-colors duration-300 ${
            theme === 'dark' ? 'text-purple-200' : 'text-gray-700'
          }`}>
            FlowState
          </span>
        </div>
      </div>

      {/* Window Controls */}
      <div className="flex items-center" style={{ WebkitAppRegion: 'no-drag' }}>
        <ThemeToggle />
        <button
          onClick={handleMinimize}
          className={`h-8 w-12 flex items-center justify-center transition-colors ${
            theme === 'dark'
              ? 'text-purple-300 hover:text-white hover:bg-purple-900'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
          aria-label="Minimize"
        >
          <Minus size={14} />
        </button>
        <button
          onClick={handleMaximize}
          className={`h-8 w-12 flex items-center justify-center transition-colors ${
            theme === 'dark'
              ? 'text-purple-300 hover:text-white hover:bg-purple-900'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
          aria-label={isMaximized ? "Restore" : "Maximize"}
        >
          {isMaximized ? <Copy size={10} /> : <Square size={12} />}
        </button>
        <button
          onClick={handleClose}
          className={`h-8 w-12 flex items-center justify-center transition-colors group ${
            theme === 'dark'
              ? 'text-purple-300 hover:text-white hover:bg-red-700'
              : 'text-gray-500 hover:text-gray-700 hover:bg-red-100 group-hover:text-red-600'
          }`}
          aria-label="Close"
        >
          <X size={14} className="group-hover:text-inherit" />
        </button>
      </div>
    </div>
  );
};

export default TitleBar;