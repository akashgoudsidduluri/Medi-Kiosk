import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BrowserAsrService } from '@/services/asr/BrowserAsrService';
import { BrowserTtsService } from '@/services/tts/BrowserTtsService';

describe('Browser speech services', () => {
  const globalWithSpeech = globalThis as any;

  beforeEach(() => {
    globalWithSpeech.window = globalThis;
    globalWithSpeech.SpeechSynthesisUtterance = class {
      public lang?: string;
      public voice?: { lang: string };
      public text: string;
      public rate?: number;
      public pitch?: number;
      public volume?: number;
      public onstart?: (event?: any) => void;
      public onend?: (event?: any) => void;
      public onerror?: (event?: any) => void;

      constructor(text: string) {
        this.text = text;
      }
    };
  });

  it('speaks Hindi and Telugu with the correct browser language codes', async () => {
    let capturedUtterance: any = null;
    globalWithSpeech.speechSynthesis = {
      getVoices: () => [
        { lang: 'en-IN' },
        { lang: 'hi-IN' },
        { lang: 'te-IN' },
      ],
      speak: (utterance: any) => {
        capturedUtterance = utterance;
        utterance.onstart?.({} as any);
        setTimeout(() => utterance.onend?.({} as any), 0);
      },
      cancel: vi.fn(),
    };

    const tts = new BrowserTtsService();
    await tts.speak('नमस्ते', 'Hindi');
    expect(capturedUtterance?.lang).toBe('hi-IN');

    await tts.speak('నమస్తే', 'Telugu');
    expect(capturedUtterance?.lang).toBe('te-IN');
  });

  it('starts browser recognition with the patient language and emits the final transcript once', async () => {
    let started = false;
    let capturedResult: any = null;

    class FakeSpeechRecognition {
      public lang = 'en-IN';
      public continuous = false;
      public interimResults = false;
      public onstart?: () => void;
      public onresult?: (event: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0?: { transcript: string } }> }) => void;
      public onend?: () => void;
      public onerror?: (event: { error?: string; message?: string }) => void;
      public start() {
        started = true;
        this.onstart?.();
        setTimeout(() => {
          this.onresult?.({
            resultIndex: 0,
            results: [{ isFinal: true, 0: { transcript: 'I have knee pain' } }],
          });
          this.onend?.();
        }, 0);
      }
      public stop() {}
    }

    globalWithSpeech.SpeechRecognition = FakeSpeechRecognition;

    const asr = new BrowserAsrService();
    asr.startListening('English', (result) => {
      capturedResult = result;
    });

    expect(started).toBe(true);
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(capturedResult?.text).toBe('I have knee pain');
    expect(capturedResult?.isFinal).toBe(true);
  });
});
