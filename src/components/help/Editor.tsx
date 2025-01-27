import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  editable?: boolean;
}

export const Editor = ({ content, onChange, editable = true }: EditorProps) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <EditorContent editor={editor} className="min-h-[200px] border rounded-md p-4" />
    </div>
  );
};