import Mousetrap from 'mousetrap';
import { useEffect } from 'react';
import { handlers } from './handlers';

// Allow Mousetrap to work inside input fields
Mousetrap.prototype.stopCallback = function () {
  return false;
};

export function KeyboardShortcuts() {
  useEffect(() => {
    Object.entries(handlers).forEach(([shortcut, handler]) => {
      Mousetrap.bind(shortcut, () => {
        handler.action();
      });
    });
    return () => {
      Mousetrap.unbind(Object.keys(handlers));
    };
  }, []);

  return null;
}
