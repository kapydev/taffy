import { trpc } from '../../client';
import { ToolMessage } from '../../llms/messages/ToolMessage';
import { toolToToolString } from '../../llms/messages/tools';
import { chatStore } from '../../stores/chat-store';
import { getPossibleModes } from '../../stores/possible-modes';

export type ShortcutHandler = {
  name: string;
  action: () => Promise<void> | void;
};

export const toggleCodebaseContextHandler: ShortcutHandler = {
  name: 'Toggle Codebase Context',
  action: async () => {
    const workspaceFiles = await trpc.files.getWorkspaceFiles.query();
    const curMessages = chatStore.get('messages');
    const latestMsg = curMessages.at(-1);
    if (
      latestMsg instanceof ToolMessage &&
      latestMsg?.type === 'USER_AVAILABLE_FILES'
    ) {
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
};

export const toggleModeHandler: ShortcutHandler = {
  name: 'Toggle Mode',
  action: () => {
    const mode = chatStore.get('mode');
    const possibleModes = getPossibleModes();
    const currentModeIndex = possibleModes.indexOf(mode);

    let newMode;
    if (
      currentModeIndex === -1 ||
      currentModeIndex === possibleModes.length - 1
    ) {
      newMode = possibleModes[0];
    } else {
      newMode = possibleModes[currentModeIndex + 1];
    }

    chatStore.set('mode', newMode);
  },
};

export const handlers = {
  'ctrl+l': toggleCodebaseContextHandler,
  'ctrl+m': toggleModeHandler,
};
