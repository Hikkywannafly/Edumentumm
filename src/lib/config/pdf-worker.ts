import { version } from "pdfjs-dist/package.json";

let isConfigured = false;

export const configurePDFWorker = async () => {
  if (isConfigured) return;

  try {
    const pdfjsLib = await import("pdfjs-dist");

    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
      isConfigured = true;
      console.log("PDF.js worker configured successfully");
    }
  } catch (error) {
    console.error("Failed to configure PDF worker:", error);
    throw new Error("Không thể cấu hình PDF worker");
  }
};
