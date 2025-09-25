"use client";

import { LocalizedLink } from "@/components/localized-link";
import { Button } from "@/components/ui";
import {
  useCreateExercise,
  useCreateLesson,
  useCreateResource,
  useDeleteExercise,
  useDeleteLesson,
  useDeleteResource,
  useGetCourseContent,
  useUpdateExercise,
  useUpdateLesson,
  useUpdateResource,
} from "@/hooks/course/use-manage-course-contents";
import {
  type ExerciseCreateRequestDto,
  type LessonCreateRequestDto,
  type ResourceCreateRequestDto,
  ResourceType,
} from "@/types/course.type";
import { ArrowLeft } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface CourseContentManagerProps {
  courseId: number;
}

type ContentType = "lessons" | "exercises" | "resources";
type EditingItem = {
  type: ContentType;
  id?: number;
  data?: any;
};

export const CourseContentManager: React.FC<CourseContentManagerProps> = ({
  courseId,
}) => {
  const [activeTab, setActiveTab] = useState<ContentType>("lessons");
  const [editing, setEditing] = useState<EditingItem | null>(null);

  // Get all course content
  const { lessons, exercises, resources, isLoading, error } =
    useGetCourseContent(courseId);

  // Lesson mutations
  const createLessonMutation = useCreateLesson();
  const updateLessonMutation = useUpdateLesson();
  const deleteLessonMutation = useDeleteLesson();

  // Exercise mutations
  const createExerciseMutation = useCreateExercise();
  const updateExerciseMutation = useUpdateExercise();
  const deleteExerciseMutation = useDeleteExercise();

  // Resource mutations
  const createResourceMutation = useCreateResource();
  const updateResourceMutation = useUpdateResource();
  const deleteResourceMutation = useDeleteResource();

  // Forms
  const lessonForm = useForm<LessonCreateRequestDto>();
  const exerciseForm = useForm<ExerciseCreateRequestDto>();
  const resourceForm = useForm<ResourceCreateRequestDto>();

  // Lesson handlers
  const handleCreateLesson = async (data: LessonCreateRequestDto) => {
    try {
      await createLessonMutation.mutateAsync({
        courseId,
        lessonData: data,
      });
      toast.success("Lesson created successfully!");
      lessonForm.reset();
      setEditing(null);
    } catch (_error) {
      toast.error("Failed to create lesson");
    }
  };

  const handleUpdateLesson = async (
    lessonId: number,
    data: LessonCreateRequestDto,
  ) => {
    try {
      await updateLessonMutation.mutateAsync({
        lessonId,
        courseId,
        lessonData: data,
      });
      toast.success("Lesson updated successfully!");
      lessonForm.reset();
      setEditing(null);
    } catch (_error) {
      toast.error("Failed to update lesson");
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;

    try {
      await deleteLessonMutation.mutateAsync({
        lessonId,
        courseId,
      });
      toast.success("Lesson deleted successfully!");
    } catch (_error) {
      toast.error("Failed to delete lesson");
    }
  };

  // Exercise handlers
  const handleCreateExercise = async (data: ExerciseCreateRequestDto) => {
    try {
      await createExerciseMutation.mutateAsync({
        courseId,
        exerciseData: data,
      });
      toast.success("Exercise created successfully!");
      exerciseForm.reset();
      setEditing(null);
    } catch (_error) {
      toast.error("Failed to create exercise");
    }
  };

  const handleUpdateExercise = async (
    exerciseId: number,
    data: ExerciseCreateRequestDto,
  ) => {
    try {
      await updateExerciseMutation.mutateAsync({
        exerciseId,
        courseId,
        exerciseData: data,
      });
      toast.success("Exercise updated successfully!");
      exerciseForm.reset();
      setEditing(null);
    } catch (_error) {
      toast.error("Failed to update exercise");
    }
  };

  const handleDeleteExercise = async (exerciseId: number) => {
    if (!confirm("Are you sure you want to delete this exercise?")) return;

    try {
      await deleteExerciseMutation.mutateAsync({
        exerciseId,
        courseId,
      });
      toast.success("Exercise deleted successfully!");
    } catch (_error) {
      toast.error("Failed to delete exercise");
    }
  };

  // Resource handlers
  const handleCreateResource = async (data: ResourceCreateRequestDto) => {
    try {
      await createResourceMutation.mutateAsync({
        courseId,
        resourceData: data,
      });
      toast.success("Resource created successfully!");
      resourceForm.reset();
      setEditing(null);
    } catch (_error) {
      toast.error("Failed to create resource");
    }
  };

  const handleUpdateResource = async (
    resourceId: number,
    data: ResourceCreateRequestDto,
  ) => {
    try {
      await updateResourceMutation.mutateAsync({
        resourceId,
        courseId,
        resourceData: data,
      });
      toast.success("Resource updated successfully!");
      resourceForm.reset();
      setEditing(null);
    } catch (_error) {
      toast.error("Failed to update resource");
    }
  };

  const handleDeleteResource = async (resourceId: number) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;

    try {
      await deleteResourceMutation.mutateAsync({
        resourceId,
        courseId,
      });
      toast.success("Resource deleted successfully!");
    } catch (_error) {
      toast.error("Failed to delete resource");
    }
  };

  // Edit handlers
  const startEdit = (type: ContentType, item?: any) => {
    setEditing({ type, id: item?.id, data: item });

    if (item) {
      if (type === "lessons") {
        lessonForm.reset(item);
      } else if (type === "exercises") {
        exerciseForm.reset(item);
      } else if (type === "resources") {
        resourceForm.reset(item);
      }
    } else {
      // Reset forms for new items
      lessonForm.reset();
      exerciseForm.reset();
      resourceForm.reset();
    }
  };

  const cancelEdit = () => {
    setEditing(null);
    lessonForm.reset();
    exerciseForm.reset();
    resourceForm.reset();
  };

  if (isLoading) return <div className="p-4">Loading course content...</div>;
  if (error)
    return (
      <div className="p-4 text-red-500">
        Error loading course content: {error.message}
      </div>
    );

  return (
    <div className="mx-auto max-w-7xl p-6">
      <Button
        variant="ghost"
        size="sm"
        className="mb-3 flex items-center gap-2"
      >
        <LocalizedLink
          href={`/course/teacher/${courseId}/edit`}
          className="flex flex-row"
        >
          <ArrowLeft className="h-4 w-4" />
          <p className="mx-2">Back to Course detail</p>
        </LocalizedLink>
      </Button>
      {/* Tab Navigation */}
      <div className="mb-6 flex space-x-4 border-b">
        {(["lessons", "exercises", "resources"] as ContentType[]).map((tab) => (
          <button
            type="button"
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize ${
              activeTab === tab
                ? "border-blue-600 border-b-2 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Add New Button */}
      <div className="mb-6">
        <Button
          onClick={() => startEdit(activeTab)}
          className="rounded-lg border px-4 py-2 text-white hover:bg-white hover:text-slate-900"
        >
          Add New {activeTab.slice(0, -1)}
        </Button>
      </div>

      {/* Lessons Tab */}
      {activeTab === "lessons" && (
        <div>
          <h2 className="mb-4 font-bold text-2xl">
            Lessons ({lessons.length})
          </h2>

          {/* Lesson Form */}
          {editing?.type === "lessons" && (
            <div className="mb-6 rounded-lg bg-gray-50 p-6">
              <h3 className="mb-4 font-semibold text-lg">
                {editing.id ? "Edit Lesson" : "Create New Lesson"}
              </h3>
              <form
                onSubmit={lessonForm.handleSubmit((data) =>
                  editing.id
                    ? handleUpdateLesson(editing.id, data)
                    : handleCreateLesson(data),
                )}
                className="space-y-4"
              >
                <div>
                  <label
                    className="mb-1 block font-medium text-sm"
                    htmlFor="lesson-title"
                  >
                    Title *
                  </label>
                  <input
                    {...lessonForm.register("title", {
                      required: "Title is required",
                    })}
                    className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
                    id="lesson-title"
                    placeholder="Enter lesson title"
                  />
                  {lessonForm.formState.errors.title && (
                    <p className="mt-1 text-red-500 text-sm">
                      {lessonForm.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className="mb-1 block font-medium text-sm"
                    htmlFor="lesson-content"
                  >
                    Content
                  </label>
                  <textarea
                    {...lessonForm.register("content")}
                    rows={4}
                    id="lesson-content"
                    className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter lesson content"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label
                      className="mb-1 block font-medium text-sm"
                      htmlFor="lesson-order"
                    >
                      Order Index
                    </label>
                    <input
                      {...lessonForm.register("orderIndex", {
                        valueAsNumber: true,
                        min: {
                          value: 0,
                          message: "Order must be non-negative",
                        },
                      })}
                      type="number"
                      min="0"
                      id="lesson-order"
                      className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label
                      className="mb-1 block font-medium text-sm"
                      htmlFor="lesson-duration"
                    >
                      Duration (minutes)
                    </label>
                    <input
                      {...lessonForm.register("durationMinutes", {
                        valueAsNumber: true,
                        min: {
                          value: 0,
                          message: "Duration must be non-negative",
                        },
                      })}
                      type="number"
                      min="0"
                      id="lesson-duration"
                      className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
                      placeholder="30"
                    />
                  </div>

                  <div>
                    <label
                      className="mb-1 block font-medium text-sm"
                      htmlFor="video-url"
                    >
                      Video URL
                    </label>
                    <input
                      {...lessonForm.register("videoUrl")}
                      type="url"
                      id="video-url"
                      className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={
                      createLessonMutation.isPending ||
                      updateLessonMutation.isPending
                    }
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {createLessonMutation.isPending ||
                    updateLessonMutation.isPending
                      ? "Saving..."
                      : editing.id
                        ? "Update Lesson"
                        : "Create Lesson"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-lg bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Lessons List */}
          <div className="space-y-4">
            {lessons.map((lesson) => (
              <div
                key={lesson.lessonId}
                className="rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{lesson.title}</h4>
                    {lesson.content && (
                      <p className="mt-2 line-clamp-2 text-gray-600">
                        {lesson.content}
                      </p>
                    )}
                    <div className="mt-3 flex items-center space-x-4 text-gray-500 text-sm">
                      <span>Order: {lesson.orderIndex}</span>
                      {lesson.durationMinutes && (
                        <span>Duration: {lesson.durationMinutes} min</span>
                      )}
                      {lesson.videoUrl && (
                        <span className="text-blue-600">Has Video</span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex space-x-2">
                    <button
                      type="button"
                      onClick={() => startEdit("lessons", lesson)}
                      className="px-3 py-1 text-blue-600 text-sm hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteLesson(lesson.lessonId)}
                      disabled={deleteLessonMutation.isPending}
                      className="px-3 py-1 text-red-600 text-sm hover:text-red-800 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {lessons.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                No lessons yet. Click "Add New Lesson" to get started.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Exercises Tab */}
      {activeTab === "exercises" && (
        <div>
          <h2 className="mb-4 font-bold text-2xl">
            Exercises ({exercises.length})
          </h2>

          {/* Exercise Form */}
          {editing?.type === "exercises" && (
            <div className="mb-6 rounded-lg bg-gray-50 p-6">
              <h3 className="mb-4 font-semibold text-lg">
                {editing.id ? "Edit Exercise" : "Create New Exercise"}
              </h3>
              <form
                onSubmit={exerciseForm.handleSubmit((data) =>
                  editing.id
                    ? handleUpdateExercise(editing.id, data)
                    : handleCreateExercise(data),
                )}
                className="space-y-4"
              >
                <div>
                  <label
                    className="mb-1 block font-medium text-sm"
                    htmlFor="exercise-title"
                  >
                    Title *
                  </label>
                  <input
                    {...exerciseForm.register("title", {
                      required: "Title is required",
                    })}
                    id="exercise-title"
                    className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter exercise title"
                  />
                  {exerciseForm.formState.errors.title && (
                    <p className="mt-1 text-red-500 text-sm">
                      {exerciseForm.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className="mb-1 block font-medium text-sm"
                    htmlFor="exercise-desc"
                  >
                    Description *
                  </label>
                  <textarea
                    {...exerciseForm.register("description", {
                      required: "Description is required",
                    })}
                    rows={3}
                    id="exercise-desc"
                    className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter exercise description"
                  />
                  {exerciseForm.formState.errors.description && (
                    <p className="mt-1 text-red-500 text-sm">
                      {exerciseForm.formState.errors.description.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className="mb-1 block font-medium text-sm"
                    htmlFor="exercise-instruct"
                  >
                    Instructions
                  </label>
                  <textarea
                    {...exerciseForm.register("instructions")}
                    rows={3}
                    id="exercise-instruct"
                    className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter detailed instructions"
                  />
                </div>

                <div>
                  <label
                    className="mb-1 block font-medium text-sm"
                    htmlFor="exercise-order"
                  >
                    Order Index
                  </label>
                  <input
                    {...exerciseForm.register("orderIndex", {
                      valueAsNumber: true,
                      min: { value: 0, message: "Order must be non-negative" },
                    })}
                    type="number"
                    min="0"
                    id="exercise-order"
                    className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 md:w-1/3"
                    placeholder="0"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={
                      createExerciseMutation.isPending ||
                      updateExerciseMutation.isPending
                    }
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {createExerciseMutation.isPending ||
                    updateExerciseMutation.isPending
                      ? "Saving..."
                      : editing.id
                        ? "Update Exercise"
                        : "Create Exercise"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-lg bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Exercises List */}
          <div className="space-y-4">
            {exercises.map((exercise) => (
              <div
                key={exercise.exerciseId}
                className="rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{exercise.title}</h4>
                    <p className="mt-2 line-clamp-2 text-gray-600">
                      {exercise.description}
                    </p>
                    {exercise.instructions && (
                      <p className="mt-2 line-clamp-1 text-gray-500 text-sm">
                        Instructions: {exercise.instructions}
                      </p>
                    )}
                    <div className="mt-3 flex items-center space-x-4 text-gray-500 text-sm">
                      <span>Order: {exercise.orderIndex}</span>
                      <span>
                        Created:{" "}
                        {new Date(exercise.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4 flex space-x-2">
                    <button
                      type="button"
                      onClick={() => startEdit("exercises", exercise)}
                      className="px-3 py-1 text-blue-600 text-sm hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteExercise(exercise.exerciseId)}
                      disabled={deleteExerciseMutation.isPending}
                      className="px-3 py-1 text-red-600 text-sm hover:text-red-800 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {exercises.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                No exercises yet. Click "Add New Exercise" to get started.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resources Tab */}
      {activeTab === "resources" && (
        <div>
          <h2 className="mb-4 font-bold text-2xl">
            Resources ({resources.length})
          </h2>

          {/* Resource Form */}
          {editing?.type === "resources" && (
            <div className="mb-6 rounded-lg bg-gray-50 p-6">
              <h3 className="mb-4 font-semibold text-lg">
                {editing.id ? "Edit Resource" : "Create New Resource"}
              </h3>
              <form
                onSubmit={resourceForm.handleSubmit((data) =>
                  editing.id
                    ? handleUpdateResource(editing.id, data)
                    : handleCreateResource(data),
                )}
                className="space-y-4"
              >
                <div>
                  <label
                    className="mb-1 block font-medium text-sm"
                    htmlFor="resource-title"
                  >
                    Title *
                  </label>
                  <input
                    {...resourceForm.register("title", {
                      required: "Title is required",
                    })}
                    id="resource-title"
                    className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter resource title"
                  />
                  {resourceForm.formState.errors.title && (
                    <p className="mt-1 text-red-500 text-sm">
                      {resourceForm.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className="mb-1 block font-medium text-sm"
                    htmlFor="resource-desc"
                  >
                    Description
                  </label>
                  <textarea
                    {...resourceForm.register("description")}
                    rows={3}
                    id="resource-desc"
                    className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter resource description"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label
                      className="mb-1 block font-medium text-sm"
                      htmlFor="resource-type"
                    >
                      Resource Type *
                    </label>
                    <select
                      id="resource-type"
                      {...resourceForm.register("resourceType", {
                        required: "Resource type is required",
                      })}
                      className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select type</option>
                      {Object.values(ResourceType).map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    {resourceForm.formState.errors.resourceType && (
                      <p className="mt-1 text-red-500 text-sm">
                        {resourceForm.formState.errors.resourceType.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="mb-1 block font-medium text-sm"
                      htmlFor="resource-order"
                    >
                      Order Index
                    </label>
                    <input
                      {...resourceForm.register("orderIndex", {
                        valueAsNumber: true,
                        min: {
                          value: 0,
                          message: "Order must be non-negative",
                        },
                      })}
                      type="number"
                      min="0"
                      id="resource-order"
                      className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="mb-1 block font-medium text-sm"
                    htmlFor="resource-url"
                  >
                    URL *
                  </label>
                  <input
                    {...resourceForm.register("url", {
                      required: "URL is required",
                      pattern: {
                        value: /^https?:\/\/.+/,
                        message: "Please enter a valid URL",
                      },
                    })}
                    type="url"
                    id="resource-url"
                    className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                  {resourceForm.formState.errors.url && (
                    <p className="mt-1 text-red-500 text-sm">
                      {resourceForm.formState.errors.url.message}
                    </p>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={
                      createResourceMutation.isPending ||
                      updateResourceMutation.isPending
                    }
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {createResourceMutation.isPending ||
                    updateResourceMutation.isPending
                      ? "Saving..."
                      : editing.id
                        ? "Update Resource"
                        : "Create Resource"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-lg bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Resources List */}
          <div className="space-y-4">
            {resources.map((resource) => (
              <div
                key={resource.resourceId}
                className="rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center space-x-2">
                      <h4 className="font-semibold text-lg">
                        {resource.title}
                      </h4>
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-blue-800 text-xs">
                        {resource.resourceType}
                      </span>
                    </div>
                    {resource.description && (
                      <p className="mb-2 line-clamp-2 text-gray-600">
                        {resource.description}
                      </p>
                    )}
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-blue-600 text-sm hover:text-blue-800"
                    >
                      {resource.url}
                    </a>
                    <div className="mt-3 flex items-center space-x-4 text-gray-500 text-sm">
                      <span>Order: {resource.orderIndex}</span>
                      <span>
                        Created:{" "}
                        {new Date(resource.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4 flex space-x-2">
                    <button
                      type="button"
                      onClick={() => startEdit("resources", resource)}
                      className="px-3 py-1 text-blue-600 text-sm hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteResource(resource.resourceId)}
                      disabled={deleteResourceMutation.isPending}
                      className="px-3 py-1 text-red-600 text-sm hover:text-red-800 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {resources.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                No resources yet. Click "Add New Resource" to get started.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
