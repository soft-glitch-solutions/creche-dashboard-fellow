import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
} from 'lucide-react';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  editable?: boolean;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    // Prevent the event from propagating upwards to avoid any unintended behavior
    e.stopPropagation();
  };

  return (
    <div className="border-b p-2 space-x-2 flex flex-wrap gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          handleButtonClick(e);
          editor.chain().focus().toggleBold().run();
        }}
        className={editor.isActive('bold') ? 'bg-accent' : ''}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          handleButtonClick(e);
          editor.chain().focus().toggleItalic().run();
        }}
        className={editor.isActive('italic') ? 'bg-accent' : ''}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          handleButtonClick(e);
          editor.chain().focus().toggleStrike().run();
        }}
        className={editor.isActive('strike') ? 'bg-accent' : ''}
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          handleButtonClick(e);
          editor.chain().focus().toggleCode().run();
        }}
        className={editor.isActive('code') ? 'bg-accent' : ''}
      >
        <Code className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          handleButtonClick(e);
          editor.chain().focus().toggleHeading({ level: 1 }).run();
        }}
        className={editor.isActive('heading', { level: 1 }) ? 'bg-accent' : ''}
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          handleButtonClick(e);
          editor.chain().focus().toggleHeading({ level: 2 }).run();
        }}
        className={editor.isActive('heading', { level: 2 }) ? 'bg-accent' : ''}
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          handleButtonClick(e);
          editor.chain().focus().toggleHeading({ level: 3 }).run();
        }}
        className={editor.isActive('heading', { level: 3 }) ? 'bg-accent' : ''}
      >
        <Heading3 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          handleButtonClick(e);
          editor.chain().focus().toggleBulletList().run();
        }}
        className={editor.isActive('bulletList') ? 'bg-accent' : ''}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          handleButtonClick(e);
          editor.chain().focus().toggleOrderedList().run();
        }}
        className={editor.isActive('orderedList') ? 'bg-accent' : ''}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          handleButtonClick(e);
          editor.chain().focus().toggleBlockquote().run();
        }}
        className={editor.isActive('blockquote') ? 'bg-accent' : ''}
      >
        <Quote className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          handleButtonClick(e);
          editor.chain().focus().undo().run();
        }}
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          handleButtonClick(e);
          editor.chain().focus().redo().run();
        }}
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
};


export const Editor = ({ content, onChange, editable = true }: EditorProps) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML()); // This will update the content when the editor changes
    },
  });

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert border rounded-md overflow-hidden">
      {editable && <MenuBar editor={editor} />}
      <EditorContent editor={editor} className="min-h-[200px] p-4" />
    </div>
  );
};
