import { lazy, Suspense } from "react";
import { useNavigate } from "react-router";
import { usePatientStore } from "@/store/patientStore";

// Lazy load both mode interfaces
const VoiceModeInterface = lazy(() => import("@/components/voice/VoiceModeInterface"));
const TouchModeInterview = lazy(() => import("@/pages/patient/TouchModeInterview"));

// Simple loading fallback
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF8F0]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#3B5998] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-[#8B7355]">Loading...</span>
      </div>
    </div>
  );
}

/**
 * Interview Router Component
 * 
 * Selects the appropriate interview interface based on inputMode:
 * - "voice" → VoiceModeInterface (hands-free conversation)
 * - "touch" → TouchModeInterview (text/touch interface)
 * - null → Navigate back (user hasn't selected a mode)
 */
export default function Interview() {
  const navigate = useNavigate();
  const { inputMode } = usePatientStore();

  // If no input mode selected, redirect to input mode selection
  if (!inputMode) {
    navigate("/patient/input-mode", { replace: true });
    return null;
  }

  // Route to appropriate interface
  const Component = inputMode === "voice" ? VoiceModeInterface : TouchModeInterview;

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Component />
    </Suspense>
  );
}
