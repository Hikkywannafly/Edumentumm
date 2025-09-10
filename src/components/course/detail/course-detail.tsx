"use client";

import { LocalizedLink } from "@/components/localized-link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { mockCourses } from "@/lib/mock-data/courses";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Play,
  Star,
  Users,
} from "lucide-react";
import { useParams } from "next/navigation";

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;

  const course = mockCourses.find((c) => c.id === courseId);

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-2xl">Course not found</h1>
          <LocalizedLink href="course">
            <Button>Back to course list</Button>
          </LocalizedLink>
        </div>
      </div>
    );
  }

  const getLevelText = (level: string) => {
    switch (level) {
      case "basic":
        return "Basic";
      case "intermediate":
        return "Intermediate";
      case "advanced":
        return "Advanced";
      default:
        return level;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "basic":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />,
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="h-4 w-4 text-gray-300" />
          <div className="absolute inset-0 w-1/2 overflow-hidden">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>,
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Back button */}
      <div className="mb-6">
        <LocalizedLink href="course">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to course list
          </Button>
        </LocalizedLink>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Course header */}
          <div className="mb-6">
            <div className="relative mb-4 aspect-video overflow-hidden rounded-lg">
              <img
                src={course.thumbnail || "/placeholder.svg"}
                alt={course.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Button size="lg" className="gap-2">
                  <Play className="h-5 w-5" />
                  Preview course
                </Button>
              </div>
            </div>

            <div className="mb-2 flex items-center gap-2">
              <Badge className={getLevelColor(course.level)}>
                {getLevelText(course.level)}
              </Badge>
              {course.tags.map((topic) => (
                <Badge key={topic} variant="secondary">
                  {topic}
                </Badge>
              ))}
            </div>

            <h1 className="mb-4 font-bold text-3xl">{course.title}</h1>

            <div className="mb-4 flex items-center gap-4">
              <div className="flex items-center gap-1">
                {renderStars(course.rating)}
              </div>
              <span className="font-medium">{course.rating}</span>
              <span className="text-muted-foreground">
                ({course.reviewCount} ratings)
              </span>
              <span className="text-muted-foreground">•</span>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{course.reviewCount * 3} Students</span>
              </div>
            </div>

            <div className="mb-6 flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {course.teacherName.split(" ").pop()?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-muted-foreground">
                Teacher:{" "}
                <span className="font-medium text-foreground">
                  {course.teacherName}
                </span>
              </span>
            </div>
          </div>

          {/* Course description */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {course.detailedDescription}
              </p>
            </CardContent>
          </Card>

          {/* Course curriculum */}
          <Card>
            <CardHeader>
              <CardTitle>Curriculum</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: course.lessonsCount || 10 }, (_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div className="flex-1">
                      <h4 className="font-medium">
                        Lesson {i + 1}: Topic {i + 1}
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        Duration: 15 minutes
                      </p>
                    </div>
                    <Play className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardContent className="p-6">
              {/* Price */}
              <div className="mb-6">
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-bold text-3xl text-primary">
                    {formatPrice(course.price)}
                  </span>
                  {course.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through">
                      {formatPrice(course.originalPrice)}
                    </span>
                  )}
                </div>
                {course.originalPrice && (
                  <div className="font-medium text-green-600 text-sm">
                    Tiết kiệm {formatPrice(course.originalPrice - course.price)}
                  </div>
                )}
              </div>

              {/* Enroll button */}
              <Button className="mb-4 w-full" size="lg">
                Đăng ký học ngay
              </Button>

              <Separator className="my-4" />

              {/* Course info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">{course.lessonsCount}</span>{" "}
                    bài học
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">
                      {(course.lessonsCount || 10) * 15}
                    </span>{" "}
                    phút
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">
                    Cập nhật: {course.updatedAt.toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">
                      {course.reviewCount * 3}
                    </span>{" "}
                    học viên
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
