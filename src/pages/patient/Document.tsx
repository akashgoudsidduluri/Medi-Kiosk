import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePatientStore } from "@/store/patientStore";
import { Header } from "@/components/shared/Header";
import { StepProgress } from "@/components/shared/StepProgress";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import { ocrService } from "@/services/ocrService";
import {
  ArrowRight,
  ArrowLeft,
  Upload,
  FileText,
  Loader2,
  Check,
  Eye,
  X,
} from "lucide-react";

export default function DocumentUpload() {
  const navigate = useNavigate();
  const { documents, addDocument, setStep } = usePatientStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<{
    date: string;
    medication: string;
    observation: string;
    confidence: { date: number; medication: number; observation: number };
  } | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setExtractedData(null);
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);

    try {
      const result = await ocrService.processDocument(selectedFile);
      const entities = await ocrService.extractEntities(result.rawText);

      setExtractedData({
        date: entities.date,
        medication: entities.medication,
        observation: entities.observation,
        confidence: entities.confidence,
      });
    } catch {
      console.error("OCR processing failed");
    }

    setIsProcessing(false);
  };

  const handleSave = () => {
    if (!selectedFile || !extractedData) return;

    addDocument({
      id: `doc-${Date.now()}`,
      fileName: selectedFile.name,
      fileType: selectedFile.type,
      extractedData: {
        date: extractedData.date,
        medication: extractedData.medication,
        observation: extractedData.observation,
      },
      confidence: extractedData.confidence,
    });

    setSelectedFile(null);
    setExtractedData(null);
  };

  return (
    <div className="min-h-screen vintage-texture">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <StepProgress
            currentStep="documents"
            completedSteps={["login", "consent", "interview", "ayush"]}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-vintage-teal/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-vintage-teal" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>
                Document Intelligence
              </h1>
              <p className="text-xs text-muted-foreground">
                Upload prescriptions, lab reports, or medical records for OCR extraction
              </p>
            </div>
          </div>

          {/* Upload Area */}
          <Card className="vintage-card">
            <CardContent className="p-6">
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-vintage-teal/40 hover:bg-vintage-teal/5 transition-all">
                <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground font-medium">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, JPG, or PNG — Max 10MB
                </p>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                />
              </label>

              {selectedFile && (
                <div className="mt-4 p-3 rounded-lg bg-muted flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-vintage-teal" />
                    <span className="text-sm text-foreground">{selectedFile.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!extractedData && (
                      <Button
                        size="sm"
                        className="bg-vintage-teal hover:bg-vintage-teal/90 text-white"
                        onClick={handleProcess}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3 mr-1" />
                            Extract Data
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedFile(null);
                        setExtractedData(null);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="mt-4 flex items-center justify-center gap-3 p-4 rounded-lg bg-vintage-teal/5">
                  <Loader2 className="w-5 h-5 animate-spin text-vintage-teal" />
                  <div>
                    <p className="text-sm font-medium text-foreground">OCR Processing...</p>
                    <p className="text-xs text-muted-foreground">
                      Extracting text and entities from document
                    </p>
                  </div>
                </div>
              )}

              <DisclaimerBanner type="simulated" className="mt-4" />
            </CardContent>
          </Card>

          {/* Extracted Results */}
          {extractedData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="vintage-card">
                <CardHeader>
                  <CardTitle className="text-sm" style={{ fontFamily: "Georgia, serif" }}>
                    Extracted Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "Date", value: extractedData.date, conf: extractedData.confidence.date },
                    { label: "Medication", value: extractedData.medication, conf: extractedData.confidence.medication },
                    { label: "Observation", value: extractedData.observation, conf: extractedData.confidence.observation },
                  ].map((item) => (
                    <div key={item.label} className="p-3 rounded-lg bg-parchment border border-border">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {item.label}
                        </p>
                        <span className={`text-[10px] font-bold ${
                          item.conf >= 85
                            ? "text-vintage-green"
                            : item.conf >= 60
                              ? "text-vintage-gold"
                              : "text-vintage-red"
                        }`}>
                          {item.conf}% confidence
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{item.value}</p>
                    </div>
                  ))}

                  <Button
                    className="w-full bg-vintage-teal hover:bg-vintage-teal/90 text-white"
                    onClick={handleSave}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Save Document
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Saved Documents */}
          {documents.length > 0 && (
            <Card className="vintage-card">
              <CardHeader>
                <CardTitle className="text-sm" style={{ fontFamily: "Georgia, serif" }}>
                  Uploaded Documents ({documents.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {documents.map((doc: { id: string; fileName: string; extractedData: { date: string; medication: string } }) => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg bg-parchment border border-border">
                    <FileText className="w-4 h-4 text-vintage-teal flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{doc.fileName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {doc.extractedData.date} — {doc.extractedData.medication}
                      </p>
                    </div>
                    <Check className="w-4 h-4 text-vintage-green flex-shrink-0" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between pb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/patient/assessment")}
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back
          </Button>

          <Button
            className="bg-vintage-blue hover:bg-vintage-blue/90"
            onClick={() => {
              setStep("timeline");
              navigate("/patient/timeline");
            }}
          >
            Continue to Timeline
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
