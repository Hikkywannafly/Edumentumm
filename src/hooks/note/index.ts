// Re-export all note hooks for convenience
export * from "./use-note-list";
export * from "./use-note-blocks";

// Additional exports for commonly used hooks
export { useNoteList as useNotes } from "./use-note-list";
export { useNoteDetail as useNote } from "./use-note-list";
export { useCreateNote } from "./use-note-list";
export { useUpdateNote } from "./use-note-list";
export { useDeleteNote } from "./use-note-list";
export { useCreateNoteWithTemplate } from "./use-note-list";

export { useAddBlock } from "./use-note-blocks";
export { useUpdateBlock } from "./use-note-blocks";
export { useDeleteBlock } from "./use-note-blocks";
export { useReorderBlocks } from "./use-note-blocks";
export { useBlockOperations } from "./use-note-blocks";
