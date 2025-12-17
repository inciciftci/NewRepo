import React, { useCallback, useRef } from "react";
import { useEditor, EditorContent, NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
} from "lucide-react";

type RichTextEditorProps = {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  onImageAdd?: (file: File) => Promise<string>;
};

const ResizableImageComponent: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
  selected,
  deleteNode,
}) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const startPos = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const handleMouseDown = (e: React.MouseEvent, corner: string) => {
    e.preventDefault();
    e.stopPropagation();

    const img = imageRef.current;
    if (!img) return;

    startPos.current = {
      x: e.clientX,
      y: e.clientY,
      width: img.offsetWidth,
      height: img.offsetHeight,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startPos.current.x;

      let newWidth = startPos.current.width;

      if (corner.includes("right")) {
        newWidth = startPos.current.width + deltaX;
      } else if (corner.includes("left")) {
        newWidth = startPos.current.width - deltaX;
      }

      newWidth = Math.max(50, Math.min(newWidth, 800));

      updateAttributes({ width: newWidth });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const width = node.attrs.width || "auto";
  const alignment = node.attrs.alignment || "center";

  const alignmentClass =
    alignment === "left"
      ? "image-left"
      : alignment === "right"
      ? "image-right"
      : "image-center";

  return (
    <NodeViewWrapper
      className={`image-resizer ${selected ? "selected" : ""} ${alignmentClass}`}
      style={{ width: width === "auto" ? "auto" : `${width}px` }}
    >
      <img
        ref={imageRef}
        src={node.attrs.src}
        alt={node.attrs.alt || ""}
        style={{ width: "100%", height: "auto" }}
        draggable={false}
      />
      {selected && (
        <>
          <div
            className="resize-handle top-left"
            onMouseDown={(e) => handleMouseDown(e, "top-left")}
          />
          <div
            className="resize-handle top-right"
            onMouseDown={(e) => handleMouseDown(e, "top-right")}
          />
          <div
            className="resize-handle bottom-left"
            onMouseDown={(e) => handleMouseDown(e, "bottom-left")}
          />
          <div
            className="resize-handle bottom-right"
            onMouseDown={(e) => handleMouseDown(e, "bottom-right")}
          />
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              type="button"
              onClick={() => updateAttributes({ alignment: "left" })}
              className={`p-1 rounded ${
                alignment === "left" ? "bg-blue-500 text-white" : "bg-white/80"
              }`}
              title="Sola hizala"
            >
              <AlignLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => updateAttributes({ alignment: "center" })}
              className={`p-1 rounded ${
                alignment === "center" ? "bg-blue-500 text-white" : "bg-white/80"
              }`}
              title="Ortala"
            >
              <AlignCenter size={14} />
            </button>
            <button
              type="button"
              onClick={() => updateAttributes({ alignment: "right" })}
              className={`p-1 rounded ${
                alignment === "right" ? "bg-blue-500 text-white" : "bg-white/80"
              }`}
              title="Saga hizala"
            >
              <AlignRight size={14} />
            </button>
            <button
              type="button"
              onClick={() => deleteNode()}
              className="p-1 rounded bg-red-500 text-white"
              title="Sil"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </>
      )}
    </NodeViewWrapper>
  );
};

const ResizableImage = Node.create({
  name: "resizableImage",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: null },
      alignment: { default: "center" },
    };
  },

  parseHTML() {
    return [{ tag: "img[src]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },
});

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = "Not iceriginizi buraya yazin...",
  onImageAdd,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      ResizableImage,
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[200px] text-[#0F1A40]",
        "data-placeholder": placeholder,
      },
    },
  });

  const handleImageUpload = useCallback(async () => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;

      if (!file.type.startsWith("image/")) {
        alert("Lutfen bir gorsel dosyasi secin");
        return;
      }

      try {
        let imageUrl: string;

        if (onImageAdd) {
          imageUrl = await onImageAdd(file);
        } else {
          const reader = new FileReader();
          imageUrl = await new Promise((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        }

        editor
          .chain()
          .focus()
          .insertContent({
            type: "resizableImage",
            attrs: {
              src: imageUrl,
              alt: file.name,
              width: 400,
              alignment: "center",
            },
          })
          .run();
      } catch (error) {
        console.error("Error adding image:", error);
        alert("Gorsel eklenirken bir hata olustu");
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [editor, onImageAdd]
  );

  if (!editor) {
    return null;
  }

  return (
    <div className="rich-text-editor rounded-xl border border-[#C7D6FF] bg-[#F8FAFF] overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-[#E0E7FF] bg-[#F3F7FF]">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-[#E0E7FF] transition ${
            editor.isActive("bold") ? "bg-[#D0DFFF] text-[#3A6BBF]" : ""
          }`}
          title="Kalin"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-[#E0E7FF] transition ${
            editor.isActive("italic") ? "bg-[#D0DFFF] text-[#3A6BBF]" : ""
          }`}
          title="Italik"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded hover:bg-[#E0E7FF] transition ${
            editor.isActive("underline") ? "bg-[#D0DFFF] text-[#3A6BBF]" : ""
          }`}
          title="Alti cizili"
        >
          <UnderlineIcon size={16} />
        </button>

        <div className="w-px h-5 bg-[#D0DFFF] mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-[#E0E7FF] transition ${
            editor.isActive("bulletList") ? "bg-[#D0DFFF] text-[#3A6BBF]" : ""
          }`}
          title="Madde isareti"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-[#E0E7FF] transition ${
            editor.isActive("orderedList") ? "bg-[#D0DFFF] text-[#3A6BBF]" : ""
          }`}
          title="Numarali liste"
        >
          <ListOrdered size={16} />
        </button>

        <div className="w-px h-5 bg-[#D0DFFF] mx-1" />

        <button
          type="button"
          onClick={handleImageUpload}
          className="p-1.5 rounded hover:bg-[#E0E7FF] transition flex items-center gap-1 text-xs"
          title="Gorsel ekle"
        >
          <ImageIcon size={16} />
          <span className="hidden sm:inline">Gorsel</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <EditorContent
        editor={editor}
        className="px-3 py-2.5 text-sm min-h-[200px]"
      />
    </div>
  );
};

export default RichTextEditor;
