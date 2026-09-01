/**
 * Triage Service Abstraction
 * 
 * Rule-based triage engine for prototype.
 * TODO: Replace with ML-based triage model when available.
 * 
 * Current implementation: MockTriageService
 * Interface: TriageService
 */

export interface TriageService {
  assessPriority(assessmentData: TriageInput): Promise<TriageOutput>;
  explainPriority(output: TriageOutput): Promise<Explainability>;
}

export interface TriageInput {
  chiefComplaint: string;
  severity: string;
  onset: string;
  associatedSymptoms: string;
  socrates: Record<string, string>;
  age: number;
  documents: Array<{
    extractedData: Record<string, string>;
  }>;
  timeline: Array<{
    description: string;
  }>;
}

export interface TriageOutput {
  priority: "routine" | "priority" | "urgent";
  reasons: string[];
  confidence: number;
  timestamp: string;
}

export interface Explainability {
  factors: Array<{
    factor: string;
    impact: "high" | "medium" | "low";
    description: string;
    detected: boolean;
  }>;
  overallConfidence: number;
  disclaimer: string;
}

class MockTriageService implements TriageService {
  async assessPriority(input: TriageInput): Promise<TriageOutput> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const reasons: string[] = [];
    let score = 0;

    // Rule 1: Symptom severity
    const severityMatch = input.severity.match(/(\d+)\/10/);
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

    // Rule 2: Associated symptoms
    const associatedSymptoms = input.associatedSymptoms.toLowerCase();
    const urgentKeywords = ["breathlessness", "sweating", "dizziness", "nausea", "vomiting", "radiation"];
    const urgentCount = urgentKeywords.filter((k) => associatedSymptoms.includes(k)).length;
    if (urgentCount >= 2) {
      score += 30;
      reasons.push("Multiple associated red-flag symptoms present");
    } else if (urgentCount === 1) {
      score += 15;
      reasons.push("Associated symptom requiring evaluation");
    }

    // Rule 3: Onset pattern
    const onset = input.onset.toLowerCase();
    if (onset.includes("sudden")) {
      score += 25;
      reasons.push("Sudden onset — requires immediate evaluation");
    } else if (onset.includes("worsening") || onset.includes("progressive")) {
      score += 15;
      reasons.push("Progressive/worsening symptom pattern");
    }

    // Rule 4: Previous history
    const hasRelevantHistory = input.timeline.some(
      (t) => t.description.toLowerCase().includes("hypertension") || 
             t.description.toLowerCase().includes("diabetes") ||
             t.description.toLowerCase().includes("cardiac")
    );
    if (hasRelevantHistory) {
      score += 15;
      reasons.push("Relevant medical history detected");
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

    // Calculate confidence
    const answeredFields = Object.values(input.socrates).filter((v) => v !== "").length;
    const confidence = Math.min(0.95, 0.6 + (answeredFields / 9) * 0.3);

    return {
      priority,
      reasons,
      confidence,
      timestamp: new Date().toISOString(),
    };
  }

  async explainPriority(output: TriageOutput): Promise<Explainability> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const factors = [
      {
        factor: "Symptom Severity",
        impact: "high" as const,
        description: "Based on patient-reported severity scale",
        detected: output.reasons.some((r) => r.toLowerCase().includes("severity")),
      },
      {
        factor: "Associated Symptoms",
        impact: "high" as const,
        description: "Presence of concurrent symptoms that may indicate urgency",
        detected: output.reasons.some((r) => r.toLowerCase().includes("associated")),
      },
      {
        factor: "Onset Pattern",
        impact: "medium" as const,
        description: "Whether symptoms appeared suddenly or gradually",
        detected: output.reasons.some((r) => r.toLowerCase().includes("onset")),
      },
      {
        factor: "Medical History",
        impact: "medium" as const,
        description: "Relevant pre-existing conditions from patient timeline",
        detected: output.reasons.some((r) => r.toLowerCase().includes("history")),
      },
      {
        factor: "Duration",
        impact: "low" as const,
        description: "How long the symptoms have been present",
        detected: output.reasons.some((r) => r.toLowerCase().includes("duration")),
      },
    ];

    return {
      factors,
      overallConfidence: output.confidence,
      disclaimer: "AI-assisted priority recommendation. Doctor verification required.",
    };
  }
}

export const triageService: TriageService = new MockTriageService();
