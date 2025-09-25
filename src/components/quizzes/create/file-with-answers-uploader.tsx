// "use client";

// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// // import { useFileProcessor } from "@/hooks/use-file-processor";
// import {
//   FILE_UPLOAD_LIMITS,
//   getAcceptedFileTypes,
// } from "@/lib/utils/file-utils";
// import { useLocalizedNavigation } from "@/lib/utils/navigation";
// // import { useQuizEditorStore } from "@/stores/quiz-editor-store";
// import type { Language, ParsingMode, QuizMode, Visibility } from "@/types/quiz";
// import { CheckCircle, Loader2, Settings } from "lucide-react";
// import { useTranslations } from "next-intl";
// import { useState } from "react";
// // import { useDropzone } from "react-dropzone";
// import { FileList } from "./file-list";
// import { FileUploadArea } from "./file-upload-area";

// interface FileWithAnswersUploaderProps {
//   onProcessingStart?: (fileName: string, label?: string) => void;
//   onProcessingDone?: (done: boolean) => void;
// }

// export function FileWithAnswersUploader({
//   onProcessingStart,
//   onProcessingDone,
// }: FileWithAnswersUploaderProps) {
//   const t = useTranslations("Quizzes");
//   const { goQuizEdit } = useLocalizedNavigation();
//   const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);

//   // Cài đặt cho trích xuất
//   const [visibility, setVisibility] = useState<Visibility>("PRIVATE");
//   const [language, setLanguage] = useState<Language>("AUTO");
//   const [mode, setMode] = useState<QuizMode>("QUIZ");
//   const [parsingMode, setParsingMode] = useState<ParsingMode>("BALANCED");

//   // const {
//   //   uploadedFiles,
//   //   addFiles,
//   //   removeFile,
//   //   extractQuestionsFromFiles,
//   //   isProcessing,
//   //   hasFiles,
//   // } = useFileProcessor();

//   const { setEditing } = useQuizEditorStore();

//   // Busy when creating quiz or underlying processor is working
//   const isBusy = isCreatingQuiz || isProcessing;

//   const { isDragActive } = useDropzone({
//     disabled: isBusy,
//     onDrop: (files) => {
//       if (!isBusy) addFiles(files);
//     },
//     accept: getAcceptedFileTypes(),
//     maxFiles: FILE_UPLOAD_LIMITS.maxFiles,
//     maxSize: FILE_UPLOAD_LIMITS.maxSize,
//   });

//   const handleCreateQuiz = async () => {
//     if (isCreatingQuiz || isProcessing) return; // guard against double submit

//     setIsCreatingQuiz(true);

//     onProcessingStart?.(
//       uploadedFiles[0]?.name || "File",
//       t("create.fileWithAnswers.processing"),
//     );

//     try {
//       await extractQuestionsFromFiles({
//         language,
//         parsingMode,
//       });

//       // Navigate immediately; parent overlay stays until route change
//       onProcessingDone?.(true);
//       setEditing(true);
//       goQuizEdit();
//     } catch (error) {
//       console.error("Error creating quiz:", error);
//       setIsCreatingQuiz(false);

//       onProcessingDone?.(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div
//         className={`grid gap-6 lg:grid-cols-3 ${isBusy ? "pointer-events-none opacity-60" : ""}`}
//         aria-busy={isBusy}
//       >
//         {/* Khu tải file */}
//         <div className="space-y-6 lg:col-span-2">
//           <FileUploadArea
//             onDrop={isBusy ? () => {} : addFiles}
//             isDragActive={isDragActive}
//             variant="file-with-answers"
//           />
//           <FileList files={uploadedFiles} onRemoveFile={removeFile} />

//           <div className="flex items-center justify-between">
//             <p className="text-muted-foreground text-sm">
//               {t("create.fileWithAnswers.guidance")}
//             </p>
//             <div className="flex gap-2">
//               <Button
//                 disabled={!hasFiles || isProcessing || isCreatingQuiz}
//                 onClick={handleCreateQuiz}
//                 className="flex items-center gap-2"
//               >
//                 {isCreatingQuiz ? (
//                   <>
//                     <Loader2 className="h-4 w-4 animate-spin" />{" "}
//                     {t("create.fileWithAnswers.processing")}
//                   </>
//                 ) : (
//                   <>
//                     <CheckCircle className="h-4 w-4" />{" "}
//                     {t("create.fileWithAnswers.createQuiz")}
//                   </>
//                 )}
//               </Button>
//             </div>
//           </div>
//         </div>

//         <div>
//           <Card className="border-none">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Settings className="h-5 w-5" /> {t("create.settings.title")}
//               </CardTitle>
//               <CardDescription>
//                 {t("create.settings.description")}
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-5 border-none">
//               <div className="space-y-2">
//                 <Label>{t("create.settings.visibility")}</Label>
//                 <Select
//                   value={visibility}
//                   onValueChange={(v: Visibility) => setVisibility(v)}
//                   disabled={isBusy}
//                 >
//                   <SelectTrigger className="w-full" disabled={isBusy}>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent className="w-full">
//                     <SelectItem value="PRIVATE">
//                       {t("create.settings.private")}
//                     </SelectItem>
//                     <SelectItem value="PUBLIC">
//                       {t("create.settings.public")}
//                     </SelectItem>
//                     <SelectItem value="UNLISTED">
//                       {t("create.settings.unlisted")}
//                     </SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-2">
//                 <Label>{t("create.settings.language")}</Label>
//                 <Select
//                   value={language}
//                   onValueChange={(v: Language) => setLanguage(v)}
//                   disabled={isBusy}
//                 >
//                   <SelectTrigger className="w-full" disabled={isBusy}>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent className="w-full">
//                     <SelectItem value="AUTO">
//                       🌐 {t("create.settings.autoDetect")}
//                     </SelectItem>
//                     <SelectItem value="EN">🇺🇸 English</SelectItem>
//                     <SelectItem value="VI">🇻🇳 Tiếng Việt</SelectItem>
//                     <SelectItem value="KO">🇰🇷 한국어</SelectItem>
//                     <SelectItem value="ZH">🇨🇳 中文</SelectItem>
//                     <SelectItem value="JA">🇯🇵 日本語</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-2">
//                 <Label>{t("create.settings.modeLabel")}</Label>
//                 <Select
//                   value={mode}
//                   onValueChange={(v: QuizMode) => setMode(v)}
//                   disabled={isBusy}
//                 >
//                   <SelectTrigger className="w-full" disabled={isBusy}>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent className="w-full">
//                     <SelectItem value="QUIZ">
//                       {t("create.settings.quiz")}
//                     </SelectItem>
//                     <SelectItem value="FLASHCARD">
//                       {t("create.settings.flashcard")}
//                     </SelectItem>
//                     <SelectItem value="STUDY_GUIDE">
//                       {t("create.settings.studyGuide")}
//                     </SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-2">
//                 <Label>{t("create.settings.parsingMode")}</Label>
//                 <Select
//                   value={parsingMode}
//                   onValueChange={(v: ParsingMode) => setParsingMode(v)}
//                   disabled={isBusy}
//                 >
//                   <SelectTrigger className="w-full" disabled={isBusy}>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent className="w-full">
//                     <SelectItem value="FAST">
//                       {t("create.settings.fast")}
//                     </SelectItem>
//                     <SelectItem value="BALANCED">
//                       {t("create.settings.balanced")}
//                     </SelectItem>
//                     <SelectItem value="THOROUGH">
//                       {t("create.settings.thorough")}
//                     </SelectItem>
//                   </SelectContent>
//                 </Select>
//                 {parsingMode === "FAST" && (
//                   <p className="text-muted-foreground text-xs">
//                     {t("create.settings.fastModeWarning")}
//                   </p>
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }
