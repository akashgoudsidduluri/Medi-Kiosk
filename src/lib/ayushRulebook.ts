/**
 * AYUSH Assessment Rulebook Metadata
 * 
 * Dashavidha Pariksha (10-Fold Examination) - Educational Reference
 * 
 * This is a patient-facing educational reference guide for the Ayurvedic
 * 10-fold examination framework. It is NOT diagnostic and does NOT replace
 * clinical assessment by qualified AYUSH practitioners.
 */

export interface DashavidhaParameter {
  id: string;
  name: string;
  sanskritName: string;
  description: string;
  educationalContext: string;
  options: Array<{
    value: string;
    label: string;
    meaning: string;
  }>;
  translations: {
    hindi?: {
      name: string;
      description: string;
      meaning: string;
    };
    telugu?: {
      name: string;
      description: string;
      meaning: string;
    };
  };
}

export const DASHAVIDHA_RULEBOOK: Record<string, DashavidhaParameter> = {
  prakriti: {
    id: "prakriti",
    name: "Prakriti",
    sanskritName: "प्रकृति",
    description:
      "Natural constitution - The foundational mind-body type determined at birth based on the balance of Vata (air/space), Pitta (fire), and Kapha (water/earth).",
    educationalContext:
      "Prakriti represents your inherent nature and dominant constitutional elements. Understanding this helps contextualize how your body naturally responds to food, seasons, and stress. This is not changeable and serves as a reference point for all other observations.",
    options: [
      {
        value: "vata",
        label: "Vata (Air/Space dominant)",
        meaning: "Characterized by movement, creativity, and sensitivity to change",
      },
      {
        value: "pitta",
        label: "Pitta (Fire dominant)",
        meaning: "Characterized by transformation, intensity, and metabolic activity",
      },
      {
        value: "kapha",
        label: "Kapha (Water/Earth dominant)",
        meaning: "Characterized by stability, structure, and nourishment",
      },
      {
        value: "vata-pitta",
        label: "Dual - Vata-Pitta",
        meaning: "Approximately equal Vata and Pitta elements",
      },
      {
        value: "pitta-kapha",
        label: "Dual - Pitta-Kapha",
        meaning: "Approximately equal Pitta and Kapha elements",
      },
      {
        value: "vata-kapha",
        label: "Dual - Vata-Kapha",
        meaning: "Approximately equal Vata and Kapha elements",
      },
      {
        value: "balanced",
        label: "Balanced (Tridosha)",
        meaning: "Relatively equal balance of all three elements",
      },
    ],
    translations: {
      hindi: {
        name: "प्रकृति (Prakriti)",
        description: "जन्म से निर्धारित प्राकृतिक संविधान",
        meaning: "आपकी जन्मजात प्रकृति जो भोजन, ऋतु और तनाव के प्रति शरीर की प्रतিक्रिया को समझाती है",
      },
      telugu: {
        name: "ప్రకృతి (Prakriti)",
        description: "పుట్టినప్పుడు నిర్ణయించిన సహజ సంరचన",
        meaning: "ఆహారం, ఋతువులు మరియు ఒత్తిడికి మీ శరీరం యొక్క సహజ ప్రతిస్పందన",
      },
    },
  },

  vikriti: {
    id: "vikriti",
    name: "Vikriti",
    sanskritName: "विकृति",
    description:
      "Current imbalance - The present state of mind-body balance, which may differ from Prakriti due to lifestyle, diet, stress, and seasonal factors.",
    educationalContext:
      "Vikriti shows how your current state compares to your natural constitution. It helps identify which elements might be aggravated right now. When Vikriti differs from Prakriti, targeted adjustments to daily routine and diet can help restore balance.",
    options: [
      {
        value: "vata",
        label: "Vata (Air/Space aggravated)",
        meaning: "Currently showing increased movement-related qualities",
      },
      {
        value: "pitta",
        label: "Pitta (Fire aggravated)",
        meaning: "Currently showing increased heat and intensity",
      },
      {
        value: "kapha",
        label: "Kapha (Water/Earth aggravated)",
        meaning: "Currently showing increased heaviness and stagnation",
      },
      {
        value: "balanced",
        label: "Balanced",
        meaning: "Current state appears balanced",
      },
    ],
    translations: {
      hindi: {
        name: "विकृति (Vikriti)",
        description: "वर्तमान मन-शरीर संतुलन की स्थिति",
        meaning: "आपकी वर्तमान स्थिति जो जीवनशैली, आहार और तनाव से प्रभावित है",
      },
      telugu: {
        name: "విక్రిటి (Vikriti)",
        description: "ప్రస్తుత మన-శరీర సమతుల్యత స్థితి",
        meaning: "జీవనశైలి, ఆహారం మరియు ఒత్తిడి ద్వారా ప్రభావితమైన మీ ప్రస్తుత స్థితి",
      },
    },
  },

  sara: {
    id: "sara",
    name: "Sara",
    sanskritName: "सार",
    description:
      "Tissue quality - The excellence and vitality of body tissues (dhatus). Assessed by observing the quality and luster of skin, hair, nails, and overall radiance.",
    educationalContext:
      "Sara reflects the overall health and nourishment status of your tissues. Good sara indicates well-nourished tissues that are resilient and recover well from stress. Sara can be improved through proper nutrition and lifestyle.",
    options: [
      {
        value: "strong",
        label: "Strong",
        meaning: "Tissues show vitality, radiance, and resilience",
      },
      {
        value: "medium",
        label: "Medium",
        meaning: "Tissues show moderate health and vitality",
      },
      {
        value: "poor",
        label: "Poor",
        meaning: "Tissues show reduced vitality or resilience",
      },
    ],
    translations: {
      hindi: {
        name: "सार (Sara)",
        description: "शरीर के ऊतकों की गुणवत्ता और जीवन शक्ति",
        meaning: "त्वचा, बाल और नाखूनों की चमक और स्वास्थ्य",
      },
      telugu: {
        name: "సార (Sara)",
        description: "శరీర కణజాలం యొక్క గుణమైన జీవన శక్తి",
        meaning: "చర్మం, జుట్టు మరియు గోళ్ళ ప్రకాశం మరియు ఆరోగ్యం",
      },
    },
  },

  samhanana: {
    id: "samhanana",
    name: "Samhanana",
    sanskritName: "संहनन",
    description:
      "Body structure - The compactness and density of bones, muscles, and body frame. Reflects structural integrity and firmness.",
    educationalContext:
      "Samhanana describes how tightly or loosely your body tissues are structured. A firm samhanana indicates strong structural support; a lax samhanana suggests more pliability. This influences injury recovery rates and physical resilience.",
    options: [
      {
        value: "dense",
        label: "Dense",
        meaning: "Compact, firm body structure",
      },
      {
        value: "medium",
        label: "Medium",
        meaning: "Moderate compactness",
      },
      {
        value: "lax",
        label: "Lax",
        meaning: "Loose, flexible body structure",
      },
    ],
    translations: {
      hindi: {
        name: "संहनन (Samhanana)",
        description: "हड्डियों, मांसपेशियों और शरीर के ढांचे की दृढ़ता",
        meaning: "शरीर के ऊतकों की कसावट और संरचनात्मक अखंडता",
      },
      telugu: {
        name: "సంహననన (Samhanana)",
        description: "ఎముకలు, కండరాలు మరియు శరీర ఫ్రేమ్ యొక్క దృఢత",
        meaning: "శరీర కణజాలం యొక్క తీగతనం మరియు నిర్మాణాత్మక సమగ్రత",
      },
    },
  },

  pramana: {
    id: "pramana",
    name: "Pramana",
    sanskritName: "प्रमाण",
    description:
      "Body proportions - The relative proportions of different body parts (height, limb length, torso size). Related to overall body framework.",
    educationalContext:
      "Pramana reflects the symmetry and proportion of your body. It helps assess how body parts relate to each other and whether proportions are within expected ranges. This is a descriptive observation rather than a judgment of appearance.",
    options: [
      {
        value: "small",
        label: "Small proportions",
        meaning: "Relatively smaller frame size",
      },
      {
        value: "medium",
        label: "Medium proportions",
        meaning: "Average frame size proportions",
      },
      {
        value: "large",
        label: "Large proportions",
        meaning: "Relatively larger frame size",
      },
    ],
    translations: {
      hindi: {
        name: "प्रमाण (Pramana)",
        description: "शरीर के विभिन्न अंगों के आपेक्षिक अनुपात",
        meaning: "ऊंचाई, भुजा की लंबाई और शरीर के अनुपात",
      },
      telugu: {
        name: "ప్రమాణ (Pramana)",
        description: "శరీర భాగాల సాపేక్ష నిష్పత్తులు",
        meaning: "ఎత్తు, చేయి పొడవు మరియు శరీర నిష్పత్తులు",
      },
    },
  },

  satmya: {
    id: "satmya",
    name: "Satmya",
    sanskritName: "सात्म्य",
    description:
      "Adaptability and tolerance - Your body's natural compatibility with different foods, climates, activities, and seasonal changes. Reflects what you naturally thrive with.",
    educationalContext:
      "Satmya shows which foods, seasons, and activities your body naturally adapts to well. Understanding your satmya helps guide appropriate dietary and lifestyle choices. Some people naturally adapt to spicy foods, others to light foods. Neither is wrong—it's individual.",
    options: [
      {
        value: "full",
        label: "Full adaptability",
        meaning: "Naturally adapts well to varied conditions",
      },
      {
        value: "partial",
        label: "Partial adaptability",
        meaning: "Adapts to some conditions, sensitive to others",
      },
      {
        value: "limited",
        label: "Limited adaptability",
        meaning: "Thrives in specific stable conditions",
      },
    ],
    translations: {
      hindi: {
        name: "सात्म्य (Satmya)",
        description: "भोजन, जलवायु और गतिविधियों के अनुकूल करने की क्षमता",
        meaning: "आपका शरीर कौन से खाद्य और परिस्थितियों के साथ अच्छी तरह काम करता है",
      },
      telugu: {
        name: "సాత్మ్య (Satmya)",
        description: "ఆహారం, వాతావరణం మరియు కార్యకలాపాలకు అనుకూలం చేసుకునే సామర్థ్యం",
        meaning: "మీ శరీరం ఏ ఆహారం మరియు పరిస్థితులతో బాగా పనిచేస్తుందో",
      },
    },
  },

  sattva: {
    id: "sattva",
    name: "Sattva",
    sanskritName: "सत्त्व",
    description:
      "Mental strength - Psychological resilience, emotional stability, clarity, and capacity to handle stress and adversity. Not about personality type.",
    educationalContext:
      "Sattva (mental strength) is different from personality. It describes how resilient your mind is during stress, how clearly you think under pressure, and your capacity for emotional regulation. Sattva can be developed through practices like meditation and stress management.",
    options: [
      {
        value: "strong",
        label: "Strong mental resilience",
        meaning: "Emotionally stable, clear thinking under stress",
      },
      {
        value: "medium",
        label: "Medium mental resilience",
        meaning: "Moderate emotional stability",
      },
      {
        value: "weak",
        label: "Weaker mental resilience",
        meaning: "More affected by stress and emotions",
      },
    ],
    translations: {
      hindi: {
        name: "सत्त्व (Sattva)",
        description: "मानसिक शक्ति और भावनात्मक स्थिरता",
        meaning: "तनाव के तहत मानसिक लचीलापन और भावनात्मक नियंत्रण",
      },
      telugu: {
        name: "సత్త్వ (Sattva)",
        description: "మానసిక శక్తి మరియు భావోద్వేగ స్థిरতা",
        meaning: "ఒత్తిడిలో మానసిక నమ్యత మరియు భావోద్వేగ నియంత్రణ",
      },
    },
  },

  ahara_shakti: {
    id: "ahara_shakti",
    name: "Ahara Shakti",
    sanskritName: "आहार शक्ति",
    description:
      "Digestive capacity - Your body's ability to digest and assimilate food and nutrients. Reflects the strength of digestive fire (agni).",
    educationalContext:
      "Ahara Shakti (digestive strength) determines how much and what type of food your body can comfortably process. Strong digestive capacity means you can handle heavier, more complex foods. Weaker capacity suggests lighter, easily digestible foods are better tolerated.",
    options: [
      {
        value: "strong",
        label: "Strong digestive capacity",
        meaning: "Efficiently digests varied and complex foods",
      },
      {
        value: "medium",
        label: "Medium digestive capacity",
        meaning: "Moderate digestive strength",
      },
      {
        value: "poor",
        label: "Weaker digestive capacity",
        meaning: "Better with lighter, simpler foods",
      },
    ],
    translations: {
      hindi: {
        name: "आहार शक्ति (Ahara Shakti)",
        description: "भोजन को पचाने की क्षमता",
        meaning: "पाचन अग्नि की शक्ति और भोजन को आत्मसात करने की क्षमता",
      },
      telugu: {
        name: "ఆహార శక్తి (Ahara Shakti)",
        description: "ఆహారాన్ని జీర్ణం చేసే సామర్థ్యం",
        meaning: "జీర్ణ శక్తి మరియు ఆహారాన్ని గ్రహించే సామర్థ్యం",
      },
    },
  },

  vyayama_shakti: {
    id: "vyayama_shakti",
    name: "Vyayama Shakti",
    sanskritName: "व्यायाम शक्ति",
    description:
      "Exercise capacity - Your body's ability to engage in physical activity and exercise without fatigue or exhaustion. Reflects physical stamina.",
    educationalContext:
      "Vyayama Shakti indicates how much physical activity your body naturally can sustain. This is individual and influenced by constitution. Understanding your capacity helps in choosing appropriate exercise types and intensity to maintain health without overexertion.",
    options: [
      {
        value: "strong",
        label: "Strong exercise capacity",
        meaning: "Can sustain vigorous, prolonged physical activity",
      },
      {
        value: "medium",
        label: "Medium exercise capacity",
        meaning: "Moderate stamina for regular activity",
      },
      {
        value: "low",
        label: "Lower exercise capacity",
        meaning: "Prefers gentle, moderated activity",
      },
    ],
    translations: {
      hindi: {
        name: "व्यायाम शक्ति (Vyayama Shakti)",
        description: "व्यायाम सहन करने की क्षमता",
        meaning: "शारीरिक सहनशक्ति और व्यायाम क्षमता",
      },
      telugu: {
        name: "వ్యాయామ శక్తి (Vyayama Shakti)",
        description: "వ్యాయామాన్ని సహించే సామర్థ్యం",
        meaning: "శారీరక సహనశక్తి మరియు వ్యాయాম సామర్థ్యం",
      },
    },
  },

  vaya: {
    id: "vaya",
    name: "Vaya",
    sanskritName: "वय",
    description:
      "Age and life stage - Current age and corresponding life stage (childhood, youth, adulthood, advanced years) with associated natural physiological changes.",
    educationalContext:
      "Vaya represents not just chronological age, but the life stage with its natural physiological rhythms. Each life stage has characteristic changes in energy, recovery, metabolism, and needs. Understanding your vaya helps contextualize what's normal for your stage of life.",
    options: [
      {
        value: "childhood",
        label: "Childhood (0-16 years)",
        meaning: "Kapha-dominant stage of growth and development",
      },
      {
        value: "youth",
        label: "Youth (16-40 years)",
        meaning: "Pitta-dominant stage of activity and metabolism",
      },
      {
        value: "adulthood",
        label: "Middle age (40-65 years)",
        meaning: "Transition with all three elements",
      },
      {
        value: "advanced",
        label: "Advanced years (65+ years)",
        meaning: "Vata-dominant stage with natural changes",
      },
    ],
    translations: {
      hindi: {
        name: "वय (Vaya)",
        description: "आयु और जीवन का चरण",
        meaning: "आपकी वर्तमान आयु और जीवन के अनुरूप प्राकृतिक परिवर्तन",
      },
      telugu: {
        name: "వయ (Vaya)",
        description: "వయస్సు మరియు జీవన దశ",
        meaning: "మీ ప్రస్తుత వయస్సు మరియు జీవన దశకు సంబంధించిన సహజ మార్పులు",
      },
    },
  },
};

/**
 * Get all parameter IDs in assessment order
 */
export function getParameterOrder(): string[] {
  return [
    "prakriti",
    "vikriti",
    "sara",
    "samhanana",
    "pramana",
    "satmya",
    "sattva",
    "ahara_shakti",
    "vyayama_shakti",
    "vaya",
  ];
}

/**
 * Get parameter by ID
 */
export function getParameter(id: string): DashavidhaParameter | null {
  return DASHAVIDHA_RULEBOOK[id] || null;
}

/**
 * Get all parameters
 */
export function getAllParameters(): DashavidhaParameter[] {
  return getParameterOrder().map((id) => DASHAVIDHA_RULEBOOK[id]).filter(Boolean);
}

/**
 * Get translated text with fallback to English
 */
export function getTranslatedText(
  parameter: DashavidhaParameter,
  language: string,
  field: "name" | "description" | "meaning"
): string {
  const lang = language.toLowerCase();

  if (lang === "hindi" && parameter.translations.hindi) {
    const trans = parameter.translations.hindi as Record<string, string>;
    return trans[field] || getDefaultTranslation(parameter, field);
  }

  if (lang === "telugu" && parameter.translations.telugu) {
    const trans = parameter.translations.telugu as Record<string, string>;
    return trans[field] || getDefaultTranslation(parameter, field);
  }

  // Default to English
  return getDefaultTranslation(parameter, field);
}

function getDefaultTranslation(
  parameter: DashavidhaParameter,
  field: "name" | "description" | "meaning"
): string {
  if (field === "name") return parameter.name;
  if (field === "description") return parameter.description;
  // For meaning, return the description as it's the closest match
  return parameter.description;
}
