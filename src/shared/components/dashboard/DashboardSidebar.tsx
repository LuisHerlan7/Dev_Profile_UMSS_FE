import { useEffect, useState, type ReactNode } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { cn } from '@shared/utils/cn';
import { useI18n } from '@shared/i18n/I18nProvider';

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
  mobileDrawer?: boolean;
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
  mobileDrawer = false,
  onToggleCollapse,
  onItemSelect,
}: DashboardSidebarProps) {
  const { t } = useI18n();
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
        'flex flex-col gap-5 p-4 sm:p-5',
        mobileDrawer ? 'w-full overflow-visible pb-24' : 'h-full overflow-hidden',
        collapsed && 'items-center px-2 py-4'
      )}
    >
      {collapsed ? (
        <div className="flex w-full flex-col items-center gap-3">
          {onToggleCollapse ? (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border transition hover:text-[var(--umss-brand)]"
              style={{ backgroundColor: 'var(--dm-card)', borderColor: 'var(--dm-border)', color: 'var(--dm-text-secondary)' }}
              aria-label={t('common.expandSidebar')}
              title={t('common.expandSidebar')}
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          ) : null}

          {renderAvatar()}
        </div>
      ) : (
        <div className="w-full space-y-4">
          <div
            className="rounded-[28px] border p-4 shadow-[0_20px_45px_-34px_rgba(15,23,42,0.35)]"
            style={{ backgroundColor: 'var(--dm-surface-2)', borderColor: 'var(--dm-border)' }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                {renderAvatar()}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold leading-tight text-slate-900">{brand}</p>
                  <p className="mt-1 text-xs leading-snug text-slate-500">{subtitle}</p>
                </div>
              </div>

              {onToggleCollapse ? (
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition hover:text-[var(--umss-brand)]"
                  style={{ backgroundColor: 'var(--dm-card)', borderColor: 'var(--dm-border)', color: 'var(--dm-text-secondary)' }}
                  aria-label={t('common.collapseSidebar')}
                  title={t('common.collapseSidebar')}
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <div
              className="mt-4 rounded-2xl border px-4 py-3 shadow-sm"
              style={{ backgroundColor: 'var(--dm-card)', borderColor: 'var(--dm-border)' }}
            >
              <p className="truncate text-sm font-semibold" style={{ color: 'var(--dm-text-primary)' }}>{profileName}</p>
              <p className="mt-1 text-xs" style={{ color: 'var(--dm-text-muted)' }}>{profileRole}</p>
              {profileBadge ? (
                <span className="mt-3 inline-flex rounded-full bg-[var(--umss-lavender)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--umss-brand)]">
                  {profileBadge}
                </span>
              ) : null}
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
                  : 'hover:text-slate-900'
              )}
              style={!item.active ? { color: 'var(--dm-text-secondary)' } : undefined}
              aria-label={item.label}
              title={collapsed ? item.label : undefined}
            >
              <span className={cn('flex items-center', collapsed ? 'justify-center' : 'gap-3')}>
                <span
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-xl'
                  )}
                  style={{
                    backgroundColor: item.active ? 'var(--dm-card)' : 'var(--dm-surface-2)',
                    color: item.active ? 'var(--umss-brand)' : 'var(--dm-text-secondary)'
                  }}
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

      {footer ? (
        <div className={cn(mobileDrawer ? 'w-full pt-6' : 'mt-auto w-full', collapsed && 'max-w-[56px]')}>
          {footer}
        </div>
      ) : null}
    </div>
  );
}
