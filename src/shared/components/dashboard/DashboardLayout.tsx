import type { ReactNode } from 'react';
import { cn } from '@shared/utils/cn';

type DashboardLayoutProps = {
  sidebar: ReactNode;
  topbar: ReactNode;
  children: ReactNode;
  className?: string;
  sidebarCollapsed?: boolean;
};

export function DashboardLayout({
  sidebar,
  topbar,
  children,
  className,
  sidebarCollapsed = false,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--umss-surface)]">
      <div className="flex min-h-screen w-full flex-col lg:flex-row">
        <aside
          className={cn(
            'w-full shrink-0 overflow-hidden border-b border-[var(--umss-border)] bg-white transition-[width] duration-300 lg:sticky lg:top-0 lg:h-screen lg:border-r lg:border-b-0',
            sidebarCollapsed ? 'lg:w-[88px]' : 'lg:w-[280px]'
          )}
        >
          {sidebar}
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="border-b border-[var(--umss-border)] bg-white/90 backdrop-blur-sm">
            {topbar}
          </header>

          <main className={cn('flex-1 p-4 sm:p-5 lg:p-6', className)}>{children}</main>
        </div>
      </div>
    </div>
  );
}
