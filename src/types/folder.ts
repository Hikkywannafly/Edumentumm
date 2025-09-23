import type { QuizDisplayData } from "./quiz-display";

export interface GetFolderAPIResponse {
  data: FolderResponse[];
  status: string;
  message: string;
}

export interface FolderResponse {
  id: string;
  folderName: string;
  ownerId: string;
  ownerName: string;
  createdAt: string;
  files: FileResponse[];
  quiz: QuizDisplayData[];
}

export interface FolderRequest {
  name: string;
}

export interface FolderCreateAPIResponse {
  data: FolderResponse;
  status: string;
  message: string;
}

export enum FileType {
  PDF = "PDF",
  DOC = "DOC",
  DOCX = "DOCX",
  PPT = "PPT",
  PPTX = "PPTX",
  XLS = "XLS",
  XLSX = "XLSX",
  TXT = "TXT",
  IMAGE_JPG = "IMAGE_JPG",
  IMAGE_PNG = "IMAGE_PNG",
  IMAGE_GIF = "IMAGE_GIF",
  VIDEO_MP4 = "VIDEO_MP4",
  VIDEO_MKV = "VIDEO_MKV",
  AUDIO_MP3 = "AUDIO_MP3",
  AUDIO_WAV = "AUDIO_WAV",
  ZIP = "ZIP",
  RAR = "RAR",
  JSON = "JSON",
  OTHER = "OTHER",
}

export type FileResponse = {
  id: string;
  filename: string;
  fileUrl: string;
  fileType: FileType;
  fileSize: number;
  ownerId: string;
  ownerName: string;
  createdAt: string;
};
