import type {
  ApiError,
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

    if (!accessToken) {
      throw new Error("Không tìm thấy access token. Vui lòng đăng nhập trước.");
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
      let errorMessage = `${operation} thất bại: ${response.status}`;

      try {
        const errorData: ApiError = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = `${operation} thất bại: ${response.status} ${response.statusText}`;
      }

      throw new Error(errorMessage);
    }

    // Xử lý response không có content (như DELETE 204)
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
      throw new Error(`Không thể parse response cho ${operation}`);
    }
  }

  // Lấy danh sách Notes
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
      await this.handleResponse(response, "Lấy danh sách notes");

    // Chuyển đổi response từ backend sang format frontend
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

  // Lấy Note theo ID
  async getNoteById(noteId: number): Promise<NoteData> {
    const url = `${API_BASE_URL}/user/notes/${noteId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (response.status === 404) {
      throw new Error(`Không tìm thấy note với ID ${noteId}`);
    }

    const rawResponse = await this.handleResponse(response, "Lấy note theo ID");

    // Kiểm tra nếu response được wrap trong ApiResponse format
    if (
      rawResponse &&
      typeof rawResponse === "object" &&
      "data" in rawResponse
    ) {
      const noteData = (rawResponse as any).data;
      if (!noteData) {
        throw new Error(
          `Không tìm thấy note với ID ${noteId} trong response data`,
        );
      }
      return noteData;
    }

    if (!rawResponse) {
      throw new Error(`Không tìm thấy note với ID ${noteId} - response rỗng`);
    }
    return rawResponse as NoteData;
  }

  // Tạo Note mới
  async createNote(noteData: CreateNoteRequest): Promise<NoteData> {
    const response = await fetch(`${API_BASE_URL}/user/notes`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(noteData),
    });

    // API trả về trực tiếp NoteData, không wrap trong ApiResponse
    const noteResponse: NoteData = await this.handleResponse(
      response,
      "Tạo note",
    );

    return noteResponse;
  }

  // Cập nhật Note
  async updateNote(
    noteId: number,
    noteData: UpdateNoteRequest,
  ): Promise<NoteData> {
    const response = await fetch(`${API_BASE_URL}/user/notes/${noteId}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(noteData),
    });

    const rawResponse = await this.handleResponse(response, "Cập nhật note");

    // Kiểm tra nếu response được wrap trong ApiResponse format
    if (
      rawResponse &&
      typeof rawResponse === "object" &&
      "data" in rawResponse
    ) {
      return (rawResponse as any).data;
    }

    return rawResponse as NoteData;
  }

  // Xóa Note
  async deleteNote(noteId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/user/notes/${noteId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    await this.handleResponse(response, "Xóa note");
  }

  // Thêm Block vào Note
  async addBlock(
    noteId: number,
    blockData: CreateBlockRequest,
  ): Promise<BlockResponse> {
    const response = await fetch(
      `${API_BASE_URL}/user/notes/${noteId}/blocks`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(blockData),
      },
    );

    const rawResponse = await this.handleResponse(response, "Thêm block");

    // Kiểm tra nếu response được wrap trong ApiResponse format
    if (
      rawResponse &&
      typeof rawResponse === "object" &&
      "data" in rawResponse
    ) {
      return (rawResponse as any).data;
    }

    return rawResponse as BlockResponse;
  }

  // Cập nhật Block
  async updateBlock(
    blockId: number,
    blockData: UpdateBlockRequest,
  ): Promise<BlockResponse> {
    const response = await fetch(
      `${API_BASE_URL}/user/notes/blocks/${blockId}`,
      {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(blockData),
      },
    );

    const rawResponse = await this.handleResponse(response, "Cập nhật block");

    // Kiểm tra nếu response được wrap trong ApiResponse format
    if (
      rawResponse &&
      typeof rawResponse === "object" &&
      "data" in rawResponse
    ) {
      return (rawResponse as any).data;
    }

    return rawResponse as BlockResponse;
  }

  // Xóa Block
  async deleteBlock(blockId: number): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/user/notes/blocks/${blockId}`,
      {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      },
    );

    await this.handleResponse(response, "Xóa block");
  }

  // Sắp xếp lại Blocks
  async reorderBlocks(reorderData: ReorderBlocksRequest): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/user/notes/${reorderData.noteId}/blocks/reorder`,
      {
        method: "PATCH",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(reorderData),
      },
    );

    await this.handleResponse(response, "Sắp xếp lại blocks");
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
