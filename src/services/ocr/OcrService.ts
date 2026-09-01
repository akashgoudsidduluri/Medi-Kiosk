export interface OcrResult {
  text: string;
  confidence: number;
}

export interface OcrService {
  /**
   * Extracts text from an image file.
   */
  extractText(file: File): Promise<OcrResult>;
  
  /**
   * Returns true if the service is currently supported/configured.
   */
  isSupported(): boolean;
}
