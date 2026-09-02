/**
 * VoiceOrb - Central microphone visualization for Voice Mode
 * 
 * Displays a large, interactive orb that:
 * - Shows current voice state (listening, speaking, processing, etc.)
 * - Provides visual feedback to the patient
 * - Works on touchscreen devices (large enough to tap)
 */

import { motion, AnimatePresence } from "framer-motion";
import { Mic, Volume2, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { VoiceState } from "@/services/voice/VoiceStateMachine";
import "./VoiceOrb.css";

interface VoiceOrbProps {
  state: VoiceState;
  isActive: boolean;
  interimTranscript?: string;
  onMicClick?: () => void;
  disabled?: boolean;
}

export function VoiceOrb({
  state,
  isActive,
  interimTranscript = "",
  onMicClick,
  disabled = false,
}: VoiceOrbProps) {
  // Determine orb color and icon based on state
  const getOrbConfig = () => {
    switch (state) {
      case "IDLE":
        return {
          bgColor: "bg-slate-200",
          borderColor: "border-slate-300",
          innerColor: "bg-slate-300",
          textColor: "text-slate-600",
          icon: Mic,
          pulsing: false,
          label: "Ready",
        };
      case "QUESTION_READY":
        return {
          bgColor: "bg-blue-100",
          borderColor: "border-blue-300",
          innerColor: "bg-blue-400",
          textColor: "text-blue-700",
          icon: Mic,
          pulsing: true,
          label: "Ready to listen",
        };
      case "SPEAKING":
        return {
          bgColor: "bg-amber-100",
          borderColor: "border-amber-400",
          innerColor: "bg-amber-500",
          textColor: "text-amber-700",
          icon: Volume2,
          pulsing: true,
          label: "Speaking",
        };
      case "LISTENING":
        return {
          bgColor: "bg-green-100",
          borderColor: "border-green-400",
          innerColor: "bg-green-500",
          textColor: "text-green-700",
          icon: Mic,
          pulsing: true,
          label: "Listening",
        };
      case "PROCESSING":
        return {
          bgColor: "bg-purple-100",
          borderColor: "border-purple-400",
          innerColor: "bg-purple-500",
          textColor: "text-purple-700",
          icon: Loader2,
          pulsing: false,
          label: "Processing",
        };
      case "ERROR":
        return {
          bgColor: "bg-red-100",
          borderColor: "border-red-400",
          innerColor: "bg-red-500",
          textColor: "text-red-700",
          icon: AlertCircle,
          pulsing: false,
          label: "Error",
        };
      case "COMPLETED":
        return {
          bgColor: "bg-emerald-100",
          borderColor: "border-emerald-400",
          innerColor: "bg-emerald-500",
          textColor: "text-emerald-700",
          icon: CheckCircle2,
          pulsing: false,
          label: "Complete",
        };
      default:
        return {
          bgColor: "bg-slate-200",
          borderColor: "border-slate-300",
          innerColor: "bg-slate-300",
          textColor: "text-slate-600",
          icon: Mic,
          pulsing: false,
          label: "Ready",
        };
    }
  };

  const config = getOrbConfig();
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-8">
      {/* Outer container with pulsing background if needed */}
      <motion.div
        className={`relative w-48 h-48 rounded-full ${config.bgColor} border-4 ${config.borderColor} shadow-xl flex items-center justify-center transition-all ${
          disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-2xl cursor-pointer"
        }`}
        onClick={!disabled ? onMicClick : undefined}
        whileHover={!disabled ? { scale: 1.05 } : undefined}
        whileTap={!disabled ? { scale: 0.95 } : undefined}
        animate={
          config.pulsing
            ? {
                boxShadow: [
                  "0 0 20px rgba(0,0,0,0.1)",
                  "0 0 40px rgba(0,0,0,0.2)",
                  "0 0 20px rgba(0,0,0,0.1)",
                ],
              }
            : {}
        }
        transition={
          config.pulsing
            ? { duration: 1.5, repeat: Infinity }
            : undefined
        }
      >
        {/* Inner circle with icon */}
        <motion.div
          className={`w-32 h-32 rounded-full ${config.innerColor} flex items-center justify-center shadow-lg`}
          animate={
            state === "LISTENING"
              ? { scale: [0.95, 1, 0.95] }
              : state === "SPEAKING"
              ? { scale: [1, 1.1, 1] }
              : state === "PROCESSING"
              ? { rotate: 360 }
              : {}
          }
          transition={
            state === "LISTENING" || state === "SPEAKING"
              ? { duration: 0.8, repeat: Infinity }
              : state === "PROCESSING"
              ? { duration: 1, repeat: Infinity, ease: "linear" }
              : {}
          }
        >
          <Icon className="w-16 h-16 text-white" />
        </motion.div>

        {/* Waveform visualization for LISTENING and SPEAKING states */}
        {(state === "LISTENING" || state === "SPEAKING") && (
          <div className="absolute inset-0 rounded-full pointer-events-none">
            {[1, 2, 3].map((ring) => (
              <motion.div
                key={ring}
                className={`absolute inset-0 rounded-full border-2 ${config.borderColor}`}
                animate={{ scale: [1, 1.4], opacity: [1, 0] }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: ring * 0.2,
                }}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* State label */}
      <motion.div
        className={`text-center ${config.textColor} font-bold text-lg`}
        animate={{ opacity: [0.8, 1] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
      >
        {config.label}
      </motion.div>

      {/* Interim transcript display */}
      <AnimatePresence>
        {interimTranscript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center text-sm text-muted-foreground max-w-xs px-4 py-2 bg-muted rounded-lg"
          >
            "{interimTranscript}"
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="text-center text-sm text-muted-foreground mt-4">
        {state === "IDLE" && <p>Waiting to start...</p>}
        {state === "QUESTION_READY" && <p>Ready to listen to the question</p>}
        {state === "SPEAKING" && <p>AI is speaking the question...</p>}
        {state === "LISTENING" && <p>Speak your answer now</p>}
        {state === "PROCESSING" && <p>Processing your response...</p>}
        {state === "ERROR" && <p>An error occurred. Please try again.</p>}
        {state === "COMPLETED" && <p>Interview complete</p>}
      </div>
    </div>
  );
}
