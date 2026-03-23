import type { ButtonHTMLAttributes } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@shared/utils/cn';

export type ButtonBackProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  fallbackTo?: string;
};

export function ButtonBack({ className, fallbackTo = '/', ...props }: ButtonBackProps) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition',
        'hover:bg-slate-50 active:bg-slate-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        className
      )}
      onClick={(e) => {
        props.onClick?.(e);
        if (e.defaultPrevented) return;
        navigate(-1);
        window.setTimeout(() => {
          if (window.location.pathname === '/login' || window.location.pathname === '/register') {
            navigate(fallbackTo);
          }
        }, 0);
      }}
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
      <span>Atrás</span>
    </button>
  );
}

