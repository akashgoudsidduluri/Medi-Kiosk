import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePatientStore } from "@/store/patientStore";
import { Header } from "@/components/shared/Header";
import { StepProgress } from "@/components/shared/StepProgress";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import { getOcrService } from "@/services/serviceRegistry";
import { parseDocumentText } from "@/services/documents/documentParser";
import { DocumentExtraction, ClinicalFact } from "@/types";
import {
  ArrowRight,
  ArrowLeft,
  Upload,
  FileText,
  Loader2,
  Check,
  Eye,
  X,
  AlertCircle,
} from "lucide-react";

const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];

export default function DocumentUpload() {
  const navigate = useNavigate();
  const { documents, addDocument, setStep, clinicalState, updateClinicalState } = usePatientStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string>("");
  const [processedDocument, setProcessedDocument] = useState<DocumentExtraction | null>(null);

  const uploadedDocs = useMemo(() => documents ?? [], [documents]);

  const buildDocumentId = (file: File) => {
    const hash = `${file.name}-${file.size}-${file.lastModified}`;
    return `doc-${hash.replace(/[^a-zA-Z0-9]/g, "-")}`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type) && !/\.(pdf|png|jpe?g)$/i.test(file.name)) {
      setError("Unsupported file type. Please upload a PDF, PNG, JPG, or JPEG file.");
      setSelectedFile(null);
      setOcrText("");
      setProcessedDocument(null);
      return;
    }

    setSelectedFile(file);
    setError(null);
    setOcrText("");
    setProcessedDocument(null);
  };

  const handleProcess = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setError(null);

    try {
      const ocrService = getOcrService();
      const result = await ocrService.extractText(selectedFile);

      if (!result?.text?.trim()) {
        throw new Error("OCR returned an empty result.");
      }

      const documentId = buildDocumentId(selectedFile);
      const parsed = parseDocumentText(result.text, documentId);

      const docRecord: DocumentExtraction = {
        id: documentId,
        fileName: selectedFile.name,
        filename: selectedFile.name,
        fileType: selectedFile.type || "application/octet-stream",
        type: selectedFile.type || "application/octet-stream",
        rawText: result.text,
        timestamp: new Date().toISOString(),
        status: "completed",
        extractedData: parsed.extractedData,
        confidence: parsed.confidence,
        documentFacts: parsed.facts,
      };

      setOcrText(result.text);
      setProcessedDocument(docRecord);

      const existingRefs = new Set(clinicalState.documentReferences ?? []);
      const existingFacts = [...(clinicalState.documentFacts ?? [])];
      const nextRefs = [...existingRefs];
      if (!existingRefs.has(documentId)) {
        nextRefs.push(documentId);
      }

      const nextFacts = [...existingFacts];
      parsed.facts.forEach((fact) => {
        const exists = nextFacts.some((entry) => entry.documentId === fact.documentId && entry.field === fact.field && entry.value === fact.value);
        if (!exists) nextFacts.push(fact);
      });

      updateClinicalState({
        documentFacts: nextFacts,
        documentReferences: nextRefs,
      });

      const existingTimeline = usePatientStore.getState().timeline ?? [];
      const uniqTimeline = [...existingTimeline];
      for (const event of parsed.timelineEvents) {
        if (!uniqTimeline.some((entry) => entry.id === event.id)) {
          uniqTimeline.push(event);
        }
      }
      usePatientStore.setState({ timeline: uniqTimeline });

      addDocument(docRecord);
    } catch (err) {
      console.error("OCR processing failed:", err);
      setError(err instanceof Error ? err.message : "OCR processing failed. Please try another document.");
      const documentId = selectedFile ? buildDocumentId(selectedFile) : `doc-${Date.now()}`;
      const failedDoc: DocumentExtraction = {
        id: documentId,
        fileName: selectedFile?.name ?? "unknown-document",
        filename: selectedFile?.name ?? "unknown-document",
        fileType: selectedFile?.type || "application/octet-stream",
        type: selectedFile?.type || "application/octet-stream",
        rawText: selectedFile ? "OCR failed" : "",
        timestamp: new Date().toISOString(),
        status: "failed",
        extractedData: { date: "Not detected", diagnosis: "Not detected", medications: "Not detected", observation: "Not detected" },
        confidence: { date: 0, diagnosis: 0, medications: 0, observation: 0 },
        error: err instanceof Error ? err.message : "OCR processing failed.",
        documentFacts: [],
      };
      setProcessedDocument(failedDoc);
      addDocument(failedDoc);
    } finally {
      setIsProcessing(false);
    }
  };

  const removeSelected = () => {
    setSelectedFile(null);
    setOcrText("");
    setProcessedDocument(null);
    setError(null);
  };

  const removeDocument = (docId: string) => {
    const currentDocs = usePatientStore.getState().documents ?? [];
    const nextDocs = currentDocs.filter((doc) => doc.id !== docId);
    usePatientStore.setState({ documents: nextDocs });

    const nextRefs = (clinicalState.documentReferences ?? []).filter((ref) => ref !== docId);
    const nextFacts = (clinicalState.documentFacts ?? []).filter((fact) => fact.documentId !== docId);
    updateClinicalState({
      documentFacts: nextFacts,
      documentReferences: nextRefs,
    });

    const nextTimeline = (usePatientStore.getState().timeline ?? []).filter((event) => !event.id.startsWith(`${docId}-`));
    usePatientStore.setState({ timeline: nextTimeline });
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

          <Card className="vintage-card">
            <CardContent className="p-6">
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-vintage-teal/40 hover:bg-vintage-teal/5 transition-all">
                <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground font-medium">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, JPG, PNG — Max 10MB
                </p>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,image/png,image/jpeg,application/pdf"
                  onChange={handleFileSelect}
                />
              </label>

              {selectedFile && (
                <div className="mt-4 p-3 rounded-lg bg-muted flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-vintage-teal" />
                    <span className="text-sm text-foreground">{selectedFile.name}</span>
                    <span className="text-xs text-muted-foreground">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!processedDocument && (
                      <Button size="sm" className="bg-vintage-teal hover:bg-vintage-teal/90 text-white" onClick={handleProcess} disabled={isProcessing}>
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
                    <Button size="sm" variant="ghost" onClick={removeSelected}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {isProcessing && (
                <div className="mt-4 flex items-center justify-center gap-3 p-4 rounded-lg bg-vintage-teal/5">
                  <Loader2 className="w-5 h-5 animate-spin text-vintage-teal" />
                  <div>
                    <p className="text-sm font-medium text-foreground">OCR Processing...</p>
                    <p className="text-xs text-muted-foreground">Extracting text and structured document facts</p>
                  </div>
                </div>
              )}

              <DisclaimerBanner type="simulated" className="mt-4" />
            </CardContent>
          </Card>

          {ocrText && (
            <Card className="vintage-card">
              <CardHeader>
                <CardTitle className="text-sm" style={{ fontFamily: "Georgia, serif" }}>
                  OCR Result: {selectedFile?.name || "Document"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>OCR Status: Complete</span>
                  <span>{processedDocument?.status === "failed" ? "Failed" : "Ready"}</span>
                </div>
                <div className="rounded-lg bg-muted p-3 border border-border">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Extracted text</p>
                  <pre className="whitespace-pre-wrap text-sm text-foreground font-mono leading-6">{ocrText}</pre>
                </div>
              </CardContent>
            </Card>
          )}

          {processedDocument && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="vintage-card">
                <CardHeader>
                  <CardTitle className="text-sm" style={{ fontFamily: "Georgia, serif" }}>
                    Structured Extraction
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    {Object.entries(processedDocument.extractedData ?? {}).map(([key, value]) => (
                      <div key={key} className="p-3 rounded-lg bg-parchment border border-border">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{key}</p>
                          <span className={`text-[10px] font-bold ${processedDocument.confidence?.[key] && processedDocument.confidence[key] >= 80 ? "text-vintage-green" : processedDocument.confidence?.[key] && processedDocument.confidence[key] >= 60 ? "text-vintage-gold" : "text-muted-foreground"}`}>
                            {(processedDocument.confidence?.[key] ?? 0) ? `${Math.round((processedDocument.confidence?.[key] ?? 0) * 100)}%` : "0%"}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{value || "Not detected"}</p>
                      </div>
                    ))}
                  </div>

                  {processedDocument.documentFacts && processedDocument.documentFacts.length > 0 && (
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Document facts</p>
                      <div className="space-y-2">
                        {processedDocument.documentFacts.map((fact) => (
                          <div key={`${fact.documentId ?? processedDocument.id}-${fact.field}-${fact.value}`} className="flex items-start justify-between gap-3 rounded-lg bg-background p-2">
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground">{fact.field}</p>
                              <p className="text-sm text-foreground">{fact.value}</p>
                            </div>
                            <span className="text-[10px] text-vintage-teal">{fact.source}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {processedDocument.error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{processedDocument.error}</div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {uploadedDocs.length > 0 && (
            <Card className="vintage-card">
              <CardHeader>
                <CardTitle className="text-sm" style={{ fontFamily: "Georgia, serif" }}>
                  Uploaded Documents ({uploadedDocs.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {uploadedDocs.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg bg-parchment border border-border">
                    <FileText className="w-4 h-4 text-vintage-teal flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{doc.fileName || doc.filename}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {doc.status || "pending"} • {doc.timestamp ? new Date(doc.timestamp).toLocaleString("en-IN") : "just now"}
                      </p>
                    </div>
                    {doc.status === "completed" ? <Check className="w-4 h-4 text-vintage-green flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-vintage-red flex-shrink-0" />}
                    <Button size="sm" variant="ghost" onClick={() => removeDocument(doc.id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </motion.div>

        <div className="mt-6 flex items-center justify-between pb-8">
          <Button variant="outline" onClick={() => navigate("/patient/assessment")}>
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back
          </Button>

          <Button className="bg-vintage-blue hover:bg-vintage-blue/90" onClick={() => { setStep("timeline"); navigate("/patient/timeline"); }}>
            Continue to Timeline
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
