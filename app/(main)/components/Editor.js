// components/RichTextEditor.jsx
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt("Enter image URL");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 border-b px-4 py-2 bg-gray-50">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className="btn"
      >
        Bold
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className="btn"
      >
        Italic
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className="btn"
      >
        Underline
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className="btn"
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className="btn"
      >
        Left
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className="btn"
      >
        Center
      </button>
      <button onClick={addImage} className="btn">
        Add Image
      </button>
    </div>
  );
};

const Editor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: `
      <h1>This is a Figma WYSIWYG Editor</h1>
      <p>You can add text, style it, and insert images like Figma UI.</p>
    `,
  });

  return (
    <div className="max-w-3xl mx-auto mt-10 border rounded-lg shadow overflow-hidden">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="prose max-w-none p-4" />
    </div>
  );
};

export default Editor;
