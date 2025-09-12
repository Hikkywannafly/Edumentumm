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
import { toast } from "@/hooks/use-toast";
import { noteAPI } from "@/lib/api/note";
import type {
  BlockData,
  BlockType,
  CreateBlockRequest,
  NoteData,
  UpdateBlockRequest,
  UpdateNoteRequest,
} from "@/types/note";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
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
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface NoteEditorProps {
  note: NoteData;
  onSave?: () => void;
}

export function NoteEditor({ note, onSave }: NoteEditorProps) {
  const t = useTranslations("Notes.editor");
  const tErrors = useTranslations("Notes.errors");
  const tSuccess = useTranslations("Notes.editor.success");
  const queryClient = useQueryClient();

  // Note metadata state
  const [title, setTitle] = useState(note.title);
  const [tags, setTags] = useState<string[]>(note.tags || []);
  const [newTag, setNewTag] = useState("");

  // Blocks state
  const [blocks, setBlocks] = useState<BlockData[]>(note.blocks || []);
  const [isEditing, setIsEditing] = useState(false);

  // Refs
  const titleRef = useRef<HTMLInputElement>(null);

  // Initialize with empty block if no blocks exist
  useEffect(() => {
    if (blocks.length === 0) {
      const emptyBlock: BlockData = {
        type: "paragraph",
        content: { text: "" },
        orderIndex: 0,
      };
      setBlocks([emptyBlock]);
    }
  }, [blocks.length]);

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: (data: UpdateNoteRequest) => noteAPI.updateNote(note.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["note", note.id] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
    onError: (error) => {
      toast({
        title: tErrors("updateFailed"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Block mutations
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

  const updateBlockMutation = useMutation({
    mutationFn: ({
      blockId,
      blockData,
    }: {
      blockId: number;
      blockData: UpdateBlockRequest;
    }) => noteAPI.updateBlock(blockId, blockData),
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
      // Update note metadata first
      const updateData: UpdateNoteRequest = {
        title: title.trim(),
        tags,
      };

      await updateNoteMutation.mutateAsync(updateData);

      // Save blocks
      await saveBlocks();

      toast({
        title: tSuccess("noteUpdated"),
        description: tSuccess("noteUpdatedDesc"),
      });
      onSave?.();
      setIsEditing(false);
    } catch (error) {
      toast({
        title: tErrors("updateFailed"),
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const saveBlocks = async () => {
    // Get original blocks from note
    const originalBlocks = note.blocks || [];

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const originalBlock = originalBlocks.find((b) => b.id === block.id);

      if (!block.id) {
        // New block - create it
        const blockData: CreateBlockRequest = {
          type: block.type,
          content: block.content,
          plainText: block.content.text || "",
          orderIndex: i,
          parentBlockId: block.parentBlockId || null,
          properties: block.properties || {},
        };

        await addBlockMutation.mutateAsync({ noteId: note.id, blockData });
      } else if (
        originalBlock &&
        (originalBlock.content.text !== block.content.text ||
          originalBlock.type !== block.type ||
          originalBlock.orderIndex !== i)
      ) {
        // Existing block - update it
        const blockData: UpdateBlockRequest = {
          type: block.type,
          content: block.content,
          plainText: block.content.text || "",
          orderIndex: i,
          parentBlockId: block.parentBlockId || null,
          properties: block.properties || {},
        };

        await updateBlockMutation.mutateAsync({ blockId: block.id, blockData });
      }
    }

    // Delete blocks that were removed
    const currentBlockIds = blocks.filter((b) => b.id).map((b) => b.id);
    const blocksToDelete = originalBlocks.filter(
      (b) => b.id && !currentBlockIds.includes(b.id),
    );

    for (const blockToDelete of blocksToDelete) {
      if (blockToDelete.id) {
        await deleteBlockMutation.mutateAsync(blockToDelete.id);
      }
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTag.trim()) {
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleAddBlock = (type: BlockType, afterIndex?: number) => {
    const newBlock: BlockData = {
      type,
      content: { text: "" },
      orderIndex: afterIndex !== undefined ? afterIndex + 1 : blocks.length,
    };

    const newBlocks = [...blocks];
    if (afterIndex !== undefined) {
      newBlocks.splice(afterIndex + 1, 0, newBlock);
      // Reorder indices
      newBlocks.forEach((block, index) => {
        block.orderIndex = index;
      });
    } else {
      newBlocks.push(newBlock);
    }

    setBlocks(newBlocks);
    setIsEditing(true);
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

  const handleDeleteBlock = (index: number) => {
    if (blocks.length > 1) {
      const newBlocks = blocks.filter((_, i) => i !== index);
      // Reorder indices
      newBlocks.forEach((block, idx) => {
        block.orderIndex = idx;
      });
      setBlocks(newBlocks);
      setIsEditing(true);
    }
  };

  const blockTypeOptions = [
    { type: "paragraph", icon: FileText, label: "Paragraph" },
    { type: "heading_1", icon: Heading1, label: "Heading 1" },
    { type: "heading_2", icon: Heading2, label: "Heading 2" },
    { type: "heading_3", icon: Heading3, label: "Heading 3" },
    { type: "bulleted_list_item", icon: List, label: "Bullet List" },
    { type: "numbered_list_item", icon: ListOrdered, label: "Numbered List" },
    { type: "quote", icon: Quote, label: "Quote" },
    { type: "code", icon: Code, label: "Code" },
    { type: "divider", icon: Minus, label: "Divider" },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📝</span>
            <h1 className="font-semibold text-lg text-muted-foreground">
              {note.ownerName}'s Note
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
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  {t("settings")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Cover Image */}
        {note.coverUrl && (
          <div className="mb-8">
            <img
              src={note.coverUrl}
              alt="Cover"
              className="h-48 w-full rounded-lg object-cover"
            />
          </div>
        )}

        {/* Title */}
        <div className="mb-6">
          <Input
            ref={titleRef}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setIsEditing(true);
            }}
            placeholder={t("untitledNote")}
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
            placeholder={t("addTag")}
            className="max-w-xs"
          />
        </div>

        <Separator className="mb-8" />

        {/* Blocks */}
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

        {/* Add Block Button */}
        <div className="mt-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("addBlock")}
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
      </div>
    </div>
  );
}
