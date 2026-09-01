import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { usePatientStore } from "@/store/patientStore";
import { demoScenarios } from "@/data/demoData";
import { Settings, X, Play, Loader2 } from "lucide-react";

export function DemoSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("scenario-3"); // Default High Risk
  const navigate = useNavigate();
  const { setPatient, setSOCRATES, setAYUSH, setTriage, setStep } = usePatientStore();

  const loadScenario = async (scenarioId: string) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600)); // simulate loading

    const scenario = demoScenarios.find(s => s.id === scenarioId);
    if (!scenario) return;

    // Populate the store with the scenario data
    setPatient({
      id: `patient-${Date.now()}`,
      name: scenario.patient.name,
      age: scenario.patient.age,
      gender: scenario.patient.gender,
      mobileNumber: scenario.patient.mobileNumber,
      abhaId: scenario.patient.abhaId,
      isAuthenticated: true,
      isDoctor: false,
      chiefComplaint: scenario.history.chiefComplaint,
      interviewComplete: true,
      ayushComplete: true,
      consentGiven: true,
      language: scenario.patient.language,
      inputMode: "voice",
    });

    // Map history (minus chiefComplaint) to SOCRATES
    const { chiefComplaint: _cc, ...socratesFields } = scenario.history;
    setSOCRATES(socratesFields as any);
    
    if (scenario.ayush) {
      setAYUSH(scenario.ayush);
    }

    setTriage({
      priority: scenario.expectedPriority as any,
      reasons: ["Triggered by demo scenario data"],
      confidence: 0.95,
      timestamp: new Date().toISOString()
    });

    setIsLoading(false);
    setIsOpen(false);
    
    // Jump straight to the dashboard or case sheet
    navigate("/patient/dashboard");
  };

  const handleLoadClick = () => {
    if (selectedScenarioId) {
      loadScenario(selectedScenarioId);
    }
  };

  if (import.meta.env.VITE_APP_MODE !== "demo" && import.meta.env.VITE_APP_MODE !== "hybrid") {
    return null; // Only show in demo/hybrid modes
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {!isOpen ? (
        <Button
          variant="outline"
          size="icon"
          className="rounded-full shadow-lg bg-vintage-blue text-white border-none hover:bg-vintage-blue/90"
          onClick={() => setIsOpen(true)}
        >
          <Settings className="w-5 h-5" />
        </Button>
      ) : (
        <div className="bg-white rounded-lg shadow-xl border border-border p-4 w-72 animate-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-3 border-b pb-2">
            <h3 className="font-semibold text-sm font-sans flex items-center gap-2 tracking-wide uppercase">
              <Settings className="w-4 h-4 text-vintage-blue" />
              DEMO MODE
            </h3>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-3 mb-4">
            <p className="text-xs text-muted-foreground">Select a deterministic scenario:</p>
            <div className="space-y-2">
              {demoScenarios.map((scenario) => (
                <label
                  key={scenario.id}
                  className={`flex items-start gap-3 p-2 rounded-md border cursor-pointer transition-colors ${
                    selectedScenarioId === scenario.id 
                      ? "border-vintage-blue bg-vintage-blue/5" 
                      : "border-transparent hover:bg-muted/50"
                  }`}
                >
                  <div className="pt-0.5">
                    <input
                      type="radio"
                      name="demo-scenario"
                      className="accent-vintage-blue w-4 h-4"
                      checked={selectedScenarioId === scenario.id}
                      onChange={() => setSelectedScenarioId(scenario.id)}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        scenario.expectedPriority === "urgent" ? "bg-urgent-red" :
                        scenario.expectedPriority === "priority" ? "bg-priority-amber" :
                        "bg-routine-green"
                      }`} />
                      <span className="font-medium text-sm text-foreground">{scenario.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{scenario.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          
          <Button 
            className="w-full bg-vintage-blue hover:bg-vintage-blue/90"
            onClick={handleLoadClick}
            disabled={isLoading || !selectedScenarioId}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            Load Demo Patient
          </Button>
        </div>
      )}
    </div>
  );
}
