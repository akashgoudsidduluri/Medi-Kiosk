export interface DemoScenario {
  id: string;
  name: string;
  priority: "routine" | "priority" | "urgent";
  patient: {
    name: string;
    age: number;
    gender: string;
    language: string;
    mobileNumber: string;
    abhaId: string;
  };
  chiefComplaint: string;
  socrates: {
    site: string;
    onset: string;
    character: string;
    radiation: string;
    associatedSymptoms: string;
    timing: string;
    exacerbatingFactors: string;
    relievingFactors: string;
    severity: string;
  };
  ayush: {
    prakriti: string;
    vikriti: string;
    sara: string;
    samhanana: string;
    pramana: string;
    satmya: string;
    satva: string;
    aharaShakti: string;
    vyayamaShakti: string;
    vaya: string;
  };
  documents: {
    id: string;
    fileName: string;
    fileType: string;
    extractedData: {
      date: string;
      medication: string;
      observation: string;
    };
    confidence: {
      date: number;
      medication: number;
      observation: number;
    };
  }[];
  timeline: {
    id: string;
    date: string;
    title: string;
    description: string;
    type: "consultation" | "medication" | "investigation" | "assessment";
  }[];
  triage: {
    priority: "routine" | "priority" | "urgent";
    reasons: string[];
    confidence: number;
    timestamp?: string;
  };
}

export const demoScenarios: Record<string, DemoScenario> = {
  routine: {
    id: "routine-001",
    name: "Routine Assessment",
    priority: "routine",
    patient: {
      name: "Suresh Rao",
      age: 31,
      gender: "Male",
      language: "English",
      mobileNumber: "9876543210",
      abhaId: "ABHA-DEMO-789012",
    },
    chiefComplaint: "Mild joint pain in right knee for 2 weeks",
    socrates: {
      site: "Right knee, medial aspect",
      onset: "Gradual, 2 weeks ago",
      character: "Dull, aching pain",
      radiation: "No radiation",
      associatedSymptoms: "Mild stiffness in the morning, no swelling",
      timing: "Worse in the morning, improves with activity",
      exacerbatingFactors: "Prolonged sitting, climbing stairs",
      relievingFactors: "Warm compress, light exercise",
      severity: "3/10 — Mild discomfort",
    },
    ayush: {
      prakriti: "Vata-Pitta",
      vikriti: "Vata predominant",
      sara: "Lax (Sthula Sara)",
      samhanana: "Medium (Madhyama Samhanana)",
      pramana: "Medium (Madhyama Pramana)",
      satmya: "Partial adaptation (Partial Satmya)",
      satva: "Middle (Madhyama Satva)",
      aharaShakti: "Medium (Madhyama Ahara Shakti)",
      vyayamaShakti: "Medium (Madhyama Vyayama Shakti)",
      vaya: "Young adult (Taruna Kala)",
    },
    documents: [
      {
        id: "doc-001",
        fileName: "Blood_Test_Report.pdf",
        fileType: "application/pdf",
        extractedData: {
          date: "15 Jul 2026",
          medication: "None reported",
          observation: "ESR 18 mm/hr — Normal range",
        },
        confidence: {
          date: 94,
          medication: 88,
          observation: 82,
        },
      },
    ],
    timeline: [
      {
        id: "tl-001",
        date: "2024-03-15",
        title: "Initial Consultation",
        description: "Routine health checkup. No significant findings.",
        type: "consultation",
      },
      {
        id: "tl-002",
        date: "2025-06-20",
        title: "Follow-up Visit",
        description: "Mild knee discomfort reported. Advised physiotherapy.",
        type: "consultation",
      },
      {
        id: "tl-003",
        date: "2026-07-15",
        title: "Blood Investigation",
        description: "Routine blood work. All parameters within normal limits.",
        type: "investigation",
      },
    ],
  triage: {
    priority: "routine" as const,
    reasons: [
      "Mild symptom severity (3/10)",
      "No red-flag indicators present",
      "Gradual onset without alarming features",
      "No associated systemic symptoms",
    ],
    confidence: 88,
    timestamp: new Date().toISOString(),
  },
  },
  priority: {
    id: "priority-001",
    name: "Priority Assessment",
    priority: "priority",
    patient: {
      name: "Ravi Kumar",
      age: 43,
      gender: "Male",
      language: "Hindi",
      mobileNumber: "9876543211",
      abhaId: "ABHA-DEMO-345678",
    },
    chiefComplaint: "Abdominal discomfort with bloating for 3 months, worsening",
    socrates: {
      site: "Epigastric region, extending to left hypochondrium",
      onset: "Gradual onset 3 months ago, worsening over last 2 weeks",
      character: "Heavy, pressing sensation with intermittent cramping",
      radiation: "To the left flank",
      associatedSymptoms: "Bloating, occasional nausea, reduced appetite, mild weight loss",
      timing: "Persistent, worse after meals",
      exacerbatingFactors: "Spicy food, heavy meals, stress",
      relievingFactors: "Antacids provide temporary relief, lying on left side",
      severity: "6/10 — Moderate to significant discomfort",
    },
    ayush: {
      prakriti: "Pitta-Kapha",
      vikriti: "Pitta predominant with Kapha accumulation",
      sara: "Dense (Sthira Sara)",
      samhanana: "Dense (Sakrit Samhanana)",
      pramana: "Medium (Madhyama Pramana)",
      satmya: "Poor adaptation (Alpa Satmya)",
      satva: "Middle (Madhyama Satva)",
      aharaShakti: "Reduced (Hina Ahara Shakti)",
      vyayamaShakti: "Reduced (Hina Vyayama Shakti)",
      vaya: "Middle age (Madhyayu Kala)",
    },
    documents: [
      {
        id: "doc-002",
        fileName: "USG_Abdomen.pdf",
        fileType: "application/pdf",
        extractedData: {
          date: "20 Jul 2026",
          medication: "Pantoprazole 40mg OD, Domperidone 10mg TID",
          observation: "Mild hepatomegaly, no free fluid, pancreas normal",
        },
        confidence: {
          date: 92,
          medication: 89,
          observation: 78,
        },
      },
      {
        id: "doc-003",
        fileName: "Liver_Function_Test.pdf",
        fileType: "application/pdf",
        extractedData: {
          date: "20 Jul 2026",
          medication: "None",
          observation: "SGOT 48 U/L (↑), SGPT 52 U/L (↑), ALP 98 U/L",
        },
        confidence: {
          date: 90,
          medication: 85,
          observation: 75,
        },
      },
    ],
    timeline: [
      {
        id: "tl-004",
        date: "2024-01-10",
        title: "Initial Consultation",
        description: "Epigastric discomfort. Diagnosed with mild gastritis.",
        type: "consultation",
      },
      {
        id: "tl-005",
        date: "2024-06-15",
        title: "Follow-up",
        description: "Symptoms improved with Pantoprazole. Continued medication.",
        type: "medication",
      },
      {
        id: "tl-006",
        date: "2025-02-20",
        title: "Annual Checkup",
        description: "Mild elevation in liver enzymes. Advised dietary modifications.",
        type: "investigation",
      },
      {
        id: "tl-007",
        date: "2026-07-20",
        title: "Current Assessment",
        description: "Worsening symptoms. Ultrasound and LFT ordered.",
        type: "assessment",
      },
    ],
  triage: {
    priority: "priority" as const,
    reasons: [
      "Worsening symptoms over 3 months",
      "Moderate severity (6/10)",
      "Elevated liver enzymes detected",
      "Weight loss reported — requires further evaluation",
      "Symptoms not responding adequately to current medication",
    ],
    confidence: 82,
    timestamp: new Date().toISOString(),
  },
  },
  urgent: {
    id: "urgent-001",
    name: "Urgent Assessment",
    priority: "urgent",
    patient: {
      name: "Anita Sharma",
      age: 52,
      gender: "Female",
      language: "Hindi",
      mobileNumber: "9876543212",
      abhaId: "ABHA-DEMO-901234",
    },
    chiefComplaint: "Chest discomfort with breathlessness since this morning",
    socrates: {
      site: "Retrosternal, radiating to left arm and jaw",
      onset: "Sudden onset this morning at 6:30 AM",
      character: "Tight, crushing sensation",
      radiation: "Left arm, jaw, and between shoulder blades",
      associatedSymptoms: "Breathlessness, profuse sweating, dizziness, nausea",
      timing: "Persistent for 2 hours, worsening",
      exacerbatingFactors: "Any physical activity, emotional stress",
      relievingFactors: "None — symptoms not relieved by rest",
      severity: "8/10 — Severe, debilitating pain",
    },
    ayush: {
      prakriti: "Vata-Pitta",
      vikriti: "Vata aggravated with Pitta influence",
      sara: "Lax (Sthula Sara)",
      samhanana: "Dense (Sakrit Samhanana)",
      pramana: "Large (Brihat Pramana)",
      satmya: "Poor adaptation (Alpa Satmya)",
      satva: "Weak (Hina Satva)",
      aharaShakti: "Variable — history of irregular eating",
      vyayamaShakti: "Reduced — sedentary lifestyle",
      vaya: "Middle age (Madhyayu Kala)",
    },
    documents: [
      {
        id: "doc-004",
        fileName: "ECG_Report.pdf",
        fileType: "application/pdf",
        extractedData: {
          date: "01 Aug 2026",
          medication: "Aspirin 325mg stat, Atorvastatin 40mg, Metoprolol 50mg",
          observation: "ST elevation in leads II, III, aVF — Possible inferior STEMI",
        },
        confidence: {
          date: 96,
          medication: 91,
          observation: 88,
        },
      },
    ],
    timeline: [
      {
        id: "tl-008",
        date: "2023-05-10",
        title: "Cardiac Risk Assessment",
        description: "Hypertension diagnosed. Started on Amlodipine 5mg.",
        type: "consultation",
      },
      {
        id: "tl-009",
        date: "2024-08-15",
        title: "Follow-up",
        description: "BP controlled on medication. Blood sugar borderline.",
        type: "medication",
      },
      {
        id: "tl-010",
        date: "2025-11-20",
        title: "Annual Cardiac Check",
        description: "ECG normal. Lipid profile: Total cholesterol 240 mg/dL (↑).",
        type: "investigation",
      },
      {
        id: "tl-011",
        date: "2026-08-01",
        title: "Emergency Assessment",
        description: "Acute chest pain with ECG changes. Critical priority.",
        type: "assessment",
      },
    ],
    triage: {
      priority: "urgent" as const,
      reasons: [
        "Potential red-flag indicators detected: chest pain + breathlessness",
        "Severe symptom intensity (8/10)",
        "ECG changes suggestive of acute cardiac event",
        "Risk factors: Hypertension, elevated lipids, age >50",
        "Symptoms not relieved by rest — immediate medical attention required",
      ],
      confidence: 94,
      timestamp: new Date().toISOString(),
    },
  },
};

export const languages = [
  { code: "en", name: "English", native: "English" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", native: "മലയാളം" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "mr", name: "Marathi", native: "मराठी" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "or", name: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "as", name: "Assamese", native: "অসমীয়া" },
  { code: "ur", name: "Urdu", native: "اردو" },
];

export const opdStats = {
  todaysOPD: 96,
  highRisk: 3,
  priority: 14,
  routine: 79,
  avgWaitTime: "22 min",
  assessmentsCompleted: 89,
  bhashiniSessions: 142,
  fhirPushes: 67,
};
