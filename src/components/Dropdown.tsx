import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, ChevronRight } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
}

const Dropdown: React.FC<DropdownProps> = ({ trigger, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {/* Dropdown Content */}
      <div
        className={`absolute right-0 mt-2 w-56 rounded-2xl shadow-soft border transition-all duration-300 transform origin-top-right ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        } ${
          theme === 'dark'
            ? 'bg-card border-border text-foreground'
            : 'bg-white border-border text-foreground'
        }`}
        style={{ zIndex: 50 }}
      >
        {children}
      </div>
    </div>
  );
};

interface UserDropdownProps {
  onAccountClick?: () => void;
  onSettingsClick?: () => void;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({ onAccountClick, onSettingsClick }) => {
  const { theme } = useTheme();

  const trigger = (
    <button className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-mint to-sky flex items-center justify-center hover:scale-105 transition-transform cursor-pointer">
      <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
    </button>
  );

  return (
    <Dropdown trigger={trigger}>
      <div className="p-2">
        {/* Account Option */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAccountClick?.();
          }}
          className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
            theme === 'dark'
              ? 'hover:bg-muted text-foreground'
              : 'hover:bg-gray-50 text-gray-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              theme === 'dark' ? 'bg-muted' : 'bg-gray-100'
            }`}>
              <User className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="font-medium text-sm">Account</div>
              <div className={`text-xs ${
                theme === 'dark' ? 'text-muted-foreground' : 'text-gray-500'
              }`}>
                Manage your profile
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 opacity-50" />
        </button>

        {/* Settings Option */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSettingsClick?.();
          }}
          className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
            theme === 'dark'
              ? 'hover:bg-muted text-foreground'
              : 'hover:bg-gray-50 text-gray-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              theme === 'dark' ? 'bg-muted' : 'bg-gray-100'
            }`}>
              <Settings className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="font-medium text-sm">Settings</div>
              <div className={`text-xs ${
                theme === 'dark' ? 'text-muted-foreground' : 'text-gray-500'
              }`}>
                App preferences
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 opacity-50" />
        </button>
      </div>
    </Dropdown>
  );
};

export default Dropdown;