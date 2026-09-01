import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePatientStore } from "@/store/patientStore";
import { Header } from "@/components/shared/Header";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import { fhirService, type FHIRBundle } from "@/services/fhirService";
import {
  ArrowLeft,
  ArrowRight,
  Link2,
  Database,
  Server,
  CheckCircle,
  Loader2,
  FileText,
  Shield,
  Activity,
} from "lucide-react";

export default function Integration() {
  const navigate = useNavigate();
  const store = usePatientStore();
  const [fhirBundle, setFhirBundle] = useState<FHIRBundle | null>(null);
  const [abdmResult, setAbdmResult] = useState<string | null>(null);
  const [hisResult, setHisResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateFHIR = async () => {
    setIsGenerating(true);
    const bundle = await fhirService.generateBundle({
      patient: {
        id: store.id || "demo-patient",
        name: store.name || "Demo Patient",
        age: store.age || 40,
        gender: store.gender || "Male",
        abhaId: store.abhaId || "ABHA-DEMO-123456",
        mobileNumber: store.mobileNumber,
      },
      chiefComplaint: store.chiefComplaint || "Demo complaint",
      socrates: store.socrates,
      ayush: store.ayush,
      triage: store.triage || { priority: "routine", reasons: [] },
      documents: store.documents.map((d: { extractedData: Record<string, string> }) => ({ extractedData: d.extractedData })),
    });
    setFhirBundle(bundle);
    setIsGenerating(false);
  };

  const handleABDMPush = async () => {
    if (!fhirBundle) return;
    setIsGenerating(true);
    const result = await fhirService.pushToABDM(fhirBundle);
    setAbdmResult(result.message);
    setIsGenerating(false);
  };

  const handleHISPush = async () => {
    if (!fhirBundle) return;
    setIsGenerating(true);
    const result = await fhirService.pushToHIS(fhirBundle);
    setHisResult(result.message);
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen vintage-texture">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back
          </Button>

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-vintage-teal to-vintage-blue flex items-center justify-center">
              <Link2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>
                FHIR / ABDM Integration
              </h1>
              <p className="text-xs text-muted-foreground">
                HL7 FHIR R4 & ABDM Integration Demo
              </p>
            </div>
          </div>

          <DisclaimerBanner
            type="simulated"
            message="All FHIR and ABDM integrations shown here are simulated. In production, these would connect to real FHIR servers and ABDM APIs."
          />

          {/* Integration Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "FHIR R4 Server", icon: Server, status: "Demo", color: "text-vintage-blue" },
              { label: "ABDM Integration", icon: Shield, status: "Simulated", color: "text-vintage-teal" },
              { label: "HIS/EMR Push", icon: Database, status: "Simulated", color: "text-vintage-gold" },
            ].map((item) => (
              <Card key={item.label} className="vintage-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className={`text-xs font-semibold ${item.color}`}>{item.status}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Generate FHIR Bundle */}
          <Card className="vintage-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-vintage-blue" />
                <CardTitle className="text-sm" style={{ fontFamily: "Georgia, serif" }}>
                  FHIR R4 Bundle
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Generate an HL7 FHIR R4 Bundle containing Patient, Encounter, Condition, Observation, and Composition resources.
              </p>
              <Button
                className="bg-vintage-blue hover:bg-vintage-blue/90"
                onClick={handleGenerateFHIR}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <FileText className="w-4 h-4 mr-2" />
                )}
                Generate FHIR Bundle
              </Button>

              {fhirBundle && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="p-4 rounded-lg bg-parchment border border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-4 h-4 text-vintage-green" />
                      <p className="text-sm font-bold text-foreground">
                        Bundle Generated — {fhirBundle.entry.length} resources
                      </p>
                    </div>
                    <pre className="text-[11px] text-muted-foreground overflow-auto max-h-60 font-mono bg-white p-3 rounded-lg border border-border">
                      {JSON.stringify(fhirBundle, null, 2)}
                    </pre>
                  </div>

                  {/* Resource List */}
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {fhirBundle.entry.map((entry, i) => {
                      const resource = entry.resource;
                      return (
                        <div key={i} className="p-2 rounded-lg bg-vintage-teal/5 border border-vintage-teal/20">
                          <p className="text-xs font-bold text-vintage-teal">
                            {String(resource.resourceType)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {String(resource.id)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* ABDM Push */}
          <Card className="vintage-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-vintage-teal" />
                <CardTitle className="text-sm" style={{ fontFamily: "Georgia, serif" }}>
                  ABDM / ABHA Integration
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Push the FHIR bundle to the patient&apos;s ABHA (Ayushman Bharat Health Account) health record.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleABDMPush}
                  disabled={!fhirBundle || isGenerating}
                  className="border-vintage-teal text-vintage-teal"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Link2 className="w-4 h-4 mr-2" />
                  )}
                  Push to ABHA PHR
                </Button>
                <Button
                  variant="outline"
                  onClick={handleHISPush}
                  disabled={!fhirBundle || isGenerating}
                  className="border-vintage-gold text-vintage-gold"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Database className="w-4 h-4 mr-2" />
                  )}
                  Push to HIS/EMR
                </Button>
              </div>

              {abdmResult && (
                <div className="p-3 rounded-lg bg-vintage-teal/5 border border-vintage-teal/20">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-vintage-teal mt-0.5" />
                    <p className="text-sm text-foreground">{abdmResult}</p>
                  </div>
                </div>
              )}

              {hisResult && (
                <div className="p-3 rounded-lg bg-vintage-gold/5 border border-vintage-gold/20">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-vintage-gold mt-0.5" />
                    <p className="text-sm text-foreground">{hisResult}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Architecture Preview */}
          <Card className="vintage-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-vintage-blue" />
                <CardTitle className="text-sm" style={{ fontFamily: "Georgia, serif" }}>
                  Integration Architecture
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-full max-w-md p-3 rounded-lg bg-vintage-blue/5 border border-vintage-blue/20">
                  <p className="text-xs font-bold text-vintage-blue">MediKiosk Application</p>
                  <p className="text-[10px] text-muted-foreground">FHIR R4 Bundle Generation</p>
                </div>
                <div className="w-0.5 h-4 bg-border" />
                <div className="w-4 h-0.5 bg-border" />
                <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                  <div className="p-3 rounded-lg bg-vintage-teal/5 border border-vintage-teal/20">
                    <p className="text-xs font-bold text-vintage-teal">ABDM Gateway</p>
                    <p className="text-[10px] text-muted-foreground">ABHA PHR Push</p>
                  </div>
                  <div className="p-3 rounded-lg bg-vintage-gold/5 border border-vintage-gold/20">
                    <p className="text-xs font-bold text-vintage-gold">HIS / EMR</p>
                    <p className="text-[10px] text-muted-foreground">Hospital Systems</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center pb-8">
            <Button
              variant="outline"
              onClick={() => navigate("/technology")}
            >
              View Full Architecture
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
