import { getToolMessages, CompletionMode } from './chat-store';

function canBeInline() {
  const toolMessages = getToolMessages();
  const hasUserFileContents = toolMessages.some((msg) =>
    msg.isType('USER_FILE_CONTENTS')
  );
  return hasUserFileContents;
}

function inlineHasPriority() {
  const toolMessages = getToolMessages();

  if (toolMessages.at(-1)?.isType('USER_FILE_CONTENTS')) {
    return true;
  }

  const lastUserPromptIndex = toolMessages
    .map((msg, index) => (msg.isType('USER_PROMPT') ? index : null))
    .filter((index) => index !== null)
    .at(-1);

  if (
    lastUserPromptIndex !== undefined &&
    toolMessages[lastUserPromptIndex - 1]?.isType('USER_FILE_CONTENTS')
  ) {
    return true;
  }

  return false;
}

function canBeEdit() {
  const toolMessages = getToolMessages();
  const latestMsg = toolMessages.at(-1);
  const numWriteFileMsgs = toolMessages.filter(
    (m) => m.type === 'ASSISTANT_WRITE_FILE'
  ).length;
  return numWriteFileMsgs === 1 && latestMsg?.type === 'ASSISTANT_WRITE_FILE';
}

/**Returns all the possible modes in order of preference */
export function getPossibleModes(): CompletionMode[] {
  const result: CompletionMode[] = [];
  const canInline = canBeInline();
  const canEdit = canBeEdit();
  if (canEdit) {
    if (canInline) {
      result.push('inline-edit');
    }
    result.push('edit');
  }

  if (canInline) {
    result.push('inline');
  }
  result.push('full');

  const inlinePriority = inlineHasPriority();
  const inlinePriorityVal = inlinePriority ? -1 : 1;

  result.sort((a, b) => {
    const priorityA = a.includes('inline') ? inlinePriorityVal : 0;
    const priorityB = b.includes('inline') ? inlinePriorityVal : 0;

    return priorityA - priorityB;
  });

  return result;
}
