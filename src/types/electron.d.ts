export interface ElectronAPI {
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  unmaximize: () => Promise<void>;
  isMaximized: () => Promise<boolean>;
  close: () => Promise<void>;
  setTheme: (theme: 'light' | 'dark') => Promise<void>;
  getTheme: () => Promise<'light' | 'dark'>;
  onWindowMaximize: (callback: () => void) => void;
  onWindowUnmaximize: (callback: () => void) => void;
  onThemeChange: (callback: (theme: 'light' | 'dark') => void) => void;
  removeAllListeners: (channel: string) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}