import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error';
  title: string;
  message: string;
}

export function StatusModal({ isOpen, onClose, type, title, message }: StatusModalProps) {
  useEffect(() => {
    if (isOpen && type === 'success') {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, type, onClose]);

  if (!isOpen) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm rounded-[32px] border border-[var(--umss-border)] bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <div className={`mb-6 flex h-20 w-20 items-center justify-center rounded-[24px] ${
            isSuccess ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'
          }`}>
            {isSuccess ? (
              <CheckCircle2 className="h-10 w-10" />
            ) : (
              <XCircle className="h-10 w-10" />
            )}
          </div>
          
          <h3 className="mb-2 text-xl font-bold text-slate-900">{title}</h3>
          <p className="mb-8 text-sm leading-relaxed text-slate-600">{message}</p>
          
          <button
            onClick={onClose}
            className={`w-full rounded-2xl py-3.5 text-sm font-semibold text-white shadow-lg transition-all ${
              isSuccess 
                ? 'bg-[var(--umss-brand)] hover:bg-[#4338ca] shadow-indigo-100' 
                : 'bg-red-600 hover:bg-red-700 shadow-red-100'
            }`}
          >
            {isSuccess ? 'Entendido' : 'Cerrar y Reintentar'}
          </button>
        </div>
      </div>
    </div>
  );
}
