"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStudentEnrollments } from "@/hooks/course/use-enroll-course";
import {
  type EnrollmentResponseDto,
  EnrollmentStatus,
} from "@/types/course.type";
import { BookOpen, Clock, Loader2, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const DEFAULT_THUMBNAIL_URL =
  "https://sr12121.newzenler.com/images/default-course-thumbnail.png";

export default function MyEnrollments() {
  const [statusFilter, setStatusFilter] = useState<EnrollmentStatus | "ALL">(
    "ALL",
  );
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 6;

  const { data, isLoading, error } = useStudentEnrollments({
    enrollmentStatus: statusFilter === "ALL" ? undefined : statusFilter,
    page: currentPage,
    size: pageSize,
  });

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as EnrollmentStatus | "ALL");
    setCurrentPage(0);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-destructive">
            Failed to load your enrollments
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  const enrollments = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="font-bold text-3xl">My Courses</h1>
        <p className="text-muted-foreground">
          Manage and continue your learning journey
        </p>
      </div>

      {/* Filter Controls */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <label htmlFor="status-filter" className="font-medium text-sm">
            Filter by Status:
          </label>
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger id="status-filter" className="w-48">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              {Object.values(EnrollmentStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {pagination && (
          <div className="text-muted-foreground text-sm">
            Showing {enrollments.length} of {pagination.totalElements}{" "}
            enrollments
          </div>
        )}
      </div>

      {/* Enrollments Grid */}
      {enrollments.length > 0 ? (
        <>
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((enrollment: EnrollmentResponseDto) => (
              <EnrollmentCard
                key={enrollment.enrollmentId}
                enrollment={enrollment}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrevious}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    const pageNum =
                      Math.max(
                        0,
                        Math.min(pagination.totalPages - 5, currentPage - 2),
                      ) + i;

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          pageNum === currentPage ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum + 1}
                      </Button>
                    );
                  },
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNext}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 font-medium text-lg">No enrollments found</h3>
            <p className="mb-4 text-muted-foreground">
              {statusFilter === "ALL"
                ? "You haven't enrolled in any courses yet"
                : `No courses with status: ${statusFilter.replace("_", " ")}`}
            </p>
            <Button asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface EnrollmentCardProps {
  enrollment: EnrollmentResponseDto;
}

function EnrollmentCard({ enrollment }: EnrollmentCardProps) {
  const [imageError, setImageError] = useState(false);
  const { course } = enrollment;

  const getStatusColor = (status: EnrollmentStatus) => {
    switch (status) {
      case EnrollmentStatus.ACTIVE:
        return "bg-green-100 text-green-800";
      case EnrollmentStatus.COMPLETED:
        return "bg-blue-100 text-blue-800";
      case EnrollmentStatus.CANCELLED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
        {imageError ? (
          <div className="flex h-full items-center justify-center bg-gray-200">
            <div className="text-center text-gray-500">
              <BookOpen className="mx-auto mb-2 h-8 w-8" />
              <div className="text-sm">No Image</div>
            </div>
          </div>
        ) : (
          <Image
            src={course.thumbnailUrl || DEFAULT_THUMBNAIL_URL}
            alt={course.title}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline">{course.courseLevel}</Badge>
          <Badge className={getStatusColor(enrollment.status)}>
            {enrollment.status.replace("_", " ")}
          </Badge>
        </div>
        <CardTitle className="line-clamp-2">{course.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {course.shortDescription}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow space-y-3">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{enrollment.progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-green-600 transition-all duration-300"
              style={{
                width: `${Math.min(100, enrollment.progressPercentage)}%`,
              }}
            />
          </div>
        </div>

        {/* Course Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span>{enrollment.completedLessons} lessons</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{enrollment.completedExercises} exercises</span>
          </div>
        </div>

        {/* Teacher & Rating */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">by {course.teacherName}</span>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400" />
            <span>{course.averageRating?.toFixed(1) || "0.0"}</span>
          </div>
        </div>

        {/* Enrollment Info */}
        <div className="space-y-1 text-muted-foreground text-xs">
          <div>
            Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
          </div>
          <div>
            Paid:{" "}
            {enrollment.paidAmount === 0
              ? "Free"
              : `${enrollment.paidAmount.toFixed(2)}`}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        <div className="flex w-full gap-2">
          <Button asChild className="flex-1">
            <Link href={`/courses/${course.courseId}`}>
              {enrollment.status === EnrollmentStatus.COMPLETED
                ? "Review Course"
                : "Continue Learning"}
            </Link>
          </Button>
          {enrollment.progressPercentage < 100 && (
            <Button variant="outline" size="sm">
              Resume
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
