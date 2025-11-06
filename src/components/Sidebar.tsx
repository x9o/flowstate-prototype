import { Play, Clock, BarChart3, Settings, List, X } from "lucide-react";
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { useSidebar } from '@/contexts/SidebarContext';

interface SidebarProps {
  onStartSession?: () => void;
}

export const Sidebar = ({ onStartSession }: SidebarProps) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, closeSidebar } = useSidebar();

  const handleNavigation = (path: string) => {
    navigate(path);
    closeSidebar();
  };

  const handleStartSession = () => {
    onStartSession?.();
    closeSidebar();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 flex flex-col border-r z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } ${
        theme === 'dark' ? 'bg-card border-border' : 'bg-white border-gray-200'
      }`}>
      {/* Close button */}
      <div className="p-6 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Menu</h2>
        <button
          onClick={closeSidebar}
          className={`p-2 rounded-lg transition-colors ${
            theme === 'dark'
              ? 'hover:bg-accent text-foreground'
              : 'hover:bg-gray-100 text-gray-900'
          }`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Section */}
      <div className="px-6">
        <nav className="space-y-1">
          <button
            onClick={handleStartSession}
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
    </>
  );
};
