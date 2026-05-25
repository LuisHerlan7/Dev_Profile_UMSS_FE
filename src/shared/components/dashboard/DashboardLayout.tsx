import { cloneElement, isValidElement, useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@shared/utils/cn';

type DashboardLayoutProps = {
  sidebar: ReactNode;
  topbar: ReactNode;
  children: ReactNode;
  className?: string;
  sidebarCollapsed?: boolean;
  mobileSidebarOpen?: boolean;
  onCloseMobileSidebar?: () => void;
};

export function DashboardLayout({
  sidebar,
  topbar,
  children,
  className,
  sidebarCollapsed = false,
  mobileSidebarOpen = false,
  onCloseMobileSidebar,
}: DashboardLayoutProps) {
  const mobileSidebar = isValidElement(sidebar)
    ? cloneElement(sidebar, {
        collapsed: false,
        mobileDrawer: true,
        onToggleCollapse: undefined,
      })
    : sidebar;

  useEffect(() => {
    if (!mobileSidebarOpen) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [mobileSidebarOpen]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--dm-bg)' }}>
      <div className="flex min-h-screen w-full flex-col lg:flex-row">
        {mobileSidebarOpen ? (
          <div className="fixed inset-0 z-[80] bg-slate-950/45 backdrop-blur-sm lg:hidden" onClick={onCloseMobileSidebar}>
            <aside
              className="relative flex h-[100dvh] w-[min(88vw,320px)] flex-col overflow-hidden border-r shadow-2xl"
              style={{ backgroundColor: 'var(--dm-sidebar)', borderColor: 'var(--dm-border)' }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={onCloseMobileSidebar}
                className="absolute top-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-2xl border shadow-sm transition"
                style={{ backgroundColor: 'var(--dm-card)', borderColor: 'var(--dm-border)', color: 'var(--dm-text-secondary)' }}
                aria-label="Cerrar menú"
              >
                <X className="h-5 w-5" />
              </button>
              <div
                className="min-h-0 flex-1 overflow-y-scroll overscroll-contain [scrollbar-gutter:stable] [touch-action:pan-y] [-webkit-overflow-scrolling:touch]"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {mobileSidebar}
              </div>
            </aside>
          </div>
        ) : null}

        <aside
          className={cn(
            'hidden shrink-0 overflow-hidden border-b border-[var(--umss-border)] transition-[width] duration-300 lg:sticky lg:top-0 lg:flex lg:h-screen lg:border-r lg:border-b-0',
            sidebarCollapsed ? 'lg:w-[88px]' : 'lg:w-[280px]'
          )}
          style={{ backgroundColor: 'var(--dm-sidebar)' }}
        >
          {sidebar}
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-50 border-b backdrop-blur-md" style={{ backgroundColor: 'var(--dm-topbar)', borderColor: 'var(--dm-border)' }}>
            {topbar}
          </header>

          <main className={cn('flex-1 p-4 sm:p-5 lg:p-6', className)}>{children}</main>
        </div>
      </div>
    </div>
  );
}
