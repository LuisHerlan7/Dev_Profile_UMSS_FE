import type { ReactNode } from 'react';
import { Search } from 'lucide-react';

type DashboardTopbarProps = {
  searchPlaceholder?: string;
  actions?: ReactNode;
  profileName: string;
  profileRole: string;
  profileImageUrl?: string | null;
};

export function DashboardTopbar({
  searchPlaceholder = 'Buscar...',
  actions,
  profileName,
  profileRole,
  profileImageUrl,
}: DashboardTopbarProps) {
  return (
    <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
      <label className="relative block w-full max-w-xl">
        <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder={searchPlaceholder}
          className="h-11 w-full rounded-2xl border border-[var(--umss-border)] bg-[var(--umss-surface)] pr-4 pl-11 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[rgba(80,72,229,0.3)] focus:ring-2 focus:ring-[rgba(80,72,229,0.15)]"
        />
      </label>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <div className="flex items-center gap-2">{actions}</div>

        <div className="flex items-center gap-3 rounded-2xl border border-[var(--umss-border)] bg-white px-3 py-2 shadow-sm">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-900">{profileName}</p>
            <p className="text-xs text-slate-500">{profileRole}</p>
          </div>
          <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--umss-brand)] to-[var(--umss-accent)] text-sm font-semibold text-white shadow-sm">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt={profileName}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : null}
            <span className={profileImageUrl ? 'sr-only' : ''}>
              {profileName
                .split(' ')
                .slice(0, 2)
                .map((name) => name[0])
                .join('')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
