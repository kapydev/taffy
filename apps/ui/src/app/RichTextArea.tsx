import { Button } from '@taffy/components';
import { booleanFilter } from '@taffy/shared-helpers';
import Mention, {
  MentionNodeAttrs,
  MentionOptions,
} from '@tiptap/extension-mention';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Editor,
  EditorContent,
  JSONContent,
  ReactRenderer,
  useEditor,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  LoaderCircle,
  MessageSquarePlus,
  Plus,
  Send,
  Settings,
} from 'lucide-react';
import {
  forwardRef,
  KeyboardEvent,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import { trpc } from '../client';
import {
  addAddtionalContext,
  chatStore,
  continuePrompt,
  resetChatStore,
} from '../stores/chat-store';
import { updateChat } from '../stores/update-prompt';
import { SuggestionProps } from '@tiptap/suggestion';
import toast from 'react-hot-toast';

type MentionItem = string;

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
  const showSettings = chatStore.use('showSettings');

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
          'focus-visible:outline-none min-h-[90px] bg-vsc-input-background py-1 pt-3 pl-3 pr-10 rounded-md text-xs',
      },
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
    const input = editor?.getText().trimEnd();
    if (!editor) return;
    if (!input?.trim()) return;
    const mode = chatStore.get('mode');
    const mentions = getNodesByType(editor, 'mention');
    const additionalFileNames: string[] = mentions
      .map((mention) => mention.attrs?.id)
      .filter(booleanFilter);
    await Promise.all(
      additionalFileNames.map(async (fileName) => {
        await addAddtionalContext(fileName);
      })
    );
    editor?.commands.clearContent();
    //Do not prompt if it is only mentions added
    if (input.trim().split(' ').every((item) => item.includes('@'))) {
      return toast.success('Files added to context!');
    }
    await updateChat(input, mode);
    await continuePrompt(mode);
    onSend?.(input);
  };

  return (
    <div className="relative">
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
      <div className="flex flex-col absolute right-0 inset-y-0 p-1.5">
        <Button
          className="hover:bg-white/10 w-7 h-7 shadow-none"
          size="icon"
          variant="default"
          onClick={handleSend}
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
        <Button
          className="hover:bg-white/10 w-7 h-7 shadow-none"
          size="icon"
          variant="default"
          onClick={() => chatStore.set('showSettings', !showSettings)}
        >
          <Settings className="h-3.5 w-3.5" />
        </Button>
        <Button
          className="hover:bg-white/10 w-7 h-7 shadow-none text-vsc-foreground"
          size="icon"
          variant="default"
          onClick={resetChatStore}
        >
          <MessageSquarePlus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

const mentionSuggestion: MentionOptions['suggestion'] = {
  items: async ({ query }): Promise<MentionItem[]> => {
    const results = await trpc.files.searchFiles.query({ query });
    return results.map((item) => item.target);
  },

  render: () => {
    let component: ReactRenderer<MentionListProps> | null = null;
    let popup: TippyInstance[] | null = null;

    return {
      onBeforeStart(props) {
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
        component?.updateProps(props);

        if (!props.clientRect) {
          return;
        }

        popup?.[0].setProps({
          getReferenceClientRect: props.clientRect as any,
        });
      },

      onKeyDown(props) {
        if (props.event.key === 'Escape') {
          popup?.[0].hide();
          return true;
        }

        return (component?.ref as any)?.onKeyDown(props);
      },

      onExit() {
        popup?.[0].destroy();
        component?.destroy();
      },
    };
  },
};

type MentionListProps = SuggestionProps<any, MentionNodeAttrs>;

const MentionList = forwardRef<unknown, MentionListProps>((props, ref) => {
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  useEffect(() => {
    trpc.files.indexingCompleted.query().then(() => setLoading(false));
  });

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

      if (event.key === 'Enter' || event.key === 'Tab') {
        tabHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <div className="flex flex-col bg-background border rounded-md w-full text-xs p-2">
      {/* <p className="p-1 italic text-foreground opacity-6  0">
        Press "Tab" to select file
      </p> */}
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
      ) : loading ? (
        <div className="p-1 flex items-center gap-1 text-xs">
          <LoaderCircle className="animate-spin w-3 h-3" /> Indexing files,
          please wait...
        </div>
      ) : (
        <div className="p-1">No results</div>
      )}
    </div>
  );
});
