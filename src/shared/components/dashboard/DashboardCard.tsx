import type { ReactNode } from 'react';
import { cn } from '@shared/utils/cn';

type DashboardCardProps = {
  id?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function DashboardCard({
  id,
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: DashboardCardProps) {
  return (
    <section
      id={id}
      className={cn(
        'rounded-[28px] border border-[var(--umss-border)] bg-white shadow-[0_18px_40px_-32px_rgba(15,23,42,0.28)]',
        className
      )}
    >
      {title || description || action ? (
        <div className="flex items-start justify-between gap-4 border-b border-[var(--umss-border)] px-5 py-4">
          <div>
            {title ? <h2 className="text-base font-semibold text-slate-900">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}

      <div className={cn('p-5', contentClassName)}>{children}</div>
    </section>
  );
}
