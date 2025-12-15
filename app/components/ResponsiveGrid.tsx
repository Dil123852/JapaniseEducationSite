'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: ReactNode;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ResponsiveGrid({ 
  children, 
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  className
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-4 sm:gap-4 md:gap-6',
    lg: 'gap-6 sm:gap-6 md:gap-8',
  };

  // Map column numbers to Tailwind classes (must be explicit for JIT)
  const mobile = cols.mobile || 1;
  const tablet = cols.tablet || 2;
  const desktop = cols.desktop || 3;

  const mobileClass = 
    mobile === 1 ? 'grid-cols-1' :
    mobile === 2 ? 'grid-cols-2' :
    mobile === 3 ? 'grid-cols-3' :
    'grid-cols-1';

  const tabletClass = 
    tablet === 1 ? 'sm:grid-cols-1' :
    tablet === 2 ? 'sm:grid-cols-2' :
    tablet === 3 ? 'sm:grid-cols-3' :
    tablet === 4 ? 'sm:grid-cols-4' :
    'sm:grid-cols-2';

  const desktopClass = 
    desktop === 1 ? 'lg:grid-cols-1' :
    desktop === 2 ? 'lg:grid-cols-2' :
    desktop === 3 ? 'lg:grid-cols-3' :
    desktop === 4 ? 'lg:grid-cols-4' :
    'lg:grid-cols-3';

  return (
    <div 
      className={cn(
        'grid',
        mobileClass,
        tabletClass,
        desktopClass,
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
}

