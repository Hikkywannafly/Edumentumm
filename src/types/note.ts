// Note Types based on Backend API
export type BlockType =
  | "paragraph"
  | "heading_1"
  | "heading_2"
  | "heading_3"
  | "bulleted_list_item"
  | "numbered_list_item"
  | "to_do"
  | "toggle"
  | "quote"
  | "callout"
  | "divider"
  | "code"
  | "table"
  | "table_row"
  | "image"
  | "video"
  | "file"
  | "bookmark"
  | "embed"
  | "page"
  | "database_table"
  | "database_board"
  | "database_calendar"
  | "database_gallery"
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

export interface BlockContent {
  text?: string;
  formatting?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    code?: boolean;
    color?: string;
  };
  // For specific block types
  url?: string; // For image, video, file
  caption?: string; // For image, video
  code?: string; // For code block
  language?: string; // For code block
  rows?: {
    // For table block
    cells: { text: string; formatting?: any }[];
  }[];
}

export interface BlockData {
  id?: number;
  type: BlockType;
  content: BlockContent;
  orderIndex: number;
  parentBlockId?: number | null;
  properties?: Record<string, any>;
  noteId?: number;
  createdAt?: string;
  updatedAt?: string;
  children?: BlockData[]; // For nested blocks
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

export interface NoteData {
  id: number;
  title: string;
  icon?: string | null;
  coverUrl?: string | null;
  ownerId: number;
  ownerName?: string;
  ownerEmail?: string;
  isDeleted: boolean;
  isPublic?: boolean | null;
  isTemplate?: boolean | null;
  parentId?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  blocks: BlockData[];
  collaborators?: Collaborator[] | null;
  tags: string[];
  childPages?: NoteData[] | null;
  currentUserPermission?: NotePermission | null;
  totalBlocks?: number | null;
  totalComments?: number | null;
  totalCollaborators?: number | null;
}

// API Request/Response Types
export interface CreateNoteRequest {
  title: string;
  icon?: string;
  coverUrl?: string;
  parentId?: number | null;
  isPublic?: boolean;
  isTemplate?: boolean;
  tags?: string[];
  initialBlocks?: Omit<
    BlockData,
    "id" | "noteId" | "createdAt" | "updatedAt"
  >[];
}

export interface UpdateNoteRequest {
  title?: string;
  icon?: string;
  coverUrl?: string;
  parentId?: number | null;
  isPublic?: boolean;
  isTemplate?: boolean;
  tags?: string[];
}

export interface CreateBlockRequest {
  type: BlockType;
  content: BlockContent;
  plainText: string;
  orderIndex: number;
  parentBlockId?: number | null;
  properties?: Record<string, any>;
}

export interface UpdateBlockRequest {
  type?: BlockType;
  content?: BlockContent;
  plainText?: string;
  orderIndex?: number;
  parentBlockId?: number | null;
  properties?: Record<string, any>;
}

export interface ReorderBlocksRequest {
  blockOrders: {
    blockId: number;
    orderIndex: number;
  }[];
}

export interface AddCollaboratorRequest {
  userEmail: string;
  permission: NotePermission;
}

export interface CreateCommentRequest {
  content: string;
  blockId?: number;
  parentCommentId?: number;
}

// Backend API Response Types
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
  sortBy?: string;
  sortDir?: "asc" | "desc";
  query?: string;
  ownerId?: number;
  tag?: string;
}

// Error Response Type
export interface ApiError {
  status: string;
  message: string;
  timestamp: string;
  path: string;
}
