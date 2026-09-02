import { OcrService, OcrResult } from "./OcrService";
import * as Tesseract from "tesseract.js";

export class TesseractOcrService implements OcrService {
  isSupported(): boolean {
    return true; // Tesseract.js runs in browser via WebAssembly
  }

  async extractText(file: File): Promise<OcrResult> {
    try {
      if (!file.type.startsWith('image/')) {
        throw new Error("Only image files are supported by Tesseract in the browser currently.");
      }

      const result = await Tesseract.recognize(
        file,
        'eng',
        {
          logger: (m: any) => console.log(m)
        }
      );

      return {
        text: result.data.text,
        confidence: result.data.confidence,
        entities: {
          textLength: result.data.text.length,
          confidence: result.data.confidence,
        },
      };
    } catch (error) {
      console.error("Tesseract OCR Error:", error);
      throw error;
    }
  }
}
