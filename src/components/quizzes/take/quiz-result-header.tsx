// "use client";

// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent } from "@/components/ui/card";
// import type { QuizResult } from "@/types/quiz-take";
// import { Target, Trophy } from "lucide-react";

// interface QuizResultHeaderProps {
//   result: QuizResult;
// }

// export function QuizResultHeader({ result }: QuizResultHeaderProps) {
//   const getScoreBadgeColor = (percentage: number) => {
//     if (percentage >= 90) return "bg-green-100 text-green-800 border-green-200";
//     if (percentage >= 70) return "bg-blue-100 text-blue-800 border-blue-200";
//     if (percentage >= 50) return "bg-amber-100 text-amber-800 border-amber-200";
//     return "bg-red-100 text-red-800 border-red-200";
//   };

//   const getPerformanceMessage = (percentage: number) => {
//     if (percentage >= 95) return "Outstanding performance! 🌟";
//     if (percentage >= 85) return "Excellent work! 🎉";
//     if (percentage >= 75) return "Great job! 👏";
//     if (percentage >= 65) return "Good effort! 👍";
//     if (percentage >= 50) return "Keep practicing! 💪";
//     return "Don't give up! Try again! 🚀";
//   };

//   return (
//     <Card className="rounded-xl border border-border/50 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm dark:from-blue-900/20 dark:to-indigo-900/20">
//       <CardContent className="p-8 text-center">
//         <div className="mb-4 flex justify-center">
//           {result.passed ? (
//             <div className="rounded-full bg-yellow-100 p-4 dark:bg-yellow-900/30">
//               <Trophy className="h-16 w-16 text-yellow-500" />
//             </div>
//           ) : (
//             <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-800">
//               <Target className="h-16 w-16 text-gray-400" />
//             </div>
//           )}
//         </div>

//         <h1 className="mb-2 font-bold text-3xl text-foreground">
//           Quiz Completed!
//         </h1>

//         <p className="mb-6 text-lg text-muted-foreground">
//           {getPerformanceMessage(result.percentage)}
//         </p>

//         <div className="flex flex-wrap items-center justify-center gap-4">
//           <Badge
//             className={`px-6 py-3 font-semibold text-lg ${getScoreBadgeColor(result.percentage)} rounded-full`}
//           >
//             {result.score || 0}/{result.maxScore || 0} points
//           </Badge>
//           <Badge
//             className={`px-6 py-3 font-semibold text-lg ${getScoreBadgeColor(result.percentage || 0)} rounded-full`}
//           >
//             {(result.percentage || 0).toFixed(1)}%
//           </Badge>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
