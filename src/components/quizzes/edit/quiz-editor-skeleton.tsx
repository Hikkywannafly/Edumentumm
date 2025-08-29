import ThinLayout from "@/components/layout/thin-layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function QuizEditorSkeleton() {
  return (
    <ThinLayout>
      <div className="space-y-1">
        {/* Header Skeleton */}
        <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
          <div className="flex w-full items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-9 w-20" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-9 w-10" />
            </div>
          </div>
        </div>

        {/* Validation Status Skeleton */}
        <div className="px-4">
          <Skeleton className="h-4 w-48" />
        </div>

        {/* Quiz Title Editor Skeleton */}
        <Card className="border-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-8 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-gray-200">
              <div className="space-y-2 p-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Description Editor Skeleton */}
        <Card className="border-none">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-gray-200">
              <div className="space-y-2 p-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Tags Editor Skeleton */}
        <Card className="border-none">
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-14" />
              <Skeleton className="h-6 w-18" />
            </div>
          </CardContent>
        </Card>

        {/* Quiz Questions Editor Skeleton */}
        <Card className="border-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-28" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Question Skeleton 1 */}
              <QuestionSkeleton />

              {/* Question Skeleton 2 */}
              <QuestionSkeleton />

              {/* Question Skeleton 3 */}
              <QuestionSkeleton />
            </div>
          </CardContent>
        </Card>
      </div>
    </ThinLayout>
  );
}

function QuestionSkeleton() {
  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Question Text */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <div className="rounded-md border border-gray-200 p-3">
            <Skeleton className="h-6 w-4/5" />
          </div>
        </div>

        {/* Question Type */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-48" />
        </div>

        {/* Answers */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <div className="space-y-2">
            <AnswerSkeleton />
            <AnswerSkeleton />
            <AnswerSkeleton />
            <AnswerSkeleton />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>

        {/* Points and Difficulty */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-9 w-20" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>

        {/* Explanation */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <div className="rounded-md border border-gray-200 p-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-3/4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AnswerSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-md border border-gray-200 p-3">
      <Skeleton className="h-4 w-4 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-6 w-3/4" />
      </div>
      <Skeleton className="h-8 w-8" />
    </div>
  );
}
