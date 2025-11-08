import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ListItem {
  id: string;
  name: string;
  pattern: string; // Pattern to match against window title, app name, or URL
  icon?: string; // Icon component name from react-icons
}

interface ListsContextType {
  whitelist: ListItem[];
  blocklist: ListItem[];
  addToWhitelist: (item: Omit<ListItem, 'id'>) => void;
  addToBlocklist: (item: Omit<ListItem, 'id'>) => void;
  removeFromWhitelist: (id: string) => void;
  removeFromBlocklist: (id: string) => void;
  isWhitelisted: (windowTitle: string, appName: string, url?: string) => boolean;
  isBlocklisted: (windowTitle: string, appName: string, url?: string) => boolean;
}

const ListsContext = createContext<ListsContextType | undefined>(undefined);

// Default whitelist - productivity apps
const DEFAULT_WHITELIST: Omit<ListItem, 'id'>[] = [
  { name: 'Notion', pattern: 'notion', icon: 'SiNotion' },
  { name: 'Slack', pattern: 'slack', icon: 'SiSlack' },
  { name: 'VS Code', pattern: 'visual studio code|vscode|code', icon: 'SiVisualstudiocode' },
  { name: 'GitHub', pattern: 'github', icon: 'SiGithub' },
  { name: 'Stack Overflow', pattern: 'stackoverflow', icon: 'SiStackoverflow' },
  { name: 'Google Docs', pattern: 'docs.google', icon: 'SiGoogledocs' },
  { name: 'Microsoft Teams', pattern: 'teams', icon: 'SiMicrosoftteams' },
  { name: 'Zoom', pattern: 'zoom', icon: 'SiZoom' },
  { name: 'Figma', pattern: 'figma', icon: 'SiFigma' },
  { name: 'Jira', pattern: 'jira|atlassian', icon: 'SiJira' },
];

// Default blocklist - distraction apps
const DEFAULT_BLOCKLIST: Omit<ListItem, 'id'>[] = [
  { name: 'Instagram', pattern: 'instagram', icon: 'SiInstagram' },
  { name: 'TikTok', pattern: 'tiktok', icon: 'SiTiktok' },
  { name: 'Roblox', pattern: 'roblox', icon: 'SiRoblox' },
  { name: 'Netflix', pattern: 'netflix', icon: 'SiNetflix' },
  { name: 'YouTube', pattern: 'youtube', icon: 'SiYoutube' },
  { name: 'Twitch', pattern: 'twitch', icon: 'SiTwitch' },
  { name: 'Facebook', pattern: 'facebook', icon: 'SiFacebook' },
  { name: 'Snapchat', pattern: 'snapchat', icon: 'SiSnapchat' },
];

export const ListsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [whitelist, setWhitelist] = useState<ListItem[]>([]);
  const [blocklist, setBlocklist] = useState<ListItem[]>([]);

  // Load lists from localStorage on mount
  useEffect(() => {
    const savedWhitelist = localStorage.getItem('flowstate-whitelist');
    const savedBlocklist = localStorage.getItem('flowstate-blocklist');

    try {
      if (savedWhitelist) {
        const parsedWhitelist = JSON.parse(savedWhitelist);
        console.log('📋 Loaded whitelist from localStorage:', parsedWhitelist);
        setWhitelist(parsedWhitelist);
      } else {
        // Set default whitelist
        const defaultWhitelist = DEFAULT_WHITELIST.map((item, index) => ({
          ...item,
          id: `wl-${index}`,
        }));
        console.log('📋 Setting default whitelist:', defaultWhitelist);
        setWhitelist(defaultWhitelist);
        localStorage.setItem('flowstate-whitelist', JSON.stringify(defaultWhitelist));
      }

      if (savedBlocklist) {
        const parsedBlocklist = JSON.parse(savedBlocklist);
        console.log('🚫 Loaded blocklist from localStorage:', parsedBlocklist);
        setBlocklist(parsedBlocklist);
      } else {
        // Set default blocklist
        const defaultBlocklist = DEFAULT_BLOCKLIST.map((item, index) => ({
          ...item,
          id: `bl-${index}`,
        }));
        console.log('🚫 Setting default blocklist:', defaultBlocklist);
        setBlocklist(defaultBlocklist);
        localStorage.setItem('flowstate-blocklist', JSON.stringify(defaultBlocklist));
      }
    } catch (error) {
      console.error('Error loading lists from localStorage:', error);
      // If there's an error (e.g., corrupted data), load defaults
      const defaultWhitelist = DEFAULT_WHITELIST.map((item, index) => ({
        ...item,
        id: `wl-${index}`,
      }));
      const defaultBlocklist = DEFAULT_BLOCKLIST.map((item, index) => ({
        ...item,
        id: `bl-${index}`,
      }));
      setWhitelist(defaultWhitelist);
      setBlocklist(defaultBlocklist);
      localStorage.setItem('flowstate-whitelist', JSON.stringify(defaultWhitelist));
      localStorage.setItem('flowstate-blocklist', JSON.stringify(defaultBlocklist));
    }
  }, []);

  // Save whitelist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('flowstate-whitelist', JSON.stringify(whitelist));
  }, [whitelist]);

  // Save blocklist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('flowstate-blocklist', JSON.stringify(blocklist));
  }, [blocklist]);

  const addToWhitelist = (item: Omit<ListItem, 'id'>) => {
    const newItem: ListItem = {
      ...item,
      id: `wl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setWhitelist(prev => [...prev, newItem]);
  };

  const addToBlocklist = (item: Omit<ListItem, 'id'>) => {
    const newItem: ListItem = {
      ...item,
      id: `bl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setBlocklist(prev => [...prev, newItem]);
  };

  const removeFromWhitelist = (id: string) => {
    setWhitelist(whitelist.filter(item => item.id !== id));
  };

  const removeFromBlocklist = (id: string) => {
    setBlocklist(blocklist.filter(item => item.id !== id));
  };

  const matchesPattern = (pattern: string, windowTitle: string, appName: string, url?: string): boolean => {
    const lowerPattern = pattern.toLowerCase();
    const lowerTitle = windowTitle.toLowerCase();
    const lowerApp = appName.toLowerCase();
    const lowerUrl = url?.toLowerCase() || '';

    // Split pattern by | for OR matching
    const patterns = lowerPattern.split('|');

    return patterns.some(p => {
      const trimmedPattern = p.trim();
      return lowerTitle.includes(trimmedPattern) ||
             lowerApp.includes(trimmedPattern) ||
             lowerUrl.includes(trimmedPattern);
    });
  };

  const isWhitelisted = (windowTitle: string, appName: string, url?: string): boolean => {
    return whitelist.some(item => matchesPattern(item.pattern, windowTitle, appName, url));
  };

  const isBlocklisted = (windowTitle: string, appName: string, url?: string): boolean => {
    return blocklist.some(item => matchesPattern(item.pattern, windowTitle, appName, url));
  };

  return (
    <ListsContext.Provider
      value={{
        whitelist,
        blocklist,
        addToWhitelist,
        addToBlocklist,
        removeFromWhitelist,
        removeFromBlocklist,
        isWhitelisted,
        isBlocklisted,
      }}
    >
      {children}
    </ListsContext.Provider>
  );
};

export const useLists = () => {
  const context = useContext(ListsContext);
  if (context === undefined) {
    throw new Error('useLists must be used within a ListsProvider');
  }
  return context;
};
