"use client";

import { LocalizedLink } from "@/components/localized-link";
import { getLocaleFromPathname } from "@/lib/utils";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Loader2,
  Plus,
  Save,
  X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  useTeacherCourseDetail,
  useUpdateCourse,
} from "../../../hooks/course/use-teacher-courses";
import { useToast } from "../../../hooks/use-toast";
import {
  CourseLevel,
  CourseStatus,
  type CourseUpdateRequest,
} from "../../../types/course.type";
import { Alert, AlertDescription } from "../../ui/alert";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Textarea } from "../../ui/textarea";

interface TeacherCourseEditProps {
  courseId: number;
}

export function TeacherCourseEdit({ courseId }: TeacherCourseEditProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const { toast } = useToast();

  const {
    data: courseDetail,
    isLoading,
    error,
  } = useTeacherCourseDetail(courseId);

  const updateCourseMutation = useUpdateCourse();

  // Form state
  const [formData, setFormData] = useState<CourseUpdateRequest>({});
  const [newTag, setNewTag] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Initialize form data when course detail is loaded
  useEffect(() => {
    if (courseDetail?.course) {
      const course = courseDetail.course;
      // Initialize tags
      const initialTags =
        (course.courseTags && Array.isArray(course.courseTags)
          ? course.courseTags.map((tag: { name: string }) => tag.name)
          : course.courseTagNames) || [];
      setTags(initialTags);

      setFormData({
        title: course.title,
        shortDescription: course.shortDescription,
        fullDescription: course.fullDescription || "",
        courseLevel: course.courseLevel,
        thumbnailUrl: course.thumbnailUrl || "",
        price: course.price,
        courseStatus: course.courseStatus,
      });
    }
  }, [courseDetail]);

  useEffect(() => {
    if (tags.length > 0) {
      setFormData((prev) => ({
        ...prev,
        tagCourseNames: tags,
      }));
    }
  }, [tags]);

  const handleInputChange = (field: keyof CourseUpdateRequest, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags((prev) => [...prev, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title?.trim()) {
      toast({
        title: "Validation Error",
        description: "Course title is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.shortDescription?.trim()) {
      toast({
        title: "Validation Error",
        description: "Short description is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const updateData: CourseUpdateRequest = {
        ...formData,
        tagCourseNames: tags.length > 0 ? tags : undefined,
      };

      await updateCourseMutation.mutateAsync({
        courseId,
        courseData: updateData,
      });

      toast({
        title: "Success",
        description: "Course updated successfully",
      });

      // Navigate back to course view
      router.push(`/${locale}/course/teacher/${courseId}/view`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update course",
        variant: "destructive",
      });
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
            Failed to load course details: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // No data state
  if (!courseDetail) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Course not found or you don't have permission to edit it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const course = courseDetail.course;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
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
            <h1 className="font-bold text-2xl text-gray-900">Edit Course</h1>
            <p className="text-muted-foreground">
              Update your course information and content
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    value={formData.title || ""}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter course title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Description *</Label>
                  <Textarea
                    id="shortDescription"
                    value={formData.shortDescription || ""}
                    onChange={(e) =>
                      handleInputChange("shortDescription", e.target.value)
                    }
                    placeholder="Brief description of your course"
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullDescription">Full Description</Label>
                  <Textarea
                    id="fullDescription"
                    value={formData.fullDescription || ""}
                    onChange={(e) =>
                      handleInputChange("fullDescription", e.target.value)
                    }
                    placeholder="Detailed description of your course content"
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                  <Input
                    id="thumbnailUrl"
                    type="url"
                    value={formData.thumbnailUrl || ""}
                    onChange={(e) =>
                      handleInputChange("thumbnailUrl", e.target.value)
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Course Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Course Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a tag"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Course Content Preview */}
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
                    <p className="mb-4 text-muted-foreground text-sm">
                      {courseDetail.lessons.length} lessons in this course
                    </p>
                    {courseDetail.lessons.slice(0, 3).map(
                      (
                        lesson: {
                          lessonId: number | null | undefined;
                          title: string | null | undefined;
                        },
                        index: number,
                      ) => (
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
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                    {courseDetail.lessons.length > 3 && (
                      <p className="text-center text-muted-foreground text-sm">
                        and {courseDetail.lessons.length - 3} more lessons...
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No lessons added yet
                    </p>
                    <LocalizedLink
                      href={`/course/teacher/${course.courseId}/edit/lesson`}
                    >
                      <Button variant="outline" size="sm" className="mt-2">
                        Add Lessons
                      </Button>
                    </LocalizedLink>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Course Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="courseLevel">Course Level</Label>
                  <Select
                    value={
                      formData.courseLevel ||
                      courseDetail?.course.courseLevel ||
                      ""
                    }
                    onValueChange={(value) =>
                      handleInputChange("courseLevel", value as CourseLevel)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CourseLevel.BEGINNER}>
                        Beginner
                      </SelectItem>
                      <SelectItem value={CourseLevel.INTERMEDIATE}>
                        Intermediate
                      </SelectItem>
                      <SelectItem value={CourseLevel.ADVANCED}>
                        Advanced
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "price",
                        Number.parseFloat(e.target.value) || 0,
                      )
                    }
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="courseStatus">Course Status</Label>
                  <Select
                    value={
                      formData.courseStatus ||
                      courseDetail?.course.courseStatus ||
                      ""
                    }
                    onValueChange={(value) =>
                      handleInputChange("courseStatus", value as CourseStatus)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CourseStatus.DRAFT}>Draft</SelectItem>
                      <SelectItem value={CourseStatus.PUBLISHED}>
                        Published
                      </SelectItem>
                      <SelectItem value={CourseStatus.ARCHIVED}>
                        Archived
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Preview Card */}
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 aspect-video w-full overflow-hidden rounded-lg bg-muted">
                  <img
                    src={
                      formData.thumbnailUrl ||
                      course.thumbnailUrl ||
                      "https://sr12121.newzenler.com/images/default-course-thumbnail.png"
                    }
                    alt={formData.title || course.title}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://sr12121.newzenler.com/images/default-course-thumbnail.png";
                    }}
                  />
                </div>
                <h3 className="mb-2 font-medium">
                  {formData.title || "Course Title"}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {formData.shortDescription ||
                    "Course description will appear here"}
                </p>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                disabled={updateCourseMutation.isPending}
                className="w-full"
              >
                {updateCourseMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>

              <LocalizedLink href={`/${locale}/course/teacher/${courseId}`}>
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </LocalizedLink>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
