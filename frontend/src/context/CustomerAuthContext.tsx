import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CustomerSession {
  customerId: bigint;
  username: string;
  name: string;
  sessionToken: string;
}

interface CustomerAuthContextType {
  session: CustomerSession | null;
  isAuthenticated: boolean;
  login: (session: CustomerSession) => void;
  logout: () => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | null>(null);

const SESSION_KEY = 'customer_session';

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<CustomerSession | null>(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...parsed, customerId: BigInt(parsed.customerId) };
      }
    } catch {
      // ignore
    }
    return null;
  });

  const login = (newSession: CustomerSession) => {
    setSession(newSession);
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        ...newSession,
        customerId: newSession.customerId.toString(),
      }));
    } catch {
      // ignore
    }
  };

  const logout = () => {
    setSession(null);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <CustomerAuthContext.Provider value={{ session, isAuthenticated: !!session, login, logout }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  return ctx;
}
