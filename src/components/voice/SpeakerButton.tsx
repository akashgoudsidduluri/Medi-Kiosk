/**
 * Speaker Button - For Touch Mode AI Questions
 * 
 * Allows patient to hear the AI question without automatically submitting.
 * Only speaks the text - does not:
 * - Change clinical state
 * - Submit answer
 * - Advance interview
 * - Start microphone
 */

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { getTtsService } from "@/services/serviceRegistry";

interface SpeakerButtonProps {
  text: string;
  language: string;
  size?: "sm" | "lg" | "default";
  variant?: "ghost" | "outline" | "default";
  className?: string;
}

/**
 * Speaker button for reading AI questions aloud.
 * Prevents duplicate speech if clicked multiple times.
 */
export function SpeakerButton({
  text,
  language,
  size = "sm",
  variant = "ghost",
  className = "",
}: SpeakerButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const ttsServiceRef = useRef(getTtsService());

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    const exactText = (text ?? "").trim();
    if (!exactText) return;

    if (isSpeaking) {
      ttsServiceRef.current.stop();
      setIsSpeaking(false);
      return;
    }

    setIsLoading(true);
    setIsSpeaking(true);

    try {
      console.log("[TTS] speaker button request:", exactText);
      ttsServiceRef.current.stop();
      await ttsServiceRef.current.speak(exactText, language);
    } catch (error) {
      console.error("Speaker button error:", error);
    } finally {
      setIsSpeaking(false);
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading}
      className={`flex-shrink-0 ${className}`}
      title={isSpeaking ? "Stop speaking" : "Read aloud"}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isSpeaking ? (
        <VolumeX className="w-4 h-4" />
      ) : (
        <Volume2 className="w-4 h-4" />
      )}
    </Button>
  );
}
