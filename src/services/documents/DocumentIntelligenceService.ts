import { DocumentAnalysis, DocumentType, ClinicalFact, ClinicalFactSource } from "@/types";

export interface IDocumentIntelligenceService {
  analyzeDocument(file: File, ocrText: string): Promise<DocumentAnalysis>;
}

const normalizeDocumentType = (raw: string): DocumentType => {
  const text = raw.toLowerCase();

  if (/prescription|rx|medicine|medication|drug/i.test(text)) return "prescription";
  if (/lab|laboratory|cbc|haemoglobin|bilirubin|glucose|report|panel|serum/i.test(text)) return "laboratory-report";
  if (/discharge|admission|discharged|follow-up|diagnosis/i.test(text)) return "discharge-summary";
  if (/consultation|clinical note|history|examination|assessment|plan/i.test(text)) return "consultation-note";
  if (/medical certificate|fit to work|sickness|certificate/i.test(text)) return "medical-certificate";
  if (/aadhaar|abha|government id|identity|passport|pan|voter/i.test(text)) return "identity-document";
  return "unknown";
};

const toConfidenceLevel = (score: number): "high" | "medium" | "low" => {
  if (score >= 0.8) return "high";
  if (score >= 0.5) return "medium";
  return "low";
};

const buildClinicalFact = (
  field: string,
  value: string,
  documentId: string,
  confidence = 0.6,
  source: ClinicalFactSource = "DOCUMENT"
): ClinicalFact => ({
  field,
  value,
  source,
  confidence,
  verified: false,
  timestamp: new Date().toISOString(),
  documentId,
});

const extractValueFromPatterns = (text: string, patterns: RegExp[]): string | undefined => {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) return match[1].trim();
  }
  return undefined;
};

const sanitizeMedicationName = (value: string): string | undefined => {
  const cleaned = value.trim().replace(/\s+/g, " ");
  if (!cleaned) return undefined;

  const tokens = cleaned.split(/\s+/);
  if (tokens.length > 1) {
    const [first, second] = tokens;
    if (/^(?:rx|prescription|medication|medications|medicine|medicines)$/i.test(first)) return undefined;
    if (/^(?:patient|age|gender|date|doctor|clinic|name|dob|diagnosis|complaint|c\/o)$/i.test(first)) return undefined;
    if (/^(?:CARD|ID|DOCUMENT)$/i.test(first) && /^(?:CARD|ID|DOCUMENT)$/i.test(second)) return undefined;
    if (/^(?:\d+|mg|mcg|g|ml|drops|tablet|tablets|tabs|cap|caps|tsp|tds|bd|od|q6h|bid|prn|hs|stat)$/i.test(second)) return first;
    if (first.toUpperCase() === first && second && /^(?:\d+|mg|mcg|g|ml|drops|tablet|tablets|tabs|cap|caps|tsp|tds|bd|od|q6h|bid|prn|hs|stat)$/i.test(second)) return first;
  }

  return cleaned;
};

const isAmbiguousMedicationLine = (line: string): boolean => {
  const low = line.toLowerCase();
  return /(?:levoun|bml|to[s]?\s*\d|\bto[s]?\b|\boff\b|\bml\b.*(?:to|off)|\bby\b)/i.test(low)
    && !/\b(?:calpol|crocin|paracetamol|amoxicillin|cetrizine|metformin|dolo|avil|delcon|levocetirizine|azithromycin)\b/i.test(low);
};

const extractMedicationLines = (text: string): Array<{ name?: string; strength?: string; dose?: string; route?: string; frequency?: string; duration?: string; instructions?: string; raw?: string; ambiguous?: boolean }> => {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const meds: Array<{ name?: string; strength?: string; dose?: string; route?: string; frequency?: string; duration?: string; instructions?: string; raw?: string; ambiguous?: boolean }> = [];

  for (const line of lines) {
    const low = line.toLowerCase();
    const isHeader = /^(?:rx|prescription|medications?|medicine|medicines)$/i.test(low);
    if (isHeader) continue;
    if (/^(?:patient|age|gender|date|doctor|clinic|reg\. no|reg no|name|dob|diagnosis|complaint|c\/o):?/i.test(low)) continue;

    const hasMedicationContext = /(medication|medicines|tablet|capsule|syrup|drop|injection|calpol|delcon|levolin|meftal|medicine|tab|tabs|dose)/i.test(low);
    const metadataLike = /^(?:patient|age|gender|date|doctor|clinic|reg(?:\.\s*no)?|name|dob|diagnosis|complaint|c\/o|rx|prescription|medication|medications|medicine|medicines|aadhaar|card)$/i.test(low);
    const firstToken = line.split(/\s+/)[0];
    const looksLikeMedicineName = /^[A-Z][A-Za-z0-9/()\-.]{2,}$/.test(firstToken) && !metadataLike;

    if (!hasMedicationContext && !looksLikeMedicineName) continue;

    let medicationName = extractValueFromPatterns(line, [
      /(?:medication|medicine|drug)\s*[:\-]?\s*([A-Za-z0-9 /()\-.]+)/i,
      /^([A-Z][A-Za-z0-9/()\-.]+(?:\s+[A-Z0-9/()\-.]+)*)\b/,
      /^([A-Z][A-Za-z0-9/()\-.]{2,})$/,
      /([A-Z][A-Za-z0-9 /()\-.]{2,})/,
    ]);

    if (!medicationName) {
      const firstToken = line.split(/\s+/)[0];
      if (/^[A-Z][A-Za-z0-9/()\-.]{2,}$/.test(firstToken) && !/^(?:rx|prescription|medication|medications|medicine|medicines|patient|age|gender|date|doctor|clinic|name|dob|diagnosis|complaint|c\/o|aadhaar|card)$/i.test(firstToken)) {
        medicationName = firstToken;
      }
    }

    const cleanedMedicationName = medicationName ? sanitizeMedicationName(medicationName) : undefined;
    if (!cleanedMedicationName || /^(?:rx|prescription|medication|medications|medicine|medicines|aadhaar|card)$/i.test(cleanedMedicationName)) continue;

    const strength = extractValueFromPatterns(line, [/([0-9]+\s*(?:mg|mcg|g|ml)\s*(?:\/\s*[0-9]+\s*(?:mg|mcg|g|ml))?)/i, /(\d+\s*(?:mg|ml|mcg|g)\s*(?:\/\s*\d+\s*(?:mg|ml|mcg|g))?)/i]);
    const dose = extractValueFromPatterns(line, [/((?:\d+\s*(?:ml|mg|drops|tablet|tabs|tsp|cap|caps))\b)/i, /(\d+\s*(?:-\s*\d+)?\s*(?:ml|mg|drops|tablet|tabs|tsp|cap|caps))\b/i]);
    const frequency = extractValueFromPatterns(line, [/(Q\d*H|BD|OD|SOS|TDS|BID|PRN|HS|stat)/i]);
    const duration = extractValueFromPatterns(line, [/(?:for|x)\s*(\d+\s*(?:day|days|week|weeks|month|months|d|w|m))\b/i]);
    const ambiguous = isAmbiguousMedicationLine(line);

    meds.push({
      name: cleanedMedicationName,
      strength: strength ?? undefined,
      dose: dose ?? undefined,
      frequency: frequency ?? undefined,
      duration: duration ?? undefined,
      instructions: line,
      raw: line,
      ambiguous,
    });
  }

  return meds;
};

const extractLabResults = (text: string) => {
  const results: Array<{ testName?: string; result?: string; unit?: string; referenceRange?: string; status?: "normal" | "abnormal" | "uncertain"; testDate?: string; raw?: string }> = [];
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

  for (const line of lines) {
    if (!/cbc|hb|wbc|platelet|creatinine|urea|glucose|bilirubin|alt|ast|tsh|thyroid|cholesterol|sugar|test/i.test(line)) continue;
    results.push({
      testName: line,
      result: line,
      raw: line,
      status: "uncertain",
    });
  }

  return results;
};

export class LocalDocumentIntelligenceService implements IDocumentIntelligenceService {
  async analyzeDocument(file: File, ocrText: string): Promise<DocumentAnalysis> {
    const text = ocrText.trim();
    const documentType = normalizeDocumentType(text || file.name);
    const identityDetected = /aadhaar|abha|government id|identity|passport|pan|voter/i.test(text || file.name);
    const classificationConfidence = identityDetected ? 0.9 : documentType === "unknown" ? 0.22 : 0.7;
    const classificationConfidenceLevel = toConfidenceLevel(classificationConfidence);
    const canExtractClinicalFacts = documentType !== "unknown" && !identityDetected;
    const medicationMatches = canExtractClinicalFacts ? extractMedicationLines(text) : [];
    const hasAmbiguousMedication = medicationMatches.some((med) => med.ambiguous);
    const reviewRequired = documentType === "unknown" || identityDetected || classificationConfidence < 0.6 || /\?/.test(text) || text.length < 40 || hasAmbiguousMedication;

    const patientName = canExtractClinicalFacts ? extractValueFromPatterns(text, [
      /(?:patient\s*(?:name)?\s*[:\-]|name\s*[:\-])\s*([A-Z][A-Za-z .'-]+)/i,
      /(?:mr\.|mrs\.|ms\.)\s*([A-Z][A-Za-z .'-]+)/i,
    ]) : undefined;

    const chiefComplaint = canExtractClinicalFacts ? extractValueFromPatterns(text, [
      /(?:chief complaint|complaint|presenting complaint)\s*[:\-]?\s*([A-Za-z0-9 ,;./()\-]+)/i,
      /(?:c\/o|complaint of)\s*([A-Za-z0-9 ,;./()\-]+)/i,
    ]) : undefined;

    const diagnosis = canExtractClinicalFacts ? extractValueFromPatterns(text, [
      /(?:diagnosis|assessment|impression|final diagnosis)\s*[:\-]?\s*([A-Za-z0-9 ,;./()\-]+)/i,
    ]) : undefined;

    const documentDate = canExtractClinicalFacts ? extractValueFromPatterns(text, [
      /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/,
      /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-zA-Z]*\s+\d{2,4})/,
    ]) : undefined;

    const structuredFacts: ClinicalFact[] = [];

    if (patientName) {
      structuredFacts.push(buildClinicalFact("patientName", patientName, file.name, 0.72));
    }
    if (documentDate) {
      structuredFacts.push(buildClinicalFact("documentDate", documentDate, file.name, 0.74));
    }
    if (chiefComplaint) {
      structuredFacts.push(buildClinicalFact("chiefComplaint", chiefComplaint, file.name, 0.68));
    }
    if (diagnosis) {
      structuredFacts.push(buildClinicalFact("diagnosis", diagnosis, file.name, 0.7));
    }

    for (const med of medicationMatches) {
      if (!med.raw || med.raw === "") continue;
      const factConfidence = med.ambiguous ? 0.34 : 0.62;
      structuredFacts.push(buildClinicalFact("medication", med.raw, file.name, factConfidence));
    }

    const labResults = canExtractClinicalFacts ? extractLabResults(text) : [];
    for (const lab of labResults) {
      if (lab.raw) structuredFacts.push(buildClinicalFact("labResult", lab.raw, file.name, 0.58));
    }

    const warnings: string[] = [];

    if (documentType === "unknown") {
      warnings.push("Document type is uncertain; verification is required before clinical use.");
    }
    if (identityDetected) {
      warnings.push("Identity document detected; no medical history should be inferred.");
    }
    if (documentType === "prescription" && medicationMatches.length > 0) {
      warnings.push("Medication details extracted from OCR require verification before being treated as final.");
    }
    if (hasAmbiguousMedication) {
      warnings.push("One or more medication lines are ambiguous and require manual review.");
    }
    if (documentType === "laboratory-report" && labResults.length > 0) {
      warnings.push("Lab values are reported as OCR evidence only and require a clinician to confirm their interpretation.");
    }

    const analysis: DocumentAnalysis = {
      documentType,
      classificationConfidence: classificationConfidence,
      classificationConfidenceLevel: classificationConfidenceLevel,
      reviewRequired,
      verificationStatus: reviewRequired ? "requires-review" : "verified",
      rawOcrText: text,
      ocrEngine: "tesseract",
      patient: patientName ? { name: patientName } : undefined,
      document: documentDate ? { documentDate } : undefined,
      clinical: {
        chiefComplaint: chiefComplaint ?? undefined,
        diagnosis: diagnosis ?? undefined,
        symptoms: chiefComplaint ? [chiefComplaint] : undefined,
      },
      medications: medicationMatches.filter((med) => med.raw).map((med) => ({
        name: med.name,
        strength: med.strength,
        dose: med.dose,
        route: med.route,
        frequency: med.frequency,
        duration: med.duration,
        instructions: med.instructions,
        raw: med.raw,
      })),
      labResults,
      structuredFacts,
      warnings: warnings.length > 0 ? warnings : undefined,
    };

    return analysis;
  }
}
