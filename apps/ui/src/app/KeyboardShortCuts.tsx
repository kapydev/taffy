import Mousetrap from 'mousetrap';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

// Allow Mousetrap to work inside input fields
Mousetrap.prototype.stopCallback = function () {
  return false;
};

const handlers = {
  'ctrl+l': {
    name: 'Toggle Codebase Context',
    action: () => {
      toast('Adding codebase context');
    },
  },
};

export function KeyboardShortCuts() {
  useEffect(() => {
    Object.entries(handlers).forEach(([shortcut, handler]) => {
      Mousetrap.bind(shortcut, () => handler.action());
    });
    return () => {
      Mousetrap.unbind(Object.keys(handlers));
    };
  }, []);

  return null;
}

