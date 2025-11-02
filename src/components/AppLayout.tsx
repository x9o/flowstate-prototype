import React from 'react';
import { useLocation } from 'react-router-dom';
import TitleBar from './TitleBar';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();

  // Don't show TitleBar on Settings page (it has its own header)
  const showTitleBar = location.pathname !== '/settings';

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {showTitleBar && <TitleBar />}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default AppLayout;