import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface LayoutTransitionProps {
  children: ReactNode;
  className?: string;
}

const layoutVariants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: 20,
  },
};

const LayoutTransition: React.FC<LayoutTransitionProps> = ({ children, className = "" }) => {
  return (
    <motion.div
      variants={layoutVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        type: 'tween',
        ease: [0.25, 0.46, 0.45, 0.94],
        duration: 0.3,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default LayoutTransition;