import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@shared/utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(80,72,229,0.4)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--umss-surface)] disabled:pointer-events-none disabled:opacity-60',
        size === 'sm' ? 'h-9 px-3 text-sm' : 'h-11 px-5 text-sm sm:text-base',
        variant === 'primary' &&
          'bg-[var(--umss-brand)] text-white shadow-sm hover:bg-[#4338CA] active:bg-[#3730A3]',
        variant === 'secondary' &&
          'border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50 active:bg-slate-100',
        variant === 'ghost' && 'text-slate-700 hover:bg-slate-100 active:bg-slate-200',
        className
      )}
      {...props}
    />
  );
}

