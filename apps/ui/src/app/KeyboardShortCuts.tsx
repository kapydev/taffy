import Mousetrap from 'mousetrap';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { trpc } from '../client';
import { chatStore, getToolMessages } from '../stores/chat-store';
import { ToolMessage } from '../llms/messages/ToolMessage';
import { toolToToolString } from '../llms/messages/tools';

// Allow Mousetrap to work inside input fields
Mousetrap.prototype.stopCallback = function () {
  return false;
};

const handlers = {
  'ctrl+l': {
    name: 'Toggle Codebase Context',
    action: async () => {
      const workspaceFiles = await trpc.files.getWorkspaceFiles.query();
      const curMessages = getToolMessages();
      const latestMsg = curMessages.at(-1);
      if (latestMsg?.type === 'USER_AVAILABLE_FILES') {
        chatStore.set('messages', curMessages.slice(0, -1));
        return;
      }

      chatStore.set('messages', [
        ...curMessages,
        new ToolMessage(
          toolToToolString('USER_AVAILABLE_FILES', {
            body: workspaceFiles.join('\n'),
            props: {},
          })
        ),
      ]);
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
