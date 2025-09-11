import type {
  AddCollaboratorRequest,
  ApiError,
  BackendNotesResponse,
  BlockData,
  Comment,
  CreateBlockRequest,
  CreateCommentRequest,
  CreateNoteRequest,
  NoteData,
  NoteFilter,
  NotesListResponse,
  ReorderBlocksRequest,
  UpdateBlockRequest,
  UpdateNoteRequest,
} from "@/types/note";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

class NoteAPI {
  private getAuthHeaders() {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      throw new Error("No access token found. Please login first.");
    }
    return {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };
  }

  private async handleResponse<T>(
    response: Response,
    operation: string,
  ): Promise<T> {
    if (!response.ok) {
      let errorMessage = `${operation} failed: ${response.status}`;

      try {
        const errorData: ApiError = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        const textError = await response.text();
        errorMessage = textError || errorMessage;
      }

      throw new Error(errorMessage);
    }

    const jsonData = await response.json();
    return jsonData;
  }

  private buildQueryParams(filter?: NoteFilter): string {
    if (!filter) return "";

    const params = new URLSearchParams();

    if (filter.page !== undefined)
      params.append("page", filter.page.toString());
    if (filter.size !== undefined)
      params.append("size", filter.size.toString());
    if (filter.sortBy) params.append("sortBy", filter.sortBy);
    if (filter.sortDir) params.append("sortDir", filter.sortDir);
    if (filter.query) params.append("search", filter.query);
    if (filter.ownerId) params.append("ownerId", filter.ownerId.toString());
    if (filter.tag) params.append("tag", filter.tag);

    return params.toString() ? `?${params.toString()}` : "";
  }

  // ===== NOTES MANAGEMENT =====

  /**
   * Get list of notes with filtering and pagination
   */
  async getNotes(filter?: NoteFilter): Promise<NotesListResponse> {
    const queryParams = this.buildQueryParams(filter);
    const url = `${API_BASE_URL}/user/notes${queryParams}`;

    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });

    const backendResponse = await this.handleResponse<BackendNotesResponse>(
      response,
      "Get notes",
    );

    // Transform backend response to frontend expected format
    return {
      content: backendResponse.data,
      page: backendResponse.pagination.currentPage,
      size: backendResponse.pagination.pageSize,
      totalElements: backendResponse.pagination.totalElements,
      totalPages: backendResponse.pagination.totalPages,
      first: !backendResponse.pagination.hasPrevious,
      last: !backendResponse.pagination.hasNext,
    };
  } /**
   * Get a single note by ID
   */
  async getNoteById(noteId: number): Promise<NoteData> {
    const response = await fetch(`${API_BASE_URL}/user/notes/${noteId}`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<NoteData>(response, "Get note");
  }

  /**
   * Create a new note
   */
  async createNote(data: CreateNoteRequest): Promise<NoteData> {
    const response = await fetch(`${API_BASE_URL}/user/notes`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<NoteData>(response, "Create note");
  }

  /**
   * Update an existing note
   */
  async updateNote(noteId: number, data: UpdateNoteRequest): Promise<NoteData> {
    const response = await fetch(`${API_BASE_URL}/user/notes/${noteId}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<NoteData>(response, "Update note");
  }

  /**
   * Delete a note
   */
  async deleteNote(noteId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/user/notes/${noteId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Delete note failed: ${response.status}`);
    }
  }

  // ===== BLOCKS MANAGEMENT =====

  /**
   * Add a new block to a note
   */
  async addBlock(
    noteId: number,
    blockData: CreateBlockRequest,
  ): Promise<BlockData> {
    const response = await fetch(
      `${API_BASE_URL}/user/notes/${noteId}/blocks`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(blockData),
      },
    );

    return this.handleResponse<BlockData>(response, "Add block");
  }

  /**
   * Update an existing block
   */
  async updateBlock(
    blockId: number,
    blockData: UpdateBlockRequest,
  ): Promise<BlockData> {
    const response = await fetch(
      `${API_BASE_URL}/user/notes/blocks/${blockId}`,
      {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(blockData),
      },
    );

    return this.handleResponse<BlockData>(response, "Update block");
  }

  /**
   * Delete a block
   */
  async deleteBlock(blockId: number): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/user/notes/blocks/${blockId}`,
      {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      },
    );

    if (!response.ok) {
      throw new Error(`Delete block failed: ${response.status}`);
    }
  }

  /**
   * Reorder blocks in a note
   */
  async reorderBlocks(blockOrders: ReorderBlocksRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/user/notes/blocks/reorder`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(blockOrders),
    });

    if (!response.ok) {
      throw new Error(`Reorder blocks failed: ${response.status}`);
    }
  }

  // ===== COLLABORATION =====

  /**
   * Add a collaborator to a note
   */
  async addCollaborator(
    noteId: number,
    collaboratorData: AddCollaboratorRequest,
  ): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/user/notes/${noteId}/collaborators`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(collaboratorData),
      },
    );

    if (!response.ok) {
      throw new Error(`Add collaborator failed: ${response.status}`);
    }
  }

  /**
   * Remove a collaborator from a note
   */
  async removeCollaborator(noteId: number, userId: number): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/user/notes/${noteId}/collaborators/${userId}`,
      {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      },
    );

    if (!response.ok) {
      throw new Error(`Remove collaborator failed: ${response.status}`);
    }
  }

  // ===== COMMENTS =====

  /**
   * Add a comment to a note
   */
  async addComment(
    noteId: number,
    commentData: CreateCommentRequest,
  ): Promise<Comment> {
    const response = await fetch(
      `${API_BASE_URL}/user/notes/${noteId}/comments`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(commentData),
      },
    );

    return this.handleResponse<Comment>(response, "Add comment");
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: number): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/user/notes/comments/${commentId}`,
      {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      },
    );

    if (!response.ok) {
      throw new Error(`Delete comment failed: ${response.status}`);
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * Test connection to the API
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/notes?page=0&size=1`, {
        headers: this.getAuthHeaders(),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Extract plain text from block content
   */
  extractPlainText(content: any): string {
    if (typeof content === "string") return content;
    if (content.text) return content.text;
    if (content.code) return content.code;
    return "";
  }

  /**
   * Create a basic paragraph block
   */
  createParagraphBlock(text: string, orderIndex: number): CreateBlockRequest {
    return {
      type: "paragraph",
      content: {
        text,
        formatting: {},
      },
      plainText: text,
      orderIndex,
      parentBlockId: null,
      properties: {},
    };
  }

  /**
   * Create a heading block
   */
  createHeadingBlock(
    text: string,
    level: 1 | 2 | 3,
    orderIndex: number,
  ): CreateBlockRequest {
    const type = `heading_${level}` as const;
    return {
      type,
      content: {
        text,
        formatting: {},
      },
      plainText: text,
      orderIndex,
      parentBlockId: null,
      properties: {},
    };
  }

  /**
   * Create a to-do block
   */
  createTodoBlock(
    text: string,
    checked: boolean,
    orderIndex: number,
  ): CreateBlockRequest {
    return {
      type: "to_do",
      content: {
        text,
        formatting: {},
      },
      plainText: text,
      orderIndex,
      parentBlockId: null,
      properties: {
        checked,
      },
    };
  }
}

export const noteAPI = new NoteAPI();
