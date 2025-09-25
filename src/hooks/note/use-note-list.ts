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
          error instanceof Error ? error.message : "Failed to fetch notes";
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
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
      if (!noteId) throw new Error("Note ID is required");

      try {
        const note = await noteAPI.getNoteById(noteId);
        setCurrentNote(note);
        setError(null);
        return note;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch note";
        setError(errorMessage);
        throw error;
      }
    },
    enabled: !!noteId,
    staleTime: 1000 * 60 * 2, // 2 minutes
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
      // Add to store
      addNote(newNote);

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: noteQueryKeys.lists() });

      // Cache the new note
      queryClient.setQueryData(noteQueryKeys.detail(newNote.id), newNote);

      setError(null);
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create note";
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
      // Update store
      updateNote(updatedNote.id, updatedNote);

      // Update cache
      queryClient.setQueryData(
        noteQueryKeys.detail(updatedNote.id),
        updatedNote,
      );

      // Invalidate lists to refresh
      queryClient.invalidateQueries({ queryKey: noteQueryKeys.lists() });

      setError(null);
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update note";
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
      // Remove from store
      removeNote(noteId);

      // Remove from cache
      queryClient.removeQueries({ queryKey: noteQueryKeys.detail(noteId) });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: noteQueryKeys.lists() });

      setError(null);
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete note";
      setError(errorMessage);
    },
    retry: false, // Don't retry delete operations
  });
}

// Hook to create a note with default content
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
          noteAPI.createHeadingBlock(1, "Meeting Notes", 0),
          noteAPI.createParagraphBlock("**Date:** ", 1),
          noteAPI.createParagraphBlock("**Attendees:** ", 2),
          noteAPI.createHeadingBlock(2, "Agenda", 3),
          noteAPI.createToDoBlock("", false, 4),
          noteAPI.createHeadingBlock(2, "Action Items", 5),
          noteAPI.createToDoBlock("", false, 6),
        ];
        break;
      case "daily":
        initialBlocks = [
          noteAPI.createHeadingBlock(1, "Daily Notes", 0),
          noteAPI.createParagraphBlock(
            `**${new Date().toLocaleDateString()}**`,
            1,
          ),
          noteAPI.createHeadingBlock(2, "Today's Goals", 2),
          noteAPI.createToDoBlock("", false, 3),
          noteAPI.createHeadingBlock(2, "Notes", 4),
          noteAPI.createParagraphBlock("", 5),
        ];
        break;
      default:
        initialBlocks = [noteAPI.createParagraphBlock("Start writing...", 0)];
    }

    // Create note first, then add blocks
    const noteData = await createNote.mutateAsync({
      title,
      type: "block",
      tags: [],
    });

    // Add initial blocks if it's a template
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
