'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'error' | 'success';
  onDismiss: () => void;
}

export default function Toast({ message, type, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-4 py-3 rounded-xl
                  shadow-lg text-sm font-medium max-w-[85vw] text-center
                  ${type === 'error' ? 'bg-coral text-white' : 'bg-sage text-white'}`}
    >
      {message}
    </div>
  );
}
