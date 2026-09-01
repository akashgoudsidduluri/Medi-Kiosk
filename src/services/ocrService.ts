/**
 * OCR Service Abstraction
 * 
 * TODO: Replace MockOCRService with RealOCRService when
 * actual Tesseract/Google Vision API is available.
 * 
 * Current implementation: MockOCRService
 * Interface: OCRService
 */

export interface OCRService {
  processDocument(file: File): Promise<OCRResult>;
  extractEntities(text: string): Promise<ExtractedEntities>;
}

export interface OCRResult {
  rawText: string;
  confidence: number;
  language: string;
}

export interface ExtractedEntities {
  date: string;
  medication: string;
  observation: string;
  diagnosis: string;
  confidence: {
    date: number;
    medication: number;
    observation: number;
  };
}

class MockOCRService implements OCRService {
  async processDocument(file: File): Promise<OCRResult> {
    // Simulate OCR processing time
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Generate realistic mock extracted text based on file type
    const mockTexts: Record<string, string> = {
      "application/pdf": `MEDICAL REPORT
Date: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
Patient: Demo Patient
Medication: Metformin 500mg BD, Amlodipine 5mg OD
Observation: Hb 11.1 g/dL, Fasting glucose 142 mg/dL
BP: 138/88 mmHg
Notes: Follow-up in 3 months`,
      "image/jpeg": `PRESCRIPTION
Date: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
Rx: Pantoprazole 40mg before breakfast x 4 weeks
     Domperidone 10mg TID before meals
     Antacid syrup 10ml TID PRN
Follow-up: 4 weeks`,
      "image/png": `LAB REPORT
Date: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
Hemoglobin: 11.1 g/dL
WBC: 8,200/mm³
Platelets: 2,40,000/mm³
Random glucose: 142 mg/dL
Creatinine: 0.9 mg/dL`,
    };

    const mimeType = file.type || "application/pdf";
    const rawText = mockTexts[mimeType] || mockTexts["application/pdf"];

    return {
      rawText,
      confidence: 0.89,
      language: "English",
    };
  }

  async extractEntities(text: string): Promise<ExtractedEntities> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Simple pattern matching for demo
    const dateMatch = text.match(/Date:\s*(.+)/);
    const medMatch = text.match(/Medication:\s*(.+)/);
    const obsMatch = text.match(/Observation:\s*(.+)/);

    return {
      date: dateMatch?.[1]?.trim() || "Not detected",
      medication: medMatch?.[1]?.trim() || "Not detected",
      observation: obsMatch?.[1]?.trim() || "Not detected",
      diagnosis: "Requires clinical verification",
      confidence: {
        date: dateMatch ? 0.88 : 0.45,
        medication: medMatch ? 0.92 : 0.40,
        observation: obsMatch ? 0.78 : 0.35,
      },
    };
  }
}

export const ocrService: OCRService = new MockOCRService();
