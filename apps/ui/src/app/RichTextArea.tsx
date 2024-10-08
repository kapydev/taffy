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
import { setAdditionalContext } from '../stores/chat-store';

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
        console.log(component?.editor.getText());

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

export function RichTextArea() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Mention.configure({
        HTMLAttributes: { class: 'text-blue-400' },
        suggestion: mentionSuggestion,
      }),
      Placeholder.configure({
        placeholder: 'Key "@" to add context files.',
      }),
    ],
    autofocus: true,
    editorProps: {
      attributes: {
        class:
          'focus-visible:outline-none bg-vsc-input-background py-2 pl-3 rounded-t-md text-xs',
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

  return <EditorContent className="w-full" editor={editor} />;
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

  const enterHandler = () => {
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

      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }

      if (event.key === 'Tab') {
        enterHandler();
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
              'hover:bg-white/10 p-1 truncate' +
              (index === selectedIndex ? 'bg-white/20' : '')
            }
            key={index}
            onClick={() => selectItem(index)}
          >
            {item}
          </button>
        ))
      ) : (
        <div className="item">No result</div>
      )}
    </div>
  );
});
