'use client';
import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface TextShimmerProps {
  children: string;
  as?: keyof React.ReactHTML;
  className?: string;
  duration?: number;
  spread?: number;
}

export function TextShimmer({
  children,
  as: Component = 'p',
  className,
  duration = 2,
  spread = 2,
}: TextShimmerProps) {
  const dynamicSpread = useMemo(() => {
    return children.length * spread;
  }, [children, spread]);

  return (
    <Component
      className={cn(
        'relative inline-block animate-shimmer',
        className
      )}
      style={{
        backgroundSize: '250% 100%, auto',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        backgroundImage: `linear-gradient(90deg, transparent calc(50% - ${dynamicSpread}px), var(--base-gradient-color), transparent calc(50% + ${dynamicSpread}px)), linear-gradient(var(--base-color), var(--base-color))`,
        backgroundPosition: '100% center, center',
        backgroundRepeat: 'no-repeat, padding-box',
        animationDuration: `${duration}s`,
      } as React.CSSProperties}
    >
      {children}
    </Component>
  );
}