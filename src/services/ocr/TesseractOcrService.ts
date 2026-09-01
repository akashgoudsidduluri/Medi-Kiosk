import { OcrService, OcrResult } from "./OcrService";
import * as Tesseract from "tesseract.js";

export class TesseractOcrService implements OcrService {
  isSupported(): boolean {
    return true; // Tesseract.js runs in browser via WebAssembly
  }

  async extractText(file: File): Promise<OcrResult> {
    try {
      // Basic validation for image type since Tesseract.js in browser handles images best
      if (!file.type.startsWith('image/')) {
        throw new Error("Only image files are supported by Tesseract in the browser currently.");
      }

      const result = await Tesseract.recognize(
        file,
        'eng', // Default to English for now
        {
          logger: (m: any) => console.log(m) // Optional logging
        }
      );

      return {
        text: result.data.text,
        confidence: result.data.confidence,
      };
    } catch (error) {
      console.error("Tesseract OCR Error:", error);
      throw error;
    }
  }
}
