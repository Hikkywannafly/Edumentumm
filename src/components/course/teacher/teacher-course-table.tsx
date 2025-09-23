"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/auth-context";
import {
  useArchiveCourse,
  useDeleteCourse,
  usePublishCourse,
} from "@/hooks/course/use-teacher-courses";
import { useToast } from "@/hooks/use-toast";
import { getLocaleFromPathname } from "@/lib/utils";
import type { Course } from "@/types/course.type";
import { CourseStatus } from "@/types/course.type";
import {
  AlertCircle,
  Archive,
  CheckCircle,
  Copy,
  Edit,
  Eye,
  Loader2,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LocalizedLink } from "../../localized-link";

interface TeacherCourseTableProps {
  courses: Course[];
  isLoading?: boolean;
  error?: Error | null;
}

export function TeacherCourseTable({
  courses,
  isLoading,
  error,
}: TeacherCourseTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const { toast } = useToast();
  const { user, hasRole } = useAuth();

  const deleteCourseMutation = useDeleteCourse();
  const publishCourseMutation = usePublishCourse();
  const archiveCourseMutation = useArchiveCourse();

  const DEFAULT_THUMBNAIL_URL =
    "https://sr12121.newzenler.com/images/default-course-thumbnail.png";

  const getLevelText = (level: string) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "Beginner";
      case "intermediate":
        return "Intermediate";
      case "advanced":
        return "Advanced";
      default:
        return level || "Unknown";
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

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case "draft":
        return "Draft";
      case "published":
        return "Published";
      case "archived":
        return "Archived";
      default:
        return status || "Unknown";
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

  const handleDeleteClick = (course: Course) => {
    setCourseToDelete(course);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (courseToDelete) {
      try {
        await deleteCourseMutation.mutateAsync(courseToDelete.id);
        toast({
          title: "Course Deleted",
          description: `Course "${courseToDelete.title}" has been deleted successfully.`,
        });
        setDeleteDialogOpen(false);
        setCourseToDelete(null);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error?.message || "Failed to delete course",
          variant: "destructive",
        });
      }
    }
  };

  const handlePublishCourse = async (course: Course) => {
    try {
      await publishCourseMutation.mutateAsync(course.id);
      toast({
        title: "Course Published",
        description: `Course "${course.title}" has been published successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to publish course",
        variant: "destructive",
      });
    }
  };

  const handleArchiveCourse = async (course: Course) => {
    try {
      await archiveCourseMutation.mutateAsync(course.id);
      toast({
        title: "Course Archived",
        description: `Course "${course.title}" has been archived successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to archive course",
        variant: "destructive",
      });
    }
  };

  const handleDuplicate = (course: Course) => {
    // TODO: Implement duplicate functionality
    toast({
      title: "Course Duplicated",
      description: `Course "${course.title}" has been duplicated successfully.`,
    });
  };

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(dateObj);
  };

  // Check authentication
  if (!user || !hasRole) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You need to log in with a teacher account to view the course list.
        </AlertDescription>
      </Alert>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-lg border py-12">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Loading course list...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          An error occurred while loading the course list: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  // Show empty state
  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border py-12 text-center">
        <div className="mb-4 h-16 w-16 text-muted-foreground">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
            <path d="M12 2v20" strokeDasharray="2 2" />
          </svg>
        </div>
        <h3 className="mb-2 font-medium text-foreground text-lg">
          No courses found
        </h3>
        <p className="mb-4 text-muted-foreground">
          Start by creating your first course
        </p>
        <LocalizedLink href="/course/teacher/new">
          <Button>Create a new course</Button>
        </LocalizedLink>
      </div>
    );
  }

  const isAnyMutationLoading =
    deleteCourseMutation.isPending ||
    publishCourseMutation.isPending ||
    archiveCourseMutation.isPending;

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Lessons</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.courseId}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-lg bg-muted">
                      <img
                        src={course.thumbnailUrl || DEFAULT_THUMBNAIL_URL}
                        alt={course.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            DEFAULT_THUMBNAIL_URL;
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{course.title}</div>
                      <div className="truncate text-muted-foreground text-sm">
                        {course.shortDescription}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {course.courseTagNames
                          ?.slice(0, 2)
                          .map((tag: string) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          )) ||
                          course.courseTags?.slice(0, 2).map((tag) => (
                            <Badge
                              key={tag.id}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag.name}
                            </Badge>
                          ))}
                        {(course.courseTagNames?.length ||
                          course.courseTags?.length ||
                          0) > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +
                            {(course.courseTagNames?.length ||
                              course.courseTags?.length ||
                              0) - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getLevelColor(course.courseLevel)}>
                    {getLevelText(course.courseLevel)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(course.courseStatus)}>
                    {getStatusText(course.courseStatus)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {course.totalLessons || 0} bài
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground text-sm">
                    {course.createdAt ? formatDate(course.createdAt) : "N/A"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground text-sm">
                    {course.updatedAt ? formatDate(course.updatedAt) : "N/A"}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isAnyMutationLoading}
                      >
                        {isAnyMutationLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreHorizontal className="h-4 w-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Link
                        href={`/${locale}/course/teacher/${course.courseId}/view`}
                      >
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                      </Link>
                      <Link
                        href={`/${locale}/course/teacher/${course.courseId}/edit`}
                      >
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      </Link>

                      {/* Conditional actions based on course status */}
                      {course.courseStatus === CourseStatus.DRAFT && (
                        <DropdownMenuItem
                          onClick={() => handlePublishCourse(course)}
                          disabled={publishCourseMutation.isPending}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Publish
                        </DropdownMenuItem>
                      )}

                      {course.courseStatus === CourseStatus.PUBLISHED && (
                        <DropdownMenuItem
                          onClick={() => handleArchiveCourse(course)}
                          disabled={archiveCourseMutation.isPending}
                        >
                          <Archive className="mr-2 h-4 w-4" />
                          Archive
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuItem onClick={() => handleDuplicate(course)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(course)}
                        className="text-destructive focus:text-destructive"
                        disabled={deleteCourseMutation.isPending}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the course "
              {courseToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCourseMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteCourseMutation.isPending}
            >
              {deleteCourseMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
