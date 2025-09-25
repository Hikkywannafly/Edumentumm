export interface GroupResponse {
  publicId: string;
  name: string;
  description: string;
  memberLimit: number;
  ownerId: number;
  ownerName: string;
  memberCount: number;
  key: string;
  createdAt: string;
  public: boolean;
}

export interface GroupRequest {
  name: string;
  description: string;
  memberLimit: number;
  public: boolean;
}

export interface IPagination {
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface GetGroupsAPIResponse {
  pagination: IPagination;
  data: GroupResponse[];
  status: string;
  message: string;
}

export interface UserGroupResponse {
  id: number;
  username: string;
  imageUrl: string;
}

export interface GroupDetailResponse {
  publicId: string;
  memberLimit: number;
  ownerId: number;
  ownerName: string;
  memberCount: number;
  key: string;
  name: string;
  description: string;
  groupTier: string;
  contributionPoints: string;
  isPublic: boolean;
  userGroupResponseList: UserGroupResponse[];
}

export interface GetGroupsDetailAPIResponse {
  data: GroupDetailResponse;
  status: string;
  message: string;
}

export interface GroupRequestUpdate {
  name: string;
  description: string;
  memberLimit: number;
  public: boolean;
}
