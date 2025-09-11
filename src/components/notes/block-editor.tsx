"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { BlockData, BlockType } from "@/types/note";
import {
  Code,
  GripVertical,
  Hash,
  List,
  ListOrdered,
  Minus,
  MoreHorizontal,
  Plus,
  Quote,
  Trash2,
  Type,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface BlockEditorProps {
  block: BlockData;
  index: number;
  onUpdate: (updatedBlock: Partial<BlockData>) => void;
  onDelete: () => void;
  onAddBlock: (type: BlockType) => void;
}

export function BlockEditor({
  block,
  index,
  onUpdate,
  onDelete,
  onAddBlock,
}: BlockEditorProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const content = block.content?.text || "";

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  });

  const handleContentChange = (newContent: string) => {
    onUpdate({
      content: { ...block.content, text: newContent },
    });
  };

  // Auto-focus when block is newly created
  useEffect(() => {
    if (!content && (textareaRef.current || inputRef.current)) {
      const element = textareaRef.current || inputRef.current;
      if (element) {
        element.focus();
      }
    }
  }, [content]); // Run when content changes

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Allow new line with Shift+Enter
    if (e.key === "Enter" && e.shiftKey) {
      // Let the default behavior happen (add new line)
      return;
    }

    // Create new block with Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      // For list items, create the same type of list item
      if (block.type === "bulleted_list_item") {
        onAddBlock("bulleted_list_item");
      } else if (block.type === "numbered_list_item") {
        onAddBlock("numbered_list_item");
      } else {
        onAddBlock("paragraph");
      }
    }

    // Delete block when backspace on empty block (except first block)
    if (e.key === "Backspace" && content === "" && index > 0) {
      e.preventDefault();
      onDelete();
    }

    // Convert to paragraph when backspace at beginning of list item
    if (
      e.key === "Backspace" &&
      content === "" &&
      (block.type === "bulleted_list_item" ||
        block.type === "numbered_list_item")
    ) {
      e.preventDefault();
      onUpdate({ type: "paragraph" });
    }
  };

  const blockTypeOptions = [
    { type: "paragraph", icon: Type, label: "Text" },
    { type: "heading_1", icon: Hash, label: "Heading 1" },
    { type: "heading_2", icon: Hash, label: "Heading 2" },
    { type: "heading_3", icon: Hash, label: "Heading 3" },
    { type: "bulleted_list_item", icon: List, label: "Bullet List" },
    { type: "numbered_list_item", icon: ListOrdered, label: "Numbered List" },
    { type: "quote", icon: Quote, label: "Quote" },
    { type: "code", icon: Code, label: "Code" },
    { type: "divider", icon: Minus, label: "Divider" },
  ];

  const getPlaceholder = () => {
    switch (block.type) {
      case "heading_1":
        return "Heading 1";
      case "heading_2":
        return "Heading 2";
      case "heading_3":
        return "Heading 3";
      case "quote":
        return "Quote";
      case "code":
        return "Code";
      case "bulleted_list_item":
        return "List item";
      case "numbered_list_item":
        return "List item";
      default:
        return "Type something...";
    }
  };

  const getInputComponent = () => {
    if (block.type === "divider") {
      return (
        <div className="flex h-6 items-center">
          <div className="h-px w-full bg-border" />
        </div>
      );
    }

    const baseClasses =
      "w-full resize-none border-none bg-transparent p-0 focus-visible:ring-0 placeholder:text-muted-foreground/50";

    switch (block.type) {
      case "heading_1":
        return (
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={getPlaceholder()}
            className={cn(baseClasses, "min-h-0 font-bold text-3xl")}
            rows={1}
          />
        );

      case "heading_2":
        return (
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={getPlaceholder()}
            className={cn(baseClasses, "min-h-0 font-semibold text-2xl")}
            rows={1}
          />
        );

      case "heading_3":
        return (
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={getPlaceholder()}
            className={cn(baseClasses, "min-h-0 font-medium text-xl")}
            rows={1}
          />
        );

      case "quote":
        return (
          <div className="border-muted-foreground/30 border-l-4 pl-4">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={getPlaceholder()}
              className={cn(
                baseClasses,
                "min-h-0 text-muted-foreground italic",
              )}
              rows={1}
            />
          </div>
        );

      case "code":
        return (
          <div className="rounded-md bg-muted p-3">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={getPlaceholder()}
              className={cn(baseClasses, "min-h-0 font-mono text-sm")}
              rows={1}
            />
          </div>
        );

      case "bulleted_list_item":
        return (
          <div className="flex items-start gap-3">
            <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-foreground" />
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={getPlaceholder()}
              className={cn(baseClasses, "min-h-0")}
              rows={1}
            />
          </div>
        );

      case "numbered_list_item":
        return (
          <div className="flex items-start gap-3">
            <span className="mt-0.5 min-w-[1.5rem] font-medium text-muted-foreground text-sm">
              {index + 1}.
            </span>
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={getPlaceholder()}
              className={cn(baseClasses, "min-h-0")}
              rows={1}
            />
          </div>
        );

      default:
        return (
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={getPlaceholder()}
            className={cn(baseClasses, "min-h-0")}
            rows={1}
          />
        );
    }
  };

  return (
    <div
      className={cn(
        "group relative rounded-sm transition-colors",
        (isHovered || isFocused) && "bg-muted/30",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Block controls */}
      {(isHovered || isFocused) && (
        <div className="-left-12 absolute top-1 flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
          >
            <GripVertical className="h-3 w-3" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {blockTypeOptions.map(({ type, icon: Icon, label }) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => onAddBlock(type as BlockType)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Block options */}
      {(isHovered || isFocused) && block.type !== "divider" && (
        <div className="-right-8 absolute top-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Block content */}
      <div className="px-2 py-1">{getInputComponent()}</div>
    </div>
  );
}
