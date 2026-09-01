import '@vly-ai/integrations';
import { Toaster } from "@/components/ui/sonner";
import { RequireAuth } from "@/components/RequireAuth";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { MockAuthProvider } from "@/components/MockAuthProvider";
import React, { StrictMode, useEffect, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import "./index.css";

// Lazy load route components
const Landing = lazy(() => import("./pages/Landing.tsx"));
const AuthPage = lazy(() => import("./pages/Auth.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

// Patient pages
const PatientLogin = lazy(() => import("./pages/patient/Login.tsx"));
const PatientDashboard = lazy(() => import("./pages/patient/Dashboard.tsx"));
const Interview = lazy(() => import("./pages/patient/Interview.tsx"));
const Assessment = lazy(() => import("./pages/patient/Assessment.tsx"));
const DocumentUpload = lazy(() => import("./pages/patient/Document.tsx"));
const Timeline = lazy(() => import("./pages/patient/Timeline.tsx"));
const Triage = lazy(() => import("./pages/patient/Triage.tsx"));
const CaseSheet = lazy(() => import("./pages/patient/CaseSheet.tsx"));

// Doctor pages
const DoctorLogin = lazy(() => import("./pages/doctor/Login.tsx"));
const DoctorDashboard = lazy(() => import("./pages/doctor/Dashboard.tsx"));
const PatientDetail = lazy(() => import("./pages/doctor/PatientDetail.tsx"));

// Other pages
const Integration = lazy(() => import("./pages/Integration.tsx"));
const Technology = lazy(() => import("./pages/Technology.tsx"));

// Simple loading fallback
function RouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF8F0]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#3B5998] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-[#8B7355]">Loading...</span>
      </div>
    </div>
  );
}

class ToolbarErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: Error) {
    console.warn("[VlyToolbar] Caught error, toolbar disabled:", err.message);
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string; stack: string }
> {
  state = { hasError: false, message: "", stack: "" };
  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      message: error.message || "Unknown runtime error",
      stack: error.stack || "",
    };
  }
  componentDidCatch(err: Error) {
    console.error("[WebContainer preview] Root crash:", err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDF8F0] text-[#3D2B1F] p-6">
          <div className="max-w-lg text-center">
            <p className="text-sm font-semibold">Preview runtime error</p>
            <p className="mt-2 text-xs text-[#8B7355] break-words">
              {this.state.message}
            </p>
            {this.state.stack && (
              <pre className="mt-3 text-left text-[10px] leading-4 text-[#8B7355]/80 max-h-40 overflow-auto rounded border border-[#D4C5B0]/60 p-2">
                {this.state.stack}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// TODO: Replace MockAuthProvider with a real auth provider (Convex, Supabase, etc.) in production

function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootErrorBoundary>
      <ToolbarErrorBoundary>
        <VlyToolbar />
      </ToolbarErrorBoundary>
      <MockAuthProvider>
        <BrowserRouter>
          <RouteSyncer />
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<AuthPage redirectAfterAuth="/dashboard" />} />
              <Route path="/technology" element={<Technology />} />
              <Route path="/integration" element={<Integration />} />

              {/* Patient routes */}
              <Route path="/patient/login" element={<PatientLogin />} />
              <Route path="/patient/dashboard" element={<PatientDashboard />} />
              <Route path="/patient/interview" element={<Interview />} />
              <Route path="/patient/assessment" element={<Assessment />} />
              <Route path="/patient/document" element={<DocumentUpload />} />
              <Route path="/patient/timeline" element={<Timeline />} />
              <Route path="/patient/triage" element={<Triage />} />
              <Route path="/patient/casesheet" element={<CaseSheet />} />

              {/* Doctor routes */}
              <Route path="/doctor/login" element={<DoctorLogin />} />
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor/patient" element={<PatientDetail />} />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <RequireAuth>
                    <Dashboard />
                  </RequireAuth>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster />
      </MockAuthProvider>
    </RootErrorBoundary>
  </StrictMode>,
);
