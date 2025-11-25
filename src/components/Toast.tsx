// src/components/Toast.tsx
'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  }[type];

  return (
    <div className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg fixed top-4 right-4 z-50 transition-all duration-300 animate-in slide-in-from-right-8`}>
      {message}
    </div>
  );
}
