import { PatientIdentity } from "@/types";
import {
  IAuthService,
  AuthResult,
  AadhaarOtpRequest,
  AadhaarOtpVerification,
  AbhaVerification,
  MobileOtpRequest,
  MobileOtpVerification,
} from "./IAuthService";

/**
 * MockAuthService — Demo authentication
 *
 * Provides local, demo-only authentication flows.
 * Uses localStorage for persistence across page reloads.
 *
 * Demo OTP: 123456
 *
 * No real APIs are called.
 * No real Aadhaar/ABHA data is persisted as patient ID.
 */

const STORAGE_KEY_AUTH = "medikiosk_demo_auth";
const STORAGE_KEY_PENDING_AADHAAR = "medikiosk_demo_pending_aadhaar";
const DEMO_OTP = "123456";

// Demo patient data for linked dependents
const demoLinkedPatients = [
  {
    patientId: "MK-CHILD-001",
    displayName: "Arjun (Child)",
    age: 8,
    relationship: "Son",
  },
  {
    patientId: "MK-CHILD-002",
    displayName: "Priya (Child)",
    age: 12,
    relationship: "Daughter",
  },
];

export class MockAuthService implements IAuthService {
  async requestAadhaarOtp(request: AadhaarOtpRequest): Promise<AuthResult> {
    // Demo: no real OTP is sent
    // Just store that we're in Aadhaar flow
    if (!request.aadhaarNumber || request.aadhaarNumber.length < 4) {
      return { success: false, error: "Invalid Aadhaar number" };
    }

    if (!request.consentGiven) {
      return { success: false, error: "Consent required" };
    }

    // Store partially (never store full Aadhaar)
    localStorage.setItem(
      STORAGE_KEY_PENDING_AADHAAR,
      JSON.stringify({
        lastFourDigits: request.aadhaarNumber.slice(-4),
        requestedAt: new Date().toISOString(),
      })
    );

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));

    return { success: true };
  }

  async verifyAadhaarOtp(verification: AadhaarOtpVerification): Promise<AuthResult> {
    if (verification.otp !== DEMO_OTP) {
      return { success: false, error: "Invalid OTP. Demo OTP: 123456" };
    }

    // Clear pending Aadhaar
    localStorage.removeItem(STORAGE_KEY_PENDING_AADHAAR);

    // Create demo patient identity (Aadhaar is NOT the patient ID)
    const identity: PatientIdentity = {
      patientId: `MK-${Date.now().toString().slice(-6)}`,
      displayName: "Demo Patient (Aadhaar Verified)",
      identityProvider: "aadhaar",
      verificationStatus: "demo",
      isGuardian: true,
      linkedPatientIds: demoLinkedPatients.map((p) => p.patientId),
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(identity));

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 600));

    return { success: true, identity };
  }

  async loginWithAbha(request: AbhaVerification): Promise<AuthResult> {
    if (!request.abhaNumber || request.abhaNumber.length < 4) {
      return { success: false, error: "Invalid ABHA number" };
    }

    // Create demo patient identity with ABHA
    const identity: PatientIdentity = {
      patientId: `MK-${Date.now().toString().slice(-6)}`,
      abhaId: request.abhaNumber,
      displayName: "Demo Patient (ABHA Linked)",
      identityProvider: "abha",
      verificationStatus: "demo",
      isGuardian: true,
      linkedPatientIds: demoLinkedPatients.map((p) => p.patientId),
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(identity));

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 600));

    return { success: true, identity };
  }

  async requestMobileOtp(request: MobileOtpRequest): Promise<AuthResult> {
    if (!request.mobileNumber || request.mobileNumber.length < 10) {
      return { success: false, error: "Invalid mobile number" };
    }

    // Just store that we're in mobile OTP flow
    localStorage.setItem(
      STORAGE_KEY_PENDING_AADHAAR,
      JSON.stringify({
        mobile: request.mobileNumber,
        requestedAt: new Date().toISOString(),
      })
    );

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));

    return { success: true };
  }

  async verifyMobileOtp(verification: MobileOtpVerification): Promise<AuthResult> {
    if (verification.otp !== DEMO_OTP) {
      return { success: false, error: "Invalid OTP. Demo OTP: 123456" };
    }

    localStorage.removeItem(STORAGE_KEY_PENDING_AADHAAR);

    // Create demo patient identity (mobile OTP)
    const identity: PatientIdentity = {
      patientId: `MK-${Date.now().toString().slice(-6)}`,
      displayName: "Demo Patient (Mobile Verified)",
      identityProvider: "mobile",
      verificationStatus: "demo",
      isGuardian: true,
      linkedPatientIds: demoLinkedPatients.map((p) => p.patientId),
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(identity));

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 600));

    return { success: true, identity };
  }

  async getCurrentPatient(): Promise<PatientIdentity | null> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_AUTH);
      return raw ? (JSON.parse(raw) as PatientIdentity) : null;
    } catch {
      return null;
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY_AUTH);
    localStorage.removeItem(STORAGE_KEY_PENDING_AADHAAR);
  }

  // Demo helper: get linked patients for guardian
  getLinkedPatients() {
    return demoLinkedPatients;
  }
}

// Export demo instances for use throughout the app
export function getAuthService(): IAuthService {
  return new MockAuthService();
}

export function getDemoLinkedPatients() {
  return demoLinkedPatients;
}
