import Mousetrap from 'mousetrap';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { trpc } from '../client';

// Allow Mousetrap to work inside input fields
Mousetrap.prototype.stopCallback = function () {
  return false;
};

const handlers = {
  'ctrl+l': {
    name: 'Toggle Codebase Context',
    action: async () => {
      toast('Adding codebase context');
      const x = await trpc.files.getWorkspaceFiles.query();
      console.log(x);
    },
  },
};

export function KeyboardShortCuts() {
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
