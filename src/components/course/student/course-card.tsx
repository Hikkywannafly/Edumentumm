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

export function CourseCard({ course }: CourseCardProps) {
  const getLevelText = (level: string) => {
    switch (level) {
      case "basic":
        return "Cơ bản";
      case "intermediate":
        return "Trung bình";
      case "advanced":
        return "Nâng cao";
      default:
        return level;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "basic":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />,
      );
    }

    const remainingStars = 5 - fullStars;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={course.thumbnail || "/placeholder.svg"}
          alt={course.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute top-3 left-3">
          <Badge className={getLevelColor(course.level)}>
            {getLevelText(course.level)}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <CardHeader className="flex-1">
        <div className="mb-2 flex flex-wrap gap-1">
          {course.topics.slice(0, 2).map((topic) => (
            <Badge key={topic} variant="secondary" className="text-xs">
              {topic}
            </Badge>
          ))}
        </div>

        <h3 className="line-clamp-2 font-semibold text-lg">{course.title}</h3>

        <p className="line-clamp-2 text-muted-foreground text-sm">
          {course.shortDescription}
        </p>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="mb-3 flex items-center gap-4">
          {course.rating > 0 && (
            <>
              <div className="flex items-center gap-1">
                {renderStars(course.rating)}
              </div>
              <span className="font-medium text-sm">{course.rating}</span>
              <span className="text-muted-foreground text-sm">
                ({course.reviewCount})
              </span>
            </>
          )}
        </div>

        <div className="mb-3 flex items-center gap-4 text-muted-foreground text-sm">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{course.reviewCount * 3}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{(course.lessonsCount || 10) * 15} phút</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-primary text-xl">
            {formatPrice(course.price)}
          </span>
          {course.originalPrice && (
            <span className="text-muted-foreground text-sm line-through">
              {formatPrice(course.originalPrice)}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <LocalizedLink href={`course/${course.id}`} className="w-full">
          <Button className="w-full">Xem chi tiết</Button>
        </LocalizedLink>
      </CardFooter>
    </Card>
  );
}
