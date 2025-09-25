import type {
  ApiError,
  ApiResponse,
  BlockRequest,
  BlockResponse,
  CreateBlockRequest,
  CreateNoteRequest,
  NoteData,
  NoteFilter,
  NotesListResponse,
  PaginatedResponse,
  ReorderBlocksRequest,
  UpdateBlockRequest,
  UpdateNoteRequest,
} from "@/types/note";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

class NoteAPI {
  private getAuthHeaders() {
    const accessToken = localStorage.getItem("accessToken");
    console.log(
      "Getting access token from localStorage:",
      accessToken ? "Found" : "Not found",
    );
    console.log("Token length:", accessToken?.length);
    console.log(`Token starts with: ${accessToken?.substring(0, 20)}...`);

    // Check if token might be expired by decoding JWT payload
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split(".")[1]));
        const expiry = new Date(payload.exp * 1000);
        const now = new Date();
        console.log("Token expiry:", expiry.toISOString());
        console.log("Current time:", now.toISOString());
        console.log("Token expired:", expiry < now);
        console.log("Current user ID from token:", payload.userId);
        console.log("Current user email from token:", payload.sub);
      } catch (e) {
        console.log("Could not decode token:", e);
      }
    }

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
      let errorDetails = "";

      try {
        const errorData: ApiError = await response.json();
        errorMessage = errorData.message || errorMessage;
        errorDetails = JSON.stringify(errorData, null, 2);
        console.error(`❌ ${operation} Error Details:`, errorDetails);

        // Special handling for permission errors
        if (response.status === 403) {
          console.error(
            "🚫 Permission Error: User may not have EDIT permission for this resource",
          );
        }
      } catch {
        // If JSON parsing fails, don't try to read the stream again
        errorMessage = `${operation} failed: ${response.status} ${response.statusText}`;
        console.error(
          `❌ ${operation} Raw Error: ${response.status} ${response.statusText}`,
        );
      }

      throw new Error(errorMessage);
    }

    // Handle responses that shouldn't have content (like DELETE 204)
    if (
      response.status === 204 ||
      response.headers.get("content-length") === "0"
    ) {
      return null as T;
    }

    try {
      const text = await response.text();
      if (!text) {
        return null as T;
      }
      return JSON.parse(text);
    } catch {
      throw new Error(`Failed to parse response for ${operation}`);
    }
  }

  // 1. Lấy danh sách Notes
  async getNotes(filter: NoteFilter = {}): Promise<NotesListResponse> {
    const params = new URLSearchParams();

    if (filter.page !== undefined)
      params.append("page", filter.page.toString());
    if (filter.size !== undefined)
      params.append("size", filter.size.toString());
    if (filter.query) params.append("query", filter.query);
    if (filter.ownerId) params.append("ownerId", filter.ownerId.toString());
    if (filter.tag) params.append("tag", filter.tag);

    const queryParams = params.toString() ? `?${params.toString()}` : "";
    const url = `${API_BASE_URL}/user/notes${queryParams}`;

    const response = await fetch(url, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    const backendResponse: PaginatedResponse<NoteData> =
      await this.handleResponse(response, "Get notes");

    // Transform backend response to frontend format
    return {
      content: backendResponse.data,
      page: backendResponse.currentPage,
      size: backendResponse.pageSize,
      totalElements: backendResponse.totalElements,
      totalPages: backendResponse.totalPages,
      first: backendResponse.currentPage === 0,
      last: backendResponse.currentPage === backendResponse.totalPages - 1,
    };
  }

  // 2. Lấy Note theo ID
  async getNoteById(noteId: number): Promise<NoteData> {
    console.log("Getting note by ID:", noteId);
    const url = `${API_BASE_URL}/user/notes/${noteId}`;
    console.log("Request URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    console.log("Raw response:", response.status, response.statusText);

    if (response.status === 404) {
      throw new Error(`Note with ID ${noteId} not found`);
    }

    const rawResponse = await this.handleResponse(response, "Get note by ID");

    console.log("Raw response data:", rawResponse);

    // Check if response is wrapped in ApiResponse format
    if (
      rawResponse &&
      typeof rawResponse === "object" &&
      "data" in rawResponse
    ) {
      console.log("Response has .data property:", rawResponse.data);
      const noteData = (rawResponse as any).data;
      if (!noteData) {
        throw new Error(`Note with ID ${noteId} not found in response data`);
      }
      return noteData;
    }

    console.log("Response is direct NoteData:", rawResponse);
    if (!rawResponse) {
      throw new Error(`Note with ID ${noteId} not found - empty response`);
    }
    return rawResponse as NoteData;
  }

  // 3. Tạo Note mới
  async createNote(noteData: CreateNoteRequest): Promise<NoteData> {
    const response = await fetch(`${API_BASE_URL}/user/notes`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(noteData),
    });

    const apiResponse: ApiResponse<NoteData> = await this.handleResponse(
      response,
      "Create note",
    );

    return apiResponse.data;
  }

  // 4. Cập nhật Note
  async updateNote(
    noteId: number,
    noteData: UpdateNoteRequest,
  ): Promise<NoteData> {
    console.log("🔄 Updating note:", noteId, "with data:", noteData);

    // Debug auth headers
    const headers = this.getAuthHeaders();
    console.log("📋 Request headers:", {
      Authorization: `${headers.Authorization.substring(0, 30)}...`,
      "Content-Type": headers["Content-Type"],
    });

    // First, check if we can get the note (to verify ownership)
    try {
      const existingNote = await this.getNoteById(noteId);
      console.log("📝 Existing note info:", {
        id: existingNote.id,
        title: existingNote.title,
        ownerId: existingNote.ownerId,
        type: existingNote.type,
      });

      // Check current user from token and localStorage
      const accessToken = localStorage.getItem("accessToken");
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

      let currentUserId = null;

      // Try to get user ID from localStorage first (user.userId according to schema)
      if (currentUser.userId && typeof currentUser.userId === "number") {
        currentUserId = currentUser.userId;
      } else if (currentUser.id && typeof currentUser.id === "number") {
        currentUserId = currentUser.id;
      } else if (accessToken) {
        // If not found in localStorage, try to decode from token
        try {
          const payload = JSON.parse(atob(accessToken.split(".")[1]));
          // Try different possible field names in token
          currentUserId =
            payload.id || payload.userId || payload.user_id || payload.sub;

          // If still not found, maybe it's in a nested object
          if (!currentUserId && payload.user) {
            currentUserId = payload.user.id || payload.user.userId;
          }

          // Convert string numbers to number
          if (
            typeof currentUserId === "string" &&
            !Number.isNaN(Number(currentUserId))
          ) {
            currentUserId = Number(currentUserId);
          }
        } catch (e) {
          console.log("Could not decode token:", e);
        }
      }

      console.log("👤 Current user ID:", currentUserId);
      console.log("👤 Current user from localStorage:", currentUser);
      console.log("🏠 Note owner ID:", existingNote.ownerId);
      console.log("✅ Can edit?", existingNote.ownerId === currentUserId);
    } catch (error) {
      console.log("❌ Could not verify note ownership:", error);
    }

    console.log("📡 Final request body:", JSON.stringify(noteData, null, 2));

    const response = await fetch(`${API_BASE_URL}/user/notes/${noteId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(noteData),
    });

    console.log(
      "📡 Update response status:",
      response.status,
      response.statusText,
    ); // For debugging 403 errors, try to get response body
    if (response.status === 403) {
      const clonedResponse = response.clone();
      try {
        const errorBody = await clonedResponse.text();
        console.log("403 Error response body:", errorBody);

        // If token expired, suggest refresh
        console.log(
          "🔄 Suggestion: Token might be expired. Try refreshing the page or re-login.",
        );
      } catch (e) {
        console.log("Could not read 403 error body:", e);
      }
    }

    const rawResponse = await this.handleResponse(response, "Update note");

    console.log("Update raw response:", rawResponse);

    // Check if response is wrapped in ApiResponse format
    if (
      rawResponse &&
      typeof rawResponse === "object" &&
      "data" in rawResponse
    ) {
      console.log("Update response has .data property:", rawResponse.data);
      return (rawResponse as any).data;
    }

    console.log("Update response is direct NoteData:", rawResponse);
    return rawResponse as NoteData;
  }

  // 5. Xóa Note
  async deleteNote(noteId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/user/notes/${noteId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    await this.handleResponse(response, "Delete note");
  }

  // 6. Thêm Block vào Note
  async addBlock(
    noteId: number,
    blockData: CreateBlockRequest,
  ): Promise<BlockResponse> {
    console.log("Adding block to note:", noteId, "with data:", blockData);
    const response = await fetch(
      `${API_BASE_URL}/user/notes/${noteId}/blocks`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(blockData),
      },
    );

    console.log("Add block response status:", response.status);

    const rawResponse = await this.handleResponse(response, "Add block");

    console.log("Add block raw response:", rawResponse);

    // Check if response is wrapped in ApiResponse format
    if (
      rawResponse &&
      typeof rawResponse === "object" &&
      "data" in rawResponse
    ) {
      return (rawResponse as any).data;
    }

    return rawResponse as BlockResponse;
  }

  // 7. Cập nhật Block
  async updateBlock(
    blockId: number,
    blockData: UpdateBlockRequest,
  ): Promise<BlockResponse> {
    console.log("Updating block:", blockId, "with data:", blockData);

    // Log current user for debugging permissions
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split(".")[1]));
        console.log("🔍 Debug - Current user ID:", payload.userId);
        console.log("🔍 Debug - Current user email:", payload.sub);
      } catch (e) {
        console.log("Could not decode token for debug:", e);
      }
    }

    // Test if we can GET the block first (for debugging)
    try {
      console.log("🧪 Testing GET block access first...");
      const testResponse = await fetch(
        `${API_BASE_URL}/user/notes/blocks/${blockId}`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        },
      );
      console.log("🧪 GET block response status:", testResponse.status);
    } catch (e) {
      console.log("🧪 GET block test failed:", e);
    }

    const response = await fetch(
      `${API_BASE_URL}/user/notes/blocks/${blockId}`,
      {
        method: "PUT", // Use PUT according to documentation
        headers: this.getAuthHeaders(),
        body: JSON.stringify(blockData),
      },
    );

    console.log("Update block response status:", response.status);

    const rawResponse = await this.handleResponse(response, "Update block");

    console.log("Update block raw response:", rawResponse);

    // Check if response is wrapped in ApiResponse format
    if (
      rawResponse &&
      typeof rawResponse === "object" &&
      "data" in rawResponse
    ) {
      return (rawResponse as any).data;
    }

    return rawResponse as BlockResponse;
  }

  // 8. Xóa Block
  async deleteBlock(blockId: number): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/user/notes/blocks/${blockId}`,
      {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      },
    );

    await this.handleResponse(response, "Delete block");
  }

  // 9. Sắp xếp lại Blocks
  async reorderBlocks(reorderData: ReorderBlocksRequest): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/user/notes/${reorderData.noteId}/blocks/reorder`,
      {
        method: "PATCH",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(reorderData),
      },
    );

    await this.handleResponse(response, "Reorder blocks");
  }

  // Helper methods
  async createMarkdownNote(
    title: string,
    content: string,
    tags: string[] = [],
  ): Promise<NoteData> {
    return this.createNote({
      title,
      type: "markdown",
      content,
      tags,
    });
  }

  async createBlockNote(
    title: string,
    blocks: BlockRequest[] = [],
    tags: string[] = [],
  ): Promise<NoteData> {
    return this.createNote({
      title,
      type: "block",
      blocks,
      tags,
    });
  }

  // Block factory methods
  createParagraphBlock(text: string, orderIndex: number): CreateBlockRequest {
    return {
      type: "paragraph",
      content: {
        text,
        formatting: {
          bold: false,
          italic: false,
        },
      },
      orderIndex,
    };
  }

  createHeadingBlock(
    level: 1 | 2 | 3,
    text: string,
    orderIndex: number,
  ): CreateBlockRequest {
    return {
      type: `heading_${level}` as "heading_1" | "heading_2" | "heading_3",
      content: {
        text,
        formatting: {
          bold: false,
          italic: false,
        },
      },
      orderIndex,
    };
  }

  createToDoBlock(
    text: string,
    checked: boolean,
    orderIndex: number,
  ): CreateBlockRequest {
    return {
      type: "to_do",
      content: {
        text,
        checked,
        formatting: {
          bold: false,
          italic: false,
        },
      },
      orderIndex,
    };
  }
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/notes?page=0&size=1`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const noteAPI = new NoteAPI();
export default noteAPI;
