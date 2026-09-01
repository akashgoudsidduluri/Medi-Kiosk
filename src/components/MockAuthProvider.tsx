/**
 * MockAuthProvider — Demo / Prototype
 *
 * Provides a simple localStorage-backed authentication context for the
 * hackathon prototype. Replaces the Convex-based auth system.
 *
 * For this prototype:
 *   - "Admin" sign-in via /auth is persisted in localStorage.
 *   - Patient and Doctor flows use their own separate flows (/patient/login,
 *     /doctor/login) and Zustand store — they don't go through this provider.
 *
 * TODO: Replace with real auth (Convex, Supabase, Firebase, etc.) in
 *       production. The useAuth() hook signature stays the same.
 */

import { createContext, useCallback, useEffect, useState, ReactNode } from "react";

const STORAGE_KEY = "medikiosk_demo_auth";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "doctor" | "patient";
}

interface AuthContextValue {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: MockUser | null | undefined;
  signIn: (credentials: { email: string }) => Promise<void>;
  signOut: () => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const MockAuthContext = createContext<AuthContextValue | null>(null);

function loadFromStorage(): MockUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MockUser) : null;
  } catch {
    return null;
  }
}

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<MockUser | null>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = loadFromStorage();
    setUser(saved);
    setIsLoading(false);
  }, []);

  const signIn = useCallback(async ({ email }: { email: string }) => {
    // Demo mock: any email instantly creates a session
    const mockUser: MockUser = {
      id: "demo-admin-001",
      name: email.split("@")[0] ?? "Demo User",
      email,
      role: "admin",
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    setUser(mockUser);
  }, []);

  const signOut = useCallback(async () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return (
    <MockAuthContext.Provider
      value={{
        isLoading,
        isAuthenticated: !isLoading && user !== null,
        user,
        signIn,
        signOut,
      }}
    >
      {children}
    </MockAuthContext.Provider>
  );
}
