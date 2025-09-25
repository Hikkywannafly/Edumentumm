// import type { GeneratedQuiz } from "./quiz-editor-types";

// export function convertBackendToFrontend(quiz: any): GeneratedQuiz {
//   let quizDataObj: any;
//   let questions: any[] = [];

//   if (quiz.quizData) {
//     if (quiz.quizData instanceof Map) {
//       quizDataObj = Object.fromEntries(quiz.quizData);
//     } else {
//       quizDataObj = quiz.quizData;
//     }
//     questions = quizDataObj?.questions || [];
//   } else if (quiz.quiz_data) {
//     quizDataObj = quiz.quiz_data;
//     questions = quizDataObj?.questions || [];
//   } else if (quiz.questions) {
//     questions = quiz.questions;
//     quizDataObj = { questions };
//   } else {
//     console.warn(
//       "No quiz data found in expected locations:",
//       Object.keys(quiz),
//     );
//     quizDataObj = {};
//     questions = [];
//   }

//   const result: GeneratedQuiz = {
//     title: quiz.title || "",
//     description: quiz.description || "",
//     questions: questions,
//     settings: quizDataObj?.settings || {
//       randomizeQuestions: false,
//       showExplanations: true,
//       timeLimit: null,
//       passingScore: quiz.passingScore || 70,
//     },
//     metadata: {
//       ...quizDataObj?.metadata,
//       savedQuizId: quiz.id,
//       isAutoSaved: true,
//       lastSavedAt:
//         quiz.updatedAt || quiz.updated_at || new Date().toISOString(),
//       category:
//         quiz.categoryId?.toString() ||
//         quiz.category_id?.toString() ||
//         quizDataObj?.metadata?.category,
//       tags: quiz.tags || quizDataObj?.metadata?.tags || [],
//       total_questions: questions.length,
//       total_points: questions.reduce(
//         (sum: number, q: any) => sum + (q.points || 1),
//         0,
//       ),
//       estimated_time:
//         quiz.estimatedTime ||
//         quiz.estimated_time ||
//         quizDataObj?.metadata?.estimated_time ||
//         10,
//     },
//   };

//   return result;
// }
