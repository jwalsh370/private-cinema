// src/components/ProtectedRoute.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import  LoginForm  from './LoginForm';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return <>{children}</>;
}
