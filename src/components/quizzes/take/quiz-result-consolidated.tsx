"use client";

import type { BackendQuizEntity } from "@/types/quiz";
import type { QuizResult } from "@/types/quiz-take";
import ThinLayout from "../../layout/thin-layout";
import { AnswerReviewSection } from "./result/answer-review-section";
import { PassFailStatus } from "./result/pass-fail-status";
import { PersonalizedFeedback } from "./result/personalized-feedback";
import { ProgressSection } from "./result/progress-section";
import { QuizStatistics } from "./result/quiz-statistics";
import { ResultActionButtons } from "./result/result-action-buttons";
import { getCorrectOptionText, getSelectedOptionText } from "./result/utils";

interface QuizResultConsolidatedProps {
  result: QuizResult;
  quiz: BackendQuizEntity;
  onRetake: () => void;
  onBackToQuizzes: () => void;
}

export function QuizResultConsolidated({
  result,
  quiz,
  onRetake,
  onBackToQuizzes,
}: QuizResultConsolidatedProps) {
  return (
    <ThinLayout classNames="relative w-full flex-1 px-4 pb-32 sm:max-w-2xl sm:px-6 sm:pb-24 md:max-w-3xl md:pb-20 lg:max-w-4xl lg:px-8">
      <div className="mt-5 space-y-8 pb-64">
        <PassFailStatus result={result} quiz={quiz} />
        <QuizStatistics result={result} />
        <ProgressSection result={result} />
        <PersonalizedFeedback result={result} quiz={quiz} />
        <AnswerReviewSection
          result={result}
          quiz={quiz}
          getSelectedOptionText={(
            questionId: string,
            selectedOptionId: string,
            questionType?: string,
          ) =>
            getSelectedOptionText(
              questionId,
              selectedOptionId,
              questionType,
              quiz,
            )
          }
          getCorrectOptionText={(
            questionId: string,
            correctOptionId: string,
            questionType?: string,
          ) =>
            getCorrectOptionText(
              questionId,
              correctOptionId,
              questionType,
              quiz,
            )
          }
        />
        <ResultActionButtons
          onRetake={onRetake}
          onBackToQuizzes={onBackToQuizzes}
        />
      </div>
    </ThinLayout>
  );
}
