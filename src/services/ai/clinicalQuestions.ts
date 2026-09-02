/**
 * Complaint-specific question plans and field definitions.
 * The QuestionPlanner uses these to determine what to ask and in what order.
 *
 * Each complaint has:
 * - fields: ordered list of clinical fields to collect
 * - required: subset of fields that MUST be collected (or explicitly marked unknown)
 * - questions: patient-friendly question text per field
 */

export type ComplaintType =
  | "chest_pain"
  | "abdominal_pain"
  | "headache"
  | "fever"
  | "cough_breathlessness"
  | "general";

export interface QuestionDefinition {
  field: string;
  question: string;
  hint?: string; // contextual hint, e.g. from document
}

export interface ComplaintQuestionPlan {
  type: ComplaintType;
  fields: string[];
  required: string[];
  questions: Record<string, string>;
}

// ── Chest Pain ────────────────────────────────────────────────────────────────
const chestPainPlan: ComplaintQuestionPlan = {
  type: "chest_pain",
  fields: [
    "site",
    "onset",
    "duration",
    "character",
    "severity",
    "radiation",
    "associatedSymptoms",
    "aggravatingFactors",
    "relievingFactors",
    "timing",
    "pastMedicalHistory",
    "medications",
    "allergies",
    "familyHistory",
    "personalHistory",
  ],
  required: ["site", "onset", "character", "severity", "radiation", "associatedSymptoms", "aggravatingFactors", "relievingFactors"],
  questions: {
    site: "Where exactly do you feel the pain in your chest?",
    onset: "When did the chest pain start?",
    duration: "How long has the pain been going on?",
    character: "How would you describe the pain — is it sharp, dull, crushing, or burning?",
    severity: "On a scale of 0 to 10, how severe is the chest pain right now?",
    radiation: "Does the pain spread anywhere — like your arm, jaw, or back?",
    associatedSymptoms: "Are you experiencing any other symptoms like breathlessness, sweating, or nausea?",
    aggravatingFactors: "Does anything make the pain worse?",
    relievingFactors: "Does anything make the pain better, like rest or medication?",
    timing: "When does the chest pain tend to happen?",
    pastMedicalHistory: "Do you have any past medical conditions like heart disease or high blood pressure?",
    medications: "Are you currently taking any medications?",
    allergies: "Do you have any known allergies to medications?",
    familyHistory: "Does anyone in your family have heart disease?",
    personalHistory: "Do you smoke, or have any other habits we should note?",
  },
};

// ── Abdominal Pain ────────────────────────────────────────────────────────────
const abdominalPainPlan: ComplaintQuestionPlan = {
  type: "abdominal_pain",
  fields: [
    "site",
    "onset",
    "duration",
    "character",
    "severity",
    "radiation",
    "associatedSymptoms",
    "aggravatingFactors",
    "relievingFactors",
    "pastMedicalHistory",
    "medications",
    "allergies",
    "familyHistory",
  ],
  required: ["site", "onset", "character", "severity", "associatedSymptoms"],
  questions: {
    site: "Where exactly in your abdomen do you feel the pain?",
    onset: "When did the abdominal pain start?",
    duration: "How long has the pain been going on?",
    character: "How would you describe the pain — cramping, burning, or constant?",
    severity: "On a scale of 0 to 10, how severe is the abdominal pain?",
    radiation: "Does the pain spread to your back or anywhere else?",
    associatedSymptoms: "Are you experiencing vomiting, diarrhea, constipation, or fever?",
    aggravatingFactors: "Does eating or any specific food make the pain worse?",
    relievingFactors: "Does anything make the pain better?",
    pastMedicalHistory: "Have you had any abdominal surgeries or conditions in the past?",
    medications: "Are you currently taking any medications?",
    allergies: "Do you have any known allergies?",
    familyHistory: "Does anyone in your family have similar abdominal or digestive problems?",
  },
};

// ── Headache ──────────────────────────────────────────────────────────────────
const headachePlan: ComplaintQuestionPlan = {
  type: "headache",
  fields: [
    "site",
    "onset",
    "duration",
    "severity",
    "character",
    "associatedSymptoms",
    "aggravatingFactors",
    "relievingFactors",
    "pastMedicalHistory",
    "medications",
    "allergies",
  ],
  required: ["site", "onset", "severity", "character", "associatedSymptoms"],
  questions: {
    site: "Where exactly in your head do you feel the pain?",
    onset: "When did the headache start — was it sudden or gradual?",
    duration: "How long have you had this headache?",
    severity: "On a scale of 0 to 10, how severe is the headache?",
    character: "How would you describe the pain — throbbing, pressure, or stabbing?",
    associatedSymptoms: "Are you experiencing nausea, vomiting, sensitivity to light, or blurred vision?",
    aggravatingFactors: "Does anything make the headache worse, like bright lights or movement?",
    relievingFactors: "Does anything help relieve the headache?",
    pastMedicalHistory: "Have you had similar headaches before or any neurological conditions?",
    medications: "Are you taking any medications for the headache?",
    allergies: "Do you have any known allergies?",
  },
};

// ── Fever ─────────────────────────────────────────────────────────────────────
const feverPlan: ComplaintQuestionPlan = {
  type: "fever",
  fields: [
    "onset",
    "duration",
    "severity",
    "associatedSymptoms",
    "aggravatingFactors",
    "relievingFactors",
    "timing",
    "pastMedicalHistory",
    "medications",
    "allergies",
  ],
  required: ["onset", "duration", "associatedSymptoms"],
  questions: {
    onset: "When did the fever start?",
    duration: "How long have you had the fever?",
    severity: "Do you know what your temperature was? If not, how high did it feel?",
    associatedSymptoms: "Are you experiencing chills, sweating, body pain, cough, or rash?",
    aggravatingFactors: "Have you been in contact with anyone who was unwell recently, or traveled anywhere?",
    relievingFactors: "Have you taken any medication to bring the fever down?",
    timing: "Is the fever constant, or does it come and go?",
    pastMedicalHistory: "Do you have any medical conditions that affect your immune system?",
    medications: "Are you currently taking any regular medications?",
    allergies: "Do you have any known allergies?",
  },
};

// ── Cough / Breathlessness ────────────────────────────────────────────────────
const coughBreathlessnessPlan: ComplaintQuestionPlan = {
  type: "cough_breathlessness",
  fields: [
    "onset",
    "duration",
    "severity",
    "character",
    "associatedSymptoms",
    "aggravatingFactors",
    "relievingFactors",
    "pastMedicalHistory",
    "medications",
    "allergies",
    "personalHistory",
  ],
  required: ["onset", "duration", "character", "associatedSymptoms"],
  questions: {
    onset: "When did the cough or breathing difficulty start?",
    duration: "How long have you had this problem?",
    severity: "How much is it affecting you on a scale of 0 to 10?",
    character: "Is the cough dry, or are you bringing up sputum? Any blood?",
    associatedSymptoms: "Are you experiencing chest pain, fever, or wheezing?",
    aggravatingFactors: "Does anything make it worse — like exercise, cold air, or lying down?",
    relievingFactors: "Does anything help, like an inhaler or sitting up?",
    pastMedicalHistory: "Do you have asthma, COPD, or any lung conditions?",
    medications: "Are you using any inhalers or taking any medications?",
    allergies: "Do you have any known allergies?",
    personalHistory: "Do you smoke, or have you been exposed to dust or fumes?",
  },
};

// ── General ───────────────────────────────────────────────────────────────────
const generalPlan: ComplaintQuestionPlan = {
  type: "general",
  fields: [
    "site",
    "onset",
    "duration",
    "character",
    "severity",
    "associatedSymptoms",
    "aggravatingFactors",
    "relievingFactors",
    "pastMedicalHistory",
    "medications",
    "allergies",
    "familyHistory",
    "personalHistory",
  ],
  required: ["onset", "severity", "associatedSymptoms"],
  questions: {
    site: "Where exactly is the problem or discomfort?",
    onset: "When did this problem start?",
    duration: "How long have you been experiencing this?",
    character: "How would you describe what you are feeling?",
    severity: "On a scale of 0 to 10, how much is it affecting you?",
    associatedSymptoms: "Are there any other symptoms you have noticed?",
    aggravatingFactors: "Does anything make it worse?",
    relievingFactors: "Does anything make it better?",
    pastMedicalHistory: "Do you have any existing medical conditions?",
    medications: "Are you taking any medications?",
    allergies: "Do you have any known allergies?",
    familyHistory: "Does anyone in your family have similar problems?",
    personalHistory: "Do you smoke, drink alcohol, or have other habits we should note?",
  },
};

// ── Registry ──────────────────────────────────────────────────────────────────
const plans: ComplaintQuestionPlan[] = [
  chestPainPlan,
  abdominalPainPlan,
  headachePlan,
  feverPlan,
  coughBreathlessnessPlan,
  generalPlan,
];

/**
 * Detect the complaint type from a free-text chief complaint.
 */
export function detectComplaintType(complaint: string): ComplaintType {
  const lc = complaint.toLowerCase();
  if (/chest\s?pain|cardiac|heart|छाती|सीने|గుండె|ఛాతీ/.test(lc)) return "chest_pain";
  if (/abdom|stomach|belly|gut|bowel|nausea|vomit|पेट|కడుపు/.test(lc)) return "abdominal_pain";
  if (/head\s?ache|migraine|head\s?pain|सिर.?दर्द|తలనొప్పి/.test(lc)) return "headache";
  if (/fever|temperature|pyrexia|chills|बुखार|జ్వరం/.test(lc)) return "fever";
  if (/cough|breath|wheez|dyspnoe|respiratory|खांसी|सांस|దగ్గు|ఊపిరి/.test(lc)) return "cough_breathlessness";
  return "general";
}

/**
 * Get the question plan for a complaint type.
 */
export function getQuestionPlan(type: ComplaintType): ComplaintQuestionPlan {
  return plans.find((p) => p.type === type) ?? generalPlan;
}
