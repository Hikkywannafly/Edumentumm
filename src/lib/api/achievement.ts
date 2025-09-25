const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface IPagination {
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export type Summary = {
  totalUnlocked: number;
  totalAchievements: number;
  percentCompleted: number;
  totalXP: number;
};

export type SummaryAchievementAPIResponse = {
  data: Summary;
  status: string;
  message: string;
};

export type AchievementAPIResponse = {
  pagination: IPagination;
  data: Achievement[];
  status: string;
  message: string;
};

export type Achievement = {
  id: string;
  icon: string;
  title: string;
  description: string;
  targetValue: number;
  points: number;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  currentValue: number;
  achieved: boolean;
};

class AchievementAPI {
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

  async getAllAchievement(
    page: number,
    size: number,
    keyword: string,
    rarity?: string,
    achieved?: boolean,
  ): Promise<AchievementAPIResponse> {
    const params = [
      `page=${page}`,
      `size=${size}`,
      `keyword=${encodeURIComponent(keyword || "")}`,
    ];
    if (rarity) params.push(`rarity=${encodeURIComponent(rarity)}`);
    if (typeof achieved === "boolean") params.push(`achieved=${achieved}`);
    const query = params.join("&");
    const response = await this.request<AchievementAPIResponse>(
      `/user/achievement?${query}`,
    );
    return response;
  }

  async getSummaryAchievement(): Promise<Summary> {
    const response = await this.request<SummaryAchievementAPIResponse>(
      "/user/achievement/summary",
    );
    return response.data;
  }
}

export const achievementAPI = new AchievementAPI();
