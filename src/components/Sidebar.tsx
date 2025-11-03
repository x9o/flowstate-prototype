import { Play, Clock, BarChart3, Settings, List } from "lucide-react";
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';

interface SidebarProps {
  onStartSession?: () => void;
}

export const Sidebar = ({ onStartSession }: SidebarProps) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={`w-64 h-full flex flex-col border-r ${
      theme === 'dark' ? 'bg-card border-border' : 'bg-white border-gray-200'
    }`}>
      {/* Quick Start Section */}
      <div className="p-6">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Quick Start
        </h3>
        <nav className="space-y-1">
          <button
            onClick={onStartSession}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              theme === 'dark'
                ? 'hover:bg-accent text-foreground'
                : 'hover:bg-gray-100 text-gray-900'
            }`}
          >
            <Play className="w-5 h-5 text-mint" />
            <span className="text-sm font-medium">Start Session</span>
          </button>

          <button
            onClick={() => handleNavigation('/')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              isActive('/')
                ? theme === 'dark'
                  ? 'bg-accent text-foreground'
                  : 'bg-gray-100 text-gray-900'
                : theme === 'dark'
                  ? 'hover:bg-accent text-foreground'
                  : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <Clock className="w-5 h-5 text-indigo" />
            <span className="text-sm font-medium">Recent Tasks</span>
          </button>

          <button
            onClick={() => handleNavigation('/stats')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              isActive('/stats')
                ? theme === 'dark'
                  ? 'bg-accent text-foreground'
                  : 'bg-gray-100 text-gray-900'
                : theme === 'dark'
                  ? 'hover:bg-accent text-foreground'
                  : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <BarChart3 className="w-5 h-5 text-sky" />
            <span className="text-sm font-medium">Stats</span>
          </button>

          <button
            onClick={() => handleNavigation('/settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              isActive('/settings')
                ? theme === 'dark'
                  ? 'bg-accent text-foreground'
                  : 'bg-gray-100 text-gray-900'
                : theme === 'dark'
                  ? 'hover:bg-accent text-foreground'
                  : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <Settings className="w-5 h-5 text-peach" />
            <span className="text-sm font-medium">Settings</span>
          </button>
        </nav>
      </div>

      {/* Divider */}
      <div className={`h-px mx-6 ${theme === 'dark' ? 'bg-border' : 'bg-gray-200'}`} />

      {/* Quick Access Section */}
      <div className="p-6">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Quick Access
        </h3>
        <nav className="space-y-1">
          <button
            onClick={() => handleNavigation('/lists')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              isActive('/lists')
                ? theme === 'dark'
                  ? 'bg-accent text-foreground'
                  : 'bg-gray-100 text-gray-900'
                : theme === 'dark'
                  ? 'hover:bg-accent text-foreground'
                  : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <List className="w-5 h-5 text-lavender" />
            <span className="text-sm font-medium">Lists</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
