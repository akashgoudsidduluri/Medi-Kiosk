import { OcrService, OcrResult } from "./OcrService";

export class MockOcrService implements OcrService {
  isSupported(): boolean {
    return true; // Mock is always supported
  }

  async extractText(file: File): Promise<OcrResult> {
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const filename = file.name.toLowerCase();
    const defaultText = `Patient Name: Demo Patient\nDate: 2026-09-01\nChief Complaint: Chest pain for 3 days\nInvestigation: ECG\nObservation: Normal\nMedication: Aspirin 75 mg daily`;

    if (filename.includes("prescription") || filename.includes("rx")) {
      return {
        text: "Rx\nDr. Smith\n\nPatient Name: John Doe\n\nMedication: Amoxicillin 500mg\nTake 1 tablet every 8 hours for 7 days.\n\nDate: 2026-08-15",
        confidence: 95,
        entities: { patientName: "John Doe", medication: "Amoxicillin 500mg", date: "2026-08-15" },
      };
    }

    if (filename.includes("lab") || filename.includes("report")) {
      return {
        text: "LABORATORY REPORT\n\nComplete Blood Count (CBC)\n\nHemoglobin: 13.5 g/dL (Normal)\nWBC: 8.5 x10^3/uL (Normal)\nPlatelets: 250 x10^3/uL (Normal)\n\nFasting Blood Sugar: 105 mg/dL (Borderline High)",
        confidence: 92,
        entities: { investigation: "CBC", observation: "Hemoglobin 13.5 g/dL" },
      };
    }

    return {
      text: defaultText,
      confidence: 88,
      entities: { patientName: "Demo Patient", chiefComplaint: "Chest pain for 3 days" },
    };
  }
}
