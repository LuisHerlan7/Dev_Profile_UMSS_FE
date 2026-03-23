import type { ReactNode } from 'react';
import { cn } from '@shared/utils/cn';

export function BenefitCard({
  title,
  description,
  icon,
  className,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition',
        'hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-24px_rgba(15,23,42,0.45)]',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6C63FF]/10 text-[#6C63FF]">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
    </div>
  );
}

