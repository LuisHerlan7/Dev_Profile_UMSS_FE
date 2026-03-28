import type { ReactNode } from 'react';
import { cn } from '@shared/utils/cn';
import { DashboardCard } from './DashboardCard';

type DashboardMetricCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  trend?: string;
  trendTone?: 'success' | 'warning' | 'danger' | 'info';
  className?: string;
};

const toneClasses = {
  success: 'bg-[rgba(16,185,129,0.12)] text-[var(--umss-success)]',
  warning: 'bg-[rgba(245,158,11,0.12)] text-[var(--umss-warning)]',
  danger: 'bg-[rgba(239,68,68,0.12)] text-[var(--umss-danger)]',
  info: 'bg-[rgba(59,130,246,0.12)] text-[var(--umss-accent)]',
};

export function DashboardMetricCard({
  icon,
  label,
  value,
  trend,
  trendTone = 'info',
  className,
}: DashboardMetricCardProps) {
  return (
    <DashboardCard className={cn('h-full', className)} contentClassName="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--umss-lavender)] text-[var(--umss-brand)]">
          {icon}
        </div>
        {trend ? (
          <span
            className={cn(
              'rounded-full px-2.5 py-1 text-[11px] font-semibold',
              toneClasses[trendTone]
            )}
          >
            {trend}
          </span>
        ) : null}
      </div>

      <p className="mt-5 text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
    </DashboardCard>
  );
}
