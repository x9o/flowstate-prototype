import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ListItem {
  id: string;
  name: string;
  type: 'app' | 'website';
  pattern: string; // Pattern to match against window title or URL
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
  { name: 'Notion', type: 'app', pattern: 'notion', icon: 'SiNotion' },
  { name: 'Slack', type: 'app', pattern: 'slack', icon: 'SiSlack' },
  { name: 'VS Code', type: 'app', pattern: 'visual studio code|vscode|code', icon: 'SiVisualstudiocode' },
  { name: 'GitHub', type: 'website', pattern: 'github', icon: 'SiGithub' },
  { name: 'Stack Overflow', type: 'website', pattern: 'stackoverflow', icon: 'SiStackoverflow' },
  { name: 'Google Docs', type: 'website', pattern: 'docs.google', icon: 'SiGoogledocs' },
  { name: 'Microsoft Teams', type: 'app', pattern: 'teams', icon: 'SiMicrosoftteams' },
  { name: 'Zoom', type: 'app', pattern: 'zoom', icon: 'SiZoom' },
  { name: 'Figma', type: 'app', pattern: 'figma', icon: 'SiFigma' },
  { name: 'Jira', type: 'website', pattern: 'jira|atlassian', icon: 'SiJira' },
];

// Default blocklist - distraction apps
const DEFAULT_BLOCKLIST: Omit<ListItem, 'id'>[] = [
  { name: 'Instagram', type: 'website', pattern: 'instagram', icon: 'SiInstagram' },
  { name: 'TikTok', type: 'app', pattern: 'tiktok', icon: 'SiTiktok' },
  { name: 'Roblox', type: 'app', pattern: 'roblox', icon: 'SiRoblox' },
  { name: 'Netflix', type: 'website', pattern: 'netflix', icon: 'SiNetflix' },
  { name: 'YouTube', type: 'website', pattern: 'youtube', icon: 'SiYoutube' },
  { name: 'Twitch', type: 'website', pattern: 'twitch', icon: 'SiTwitch' },
  { name: 'Facebook', type: 'website', pattern: 'facebook', icon: 'SiFacebook' },
  { name: 'Snapchat', type: 'app', pattern: 'snapchat', icon: 'SiSnapchat' },
];

export const ListsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [whitelist, setWhitelist] = useState<ListItem[]>([]);
  const [blocklist, setBlocklist] = useState<ListItem[]>([]);

  // Load lists from localStorage on mount
  useEffect(() => {
    const savedWhitelist = localStorage.getItem('flowstate-whitelist');
    const savedBlocklist = localStorage.getItem('flowstate-blocklist');

    if (savedWhitelist) {
      setWhitelist(JSON.parse(savedWhitelist));
    } else {
      // Set default whitelist
      const defaultWhitelist = DEFAULT_WHITELIST.map((item, index) => ({
        ...item,
        id: `wl-${index}`,
      }));
      setWhitelist(defaultWhitelist);
      localStorage.setItem('flowstate-whitelist', JSON.stringify(defaultWhitelist));
    }

    if (savedBlocklist) {
      setBlocklist(JSON.parse(savedBlocklist));
    } else {
      // Set default blocklist
      const defaultBlocklist = DEFAULT_BLOCKLIST.map((item, index) => ({
        ...item,
        id: `bl-${index}`,
      }));
      setBlocklist(defaultBlocklist);
      localStorage.setItem('flowstate-blocklist', JSON.stringify(defaultBlocklist));
    }
  }, []);

  // Save whitelist to localStorage whenever it changes
  useEffect(() => {
    if (whitelist.length > 0) {
      localStorage.setItem('flowstate-whitelist', JSON.stringify(whitelist));
    }
  }, [whitelist]);

  // Save blocklist to localStorage whenever it changes
  useEffect(() => {
    if (blocklist.length > 0) {
      localStorage.setItem('flowstate-blocklist', JSON.stringify(blocklist));
    }
  }, [blocklist]);

  const addToWhitelist = (item: Omit<ListItem, 'id'>) => {
    const newItem: ListItem = {
      ...item,
      id: `wl-${Date.now()}`,
    };
    setWhitelist([...whitelist, newItem]);
  };

  const addToBlocklist = (item: Omit<ListItem, 'id'>) => {
    const newItem: ListItem = {
      ...item,
      id: `bl-${Date.now()}`,
    };
    setBlocklist([...blocklist, newItem]);
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
