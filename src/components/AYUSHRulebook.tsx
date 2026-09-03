import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getParameter,
  getAllParameters,
  getParameterOrder,
  getTranslatedText,
  type DashavidhaParameter,
} from "@/lib/ayushRulebook";
import { BookOpen, X, ChevronRight, Leaf } from "lucide-react";

interface AYUSHRulebookProps {
  currentParameterId?: string;
  language?: string;
}

export function AYUSHRulebook({ currentParameterId, language = "English" }: AYUSHRulebookProps) {
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"current" | "all">("current");
  const [selectedParam, setSelectedParam] = useState(currentParameterId || "prakriti");

  const currentParameter = selectedParam ? getParameter(selectedParam) : null;
  const allParameters = getAllParameters();

  const handleSelectParameter = (id: string) => {
    setSelectedParam(id);
    setViewMode("current");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          title="View AYUSH Parameter Rulebook"
        >
          <BookOpen className="w-4 h-4" />
          <span className="hidden sm:inline">Rulebook</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:w-[500px] overflow-hidden flex flex-col">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-vintage-gold" />
              <SheetTitle>AYUSH Dashavidha Rulebook</SheetTitle>
            </div>
          </div>
        </SheetHeader>

        {/* Tab buttons */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={viewMode === "current" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("current")}
            disabled={!currentParameter}
          >
            Current Parameter
          </Button>
          <Button
            variant={viewMode === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("all")}
          >
            All Parameters
          </Button>
        </div>

        {/* Current Parameter View */}
        <AnimatePresence mode="wait">
          {viewMode === "current" && currentParameter && (
            <motion.div
              key="current"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 overflow-hidden flex flex-col"
            >
              <ScrollArea className="flex-1">
                <div className="pr-4 space-y-4">
                  {/* Parameter Name */}
                  <Card className="vintage-card border-vintage-gold/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">
                        <span className="text-vintage-gold">
                          {getTranslatedText(currentParameter, language, "name")}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {currentParameter.sanskritName}
                        </span>
                      </CardTitle>
                    </CardHeader>
                  </Card>

                  {/* Description */}
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-foreground">Overview</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {getTranslatedText(currentParameter, language, "description")}
                    </p>
                  </div>

                  {/* Educational Context */}
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-foreground">
                      Understanding This Parameter
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 p-3 rounded">
                      {currentParameter.educationalContext}
                    </p>
                  </div>

                  {/* Options */}
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-foreground">
                      Possible Observations
                    </h4>
                    <div className="space-y-2">
                      {currentParameter.options.map((option) => (
                        <div
                          key={option.value}
                          className="border border-border rounded p-2 bg-card hover:bg-muted/50 transition-colors"
                        >
                          <p className="font-medium text-sm">{option.label}</p>
                          <p className="text-xs text-muted-foreground mt-1">{option.meaning}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-900/30">
                    <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                      <strong>Educational Note:</strong> This rulebook provides information for
                      understanding AYUSH assessment principles. It is not diagnostic or
                      prescriptive. Consultation with a qualified AYUSH practitioner is
                      recommended for personalized assessment and care.
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </motion.div>
          )}

          {/* All Parameters View */}
          {viewMode === "all" && (
            <motion.div
              key="all"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 overflow-hidden"
            >
              <ScrollArea className="h-full">
                <div className="pr-4 space-y-2">
                  {allParameters.map((param, index) => (
                    <button
                      key={param.id}
                      onClick={() => handleSelectParameter(param.id)}
                      className={`w-full text-left p-3 rounded border transition-all ${
                        selectedParam === param.id
                          ? "bg-vintage-gold/10 border-vintage-gold text-foreground"
                          : "border-border hover:border-border/80 hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {index + 1}. {getTranslatedText(param, language, "name")}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {param.sanskritName}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 opacity-50" />
                      </div>
                    </button>
                  ))}

                  {/* Disclaimer */}
                  <div className="mt-6 p-3 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-900/30">
                    <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                      <strong>Educational Reference:</strong> The Dashavidha Pariksha (10-Fold
                      Examination) is a foundational AYUSH assessment framework. This rulebook
                      provides patient-friendly educational context and is not a substitute for
                      professional clinical judgment.
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
}

/**
 * Desktop Sidebar Component (alternative to drawer for wider screens)
 * This can be used in a layout that has room for a persistent sidebar
 */
export function AYUSHRulebookSidebar({
  currentParameterId,
  language = "English",
}: AYUSHRulebookProps) {
  const [viewMode, setViewMode] = useState<"current" | "all">("current");
  const [selectedParam, setSelectedParam] = useState(currentParameterId || "prakriti");

  const currentParameter = selectedParam ? getParameter(selectedParam) : null;
  const allParameters = getAllParameters();

  const handleSelectParameter = (id: string) => {
    setSelectedParam(id);
    setViewMode("current");
  };

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Leaf className="w-4 h-4 text-vintage-gold" />
          <h2 className="font-semibold text-sm">AYUSH Rulebook</h2>
        </div>

        {/* Tab buttons */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === "current" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("current")}
            disabled={!currentParameter}
            className="text-xs"
          >
            Current
          </Button>
          <Button
            variant={viewMode === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("all")}
            className="text-xs"
          >
            All
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {viewMode === "current" && currentParameter && (
            <motion.div
              key="current"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {/* Parameter Name */}
              <div>
                <p className="font-medium text-sm text-vintage-gold">
                  {getTranslatedText(currentParameter, language, "name")}
                </p>
                <p className="text-xs text-muted-foreground">{currentParameter.sanskritName}</p>
              </div>

              {/* Brief Description */}
              <p className="text-xs text-muted-foreground leading-relaxed">
                {currentParameter.description}
              </p>

              {/* Quick Options */}
              <div className="space-y-1">
                {currentParameter.options.slice(0, 3).map((option) => (
                  <p key={option.value} className="text-xs text-muted-foreground truncate">
                    • {option.label}
                  </p>
                ))}
                {currentParameter.options.length > 3 && (
                  <p className="text-xs text-muted-foreground italic">
                    +{currentParameter.options.length - 3} more
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {viewMode === "all" && (
            <motion.div
              key="all"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2"
            >
              {allParameters.map((param, index) => (
                <button
                  key={param.id}
                  onClick={() => handleSelectParameter(param.id)}
                  className={`w-full text-left p-2 rounded text-xs transition-all ${
                    selectedParam === param.id
                      ? "bg-vintage-gold/10 border border-vintage-gold"
                      : "border border-transparent hover:bg-muted"
                  }`}
                >
                  <p className="font-medium truncate">
                    {index + 1}. {param.name}
                  </p>
                  <p className="text-muted-foreground truncate">{param.sanskritName}</p>
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-border bg-muted/30">
        <p className="text-xs text-muted-foreground leading-tight">
          Educational reference only. Consult qualified AYUSH practitioners.
        </p>
      </div>
    </div>
  );
}
