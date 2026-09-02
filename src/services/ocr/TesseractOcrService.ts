import { OcrService, OcrResult } from "./OcrService";
import * as Tesseract from "tesseract.js";

export class TesseractOcrService implements OcrService {
  isSupported(): boolean {
    return true; // Tesseract.js runs in browser via WebAssembly
  }

  private async loadImageElement(file: File): Promise<HTMLImageElement> {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(new Error("Failed to read image file for OCR preprocessing."));
      reader.readAsDataURL(file);
    });

    return await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Failed to decode uploaded image for OCR preprocessing."));
      image.src = dataUrl;
    });
  }

  private buildPreprocessedCanvas(image: HTMLImageElement, variant: "normal" | "enhanced" | "binary") {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not available in this browser context.");

    const width = Math.max(1200, Math.round(image.width * 1.5));
    const height = Math.max(1200, Math.round(image.height * 1.5));
    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);

    const drawWidth = image.width;
    const drawHeight = image.height;
    const offsetX = (width - drawWidth) / 2;
    const offsetY = (height - drawHeight) / 2;

    ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

    if (variant === "enhanced") {
      const imageData = ctx.getImageData(0, 0, width, height);
      const { data } = imageData;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        const contrast = gray > 127 ? gray + 28 : gray - 28;
        const adjusted = Math.min(255, Math.max(0, contrast));

        data[i] = adjusted;
        data[i + 1] = adjusted;
        data[i + 2] = adjusted;
      }

      ctx.putImageData(imageData, 0, 0);
    }

    if (variant === "binary") {
      const imageData = ctx.getImageData(0, 0, width, height);
      const { data } = imageData;

      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const threshold = gray > 180 ? 255 : 0;
        data[i] = threshold;
        data[i + 1] = threshold;
        data[i + 2] = threshold;
      }

      ctx.putImageData(imageData, 0, 0);
    }

    return canvas;
  }

  private async recognizeBestVariant(file: File): Promise<Tesseract.RecognizeResult> {
    const image = await this.loadImageElement(file);
    const variants = [
      this.buildPreprocessedCanvas(image, "normal"),
      this.buildPreprocessedCanvas(image, "enhanced"),
      this.buildPreprocessedCanvas(image, "binary"),
    ];

    let bestResult: Tesseract.RecognizeResult | null = null;
    let bestScore = Number.NEGATIVE_INFINITY;

    for (const variant of variants) {
      const result = await Tesseract.recognize(variant, "eng", {
        logger: () => undefined,
      });

      const score = (result.data.confidence ?? 0) + Math.min(result.data.text.length / 30, 20);
      if (score > bestScore || !bestResult) {
        bestResult = result;
        bestScore = score;
      }
    }

    if (!bestResult) {
      throw new Error("OCR failed to produce a readable result from the uploaded image.");
    }

    return bestResult;
  }

  async extractText(file: File): Promise<OcrResult> {
    try {
      if (!file.type.startsWith("image/")) {
        throw new Error("Only image files are supported by Tesseract in the browser currently.");
      }

      const result = await this.recognizeBestVariant(file);

      return {
        text: result.data.text,
        confidence: result.data.confidence,
        entities: {
          textLength: result.data.text.length,
          confidence: result.data.confidence,
          processing: "preprocessed-multi-pass",
        },
      };
    } catch (error) {
      console.error("Tesseract OCR Error:", error);
      throw error;
    }
  }
}
