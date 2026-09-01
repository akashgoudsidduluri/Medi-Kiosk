/**
 * AYUSH Assessment Service Abstraction
 * 
 * Dashavidha Pariksha (10-fold examination) for AYUSH assessment.
 * TODO: Integrate with real AYUSH clinical decision support when available.
 * 
 * Current implementation: MockAYUSHService
 * Interface: AYUSHService
 */

export interface AYUSHService {
  getParameterOptions(): AYUSHParameter[];
  validateAssessment(ayush: Record<string, string>): AYUSHValidation;
}

export interface AYUSHParameter {
  id: string;
  name: string;
  sanskrit: string;
  description: string;
  options: Array<{ value: string; label: string }>;
}

export interface AYUSHValidation {
  isComplete: boolean;
  completionPercentage: number;
  completedCount: number;
  totalCount: number;
  missingParameters: string[];
}

const ayushParameters: AYUSHParameter[] = [
  {
    id: "prakriti",
    name: "Prakriti",
    sanskrit: "प्रकृति",
    description: "Constitutional type — the inherent nature of the individual",
    options: [
      { value: "Vata", label: "Vata (Air + Space)" },
      { value: "Pitta", label: "Pitta (Fire + Water)" },
      { value: "Kapha", label: "Kapha (Water + Earth)" },
      { value: "Vata-Pitta", label: "Vata-Pitta (Dual)" },
      { value: "Pitta-Kapha", label: "Pitta-Kapha (Dual)" },
      { value: "Vata-Kapha", label: "Vata-Kapha (Dual)" },
      { value: "Tridoshic", label: "Tridoshic (Balanced)" },
    ],
  },
  {
    id: "vikriti",
    name: "Vikriti",
    sanskrit: "विकृति",
    description: "Current imbalance — deviation from natural constitution",
    options: [
      { value: "Vata predominant", label: "Vata Predominant" },
      { value: "Pitta predominant", label: "Pitta Predominant" },
      { value: "Kapha predominant", label: "Kapha Predominant" },
      { value: "Vata-Pitta imbalance", label: "Vata-Pitta Imbalance" },
      { value: "Pitta-Kapha imbalance", label: "Pitta-Kapha Imbalance" },
      { value: "Balanced", label: "Balanced (No significant imbalance)" },
    ],
  },
  {
    id: "sara",
    name: "Sara",
    sanskrit: "सार",
    description: "Essential quality — the excellence of body tissues",
    options: [
      { value: "Sthula Sara", label: "Sthula Sara (Lax)" },
      { value: "Sthira Sara", label: "Sthira Sara (Dense)" },
      { value: "Madhyama Sara", label: "Madhyama Sara (Medium)" },
      { value: "Slakshna Sara", label: "Slakshna Sara (Fine)" },
    ],
  },
  {
    id: "samhanana",
    name: "Samhanana",
    sanskrit: "संहनन",
    description: "Compactness — the compactness of body build",
    options: [
      { value: "Sakrit Samhanana", label: "Sakrit Samhanana (Dense)" },
      { value: "Madhyama Samhanana", label: "Madhyama Samhanana (Medium)" },
      { value: "Loose Samhanana", label: "Loose Samhanana (Lax)" },
    ],
  },
  {
    id: "pramana",
    name: "Pramana",
    sanskrit: "प्रमाण",
    description: "Body measurements — size and proportions",
    options: [
      { value: "Hina Pramana", label: "Hina Pramana (Small)" },
      { value: "Madhyama Pramana", label: "Madhyama Pramana (Medium)" },
      { value: "Brihat Pramana", label: "Brihat Pramana (Large)" },
    ],
  },
  {
    id: "satmya",
    name: "Satmya",
    sanskrit: "सात्म्य",
    description: "Adaptability — capacity to adapt to environmental changes",
    options: [
      { value: "Alpa Satmya", label: "Alpa Satmya (Poor adaptation)" },
      { value: "Partial Satmya", label: "Partial Satmya (Partial adaptation)" },
      { value: "Sarvakala Satmya", label: "Sarvakala Satmya (Full adaptation)" },
    ],
  },
  {
    id: "satva",
    name: "Satva",
    sanskrit: "सत्त्व",
    description: "Mental strength — mental constitution and resilience",
    options: [
      { value: "Hina Satva", label: "Hina Satva (Weak)" },
      { value: "Madhyama Satva", label: "Madhyama Satva (Middle)" },
      { value: "Pravara Satva", label: "Pravara Satva (Strong)" },
    ],
  },
  {
    id: "aharaShakti",
    name: "Ahara Shakti",
    sanskrit: "आहार शक्ति",
    description: "Digestive capacity — ability to digest food",
    options: [
      { value: "Hina Ahara Shakti", label: "Hina (Reduced)" },
      { value: "Madhyama Ahara Shakti", label: "Madhyama (Medium)" },
      { value: "Pravara Ahara Shakti", label: "Pravara (Strong)" },
    ],
  },
  {
    id: "vyayamaShakti",
    name: "Vyayama Shakti",
    sanskrit: "व्यायाम शक्ति",
    description: "Exercise capacity — physical endurance and tolerance",
    options: [
      { value: "Hina Vyayama Shakti", label: "Hina (Reduced)" },
      { value: "Madhyama Vyayama Shakti", label: "Madhyama (Medium)" },
      { value: "Pravara Vyayama Shakti", label: "Pravara (Strong)" },
    ],
  },
  {
    id: "vaya",
    name: "Vaya",
    sanskrit: "वय",
    description: "Age assessment — life stage classification",
    options: [
      { value: "Bala Kala", label: "Bala Kala (Childhood)" },
      { value: "Taruna Kala", label: "Taruna Kala (Young adult)" },
      { value: "Madhyayu Kala", label: "Madhyayu Kala (Middle age)" },
      { value: "Vridha Kala", label: "Vridha Kala (Elderly)" },
    ],
  },
];

class MockAYUSHService implements AYUSHService {
  getParameterOptions(): AYUSHParameter[] {
    return ayushParameters;
  }

  validateAssessment(ayush: Record<string, string>): AYUSHValidation {
    const totalCount = ayushParameters.length;
    const completedCount = ayushParameters.filter(
      (p) => ayush[p.id] && ayush[p.id] !== ""
    ).length;
    const missingParameters = ayushParameters
      .filter((p) => !ayush[p.id] || ayush[p.id] === "")
      .map((p) => p.name);

    return {
      isComplete: completedCount === totalCount,
      completionPercentage: Math.round((completedCount / totalCount) * 100),
      completedCount,
      totalCount,
      missingParameters,
    };
  }
}

export const ayushService: AYUSHService = new MockAYUSHService();
