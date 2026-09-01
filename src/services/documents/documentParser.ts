import { ClinicalFact, TimelineEvent } from "@/types";

export interface ParsedDocumentResult {
  extractedData: Record<string, string>;
  confidence: Record<string, number>;
  facts: ClinicalFact[];
  timelineEvents: TimelineEvent[];
  documentId: string;
}

const ensureUniqueFacts = (facts: ClinicalFact[]): ClinicalFact[] => {
  const seen = new Set<string>();
  return facts.filter((fact) => {
    const key = `${fact.documentId ?? "unknown"}:${fact.field}:${fact.value}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const pickValue = (values: string[]): string => {
  const cleaned = values.map((v) => v.trim()).filter(Boolean);
  return cleaned.length ? cleaned[0] : "Not detected";
};

const getDateValue = (text: string): { value: string; confidence: number; status: "exact" | "approximate" | "unknown" } => {
  const exactPatterns = [
    /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/,
    /(\d{4}[/-]\d{1,2}[/-]\d{1,2})/,
    /(\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-zA-Z]*\s+\d{2,4})/,
    /(\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{2,4})/,
    /(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-zA-Z]*\s+\d{1,2},?\s+\d{2,4}\b)/,
  ];

  for (const pattern of exactPatterns) {
    const match = text.match(pattern);
    if (match) {
      return { value: match[1].trim(), confidence: 0.85, status: "exact" };
    }
  }

  const approximatePatterns = [
    /(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-zA-Z]*\s+\d{4}\b)/,
    /(\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b)/,
    /(\b\d+\s+(?:day|days|week|weeks|month|months|year|years)\s+ago\b)/i,
  ];

  for (const pattern of approximatePatterns) {
    const match = text.match(pattern);
    if (match) {
      const rawValue = match[1]?.trim() ?? "Approximate date";
      const value = /ago/i.test(rawValue) ? `Approximate date (${rawValue})` : `~${rawValue}`;
      return { value, confidence: 0.55, status: "approximate" };
    }
  }

  return { value: "Date unavailable", confidence: 0, status: "unknown" };
};

const extractPatientName = (text: string): { value: string; confidence: number } => {
  const patterns = [
    /(?:Patient\s+(?:Name|name)|Name\s*[:\-])\s*([A-Z][A-Za-z .'-]+)/i,
    /(?:Patient\s*[:\-])\s*([A-Z][A-Za-z .'-]+)/i,
    /(?:Mr\.|Mrs\.|Ms\.|Dr\.)\s*([A-Z][A-Za-z .'-]+)/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return { value: match[1].trim(), confidence: 0.8 };
    }
  }

  return { value: "Not detected", confidence: 0 };
};

const collectMatches = (text: string, fieldMatcher: RegExp, maxEntries = 4): string[] => {
  const results: string[] = [];
  const seen = new Set<string>();

  text.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    if (fieldMatcher.test(trimmed)) {
      const normalized = trimmed.replace(fieldMatcher, "").trim();
      if (normalized && !seen.has(normalized)) {
        seen.add(normalized);
        results.push(normalized);
      }
    }
  });

  if (results.length === 0) {
    const globalRegex = new RegExp(
      fieldMatcher.source,
      fieldMatcher.flags.includes("g") ? fieldMatcher.flags : `${fieldMatcher.flags}g`
    );

    const matches = Array.from(text.matchAll(globalRegex)).map((match) => match[1]?.trim() ?? match[0]?.trim() ?? "").filter(Boolean);
    matches.forEach((item) => {
      if (!seen.has(item)) {
        seen.add(item);
        results.push(item);
      }
    });
  }

  return results.slice(0, maxEntries);
};

export function parseDocumentText(rawText: string, documentId: string): ParsedDocumentResult {
  const text = rawText.trim();
  const dateInfo = getDateValue(text);
  const patientInfo = extractPatientName(text);

  const complaintPatterns = [
    /(?:chief complaint|complaint|symptom|symptoms|presenting complaint)\s*[:\-]?\s*([A-Za-z0-9 ,.;/-]+)/i,
    /(?:pain|fever|cough|bleeding|swelling|nausea|vomiting|breathlessness|headache)\s*(?:for|since|with)?\s*[:\-]?\s*([A-Za-z0-9 ,.;/-]+)/i,
  ];

  const chiefComplaint = complaintPatterns
    .map((pattern) => text.match(pattern)?.[1])
    .filter(Boolean)
    .map((part) => part?.trim())
    .find(Boolean) || "Not detected";

  const diagnosisMatches = collectMatches(
    text,
    /(?:Diagnosis|Diagnosed|Impression|Assessment|Final Diagnosis|Provisional Diagnosis)\s*[:\-]\s*(.*)/i,
    3
  );

  const medicationMatches = collectMatches(
    text,
    /(?:Medication|Medications|Prescription|Rx|Tablet|Tablets|Capsule|Capsules|Syrup|Injection|Dose|Drug)\s*[:\-]\s*(.*)/i,
    4
  );

  const allergyMatches = collectMatches(
    text,
    /(?:Allergy|Allergies|Sensitivity|Sensitive to)\s*[:\-]\s*(.*)/i,
    3
  );

  const investigationMatches = collectMatches(
    text,
    /(?:Investigation|Investigations|Test|Tests|ECG|CBC|X-Ray|XRAY|MRI|CT|USG|Blood Test|Lab Report|Lab)\s*[:\-]?\s*(.*)/i,
    4
  );

  const observationMatches = collectMatches(
    text,
    /(?:Observation|Observations|Result|Results|Finding|Findings|Hb|WBC|RBC|Platelet|Glucose|Creatinine|Hemoglobin|BP|Blood Pressure)\s*[:\-]?\s*(.*)/i,
    6
  );

  const procedureMatches = collectMatches(
    text,
    /(?:Procedure|Procedures|Surgery|Operated|Intervention)\s*[:\-]\s*(.*)/i,
    3
  );

  const historyMatches = collectMatches(
    text,
    /(?:Past Medical History|PMH|History of|Relevant medical history|Medical History)\s*[:\-]\s*(.*)/i,
    4
  );

  const extractedData: Record<string, string> = {
    patientName: patientInfo.value,
    date: dateInfo.value,
    chiefComplaint: chiefComplaint,
    diagnosis: pickValue(diagnosisMatches),
    medications: pickValue(medicationMatches),
    allergies: pickValue(allergyMatches),
    investigations: pickValue(investigationMatches),
    observation: pickValue(observationMatches),
    procedures: pickValue(procedureMatches),
    history: pickValue(historyMatches),
  };

  const confidence: Record<string, number> = {
    patientName: patientInfo.confidence,
    date: dateInfo.confidence,
    chiefComplaint: chiefComplaint !== "Not detected" ? 0.7 : 0,
    diagnosis: diagnosisMatches.length ? 0.75 : 0,
    medications: medicationMatches.length ? 0.8 : 0,
    allergies: allergyMatches.length ? 0.8 : 0,
    investigations: investigationMatches.length ? 0.7 : 0,
    observation: observationMatches.length ? 0.72 : 0,
    procedures: procedureMatches.length ? 0.72 : 0,
    history: historyMatches.length ? 0.7 : 0,
  };

  const facts: ClinicalFact[] = [
    { field: "patientName", value: extractedData.patientName, source: "DOCUMENT" as const, confidence: confidence.patientName, verified: false, timestamp: new Date().toISOString(), documentId },
    { field: "date", value: extractedData.date, source: "DOCUMENT" as const, confidence: confidence.date, verified: false, timestamp: new Date().toISOString(), documentId },
    { field: "chiefComplaint", value: extractedData.chiefComplaint, source: "DOCUMENT" as const, confidence: confidence.chiefComplaint, verified: false, timestamp: new Date().toISOString(), documentId },
    { field: "diagnosis", value: extractedData.diagnosis, source: "DOCUMENT" as const, confidence: confidence.diagnosis, verified: false, timestamp: new Date().toISOString(), documentId },
    { field: "medications", value: extractedData.medications, source: "DOCUMENT" as const, confidence: confidence.medications, verified: false, timestamp: new Date().toISOString(), documentId },
    { field: "allergies", value: extractedData.allergies, source: "DOCUMENT" as const, confidence: confidence.allergies, verified: false, timestamp: new Date().toISOString(), documentId },
    { field: "investigations", value: extractedData.investigations, source: "DOCUMENT" as const, confidence: confidence.investigations, verified: false, timestamp: new Date().toISOString(), documentId },
    { field: "observation", value: extractedData.observation, source: "DOCUMENT" as const, confidence: confidence.observation, verified: false, timestamp: new Date().toISOString(), documentId },
    { field: "procedures", value: extractedData.procedures, source: "DOCUMENT" as const, confidence: confidence.procedures, verified: false, timestamp: new Date().toISOString(), documentId },
    { field: "pastMedicalHistory", value: extractedData.history, source: "DOCUMENT" as const, confidence: confidence.history, verified: false, timestamp: new Date().toISOString(), documentId },
  ].filter((fact) => fact.value && fact.value !== "Not detected") as ClinicalFact[];

  const dedupedFacts = ensureUniqueFacts(facts);
  const dateFactValue = dateInfo.status === "unknown" ? "Date unavailable" : dateInfo.value;

  const dateAwareFacts: ClinicalFact[] = [...dedupedFacts];
  const dateFactIndex = dateAwareFacts.findIndex((fact) => fact.field === "date");
  if (dateFactIndex >= 0) {
    dateAwareFacts[dateFactIndex] = {
      ...dateAwareFacts[dateFactIndex],
      value: dateFactValue,
      confidence: dateInfo.confidence,
    };
  } else {
    dateAwareFacts.push({
      field: "date",
      value: dateFactValue,
      source: "DOCUMENT",
      confidence: dateInfo.confidence,
      verified: false,
      timestamp: new Date().toISOString(),
      documentId,
    });
  }

  const ensureUniqueTimelineEvents = (events: TimelineEvent[]): TimelineEvent[] => {
    const seen = new Set<string>();
    return events.filter((event) => {
      const key = `${event.date}:${event.title}:${event.description}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const timelineEvents: TimelineEvent[] = [];

  if (dateInfo.status !== "unknown") {
    const addEvent = (field: string, eventType: TimelineEvent["type"], title: string, description: string) => {
      const value = dateAwareFacts.find((fact) => fact.field === field)?.value;
      if (!value || value === "Not detected") return;
      timelineEvents.push({
        id: `${documentId}-${field}`,
        date: dateInfo.value,
        title,
        description,
        type: eventType,
        source: "DOCUMENT",
      });
    };

    addEvent(
      "medications",
      "medication",
      "Medication",
      `Medication recorded: ${dateAwareFacts.find((fact) => fact.field === "medications")?.value}`
    );

    addEvent(
      "investigations",
      "lab",
      "Investigation",
      `Investigation recorded: ${dateAwareFacts.find((fact) => fact.field === "investigations")?.value}`
    );

    addEvent(
      "diagnosis",
      "observation",
      "Assessment",
      `Diagnosis recorded: ${dateAwareFacts.find((fact) => fact.field === "diagnosis")?.value}`
    );

    addEvent(
      "procedures",
      "observation",
      "Procedure",
      `Procedure recorded: ${dateAwareFacts.find((fact) => fact.field === "procedures")?.value}`
    );

    addEvent(
      "chiefComplaint",
      "observation",
      "Consultation",
      `Clinical complaint recorded: ${dateAwareFacts.find((fact) => fact.field === "chiefComplaint")?.value}`
    );
  }

  return {
    extractedData: {
      ...extractedData,
      date: dateFactValue,
    },
    confidence,
    facts: dateAwareFacts,
    timelineEvents: ensureUniqueTimelineEvents(timelineEvents),
    documentId,
  };
}
