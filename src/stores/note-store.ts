import { noteAPI } from "@/lib/api/note";
import type {
  BlockData,
  BlockResponse,
  BlockType,
  NoteData,
  NoteFilter,
  NoteType,
} from "@/types/note";
import { isBlockNote } from "@/types/note";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Helper function to convert BlockResponse to BlockData
const convertBlockResponseToBlockData = (
  blockResponse: BlockResponse,
): BlockData => {
  return {
    id: blockResponse.id,
    type: blockResponse.type as BlockType, // Cast string to BlockType
    content:
      typeof blockResponse.content === "string"
        ? { text: blockResponse.content }
        : blockResponse.content,
    orderIndex: blockResponse.orderIndex,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDeleted: false,
  };
};

interface NoteState {
  // Notes data
  notes: NoteData[];
  currentNote: NoteData | null;

  // UI state
  isLoading: boolean;
  error: string | null;

  // Filter and search
  filter: NoteFilter;
  searchQuery: string;

  // Editor state
  selectedBlockId: number | null;
  isEditing: boolean;
  isDirty: boolean; // Has unsaved changes

  // Sidebar state
  sidebarCollapsed: boolean;
  selectedTags: string[];

  // Actions - Notes CRUD with API
  fetchNotes: () => Promise<void>;
  createNewNote: (noteData: {
    title: string;
    type: NoteType;
    content?: string;
  }) => Promise<NoteData | null>;
  updateCurrentNote: (updates: Partial<NoteData>) => Promise<void>;
  deleteNoteById: (noteId: number) => Promise<void>;
  fetchNoteById: (noteId: number) => Promise<void>;

  // Actions - Notes local state
  setNotes: (notes: NoteData[]) => void;
  addNote: (note: NoteData) => void;
  updateNote: (id: number, updates: Partial<NoteData>) => void;
  removeNote: (id: number) => void;
  setCurrentNote: (note: NoteData | null) => void;

  // Actions - Blocks local state
  addBlock: (noteId: number, block: BlockData) => void;
  updateBlock: (
    noteId: number,
    blockId: number,
    updates: Partial<BlockData>,
  ) => void;
  removeBlock: (noteId: number, blockId: number) => void;
  reorderBlocks: (noteId: number, newBlockOrder: BlockData[]) => void;

  // Actions - Block operations with API
  addBlockToNote: (noteId: number, blockData: any) => Promise<void>;
  updateNoteBlock: (
    noteId: number,
    blockId: number,
    updates: any,
  ) => Promise<void>;
  removeBlockFromNote: (noteId: number, blockId: number) => Promise<void>;

  // Actions - UI state
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilter: (filter: Partial<NoteFilter>) => void;
  setSearchQuery: (query: string) => void;
  clearFilter: () => void;

  // Actions - Editor
  setSelectedBlock: (blockId: number | null) => void;
  setEditing: (editing: boolean) => void;
  setDirty: (dirty: boolean) => void;

  // Actions - Sidebar
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleTag: (tag: string) => void;
  clearSelectedTags: () => void;

  // Utility actions
  reset: () => void;
  resetEditor: () => void;
}

const defaultFilter: NoteFilter = {
  page: 0,
  size: 20,
};

export const useNoteStore = create<NoteState>()(
  persist(
    (set) => ({
      // Initial state
      notes: [],
      currentNote: null,
      isLoading: false,
      error: null,
      filter: defaultFilter,
      searchQuery: "",
      selectedBlockId: null,
      isEditing: false,
      isDirty: false,
      sidebarCollapsed: false,
      selectedTags: [],

      // API Methods
      fetchNotes: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await noteAPI.getNotes();
          set({ notes: response.content, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to fetch notes",
            isLoading: false,
          });
        }
      },

      createNewNote: async (noteData) => {
        set({ isLoading: true, error: null });
        try {
          const newNote = await noteAPI.createNote({
            title: noteData.title,
            type: noteData.type,
            ...(noteData.content && { content: noteData.content }),
          });
          set((state) => ({
            notes: [newNote, ...state.notes],
            currentNote: newNote,
            isLoading: false,
          }));
          return newNote;
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to create note",
            isLoading: false,
          });
          return null;
        }
      },

      updateCurrentNote: async (updates) => {
        const currentNote = useNoteStore.getState().currentNote;
        if (!currentNote) return;

        set({ isLoading: true, error: null });
        try {
          const updatedNote = await noteAPI.updateNote(currentNote.id, updates);
          set((state) => ({
            notes: state.notes.map((note) =>
              note.id === currentNote.id ? updatedNote : note,
            ),
            currentNote: updatedNote,
            isDirty: false,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to update note",
            isLoading: false,
          });
        }
      },

      deleteNoteById: async (noteId) => {
        set({ isLoading: true, error: null });
        try {
          await noteAPI.deleteNote(noteId);
          set((state) => ({
            notes: state.notes.filter((note) => note.id !== noteId),
            currentNote:
              state.currentNote?.id === noteId ? null : state.currentNote,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to delete note",
            isLoading: false,
          });
        }
      },

      fetchNoteById: async (noteId) => {
        set({ isLoading: true, error: null });
        try {
          const note = await noteAPI.getNoteById(noteId);
          set({ currentNote: note, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to fetch note",
            isLoading: false,
          });
        }
      },

      addBlockToNote: async (noteId, blockData) => {
        set({ isLoading: true, error: null });
        try {
          const newBlockResponse = await noteAPI.addBlock(noteId, blockData);
          const newBlock = convertBlockResponseToBlockData(newBlockResponse);
          set((state) => {
            const updatedNotes = state.notes.map((note) => {
              if (note.id === noteId && isBlockNote(note)) {
                return {
                  ...note,
                  blocks: [...note.blocks, newBlock],
                };
              }
              return note;
            });

            const updatedCurrentNote =
              state.currentNote?.id === noteId && isBlockNote(state.currentNote)
                ? {
                    ...state.currentNote,
                    blocks: [...state.currentNote.blocks, newBlock],
                  }
                : state.currentNote;

            return {
              notes: updatedNotes,
              currentNote: updatedCurrentNote,
              isLoading: false,
            };
          });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to add block",
            isLoading: false,
          });
        }
      },

      updateNoteBlock: async (noteId, blockId, updates) => {
        set({ isLoading: true, error: null });
        try {
          const updatedBlockResponse = await noteAPI.updateBlock(
            blockId,
            updates,
          );
          const updatedBlock =
            convertBlockResponseToBlockData(updatedBlockResponse);
          set((state) => {
            const updateBlockInArray = (blocks: BlockData[]) =>
              blocks.map((block) =>
                block.id === blockId ? updatedBlock : block,
              );

            const updatedNotes = state.notes.map((note) => {
              if (note.id === noteId && isBlockNote(note)) {
                return {
                  ...note,
                  blocks: updateBlockInArray(note.blocks),
                };
              }
              return note;
            });

            const updatedCurrentNote =
              state.currentNote?.id === noteId && isBlockNote(state.currentNote)
                ? {
                    ...state.currentNote,
                    blocks: updateBlockInArray(state.currentNote.blocks),
                  }
                : state.currentNote;

            return {
              notes: updatedNotes,
              currentNote: updatedCurrentNote,
              isLoading: false,
            };
          });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to update block",
            isLoading: false,
          });
        }
      },

      removeBlockFromNote: async (noteId, blockId) => {
        set({ isLoading: true, error: null });
        try {
          await noteAPI.deleteBlock(blockId);
          set((state) => {
            const filterBlocks = (blocks: BlockData[]) =>
              blocks.filter((block) => block.id !== blockId);

            const updatedNotes = state.notes.map((note) => {
              if (note.id === noteId && isBlockNote(note)) {
                return {
                  ...note,
                  blocks: filterBlocks(note.blocks),
                };
              }
              return note;
            });

            const updatedCurrentNote =
              state.currentNote?.id === noteId && isBlockNote(state.currentNote)
                ? {
                    ...state.currentNote,
                    blocks: filterBlocks(state.currentNote.blocks),
                  }
                : state.currentNote;

            return {
              notes: updatedNotes,
              currentNote: updatedCurrentNote,
              selectedBlockId:
                state.selectedBlockId === blockId
                  ? null
                  : state.selectedBlockId,
              isLoading: false,
            };
          });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to remove block",
            isLoading: false,
          });
        }
      },

      // Local state methods
      setNotes: (notes) => set({ notes }),

      addNote: (note) =>
        set((state) => ({
          notes: [note, ...state.notes],
        })),

      updateNote: (id, updates) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, ...updates } : note,
          ),
          currentNote:
            state.currentNote?.id === id
              ? { ...state.currentNote, ...updates }
              : state.currentNote,
        })),

      removeNote: (id) =>
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
          currentNote: state.currentNote?.id === id ? null : state.currentNote,
        })),

      setCurrentNote: (note) =>
        set({
          currentNote: note,
          selectedBlockId: null,
          isEditing: false,
          isDirty: false,
        }),

      // Block actions - only for block notes
      addBlock: (noteId, block) =>
        set((state) => {
          const updatedNotes = state.notes.map((note) => {
            if (note.id === noteId && isBlockNote(note)) {
              return {
                ...note,
                blocks: [...note.blocks, block],
              };
            }
            return note;
          });

          const updatedCurrentNote =
            state.currentNote?.id === noteId && isBlockNote(state.currentNote)
              ? {
                  ...state.currentNote,
                  blocks: [...state.currentNote.blocks, block],
                }
              : state.currentNote;

          return {
            notes: updatedNotes,
            currentNote: updatedCurrentNote,
            isDirty: true,
          };
        }),

      updateBlock: (noteId, blockId, updates) =>
        set((state) => {
          const updateBlockInArray = (blocks: BlockData[]) =>
            blocks.map((block) =>
              block.id === blockId ? { ...block, ...updates } : block,
            );

          const updatedNotes = state.notes.map((note) => {
            if (note.id === noteId && isBlockNote(note)) {
              return {
                ...note,
                blocks: updateBlockInArray(note.blocks),
              };
            }
            return note;
          });

          const updatedCurrentNote =
            state.currentNote?.id === noteId && isBlockNote(state.currentNote)
              ? {
                  ...state.currentNote,
                  blocks: updateBlockInArray(state.currentNote.blocks),
                }
              : state.currentNote;

          return {
            notes: updatedNotes,
            currentNote: updatedCurrentNote,
            isDirty: true,
          };
        }),

      removeBlock: (noteId, blockId) =>
        set((state) => {
          const filterBlocks = (blocks: BlockData[]) =>
            blocks.filter((block) => block.id !== blockId);

          const updatedNotes = state.notes.map((note) => {
            if (note.id === noteId && isBlockNote(note)) {
              return {
                ...note,
                blocks: filterBlocks(note.blocks),
              };
            }
            return note;
          });

          const updatedCurrentNote =
            state.currentNote?.id === noteId && isBlockNote(state.currentNote)
              ? {
                  ...state.currentNote,
                  blocks: filterBlocks(state.currentNote.blocks),
                }
              : state.currentNote;

          return {
            notes: updatedNotes,
            currentNote: updatedCurrentNote,
            isDirty: true,
            selectedBlockId:
              state.selectedBlockId === blockId ? null : state.selectedBlockId,
          };
        }),

      reorderBlocks: (noteId, newBlockOrder) =>
        set((state) => {
          const updatedNotes = state.notes.map((note) => {
            if (note.id === noteId && isBlockNote(note)) {
              return {
                ...note,
                blocks: newBlockOrder,
              };
            }
            return note;
          });

          const updatedCurrentNote =
            state.currentNote?.id === noteId && isBlockNote(state.currentNote)
              ? {
                  ...state.currentNote,
                  blocks: newBlockOrder,
                }
              : state.currentNote;

          return {
            notes: updatedNotes,
            currentNote: updatedCurrentNote,
            isDirty: true,
          };
        }),

      // UI state actions
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      setFilter: (newFilter) =>
        set((state) => ({
          filter: { ...state.filter, ...newFilter },
        })),

      setSearchQuery: (query) => set({ searchQuery: query }),

      clearFilter: () =>
        set({
          filter: defaultFilter,
          searchQuery: "",
          selectedTags: [],
        }),

      // Editor actions
      setSelectedBlock: (blockId) => set({ selectedBlockId: blockId }),
      setEditing: (editing) => set({ isEditing: editing }),
      setDirty: (dirty) => set({ isDirty: dirty }),

      // Sidebar actions
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      toggleTag: (tag) =>
        set((state) => ({
          selectedTags: state.selectedTags.includes(tag)
            ? state.selectedTags.filter((t) => t !== tag)
            : [...state.selectedTags, tag],
        })),

      clearSelectedTags: () => set({ selectedTags: [] }),

      // Utility actions
      reset: () =>
        set({
          notes: [],
          currentNote: null,
          isLoading: false,
          error: null,
          searchQuery: "",
          selectedBlockId: null,
          isEditing: false,
          isDirty: false,
          selectedTags: [],
        }),

      resetEditor: () =>
        set({
          selectedBlockId: null,
          isEditing: false,
          isDirty: false,
        }),
    }),
    {
      name: "note-store",
      partialize: (state) => ({
        filter: state.filter,
        sidebarCollapsed: state.sidebarCollapsed,
        selectedTags: state.selectedTags,
      }),
    },
  ),
);
