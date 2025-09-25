"use client";

import { LocalizedLink } from "@/components/localized-link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  useArchiveCourse,
  usePublishCourse,
  useTeacherCourseDetail,
} from "@/hooks/course/use-teacher-courses";
import { useToast } from "@/hooks/use-toast";
import { CourseStatus } from "@/types/course.type";
import parse from "html-react-parser";
import DOMPurify from "isomorphic-dompurify";
import {
  AlertCircle,
  Archive,
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  FileText,
  Loader2,
  Star,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface TeacherCourseViewProps {
  courseId: number;
}

export function TeacherCourseView({ courseId }: TeacherCourseViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [imageError, setImageError] = useState(false);

  const {
    data: courseDetail,
    isLoading,
    error,
  } = useTeacherCourseDetail(courseId);

  const publishCourseMutation = usePublishCourse();
  const archiveCourseMutation = useArchiveCourse();

  const handlePublishCourse = async () => {
    if (!courseDetail?.course) return;

    try {
      await publishCourseMutation.mutateAsync(courseDetail.course.courseId);
      toast({
        title: "Course Published",
        description: `Course "${courseDetail.course.title}" has been published successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to publish course",
        variant: "destructive",
      });
    }
  };

  const handleArchiveCourse = async () => {
    if (!courseDetail?.course) return;

    try {
      await archiveCourseMutation.mutateAsync(courseDetail.course.courseId);
      toast({
        title: "Course Archived",
        description: `Course "${courseDetail.course.title}" has been archived successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to archive course",
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: string | Date) => {
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(dateObj);
    } catch (_e) {
      return "Invalid date";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      case "published":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "archived":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center rounded-lg border py-12">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">
              Loading course details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load course details: {error.message || "Unknown error"}
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>
    );
  }

  // No data state
  if (!courseDetail || !courseDetail.course) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Course not found or you don't have permission to view it.
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>
    );
  }

  const course = courseDetail.course;
  const isActionLoading =
    publishCourseMutation.isPending || archiveCourseMutation.isPending;

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="font-bold text-2xl text-gray-900">{course.title}</h1>
            <div className="mt-1 flex items-center gap-2">
              <Badge className={getStatusColor(course.courseStatus)}>
                {course.courseStatus}
              </Badge>
              <Badge className={getLevelColor(course.courseLevel)}>
                {course.courseLevel}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Public View Link */}
          <LocalizedLink href={`/course/${course.courseId}`}>
            <Button variant="outline" size="sm">
              <Eye className="mr-2 h-4 w-4" />
              Public View
            </Button>
          </LocalizedLink>

          {/* Edit Button */}
          <LocalizedLink href={`/course/teacher/${course.courseId}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </LocalizedLink>

          {/* Status Actions */}
          {course.courseStatus === CourseStatus.DRAFT && (
            <Button
              onClick={handlePublishCourse}
              disabled={isActionLoading}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {publishCourseMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Publish
            </Button>
          )}

          {course.courseStatus === CourseStatus.PUBLISHED && (
            <Button
              onClick={handleArchiveCourse}
              disabled={isActionLoading}
              size="sm"
              variant="outline"
            >
              {archiveCourseMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Archive className="mr-2 h-4 w-4" />
              )}
              Archive
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Course Image */}
          <Card>
            <CardContent className="p-0">
              <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
                <img
                  src={
                    !imageError && course.thumbnailUrl
                      ? course.thumbnailUrl
                      : "https://sr12121.newzenler.com/images/default-course-thumbnail.png"
                  }
                  alt={course.title}
                  className="h-full w-full object-cover"
                  onError={() => setImageError(true)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground text-sm">
                {course.shortDescription || "No description provided"}
              </p>
              {course.fullDescription ? (
                <>
                  <Separator className="mb-4" />
                  <div className="prose prose-sm max-w-none">
                    {parse(DOMPurify.sanitize(course.fullDescription || ""))}
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No detailed description provided
                </p>
              )}
            </CardContent>
          </Card>

          {/* Course Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Course Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              {courseDetail.lessons && courseDetail.lessons.length > 0 ? (
                <div className="space-y-3">
                  {courseDetail.lessons.map((lesson, index) => (
                    <div
                      key={lesson.lessonId}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 font-medium text-blue-600 text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{lesson.title}</h4>
                          <p className="text-muted-foreground text-sm">
                            {lesson.content}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Clock className="h-4 w-4" />
                        {lesson.durationMinutes} min
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">No lessons added yet</p>
                  {/* <LocalizedLink
                    href={`/course/teacher/${course.courseId}/edit`}
                  >
                    <Button variant="outline" size="sm" className="mt-2">
                      Add Lessons
                    </Button>
                  </LocalizedLink> */}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Course Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Enrollments</span>
                </div>
                <span className="font-medium">
                  {courseDetail.totalEnrollments || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Rating</span>
                </div>
                <span className="font-medium">
                  {courseDetail.averageRating != null
                    ? `${courseDetail.averageRating.toFixed(1)} / 5.0`
                    : "No ratings yet"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Lessons</span>
                </div>
                <span className="font-medium">
                  {courseDetail.lessons?.length || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Exercises</span>
                </div>
                <span className="font-medium">
                  {courseDetail.exercises?.length || 0}
                </span>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Price</span>
                <span className="font-bold text-lg">
                  {course.price > 0 ? `$${course.price.toFixed(2)}` : "Free"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Course Info */}
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">Created</p>
                  <p className="text-muted-foreground text-sm">
                    {course.createdAt ? formatDate(course.createdAt) : "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">Last Updated</p>
                  <p className="text-muted-foreground text-sm">
                    {course.updatedAt ? formatDate(course.updatedAt) : "N/A"}
                  </p>
                </div>
              </div>

              {course.courseTags && course.courseTags.length > 0 && (
                <div>
                  <p className="mb-2 font-medium text-sm">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {course.courseTags.map((tag) => (
                      <Badge
                        key={tag.courseTagId}
                        variant="secondary"
                        className="text-xs"
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          {courseDetail.recentRatings &&
            courseDetail.recentRatings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Reviews</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {courseDetail.recentRatings.slice(0, 3).map((rating) => (
                    <div key={rating.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < (rating.rating || 0)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-muted-foreground text-sm">
                          {rating.createdAt
                            ? formatDate(rating.createdAt)
                            : "N/A"}
                        </span>
                      </div>
                      {rating.comment && (
                        <p className="text-muted-foreground text-sm">
                          {rating.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
        </div>
      </div>
    </div>
  );
}
