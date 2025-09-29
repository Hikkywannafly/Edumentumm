import type { BackendQuestion } from "@/types/quiz";
import type { QuizAnswer } from "@/types/quiz-take";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseQuizNavigationLogicProps {
  questions: BackendQuestion[];
}

interface UseQuizNavigationLogicReturn {
  currentQuestionIndex: number;
  answers: QuizAnswer[];
  isCompleted: boolean;
  setCurrentQuestionIndex: (index: number) => void;
  setAnswers: React.Dispatch<React.SetStateAction<QuizAnswer[]>>;
  setIsCompleted: (completed: boolean) => void;
  handleAnswerChange: (questionId: string, optionId: string) => void;
  handleNavigateToQuestion: (index: number) => void;
  handlePrevious: () => void;
  handleNext: () => void;
  handleRetake: () => void;
  getTotalTimeSpent: () => number;
}

export function useQuizNavigationLogic({
  questions,
}: UseQuizNavigationLogicProps): UseQuizNavigationLogicReturn {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Time tracking
  const questionStartTimeRef = useRef<number>(Date.now());
  const questionTimesRef = useRef<Record<string, number>>({});
  const currentQuestionIdRef = useRef<string | null>(null);

  // Initialize current question ID and reset state when questions change
  useEffect(() => {
    if (questions.length > 0) {
      // Reset all state when questions change (new quiz or quiz update)
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setIsCompleted(false);

      // Reset time tracking
      questionStartTimeRef.current = Date.now();
      questionTimesRef.current = {};
      currentQuestionIdRef.current = questions[0]?.id || null;
    }
  }, [questions]);

  // Update time tracking when question changes
  useEffect(() => {
    if (questions.length > 0) {
      const newQuestionId = questions[currentQuestionIndex]?.id;

      // If we have a previous question, record its time
      if (
        currentQuestionIdRef.current &&
        currentQuestionIdRef.current !== newQuestionId
      ) {
        const currentTime = Date.now();
        const timeSpentMs = currentTime - questionStartTimeRef.current;
        const timeSpentSec = Math.floor(timeSpentMs / 1000);

        // Add time to the previous question (ensure at least 1 second)
        const timeToAdd = Math.max(1, timeSpentSec);
        questionTimesRef.current[currentQuestionIdRef.current] =
          (questionTimesRef.current[currentQuestionIdRef.current] || 0) +
          timeToAdd;

        // Update start time for new question
        questionStartTimeRef.current = currentTime;
      }

      // Update current question ID
      currentQuestionIdRef.current = newQuestionId;
    }
  }, [currentQuestionIndex, questions]);

  // Record time when quiz is completed
  useEffect(() => {
    if (isCompleted && currentQuestionIdRef.current) {
      const currentTime = Date.now();
      const timeSpentMs = currentTime - questionStartTimeRef.current;
      const timeSpentSec = Math.floor(timeSpentMs / 1000);

      // Add time to the current question (ensure at least 1 second)
      const timeToAdd = Math.max(1, timeSpentSec);
      questionTimesRef.current[currentQuestionIdRef.current] =
        (questionTimesRef.current[currentQuestionIdRef.current] || 0) +
        timeToAdd;
    }
  }, [isCompleted]);

  // Record time when component unmounts (user leaves the quiz)
  useEffect(() => {
    return () => {
      if (currentQuestionIdRef.current && !isCompleted) {
        const currentTime = Date.now();
        const timeSpentMs = currentTime - questionStartTimeRef.current;
        const timeSpentSec = Math.floor(timeSpentMs / 1000);

        // Add time to the current question (ensure at least 1 second)
        const timeToAdd = Math.max(1, timeSpentSec);
        questionTimesRef.current[currentQuestionIdRef.current] =
          (questionTimesRef.current[currentQuestionIdRef.current] || 0) +
          timeToAdd;
      }
    };
  }, [isCompleted]);

  const handleAnswerChange = useCallback(
    (questionId: string, optionId: string) => {
      // Update time tracking when answer changes
      if (currentQuestionIdRef.current === questionId) {
        const currentTime = Date.now();
        const timeSpentMs = currentTime - questionStartTimeRef.current;
        const timeSpentSec = Math.floor(timeSpentMs / 1000);

        // Add time to the current question (ensure at least 1 second)
        const timeToAdd = Math.max(1, timeSpentSec);
        questionTimesRef.current[questionId] =
          (questionTimesRef.current[questionId] || 0) + timeToAdd;

        // Reset start time for continued tracking
        questionStartTimeRef.current = currentTime;
      }

      setAnswers((prev) => {
        const existing = prev.find((a) => a.questionId === questionId);
        if (existing) {
          // For existing answers, update the time spent as well
          const timeSpentSec = questionTimesRef.current[questionId] || 1;
          return prev.map((a) =>
            a.questionId === questionId
              ? {
                  ...a,
                  selectedOptionId: optionId,
                  timeSpent: timeSpentSec.toString(),
                }
              : a,
          );
        }

        // For new answers, use the time tracked for this question (ensure at least 1 second)
        const timeSpentSec = Math.max(
          1,
          questionTimesRef.current[questionId] || 0,
        );

        return [
          ...prev,
          {
            questionId,
            selectedOptionId: optionId,
            timeSpent: timeSpentSec.toString(),
          },
        ];
      });
    },
    [],
  );

  const handleNavigateToQuestion = useCallback(
    (index: number) => {
      if (index >= 0 && index < questions.length && !isCompleted) {
        setCurrentQuestionIndex(index);
      }
    },
    [questions.length, isCompleted],
  );

  const handlePrevious = useCallback(() => {
    setCurrentQuestionIndex((prev) => {
      if (prev > 0) {
        return prev - 1;
      }
      return prev;
    });
  }, []);

  const handleNext = useCallback(() => {
    setCurrentQuestionIndex((prev) => {
      if (prev < questions.length - 1) {
        return prev + 1;
      }
      return prev;
    });
  }, [questions.length]);

  const handleRetake = useCallback(() => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setIsCompleted(false);
    // Reset time tracking
    questionStartTimeRef.current = Date.now();
    questionTimesRef.current = {};
    currentQuestionIdRef.current =
      questions.length > 0 ? questions[0]?.id : null;
  }, [questions]);

  const getTotalTimeSpent = useCallback(() => {
    // Add time for current question if it exists and quiz is not completed
    let totalTime = Object.values(questionTimesRef.current).reduce(
      (sum, time) => sum + time,
      0,
    );

    if (currentQuestionIdRef.current && !isCompleted) {
      const currentTime = Date.now();
      const timeSpentMs = currentTime - questionStartTimeRef.current;
      const timeSpentSec = Math.floor(timeSpentMs / 1000);
      // Ensure at least 1 second for current question
      const timeToAdd = Math.max(1, timeSpentSec);
      totalTime += timeToAdd;
    }

    // Ensure minimum total time of 1 second per question
    const minTime = Math.max(1, questions.length);
    const finalTime = Math.max(minTime, totalTime);

    return finalTime;
  }, [isCompleted, questions.length]);

  return {
    currentQuestionIndex,
    answers,
    isCompleted,
    setCurrentQuestionIndex,
    setAnswers,
    setIsCompleted,
    handleAnswerChange,
    handleNavigateToQuestion,
    handlePrevious,
    handleNext,
    handleRetake,
    getTotalTimeSpent,
  };
}
