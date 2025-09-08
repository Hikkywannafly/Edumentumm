const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export type AchievementAPIResponse = {
  data: Achievement[];
  message: string;
  status: string;
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

  async getAllAchievement(): Promise<Achievement[]> {
    const response =
      await this.request<AchievementAPIResponse>("/user/achievement");
    console.log(response.data);
    return response.data;
  }
}

export const achievementAPI = new AchievementAPI();
