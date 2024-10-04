import React, { useState, useEffect, ReactNode } from 'react';
import { ShortcutHandler } from '../app/KeyboardShortcuts/handlers';

interface ShortcutWrapperProps {
  children: ReactNode;
  keys: string;
  action: () => void;
}

export function ShortcutWrapper({
  children,
  action,
  keys,
}: ShortcutWrapperProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Control') {
        setShowTooltip(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Control') {
        setShowTooltip(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="relative inline-block">
      {children}
      {showTooltip && (
        <div className="absolute top-full bg-background rounded z-50 text-[8px] border-1">
          {keys}
        </div>
      )}
    </div>
  );
}
