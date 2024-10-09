import { useEditor, EditorContent, Editor, JSONContent } from '@tiptap/react';
import Placeholder from '@tiptap/extension-placeholder';
import Mention, { MentionOptions } from '@tiptap/extension-mention';
import StarterKit from '@tiptap/starter-kit';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  Ref,
  KeyboardEvent,
} from 'react';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import { ReactRenderer } from '@tiptap/react';
import { trpc } from '../client';
import { booleanFilter } from '@taffy/shared-helpers';
import {
  chatStore,
  continuePrompt,
  setAdditionalContext,
} from '../stores/chat-store';
import { updateChat } from '../stores/update-prompt';

type MentionItem = string;
type MentionCommandProps = {
  id: string;
};

const mentionSuggestion: MentionOptions['suggestion'] = {
  items: async ({ query }): Promise<MentionItem[]> => {
    const results = await trpc.files.searchFiles.query({ query });
    return results.map((item) => item.target);
  },
  render: () => {
    let component: ReactRenderer<MentionListProps> | null = null;
    let popup: TippyInstance[] | null = null;

    return {
      onStart: (props) => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        }) as any;

        if (!props.clientRect) {
          return;
        }

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: (component as any).element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          //   placement: 'top-start',
        } as any);
      },

      onUpdate(props) {
        component!.updateProps(props);

        if (!props.clientRect) {
          return;
        }

        popup![0].setProps({
          getReferenceClientRect: props.clientRect as any,
        });
      },

      onKeyDown(props) {
        if (props.event.key === 'Escape') {
          popup![0].hide();
          return true;
        }

        return (component!.ref as any)?.onKeyDown(props);
      },

      onExit() {
        popup![0].destroy();
        component!.destroy();
      },
    };
  },
};

function getNodesByType(editor: Editor, type: string) {
  const json = editor.getJSON();
  const results: JSONContent[] = [];
  const parseJson = (node: JSONContent) => {
    if (node.type === type) results.push(node);
    node.content?.forEach(parseJson);
  };
  parseJson(json);
  return results;
}

interface RichTextAreaProps {
  onSend?: (input: string) => void;
}

export function RichTextArea({ onSend }: RichTextAreaProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Mention.configure({
        HTMLAttributes: { class: 'text-blue-400' },
        suggestion: mentionSuggestion,
      }),
      Placeholder.configure({
        placeholder: 'Type your message...',
      }),
    ],
    autofocus: true,
    editorProps: {
      attributes: {
        class:
          // 'flex min-h-[80px] w-full rounded-md bg-background pl-3 pr-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-1 border-none w-full',
          'focus-visible:outline-none min-h-[80px] bg-vsc-input-background py-2 pl-3 pr-10 rounded-b-md text-xs',
      },
    },
    onUpdate(props) {
      const mentions = getNodesByType(props.editor, 'mention');
      const additionalFileNames: string[] = mentions
        .map((mention) => mention.attrs?.id)
        .filter(booleanFilter);
      setAdditionalContext(additionalFileNames);
    },
  });

  useEffect(() => {
    const handleWindowFocus = () => {
      editor?.commands.focus();
    };
    handleWindowFocus();
    window.addEventListener('focus', handleWindowFocus);
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [editor]);

  const handleSend = async () => {
    const input = editor?.getText();
    if (!input?.trim()) return;
    editor?.commands.clearContent();
    const mode = chatStore.get('mode');
    await updateChat(input, mode);
    await continuePrompt(mode);
    onSend?.(input);
  };

  return (
    <EditorContent
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend();
        }
      }}
      className="w-full"
      editor={editor}
    />
  );
}

interface MentionListProps {
  items: MentionItem[];
  command: (command: MentionCommandProps) => void;
}

const MentionList = forwardRef<unknown, MentionListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];

    if (item) {
      props.command({ id: item });
    }
  };

  const upHandler = () => {
    setSelectedIndex(
      (selectedIndex + props.items.length - 1) % props.items.length
    );
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const tabHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }

      if (event.key === 'Tab') {
        tabHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <div className="flex flex-col bg-background border rounded-md w-full text-xs">
      {props.items.length ? (
        props.items.map((item, index) => (
          <button
            className={
              'hover:bg-white/10 p-1 ' +
              (index === selectedIndex ? 'bg-white/20' : '')
            }
            key={index}
            onClick={() => selectItem(index)}
          >
            <span className="flex truncate w-full">{item}</span>
          </button>
        ))
      ) : (
        <div className="item">No result</div>
      )}
    </div>
  );
});
