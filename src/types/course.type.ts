export interface Course {
  id: string;
  title: string;
  shortDescription: string;
  detailedDescription: string;
  level: "basic" | "intermediate" | "advanced";
  thumbnail: string;
  status: "draft" | "published";
  topics: string[];
  teacherId: string;
  teacherName: string;
  createdAt: Date;
  updatedAt: Date;
  lessonsCount?: number;
  rating: number;
  reviewCount: number;
  price: number;
  originalPrice?: number;
}

export interface ICourseFilter {
  search: string;
  topics: string[];
  level: string[];
  sortBy: "newest" | "popular" | "level";
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  duration: number;
  videoUrl?: string;
  content: string;
}
