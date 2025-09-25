import type { ParsingMode } from "@/types/quiz";

export interface ParsingOptions {
  mode?: ParsingMode;
  maxPages?: number;
  includeImages?: boolean;
  skipTables?: boolean;
}

export interface ParseResult {
  content: string;
  metadata?: {
    totalPages?: number;
    processedPages?: number;
    skippedContent?: string[];
    processingTime?: number;
  };
}

export class FileParserService {
  async parseFile(file: File, options?: ParsingOptions): Promise<string> {
    const startTime = Date.now();
    const mode = options?.mode || "BALANCED";

    console.log(`🔄 Parsing file with ${mode} mode:`, file.name);
    const extension = file.name.split(".").pop()?.toLowerCase();

    const parseOptions = this.getParsingOptions(mode);
    let result: string;

    switch (extension) {
      case "pdf":
        result = await this.parsePDF(file, parseOptions);
        break;
      case "docx":
      case "doc":
        result = await this.parseWord(file, parseOptions);
        break;
      case "xlsx":
      case "xls":
        result = await this.parseExcel(file, parseOptions);
        break;
      case "pptx":
      case "ppt":
        result = await this.parsePowerPoint(file, parseOptions);
        break;
      case "json":
        result = await this.parseJSON(file, parseOptions);
        break;
      case "md":
        result = await this.parseMarkdown(file, parseOptions);
        break;
      default:
        throw new Error(`Unsupported file type: ${extension}`);
    }

    const processingTime = Date.now() - startTime;
    console.log(
      `✅ Parsing completed in ${processingTime}ms with ${mode} mode`,
    );

    return result;
  }

  private getParsingOptions(mode: ParsingMode): ParsingOptions {
    switch (mode) {
      case "FAST":
        return {
          mode,
          maxPages: 10,
          includeImages: false,
          skipTables: true,
        };
      case "BALANCED":
        return {
          mode,
          maxPages: 10,
          includeImages: false,
          skipTables: false,
        };
      case "THOROUGH":
        return {
          mode,
          maxPages: undefined,
          includeImages: true,
          skipTables: false,
        };
      default:
        return {
          mode: "BALANCED",
          maxPages: 50,
          includeImages: false,
          skipTables: false,
        };
    }
  }

  private async parsePDF(file: File, options: ParsingOptions): Promise<string> {
    if (file.size > 10 * 1024 * 1024) {
      throw new Error("PDF file quá lớn (>10MB). Vui lòng chọn file nhỏ hơn.");
    }

    try {
      const pdfjsLib = await import("pdfjs-dist");

      if (
        typeof window !== "undefined" &&
        !pdfjsLib.GlobalWorkerOptions.workerSrc
      ) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
      }).promise;

      const maxPages = options.maxPages
        ? Math.min(pdf.numPages, options.maxPages)
        : pdf.numPages;

      if (options.mode === "FAST" && pdf.numPages > 20) {
        console.warn(
          `⚡ FAST mode: Processing only first 20 pages out of ${pdf.numPages}`,
        );
      } else if (options.mode === "BALANCED" && pdf.numPages > 50) {
        console.warn(
          `⚖️ BALANCED mode: Processing only first 50 pages out of ${pdf.numPages}`,
        );
      } else if (options.mode === "THOROUGH") {
        console.info(`🔍 THOROUGH mode: Processing all ${pdf.numPages} pages`);
      }

      let totalTextLength = 0;
      for (let i = 1; i <= Math.min(maxPages, 3); i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        totalTextLength += pageText.trim().length;
      }

      if (totalTextLength < 50) {
        throw new Error("Error");
      }

      const pageExtractions: Promise<string>[] = [];
      for (let i = 1; i <= maxPages; i++) {
        pageExtractions.push(
          (async () => {
            try {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              return textContent.items
                .map((item: any) => item.str)
                .filter((str) => str.trim())
                .join(" ");
            } catch (pageError) {
              console.error(`Error parsing page ${i}:`, pageError);
              return "";
            }
          })(),
        );
      }

      const pages = await Promise.all(pageExtractions);
      const content = pages.filter((page) => page.trim()).join("\n\n");

      if (!content.trim()) {
        throw new Error("Error");
      }

      return content;
    } catch (error) {
      console.error("Error parsing PDF:", error);

      throw new Error(`Không thể đọc file PDF: ${"Lỗi không xác định"}`);
    }
  }

  private async parseWord(
    file: File,
    options: ParsingOptions,
  ): Promise<string> {
    console.log(`📄 Parsing Word document with ${options.mode} mode`);
    const mammoth = await import("mammoth");
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });

    if (options.mode === "FAST") {
      return result.value.slice(0, 10000);
    }

    return result.value;
  }

  private async parseExcel(
    file: File,
    options: ParsingOptions,
  ): Promise<string> {
    const XLSX = await import("xlsx");
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });

    let content = "";
    // Limit sheets processing based on mode
    const sheetsToProcess =
      options.mode === "FAST"
        ? workbook.SheetNames.slice(0, 3)
        : workbook.SheetNames;

    if (options.mode === "FAST" && workbook.SheetNames.length > 3) {
      console.warn(
        `⚡ FAST mode: Processing only first 3 sheets out of ${workbook.SheetNames.length}`,
      );
    }

    for (const sheetName of sheetsToProcess) {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      content += `Sheet: ${sheetName}\n`;

      const rowsToProcess =
        options.mode === "FAST" ? jsonData.slice(0, 100) : jsonData;

      for (const row of rowsToProcess) {
        if (options.skipTables && options.mode === "FAST") {
          // Simple text extraction for FAST mode
          const textContent = (row as any[])
            .filter((cell) => typeof cell === "string" && cell.length > 0)
            .join(" ");
          if (textContent) content += `${textContent}\n`;
        } else {
          content += `${(row as any[]).join("\t")}\n`;
        }
      }
      content += "\n";
    }

    return content;
  }

  private async parsePowerPoint(
    _file: File,
    options: ParsingOptions,
  ): Promise<string> {
    // TODO: Implement PowerPoint parsing based on mode
    const modeInfo =
      options.mode === "FAST"
        ? " (basic text only)"
        : options.mode === "THOROUGH"
          ? " (with slide structure)"
          : "";
    return `PowerPoint content extraction requires additional processing${modeInfo}`;
  }

  private async parseJSON(
    file: File,
    options: ParsingOptions,
  ): Promise<string> {
    const text = await file.text();
    const json = JSON.parse(text);

    if (json.quiz && json.quiz.questions) {
      let content = `Quiz: ${json.quiz.title}\n`;
      content += `Description: ${json.quiz.description}\n\n`;

      // Limit questions in FAST mode
      const questionsToProcess =
        options.mode === "FAST"
          ? json.quiz.questions.slice(0, 20)
          : json.quiz.questions;

      if (options.mode === "FAST" && json.quiz.questions.length > 20) {
        console.warn(
          `⚡ FAST mode: Processing only first 20 questions out of ${json.quiz.questions.length}`,
        );
      }

      questionsToProcess.forEach((q: any, index: number) => {
        content += `${index + 1}. ${q.question}\n`;
        if (!options.skipTables || options.mode !== "FAST") {
          q.answers.forEach((a: any, aIndex: number) => {
            const letter = String.fromCharCode(65 + aIndex);
            const marker = a.isCorrect ? " *" : "";
            content += `   ${letter}. ${a.text}${marker}\n`;
          });
        }
        content += "\n";
      });

      return content;
    }

    return JSON.stringify(json, null, 2);
  }

  private async parseMarkdown(
    file: File,
    options: ParsingOptions,
  ): Promise<string> {
    const content = await file.text();

    if (options.mode === "FAST") {
      return content
        .replace(/```[\s\S]*?```/g, "")
        .replace(/`[^`]+`/g, "")
        .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
        .replace(/\[[^\]]*\]\([^)]+\)/g, "")
        .replace(/[#*_~]/g, "")
        .slice(0, 5000);
    }

    return content;
  }
}
