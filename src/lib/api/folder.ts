import axios from "axios";
import type {
  FileResponse,
  FolderCreateAPIResponse,
  FolderResponse,
  GetFolderAPIResponse,
} from "../../types/folder";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type UploadProgressCallback = (progress: number) => void;

class FolderAPI {
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

  async getFolder(groupId: string): Promise<FolderResponse[]> {
    const response = await this.request<GetFolderAPIResponse>(
      `/user/groups/folders/${groupId}`,
    );
    console.log(response.data);
    return response.data;
  }

  async createGroup(groupId: string, name: string): Promise<FolderResponse> {
    const response = await this.request<FolderCreateAPIResponse>(
      `/user/groups/${groupId}/folders`,
      {
        method: "POST",
        body: JSON.stringify({ name: name }),
      },
    );
    return response.data;
  }

  async uploadFileInFolder(
    groupId: string,
    name: string,
  ): Promise<FolderResponse> {
    const response = await this.request<FolderCreateAPIResponse>(
      `/user/groups/${groupId}/folders`,
      {
        method: "POST",
        body: JSON.stringify({ name: name }),
      },
    );
    return response.data;
  }

  async deleteFile(fileId: string): Promise<void> {
    await this.request<void>(`/user/groups/folders/delete-file/${fileId}`, {
      method: "DELETE",
    });
  }

  // async uploadFiles(
  //   folderId: string,
  //   files: File[],
  //   onProgress?: UploadProgressCallback
  // ): Promise<FileResponse[]> {
  //   await axios.post(
  //     "http://localhost:8080/api/v1/user/groups/folders/upload-file",
  //     formData,
  //     {
  //       headers: {
  //         Authorization: `Bearer ${accessToken}`,
  //         "Content-Type": "multipart/form-data",
  //       },
  //       onUploadProgress: (progressEvent) => {
  //         if (progressEvent.total) {
  //           const percent = Math.round(
  //             (progressEvent.loaded / progressEvent.total) * 100
  //           );
  //           setUploadProgress(percent);
  //         }
  //       },
  //     }
  //   );
  // }

  async uploadFiles(
    folderId: string,
    files: File[],
    onProgress?: UploadProgressCallback,
  ): Promise<FileResponse[]> {
    const formData = new FormData();
    formData.append("folderId", folderId);

    for (const file of files) {
      formData.append("files", file);
    }

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      throw new Error("No access token found");
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/user/groups/folders/upload-file`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total && onProgress) {
              const percent = Math.round(
                (progressEvent.loaded / progressEvent.total) * 100,
              );
              onProgress(percent);
            }
          },
        },
      );

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Upload failed");
      }
      throw new Error("Upload failed");
    }
  }
}

export const folderAPI = new FolderAPI();
