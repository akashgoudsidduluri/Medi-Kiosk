/**
 * Mock Auth Hook — Demo / Prototype
 *
 * Replaces Convex-based auth with a simple localStorage-based mock.
 * The actual patient and doctor login flows (/patient/login, /doctor/login)
 * handle their own state via the patientStore / Zustand.
 *
 * TODO: Replace this with a real auth provider (Convex, Supabase, etc.)
 *       when moving to production.
 */

import { useContext } from "react";
import { MockAuthContext } from "@/components/MockAuthProvider";

export function useAuth() {
  const ctx = useContext(MockAuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within MockAuthProvider");
  }
  return ctx;
}
