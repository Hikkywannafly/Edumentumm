import type {
  GetGroupsAPIResponse,
  GetGroupsDetailAPIResponse,
  GroupDetailResponse,
  GroupRequest,
  GroupResponse,
} from "../../types/group";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

class GroupAPI {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const accessToken = localStorage.getItem("accessToken");

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...options.headers,
      },
      ...options,
    };
    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("An unexpected error occurred");
    }
  }

  async getGroups(
    page: number,
    size: number,
    keyword: string,
  ): Promise<GetGroupsAPIResponse> {
    const response = await this.request<GetGroupsAPIResponse>(
      `/user/groups/public?page=${page}&size=${size}&keyword=${keyword}`,
    );
    console.log(response.data);
    return {
      status: response.status,
      message: response.message || "Success",
      data: response.data,
      pagination: response.pagination,
    };
  }

  async createGroup(createGroup: GroupRequest): Promise<GroupResponse> {
    const response = await this.request<GroupResponse>("/user/groups", {
      method: "POST",
      body: JSON.stringify(createGroup),
    });

    return response;
  }

  async getGroupDetailById(publicId: string): Promise<GroupDetailResponse> {
    const response = await this.request<GetGroupsDetailAPIResponse>(
      `/user/groups/${publicId}`,
      {
        method: "GET",
      },
    );
    console.log(response);
    return response.data;
  }

  async getMyGroups(): Promise<GroupResponse[]> {
    const response = await this.request<GetGroupsAPIResponse>(
      "/user/groups/my-group",
    );
    console.log(response.data);
    return response.data;
  }

  async joinGroup(publicId: string): Promise<void> {
    await this.request(`/user/groups/${publicId}/join`, {
      method: "POST",
    });
  }

  async deleteGroup(publicId: string): Promise<void> {
    await this.request(`/user/groups/${publicId}`, {
      method: "DELETE",
    });
  }

  async updateGroup(
    createGroup: GroupRequest,
    publicId: string,
  ): Promise<GroupResponse> {
    const response = await this.request<any>(`/user/groups/${publicId}`, {
      method: "PATCH",
      body: JSON.stringify(createGroup),
    });
    console.log(response.data);
    return response.data;
  }

  async donatePoint(
    groupId: number,
    points: number,
    message: string,
  ): Promise<void> {
    await this.request(`/user/groups/${groupId}/donate`, {
      method: "POST",
      body: JSON.stringify({ points, message }),
    });
  }
}

export const groupAPI = new GroupAPI();
