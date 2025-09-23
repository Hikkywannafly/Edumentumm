import type { Key } from "react";

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
  tagCourseNames?: string[];
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
  id: number;
  courseId: number;
  title: string;
  shortDescription: string;
  fullDescription?: string;
  courseLevel: CourseLevel;
  courseStatus: CourseStatus;
  thumbnailUrl?: string;
  price: number;
  teacher: TeacherSummary;
  courseTags: CourseTag[];
  courseTagNames?: string[];
  totalEnrollments: number;
  totalLessons?: number;
  averageRating: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CourseSummary {
  courseId: number;
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

export interface FilterOptions {
  level?: CourseLevel;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  size?: number;
}

export interface ICourseFilter {
  search: string;
  tags: string[];
  level: CourseLevel[];
  sortBy: "price" | "popular" | "level" | "createdAt" | "updatedAt";
}

export interface Lesson {
  id: string;
  courseId: number;
  title: string;
  description: string;
  order: number;
  duration: number;
  videoUrl?: string;
  content: string;
}

// Additional interfaces for backend responses
export interface LessonResponseDto {
  lessonId: Key | null | undefined;
  id: string;
  durationMinutes: number;
  courseId: number;
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
  [x: string]: Key | null | undefined;
  id: string;
  courseId: number;
  title: string;
  description: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceResponseDto {
  [x: string]: Key | null | undefined;
  id: string;
  courseId: number;
  title: string;
  description: string;
  resourceUrl: string;
  resourceType: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface RatingResponseDto {
  [x: string]: Key | null | undefined;
  id: string;
  studentId: string;
  courseId: number;
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

export interface GetStudentCoursesParams {
  keyword?: string;
  level?: CourseLevel;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  tagNames?: string[];
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
// Additional types to add to existing course.type.ts

export enum EnrollmentStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface RatingCreateRequestDto {
  rating: number; // 1-5
  comment?: string;
}

export interface EnrollmentResponseDto {
  enrollmentId: number;
  course: CourseSummary;
  status: EnrollmentStatus;
  paidAmount: number;
  completedLessons: number;
  completedExercises: number;
  progressPercentage: number;
  enrolledAt: string;
}

// Update existing TeacherSummary to match backend response
export interface TeacherSummary {
  userId: number;
  username: string;
  email: string;
  imageUrl?: string;
}

// Update existing CourseTag to match backend response
export interface CourseTag {
  courseTagId: number;
  name: string;
  color?: string;
}
