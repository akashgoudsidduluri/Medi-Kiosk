/**
 * Bhashini Service Abstraction
 * 
 * TODO: Replace MockBhashiniService with RealBhashiniService when
 * actual Bhashini/AI4Bharat API credentials are available.
 * 
 * Current implementation: MockBhashiniService
 * Interface: BhashiniService
 */

export interface BhashiniService {
  transcribeAudio(audioBlob: Blob, language: string): Promise<TranscriptionResult>;
  synthesizeSpeech(text: string, language: string): Promise<ArrayBuffer>;
  detectLanguage(text: string): Promise<LanguageDetection>;
}

export interface TranscriptionResult {
  text: string;
  language: string;
  confidence: number;
  englishInterpretation: string;
}

export interface LanguageDetection {
  detectedLanguage: string;
  confidence: number;
}

// Simulated patient responses for demo
const simulatedResponses: Record<string, { text: string; english: string }> = {
  "chest pain": {
    text: "मुझे सीने में दर्द है, बाएं हाथ में भी उठ रहा है",
    english: "I have chest pain, it's also radiating to my left arm",
  },
  "stomach": {
    text: "मेरे पेट में दर्द हो रहा है, खाने के बाद ज्यादा होता है",
    english: "I have stomach pain, it worsens after eating",
  },
  "joint pain": {
    text: "मेरे घुटने में दर्द है, सुबह ज्यादा होता है",
    english: "My knee hurts, it's worse in the morning",
  },
  "breathlessness": {
    text: "सांस लेने में तकलीफ हो रही है, चलते वक्त ज्यादा होता है",
    english: "I'm having difficulty breathing, it's worse when walking",
  },
  "headache": {
    text: "मेरे सिर में बहुत दर्द है, आंखों के पीछे भी दर्द हो रहा है",
    english: "I have a severe headache, also pain behind the eyes",
  },
};

class MockBhashiniService implements BhashiniService {
  async transcribeAudio(
    _audioBlob: Blob,
    language: string
  ): Promise<TranscriptionResult> {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Return a simulated response based on language
    const responseKey = Object.keys(simulatedResponses)[0];
    const response = simulatedResponses[responseKey];

    return {
      text: language === "Hindi" ? response.text : response.english,
      language: language,
      confidence: 0.92,
      englishInterpretation: response.english,
    };
  }

  async synthesizeSpeech(_text: string, _language: string): Promise<ArrayBuffer> {
    // Simulate TTS processing
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Return empty buffer as placeholder
    return new ArrayBuffer(0);
  }

  async detectLanguage(text: string): Promise<LanguageDetection> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const hindiPattern = /[\u0900-\u097F]/;
    const teluguPattern = /[\u0C00-\u0C7F]/;
    const tamilPattern = /[\u0B80-\u0BFF]/;

    if (hindiPattern.test(text)) {
      return { detectedLanguage: "Hindi", confidence: 0.95 };
    } else if (teluguPattern.test(text)) {
      return { detectedLanguage: "Telugu", confidence: 0.93 };
    } else if (tamilPattern.test(text)) {
      return { detectedLanguage: "Tamil", confidence: 0.94 };
    }

    return { detectedLanguage: "English", confidence: 0.90 };
  }
}

// Export the mock implementation
// TODO: Replace with RealBhashiniService when API is available
export const bhashiniService: BhashiniService = new MockBhashiniService();
