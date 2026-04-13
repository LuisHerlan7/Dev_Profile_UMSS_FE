import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@shared/utils/cn';

export function SocialButton({
  icon,
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { icon: ReactNode }) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition',
        'hover:bg-slate-50 active:bg-slate-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        className
      )}
      {...props}
    >
      <span className="text-slate-900">{icon}</span>
      <span>{children}</span>
    </button>
  );
}

