import { ClinicalHistory, TriageResult } from "@/types";
import { TriageService } from "./TriageService";

export class LocalTriageService implements TriageService {
  async calculatePriority(history: ClinicalHistory): Promise<TriageResult> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const reasons: string[] = [];
    let score = 0;

    // Rule 1: Symptom severity
    if (history.severity) {
      const severityMatch = history.severity.match(/(\d+)\/10/);
      if (severityMatch) {
        const sevNum = parseInt(severityMatch[1]);
        if (sevNum >= 7) {
          score += 40;
          reasons.push(`High symptom severity detected (${sevNum}/10)`);
        } else if (sevNum >= 4) {
          score += 20;
          reasons.push(`Moderate symptom severity (${sevNum}/10)`);
        } else {
          score += 5;
          reasons.push(`Mild symptom severity (${sevNum}/10)`);
        }
      }
    }

    // Rule 2: Associated symptoms
    if (history.associatedSymptoms) {
      const associatedSymptoms = history.associatedSymptoms.toLowerCase();
      const urgentKeywords = ["breathlessness", "sweating", "dizziness", "nausea", "vomiting", "radiation"];
      const urgentCount = urgentKeywords.filter((k) => associatedSymptoms.includes(k)).length;
      if (urgentCount >= 2) {
        score += 30;
        reasons.push("Multiple associated red-flag symptoms present");
      } else if (urgentCount === 1) {
        score += 15;
        reasons.push("Associated symptom requiring evaluation");
      }
    }

    // Rule 3: Onset pattern
    if (history.onset) {
      const onset = history.onset.toLowerCase();
      if (onset.includes("sudden")) {
        score += 25;
        reasons.push("Sudden onset — requires immediate evaluation");
      } else if (onset.includes("worsening") || onset.includes("progressive")) {
        score += 15;
        reasons.push("Progressive/worsening symptom pattern");
      }
    }

    // Determine priority
    let priority: "routine" | "priority" | "urgent";
    if (score >= 60) {
      priority = "urgent";
    } else if (score >= 30) {
      priority = "priority";
    } else {
      priority = "routine";
    }

    // Calculate confidence (simple mock heuristic based on number of fields filled)
    const keys = ["chiefComplaint", "site", "onset", "character", "radiation", "associatedSymptoms", "timing", "exacerbatingFactors", "relievingFactors", "severity"];
    const answeredFields = keys.filter(k => history[k]).length;
    const confidence = Math.min(0.95, 0.6 + (answeredFields / 10) * 0.3);

    return {
      priority,
      reasons,
      confidence,
      timestamp: new Date().toISOString(),
    };
  }
}
