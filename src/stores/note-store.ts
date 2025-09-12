import type { BlockData, NoteData, NoteFilter } from "@/types/note";
import { create } from "zustand";
import { persist } from "zustand/middleware";

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

  // Actions - Notes
  setNotes: (notes: NoteData[]) => void;
  addNote: (note: NoteData) => void;
  updateNote: (id: number, updates: Partial<NoteData>) => void;
  removeNote: (id: number) => void;
  setCurrentNote: (note: NoteData | null) => void;

  // Actions - Blocks
  addBlock: (noteId: number, block: BlockData) => void;
  updateBlock: (
    noteId: number,
    blockId: number,
    updates: Partial<BlockData>,
  ) => void;
  removeBlock: (noteId: number, blockId: number) => void;
  reorderBlocks: (noteId: number, newBlockOrder: BlockData[]) => void;

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
  sortBy: "updatedAt",
  sortDir: "desc",
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

      // Notes actions
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

      // Block actions
      addBlock: (noteId, block) =>
        set((state) => {
          const updatedNotes = state.notes.map((note) => {
            if (note.id === noteId) {
              return {
                ...note,
                blocks: [...note.blocks, block],
                totalBlocks: (note.totalBlocks ?? 0) + 1,
              };
            }
            return note;
          });

          const updatedCurrentNote =
            state.currentNote?.id === noteId
              ? {
                  ...state.currentNote,
                  blocks: [...state.currentNote.blocks, block],
                  totalBlocks: (state.currentNote.totalBlocks ?? 0) + 1,
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
            if (note.id === noteId) {
              return {
                ...note,
                blocks: updateBlockInArray(note.blocks),
              };
            }
            return note;
          });

          const updatedCurrentNote =
            state.currentNote?.id === noteId
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
            if (note.id === noteId) {
              return {
                ...note,
                blocks: filterBlocks(note.blocks),
                totalBlocks: Math.max(0, (note.totalBlocks ?? 0) - 1),
              };
            }
            return note;
          });

          const updatedCurrentNote =
            state.currentNote?.id === noteId
              ? {
                  ...state.currentNote,
                  blocks: filterBlocks(state.currentNote.blocks),
                  totalBlocks: Math.max(
                    0,
                    (state.currentNote.totalBlocks ?? 0) - 1,
                  ),
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
            if (note.id === noteId) {
              return {
                ...note,
                blocks: newBlockOrder,
              };
            }
            return note;
          });

          const updatedCurrentNote =
            state.currentNote?.id === noteId
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
