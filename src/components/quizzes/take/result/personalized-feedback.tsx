"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BackendQuizEntity } from "@/types/quiz";
import type { QuizResult } from "@/types/quiz-take";
import { Crown, MessageSquare, Sparkles } from "lucide-react";

interface PersonalizedFeedbackProps {
  result: QuizResult;
  quiz: BackendQuizEntity;
}

export function PersonalizedFeedback({
  result,
  quiz,
}: PersonalizedFeedbackProps) {
  // Calculate pass/fail status
  const passed = result.percentage >= (quiz.passingScore || 70);

  return (
    <Card className="rounded-xl bg-card/50 backdrop-blur-sm">
      <CardHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <MessageSquare className="size-5 text-blue-500" />
            <Crown className="-right-1 -top-1 absolute size-3 text-amber-500" />
          </div>
          <CardTitle className="font-semibold text-lg">
            Personalized Feedback
          </CardTitle>
          <Badge
            variant="secondary"
            className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 font-medium text-amber-700 text-xs dark:bg-amber-900/20 dark:text-amber-300"
          >
            <Sparkles className="size-3" />
            <span>Pro</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <p className="text-muted-foreground">
          {passed
            ? "Great job! You've demonstrated a strong understanding of the material. Keep up the good work!"
            : "You're on the right track! Review the incorrect answers and try again to improve your score."}
        </p>
      </CardContent>
    </Card>
  );
}
