import type { ComplaintType, ComplaintQuestionPlan } from "./clinicalQuestions";

export type SupportedInterviewLang = "English" | "Hindi" | "Telugu";

export function normalizeInterviewLanguage(language: string | undefined): SupportedInterviewLang {
  const l = (language ?? "English").toLowerCase();
  if (l.startsWith("hi") || l === "hindi" || l === "हिन्दी") return "Hindi";
  if (l.startsWith("te") || l === "telugu" || l === "తెలుగు") return "Telugu";
  return "English";
}

type QMap = Record<string, Partial<Record<SupportedInterviewLang, string>>>;

const sharedHistory: QMap = {
  pastMedicalHistory: {
    English: "Do you have any existing medical conditions?",
    Hindi: "क्या आपको कोई पुरानी बीमारी है?",
    Telugu: "మీకు ఏవైనా ఉన్న వైద్య సమస్యలు ఉన్నాయా?",
  },
  medications: {
    English: "Are you currently taking any medications?",
    Hindi: "क्या आप अभी कोई दवा ले रहे हैं?",
    Telugu: "మీరు ప్రస్తుతం ఏవైనా మందులు వాడుతున్నారా?",
  },
  allergies: {
    English: "Do you have any known allergies to medications or foods?",
    Hindi: "क्या आपको किसी दवा या खाने से एलर्जी है?",
    Telugu: "మీకు మందులు లేదా ఆహారాలకు అలర్జీలు ఉన్నాయా?",
  },
  familyHistory: {
    English: "Does anyone in your family have similar or serious medical conditions?",
    Hindi: "क्या परिवार में किसी को ऐसी या कोई गंभीर बीमारी है?",
    Telugu: "మీ కుటుంబంలో ఎవరికైనా ఇలాంటి లేదా తీవ్రమైన వ్యాధులు ఉన్నాయా?",
  },
  personalHistory: {
    English: "Do you smoke, drink alcohol, or have any other regular habits we should note?",
    Hindi: "क्या आप धूम्रपान या शराब करते हैं, या कोई और आदत है जो डॉक्टर को पता होनी चाहिए?",
    Telugu: "మీరు పొగ తాగుతారా, మద్యం తాగుతారా, లేదా వైద్యుడికి తెలియాల్సిన అలవాట్లు ఉన్నాయా?",
  },
  timing: {
    English: "When does this tend to happen — all the time, or at certain times of day?",
    Hindi: "यह समस्या कब होती है — हमेशा, या दिन के किसी खास समय?",
    Telugu: "ఇది ఎప్పుడు వస్తుంది — ఎల్లప్పుడూ, లేక రోజులో కొన్ని సమయాల్లోనా?",
  },
};

const byComplaint: Record<ComplaintType, QMap> = {
  chest_pain: {
    site: {
      English: "Where exactly do you feel the pain in your chest?",
      Hindi: "सीने में दर्द ठीक कहाँ महसूस होता है?",
      Telugu: "ఛాతీలో నొప్పి సరిగ్గా ఎక్కడ ఉంది?",
    },
    onset: {
      English: "When did the chest pain start?",
      Hindi: "सीने का दर्द कब शुरू हुआ?",
      Telugu: "ఛాతీ నొప్పి ఎప్పుడు మొదలైంది?",
    },
    duration: {
      English: "How long has the pain been going on?",
      Hindi: "दर्द कितने समय से है?",
      Telugu: "నొప్పి ఎంత సేపుగా ఉంది?",
    },
    character: {
      English: "How would you describe the pain — sharp, dull, crushing, or burning?",
      Hindi: "दर्द कैसा है — तीखा, सुस्त, दबाने जैसा, या जलन?",
      Telugu: "నొప్పి ఎలా ఉంది — పదునుగా, మొద్దుగా, నొక్కినట్టుగా, లేక మంటగా?",
    },
    severity: {
      English: "On a scale of 0 to 10, how severe is the chest pain right now?",
      Hindi: "0 से 10 में, अभी सीने का दर्द कितना तेज़ है?",
      Telugu: "0 నుంచి 10 స్కేల్‌లో ఛాతీ నొప్పి ఇప్పుడు ఎంత తీవ్రంగా ఉంది?",
    },
    radiation: {
      English: "Does the pain spread anywhere — like your arm, jaw, or back?",
      Hindi: "क्या दर्द कहीं फैलता है — हाथ, जबड़े, या पीठ की ओर?",
      Telugu: "నొప్పి చేయి, దవడ లేదా వీపుకు వ్యాపిస్తుందా?",
    },
    associatedSymptoms: {
      English: "Are you experiencing any other symptoms like breathlessness, sweating, or nausea?",
      Hindi: "क्या सांस फूलना, पसीना, या उल्टी जैसा महसूस हो रहा है?",
      Telugu: "ఊపిరి ఆడకపోవడం, చెమట, లేదా వికారం లాంటి ఇతర లక్షణాలు ఉన్నాయా?",
    },
    aggravatingFactors: {
      English: "Does anything make the pain worse?",
      Hindi: "क्या कुछ करने से दर्द बढ़ जाता है?",
      Telugu: "ఏదైనా చేస్తే నొప్పి పెరుగుతుందా?",
    },
    relievingFactors: {
      English: "Does anything make the pain better, like rest or medication?",
      Hindi: "क्या आराम या दवा से दर्द कम होता है?",
      Telugu: "విశ్రాంతి లేదా మందుతో నొప్పి తగ్గుతుందా?",
    },
    ...sharedHistory,
  },
  abdominal_pain: {
    site: {
      English: "Where exactly in your abdomen do you feel the pain?",
      Hindi: "पेट में दर्द ठीक कहाँ है?",
      Telugu: "కడుపులో నొప్పి సరిగ్గా ఎక్కడ ఉంది?",
    },
    onset: {
      English: "When did the abdominal pain start?",
      Hindi: "पेट दर्द कब शुरू हुआ?",
      Telugu: "కడుపు నొప్పి ఎప్పుడు మొదలైంది?",
    },
    duration: {
      English: "How long has the pain been going on?",
      Hindi: "दर्द कितने समय से है?",
      Telugu: "నొప్పి ఎంత సేపుగా ఉంది?",
    },
    character: {
      English: "How would you describe the pain — cramping, burning, or constant?",
      Hindi: "दर्द कैसा है — ऐंठन, जलन, या लगातार?",
      Telugu: "నొప్పి ఎలా ఉంది — తిమ్మిరి, మంట, లేక ఎప్పుడూ ఉండేదా?",
    },
    severity: {
      English: "On a scale of 0 to 10, how severe is the abdominal pain?",
      Hindi: "0 से 10 में पेट का दर्द कितना तेज़ है?",
      Telugu: "0 నుంచి 10 స్కేల్‌లో కడుపు నొప్పి ఎంత తీవ్రంగా ఉంది?",
    },
    radiation: {
      English: "Does the pain spread to your back or anywhere else?",
      Hindi: "क्या दर्द पीठ या और कहीं फैलता है?",
      Telugu: "నొప్పి వీపుకు లేదా మరెక్కడికైనా వ్యాపిస్తుందా?",
    },
    associatedSymptoms: {
      English: "Are you experiencing vomiting, diarrhea, constipation, or fever?",
      Hindi: "क्या उल्टी, दस्त, कब्ज, या बुखार है?",
      Telugu: "వాంతులు, విరేచనాలు, మలబద్ధకం లేదా జ్వరం ఉన్నాయా?",
    },
    aggravatingFactors: {
      English: "Does eating or any specific food make the pain worse?",
      Hindi: "क्या खाने से दर्द बढ़ता है?",
      Telugu: "తినడం వల్ల నొప్పి పెరుగుతుందా?",
    },
    relievingFactors: {
      English: "Does anything make the pain better?",
      Hindi: "किससे दर्द कम होता है?",
      Telugu: "ఏదైనా వల్ల నొప్పి తగ్గుతుందా?",
    },
    ...sharedHistory,
  },
  headache: {
    site: {
      English: "Where exactly in your head do you feel the pain?",
      Hindi: "सिर में दर्द ठीक कहाँ है?",
      Telugu: "తలనొప్పి సరిగ్గా ఎక్కడ ఉంది?",
    },
    onset: {
      English: "When did the headache start — was it sudden or gradual?",
      Hindi: "सिरदर्द कब शुरू हुआ — अचानक या धीरे-धीरे?",
      Telugu: "తలనొప్పి ఎప్పుడు మొదలైంది — అకస్మాత్తుగా లేక మెల్లగా?",
    },
    duration: {
      English: "How long have you had this headache?",
      Hindi: "यह सिरदर्द कितने समय से है?",
      Telugu: "ఈ తలనొప్పి ఎంత సేపుగా ఉంది?",
    },
    severity: {
      English: "On a scale of 0 to 10, how severe is the headache?",
      Hindi: "0 से 10 में सिरदर्द कितना तेज़ है?",
      Telugu: "0 నుంచి 10 స్కేల్‌లో తలనొప్పి ఎంత తీవ్రంగా ఉంది?",
    },
    character: {
      English: "How would you describe the pain — throbbing, pressure, or stabbing?",
      Hindi: "दर्द कैसा है — धड़कता हुआ, दबाव, या चुभन?",
      Telugu: "నొప్పి ఎలా ఉంది — కొట్టుకునేది, ఒత్తిడి, లేక పొడిచినట్టుగా?",
    },
    associatedSymptoms: {
      English: "Are you experiencing nausea, vomiting, sensitivity to light, or blurred vision?",
      Hindi: "क्या उल्टी, रोशनी से तकलीफ, या धुंधला दिखना है?",
      Telugu: "వికారం, వాంతులు, వెలుతురు భరించలేకపోవడం లేదా కళ్లు మసకబారడం ఉన్నాయా?",
    },
    aggravatingFactors: {
      English: "Does anything make the headache worse, like bright lights or movement?",
      Hindi: "क्या तेज़ रोशनी या हिलने-डुलने से सिरदर्द बढ़ता है?",
      Telugu: "వెలుతురు లేదా కదలిక వల్ల తలనొప్పి పెరుగుతుందా?",
    },
    relievingFactors: {
      English: "Does anything help relieve the headache?",
      Hindi: "किससे सिरदर्द कम होता है?",
      Telugu: "ఏదైనా వల్ల తలనొప్పి తగ్గుతుందా?",
    },
    ...sharedHistory,
  },
  fever: {
    onset: {
      English: "When did the fever start?",
      Hindi: "बुखार कब शुरू हुआ?",
      Telugu: "జ్వరం ఎప్పుడు మొదలైంది?",
    },
    duration: {
      English: "How long have you had the fever?",
      Hindi: "बुखार कितने दिन से है?",
      Telugu: "జ్వరం ఎన్ని రోజులుగా ఉంది?",
    },
    severity: {
      English: "Do you know what your temperature was? If not, how high did it feel?",
      Hindi: "क्या तापमान पता है? नहीं तो बुखार कितना तेज़ लगा?",
      Telugu: "ఉష్ణోగ్రత తెలుసా? లేకపోతే జ్వరం ఎంతగా అనిపించింది?",
    },
    associatedSymptoms: {
      English: "Are you experiencing chills, sweating, body pain, cough, or rash?",
      Hindi: "क्या कंपकंपी, पसीना, बदन दर्द, खांसी, या चकत्ता है?",
      Telugu: "చలి, చెమట, ఒళ్లు నొప్పులు, దగ్గు లేదా రాష్ ఉన్నాయా?",
    },
    aggravatingFactors: {
      English: "Have you been in contact with anyone who was unwell recently, or traveled anywhere?",
      Hindi: "क्या हाल में किसी बीमार व्यक्ति से मिलना या यात्रा हुई?",
      Telugu: "ఇటీవల అనారోగ్యంతో ఉన్న వారితో కలవడం లేదా ప్రయాణం జరిగిందా?",
    },
    relievingFactors: {
      English: "Have you taken any medication to bring the fever down?",
      Hindi: "क्या बुखार उतरने की कोई दवा ली है?",
      Telugu: "జ్వరం తగ్గడానికి ఏదైనా మందు వాడారా?",
    },
    ...sharedHistory,
  },
  cough_breathlessness: {
    onset: {
      English: "When did the cough or breathing difficulty start?",
      Hindi: "खांसी या सांस की तकलीफ कब शुरू हुई?",
      Telugu: "దగ్గు లేదా ఊపిరి ఇబ్బంది ఎప్పుడు మొదలైంది?",
    },
    duration: {
      English: "How long have you had this problem?",
      Hindi: "यह समस्या कितने समय से है?",
      Telugu: "ఈ సమస్య ఎంత సేపుగా ఉంది?",
    },
    severity: {
      English: "How much is it affecting you on a scale of 0 to 10?",
      Hindi: "0 से 10 में यह कितना परेशान कर रहा है?",
      Telugu: "0 నుంచి 10 స్కేల్‌లో ఇది మిమ్మల్ని ఎంతగా ఇబ్బంది పెడుతోంది?",
    },
    character: {
      English: "Is the cough dry, or are you bringing up sputum? Any blood?",
      Hindi: "खांसी सूखी है या बलगम आता है? खून तो नहीं?",
      Telugu: "దగ్గు ఎండుగా ఉందా, కఫం వస్తుందా? రక్తం ఉందా?",
    },
    associatedSymptoms: {
      English: "Are you experiencing chest pain, fever, or wheezing?",
      Hindi: "क्या सीने में दर्द, बुखार, या घरघराहट है?",
      Telugu: "ఛాతీ నొప్పి, జ్వరం లేదా వీపు శబ్దం (వీజింగ్) ఉన్నాయా?",
    },
    aggravatingFactors: {
      English: "Does anything make it worse — like exercise, cold air, or lying down?",
      Hindi: "क्या व्यायाम, ठंडी हवा, या लेटने से यह बढ़ता है?",
      Telugu: "వ్యాయామం, చల్లని గాలి లేదా పడుకోవడం వల్ల పెరుగుతుందా?",
    },
    relievingFactors: {
      English: "Does anything help, like an inhaler or sitting up?",
      Hindi: "क्या इनहेलर या बैठने से आराम मिलता है?",
      Telugu: "ఇన్‌హేలర్ లేదా నిటారుగా కూర్చోవడం వల్ల ఉపశమనం ఉందా?",
    },
    ...sharedHistory,
  },
  general: {
    site: {
      English: "Where exactly is the problem or discomfort?",
      Hindi: "तकलीफ ठीक कहाँ है?",
      Telugu: "సమస్య సరిగ్గా ఎక్కడ ఉంది?",
    },
    onset: {
      English: "When did this problem start?",
      Hindi: "यह समस्या कब शुरू हुई?",
      Telugu: "ఈ సమస్య ఎప్పుడు మొదలైంది?",
    },
    duration: {
      English: "How long have you been experiencing this?",
      Hindi: "यह कितने समय से है?",
      Telugu: "ఇది ఎంత సేపుగా ఉంది?",
    },
    character: {
      English: "How would you describe what you are feeling?",
      Hindi: "आप कैसा महसूस कर रहे हैं, अपने शब्दों में बताइए।",
      Telugu: "మీకు ఎలా అనిపిస్తుందో చెప్పండి.",
    },
    severity: {
      English: "On a scale of 0 to 10, how much is it affecting you?",
      Hindi: "0 से 10 में यह कितना परेशान कर रहा है?",
      Telugu: "0 నుంచి 10 స్కేల్‌లో ఇది మిమ్మల్ని ఎంతగా ఇబ్బంది పెడుతోంది?",
    },
    associatedSymptoms: {
      English: "Are there any other symptoms you have noticed?",
      Hindi: "और कोई लक्षण हैं?",
      Telugu: "ఇంకా ఏవైనా లక్షణాలు గమనించారా?",
    },
    aggravatingFactors: {
      English: "Does anything make it worse?",
      Hindi: "किससे यह बढ़ता है?",
      Telugu: "ఏదైనా వల్ల పెరుగుతుందా?",
    },
    relievingFactors: {
      English: "Does anything make it better?",
      Hindi: "किससे आराम मिलता है?",
      Telugu: "ఏదైనా వల్ల తగ్గుతుందా?",
    },
    ...sharedHistory,
  },
};

export function localizePlanQuestion(
  plan: ComplaintQuestionPlan,
  field: string,
  language: string | undefined
): string {
  const lang = normalizeInterviewLanguage(language);
  const fromMap = byComplaint[plan.type]?.[field]?.[lang];
  if (fromMap) return fromMap;
  const english = byComplaint[plan.type]?.[field]?.English;
  if (english) return english;
  return plan.questions[field] ?? `Please tell me about your ${field}.`;
}

export function interviewGreeting(language: string | undefined): string {
  const lang = normalizeInterviewLanguage(language);
  if (lang === "Hindi") {
    return "नमस्ते! मैं आपका परामर्श-पूर्व सहायक हूँ। डॉक्टर के लिए जानकारी इकट्ठा करूँगा। आज आप क्यों आए हैं? अपनी मुख्य समस्या बताइए।";
  }
  if (lang === "Telugu") {
    return "నమస్తే! నేను మీ ప్రీ-కన్సల్టేషన్ సహాయకుడిని. వైద్యుడి కోసం సమాచారం సేకరిస్తాను. ఈరోజు మీరు ఎందుకు వచ్చారు? మీ ప్రధాన సమస్య చెప్పండి.";
  }
  return "Namaste! I'm your pre-consultation assistant. I'll help prepare a case sheet for your doctor. What brings you here today?";
}

export function interviewCompleteMessage(language: string | undefined): string {
  const lang = normalizeInterviewLanguage(language);
  if (lang === "Hindi") {
    return "धन्यवाद। डॉक्टर के लिए ज़रूरी जानकारी मिल गई है। अब AYUSH आकलन की ओर चलते हैं।";
  }
  if (lang === "Telugu") {
    return "ధన్యవాదాలు. వైద్యుడికి కావాల్సిన సమాచారం సేకరించాం. ఇప్పుడు AYUSH అంచనాకు వెళదాం.";
  }
  return "Thank you. I have gathered the information needed for your doctor. Please proceed to the AYUSH assessment.";
}

export function chiefComplaintPrompt(language: string | undefined): string {
  const lang = normalizeInterviewLanguage(language);
  if (lang === "Hindi") return "आज आपकी मुख्य समस्या क्या है?";
  if (lang === "Telugu") return "ఈరోజు మీ ప్రధాన సమస్య ఏమిటి?";
  return "What brings you here today? Please describe your main concern.";
}

export const fieldLabels: Record<string, { English: string; Hindi: string; Telugu: string }> = {
  site: { English: "Site", Hindi: "स्थान", Telugu: "స్థానం" },
  onset: { English: "Onset", Hindi: "शुरुआत", Telugu: "ప్రారంభం" },
  duration: { English: "Duration", Hindi: "अवधि", Telugu: "నిడివి" },
  character: { English: "Character", Hindi: "प्रकार", Telugu: "స్వభావం" },
  radiation: { English: "Radiation", Hindi: "फैलाव", Telugu: "వ్యాప్తి" },
  associatedSymptoms: { English: "Associated symptoms", Hindi: "अन्य लक्षण", Telugu: "ఇతర లక్షణాలు" },
  timing: { English: "Timing", Hindi: "समय", Telugu: "సమయం" },
  aggravatingFactors: { English: "Aggravating factors", Hindi: "बढ़ाने वाले कारण", Telugu: "పెంచే కారకాలు" },
  relievingFactors: { English: "Relieving factors", Hindi: "आराम देने वाले कारण", Telugu: "తగ్గించే కారకాలు" },
  severity: { English: "Severity", Hindi: "तीव्रता", Telugu: "తీవ్రత" },
  pastMedicalHistory: { English: "Past history", Hindi: "पुराना इतिहास", Telugu: "గత చరిత్ర" },
  medications: { English: "Medications", Hindi: "दवाएँ", Telugu: "మందులు" },
  allergies: { English: "Allergies", Hindi: "एलर्जी", Telugu: "అలర్జీలు" },
  familyHistory: { English: "Family history", Hindi: "पारिवारिक इतिहास", Telugu: "కుటుంబ చరిత్ర" },
  personalHistory: { English: "Personal history", Hindi: "व्यक्तिगत इतिहास", Telugu: "వ్యక్తిగత చరిత్ర" },
};

export function getFieldLabel(field: string, language: string | undefined): string {
  const lang = normalizeInterviewLanguage(language);
  return fieldLabels[field]?.[lang] ?? field;
}

export function fieldDescription(field: string, language: string | undefined): string {
  const lang = normalizeInterviewLanguage(language);
  const copy: Record<string, Record<SupportedInterviewLang, string>> = {
    site: { English: "Where is the problem?", Hindi: "समस्या कहाँ है?", Telugu: "సమస్య ఎక్కడ ఉంది?" },
    onset: { English: "When did it start?", Hindi: "यह कब शुरू हुआ?", Telugu: "ఇది ఎప్పుడు మొదలైంది?" },
    character: { English: "What does it feel like?", Hindi: "यह कैसा महसूस होता है?", Telugu: "ఇది ఎలా అనిపిస్తోంది?" },
    radiation: { English: "Does it spread?", Hindi: "क्या यह फैलता है?", Telugu: "ఇది ఇతర చోట్లకు వ్యాపిస్తుందా?" },
    associatedSymptoms: { English: "Any other symptoms?", Hindi: "कोई और लक्षण?", Telugu: "ఇంకా ఏవైనా లక్షణాలు ఉన్నాయా?" },
    timing: { English: "When does it happen?", Hindi: "यह कब होता है?", Telugu: "ఇది ఎప్పుడు జరుగుతుంది?" },
    aggravatingFactors: { English: "What makes it worse?", Hindi: "किससे यह बढ़ता है?", Telugu: "ఏది దీనిని పెంచుతుంది?" },
    relievingFactors: { English: "What makes it better?", Hindi: "किससे आराम मिलता है?", Telugu: "ఏది దీనిని తగ్గిస్తుంది?" },
    severity: { English: "How bad is it?", Hindi: "यह कितना तेज़ है?", Telugu: "ఇది ఎంత తీవ్రంగా ఉంది?" },
  };
  return copy[field]?.[lang] ?? field;
}

export function documentHintText(value: string, language: string | undefined): string {
  const lang = normalizeInterviewLanguage(language);
  if (lang === "Hindi") return `आपके कागज़ात में इसके बारे में "${value}" लिखा है।`;
  if (lang === "Telugu") return `మీ రికార్డుల్లో దీని గురించి "${value}" ఉంది.`;
  return `Your medical records mention "${value}" regarding this.`;
}

export function placeholderText(phase: "complaint" | "interview", language: string | undefined): string {
  const lang = normalizeInterviewLanguage(language);
  if (phase === "complaint") {
    if (lang === "Hindi") return "अपनी मुख्य समस्या लिखें...";
    if (lang === "Telugu") return "మీ ప్రధాన సమస్య టైప్ చేయండి...";
    return "Describe your main symptom...";
  }
  if (lang === "Hindi") return "अपना उत्तर लिखें...";
  if (lang === "Telugu") return "మీ సమాధానం టైప్ చేయండి...";
  return "Type your answer...";
}

export function unknownRecordedMessage(language: string | undefined): string {
  const lang = normalizeInterviewLanguage(language);
  if (lang === "Hindi") return "ठीक है, इसे 'अज्ञात' मान लिया गया है।";
  if (lang === "Telugu") return "సరే, దీన్ని తెలియదు అని నమోదు చేశాం.";
  return "Understood — I've marked that as unknown.";
}

export function clarificationMessage(language: string | undefined): string {
  const lang = normalizeInterviewLanguage(language);
  if (lang === "Hindi") return "कृपया इस सवाल के लिए थोड़ा और स्पष्ट उत्तर दें।";
  if (lang === "Telugu") return "ఈ ప్రశ్నకు కొంచెం స్పష్టమైన సమాధానం ఇవ్వండి.";
  return "Could you clarify that answer for this part of the history?";
}

export function greetingRetryMessage(language: string | undefined): string {
  const lang = normalizeInterviewLanguage(language);
  if (lang === "Hindi") return "मुझे आपकी वास्तविक स्वास्थ्य समस्या जाननी है। आज आपको यहाँ किस वजह से आना पड़ा?";
  if (lang === "Telugu") return "మీ అసలు ఆరోగ్య సమస్య ఏమిటో చెప్పండి. ఈరోజు మీరు ఇక్కడికి ఎందుకు వచ్చారు?";
  return "I still need the actual health concern. What brings you here today?";
}

export function severityClarificationMessage(language: string | undefined): string {
  const lang = normalizeInterviewLanguage(language);
  if (lang === "Hindi") return "कृपया स्पष्ट करें: क्या दर्द नहीं है, या तीव्रता का अंक अलग है?";
  if (lang === "Telugu") return "దయచేసి స్పష్టం చేయండి: నొప్పి లేదా అసౌకర్యం లేదా, తీవ్రత స్కోరు వేరేనా?";
  return "Please clarify: are you pain-free, or is the severity score different?";
}
