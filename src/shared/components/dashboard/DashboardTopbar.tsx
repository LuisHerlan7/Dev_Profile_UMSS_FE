import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Search, X } from 'lucide-react';

export type SearchResultItem = {
  id: string;
  label: string;
  sublabel?: string;
  section: string;
  sectionLabel: string;
  elementId?: string; // ID del elemento DOM al que hacer scroll
};

type DashboardTopbarProps = {
  searchPlaceholder?: string;
  actions?: ReactNode;
  profileName: string;
  profileRole: string;
  profileImageUrl?: string | null;
  searchIndex?: SearchResultItem[];
  onNavigate?: (section: string, elementId?: string) => void;
  onLogout?: () => void;
};

export function DashboardTopbar({
  searchPlaceholder = 'Buscar...',
  actions,
  profileName,
  profileRole,
  profileImageUrl,
  searchIndex = [],
  onNavigate,
  onLogout,
}: DashboardTopbarProps) {
  const [imgError, setImgError] = useState(false);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { setImgError(false); }, [profileImageUrl]);

  // Handle outside clicks for search and profile menu
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const q = query.trim().toLowerCase();
  const results = q.length < 1
    ? []
    : searchIndex.filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          (item.sublabel?.toLowerCase().includes(q) ?? false) ||
          item.sectionLabel.toLowerCase().includes(q)
      ).slice(0, 8);

  const handleSelect = (item: SearchResultItem) => {
    setQuery('');
    setOpen(false);
    if (onNavigate) onNavigate(item.section, item.elementId);
  };

  const grouped = results.reduce<Record<string, SearchResultItem[]>>((acc, item) => {
    if (!acc[item.sectionLabel]) acc[item.sectionLabel] = [];
    acc[item.sectionLabel].push(item);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
      {/* Global search with dropdown (Local Feature) */}
      <div ref={containerRef} className="relative block w-full max-w-xl">
        <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={searchPlaceholder}
          className="h-11 w-full rounded-2xl border border-[var(--umss-border)] bg-[var(--umss-surface)] pr-10 pl-11 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[rgba(80,72,229,0.3)] focus:ring-2 focus:ring-[rgba(80,72,229,0.15)]"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setOpen(false); }}
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {open && results.length > 0 && (
          <div className="absolute top-[calc(100%+12px)] left-0 z-[65] w-full overflow-hidden rounded-[24px] border border-[var(--umss-border)] bg-white/95 shadow-[0_32px_80px_-20px_rgba(15,23,42,0.3)] backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
            {Object.entries(grouped).map(([sectionLabel, items]) => (
              <div key={sectionLabel}>
                <div className="px-4 pt-3 pb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--umss-brand)]">
                    {sectionLabel}
                  </span>
                </div>
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-[var(--umss-surface)]"
                  >
                    <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{item.label}</p>
                      {item.sublabel && (
                        <p className="truncate text-xs text-slate-500">{item.sublabel}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ))}
            <div className="border-t border-[var(--umss-border)] px-4 py-2">
              <p className="text-xs text-slate-400">
                {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <div className="flex items-center gap-2">{actions}</div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="flex items-center gap-3 rounded-2xl border border-[var(--umss-border)] bg-white px-3 py-2 shadow-sm transition hover:border-[rgba(80,72,229,0.25)]"
          >
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-900">{profileName}</p>
              <p className="text-xs text-slate-500">{profileRole}</p>
            </div>
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--umss-brand)] to-[var(--umss-accent)] text-sm font-semibold text-white shadow-sm">
              {profileImageUrl && !imgError ? (
                <img
                  src={profileImageUrl}
                  alt={profileName}
                  className="h-full w-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : null}
              <span className={profileImageUrl && !imgError ? 'sr-only' : ''}>
                {profileName
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((name) => name[0])
                  .join('')
                  .toUpperCase()}
              </span>
            </div>
          </button>

          {menuOpen && (
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
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
