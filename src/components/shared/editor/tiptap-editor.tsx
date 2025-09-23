"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { uploadImage } from "@/lib/utils/upload-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  ChevronDown,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo,
  Strikethrough,
  Type,
  Underline as UnderlineIcon,
  Undo,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Add Image extension
import Image from "@tiptap/extension-image";

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  showToolbar?: boolean;
}

export default function TiptapEditor({
  content,
  onChange,
  placeholder,
  className,
  showToolbar = true,
}: TiptapEditorProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isToolbarInteracting, setIsToolbarInteracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false as unknown as undefined,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Underline,
      Image, // Add Image extension
    ],
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onFocus: () => {
      setIsFocused(true);
    },
    onBlur: (_props) => {
      setTimeout(() => {
        if (!isToolbarInteracting) {
          setIsFocused(false);
        }
      }, 100);
    },
    editorProps: {
      attributes: {
        class: `prose max-w-none focus:outline-none p-3 min-h-[40px] transition-all duration-200 ${className || ""}`,
        "data-placeholder": placeholder || "",
      },
    },
  });

  // Handle drag and drop events
  useEffect(() => {
    const container = editorContainerRef.current;
    if (!container) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith("image/")) {
          await handleImageUpload(file);
        }
      }
    };

    container.addEventListener("dragover", handleDragOver);
    container.addEventListener("drop", handleDrop);

    return () => {
      container.removeEventListener("dragover", handleDragOver);
      container.removeEventListener("drop", handleDrop);
    };
  }, []); // Empty dependency array is fine here

  // Handle image upload to Vercel Blob
  const handleImageUpload = async (file: File) => {
    if (!editor) return;

    try {
      setIsUploading(true);

      // Upload image to Vercel Blob
      const result = await uploadImage(file);

      // Insert the image at the current cursor position
      editor.chain().focus().setImage({ src: result.url }).run();
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file input change
  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      await handleImageUpload(file);
    }
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content, {
        parseOptions: { preserveWhitespace: "full" },
      });
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const setHeading = (level: 1 | 2 | 3) => {
    editor.chain().focus().toggleHeading({ level }).run();
  };

  return (
    <div
      ref={editorContainerRef}
      className={
        "relative rounded-md bg-background transition-all duration-200"
      }
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/*"
        className="hidden"
      />

      {/* Fixed Toolbar - Only show when focused */}
      {showToolbar && (isFocused || isToolbarInteracting) && (
        <div
          className=" bg-muted/50 p-2"
          data-toolbar
          onMouseEnter={() => setIsToolbarInteracting(true)}
          onMouseLeave={() => setIsToolbarInteracting(false)}
        >
          <TooltipProvider>
            <div className="flex flex-wrap items-center gap-1">
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <Type className="mr-1 h-4 w-4" />
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Text formatting</p>
                  </TooltipContent>
                </Tooltip>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => editor.chain().focus().setParagraph().run()}
                  >
                    <Type className="mr-2 h-4 w-4" />
                    Normal
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setHeading(1)}
                    className={
                      editor.isActive("heading", { level: 1 })
                        ? "bg-accent"
                        : ""
                    }
                  >
                    <Heading1 className="mr-2 h-4 w-4" />
                    Heading 1
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setHeading(2)}
                    className={
                      editor.isActive("heading", { level: 2 })
                        ? "bg-accent"
                        : ""
                    }
                  >
                    <Heading2 className="mr-2 h-4 w-4" />
                    Heading 2
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setHeading(3)}
                    className={
                      editor.isActive("heading", { level: 3 })
                        ? "bg-accent"
                        : ""
                    }
                  >
                    <Heading3 className="mr-2 h-4 w-4" />
                    Heading 3
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 px-2 ${editor.isActive("bold") ? "bg-gray-200 dark:bg-gray-700" : ""}`}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Bold (Ctrl+B)</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 px-2 ${editor.isActive("italic") ? "bg-gray-200 dark:bg-gray-700" : ""}`}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Italic (Ctrl+I)</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 px-2 ${editor.isActive("underline") ? "bg-gray-200 dark:bg-gray-700" : ""}`}
                    onClick={() =>
                      editor.chain().focus().toggleUnderline().run()
                    }
                  >
                    <UnderlineIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Underline (Ctrl+U)</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 px-2 ${editor.isActive("strike") ? "bg-gray-200 dark:bg-gray-700" : ""}`}
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                  >
                    <Strikethrough className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Strikethrough</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 px-2 ${editor.isActive("code") ? "bg-gray-200 dark:bg-gray-700" : ""}`}
                    onClick={() => editor.chain().focus().toggleCode().run()}
                  >
                    <Code className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Inline code</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 px-2 ${editor.isActive("link") ? "bg-gray-200 dark:bg-gray-700" : ""}`}
                    onClick={addLink}
                  >
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add link (Ctrl+K)</p>
                </TooltipContent>
              </Tooltip>

              <div className="mx-1 h-5 w-px bg-border" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 px-2 ${editor.isActive("bulletList") ? "bg-gray-200 dark:bg-gray-700" : ""}`}
                    onClick={() =>
                      editor.chain().focus().toggleBulletList().run()
                    }
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Bullet list</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 px-2 ${editor.isActive("orderedList") ? "bg-gray-200 dark:bg-gray-700" : ""}`}
                    onClick={() =>
                      editor.chain().focus().toggleOrderedList().run()
                    }
                  >
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Numbered list</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 px-2 ${editor.isActive("blockquote") ? "bg-gray-200 dark:bg-gray-700" : ""}`}
                    onClick={() =>
                      editor.chain().focus().toggleBlockquote().run()
                    }
                  >
                    <Quote className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Blockquote</p>
                </TooltipContent>
              </Tooltip>

              <div className="mx-1 h-5 w-px bg-border" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                  >
                    <Undo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Undo (Ctrl+Z)</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                  >
                    <Redo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Redo (Ctrl+Y)</p>
                </TooltipContent>
              </Tooltip>

              {/* Add Image Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={triggerFileInput}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isUploading ? "Uploading..." : "Upload Image"}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>
      )}

      {/* Editor Content */}
      <div className="overflow-hidden transition-colors">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
