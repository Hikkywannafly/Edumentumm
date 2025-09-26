import { noteAPI } from "@/lib/api/note";
import type {
  BlockData,
  BlockResponse,
  BlockType,
  NoteData,
  NoteFilter,
  NoteType,
} from "@/types/note";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Hàm helper để chuyển đổi BlockResponse thành BlockData
const convertBlockResponseToBlockData = (
  blockResponse: BlockResponse,
): BlockData => {
  return {
    id: blockResponse.id,
    type: blockResponse.type as BlockType,
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
  // Dữ liệu notes
  notes: NoteData[];
  currentNote: NoteData | null;

  // State UI
  isLoading: boolean;
  error: string | null;

  // Filter và search
  filter: NoteFilter;
  searchQuery: string;

  // State editor
  selectedBlockId: number | null;
  isEditing: boolean;
  isDirty: boolean; // Có thay đổi chưa lưu

  // State sidebar
  sidebarCollapsed: boolean;
  selectedTags: string[];

  // Actions - Notes CRUD với API
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

  // Actions - Block operations với API
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
  setSelectedTags: (tags: string[]) => void;

  // Utility actions
  reset: () => void;
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
              error instanceof Error
                ? error.message
                : "Lỗi tải danh sách notes",
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
            error: error instanceof Error ? error.message : "Lỗi tạo note",
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
          set((state) => {
            // Loại bỏ note cũ và thêm note đã cập nhật lên đầu danh sách
            const filteredNotes = state.notes.filter(
              (note) => note.id !== currentNote.id,
            );
            return {
              notes: [updatedNote, ...filteredNotes],
              currentNote: updatedNote,
              isLoading: false,
            };
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Lỗi cập nhật note",
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
            error: error instanceof Error ? error.message : "Lỗi xóa note",
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
            error: error instanceof Error ? error.message : "Lỗi tải note",
            isLoading: false,
          });
        }
      },

      // Local state methods
      setNotes: (notes) => set({ notes }),
      addNote: (note) => set((state) => ({ notes: [note, ...state.notes] })),
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
      setCurrentNote: (note) => set({ currentNote: note }),

      // Block local state methods
      addBlock: (noteId, block) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  blocks: [...(note.blocks || []), block],
                }
              : note,
          ),
          currentNote:
            state.currentNote?.id === noteId
              ? {
                  ...state.currentNote,
                  blocks: [...(state.currentNote.blocks || []), block],
                }
              : state.currentNote,
        })),

      updateBlock: (noteId, blockId, updates) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  blocks:
                    note.blocks?.map((block) =>
                      block.id === blockId ? { ...block, ...updates } : block,
                    ) || [],
                }
              : note,
          ),
          currentNote:
            state.currentNote?.id === noteId
              ? {
                  ...state.currentNote,
                  blocks:
                    state.currentNote.blocks?.map((block) =>
                      block.id === blockId ? { ...block, ...updates } : block,
                    ) || [],
                }
              : state.currentNote,
        })),

      removeBlock: (noteId, blockId) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  blocks:
                    note.blocks?.filter((block) => block.id !== blockId) || [],
                }
              : note,
          ),
          currentNote:
            state.currentNote?.id === noteId
              ? {
                  ...state.currentNote,
                  blocks:
                    state.currentNote.blocks?.filter(
                      (block) => block.id !== blockId,
                    ) || [],
                }
              : state.currentNote,
        })),

      reorderBlocks: (noteId, newBlockOrder) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId ? { ...note, blocks: newBlockOrder } : note,
          ),
          currentNote:
            state.currentNote?.id === noteId
              ? { ...state.currentNote, blocks: newBlockOrder }
              : state.currentNote,
        })),

      // Block API methods
      addBlockToNote: async (noteId, blockData) => {
        try {
          const blockResponse = await noteAPI.addBlock(noteId, blockData);
          const blockDataConverted =
            convertBlockResponseToBlockData(blockResponse);

          set((state) => ({
            notes: state.notes.map((note) =>
              note.id === noteId
                ? {
                    ...note,
                    blocks: [...(note.blocks || []), blockDataConverted],
                  }
                : note,
            ),
            currentNote:
              state.currentNote?.id === noteId
                ? {
                    ...state.currentNote,
                    blocks: [
                      ...(state.currentNote.blocks || []),
                      blockDataConverted,
                    ],
                  }
                : state.currentNote,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Lỗi thêm block",
          });
        }
      },

      updateNoteBlock: async (noteId, blockId, updates) => {
        try {
          const blockResponse = await noteAPI.updateBlock(blockId, updates);
          const blockDataConverted =
            convertBlockResponseToBlockData(blockResponse);

          set((state) => ({
            notes: state.notes.map((note) =>
              note.id === noteId
                ? {
                    ...note,
                    blocks:
                      note.blocks?.map((block) =>
                        block.id === blockId ? blockDataConverted : block,
                      ) || [],
                  }
                : note,
            ),
            currentNote:
              state.currentNote?.id === noteId
                ? {
                    ...state.currentNote,
                    blocks:
                      state.currentNote.blocks?.map((block) =>
                        block.id === blockId ? blockDataConverted : block,
                      ) || [],
                  }
                : state.currentNote,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Lỗi cập nhật block",
          });
        }
      },

      removeBlockFromNote: async (noteId, blockId) => {
        try {
          await noteAPI.deleteBlock(blockId);
          set((state) => ({
            notes: state.notes.map((note) =>
              note.id === noteId
                ? {
                    ...note,
                    blocks:
                      note.blocks?.filter((block) => block.id !== blockId) ||
                      [],
                  }
                : note,
            ),
            currentNote:
              state.currentNote?.id === noteId
                ? {
                    ...state.currentNote,
                    blocks:
                      state.currentNote.blocks?.filter(
                        (block) => block.id !== blockId,
                      ) || [],
                  }
                : state.currentNote,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Lỗi xóa block",
          });
        }
      },

      // UI state methods
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setFilter: (filter) =>
        set((state) => ({ filter: { ...state.filter, ...filter } })),
      setSearchQuery: (query) => set({ searchQuery: query }),
      clearFilter: () => set({ filter: defaultFilter, searchQuery: "" }),

      // Editor methods
      setSelectedBlock: (blockId) => set({ selectedBlockId: blockId }),
      setEditing: (editing) => set({ isEditing: editing }),
      setDirty: (dirty) => set({ isDirty: dirty }),

      // Sidebar methods
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setSelectedTags: (tags) => set({ selectedTags: tags }),

      // Utility methods
      reset: () =>
        set({
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
        }),
    }),
    {
      name: "note-store",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        selectedTags: state.selectedTags,
        filter: state.filter,
      }),
    },
  ),
);
