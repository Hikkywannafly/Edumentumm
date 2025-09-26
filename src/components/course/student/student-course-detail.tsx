"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useEnrollInCourse,
  useUnenrollFromCourse,
} from "@/hooks/course/use-enroll-course";
import {
  isEnrolledStudentCourseDetail,
  isPublicCourseDetail,
  useCourseDetail,
} from "@/hooks/course/use-student-course-detail";
import { toast } from "@/hooks/use-toast";
import type {
  Course,
  ExerciseResponseDto,
  LessonResponseDto,
  ResourceResponseDto,
} from "@/types/course.type";
import {
  BookOpen,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Loader2,
  Play,
  Star,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { CourseRatingSection } from "./course-rating-section";

interface CourseDetailPageProps {
  courseId: string;
}

const DEFAULT_THUMBNAIL_URL =
  "https://sr12121.newzenler.com/images/default-course-thumbnail.png";

export default function StudentCourseDetail({
  courseId,
}: CourseDetailPageProps) {
  const [imageError, setImageError] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const { data, isLoading, error, refetch } = useCourseDetail(courseId);
  const enrollMutation = useEnrollInCourse();
  const unenrollMutation = useUnenrollFromCourse();

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
          <p className="mb-4 text-destructive">Failed to load course details</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Course not found</p>
      </div>
    );
  }

  const courseDetail = data.data;
  const course: Course = courseDetail.course;

  const handleEnroll = async () => {
    try {
      await enrollMutation.mutateAsync(courseId);
      toast({
        title: "Success",
        description: "Successfully enrolled in the course!",
      });
      refetch(); // Refresh data to get enrolled view
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to enroll in course",
        variant: "destructive",
      });
    }
  };

  const handleUnenroll = async () => {
    try {
      await unenrollMutation.mutateAsync(courseId);
      toast({
        title: "Success",
        description: "Successfully unenrolled from the course.",
      });
      refetch(); // Refresh data to get public view
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to unenroll from course",
        variant: "destructive",
      });
    }
  };

  const isEnrolled = isEnrolledStudentCourseDetail(courseDetail);
  const isPublic = isPublicCourseDetail(courseDetail);

  return (
    <div className="container mx-auto p-4">
      {/* Hero Section */}
      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Course Image */}
        <div className="lg:col-span-2">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
            {imageError ? (
              <div className="flex h-full items-center justify-center bg-gray-200">
                <div className="text-center text-gray-500">
                  <BookOpen className="mx-auto mb-2 h-12 w-12" />
                  <p>Course Image</p>
                </div>
              </div>
            ) : (
              <Image
                src={course.thumbnailUrl || DEFAULT_THUMBNAIL_URL}
                alt={course.title}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
                priority
              />
            )}
          </div>
        </div>

        {/* Course Info Card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="outline">{course.courseLevel}</Badge>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm">
                    {course.averageRating?.toFixed(1) || "0.0"}
                  </span>
                </div>
              </div>
              <CardTitle className="text-2xl">{course.title}</CardTitle>
              <CardDescription>{course.shortDescription}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Course Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{course.totalEnrollments} students</span>
                </div>
                {isPublic && (
                  <>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>{courseDetail.totalLessons} lessons</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{courseDetail.totalExercises} exercises</span>
                    </div>
                  </>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="font-bold text-2xl">
                  {course.price === 0 ? "Free" : `$${course.price.toFixed(2)}`}
                </span>
              </div>

              {/* Teacher Info */}
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground text-sm">Instructor</p>
                <div className="flex items-center gap-3">
                  {course.teacher.imageUrl ? (
                    <Image
                      src={course.teacher.imageUrl}
                      alt={course.teacher.username}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                      <span className="font-medium text-sm">
                        {course.teacher.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{course.teacher.username}</p>
                    <p className="text-muted-foreground text-sm">
                      {course.teacher.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Enrollment Progress (if enrolled) */}
              {isEnrolled && (
                <div className="rounded-lg border p-3">
                  <p className="mb-2 text-muted-foreground text-sm">
                    Your Progress
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>{courseDetail.progressPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-green-600"
                        style={{
                          width: `${courseDetail.progressPercentage}%`,
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-muted-foreground text-xs">
                      <span>
                        Lessons: {courseDetail.completedLessons}/
                        {courseDetail.lessons.length}
                      </span>
                      <span>
                        Exercises: {courseDetail.completedExercises}/
                        {courseDetail.exercises.length}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                {isEnrolled ? (
                  <>
                    <Button className="w-full" size="lg">
                      Continue Learning
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleUnenroll}
                      disabled={unenrollMutation.isPending}
                    >
                      {unenrollMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Unenrolling...
                        </>
                      ) : (
                        "Unenroll"
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleEnroll}
                    disabled={enrollMutation.isPending}
                  >
                    {enrollMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enrolling...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        {course.price === 0 ? "Enroll for Free" : "Enroll Now"}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Course Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {(isEnrolled || isPublic) && (
            <TabsTrigger value="lessons">
              Lessons (
              {isEnrolled
                ? courseDetail.lessons.length
                : isPublic
                  ? courseDetail.totalLessons
                  : 0}
              )
            </TabsTrigger>
          )}
          {(isEnrolled || isPublic) && (
            <TabsTrigger value="exercises">
              Exercises (
              {isEnrolled
                ? courseDetail.exercises.length
                : isPublic
                  ? courseDetail.totalExercises
                  : 0}
              )
            </TabsTrigger>
          )}
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About This Course</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {course.fullDescription || course.shortDescription}
              </p>
            </CardContent>
          </Card>

          {/* Course Tags */}
          {course.courseTags && course.courseTags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {course.courseTags.map((tag) => (
                    <Badge key={tag.courseTagId} variant="secondary">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Lessons Tab */}
        {(isEnrolled || isPublic) && (
          <TabsContent value="lessons" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Course Lessons</CardTitle>
                <CardDescription>
                  {isEnrolled
                    ? "Click on any lesson to start learning"
                    : "Preview of course lessons"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isEnrolled && courseDetail.lessons.length > 0 ? (
                  <div className="space-y-4">
                    {courseDetail.lessons.map(
                      (lesson: LessonResponseDto, index: number) => (
                        <LessonCard
                          key={lesson.lessonId}
                          lesson={lesson}
                          index={index + 1}
                          isAccessible={true}
                        />
                      ),
                    )}
                  </div>
                ) : isPublic ? (
                  <div className="py-8 text-center">
                    <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="mb-4 text-muted-foreground">
                      This course contains {courseDetail.totalLessons} lessons
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Enroll to access all lessons
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No lessons available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Exercises Tab */}
        {(isEnrolled || isPublic) && (
          <TabsContent value="exercises" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Course Exercises</CardTitle>
                <CardDescription>
                  {isEnrolled
                    ? "Practice what you've learned"
                    : "Preview of course exercises"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isEnrolled && courseDetail.exercises.length > 0 ? (
                  <div className="space-y-4">
                    {courseDetail.exercises.map(
                      (exercise: ExerciseResponseDto, index: number) => (
                        <ExerciseCard
                          key={exercise.exerciseId}
                          exercise={exercise}
                          index={index + 1}
                          isAccessible={true}
                        />
                      ),
                    )}
                  </div>
                ) : isPublic ? (
                  <div className="py-8 text-center">
                    <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="mb-4 text-muted-foreground">
                      This course contains {courseDetail.totalExercises}{" "}
                      exercises
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Enroll to access all exercises
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No exercises available
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Resources */}
            {isEnrolled &&
              courseDetail.resources &&
              courseDetail.resources.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Course Resources</CardTitle>
                    <CardDescription>
                      Additional materials to support your learning
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {courseDetail.resources.map(
                        (resource: ResourceResponseDto, index: number) => (
                          <ResourceCard
                            key={resource.resourceId}
                            resource={resource}
                            index={index + 1}
                          />
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
          </TabsContent>
        )}

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-4">
          <CourseRatingSection
            courseId={courseId}
            isEnrolled={isEnrolled}
            currentUserRating={isEnrolled ? courseDetail.userRating : undefined}
            averageRating={course.averageRating}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper Components
interface LessonCardProps {
  lesson: LessonResponseDto;
  index: number;
  isAccessible: boolean;
}

function LessonCard({ lesson, index, isAccessible }: LessonCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg border p-4 hover:bg-muted/50">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground text-sm">
        {index}
      </div>
      <div className="flex-1">
        <h4 className="font-medium">{lesson.title}</h4>
        {lesson.content && (
          <p className="line-clamp-2 text-muted-foreground text-sm">
            {lesson.content}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        {lesson.durationMinutes && (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{lesson.durationMinutes} min</span>
          </div>
        )}
        {lesson.videoUrl && (
          <div className="flex items-center gap-1">
            <Play className="h-4 w-4" />
            <span>Video</span>
          </div>
        )}
      </div>
      {isAccessible && (
        <Button size="sm" variant="ghost">
          Start
        </Button>
      )}
    </div>
  );
}

interface ExerciseCardProps {
  exercise: ExerciseResponseDto;
  index: number;
  isAccessible: boolean;
}

function ExerciseCard({ exercise, index, isAccessible }: ExerciseCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg border p-4 hover:bg-muted/50">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 font-medium text-sm text-white">
        {index}
      </div>
      <div className="flex-1">
        <h4 className="font-medium">{exercise.title}</h4>
        {exercise.description && (
          <p className="line-clamp-2 text-muted-foreground text-sm">
            {exercise.description}
          </p>
        )}
      </div>
      {isAccessible && (
        <Button size="sm" variant="ghost">
          Open
        </Button>
      )}
    </div>
  );
}

interface ResourceCardProps {
  resource: ResourceResponseDto;
  index: number;
}

function ResourceCard({ resource, index }: ResourceCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg border p-4 hover:bg-muted/50">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 font-medium text-sm text-white">
        {index}
      </div>
      <div className="flex-1">
        <h4 className="font-medium">{resource.title}</h4>
        {resource.description && (
          <p className="line-clamp-2 text-muted-foreground text-sm">
            {resource.description}
          </p>
        )}
        <p className="text-muted-foreground text-xs">
          Type: {resource.resourceType}
        </p>
      </div>
      {resource.resourceUrl && (
        <Button size="sm" variant="ghost" asChild>
          <a
            href={resource.resourceUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open
          </a>
        </Button>
      )}
    </div>
  );
}
