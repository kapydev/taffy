import { ReactNode, useEffect, useState } from 'react';
import { cn } from '@taffy/components';

interface ShortcutWrapperProps {
  children: ReactNode;
  keys: string;
  action: () => void;
  className?: string;
}

export function ButtonWithHotkey({
  children,
  action,
  keys,
  className,
}: ShortcutWrapperProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const containerClasses = cn(
    'relative inline-block cursor-pointer',
    className
  );

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
    <div className={containerClasses} onClick={action}>
      {children}
      {showTooltip && (
        <div className="absolute top-full bg-background rounded z-50 text-[8px] border-1">
          {keys}
        </div>
      )}
    </div>
  );
}
