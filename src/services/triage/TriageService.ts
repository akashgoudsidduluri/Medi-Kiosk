import { ClinicalHistory, TriageResult } from "@/types";

export interface TriageService {
  calculatePriority(
    history: ClinicalHistory
  ): Promise<TriageResult>;
}
