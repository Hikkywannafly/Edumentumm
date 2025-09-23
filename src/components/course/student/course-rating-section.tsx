"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  useCourseRatings,
  useDeleteCourseRating,
  useRateCourse,
  useUpdateCourseRating,
} from "@/hooks/course/use-enroll-course";
import { toast } from "@/hooks/use-toast";
import type { RatingResponseDto } from "@/types/course.type";
import { Loader2, Star, Trash2 } from "lucide-react";
import { useState } from "react";

interface CourseRatingSectionProps {
  courseId: string | number;
  isEnrolled: boolean;
  currentUserRating?: RatingResponseDto | null;
  averageRating?: number | null;
}

export function CourseRatingSection({
  courseId,
  isEnrolled,
  currentUserRating,
  averageRating,
}: CourseRatingSectionProps) {
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [rating, setRating] = useState(currentUserRating?.rating || 0);
  const [comment, setComment] = useState(currentUserRating?.comment || "");
  const [hoveredRating, setHoveredRating] = useState(0);

  const { data: ratingsData, isLoading: ratingsLoading } = useCourseRatings(
    courseId,
    { page: 0, size: 10 },
  );

  const rateMutation = useRateCourse();
  const updateRatingMutation = useUpdateCourseRating();
  const deleteRatingMutation = useDeleteCourseRating();

  const handleSubmitRating = async () => {
    if (rating === 0) {
      toast({
        title: "Error",
        description: "Please select a rating",
        variant: "destructive",
      });
      return;
    }

    try {
      const ratingData = { rating, comment: comment.trim() || undefined };

      if (currentUserRating) {
        await updateRatingMutation.mutateAsync({ courseId, ratingData });
        toast({
          title: "Success",
          description: "Rating updated successfully!",
        });
      } else {
        await rateMutation.mutateAsync({ courseId, ratingData });
        toast({
          title: "Success",
          description: "Rating submitted successfully!",
        });
      }

      setIsRatingDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to submit rating",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRating = async () => {
    try {
      await deleteRatingMutation.mutateAsync(courseId);
      toast({
        title: "Success",
        description: "Rating deleted successfully!",
      });
      setRating(0);
      setComment("");
      setIsRatingDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete rating",
        variant: "destructive",
      });
    }
  };

  const openRatingDialog = () => {
    if (currentUserRating) {
      setRating(currentUserRating.rating);
      setComment(currentUserRating.comment || "");
    } else {
      setRating(0);
      setComment("");
    }
    setIsRatingDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Course Reviews</CardTitle>
              <CardDescription>
                See what other students think about this course
              </CardDescription>
            </div>
            {averageRating && (
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-2xl">
                    {averageRating.toFixed(1)}
                  </span>
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </div>
                <p className="text-muted-foreground text-sm">Average rating</p>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* User's Rating Section */}
      {isEnrolled && (
        <Card>
          <CardHeader>
            <CardTitle>Your Rating</CardTitle>
            <CardDescription>
              {currentUserRating
                ? "You have rated this course"
                : "Rate this course to help other students"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentUserRating ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= currentUserRating.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">
                    {currentUserRating.rating}/5
                  </span>
                </div>
                {currentUserRating.comment && (
                  <p className="text-muted-foreground text-sm">
                    "{currentUserRating.comment}"
                  </p>
                )}
                <div className="flex gap-2">
                  <Button size="sm" onClick={openRatingDialog}>
                    Edit Rating
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDeleteRating}
                    disabled={deleteRatingMutation.isPending}
                  >
                    {deleteRatingMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={openRatingDialog}>Rate This Course</Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* All Ratings */}
      <Card>
        <CardHeader>
          <CardTitle>All Reviews</CardTitle>
          <CardDescription>
            {ratingsData?.data?.length
              ? `${ratingsData.data.length} review(s)`
              : "No reviews yet"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {ratingsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : ratingsData?.data?.length ? (
            <div className="space-y-6">
              {ratingsData.data.map((ratingItem: RatingResponseDto) => (
                <div
                  key={ratingItem.ratingId}
                  className="border-b pb-4 last:border-b-0"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {ratingItem.studentName}
                      </span>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= ratingItem.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-muted-foreground text-sm">
                      {new Date(ratingItem.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {ratingItem.comment && (
                    <p className="text-muted-foreground text-sm">
                      {ratingItem.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Star className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                No reviews yet. Be the first to rate this course!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rating Dialog */}
      <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentUserRating ? "Update Your Rating" : "Rate This Course"}
            </DialogTitle>
            <DialogDescription>
              Share your experience to help other students
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Star Rating */}
            <div className="space-y-2">
              <label className="font-medium text-sm" htmlFor="rating-label">
                Rating *
              </label>
              <div className="flex items-center gap-1" id="rating-label">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="transition-colors hover:scale-110"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoveredRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300 hover:text-yellow-200"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 font-medium text-sm">
                  {rating > 0 ? `${rating}/5` : "Select rating"}
                </span>
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <label htmlFor="comment" className="font-medium text-sm">
                Comment (optional)
              </label>
              <Textarea
                id="comment"
                placeholder="Share your thoughts about this course..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRatingDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitRating}
              disabled={
                rating === 0 ||
                rateMutation.isPending ||
                updateRatingMutation.isPending
              }
            >
              {rateMutation.isPending || updateRatingMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {currentUserRating ? "Updating..." : "Submitting..."}
                </>
              ) : currentUserRating ? (
                "Update Rating"
              ) : (
                "Submit Rating"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
