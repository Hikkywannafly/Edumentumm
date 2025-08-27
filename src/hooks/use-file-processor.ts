import { FileParserService } from "@/lib/services/file-parser.service";
import {
  extractQuestionsFromContent,
  extractQuestionsWithAIHandler,
  generateQuestionsWithAI,
  generateQuizTitleDescription,
} from "@/lib/services/quiz-generate.service";
import { useQuizEditorStore } from "@/stores/quiz-editor-store";
import type { GeneratedQuiz, QuestionData, UploadedFile } from "@/types/quiz";
import { useCallback, useEffect, useState } from "react";

const fileParser = new FileParserService();

export function useFileProcessor() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { setQuizData, updateQuizData } = useQuizEditorStore();

  const processFile = useCallback(
    async (fileInfo: UploadedFile, actualFile: File) => {
      try {
        setUploadedFiles((prev) =>
          prev.map((file) =>
            file.id === fileInfo.id
              ? { ...file, status: "processing", progress: 50 }
              : file,
          ),
        );

        const content = await fileParser.parseFile(actualFile);
        console.log("content", content);
        setUploadedFiles((prev) => {
          const updatedFiles = prev.map((file) =>
            file.id === fileInfo.id
              ? {
                  ...file,
                  status: "success" as const,
                  progress: 100,
                  parsedContent: content,
                  extractedQuestions: [],
                  actualFile,
                }
              : file,
          );

          return updatedFiles;
        });
      } catch (error) {
        console.error("Error processing file:", error);
        setUploadedFiles((prev) =>
          prev.map((file) =>
            file.id === fileInfo.id
              ? {
                  ...file,
                  status: "error",
                  error:
                    error instanceof Error ? error.message : "Unknown error",
                }
              : file,
          ),
        );
      }
    },
    [],
  );

  const addFiles = useCallback(
    async (acceptedFiles: File[]) => {
      const newFiles: UploadedFile[] = acceptedFiles.map((file, index) => ({
        id: `${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
        status: "uploading",
        progress: 0,
      }));

      setUploadedFiles((prev) => [...prev, ...newFiles]);

      // Process files concurrently for faster UX
      await Promise.all(
        newFiles.map((file, idx) => processFile(file, acceptedFiles[idx])),
      );
    },
    [processFile],
  );

  const removeFile = useCallback(
    (fileId: string) => {
      setUploadedFiles((prev) => {
        const newFiles = prev.filter((file) => file.id !== fileId);
        if (newFiles.length === 0) {
          setQuizData(null as any);
        }

        return newFiles;
      });
    },
    [setQuizData],
  );

  const extractQuestionsFromFiles = useCallback(
    async (settings?: any) => {
      const successfulFiles = uploadedFiles.filter(
        (f) => f.status === "success" && f.parsedContent,
      );

      if (successfulFiles.length === 0) {
        throw new Error("No files to process");
      }

      let allQuestions: QuestionData[] = [];

      for (const file of successfulFiles) {
        if (file.parsedContent) {
          try {
            // Extract existing questions from file content (NO AI, direct parsing)
            const questions = await extractQuestionsFromContent(
              file.parsedContent,
              settings,
            );
            allQuestions = [...allQuestions, ...questions];
          } catch (error) {
            console.error(
              `Error extracting questions from ${file.name}:`,
              error,
            );
            // Continue with other files even if one fails
          }
        }
      }

      if (allQuestions.length === 0) {
        throw new Error("No questions could be extracted from files");
      }

      // Update quiz data
      const quizData: GeneratedQuiz = {
        title: `Quiz from ${successfulFiles[0].name}`,
        description: `Extracted ${allQuestions.length} questions from ${successfulFiles.length} file(s)`,
        questions: allQuestions,
      };

      setQuizData(quizData);
      return quizData;
    },
    [uploadedFiles, setQuizData],
  );

  // Generate new questions using AI (for AI-generated uploader)
  const generateQuestionsFromFiles = useCallback(
    async (settings?: {
      generationMode?: "GENERATE" | "EXTRACT";
      visibility?: string;
      language?: string;
      questionType?: string;
      numberOfQuestions?: number;
      mode?: string;
      difficulty?: string;
      task?: string;
      parsingMode?: any;
    }) => {
      const successfulFiles = uploadedFiles.filter(
        (f) => f.status === "success" && f.parsedContent,
      );

      if (successfulFiles.length === 0) {
        throw new Error("No files to process");
      }

      let allQuestions: QuestionData[] = [];

      for (const file of successfulFiles) {
        if (file.parsedContent) {
          try {
            let questions: QuestionData[] = [];

            if (settings?.generationMode === "EXTRACT") {
              questions = await extractQuestionsWithAIHandler(
                file.parsedContent,
                file.actualFile,
                settings,
              );
            } else {
              questions = await generateQuestionsWithAI(
                file.parsedContent,
                file.actualFile,
                settings,
              );
            }
            allQuestions = [...allQuestions, ...questions];
          } catch (error) {
            console.error(
              `Error ${settings?.generationMode === "EXTRACT" ? "extracting" : "generating"} questions from ${file.name}:`,
              error,
            );
          }
        }
      }

      if (allQuestions.length === 0) {
        throw new Error(
          settings?.generationMode === "EXTRACT"
            ? "No questions could be extracted from files"
            : "No questions could be generated from files",
        );
      }

      const isExtractMode = settings?.generationMode === "EXTRACT";

      let selectedCategory: string | undefined;
      const allTags: string[] = [];

      for (const question of allQuestions) {
        if (question.tags) {
          for (const tag of question.tags) {
            if (!allTags.includes(tag)) {
              allTags.push(tag);
            }
          }
        }
      }

      let aiTitle = "";
      let aiDescription = "";
      try {
        const firstFile = successfulFiles[0];
        const contentPreview = firstFile.parsedContent?.slice(0, 1000) || "";

        console.log("🎯 Attempting to generate AI title/description...");
        console.log("📄 Content preview:", contentPreview.substring(0, 200));
        console.log("📊 Questions count:", allQuestions.length);
        console.log("🏷️ Tags:", allTags);
        console.log("📁 Filename:", firstFile?.name);

        const titleDescResult = await generateQuizTitleDescription(
          contentPreview,
          allQuestions,
          {
            isExtractMode,
            targetLanguage: settings?.language || "vi",
            filename: firstFile?.name,
            category: selectedCategory,
            tags: allTags,
          },
        );

        console.log("🔍 AI Title/Description Result:", titleDescResult);

        if (titleDescResult) {
          aiTitle = titleDescResult.title || "";
          aiDescription = titleDescResult.description || "";
          console.log("✅ AI Title:", aiTitle);
          console.log("✅ AI Description:", aiDescription);
        } else {
          console.warn("⚠️ AI title/description result is null or undefined");
        }
      } catch (error) {
        console.error("❌ Failed to generate AI title/description:", error);
      }

      // Final title and description with fallback
      const finalTitle =
        aiTitle ||
        (isExtractMode
          ? `Extracted Quiz from ${successfulFiles[0].name}`
          : `AI-Generated Quiz from ${successfulFiles[0].name}`);

      const finalDescription =
        aiDescription ||
        (isExtractMode
          ? `Extracted ${allQuestions.length} questions from ${successfulFiles.length} file(s)`
          : `Generated from ${successfulFiles.length} file(s) using AI`);

      console.log("🏁 Final Quiz Title:", finalTitle);
      console.log("🏁 Final Quiz Description:", finalDescription);
      console.log("🤖 Using AI Title:", !!aiTitle);
      console.log("🤖 Using AI Description:", !!aiDescription);

      const quizData: GeneratedQuiz = {
        title: finalTitle,
        description: finalDescription,
        questions: allQuestions,
        metadata: {
          total_questions: allQuestions.length,
          total_points: allQuestions.reduce(
            (sum, q) => sum + (q.points || 1),
            0,
          ),
          estimated_time: Math.max(5, Math.ceil(allQuestions.length * 1.5)), // 1.5 minutes per question
          tags: allTags.slice(0, 10), // Limit to first 10 unique tags
          category: selectedCategory,
        },
      };
      setQuizData(quizData);
      return quizData;
    },
    [uploadedFiles, setQuizData],
  );

  const updateQuizDetails = useCallback(
    (updates: Partial<GeneratedQuiz>) => {
      updateQuizData(updates);
    },
    [updateQuizData],
  );

  // Extract existing questions directly from TEXT content (no AI)
  const extractQuestionsFromText = useCallback(
    async (content: string, settings?: any) => {
      if (!content || content.trim().length === 0) {
        throw new Error("No text content provided");
      }

      const questions = await extractQuestionsFromContent(content, settings);

      const quizData: GeneratedQuiz = {
        title: "Quiz from Text Content",
        description: `Extracted ${questions.length} questions from text`,
        questions,
      };

      setQuizData(quizData);
      return quizData;
    },
    [setQuizData],
  );

  // Generate new questions directly from TEXT content (AI)
  const generateQuestionsFromText = useCallback(
    async (
      content: string,
      settings?: {
        generationMode?: "GENERATE" | "EXTRACT";
        visibility?: string;
        language?: string;
        questionType?: string;
        numberOfQuestions?: number;
        mode?: string;
        difficulty?: string;
        task?: string;
        parsingMode?: any;
        includeCategories?: boolean;
      },
    ) => {
      if (!content || content.trim().length === 0) {
        throw new Error("No text content provided");
      }

      const questions =
        settings?.generationMode === "EXTRACT"
          ? await extractQuestionsWithAIHandler(content, undefined, {
              ...settings,
              includeCategories: true,
            })
          : await generateQuestionsWithAI(content, undefined, {
              ...settings,
              includeCategories: true,
            });

      const selectedCategory = undefined as unknown as string | undefined;

      // Collect unique tags from all questions
      const allTags: string[] = [];
      for (const q of questions) {
        if (q.tags) {
          for (const tag of q.tags) {
            if (!allTags.includes(tag)) {
              allTags.push(tag);
            }
          }
        }
      }

      const isExtractMode = settings?.generationMode === "EXTRACT";
      const quizData: GeneratedQuiz = {
        title: isExtractMode
          ? "Extracted Quiz from Text"
          : "AI-Generated Quiz from Text",
        description: isExtractMode
          ? `Extracted ${questions.length} questions from text`
          : `Generated ${questions.length} questions from text using AI`,
        questions,
        metadata: {
          total_questions: questions.length,
          total_points: questions.reduce(
            (sum: number, q: QuestionData) => sum + (q.points || 1),
            0,
          ),
          estimated_time: Math.max(5, Math.ceil(questions.length * 1.5)), // 1.5 minutes per question
          tags: allTags.slice(0, 10), // Limit to first 10 unique tags
          category: selectedCategory,
          subject: settings?.language,
        },
      };

      setQuizData(quizData);
      return quizData;
    },
    [setQuizData],
  );

  const reset = useCallback(() => {
    setUploadedFiles([]);
    setQuizData(null as any);
  }, [setQuizData]);

  const { quizData } = useQuizEditorStore();

  useEffect(() => {
    const successfulFiles = uploadedFiles.filter(
      (f) => f.status === "success" && f.extractedQuestions,
    );

    if (successfulFiles.length > 0) {
      const allQuestions = successfulFiles.flatMap(
        (f) => f.extractedQuestions || [],
      );

      setQuizData({
        title: `Quiz from ${successfulFiles.length} file(s)`,
        description: "Auto-generated quiz from uploaded files",
        questions: allQuestions,
      });
    } else if (uploadedFiles.length === 0) {
      setQuizData(null as any);
    }
  }, [uploadedFiles, setQuizData]);

  return {
    uploadedFiles,
    generatedQuiz: quizData,
    addFiles,
    removeFile,
    extractQuestionsFromFiles,
    generateQuestionsFromFiles,
    extractQuestionsFromText,
    generateQuestionsFromText,
    updateQuizDetails,
    reset,
    isProcessing: uploadedFiles.some(
      (f) => f.status === "uploading" || f.status === "processing",
    ),
    hasFiles: uploadedFiles.length > 0,
    hasGeneratedQuiz: !!quizData,
  };
}
