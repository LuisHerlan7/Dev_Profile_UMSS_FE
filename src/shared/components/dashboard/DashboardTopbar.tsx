import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Search } from 'lucide-react';

type DashboardTopbarProps = {
  searchPlaceholder?: string;
  actions?: ReactNode;
  profileName: string;
  profileRole: string;
  onLogout?: () => void;
};

export function DashboardTopbar({
  searchPlaceholder = 'Buscar...',
  actions,
  profileName,
  profileRole,
  onLogout,
}: DashboardTopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!menuRef.current || menuRef.current.contains(event.target as Node)) {
        return;
      }
      setMenuOpen(false);
    }

    if (menuOpen) {
      window.addEventListener('click', handleClick);
    }

    return () => window.removeEventListener('click', handleClick);
  }, [menuOpen]);

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

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="flex items-center gap-3 rounded-2xl border border-[var(--umss-border)] bg-white px-3 py-2 shadow-sm transition hover:border-[rgba(80,72,229,0.25)]"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-900">{profileName}</p>
              <p className="text-xs text-slate-500">{profileRole}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--umss-brand)] to-[var(--umss-accent)] text-sm font-semibold text-white">
              {profileName
                .split(' ')
                .slice(0, 2)
                .map((name) => name[0])
                .join('')}
            </div>
          </button>

          {menuOpen ? (
            <div
              role="menu"
              className="absolute right-0 z-50 mt-2 w-48 rounded-2xl border border-[var(--umss-border)] bg-white p-2 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.45)]"
            >
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onLogout?.();
                }}
                className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-[var(--umss-surface)] hover:text-slate-900"
                role="menuitem"
              >
                Cerrar sesión
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
