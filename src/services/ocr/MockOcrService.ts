import { OcrService, OcrResult } from "./OcrService";

export class MockOcrService implements OcrService {
  isSupported(): boolean {
    return true; // Mock is always supported
  }

  async extractText(file: File): Promise<OcrResult> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // For demo purposes, we return a simulated extraction based on filename
    const filename = file.name.toLowerCase();
    
    if (filename.includes("prescription") || filename.includes("rx")) {
      return {
        text: "Rx\nDr. Smith\n\nPatient: John Doe\n\nMedication: Amoxicillin 500mg\nTake 1 tablet every 8 hours for 7 days.\n\nDate: 2026-08-15",
        confidence: 95,
      };
    }
    
    if (filename.includes("lab") || filename.includes("report")) {
      return {
        text: "LABORATORY REPORT\n\nComplete Blood Count (CBC)\n\nHemoglobin: 13.5 g/dL (Normal)\nWBC: 8.5 x10^3/uL (Normal)\nPlatelets: 250 x10^3/uL (Normal)\n\nFasting Blood Sugar: 105 mg/dL (Borderline High)",
        confidence: 92,
      };
    }

    // Default mock response
    return {
      text: "Simulated extracted medical text.\nDate: 2026-09-01\nDiagnosis: Mild Hypertension\nRecommendation: Monitor BP and reduce sodium intake.",
      confidence: 88,
    };
  }
}
