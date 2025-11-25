// src/contexts/AuthContext.tsx
'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login - accepts any non-empty credentials
    if (email && password) {
      setUser({
        id: '1',
        email: email,
        name: 'Test User',
        role: 'admin'
      });
      return true;
    }
    return false;
  };

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      // Check if user was previously logged in (localStorage, cookies, etc.)
      setLoading(false);
    };
    initAuth();
  }, []);

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
