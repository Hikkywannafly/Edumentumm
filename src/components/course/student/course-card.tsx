import { LocalizedLink } from "@/components/localized-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import type { Course } from "@/types/course.type";
import { Clock, Star, Users } from "lucide-react";

interface CourseCardProps {
  course: Course;
}

const DEFAULT_THUMBNAIL_URL =
  "https://sr12121.newzenler.com/images/default-course-thumbnail.png";

export function CourseCard({ course }: CourseCardProps) {
  const getLevelText = (level: string) => {
    switch (level) {
      case "BEGINNER":
        return "Beginner";
      case "INTERMEDIATE":
        return "Intermediate";
      case "ADVANCED":
        return "Advanced";
      default:
        return level;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "BEGINNER":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "INTERMEDIATE":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "ADVANCED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
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
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: "50%" }}
          >
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>,
      );
    }

    const remainingStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  // Get tags from either courseTagNames or courseTags
  const getTags = () => {
    if (course.courseTagNames && course.courseTagNames.length > 0) {
      return course.courseTagNames;
    }
    if (course.courseTags && course.courseTags.length > 0) {
      return course.courseTags.map((tag) => tag.name);
    }
    return [];
  };

  const tags = getTags();

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={course.thumbnailUrl || DEFAULT_THUMBNAIL_URL}
          alt={course.title}
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_THUMBNAIL_URL;
          }}
        />
        <div className="absolute top-3 left-3">
          <Badge className={getLevelColor(course.courseLevel)}>
            {getLevelText(course.courseLevel)}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <CardHeader className="flex-1">
        <div className="mb-2 flex flex-wrap gap-1">
          {tags.slice(0, 2).map((tag, index) => (
            <Badge
              key={`${tag}-${index}`}
              variant="secondary"
              className="text-xs"
            >
              {tag}
            </Badge>
          ))}
          {tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{tags.length - 2}
            </Badge>
          )}
        </div>

        <h3 className="line-clamp-2 font-semibold text-lg">{course.title}</h3>

        <p className="line-clamp-2 text-muted-foreground text-sm">
          {course.shortDescription}
        </p>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Rating */}
        {course.averageRating > 0 && (
          <div className="mb-3 flex items-center gap-2">
            <div className="flex items-center gap-1">
              {renderStars(course.averageRating)}
            </div>
            <span className="font-medium text-sm">
              {course.averageRating.toFixed(1)}
            </span>
            <span className="text-muted-foreground text-sm">
              ({course.totalEnrollments} enrolled)
            </span>
          </div>
        )}

        {/* Course Stats */}
        <div className="mb-3 flex items-center gap-4 text-muted-foreground text-sm">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{course.totalEnrollments}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{(course.totalLessons || 10) * 15} min</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-primary text-xl">
            {formatPrice(course.price)}
          </span>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <LocalizedLink href={`/course/${course.id}`} className="w-full">
          <Button className="w-full">View Details</Button>
        </LocalizedLink>
      </CardFooter>
    </Card>
  );
}
