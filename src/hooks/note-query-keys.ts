export const noteQueryKeys = {
  // Base key
  all: ["notes"] as const,

  // List operations
  lists: () => [...noteQueryKeys.all, "list"] as const,
  list: (filters?: any) => [...noteQueryKeys.lists(), { filters }] as const,

  // Detail operations
  details: () => [...noteQueryKeys.all, "detail"] as const,
  detail: (id: number) => [...noteQueryKeys.details(), id] as const,

  // Block operations
  blocks: (noteId: number) =>
    [...noteQueryKeys.detail(noteId), "blocks"] as const,
  block: (blockId: number) => [...noteQueryKeys.all, "block", blockId] as const,

  // Collaboration
  collaborators: (noteId: number) =>
    [...noteQueryKeys.detail(noteId), "collaborators"] as const,

  // Comments
  comments: (noteId: number) =>
    [...noteQueryKeys.detail(noteId), "comments"] as const,

  // Search and filters
  search: (query: string) => [...noteQueryKeys.all, "search", query] as const,
  byTag: (tag: string) => [...noteQueryKeys.all, "tag", tag] as const,
  byOwner: (ownerId: number) =>
    [...noteQueryKeys.all, "owner", ownerId] as const,

  // Infinite queries
  infinite: (filters?: any) =>
    [...noteQueryKeys.all, "infinite", { filters }] as const,
} as const;
