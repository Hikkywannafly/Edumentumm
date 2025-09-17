export enum CourseLevel {
  BEGINNER = "BEGINNER",
  INTERMEDIATE = "INTERMEDIATE",
  ADVANCED = "ADVANCED",
}

export enum CourseStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export interface CourseCreateRequest {
  title: string;
  shortDescription: string;
  fullDescription?: string;
  courseLevel: CourseLevel;
  thumbnailUrl?: string;
  price?: number;
  courseStatus: CourseStatus;
  courseTagNames?: string[];
}

export interface CourseUpdateRequest {
  title?: string;
  shortDescription?: string;
  fullDescription?: string;
  courseLevel?: CourseLevel;
  thumbnailUrl?: string;
  price?: number;
  courseStatus?: CourseStatus;
  courseTagNames?: string[]; // Fixed: should be consistent with CourseCreateRequest
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface TeacherSummary {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface CourseTag {
  id: string;
  name: string;
}

// Fixed Course interface - removed duplicates and function definitions
export interface Course {
  id: string;
  courseId: string; // Keep both for backward compatibility if needed
  title: string;
  shortDescription: string;
  fullDescription?: string;
  courseLevel: CourseLevel;
  courseStatus: CourseStatus;
  thumbnailUrl?: string;
  price: number;
  teacher: TeacherSummary;
  courseTags: CourseTag[];
  courseTagNames?: string[]; // For easier access to tag names
  totalEnrollments: number;
  totalLessons?: number;
  averageRating: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CourseSummary {
  courseId: string;
  title: string;
  shortDescription: string;
  courseLevel: CourseLevel;
  thumbnailUrl?: string;
  price: number;
  teacherName: string;
  totalEnrollments: number;
  averageRating: number;
  createdAt: string;
}

export interface ICourseFilter {
  search: string;
  tags: string[];
  level: string[];
  sortBy: "price" | "popular" | "level";
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

// Additional interfaces for backend responses
export interface LessonResponseDto {
  id: string;
  courseId: string;
  title: string;
  description: string;
  orderIndex: number;
  duration: number;
  videoUrl?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseResponseDto {
  id: string;
  courseId: string;
  title: string;
  description: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceResponseDto {
  id: string;
  courseId: string;
  title: string;
  description: string;
  resourceUrl: string;
  resourceType: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface RatingResponseDto {
  id: string;
  studentId: string;
  courseId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherCourseDetailDto {
  course: Course;
  lessons: LessonResponseDto[];
  exercises: ExerciseResponseDto[];
  resources: ResourceResponseDto[];
  totalEnrollments: number;
  averageRating: number;
  recentRatings: RatingResponseDto[];
}

export interface EnrolledStudentCourseDetailDto {
  course: Course;
  lessons: LessonResponseDto[];
  exercises: ExerciseResponseDto[];
  resources: ResourceResponseDto[];
  enrollmentStatus: string;
  progressPercentage: number;
  completedLessons: number;
  completedExercises: number;
  userRating?: RatingResponseDto;
}

export interface PublicCourseDetailDto {
  course: Course;
  shortDescription: string;
  ratings: RatingResponseDto[];
  averageRating: number;
  totalEnrollments: number;
  totalLessons: number;
  totalExercises: number;
}

// For course selection/role selection
export interface CourseSelectRequest {
  roleId: string;
}

// Fixed pagination interface - changed generic parameter name
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// Specific typed interface for Course pagination if needed
export interface CoursePaginatedResponse {
  content: Course[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface GetTeacherCoursesParams {
  courseStatus?: CourseStatus;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}
