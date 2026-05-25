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
        'rounded-[28px] border shadow-[0_18px_40px_-32px_rgba(15,23,42,0.28)]',
        className
      )}
      style={{ backgroundColor: 'var(--dm-card)', borderColor: 'var(--dm-border)' }}
    >
      {title || description || action ? (
        <div
          className="flex items-start justify-between gap-4 border-b px-5 py-4"
          style={{ borderColor: 'var(--dm-border)' }}
        >
          <div>
            {title ? (
              <h2 className="text-base font-semibold" style={{ color: 'var(--dm-text-primary)' }}>
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-1 text-sm" style={{ color: 'var(--dm-text-secondary)' }}>
                {description}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}

      <div className={cn('p-5', contentClassName)}>{children}</div>
    </section>
  );
}
