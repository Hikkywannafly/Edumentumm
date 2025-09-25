// Note Types based on Backend API Documentation

// Note Type Enum
export type NoteType = "markdown" | "block";

// Block Type Enum - Updated từ documentation
export type BlockType =
  // Text & Heading
  | "paragraph"
  | "heading_1"
  | "heading_2"
  | "heading_3"
  // List & Todo
  | "bulleted_list_item"
  | "numbered_list_item"
  | "to_do"
  | "toggle"
  // Formatting
  | "quote"
  | "callout"
  | "divider"
  | "code"
  // Media & Data
  | "table"
  | "table_row"
  | "image"
  | "video"
  | "file"
  | "bookmark"
  | "embed"
  // Advanced / Database
  | "page"
  | "database_table"
  | "database_board"
  | "database_calendar"
  | "database_gallery"
  // Inline Embed
  | "equation"
  | "mention_user"
  | "mention_page"
  | "mention_date";

export type NotePermission = "OWNER" | "EDITOR" | "VIEWER";

export type InlineFormat =
  | "BOLD"
  | "ITALIC"
  | "UNDERLINE"
  | "STRIKETHROUGH"
  | "CODE"
  | "LINK"
  | "MENTION"
  | "HIGHLIGHT";

export interface InlineFormatting {
  type: InlineFormat;
  start: number;
  end: number;
  url?: string; // For LINK type
  userId?: number; // For MENTION type
  color?: string; // For HIGHLIGHT type
}

// Block Content Structures - Updated theo documentation
export interface BlockContent {
  // Text content cho các text blocks
  text?: string;

  // Image block content
  url?: string;
  caption?: string;
  alt?: string;

  // Code block content
  language?: string;

  // Quote block content
  author?: string;

  // To-do block content
  checked?: boolean;

  // Table content
  rows?: {
    cells: { text: string; formatting?: any }[];
  }[];

  // Legacy formatting support
  formatting?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    code?: boolean;
    color?: string;
  };
}

// Block Object - Updated theo documentation
export interface BlockData {
  id?: number;
  type: BlockType;
  content: BlockContent;
  orderIndex: number;
  noteId?: number;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
}

// Block Request DTO
export interface BlockRequest {
  type: BlockType;
  orderIndex: number;
  content: BlockContent;
}

// Block Response DTO (from Backend API)
export interface BlockResponse {
  id: number;
  type: string; // Backend returns string enum like "TEXT", "HEADING", etc.
  orderIndex: number;
  content: string | BlockContent; // Backend may return string or object depending on endpoint
}

export interface Collaborator {
  id: number;
  name: string;
  email: string;
  permission: NotePermission;
  addedAt: string;
}

export interface Comment {
  id: number;
  content: string;
  authorId: number;
  authorName: string;
  authorEmail: string;
  blockId?: number;
  parentCommentId?: number;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
}

// Tag Object
export interface Tag {
  id: number;
  tagName: string;
}

// Note Object - Updated theo documentation
export interface NoteData {
  id: number;
  title: string;
  type: NoteType;
  content?: string; // Chỉ có khi type = "markdown"
  ownerId: number;
  isDeleted: boolean;
  blocks?: BlockData[]; // Chỉ có khi type = "block"
  tags: string[];
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
}

// Request/Response DTOs - Updated theo documentation

export interface CreateNoteRequest {
  title: string; // Required, không được rỗng
  type?: NoteType; // Optional, mặc định "block"
  content?: string; // Optional, dùng cho markdown
  blocks?: BlockRequest[]; // Optional, dùng cho block
  tags?: string[]; // Optional
}

export interface UpdateNoteRequest {
  title?: string; // Optional
  type?: NoteType; // Optional, có thể chuyển đổi giữa markdown và block
  content?: string; // Optional, dùng cho markdown
  blocks?: BlockRequest[]; // Optional, dùng cho block
  tags?: string[]; // Optional
}

// API Response Types
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// Type Guards - Helper functions
export function isMarkdownNote(
  note: NoteData,
): note is NoteData & { content: string; type: "markdown" } {
  return note.type === "markdown";
}

export function isBlockNote(
  note: NoteData,
): note is NoteData & { blocks: BlockData[]; type: "block" } {
  return note.type === "block";
}

// Block Management Request Types
export interface ReorderBlocksRequest {
  noteId: number;
  orderedBlockIds: number[];
}

// Legacy Support - Backend Response Types
export interface BackendNotesResponse {
  data: NoteData[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface NotesListResponse {
  content: NoteData[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface NoteFilter {
  page?: number;
  size?: number;
  query?: string;
  ownerId?: number;
  tag?: string;
}

// Error Response Type
export interface ApiError {
  status: number;
  message: string;
  error?: string;
}

// Type aliases for API requests (corrected based on actual backend format)
export type CreateBlockRequest = {
  type: BlockType; // Frontend block type like "paragraph", "heading_1", etc.
  content: BlockContent; // Backend expects object, not string
  orderIndex: number;
};

export type UpdateBlockRequest = {
  type: BlockType; // Frontend block type like "paragraph", "heading_1", etc.
  content: BlockContent; // Backend expects object, not string
  orderIndex: number;
};
