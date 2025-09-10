import type { Answer, QuestionData } from "@/types/quiz";
import { v4 as uuidv4 } from "uuid";
export type { QuestionData, Answer };

interface ParsedQuestion {
  questionLines: string[];
  answers: ParsedAnswer[];
  startIndex: number;
  endIndex: number;
}

interface ParsedAnswer {
  key: string;
  lines: string[];
  isCorrect: boolean;
}

interface QuestionMatch {
  text: string;
  number?: string;
}

interface AnswerMatch {
  key: string;
  text: string;
  isCorrect: boolean;
}

export class ContentExtractor {
  private readonly QUESTION_PATTERNS = [
    /^(\d+)[\.\)\:\-]\s+/,
    /^Câu\s+(\d+)\.?\s+/i,
    /^Câu\s+(\d+)\.?\s*$/i,
    /^Câu\s+hỏi\s+(\d+)[\s\.\:\-\)]*/i,
    /^Ch\s+(\d+)[\s\.\:\-\)]*/i,
    /^Bài\s+(\d+)[\s\.\:\-\)]*/i,
    /^Question\s+(\d+)[\s\.\:\-\)]*/i,
    /^Q[\.\s]*(\d+)[\s\.\:\-\)]*/i,
    /^Problem\s+(\d+)[\s\.\:\-\)]*/i,
    /^Exercise\s+(\d+)[\s\.\:\-\)]*/i,
    /^Task\s+(\d+)[\s\.\:\-\)]*/i,
    /^\((\d+)\)[\s\.\:\-]*/,
    /^\[(\d+)\][\s\.\:\-]*/,
    /^(\d+)\s*\/\s*/,
    /^#(\d+)[\s\.\:\-]*/,
    /^[IVXLCDM]{2,}[\.\)\:\-]\s+/i, // La Mã >= 2 ký tự
    /^[\*\-\+\•\▪\►]\s*(\d+)?[\.\:\-]?\s*/,
  ];

  private readonly ANSWER_PATTERNS = [
    /^(\*?\s*)([A-Za-z])[\.\)\:\-]\s*/,
    /^(\*?\s*)([A-Za-z])\s+/,
    /^(\*?\s*)\(([A-Za-z])\)[\s\.\:\-]*/,
    /^(\*?\s*)\[([A-Za-z])\][\s\.\:\-]*/,
    /^(✓\s*|✔\s*|☑\s*|√\s*)([A-Za-z])[\.\)\:\-]*/,
    /^(\*?\s*)([A-Za-z])\s*\*\s*/,
    /^(\*?\s*)([1-9])[\.\)\:\-]\s*/,
    /^(\*?\s*)\(([1-9])\)[\s\.\:\-]*/,
    /^(\*?\s*)Answer|Option|Choice\s*([A-Za-z1-9])/i,
    /^(\*?\s*)Đáp\s*án\s*([A-Za-z1-9])[\.\:\-]?/i,
    /^(\*?\s*)ĐA\s*([A-Za-z1-9])[\.\:\-]?/i,
    /^→\s*([A-Za-z1-9])[\.\)\:\-]?/,
    /^=>\s*([A-Za-z1-9])[\.\)\:\-]?/,
    /^>>\s*([A-Za-z1-9])[\.\)\:\-]?/,
    /^(\*?\s*)\(?Đúng\)?\s*([A-Za-z1-9])?/i,
  ];

  private readonly CONTINUATION_INDICATORS = [
    /^\s*[a-zàáảãạâầấẩẫậăằắẳẵặ]/i,
    /^\s*(và|and|or|hoặc|hay)\s+/i,
    /^\s*[\-\+\*]/,
    /^\s*\(/,
    /^\s*["""''']/,
    /^\s*\d+\s*[\.\)]/,
  ];

  extractQuestions(content: string): QuestionData[] {
    const preprocessed = this.preprocessContent(content);
    const lines = preprocessed.split("\n");

    const parsedQuestions = this.parseQuestionsStructure(lines);
    return parsedQuestions.map((pq, index) =>
      this.convertToQuestionData(pq, index),
    );
  }

  private preprocessContent(content: string): string {
    let processed = content
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\u00A0/g, " ")
      .replace(/[\u2000-\u200F]/g, " ")
      .replace(/[\u2028-\u2029]/g, "\n")
      .replace(/\u200B|\u200C|\u200D|\uFEFF|\u202F/g, "")
      .replace(/[…]/g, "...")
      .replace(/[–—]/g, "-")
      .replace(/\s+([\.,;:!?\)\]\}])/g, "$1")
      .replace(/([\(\[\{])\s+/g, "$1")
      .replace(/([\.,;:!?])\s+/g, "$1 ")
      .replace(/\n\s*\n\s*\n/g, "\n\n")
      .trim();

    // Tách câu hỏi và đáp án tốt hơn
    processed = processed.replace(/(\d+)[\.\)\:\-]\s+/g, "\n$1. ");
    processed = processed.replace(/([A-Da-d])[\.\)\:\-]\s+/g, "\n$1. ");
    processed = processed.replace(/\*([A-Da-d])[\.\)\:\-]\s+/g, "\n*$1. ");

    // Tách các câu hỏi liên tiếp
    processed = processed.replace(
      /(\d+)[\.\)\:\-]\s+(\d+)[\.\)\:\-]/g,
      "$1. \n$2. ",
    );
    processed = processed.replace(
      /([A-Da-d])[\.\)\:\-]\s+(\d+)[\.\)\:\-]/g,
      "$1. \n$2. ",
    );

    // Tách câu hỏi và đáp án trên cùng dòng
    processed = processed.replace(
      /([\.\?\!])\s*([A-Da-d])[\.\)\:\-]/g,
      "$1\n$2. ",
    );
    processed = processed.replace(/([\.\?\!])\s*(\d+)[\.\)\:\-]/g, "$1\n$2. ");

    const lines = processed.split("\n");
    const normalizedLines = lines.map((line) => {
      const trimmed = line.trim();
      if (trimmed) {
        return trimmed;
      }
      return "";
    });
    processed = normalizedLines.join("\n");

    return processed;
  }

  private parseQuestionsStructure(lines: string[]): ParsedQuestion[] {
    const questions: ParsedQuestion[] = [];
    let currentQuestion: ParsedQuestion | null = null;
    let currentAnswer: ParsedAnswer | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const questionMatch = this.matchQuestionPattern(line);
      const answerMatch = this.matchAnswerPattern(line);

      if (questionMatch) {
        if (currentQuestion) {
          if (currentAnswer) currentQuestion.answers.push(currentAnswer);
          questions.push(currentQuestion);
        }
        currentQuestion = {
          questionLines: [questionMatch.text],
          answers: [],
          startIndex: i,
          endIndex: i,
        };
        currentAnswer = null;
      } else if (answerMatch && currentQuestion) {
        if (currentAnswer) currentQuestion.answers.push(currentAnswer);
        currentAnswer = {
          key: answerMatch.key,
          lines: [answerMatch.text],
          isCorrect: answerMatch.isCorrect,
        };
      } else if (currentQuestion) {
        if (currentAnswer) {
          currentAnswer.lines.push(line);
        } else if (
          this.isLikelyContinuation(line, currentQuestion.questionLines)
        ) {
          currentQuestion.questionLines.push(line);
        } else if (this.looksLikeAnswer(line)) {
          const answerKey = this.extractAnswerKeyFromText(line);
          if (answerKey) {
            if (currentAnswer) currentQuestion.answers.push(currentAnswer);
            currentAnswer = {
              key: answerKey,
              lines: [line],
              isCorrect: line.startsWith("*"),
            };
          }
        }
        currentQuestion.endIndex = i;
      }
    }

    if (currentQuestion) {
      if (currentAnswer) currentQuestion.answers.push(currentAnswer);
      questions.push(currentQuestion);
    }
    return questions;
  }

  private extractAnswerKeyFromText(text: string): string | null {
    const patterns = [
      /^(\*?)\s*([A-Za-z])/,
      /^(\*?)\s*([1-9])/,
      /^(\*?)\s*\(([A-Za-z1-9])\)/,
      /^(\*?)\s*\[([A-Za-z1-9])\]/,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[2].toUpperCase();
    }
    return null;
  }

  private matchQuestionPattern(line: string): QuestionMatch | null {
    const cleanLine = line.trim();
    if (!cleanLine) return null;
    if (this.matchAnswerPattern(cleanLine) || this.looksLikeAnswer(cleanLine)) {
      return null;
    }
    for (const pattern of this.QUESTION_PATTERNS) {
      const match = cleanLine.match(pattern);
      if (match) {
        let text = cleanLine.replace(pattern, "").trim();
        const number = match[1];
        text = this.cleanQuestionText(text);
        if (text.length < 3) continue;
        if (this.looksLikeAnswer(text)) continue;
        if (/^[\d\s\.\-\(\)\[\]]*$/.test(text)) continue;
        if (text.split(/\s+/).length <= 1 && text.length < 10) continue;
        return { text, number };
      }
    }
    return null;
  }

  private cleanQuestionText(text: string): string {
    return text
      .replace(/\s+/g, " ")
      .replace(/[\.:;,]+$/, "")
      .trim();
  }

  private looksLikeAnswer(text: string): boolean {
    const t = text.trim();
    if (
      /^[A-Za-z][\.:)\-]/.test(t) ||
      /^\([A-Za-z]\)/.test(t) ||
      /^\[[A-Za-z]\]/.test(t) ||
      /^[1-9][\.:)\-]/.test(t) ||
      /^\([1-9]\)/.test(t) ||
      /^(Số|Đáp|ĐA|Answer|Option|Choice)/i.test(t) ||
      /^\*[A-Za-z1-9][\.:)\-]?/.test(t)
    ) {
      return true;
    }
    return false;
  }

  private matchAnswerPattern(line: string): AnswerMatch | null {
    const cleanLine = line.trim();
    if (!cleanLine) return null;
    for (const pattern of this.ANSWER_PATTERNS) {
      const match = cleanLine.match(pattern);
      if (match) {
        let isCorrect = false;
        const markerGroup = match[1] || "";
        if (/[*✓✔☑√]|Đúng|Correct/i.test(markerGroup)) isCorrect = true;
        if (cleanLine.startsWith("*")) isCorrect = true;
        const key = (match[2] || match[3] || "").toUpperCase();
        let text = cleanLine.replace(pattern, "").trim();
        text = this.cleanAnswerText(text);
        if (!text || text.length < 1) continue;
        return { key, text, isCorrect };
      }
    }
    return null;
  }

  private cleanAnswerText(text: string): string {
    return text
      .replace(/\s+/g, " ")
      .replace(/[\*✓✔☑√]+$/, "")
      .trim();
  }

  private isLikelyContinuation(line: string, questionLines: string[]): boolean {
    if (this.matchAnswerPattern(line)) return false;
    if (this.matchQuestionPattern(line)) return false;
    if (this.looksLikeAnswer(line)) return false;

    const hasPrev = questionLines.length > 0;
    const lastLine = hasPrev ? questionLines[questionLines.length - 1] : "";

    // Nếu dòng trước không kết thúc bằng dấu câu, có thể là continuation
    if (hasPrev && !/[\.!?:]$/.test(lastLine.trim())) {
      return true;
    }

    // Kiểm tra các indicator tiếp tục
    for (const indicator of this.CONTINUATION_INDICATORS) {
      if (indicator.test(line)) return true;
    }

    // Nếu dòng ngắn và không phải đáp án, có thể là continuation
    if (line.length < 50 && !/^[A-Da-d][\.\)\:]/.test(line)) {
      return true;
    }

    return false;
  }

  private convertToQuestionData(
    parsedQuestion: ParsedQuestion,
    _index: number,
  ): QuestionData {
    const questionText = parsedQuestion.questionLines
      .join(" ")
      .trim()
      .replace(/\s+/g, " ");
    const answers: Answer[] = parsedQuestion.answers.map((pa, answerIndex) => ({
      id: uuidv4(),
      text: pa.lines.join(" ").trim().replace(/\s+/g, " "),
      isCorrect: pa.isCorrect,
      order_index: answerIndex + 1,
    }));
    return {
      id: uuidv4(),
      question: questionText,
      type: "MULTIPLE_CHOICE",
      points: 1,
      answers,
    };
  }
}
