"use client";

import { BlockEditor } from "@/components/notes/block-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useDebounce } from "@/hooks/use-debounce";
import { noteAPI } from "@/lib/api/note";
import type {
  BlockData,
  BlockType,
  CreateBlockRequest,
  NoteData,
  UpdateNoteRequest,
} from "@/types/note";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckSquare,
  Code,
  FileText,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Minus,
  MoreHorizontal,
  Plus,
  Quote,
  Save,
  Settings,
  Share2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// Lazy load markdown editor để tránh lỗi SSR
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

// Hàm helper để phát hiện chế độ editor từ tags
const detectEditorModeFromTags = (tags: string[]): "markdown" | "block" => {
  if (tags.includes("markdown")) return "markdown";
  if (tags.includes("block")) return "block";
  return "block"; // Mặc định là block
};

interface NoteEditorProps {
  note: NoteData;
  onSave?: () => void;
  initialValue?: string | BlockData[];
  mode?: "markdown" | "block";
}

export function NoteEditor({
  note,
  onSave,
  initialValue,
  mode = "markdown",
}: NoteEditorProps) {
  const t = useTranslations("Notes.editor");
  const tErrors = useTranslations("Notes.errors");
  const tSuccess = useTranslations("Notes.editor.success");
  const tCommon = useTranslations("Common");
  const queryClient = useQueryClient();

  // State cho metadata note
  const [title, setTitle] = useState(note.title);
  const [tags, setTags] = useState<string[]>(note.tags || []);
  const [newTag, setNewTag] = useState("");

  // State cho chế độ editor và nội dung
  const [editorMode, setEditorMode] = useState<"markdown" | "block">(() => {
    // Ưu tiên: 1. mode prop, 2. phát hiện từ tags, 3. note.type, 4. mặc định block
    if (mode) return mode;
    const detectedMode = detectEditorModeFromTags(note.tags || []);
    if (detectedMode !== "block" || note.type === "markdown")
      return detectedMode;
    return (note.type as "markdown" | "block") || "block";
  });

  const [markdownValue, setMarkdownValue] = useState<string>(
    typeof initialValue === "string"
      ? initialValue
      : note.type === "markdown"
        ? note.content || ""
        : "",
  );

  const [blocks, setBlocks] = useState<BlockData[]>(
    Array.isArray(initialValue)
      ? (initialValue as BlockData[])
      : note.blocks || [],
  );

  const [isEditing, setIsEditing] = useState(false);
  const [isModeChanging, setIsModeChanging] = useState(false);

  // Refs để theo dõi giá trị ban đầu để phát hiện thay đổi
  const initialTitleRef = useRef<string>(note.title);
  const initialTagsRef = useRef<string[]>(note.tags || []);
  const initialBlocksRef = useRef<BlockData[]>(note.blocks || []);
  const initialMarkdownRef = useRef<string>(
    note.type === "markdown" ? note.content || "" : "",
  );

  // Debounced title cho auto-save
  const debouncedTitle = useDebounce(title, 1000);

  // Mutation để cập nhật note
  const updateNoteMutation = useMutation({
    mutationFn: (data: UpdateNoteRequest) => noteAPI.updateNote(note.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["note", note.id] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
    onError: (error) => {
      toast.error(`${tErrors("updateFailed")}: ${error.message}`);
    },
  });

  // Refs
  const titleRef = useRef<HTMLInputElement>(null);

  // Khởi tạo nội dung dựa trên chế độ và đảm bảo blocks không rỗng
  useEffect(() => {
    if (editorMode === "block") {
      if (!blocks || blocks.length === 0) {
        const fromMarkdown = markdownToBlocks(markdownValue);
        if (fromMarkdown.length > 0) {
          setBlocks(fromMarkdown);
        } else {
          const emptyBlock: BlockData = {
            type: "paragraph",
            content: { text: "" },
            orderIndex: 0,
          };
          setBlocks([emptyBlock]);
        }
      }
    } else {
      // Chế độ markdown, chỉ khởi tạo từ note.content nếu chưa có nội dung
      if (note.type === "markdown" && note.content && !markdownValue) {
        setMarkdownValue(note.content);
      } else if (!markdownValue || markdownValue.trim() === "") {
        const md = blocksToMarkdown(blocks);
        setMarkdownValue(md);
      }
    }
  }, [editorMode, note.type, note.content, blocks, markdownValue]);

  // Auto-save title khi giá trị debounced thay đổi
  useEffect(() => {
    if (
      debouncedTitle !== initialTitleRef.current &&
      debouncedTitle.trim() !== ""
    ) {
      const autoSaveTitle = async () => {
        try {
          // Đảm bảo tags bao gồm tag chế độ đúng
          const modeTag = editorMode === "markdown" ? "markdown" : "block";
          const updatedTags = [
            ...tags.filter((tag) => tag !== "markdown" && tag !== "block"),
            modeTag,
          ];

          const updateData: UpdateNoteRequest = {
            title: debouncedTitle.trim(),
            tags: updatedTags,
            type: editorMode,
          };

          // Bao gồm nội dung cho chế độ markdown
          if (editorMode === "markdown") {
            updateData.content = markdownValue;
          }

          await updateNoteMutation.mutateAsync(updateData);
          // Cập nhật state tags và refs ban đầu sau khi lưu thành công
          setTags(updatedTags);
          initialTitleRef.current = debouncedTitle.trim();
          initialTagsRef.current = updatedTags;
          toast.success(t("autoSaveTitle"));
        } catch (error) {
          toast.error(
            `${tErrors("updateFailed")}: ${
              error instanceof Error ? error.message : tCommon("unknownError")
            }`,
          );
        }
      };
      autoSaveTitle();
    }
  }, [
    debouncedTitle,
    tags,
    editorMode,
    markdownValue,
    updateNoteMutation,
    t,
    tErrors,
    tCommon,
  ]);

  // Đồng bộ hiển thị nút Save khi các trường cốt lõi thay đổi
  useEffect(() => {
    const titleChanged =
      title.trim() !== (initialTitleRef.current || "").trim();
    const tagsChanged =
      JSON.stringify(tags) !== JSON.stringify(initialTagsRef.current || []);
    const modeIsMarkdown = editorMode === "markdown";
    const contentChanged = modeIsMarkdown
      ? (markdownValue ?? "") !== (initialMarkdownRef.current ?? "")
      : JSON.stringify(blocks) !==
        JSON.stringify(initialBlocksRef.current || []);
    setIsEditing(titleChanged || tagsChanged || contentChanged);
  }, [title, tags, markdownValue, blocks, editorMode]);

  // Hàm chuyển đổi blocks sang markdown
  function blocksToMarkdown(sourceBlocks: BlockData[]): string {
    if (!sourceBlocks || sourceBlocks.length === 0) return "";
    const lines: string[] = [];
    for (const block of sourceBlocks.sort(
      (a, b) => a.orderIndex - b.orderIndex,
    )) {
      switch (block.type) {
        case "heading_1":
          lines.push(`# ${block.content?.text ?? ""}`);
          break;
        case "heading_2":
          lines.push(`## ${block.content?.text ?? ""}`);
          break;
        case "heading_3":
          lines.push(`### ${block.content?.text ?? ""}`);
          break;
        case "bulleted_list_item":
          lines.push(`- ${block.content?.text ?? ""}`);
          break;
        case "numbered_list_item":
          lines.push(`1. ${block.content?.text ?? ""}`);
          break;
        case "to_do": {
          const checked = block.content?.checked ? "x" : " ";
          lines.push(`- [${checked}] ${block.content?.text ?? ""}`);
          break;
        }
        case "quote":
          lines.push(`> ${block.content?.text ?? ""}`);
          break;
        case "code":
          lines.push(`\`\`\`\n${block.content?.text ?? ""}\n\`\`\``);
          break;
        case "divider":
          lines.push("\n---\n");
          break;
        default:
          lines.push(block.content?.text ?? "");
      }
    }
    return lines.join("\n\n").trim();
  }

  // Hàm chuyển đổi markdown sang blocks
  function markdownToBlocks(md: string): BlockData[] {
    if (!md || md.trim() === "") return [];
    const rawLines = md.replace(/\r\n/g, "\n").split("\n");
    const result: BlockData[] = [];
    let i = 0;
    let paragraphBuffer: string[] = [];

    const flushParagraph = () => {
      const text = paragraphBuffer.join("\n").trim();
      paragraphBuffer = [];
      if (text.length === 0) return; // Bỏ qua đoạn văn rỗng
      result.push({
        type: "paragraph",
        content: { text },
        orderIndex: result.length,
      });
    };

    while (i < rawLines.length) {
      const line = rawLines[i];
      const trimmed = line.trim();

      // Dòng trống => ranh giới đoạn văn
      if (trimmed === "") {
        flushParagraph();
        i++;
        continue;
      }

      // Code block
      if (trimmed.startsWith("```") && !trimmed.endsWith("```")) {
        flushParagraph();
        const codeLines: string[] = [];
        i++;
        while (i < rawLines.length && !rawLines[i].trim().startsWith("```")) {
          codeLines.push(rawLines[i]);
          i++;
        }
        // Di chuyển qua ``` đóng nếu có
        if (i < rawLines.length && rawLines[i].trim().startsWith("```")) {
          i++;
        }
        result.push({
          type: "code",
          content: { text: codeLines.join("\n") },
          orderIndex: result.length,
        });
        continue;
      }

      // Headings / list / quote / divider => flush và push
      const heading1 = /^#\s+/.test(line);
      const heading2 = /^##\s+/.test(line);
      const heading3 = /^###\s+/.test(line);
      const quote = /^>\s?/.test(line);
      const divider = /^\s*---\s*$/.test(line);
      const task = /^\s*[-*+]\s+\[(x|X|\s)\]\s+/.test(line);
      const bullet = /^\s*[-*+]\s+/.test(line);
      const ordered = /^\s*\d+[\.)]\s+/.test(line);

      if (
        heading1 ||
        heading2 ||
        heading3 ||
        quote ||
        divider ||
        bullet ||
        ordered
      ) {
        flushParagraph();
        if (heading1) {
          result.push({
            type: "heading_1",
            content: { text: line.replace(/^#\s+/, "") },
            orderIndex: result.length,
          });
        } else if (heading2) {
          result.push({
            type: "heading_2",
            content: { text: line.replace(/^##\s+/, "") },
            orderIndex: result.length,
          });
        } else if (heading3) {
          result.push({
            type: "heading_3",
            content: { text: line.replace(/^###\s+/, "") },
            orderIndex: result.length,
          });
        } else if (quote) {
          result.push({
            type: "quote",
            content: { text: line.replace(/^>\s?/, "") },
            orderIndex: result.length,
          });
        } else if (divider) {
          result.push({
            type: "divider",
            content: { text: "" },
            orderIndex: result.length,
          });
        } else if (task) {
          const match = line.match(/^\s*[-*+]\s+\[(x|X|\s)\]\s+(.*)$/);
          const checked = !!match && (match[1] === "x" || match[1] === "X");
          const text = match
            ? match[2]
            : line.replace(/^\s*[-*+]\s+\[(x|X|\s)\]\s+/, "");
          result.push({
            type: "to_do",
            content: { text, checked },
            orderIndex: result.length,
          });
        } else if (bullet) {
          result.push({
            type: "bulleted_list_item",
            content: { text: line.replace(/^\s*[-*+]\s+/, "") },
            orderIndex: result.length,
          });
        } else if (ordered) {
          result.push({
            type: "numbered_list_item",
            content: { text: line.replace(/^\s*\d+[\.)]\s+/, "") },
            orderIndex: result.length,
          });
        }
        i++;
        continue;
      }

      // Tích lũy đoạn văn
      paragraphBuffer.push(line);
      i++;
    }

    // Hoàn thiện
    flushParagraph();

    if (result.length === 0) {
      result.push({ type: "paragraph", content: { text: "" }, orderIndex: 0 });
    }

    return result.map((b, idx) => ({ ...b, orderIndex: idx }));
  }

  // Mutations cho blocks
  const addBlockMutation = useMutation({
    mutationFn: ({
      noteId,
      blockData,
    }: {
      noteId: number;
      blockData: CreateBlockRequest;
    }) => noteAPI.addBlock(noteId, blockData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["note", note.id] });
    },
  });

  const deleteBlockMutation = useMutation({
    mutationFn: (blockId: number) => noteAPI.deleteBlock(blockId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["note", note.id] });
    },
  });

  const handleSave = async () => {
    try {
      // Chuyển đổi markdown sang blocks nếu cần
      let blocksToPersist = blocks;
      if (editorMode === "markdown") {
        blocksToPersist = markdownToBlocks(markdownValue);
        setBlocks(blocksToPersist);
      }

      // Bước 1: Cập nhật metadata note (title, tags)
      try {
        // Đảm bảo tags bao gồm tag chế độ đúng
        const modeTag = editorMode === "markdown" ? "markdown" : "block";
        const updatedTags = [
          ...tags.filter((tag) => tag !== "markdown" && tag !== "block"),
          modeTag,
        ];

        const noteMetadata: UpdateNoteRequest = {
          title: title.trim(),
          tags: updatedTags,
          type: editorMode,
          ...(editorMode === "markdown" && { content: markdownValue }),
        };

        await updateNoteMutation.mutateAsync(noteMetadata);
        // Cập nhật state tags và refs ban đầu sau khi lưu metadata thành công
        setTags(updatedTags);
        initialTitleRef.current = noteMetadata.title ?? initialTitleRef.current;
        initialTagsRef.current = updatedTags;
        if (editorMode === "markdown")
          initialMarkdownRef.current = markdownValue;
      } catch (error) {
        throw new Error(
          `Lỗi cập nhật metadata note: ${
            error instanceof Error ? error.message : "Lỗi không xác định"
          }`,
        );
      }

      // Bước 2: Lưu blocks riêng biệt (chỉ cho chế độ block)
      if (editorMode === "block") {
        try {
          await saveBlocks();
        } catch (error) {
          throw new Error(
            `Lỗi cập nhật blocks: ${
              error instanceof Error ? error.message : "Lỗi không xác định"
            }`,
          );
        }
      }

      toast.success(
        `${tSuccess("noteUpdated")} - ${tSuccess("noteUpdatedDesc")}`,
      );
      onSave?.();
      setIsEditing(false);
    } catch (error) {
      toast.error(
        `${tErrors("updateFailed")}: ${
          error instanceof Error ? error.message : "Lỗi không xác định"
        }`,
      );
    }
  };

  const saveBlocks = async () => {
    const originalBlocks = note.blocks || [];
    const errors: string[] = [];

    // Bước 1: Tạo blocks mới và cập nhật blocks hiện có
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const originalBlock = originalBlocks.find((b) => b.id === block.id);

      try {
        if (!block.id) {
          // Block mới - tạo nó
          const blockData: CreateBlockRequest = {
            type: block.type,
            content: block.content || { text: "" },
            orderIndex: i,
          };

          await addBlockMutation.mutateAsync({
            noteId: note.id,
            blockData,
          });
        } else if (originalBlock) {
          // Kiểm tra xem block có cần cập nhật không
          const originalContentText = originalBlock.content?.text || "";
          const currentContentText = block.content?.text || "";

          const needsUpdate =
            originalContentText !== currentContentText ||
            originalBlock.type !== block.type ||
            originalBlock.orderIndex !== i;

          if (needsUpdate) {
            // Sử dụng phương pháp delete + create để cập nhật
            try {
              await deleteBlockMutation.mutateAsync(block.id);

              const blockData: CreateBlockRequest = {
                type: block.type,
                content: block.content || { text: currentContentText },
                orderIndex: i,
              };

              await addBlockMutation.mutateAsync({
                noteId: note.id,
                blockData,
              });
            } catch (_recreateError) {
              throw new Error(
                `Lỗi cập nhật block ${block.id} bằng phương pháp delete+create`,
              );
            }
          }
        }
      } catch (error) {
        const blockError = `Block ${block.id || "mới"} tại vị trí ${i}: ${
          error instanceof Error ? error.message : "Lỗi không xác định"
        }`;
        errors.push(blockError);
      }
    }

    // Bước 2: Xóa blocks đã bị loại bỏ
    const currentBlockIds = blocks.filter((b) => b.id).map((b) => b.id);
    const blocksToDelete = originalBlocks.filter(
      (b) => b.id && !currentBlockIds.includes(b.id),
    );

    for (const blockToDelete of blocksToDelete) {
      if (blockToDelete.id) {
        try {
          await deleteBlockMutation.mutateAsync(blockToDelete.id);
        } catch (error) {
          const deleteError = `Lỗi xóa block ${blockToDelete.id}: ${
            error instanceof Error ? error.message : "Lỗi không xác định"
          }`;
          errors.push(deleteError);
        }
      }
    }

    // Ném lỗi tổng hợp nếu có
    if (errors.length > 0) {
      throw new Error(`Các thao tác block thất bại:\n${errors.join("\n")}`);
    }
  };

  const handleAddTag = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTag.trim()) {
      if (!tags.includes(newTag.trim())) {
        const newTags = [...tags, newTag.trim()];
        setTags(newTags);
        setIsEditing(true);

        // Tự động lưu tags ngay lập tức
        try {
          // Đảm bảo tag chế độ được giữ
          const modeTag = editorMode === "markdown" ? "markdown" : "block";
          const finalTags = [
            ...newTags.filter((tag) => tag !== "markdown" && tag !== "block"),
            modeTag,
          ];

          const updateData: UpdateNoteRequest = {
            title: title.trim(),
            tags: finalTags,
            type: editorMode,
          };

          if (editorMode === "markdown") {
            updateData.content = markdownValue;
          }

          await updateNoteMutation.mutateAsync(updateData);
          // Cập nhật state tags và refs ban đầu sau khi lưu thành công
          setTags(finalTags);
          initialTagsRef.current = finalTags;
          setIsEditing(false);
          toast.success(t("autoSaveTag", { tag: newTag.trim() }));
        } catch (error) {
          toast.error(
            `${tErrors("updateFailed")}: ${
              error instanceof Error ? error.message : tCommon("unknownError")
            }`,
          );
        }
      }
      setNewTag("");
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    setIsEditing(true);

    // Tự động lưu tags ngay lập tức
    try {
      // Đảm bảo tag chế độ được giữ
      const modeTag = editorMode === "markdown" ? "markdown" : "block";
      const finalTags = [
        ...newTags.filter((tag) => tag !== "markdown" && tag !== "block"),
        modeTag,
      ];

      const updateData: UpdateNoteRequest = {
        title: title.trim(),
        tags: finalTags,
        type: editorMode,
      };

      if (editorMode === "markdown") {
        updateData.content = markdownValue;
      }

      await updateNoteMutation.mutateAsync(updateData);
      // Cập nhật state tags và refs ban đầu sau khi lưu thành công
      setTags(finalTags);
      initialTagsRef.current = finalTags;
      setIsEditing(false);
      toast.success(t("autoRemoveTag", { tag: tagToRemove }));
    } catch (error) {
      toast.error(
        `${tErrors("updateFailed")}: ${
          error instanceof Error ? error.message : tCommon("unknownError")
        }`,
      );
    }
  };

  const handleAddBlock = (type: BlockType, afterIndex?: number) => {
    const newBlock: BlockData = {
      type,
      content: type === "to_do" ? { text: "", checked: false } : { text: "" },
      orderIndex: afterIndex !== undefined ? afterIndex + 1 : blocks.length,
    };

    const newBlocks = [...blocks];
    if (afterIndex !== undefined) {
      newBlocks.splice(afterIndex + 1, 0, newBlock);
      // Sắp xếp lại chỉ số
      newBlocks.forEach((block, index) => {
        block.orderIndex = index;
      });
    } else {
      newBlocks.push(newBlock);
    }

    setBlocks(newBlocks);
    setIsEditing(true);
    toast.success(t("addBlockSuccess", { type: t(`blockTypes.${type}`) }));
  };

  const handleUpdateBlock = (
    index: number,
    updatedBlock: Partial<BlockData>,
  ) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], ...updatedBlock };
    setBlocks(newBlocks);
    setIsEditing(true);
  };

  const handleDeleteBlock = async (index: number) => {
    if (blocks.length > 1) {
      const blockToDelete = blocks[index];

      // Nếu block có ID, xóa nó khỏi backend ngay lập tức
      if (blockToDelete.id) {
        try {
          await deleteBlockMutation.mutateAsync(blockToDelete.id);
        } catch (error) {
          toast.error(
            `${tErrors("updateFailed")}: Lỗi xóa block - ${
              error instanceof Error ? error.message : "Lỗi không xác định"
            }`,
          );
          return; // Không xóa khỏi local state nếu API call thất bại
        }
      }

      // Xóa khỏi local state
      const newBlocks = blocks.filter((_, i) => i !== index);
      // Sắp xếp lại chỉ số
      newBlocks.forEach((block, idx) => {
        block.orderIndex = idx;
      });
      setBlocks(newBlocks);
      setIsEditing(true);
      toast.success(t("deleteBlockSuccess"));
    }
  };

  const blockTypeOptions = [
    { type: "paragraph", icon: FileText, label: t("blockTypes.paragraph") },
    { type: "heading_1", icon: Heading1, label: t("blockTypes.heading_1") },
    { type: "heading_2", icon: Heading2, label: t("blockTypes.heading_2") },
    { type: "heading_3", icon: Heading3, label: t("blockTypes.heading_3") },
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

  return (
    <div className="mx-auto max-w-4xl">
      {isModeChanging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 rounded-lg border bg-background px-4 py-2 shadow-lg">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm">{tCommon("loading")}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📝</span>
            <h1 className="font-semibold text-lg text-muted-foreground">
              {tCommon("notes")}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {isEditing && (
              <Button
                onClick={handleSave}
                disabled={updateNoteMutation.isPending}
                size="sm"
              >
                <Save className="mr-2 h-4 w-4" />
                {updateNoteMutation.isPending ? t("saving") : t("save")}
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Share2 className="mr-2 h-4 w-4" />
                  {t("share")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    if (isModeChanging) return; // Ngăn nhiều lần click

                    setIsModeChanging(true);
                    try {
                      if (editorMode === "block") {
                        // Block -> Markdown: Lưu blocks hiện tại trước, sau đó chuyển đổi
                        const md = blocksToMarkdown(blocks);
                        setMarkdownValue(md);
                        setEditorMode("markdown");

                        // Cập nhật tags để bao gồm tag markdown
                        const newTags = [
                          ...tags.filter((tag) => tag !== "block"),
                          "markdown",
                        ];
                        setTags(newTags);

                        // Lưu markdown đã chuyển đổi vào database
                        await updateNoteMutation.mutateAsync({
                          title: title.trim(),
                          tags: newTags,
                          type: "markdown",
                          content: md,
                        });

                        // Cập nhật refs ban đầu
                        initialMarkdownRef.current = md;
                        initialBlocksRef.current = blocks;
                        initialTagsRef.current = newTags;
                        setIsEditing(false);
                        toast.success(
                          t("modeSwitchSuccess", { mode: t("markdownMode") }),
                        );
                      } else {
                        // Markdown -> Block: Lưu markdown hiện tại trước, sau đó chuyển đổi
                        const newBlocks = markdownToBlocks(markdownValue);
                        const finalBlocks: BlockData[] = newBlocks.length
                          ? newBlocks
                          : [
                              {
                                type: "paragraph",
                                content: { text: "" },
                                orderIndex: 0,
                              },
                            ];
                        setBlocks(finalBlocks);
                        setEditorMode("block");

                        // Cập nhật tags để bao gồm tag block
                        const newTags = [
                          ...tags.filter((tag) => tag !== "markdown"),
                          "block",
                        ];
                        setTags(newTags);

                        // Lưu blocks đã chuyển đổi vào database
                        await updateNoteMutation.mutateAsync({
                          title: title.trim(),
                          tags: newTags,
                          type: "block",
                          blocks: finalBlocks,
                        });

                        // Cập nhật refs ban đầu
                        initialMarkdownRef.current = markdownValue;
                        initialBlocksRef.current = finalBlocks;
                        initialTagsRef.current = newTags;
                        setIsEditing(false);
                        toast.success(
                          t("modeSwitchSuccess", { mode: t("blockMode") }),
                        );
                      }
                    } catch (_error) {
                      toast.error(t("modeSwitchError"));
                    } finally {
                      setIsModeChanging(false);
                    }
                  }}
                  disabled={isModeChanging}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  {isModeChanging
                    ? t("switchingMode")
                    : editorMode === "block"
                      ? t("markdownMode")
                      : t("blockMode")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Nội dung */}
      <div className="p-6">
        {/* Tiêu đề */}
        <div className="mb-6">
          <Input
            ref={titleRef}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setIsEditing(true);
            }}
            placeholder={t("titlePlaceholder")}
            className="border-none p-0 font-bold text-4xl placeholder:text-muted-foreground/50 focus-visible:ring-0"
            style={{ fontSize: "2.5rem", lineHeight: "1.1" }}
          />
        </div>

        {/* Tags */}
        <div className="mb-8">
          <div className="mb-2 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive/10"
                onClick={() => handleRemoveTag(tag)}
              >
                {tag} ×
              </Badge>
            ))}
          </div>
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder={t("tagPlaceholder")}
            className="max-w-xs"
          />
        </div>

        <Separator className="mb-8" />

        {editorMode === "markdown" ? (
          <div className="rounded-md border bg-background p-2 dark:border-gray-700">
            {MDEditor && (
              <div
                data-color-mode="auto"
                className="prose dark:prose-invert max-w-none"
              >
                <MDEditor
                  key={`markdown-${note.id}`}
                  value={markdownValue}
                  onChange={(val) => {
                    setMarkdownValue(val || "");
                    setIsEditing(true);
                  }}
                  height={400}
                  data-color-mode="light"
                />
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {blocks.map((block, index) => (
                <BlockEditor
                  key={index}
                  block={block}
                  index={index}
                  onUpdate={(updatedBlock: Partial<BlockData>) =>
                    handleUpdateBlock(index, updatedBlock)
                  }
                  onDelete={() => handleDeleteBlock(index)}
                  onAddBlock={(type: BlockType) => handleAddBlock(type, index)}
                />
              ))}
            </div>
            <div className="mt-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t("addBlockPlaceholder")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  {blockTypeOptions.map(({ type, icon: Icon, label }) => (
                    <DropdownMenuItem
                      key={type}
                      onClick={() => handleAddBlock(type as BlockType)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
