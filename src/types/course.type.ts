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

export enum EnrollmentStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum ResourceType {
  PDF = "PDF",
  VIDEO = "VIDEO",
  LINK = "LINK",
  IMAGE = "IMAGE",
  AUDIO = "AUDIO",
}

export enum ExerciseType {
  QUIZ = "QUIZ",
  ASSIGNMENT = "ASSIGNMENT",
  PROJECT = "PROJECT",
  PRACTICE = "PRACTICE",
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
  userId: number;
  username: string;
  email: string;
  imageUrl?: string;
}

export interface CourseTag {
  courseTagId: number;
  name: string;
  color?: string;
}

export interface Course {
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

// Lesson Types
export interface LessonCreateRequestDto {
  title: string;
  content?: string;
  orderIndex?: number;
  videoUrl?: string;
  durationMinutes?: number;
}

export interface LessonResponseDto {
  lessonId: number;
  title: string;
  content?: string;
  orderIndex: number;
  videoUrl?: string;
  durationMinutes?: number;
  createdAt: string;
}

export interface LessonDetailResponseDto {
  lessonId: number;
  title: string;
  description: string;
  orderIndex: number;
  exercises: ExerciseDetailResponseDto[];
}

export interface LessonPreviewResponseDto {
  lessonId: number;
  title: string;
  description: string;
  orderIndex: number;
}

// Exercise Types
export interface ExerciseCreateRequestDto {
  title: string;
  description: string;
  instructions?: string;
  orderIndex?: number;
}

export interface ExerciseResponseDto {
  exerciseId: number;
  title: string;
  description: string;
  instructions?: string;
  orderIndex: number;
  createdAt: string;
}

export interface ExerciseDetailResponseDto {
  exerciseId: number;
  title: string;
  description: string;
  type: ExerciseType;
}

// Resource Types
export interface ResourceCreateRequestDto {
  title: string;
  description?: string;
  resourceType: ResourceType;
  url: string;
  orderIndex?: number;
}

export interface ResourceResponseDto {
  resourceUrl: any;
  resourceId: number;
  title: string;
  description?: string;
  resourceType: ResourceType;
  url: string;
  orderIndex: number;
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

export interface RatingCreateRequestDto {
  rating: number;
  comment?: string;
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

export interface CourseSelectRequest {
  roleId: string;
}

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
