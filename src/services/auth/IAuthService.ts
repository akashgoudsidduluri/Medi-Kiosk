import { PatientIdentity, AuthProvider, VerificationStatus } from "@/types";

/**
 * IAuthService — Authentication service abstraction
 *
 * Defines the contract for patient authentication flows.
 * This allows demo mode to work locally while keeping
 * the architecture ready for real ABDM/Aadhaar integration later.
 */

export interface AadhaarOtpRequest {
  aadhaarNumber: string;
  consentGiven: boolean;
}

export interface AadhaarOtpVerification {
  aadhaarNumber: string;
  otp: string;
}

export interface AbhaVerification {
  abhaNumber: string;
}

export interface MobileOtpRequest {
  mobileNumber: string;
}

export interface MobileOtpVerification {
  mobileNumber: string;
  otp: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  identity?: PatientIdentity;
}

export interface IAuthService {
  /**
   * Request OTP for Aadhaar verification
   * Demo: generates fake OTP locally
   * Production: would call authorized UIDAI adapter
   */
  requestAadhaarOtp(request: AadhaarOtpRequest): Promise<AuthResult>;

  /**
   * Verify Aadhaar OTP
   * Demo: validates against "123456"
   * Production: would call authorized UIDAI adapter
   */
  verifyAadhaarOtp(verification: AadhaarOtpVerification): Promise<AuthResult>;

  /**
   * Login with ABHA
   * Demo: verifies locally
   * Production: would call ABDM ABHA adapter
   */
  loginWithAbha(request: AbhaVerification): Promise<AuthResult>;

  /**
   * Request OTP for mobile verification
   * Demo: generates fake OTP locally
   * Production: would use authorized SMS gateway
   */
  requestMobileOtp(request: MobileOtpRequest): Promise<AuthResult>;

  /**
   * Verify mobile OTP
   * Demo: validates against "123456"
   * Production: would verify against SMS gateway
   */
  verifyMobileOtp(verification: MobileOtpVerification): Promise<AuthResult>;

  /**
   * Get currently authenticated patient
   * Demo: retrieves from localStorage
   * Production: would call session/token endpoint
   */
  getCurrentPatient(): Promise<PatientIdentity | null>;

  /**
   * Logout current patient
   * Demo: clears localStorage
   * Production: would invalidate session/token
   */
  logout(): Promise<void>;
}
