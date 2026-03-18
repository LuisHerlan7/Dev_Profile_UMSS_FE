import type { InputHTMLAttributes } from 'react';
import { cn } from '@shared/utils/cn';

export function TextField({
  label,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
}) {
  return (
    <label className={cn('block', className)}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        {...props}
        className={cn(
          'mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm',
          'placeholder:text-slate-400',
          'focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/35 focus:border-[#6C63FF]/40',
          'transition'
        )}
      />
    </label>
  );
}

