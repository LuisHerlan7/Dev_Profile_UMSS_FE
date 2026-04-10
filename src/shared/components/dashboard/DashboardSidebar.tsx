import { useEffect, useState, type ReactNode } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { cn } from '@shared/utils/cn';

export type DashboardSidebarItem = {
  id: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
  meta?: string;
};

type DashboardSidebarProps = {
  brand: string;
  subtitle: string;
  profileName: string;
  profileRole: string;
  profileImageUrl?: string | null;
  profileBadge?: string;
  navItems: DashboardSidebarItem[];
  footer?: ReactNode;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onItemSelect?: (id: string) => void;
};

export function DashboardSidebar({
  brand,
  subtitle,
  profileName,
  profileRole,
  profileImageUrl,
  profileBadge,
  navItems,
  footer,
  collapsed = false,
  onToggleCollapse,
  onItemSelect,
}: DashboardSidebarProps) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [profileImageUrl]);

  const initials = profileName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  const renderAvatar = () => (
    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#6C63FF] via-[var(--umss-brand)] to-[var(--umss-accent)] text-white shadow-lg shadow-[rgba(80,72,229,0.28)]">
      {profileImageUrl && !imgError ? (
        <img 
          src={profileImageUrl} 
          alt={profileName} 
          className="h-full w-full object-cover" 
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="text-lg font-semibold">{initials}</span>
      )}
    </div>
  );

  return (
    <div
      className={cn(
        'flex h-full flex-col gap-5 overflow-hidden p-4 sm:p-5',
        collapsed && 'items-center px-2 py-4'
      )}
    >
      {collapsed ? (
        <div className="flex w-full flex-col items-center gap-3">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--umss-border)] bg-white text-slate-500 transition hover:text-[var(--umss-brand)]"
            aria-label="Expandir barra lateral"
            title="Expandir barra lateral"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>

          {renderAvatar()}
        </div>
      ) : (
        <div className="w-full space-y-4">
          <div className="rounded-[28px] border border-[var(--umss-border)] bg-[var(--umss-surface)] p-4 shadow-[0_20px_45px_-34px_rgba(15,23,42,0.35)]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                {renderAvatar()}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold leading-tight text-slate-900">{brand}</p>
                  <p className="mt-1 text-xs leading-snug text-slate-500">{subtitle}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onToggleCollapse}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[var(--umss-border)] bg-white text-slate-500 transition hover:text-[var(--umss-brand)]"
                aria-label="Colapsar barra lateral"
                title="Colapsar barra lateral"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className={cn('space-y-2', collapsed && 'w-full')} aria-label="Dashboard navigation">
        {navItems.map((item) => (
          <div key={item.id} className="group relative">
            <button
              type="button"
              onClick={() => onItemSelect?.(item.id)}
              className={cn(
                'flex w-full items-center rounded-2xl text-left text-sm transition',
                collapsed ? 'justify-center px-0 py-3' : 'justify-between px-3 py-3',
                item.active
                  ? 'bg-[var(--umss-lavender)] text-[var(--umss-brand)] shadow-sm'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              )}
              aria-label={item.label}
              title={collapsed ? item.label : undefined}
            >
              <span className={cn('flex items-center', collapsed ? 'justify-center' : 'gap-3')}>
                <span
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-xl',
                    item.active ? 'bg-white text-[var(--umss-brand)]' : 'bg-[var(--umss-surface)]'
                  )}
                >
                  {item.icon}
                </span>

                {!collapsed ? <span>{item.label}</span> : null}
              </span>

              {!collapsed && item.meta ? (
                <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-slate-500">
                  {item.meta}
                </span>
              ) : null}
            </button>

            {collapsed ? (
              <span className="pointer-events-none absolute top-1/2 left-full z-20 ml-3 hidden -translate-y-1/2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium whitespace-nowrap text-white shadow-lg group-hover:block">
                {item.label}
              </span>
            ) : null}
          </div>
        ))}
      </nav>

      {footer ? <div className={cn('mt-auto w-full', collapsed && 'max-w-[56px]')}>{footer}</div> : null}
    </div>
  );
}
