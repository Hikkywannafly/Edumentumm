"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import { useCreateCourse } from "@/hooks/course/use-teacher-courses";
import { toast } from "@/hooks/use-toast";
import { getLocaleFromPathname } from "@/lib/utils";
import {
  type CourseCreateRequest,
  CourseLevel,
  CourseStatus,
} from "@/types/course.type";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowLeft, Loader2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must not exceed 200 characters"),
  shortDescription: z
    .string()
    .min(1, "Short description is required")
    .max(500, "Short description must not exceed 500 characters"),
  fullDescription: z.string().optional(),
  courseLevel: z.nativeEnum(CourseLevel, {
    message: "Course level is required",
  }),
  thumbnailUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  price: z.number().min(0, "Price must be non-negative").optional(),
  courseStatus: z.nativeEnum(CourseStatus, {
    message: "Course status is required",
  }),
});

type FormData = z.infer<typeof formSchema>;

export function CreateNewCourse() {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const { user, hasRole, isLoading: authLoading } = useAuth();
  const createCourseMutation = useCreateCourse();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      shortDescription: "",
      fullDescription: "",
      courseLevel: CourseLevel.BEGINNER,
      thumbnailUrl: "",
      price: 0,
      courseStatus: CourseStatus.DRAFT,
    },
  });

  // Check authentication and permissions
  useEffect(() => {
    if (!authLoading && (!user || !hasRole)) {
      toast({
        title: "Access Denied",
        description: "You need to be a teacher to create courses.",
        variant: "destructive",
      });
    }
  }, [authLoading, user, hasRole]);

  // Show loading while checking authentication
  if (authLoading || !user || !hasRole) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const courseData: CourseCreateRequest = {
        ...data,
        courseTagNames: tags,
        thumbnailUrl: data.thumbnailUrl || undefined,
        fullDescription: data.fullDescription || undefined,
      };

      await createCourseMutation.mutateAsync(courseData);

      toast({
        title: "Success",
        description: "Course created successfully!",
      });

      router.push(`/${locale}/course`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to create course",
        variant: "destructive",
      });
    }
  };

  const isLoading = createCourseMutation.isPending;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      {/* Back button */}
      <div className="mb-6">
        <Link href={`/${locale}/course`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Button>
        </Link>
      </div>

      {/* Error Alert */}
      {createCourseMutation.isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {createCourseMutation.error?.message ||
              "An error occurred while creating the course."}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Create New Course</CardTitle>
          <CardDescription>
            Fill in the details below to create a new course. All fields marked
            with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter an engaging course title"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Short Description */}
              <FormField
                control={form.control}
                name="shortDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write a brief, compelling description of what students will learn"
                        className="min-h-[80px]"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Full Description */}
              <FormField
                control={form.control}
                name="fullDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide a comprehensive overview of the course content, learning objectives, and what makes it unique"
                        className="min-h-[120px]"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Course Level and Status */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="courseLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Level *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={CourseLevel.BEGINNER}>
                            BEGINNER
                          </SelectItem>
                          <SelectItem value={CourseLevel.INTERMEDIATE}>
                            INTERMEDIATE
                          </SelectItem>
                          <SelectItem value={CourseLevel.ADVANCED}>
                            ADVANCED
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="courseStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Publication Status *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={CourseStatus.DRAFT}>
                            DRAFT
                          </SelectItem>
                          <SelectItem value={CourseStatus.PUBLISHED}>
                            PUBLISHED
                          </SelectItem>
                          <SelectItem value={CourseStatus.ARCHIVED}>
                            ARCHIVED
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Price and Thumbnail */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (USD)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          disabled={isLoading}
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              Number.parseFloat(e.target.value) || 0,
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="thumbnailUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Thumbnail URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/course-thumbnail.jpg"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Tags */}
              <div className="space-y-3">
                <FormLabel>Course Tags</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add relevant tags (e.g., JavaScript, Web Development, React)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    variant="outline"
                    disabled={isLoading || !tagInput.trim()}
                  >
                    Add Tag
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-destructive"
                          onClick={() => !isLoading && removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-6">
                <Link href={`/${locale}/course`}>
                  <Button type="button" variant="outline" disabled={isLoading}>
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="min-w-[120px] bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Course"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
