import React from 'react';
import { Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success' }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none animate-fadeIn">
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#1e2029]/95 dark:bg-[#1e2029]/95 text-white shadow-2xl border border-white/10 backdrop-blur-md">
        {type === 'success' && <CheckCircle className="w-4 h-4 text-[#ff5e1a] shrink-0" />}
        {type === 'error' && <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />}
        {type === 'info' && <Sparkles className="w-4 h-4 text-[#ff5e1a] shrink-0" />}
        <span className="text-xs font-bold tracking-wide">{message}</span>
      </div>
    </div>
  );
};
