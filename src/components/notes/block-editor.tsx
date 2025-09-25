"use client";

import TiptapEditor from "@/components/shared/editor/tiptap-editor";
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
  CheckSquare,
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
import { useTranslations } from "next-intl";
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
  const t = useTranslations("Notes.editor");
  const tCommon = useTranslations("Common");
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isDeleteMenuOpen, setIsDeleteMenuOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const content = block.content?.text || "";

  // Tự động điều chỉnh chiều cao textarea
  useEffect(() => {
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

  // Tự động focus khi block mới được tạo
  useEffect(() => {
    if (!content && (textareaRef.current || inputRef.current)) {
      const element = textareaRef.current || inputRef.current;
      if (element) {
        element.focus();
      }
    }
  }, [content]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cho phép xuống dòng với Shift+Enter
    if (e.key === "Enter" && e.shiftKey) {
      return;
    }

    // Tạo block mới với Enter (không có Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      // Đối với list items, tạo cùng loại list item
      if (block.type === "bulleted_list_item") {
        onAddBlock("bulleted_list_item");
      } else if (block.type === "numbered_list_item") {
        onAddBlock("numbered_list_item");
      } else {
        onAddBlock("paragraph");
      }
    }

    // Xóa block khi backspace trên block trống (trừ block đầu tiên)
    if (e.key === "Backspace" && content === "" && index > 0) {
      e.preventDefault();
      onDelete();
    }

    // Chuyển đổi thành paragraph khi backspace ở đầu list item
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
    { type: "paragraph", icon: Type, label: t("blockTypes.paragraph") },
    { type: "heading_1", icon: Hash, label: t("blockTypes.heading_1") },
    { type: "heading_2", icon: Hash, label: t("blockTypes.heading_2") },
    { type: "heading_3", icon: Hash, label: t("blockTypes.heading_3") },
    {
      type: "bulleted_list_item",
      icon: List,
      label: t("blockTypes.bulleted_list_item"),
    },
    {
      type: "numbered_list_item",
      icon: ListOrdered,
      label: t("blockTypes.numbered_list_item"),
    },
    { type: "to_do", icon: CheckSquare, label: t("blockTypes.to_do") },
    { type: "quote", icon: Quote, label: t("blockTypes.quote") },
    { type: "code", icon: Code, label: t("blockTypes.code") },
    { type: "divider", icon: Minus, label: t("blockTypes.divider") },
  ];

  const getPlaceholder = () => {
    switch (block.type) {
      case "heading_1":
        return t("placeholders.heading_1");
      case "heading_2":
        return t("placeholders.heading_2");
      case "heading_3":
        return t("placeholders.heading_3");
      case "quote":
        return t("placeholders.quote");
      case "code":
        return t("placeholders.code");
      case "bulleted_list_item":
        return t("placeholders.bulleted_list_item");
      case "numbered_list_item":
        return t("placeholders.numbered_list_item");
      case "to_do":
        return t("placeholders.to_do");
      default:
        return t("placeholders.default");
    }
  };

  const getInputComponent = () => {
    if (block.type === "divider") {
      return (
        <div className="flex items-center py-4">
          <div className="h-px w-full bg-border/50" />
        </div>
      );
    }

    const baseClasses =
      "w-full resize-none border-none bg-transparent p-0 focus-visible:ring-0 placeholder:text-muted-foreground/50 leading-7";

    switch (block.type) {
      case "to_do":
        return (
          <div className="flex items-start gap-3 py-1">
            <input
              type="checkbox"
              className="mt-1.5 h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/20"
              checked={!!block.content?.checked}
              onChange={(e) =>
                onUpdate({
                  content: { ...block.content, checked: e.target.checked },
                })
              }
            />
            <div className="flex-1">
              <TiptapEditor
                content={content}
                onChange={(html) => handleContentChange(html)}
                placeholder={getPlaceholder()}
                className="min-h-[28px] leading-7"
                showToolbar={false}
              />
            </div>
          </div>
        );

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
            className={cn(
              baseClasses,
              "min-h-0 font-bold text-3xl text-foreground",
            )}
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
            className={cn(
              baseClasses,
              "min-h-0 font-semibold text-2xl text-foreground",
            )}
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
            className={cn(
              baseClasses,
              "min-h-0 font-medium text-foreground text-xl",
            )}
            rows={1}
          />
        );

      case "quote":
        return (
          <div className="border-muted-foreground/30 border-l-4 py-1 pl-4 dark:border-muted-foreground/40">
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
                "min-h-0 text-muted-foreground italic dark:text-muted-foreground",
              )}
              rows={1}
            />
          </div>
        );

      case "code":
        return (
          <div className="rounded-lg border border-border/30 bg-muted/30 px-4 py-3 dark:border-border/40 dark:bg-muted/20">
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
                "min-h-0 font-mono text-foreground text-sm",
              )}
              rows={1}
            />
          </div>
        );

      case "bulleted_list_item":
        return (
          <div className="flex items-start gap-3 py-1">
            <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-foreground/60" />
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
          <div className="flex items-start gap-3 py-1">
            <span className="mt-0.5 min-w-[1.5rem] select-none font-medium text-muted-foreground text-sm">
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
          <TiptapEditor
            content={content}
            onChange={(html) => handleContentChange(html)}
            placeholder={getPlaceholder()}
            className="min-h-[28px]"
            showToolbar={false}
          />
        );
    }
  };

  return (
    <div
      className={cn(
        "group relative rounded-lg border border-transparent transition-all duration-200 hover:border-border/50",
        (isHovered || isFocused) && "border-border/30 bg-muted/20 shadow-sm",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Điều khiển block */}
      {(isHovered || isFocused) && (
        <div className="-left-14 absolute top-1.5 flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 rounded-md p-0 hover:bg-muted/50"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 rounded-md p-0 hover:bg-muted/50"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {blockTypeOptions.map(({ type, icon: Icon, label }) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => onAddBlock(type as BlockType)}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Nội dung block */}
      <div className="relative px-3 py-1.5">
        {/* Nút xóa - đặt bên trong nội dung block */}
        {(isHovered || isFocused || isDeleteMenuOpen) &&
          block.type !== "divider" && (
            <div className="absolute top-2 right-2 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <DropdownMenu
                open={isDeleteMenuOpen}
                onOpenChange={setIsDeleteMenuOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 rounded-md p-0 hover:bg-destructive/10"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem
                    onClick={() => {
                      onDelete();
                      setIsDeleteMenuOpen(false);
                    }}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {tCommon("delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        {getInputComponent()}
      </div>
    </div>
  );
}
