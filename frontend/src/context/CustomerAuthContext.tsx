import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CustomerSession {
  customerId: bigint;
  username: string;
  name: string;
  sessionToken: string;
}

interface CustomerAuthContextType {
  session: CustomerSession | null;
  login: (session: CustomerSession) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | null>(null);

const SESSION_KEY = 'dairy_customer_session';

function serializeSession(session: CustomerSession): string {
  return JSON.stringify({
    ...session,
    customerId: session.customerId.toString(),
  });
}

function deserializeSession(data: string): CustomerSession | null {
  try {
    const parsed = JSON.parse(data);
    return {
      ...parsed,
      customerId: BigInt(parsed.customerId),
    };
  } catch {
    return null;
  }
}

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<CustomerSession | null>(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      return deserializeSession(stored);
    }
    return null;
  });

  const login = (newSession: CustomerSession) => {
    setSession(newSession);
    sessionStorage.setItem(SESSION_KEY, serializeSession(newSession));
  };

  const logout = () => {
    setSession(null);
    sessionStorage.removeItem(SESSION_KEY);
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        session,
        login,
        logout,
        isAuthenticated: session !== null,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) {
    throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  }
  return ctx;
}
