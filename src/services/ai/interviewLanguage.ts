export type InterviewLang = "English" | "Hindi" | "Telugu";

export type LocalizedText = Record<InterviewLang, string>;

export function normalizeInterviewLanguage(language?: string): InterviewLang {
  const value = (language ?? "English").toLowerCase();
  if (value.includes("hindi") || value.includes("हिन्द") || value === "hi") return "Hindi";
  if (value.includes("telugu") || value.includes("తెలుగు") || value === "te") return "Telugu";
  return "English";
}

export function pickLocalized(text: LocalizedText, language?: string): string {
  return text[normalizeInterviewLanguage(language)];
}

export const interviewUiCopy = {
  greeting: {
    English:
      "Namaste! I'm your pre-consultation assistant. I'll help prepare a case sheet for your doctor. What is the main problem that brings you here today?",
    Hindi:
      "नमस्ते! मैं आपका परामर्श-पूर्व सहायक हूँ। मैं डॉक्टर के लिए केस शीट तैयार करने में मदद करूँगा। आज आपको मुख्य रूप से क्या समस्या है?",
    Telugu:
      "నమస్తే! నేను మీ ప్రీ-కన్సల్టేషన్ సహాయకుడిని. డాక్టర్ కోసం కేస్ షీట్ సిద్ధం చేస్తాను. ఈరోజు మిమ్మల్ని ఇక్కడికి తీసుకొచ్చిన ప్రధాన సమస్య ఏమిటి?",
  } satisfies LocalizedText,
  complete: {
    English:
      "Thank you. I have gathered the information your doctor needs. Please continue to the AYUSH assessment. This is not a diagnosis.",
    Hindi:
      "धन्यवाद। डॉक्टर के लिए जरूरी जानकारी दर्ज हो गई है। अब AYUSH आकलन जारी रखें। यह निदान नहीं है।",
    Telugu:
      "ధన్యవాదాలు. డాక్టర్‌కు అవసరమైన సమాచారం నమోదు అయింది. దయచేసి AYUSH అంచనాకు వెళ్లండి. ఇది రోగ నిర్ధారణ కాదు.",
  } satisfies LocalizedText,
  unknownAck: {
    English: "That's okay. I will mark this as unknown for your doctor to review.",
    Hindi: "कोई बात नहीं। मैं इसे डॉक्टर की समीक्षा के लिए अज्ञात के रूप में दर्ज कर रहा हूँ।",
    Telugu: "సరే. దీన్ని డాక్టర్ సమీక్ష కోసం తెలియదు అని నమోదు చేస్తాను.",
  } satisfies LocalizedText,
  contradictionAck: {
    English:
      "I noticed this may not match something recorded earlier. I will keep both statements for the doctor to review.",
    Hindi:
      "यह पहले दर्ज जानकारी से मेल नहीं खा सकता है। मैं दोनों बातें डॉक्टर की समीक्षा के लिए रख रहा हूँ।",
    Telugu:
      "ఇది ఇంతకు ముందు నమోదైన సమాచారంతో సరిపోలకపోవచ్చు. రెండు వివరాలను డాక్టర్ సమీక్ష కోసం ఉంచుతాను.",
  } satisfies LocalizedText,
};
