import { cn } from '@taffy/components';
import { ReactNode, useEffect, useState } from 'react';
import Mousetrap from 'mousetrap';

interface ShortcutWrapperProps {
  children: ReactNode;
  keys: string;
  keysPretty?: ReactNode;
  action: () => void;
  className?: string;
  hideHint?: boolean;
}

export function ButtonWithHotkey({
  children,
  action,
  keys,
  hideHint,
  keysPretty,
  className,
}: ShortcutWrapperProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const containerClasses = cn(
    'relative inline-block cursor-pointer',
    className
  );

  useEffect(() => {
    const ms = new Mousetrap();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey) {
        setShowTooltip(true);
      }
    };

    const handleKeyUp = () => {
      setShowTooltip(false);
    };

    ms.bind(keys, action);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      ms.unbind(keys);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [keys, action]);

  return (
    <div className={containerClasses} onClick={action}>
      {children}
      {showTooltip && !hideHint && (
        <div className="absolute top-full bg-background rounded z-50 text-[8px] border-1">
          {keysPretty || keys}{' '}
        </div>
      )}
    </div>
  );
}
