import axios from "axios";
import type {} from "../../types/group";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface UploadResponseAPI {
  data: UploadResponse;
  message: string;
  status: string;
}

interface UploadResponse {
  imageUrl: string;
  bannerUrl: string;
  username: string;
}

interface GetProfileAPIResponse {
  data: {
    id: string;
    username: string;
    createdAt: string;
    streak: string;
    levelProgress: string;
    totalStudyTime: string;
    totalQuizzesCreated: string;
    totalQuizzesCompleted: string;
    totalFlashCardCreated: string;
    totalFlashCardCompleted: string;
    totalAttendance: string;
    totalStudyTimeToday: string;
  };
  message: string;
  status: string;
}

interface GetProfileAttendanceAPIResponse {
  data: {
    localDate: string[];
  };
  message: string;
  status: string;
}

class ProfileAPI {
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

  async updateProfile(
    imageUrl: File,
    bannerUrl: File,
    username: string,
  ): Promise<UploadResponseAPI> {
    const formData = new FormData();
    formData.append("imageUrl", imageUrl);
    formData.append("bannerUrl", bannerUrl);
    formData.append("username", username);

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      throw new Error("No access token found");
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/user/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Upload failed");
      }
      throw new Error("Upload failed");
    }
  }

  async getProfile(): Promise<GetProfileAPIResponse> {
    const response = await this.request<GetProfileAPIResponse>("/user/profile");
    return response;
  }

  async getAttendance(): Promise<GetProfileAttendanceAPIResponse> {
    const response = await this.request<GetProfileAttendanceAPIResponse>(
      "/user/profile/attendance",
    );
    return response;
  }
}

export const profileAPI = new ProfileAPI();
