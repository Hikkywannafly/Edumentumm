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
import type { Course } from "@/types/course.type";
import { StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface CourseCardProps {
  course: Course;
}

const DEFAULT_THUMBNAIL_URL =
  "https://sr12121.newzenler.com/images/default-course-thumbnail.png";

export function CourseCard({ course }: CourseCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const {
    id,
    courseId,
    title,
    shortDescription,
    courseLevel,
    averageRating = 0,
    price = 0,
    totalEnrollments = 0,
    thumbnailUrl = DEFAULT_THUMBNAIL_URL,
  } = course;

  // Use courseId if id is not available
  const courseIdentifier = id || courseId;

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
        {imageLoading && (
          <div className="absolute inset-0 flex animate-pulse items-center justify-center bg-gray-200">
            <div className="text-gray-500">Loading...</div>
          </div>
        )}

        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <div className="text-center text-gray-500">
              <div className="mb-2 text-2xl">📚</div>
              <div className="text-sm">No Image</div>
            </div>
          </div>
        ) : (
          <Image
            src={thumbnailUrl || DEFAULT_THUMBNAIL_URL}
            alt={title}
            fill
            className={`object-cover transition-transform duration-300 hover:scale-105 ${
              imageLoading ? "opacity-0" : "opacity-100"
            }`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
        )}
      </div>

      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="outline">{courseLevel}</Badge>
          <div className="flex items-center gap-1">
            <StarIcon className="h-4 w-4 text-yellow-400" />
            <span className="text-sm">
              {averageRating ? averageRating.toFixed(1) : "0.0"}
            </span>
          </div>
        </div>
        <CardTitle className="line-clamp-2">{title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {shortDescription}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow">
        <div className="text-muted-foreground text-sm">
          {totalEnrollments} students enrolled
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <div className="font-semibold text-lg">
          {price === 0 ? "Free" : `$${price.toFixed(2)}`}
        </div>
        <Button asChild>
          <Link href={`/courses/${courseIdentifier}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
