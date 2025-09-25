import { noteAPI } from "@/lib/api/note";
import { useNoteStore } from "@/stores/note-store";
import type {
  CreateNoteRequest,
  NoteData,
  NoteFilter,
  UpdateNoteRequest,
} from "@/types/note";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { noteQueryKeys } from "../note-query-keys";

export function useNoteList(filter?: NoteFilter) {
  const { setNotes, setLoading, setError } = useNoteStore();

  return useQuery({
    queryKey: noteQueryKeys.list(filter),
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await noteAPI.getNotes(filter);
        setNotes(response.content);
        setError(null);
        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Lỗi tải danh sách notes";
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    staleTime: 1000 * 60 * 5, // 5 phút
    retry: (failureCount, error: any) => {
      // Không retry với lỗi auth
      if (error?.message?.includes("401") || error?.message?.includes("403")) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useNoteDetail(noteId: number | null) {
  const { setCurrentNote, setError } = useNoteStore();

  return useQuery({
    queryKey: noteId ? noteQueryKeys.detail(noteId) : [],
    queryFn: async () => {
      if (!noteId) throw new Error("Cần có ID note");

      try {
        const note = await noteAPI.getNoteById(noteId);
        setCurrentNote(note);
        setError(null);
        return note;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Lỗi tải note";
        setError(errorMessage);
        throw error;
      }
    },
    enabled: !!noteId,
    staleTime: 1000 * 60 * 2, // 2 phút
    retry: (failureCount, error: any) => {
      if (error?.message?.includes("404")) return false;
      if (error?.message?.includes("401") || error?.message?.includes("403")) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  const { addNote, setError } = useNoteStore();

  return useMutation({
    mutationFn: async (data: CreateNoteRequest): Promise<NoteData> => {
      return noteAPI.createNote(data);
    },
    onSuccess: (newNote) => {
      // Thêm vào store
      addNote(newNote);

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: noteQueryKeys.lists() });

      // Cache note mới
      queryClient.setQueryData(noteQueryKeys.detail(newNote.id), newNote);

      setError(null);
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Lỗi tạo note";
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

export function useUpdateNote() {
  const queryClient = useQueryClient();
  const { updateNote, setError } = useNoteStore();

  return useMutation({
    mutationFn: async ({
      noteId,
      data,
    }: { noteId: number; data: UpdateNoteRequest }): Promise<NoteData> => {
      return noteAPI.updateNote(noteId, data);
    },
    onSuccess: (updatedNote) => {
      // Cập nhật store
      updateNote(updatedNote.id, updatedNote);

      // Cập nhật cache
      queryClient.setQueryData(
        noteQueryKeys.detail(updatedNote.id),
        updatedNote,
      );

      // Invalidate lists để refresh
      queryClient.invalidateQueries({ queryKey: noteQueryKeys.lists() });

      setError(null);
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Lỗi cập nhật note";
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

export function useDeleteNote() {
  const queryClient = useQueryClient();
  const { removeNote, setError } = useNoteStore();

  return useMutation({
    mutationFn: async (noteId: number): Promise<void> => {
      return noteAPI.deleteNote(noteId);
    },
    onSuccess: (_, noteId) => {
      // Xóa khỏi store
      removeNote(noteId);

      // Xóa khỏi cache
      queryClient.removeQueries({ queryKey: noteQueryKeys.detail(noteId) });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: noteQueryKeys.lists() });

      setError(null);
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Lỗi xóa note";
      setError(errorMessage);
    },
    retry: false, // Không retry cho delete operations
  });
}

// Hook để tạo note với template mặc định
export function useCreateNoteWithTemplate() {
  const createNote = useCreateNote();

  const createWithTemplate = async (
    title: string,
    template?: "blank" | "meeting" | "daily",
  ) => {
    let initialBlocks: any;

    switch (template) {
      case "meeting":
        initialBlocks = [
          noteAPI.createHeadingBlock(1, "Ghi chú cuộc họp", 0),
          noteAPI.createParagraphBlock("**Ngày:** ", 1),
          noteAPI.createParagraphBlock("**Tham dự:** ", 2),
          noteAPI.createHeadingBlock(2, "Chương trình", 3),
          noteAPI.createToDoBlock("", false, 4),
          noteAPI.createHeadingBlock(2, "Hành động", 5),
          noteAPI.createToDoBlock("", false, 6),
        ];
        break;
      case "daily":
        initialBlocks = [
          noteAPI.createHeadingBlock(1, "Ghi chú hàng ngày", 0),
          noteAPI.createParagraphBlock(
            `**${new Date().toLocaleDateString()}**`,
            1,
          ),
          noteAPI.createHeadingBlock(2, "Mục tiêu hôm nay", 2),
          noteAPI.createToDoBlock("", false, 3),
          noteAPI.createHeadingBlock(2, "Ghi chú", 4),
          noteAPI.createParagraphBlock("", 5),
        ];
        break;
      default:
        initialBlocks = [noteAPI.createParagraphBlock("Bắt đầu viết...", 0)];
    }

    // Tạo note trước, sau đó thêm blocks
    const noteData = await createNote.mutateAsync({
      title,
      type: "block",
      tags: [],
    });

    // Thêm blocks ban đầu nếu là template
    if (template !== "blank" && noteData) {
      for (const block of initialBlocks) {
        await noteAPI.addBlock(noteData.id, block);
      }
    }

    return noteData;
  };

  return {
    createWithTemplate,
    isLoading: createNote.isPending,
    error: createNote.error,
    reset: createNote.reset,
  };
}
