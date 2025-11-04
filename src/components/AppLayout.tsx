import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import TitleBar from './TitleBar';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();

  // Don't show TitleBar on Settings page (it has its own header)
  const showTitleBar = location.pathname !== '/settings';

  const titleBarVariants = {
    initial: {
      opacity: 0,
      y: -20,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: -20,
    },
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <AnimatePresence mode="wait">
        {showTitleBar && (
          <motion.div
            key="titlebar"
            variants={titleBarVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              type: 'tween',
              ease: [0.25, 0.46, 0.45, 0.94],
              duration: 0.3,
            }}
          >
            <TitleBar />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        className="flex-1 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          type: 'tween',
          ease: [0.25, 0.46, 0.45, 0.94],
          duration: 0.4,
          delay: 0.1
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default AppLayout;