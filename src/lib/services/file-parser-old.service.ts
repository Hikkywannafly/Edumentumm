export class FileParserService {
  async parseFile(file: File): Promise<string> {
    const extension = file.name.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "pdf":
        return this.parsePDF(file);
      case "docx":
      case "doc":
        return this.parseWord(file);
      case "xlsx":
      case "xls":
        return this.parseExcel(file);
      case "pptx":
      case "ppt":
        return this.parsePowerPoint(file);
      case "json":
        return this.parseJSON(file);
      case "md":
        return this.parseMarkdown(file);
      default:
        throw new Error(`Unsupported file type: ${extension}`);
    }
  }

  private async parsePDF(file: File): Promise<string> {
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

      const maxPages = Math.min(pdf.numPages, 50);
      // if (pdf.numPages > 50) {
      //   console.warn(`PDF có ${pdf.numPages} trang, chỉ xử lý 50 trang đầu`);
      // }

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

  private async parseWord(file: File): Promise<string> {
    const mammoth = await import("mammoth");
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  private async parseExcel(file: File): Promise<string> {
    const XLSX = await import("xlsx");
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });

    let content = "";
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      content += `Sheet: ${sheetName}\n`;
      for (const row of jsonData) {
        content += `${(row as any[]).join("\t")}\n`;
      }
      content += "\n";
    }

    return content;
  }

  private async parsePowerPoint(_file: File): Promise<string> {
    return "PowerPoint content extraction requires additional processing";
  }

  private async parseJSON(file: File): Promise<string> {
    const text = await file.text();
    const json = JSON.parse(text);

    if (json.quiz && json.quiz.questions) {
      let content = `Quiz: ${json.quiz.title}\n`;
      content += `Description: ${json.quiz.description}\n\n`;

      json.quiz.questions.forEach((q: any, index: number) => {
        content += `${index + 1}. ${q.question}\n`;
        q.answers.forEach((a: any, aIndex: number) => {
          const letter = String.fromCharCode(65 + aIndex);
          const marker = a.isCorrect ? " *" : "";
          content += `   ${letter}. ${a.text}${marker}\n`;
        });
        content += "\n";
      });

      return content;
    }

    return JSON.stringify(json, null, 2);
  }

  private async parseMarkdown(file: File): Promise<string> {
    return await file.text();
  }
}
