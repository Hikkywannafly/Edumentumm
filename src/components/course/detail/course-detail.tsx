"use client";

import { LocalizedLink } from "@/components/localized-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCourseDetail } from "@/hooks/course/use-course-detail";
import { ArrowLeft, Users } from "lucide-react";
import { useParams } from "next/navigation";

export function CourseDetail() {
  const params = useParams();
  const id = params.id ? Number(params.id) : undefined;

  const { data: course, isLoading, error } = useCourseDetail(id as number);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="mb-4 h-4 w-1/4 rounded bg-gray-200" />
          <div className="mb-4 h-64 w-full rounded bg-gray-200" />
          <div className="mb-4 h-4 w-3/4 rounded bg-gray-200" />
          <div className="mb-4 h-4 w-1/2 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-6">
          <h2 className="mb-4 font-bold text-2xl">Error</h2>
          <p className="text-red-500">{error?.message || "Course not found"}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <LocalizedLink
          href="/courses"
          className="text-blue-500 text-sm hover:text-blue-700"
        >
          <ArrowLeft className="mr-1 inline-block h-4 w-4" />
          Back to Courses
        </LocalizedLink>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="p-6">
            <div className="relative mb-4 aspect-video">
              <img
                alt={course.course.title}
                className="h-full w-full rounded-lg object-cover"
                src={course.course.thumbnailUrl || "/placeholder.svg"}
              />
            </div>

            <h1 className="mb-4 font-bold text-3xl">{course.course.title}</h1>
            <p className="mb-4 text-lg text-muted-foreground">
              {course.course.shortDescription}
            </p>

            <div className="mb-6 flex items-center gap-4">
              <Badge variant="secondary">
                {course.course.courseLevel.toLowerCase()}
              </Badge>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="text-muted-foreground">
                  {course.totalEnrollments} students enrolled
                </span>
              </div>
            </div>

            <div className="mb-6 flex items-center space-x-4">
              <div className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                  {course.course.teacher.name.charAt(0)}
                </div>
                <div className="ml-3">
                  <p className="text-muted-foreground text-sm">Instructor</p>
                  <p className="font-medium">{course.course.teacher.name}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <section>
                <h2 className="mb-3 font-semibold text-xl">Description</h2>
                <p className="whitespace-pre-line text-muted-foreground">
                  {course.course.fullDescription ||
                    course.course.shortDescription}
                </p>
              </section>

              <section>
                <h2 className="mb-3 font-semibold text-xl">Course Content</h2>
                <div className="space-y-2">
                  {Array.from({ length: course.totalLessons || 10 }, (_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center space-x-4">
                        <span className="text-muted-foreground">
                          Lesson {i + 1}
                        </span>
                        <span>Coming soon</span>
                      </div>
                      <span className="text-muted-foreground">--:--</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card className="sticky top-4 p-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-baseline space-x-2">
                  <span className="font-bold text-3xl">
                    (course.course.price)
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Button className="w-full" size="lg">
                  Enroll Now
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  Add to Wishlist
                </Button>
              </div>

              <div className="border-t pt-4">
                <h3 className="mb-2 font-semibold">This course includes:</h3>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>• {course.totalLessons || 10} lessons</li>
                  <li>• Full lifetime access</li>
                  <li>• Access on mobile and desktop</li>
                  <li>• Certificate of completion</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
