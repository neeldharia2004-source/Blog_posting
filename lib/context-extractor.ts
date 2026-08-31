export interface ExtractionResult {
  text: string;
  wordCount: number;
  charCount: number;
}

export class ContextExtractor {
  /**
   * Extracts clean text content from a file buffer based on MIME type or file extension.
   */
  static async extract(
    buffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<ExtractionResult> {
    const lowerName = fileName.toLowerCase();
    let extractedText = "";

    if (mimeType === "application/pdf" || lowerName.endsWith(".pdf")) {
      try {
        // Use direct lib path to bypass pdf-parse debug test file lookup
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdf = require("pdf-parse/lib/pdf-parse.js");
        const data = await pdf(buffer);
        extractedText = data.text || "";
      } catch (pdfErr) {
        console.error("PDF parse error:", pdfErr);
        throw new Error("Failed to parse PDF document. Ensure the file is not corrupted or password-protected.");
      }
    } else if (
      mimeType.startsWith("text/") ||
      lowerName.endsWith(".txt") ||
      lowerName.endsWith(".md") ||
      lowerName.endsWith(".markdown") ||
      lowerName.endsWith(".json") ||
      lowerName.endsWith(".csv")
    ) {
      extractedText = buffer.toString("utf-8");
    } else {
      // Fallback try utf-8
      extractedText = buffer.toString("utf-8");
    }

    // Clean and normalize text: replace excessive empty lines and tabs
    const cleaned = extractedText
      .replace(/\r\n/g, "\n")
      .replace(/\t/g, "  ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!cleaned) {
      throw new Error("Extracted content is empty. Please check the uploaded file.");
    }

    const words = cleaned.split(/\s+/).filter(Boolean);

    return {
      text: cleaned,
      wordCount: words.length,
      charCount: cleaned.length,
    };
  }
}
