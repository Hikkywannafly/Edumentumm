// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { quizApi } from '@/lib/api/quiz/quiz-api';
// import { QUIZ_QUERY_KEYS } from '@/hooks/queries/use-quiz';
// import type { UpdateQuizData, QuizData } from '@/types/quiz';

// interface UseUpdateQuizOptions {
//   onSuccess?: (data: QuizData) => void;
//   onError?: (error: Error) => void;
// }

// export function useUpdateQuiz(options: UseUpdateQuizOptions = {}) {
//   const queryClient = useQueryClient();
//   const { onSuccess, onError } = options;

//   return useMutation<
//     QuizData,
//     Error,
//     { id: string; data: UpdateQuizData }
//   >({
//     mutationFn: ({ id, data }) => quizApi.updateQuiz(id, data),

//     onSuccess: (data) => {
//       // Update specific quiz cache
//       queryClient.setQueryData(QUIZ_QUERY_KEYS.detail(data.id), data);

//       // Invalidate lists to refresh any quiz lists
//       queryClient.invalidateQueries({
//         queryKey: QUIZ_QUERY_KEYS.lists()
//       });

//       // Custom success callback
//       onSuccess?.(data);
//     },

//     onError: (error) => {
//       console.error('Error updating quiz:', error);
//       onError?.(error);
//     },
//   });
// }
