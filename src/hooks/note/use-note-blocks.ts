import { noteAPI } from "@/lib/api/note";
import { useNoteStore } from "@/stores/note-store";
import type {
  BlockData,
  CreateBlockRequest,
  ReorderBlocksRequest,
  UpdateBlockRequest,
} from "@/types/note";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { noteQueryKeys } from "../note-query-keys";

export function useAddBlock() {
  const queryClient = useQueryClient();
  const { addBlock, setError, setDirty } = useNoteStore();

  return useMutation({
    mutationFn: async ({
      noteId,
      blockData,
    }: {
      noteId: number;
      blockData: CreateBlockRequest;
    }): Promise<BlockData> => {
      return noteAPI.addBlock(noteId, blockData);
    },
    onSuccess: (newBlock, { noteId }) => {
      // Update store
      addBlock(noteId, newBlock);

      // Invalidate note detail to refresh
      queryClient.invalidateQueries({ queryKey: noteQueryKeys.detail(noteId) });

      setError(null);
      setDirty(false);
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add block";
      setError(errorMessage);
    },
    retry: (failureCount, error: any) => {
      if (error?.message?.includes("401") || error?.message?.includes("403")) {
        return false;
      }
      return failureCount < 1;
    },
  });
}

export function useUpdateBlock() {
  const queryClient = useQueryClient();
  const { setError, setDirty } = useNoteStore();

  return useMutation({
    mutationFn: async ({
      blockId,
      blockData,
      noteId: _,
    }: {
      blockId: number;
      blockData: UpdateBlockRequest;
      noteId: number;
    }): Promise<BlockData> => {
      return noteAPI.updateBlock(blockId, blockData);
    },
    onSuccess: (updatedBlock, { blockId }) => {
      // Update store
      // updateBlock(noteId, blockId, updatedBlock);

      // Update cache
      queryClient.setQueryData(noteQueryKeys.block(blockId), updatedBlock);

      // Invalidate note detail
      // queryClient.invalidateQueries({ queryKey: noteQueryKeys.detail(noteId) });

      setError(null);
      setDirty(false);
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update block";
      setError(errorMessage);
    },
    retry: (failureCount, error: any) => {
      if (
        error?.message?.includes("404") ||
        error?.message?.includes("401") ||
        error?.message?.includes("403")
      ) {
        return false;
      }
      return failureCount < 1;
    },
  });
}

export function useDeleteBlock() {
  const queryClient = useQueryClient();
  const { setError, setSelectedBlock } = useNoteStore();

  return useMutation({
    mutationFn: async ({
      blockId,
      noteId: _,
    }: {
      blockId: number;
      noteId: number;
    }): Promise<void> => {
      return noteAPI.deleteBlock(blockId);
    },
    onSuccess: (_, { blockId }) => {
      // Update store
      // removeBlock(noteId, blockId);

      // Clear selection if this block was selected
      setSelectedBlock(null);

      // Remove from cache
      queryClient.removeQueries({ queryKey: noteQueryKeys.block(blockId) });

      // Invalidate note detail
      // queryClient.invalidateQueries({ queryKey: noteQueryKeys.detail(noteId) });

      setError(null);
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete block";
      setError(errorMessage);
    },
    retry: false, // Don't retry delete operations
  });
}

export function useReorderBlocks() {
  const queryClient = useQueryClient();
  const { setError } = useNoteStore();

  return useMutation({
    mutationFn: async ({
      blockOrders,
    }: {
      noteId: number;
      blockOrders: ReorderBlocksRequest;
    }): Promise<void> => {
      return noteAPI.reorderBlocks(blockOrders);
    },
    onSuccess: (_, { noteId }) => {
      // Invalidate note detail to refresh with new order
      queryClient.invalidateQueries({ queryKey: noteQueryKeys.detail(noteId) });

      setError(null);
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to reorder blocks";
      setError(errorMessage);
    },
    retry: (failureCount, error: any) => {
      if (error?.message?.includes("401") || error?.message?.includes("403")) {
        return false;
      }
      return failureCount < 1;
    },
  });
}

// Hook for bulk operations on blocks
export function useBlockOperations() {
  const addBlock = useAddBlock();
  const updateBlock = useUpdateBlock();
  const deleteBlock = useDeleteBlock();
  const reorderBlocks = useReorderBlocks();

  // Helper to add multiple blocks at once
  const addMultipleBlocks = async (
    noteId: number,
    blocks: CreateBlockRequest[],
  ) => {
    const results = [];
    for (let i = 0; i < blocks.length; i++) {
      try {
        const result = await addBlock.mutateAsync({
          noteId,
          blockData: blocks[i],
        });
        results.push(result);
      } catch (error) {
        console.error(`Failed to add block ${i}:`, error);
        throw error;
      }
    }
    return results;
  };

  // Helper to create common block types
  const createParagraph = (
    noteId: number,
    text: string,
    orderIndex: number,
  ) => {
    return addBlock.mutateAsync({
      noteId,
      blockData: noteAPI.createParagraphBlock(text, orderIndex),
    });
  };

  const createHeading = (
    noteId: number,
    text: string,
    level: 1 | 2 | 3,
    orderIndex: number,
  ) => {
    return addBlock.mutateAsync({
      noteId,
      blockData: noteAPI.createHeadingBlock(text, level, orderIndex),
    });
  };

  const createTodo = (
    noteId: number,
    text: string,
    checked: boolean,
    orderIndex: number,
  ) => {
    return addBlock.mutateAsync({
      noteId,
      blockData: noteAPI.createTodoBlock(text, checked, orderIndex),
    });
  };

  return {
    // Direct mutations
    addBlock: addBlock.mutateAsync,
    updateBlock: updateBlock.mutateAsync,
    deleteBlock: deleteBlock.mutateAsync,
    reorderBlocks: reorderBlocks.mutateAsync,

    // Bulk operations
    addMultipleBlocks,

    // Convenience methods
    createParagraph,
    createHeading,
    createTodo,

    // Loading states
    isAddingBlock: addBlock.isPending,
    isUpdatingBlock: updateBlock.isPending,
    isDeletingBlock: deleteBlock.isPending,
    isReordering: reorderBlocks.isPending,

    // Errors
    addError: addBlock.error,
    updateError: updateBlock.error,
    deleteError: deleteBlock.error,
    reorderError: reorderBlocks.error,

    // Reset functions
    resetAdd: addBlock.reset,
    resetUpdate: updateBlock.reset,
    resetDelete: deleteBlock.reset,
    resetReorder: reorderBlocks.reset,
  };
}
