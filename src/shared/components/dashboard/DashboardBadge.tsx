import type { ReactNode } from 'react';
import { cn } from '@shared/utils/cn';

type DashboardBadgeProps = {
  children: ReactNode;
  tone?: 'neutral' | 'brand' | 'success' | 'warning';
  className?: string;
};

const toneClasses = {
  neutral: 'border-[var(--umss-border)] bg-[var(--umss-surface)] text-slate-600',
  brand: 'border-transparent bg-[var(--umss-lavender)] text-[var(--umss-brand)]',
  success: 'border-transparent bg-[rgba(16,185,129,0.12)] text-[var(--umss-success)]',
  warning: 'border-transparent bg-[rgba(245,158,11,0.12)] text-[var(--umss-warning)]',
};

export function DashboardBadge({
  children,
  tone = 'neutral',
  className,
}: DashboardBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium',
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
